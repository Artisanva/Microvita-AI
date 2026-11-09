# Artisanva — AI Agent Projects 🚀

Satu repo untuk semua project hackathon. Semua masih ada, gak ada yang dibuang.

---

## 1. MICROVITA — Smart Food Scanner with Miko 🍱
**Buat lomba Agent-Native Hackathon by Builder.io — Submit besok 10 Nov 2026**

Foto makananmu, Miko (agen AI) akan analisis & jelasin pake Gemini.
Bukan chatbot biasa, Miko: Lihat Foto -> Mikir -> Pakai Tools Gemini -> Jelasin -> Kasih Saran Pengganti.

- Live Demo: https://microvita-ai.vercel.app
- Fitur: Scan Makanan, Miko AI Agent, Saran Pengganti, Riwayat & Kalender Makan
- Tech: HTML, CSS, JavaScript, Node.js + Express, Google Gemini API
- Demo Video: [ISI LINK CLIPS KAMU DI SINI]

---

## 2. Sample 01 — Meeting Action Assistant 🤖

Bob sends notes to Langflow, which summarizes them, creates a Google Doc, optionally emails participants, and creates an event only when date and time are explicit.

**Requirements:** IBM Bob, Langflow, Composio, Google Docs, Gmail, Google Calendar

**Files:**
- `langflow/`: Template and Complete flow exports plus import notes.
- `prompts/meeting-action-assistant-component.md`: system prompt for the agent component inside Langflow.
- `bob/`: Bob delegation instructions and MCP example.
- `sample-inputs/meeting-notes-example.md`: safe test input
- `expected-outputs/meeting-summary-example.md`: representative output

**Setup:**
1. Start the shared Langflow infrastructure.
2. Import `langflow/Meeting Action Assistant - Template.json` or `Complete.json`
3. Configure Composio credentials.
4. Expose the flow through Langflow MCP.
5. Configure Bob with `bob/agent-instructions.md` and `bob/mcp-config.example.json`
6. Test with `sample-inputs/meeting-notes-example.md`
7. Compare with `expected-outputs/meeting-summary-example.md`

See setup guide in `../../docs/setup.md`. Never commit Google or Composio credentials.

**Instruction layers:**
- `prompts/meeting-action-assistant-component.md` = prompt di dalam Langflow, yang ngerjain analisis + Docs + Gmail + Calendar.
- `bob/agent-instructions.md` = konfigurasi Bob di luar, yang nyuruh Bob kapan manggil Langflow.
- Bob delegates, Langflow performs.

`sample-inputs/meeting-notes-local.md` sengaja di-ignore karena berisi alamat akun lokal.

---

## 3. AI Payment Assistant with PayPal 💳

Project lomba PayPal sebelumnya. AI assistant untuk pembayaran yang terintegrasi PayPal API, jelasin transaksi pake bahasa natural.
Status: Complete. History-nya masih tersimpan di commit sebelumnya.

---

## 4. Nebius Builders Hackathon ☁️

Project lomba Nebius Builders. Bangun AI agent / aplikasi di atas infrastruktur Nebius.
Status: Complete. Sekarang sudah tercantum di README biar gak hilang lagi.

---

## Security
Jangan pernah commit `.env`, API Key, Google / Composio credentials.
