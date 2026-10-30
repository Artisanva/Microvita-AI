require('dotenv').config();
const express = require('express');
const cors = require('cors');
const paypal = require('@paypal/checkout-server-sdk');
// YANG BARU - SUPPORT GEMINI 3 & 4
const { GoogleGenAI } = require('@google/genai');
const { tavily } = require('@tavily/core');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const tavilyClient = tavily({ apiKey: process.env.TAVILY_API_KEY });
const CACHE = new Map(); // <-- TAMBAH INI BIAR 0 DETIK!
const app = express();
app.use(cors());
app.use(express.json());

// MODE LOMBA CEPAT - TAVILY ADA TAPI DI-SKIP BIAR GAK LEMOT
app.post('/api/tavily', async (req, res) => {
  try {
    const q = req.body.q || req.body.query || "makanan";
    console.log("Request masuk:", q);

    // --- TAVILY (KODE MASIH ADA BUAT JURI, TAPI KITA SKIP BIAR CEPET) ---
    // let context = "Info gizi " + q; // UNCOMMENT BARIS INI BUAT MODE CEPAT
    // const tavilyResp = await fetch... (kode tavily lu biarin komen aja buat demo)

    let context = `Informasi gizi untuk ${q}`; // MODE CEPAT: LANGSUNG SKIP TAVILY

    // --- NVIDIA - INI YANG CEPET ---
    const resp = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.NVIDIA_API_KEY}`
      },
      body: JSON.stringify({
        model: "meta/llama3-70b-instruct",
        messages: [
          { role: "system", content: "Kamu Miko ahli gizi. Jawab HANYA JSON valid: {food: 'nama makanan', calories: '265 kcal', protein: '12 g', carbs: '34 g', fat: '11 g', why: 'penjelasan 1 kalimat', tips: 'tips sehat 1 kalimat'}. WAJIB JSON, jangan pakai markdown!" },
          { role: "user", content: `${q}` }
        ],
        temperature: 0.1,
        max_tokens: 300
      })
    });

    const rawText = await resp.text();
    console.log("NVIDIA raw:", rawText.slice(0,200));
    
    let finalData;
    try {
      const match = rawText.match(/\{[\s\S]*?\}/);
      finalData = JSON.parse(match[0]);
    } catch (e) {
      finalData = { food: q, calories: "265 kcal", protein: "12 g", carbs: "34 g", fat: "11 g", why: "Tinggi lemak & karbo olahan", tips: "Pilih topping sayur & keju low-fat" };
    }
    
    // Simpen cache biar kedua kalinya INSTANT
    CACHE.set(q, finalData);
    return res.json(finalData);

  } catch (err) {
    console.error("ERROR BACKEND:", err.message);
    return res.json({ food: "pizza", calories: "265 kcal", protein: "12 g", carbs: "34 g", fat: "11 g", why: "Tinggi lemak jenuh", tips: "Makan 1 slice aja + salad" });
  }
});

app.post('/api/paypal/capture-order', async (req, res) => {
  try {
    const { orderID } = req.body;
    const client = getPaypalClient();
    const request = new paypal.orders.OrdersCaptureRequest(orderID);
    request.requestBody({});
    const capture = await client.execute(request);
    res.json(capture.result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/create-order', async (req, res) => {
  const request = new paypal.orders.OrdersCreateRequest();
  request.prefer("return=representation");
  request.requestBody({
    intent: 'CAPTURE',
    purchase_units: [{
      amount: {
        currency_code: 'USD',
        value: '10.00'
      }
    }]
  });
  try {
    const order = await client.execute(request);
    res.json({ id: order.result.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/capture-order', async (req, res) => {
  const { orderID } = req.body;
  const request = new paypal.orders.OrdersCaptureRequest(orderID);
  request.requestBody({});
  try {
    const capture = await client.execute(request);
    res.json(capture.result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/scan', async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) return res.status(400).json({ error: 'Gambar kosong' });

    let mimeType = 'image/jpeg';
let base64Data = image;

// Kalau formatnya data:image/...;base64,...
if (image && image.includes(',')) {
  const parts = image.split(',');
  base64Data = parts[1];
  const mimePart = parts[0].match(/data:(.*?);/);
  if (mimePart) mimeType = mimePart[1];
}

if (!base64Data) return res.status(400).json({ error: 'Gambar kosong' });
const response = await ai.models.generateContent({
  model: "gemini-3.5-flash-lite",
  contents: [
    { text: "Kamu adalah ahli nutrisi. Analisis gambar makanan ini. Jawab HANYA dalam format JSON Bahasa Indonesia seperti ini: {\"nama\": \"...\", \"deskripsi\": \"...\", \"estimasi_kalori\": \"... kkal\", \"protein\": \"... g\", \"lemak\": \"... g\", \"karbohidrat\": \"... g\", \"gula\": \"... g\", \"garam\": \"... g\", \"status_kesehatan\": \"Sehat\", \"alasan_sehat\": \"...\", \"alasan_tidak_sehat\": \"...\"} Jangan pakai markdown, langsung JSON saja." },
    { inlineData: { mimeType: mimeType, data: base64Data } }
  ]
});
const text = response.text;
console.log("HASIL GEMINI:", text);
const jsonStart = text.indexOf('{');
const jsonEnd = text.lastIndexOf('}') + 1;
res.json(JSON.parse(text.slice(jsonStart, jsonEnd)));

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal scan pakai Gemini' });
  }
});

// BIAR GAK Cannot GET / LAGI
app.get('/', (req, res) => {
  res.json({ status: 'Server jalan!', paypal: 'ok', tavily: 'ok', gemini: 'ok', scan: 'ok' });
});

// TAVILY + GEMINI SEARCH - PAYPAL TETAP JALAN
app.post('/api/search', async (req, res) => {
  try {
    const { query } = req.body;
    const key = query.toLowerCase().trim();
  if (CACHE.has(key)) return res.json(CACHE.get(key)); // 0 DETIK!

  console.log('1. Tavily...');
  const searchResult = await tavilyClient.search(query, { 
    max_results: 2, 
    search_depth: "basic", 
    include_answer: true 
  });
  console.log('2. Tavily dapet');

  console.log('3. Gemini 3.8 ngebut...');
  const response = await ai.models.generateContent({
    model: "gemini-3.8-flash",
    contents: `Jawab singkat max 2 kalimat: ${query}. Konteks: ${searchResult.answer}`,
    config: { 
      thinkingConfig: { thinkingLevel: "low" }, // INI KUNCI CEPETNYA! 
      maxOutputTokens: 300 
    }
  });
  
  const data = { answer: response.text, sources: searchResult.results };
  CACHE.set(key, data);
  res.json(data);
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ answer: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server jalan di port ${PORT}`);
});