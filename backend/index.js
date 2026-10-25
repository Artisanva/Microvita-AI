require('dotenv').config();
const express = require('express');
const cors = require('cors'); // <- ini punya kamu, jangan dihapus
const paypal = require('@paypal/checkout-server-sdk');

const app = express();
app.use(cors()); // <- ini juga punya kamu, jangan dihapus
app.use(express.json({ limit: '10mb' }));

function getPaypalClient() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const environment = new paypal.core.SandboxEnvironment(clientId, clientSecret);
  return new paypal.core.PayPalHttpClient(environment);
}
const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// BARU TARUH SINI
app.post('/api/paypal/create-order', async (req, res) => {
  try {
    const client = getPaypalClient();
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
    const order = await client.execute(request);
    res.json({ id: order.result.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server jalan di port ${PORT}`);
});