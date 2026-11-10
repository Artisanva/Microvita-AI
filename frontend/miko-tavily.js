/* ============================================================
   miko-tavily.js  -  "Tanya Miko" (kolom tanya di halaman Scan Makanan)

   Bisa jawab:
     - satu makanan            : "burger bergizi ga"
     - pertanyaan terbuka      : "makanan apa aja yang sehat", "carikan rekomendasi buat aku"
     - di luar topik makanan   : Miko menolak dengan ramah
   Setelah jawaban keluar, Miko ikut menjelaskan (kotak "Kata Miko").
   Kotak itu dibuat oleh Miko.jelaskan() di miko-panduan.js.
   ============================================================ */

// Di laptop (file:// atau localhost) -> backend lokal port 3000. Sudah deploy -> pakai API_BASE (Vercel).
const MIKO_API =
  (location.protocol === 'file:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')
    ? 'http://localhost:3000'
    : (typeof API_BASE !== 'undefined' ? API_BASE : '');

// Contoh pertanyaan (tombol kecil di bawah kolom). Ganti sesuka hati.
const MIKO_SARAN = [
  'Makanan apa aja yang sehat?',
  'Carikan rekomendasi sarapan rendah kalori',
  'Burger bergizi ga?',
  'Camilan sehat buat aku apa ya?'
];

function mikoEsc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/* data diri buat personalisasi ("buat aku"). Cuma tujuan, usia, berat, tinggi. Nama dan email TIDAK dikirim. */
function mikoProfil() {
  try {
    const u = (typeof APP !== 'undefined' && APP.user) ? APP.user : null;
    if (!u) return null;
    return { tujuan: u.goal, usia: u.age, berat: u.weight, tinggi: u.height };
  } catch (e) { return null; }
}

/* tombol contoh pertanyaan + placeholder baru, dipasang sekali */
function mikoPasangSaran() {
  const input = document.getElementById('tavily-input');
  const hasil = document.getElementById('tavily-jawaban');
  if (!input || !hasil || document.getElementById('miko-saran')) return;
  input.placeholder = 'Tanya Miko, misal: makanan apa yang sehat?';
  const wadah = document.createElement('div');
  wadah.id = 'miko-saran';
  wadah.style.cssText = 'display:flex;gap:6px;overflow-x:auto;margin-top:10px;scrollbar-width:none';
  MIKO_SARAN.forEach(function (t) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = t;
    b.style.cssText = 'flex-shrink:0;white-space:nowrap;cursor:pointer;font-size:12px;font-weight:600;padding:6px 12px;' +
      'border-radius:99px;background:var(--cream-surface);border:1px solid var(--cream-border);color:var(--brown-text)';
    b.addEventListener('click', function () { input.value = t; tanyaTavily(); });
    wadah.appendChild(b);
  });
  hasil.parentNode.insertBefore(wadah, hasil);
}

/* ekspresi Miko menurut skor 0-10: sehat = senang, sedang = mikir, kurang sehat = sedih */
function mikoEkspresiSkor(skor) {
  const n = parseFloat(String(skor == null ? '' : skor).replace(',', '.'));
  if (isNaN(n)) return 'idle';
  return n >= 7 ? 'happy' : n >= 4 ? 'think' : 'sad';
}

/* kotak "Kata Miko" (kalau miko-panduan.js belum dimuat, tampil teks biasa) */
function mikoBicara(slot, teks, state) {
  if (!slot || !teks) return;
  if (window.Miko && typeof window.Miko.jelaskan === 'function') { window.Miko.jelaskan(slot, teks, { state: state }); }
  else { slot.innerHTML = '<p style="font-size:13px;margin:0 0 12px">🐱 ' + mikoEsc(teks) + '</p>'; }
}

const MIKO_KARTU = 'background:#fff;border:1px solid var(--cream-border);border-radius:24px;padding:20px;';

function mikoKartuMakanan(d, q) {
  const skor = d.score ? '<span style="font-size:12px;font-weight:800;padding:5px 10px;border-radius:99px;background:var(--cream-surface);border:1px solid var(--cream-border)">Skor sehat ' + mikoEsc(d.score) + '/10</span>' : '';
  const kotak = function (nilai, label) {
    return '<div><b>' + mikoEsc(nilai) + '</b><br><small>' + label + '</small></div>';
  };
  return '<div style="' + MIKO_KARTU + '">' +
    '<div style="display:flex;align-items:center;gap:12px;">' +
      '<span style="font-size:32px;">' + mikoEsc(d.emoji || '🍽️') + '</span>' +
      '<div style="flex:1;min-width:0"><b style="font-size:18px;">' + mikoEsc(d.food || q) + '</b><br><small>Estimasi gizi</small></div>' + skor +
    '</div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:15px 0;">' +
      kotak((d.kcal || '-') + ' kcal', 'Kalori') + kotak(d.protein || '-', 'Protein') +
      kotak(d.carbs || '-', 'Karbo') + kotak(d.fat || '-', 'Lemak') +
    '</div>' +
    (d.why ? '<p><b>Kenapa:</b> ' + mikoEsc(d.why) + '</p>' : '') +
    (d.tips ? '<p><b>Tips:</b> ' + mikoEsc(d.tips) + '</p>' : '') +
    '<p style="font-size:11px;color:var(--brown-muted);margin-top:8px">Angka hanya estimasi AI, bukan pengganti saran ahli gizi.</p>' +
  '</div>';
}

function mikoKartuUmum(d) {
  const item = (d.daftar || []).map(function (x) {
    return '<li style="display:flex;gap:10px;align-items:flex-start;padding:8px 0;border-top:1px solid var(--cream-border)">' +
      '<span style="font-size:24px;line-height:1.2">' + mikoEsc(x.emoji || '🍽️') + '</span>' +
      '<span><b>' + mikoEsc(x.nama) + '</b>' + (x.alasan ? '<br><small style="color:var(--brown-muted)">' + mikoEsc(x.alasan) + '</small>' : '') + '</span></li>';
  }).join('');
  const tips = (d.tips || []).map(function (t) { return '<li style="margin-left:18px;list-style:disc">' + mikoEsc(t) + '</li>'; }).join('');
  const sumber = (d.sumber || []).filter(function (s) { return /^https?:\/\//.test(s.url || ''); }).map(function (s) {
    return '<li style="margin-left:18px;list-style:disc"><a href="' + mikoEsc(s.url) + '" target="_blank" rel="noopener noreferrer" style="text-decoration:underline">' + mikoEsc(s.judul || s.url) + '</a></li>';
  }).join('');
  return '<div style="' + MIKO_KARTU + '">' +
    '<b style="font-size:18px;">' + mikoEsc(d.judul || 'Rekomendasi Miko') + '</b>' +
    (d.ringkasan ? '<p style="margin:6px 0 10px">' + mikoEsc(d.ringkasan) + '</p>' : '') +
    (item ? '<ul style="list-style:none;padding:0;margin:0 0 10px">' + item + '</ul>' : '') +
    (tips ? '<p><b>Tips:</b></p><ul style="font-size:14px;margin:4px 0 8px">' + tips + '</ul>' : '') +
    (sumber ? '<p style="font-size:12px;margin-top:10px"><b>Sumber:</b></p><ul style="font-size:12px;margin:4px 0">' + sumber + '</ul>' : '') +
    '<p style="font-size:11px;color:var(--brown-muted);margin-top:8px">Saran umum dari AI, bukan pengganti ahli gizi atau dokter.</p>' +
  '</div>';
}

function mikoKartuError(pesan) {
  return '<div style="' + MIKO_KARTU + 'color:#C0392B;margin-top:0">⚠️ ' + pesan + '</div>';
}

/* tampilkan jawaban dari backend (mode: makanan | umum | luar | error) */
function mikoTampilkan(box, d, q) {
  const mode = d.mode || 'makanan'; // backend lama belum kirim "mode": anggap satu makanan
  let kartu = '', state = 'idle';
  let kata = d.penjelasan;

  if (mode === 'umum') {
    kartu = mikoKartuUmum(d); state = 'happy';
  } else if (mode === 'luar') {
    kartu = ''; state = 'think';
  } else if (mode === 'error') {
    kartu = mikoKartuError('Jawaban belum bisa diambil. Coba lagi sebentar lagi.'); state = 'sad';
  } else {
    kartu = mikoKartuMakanan(d, q); state = mikoEkspresiSkor(d.score);
    if (!kata) kata = 'Perkiraan ' + (d.food || q) + ': sekitar ' + (d.kcal || '-') + ' kkal, protein ' + (d.protein || '-') + ', lemak ' + (d.fat || '-') + ', karbo ' + (d.carbs || '-') + '.';
  }

  box.innerHTML = '<div id="miko-say-tanya"></div>' + kartu;
  mikoBicara(document.getElementById('miko-say-tanya'), kata, state);
}

let mikoTanyaNo = 0; // biar jawaban lama gak menimpa jawaban yang lebih baru

async function tanyaTavily() {
  const q = (document.getElementById('tavily-input')?.value || '').trim();
  const box = document.getElementById('tavily-jawaban');
  if (!q || !box) return;

  const no = ++mikoTanyaNo;
  box.classList.remove('hidden');
  box.innerHTML = '<div style="padding:14px 4px;color:var(--brown-muted)">⏳ Miko lagi mikir "' + mikoEsc(q) + '"...</div>';

  try {
    const res = await fetch(MIKO_API + '/api/tavily', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: q, profil: mikoProfil() })
    });
    if (!res.ok) throw new Error('Server balas HTTP ' + res.status);
    const d = await res.json();
    if (no !== mikoTanyaNo) return;
    mikoTampilkan(box, d, q);
  } catch (e) {
    if (no !== mikoTanyaNo) return;
    console.error('Miko error:', e);
    box.innerHTML = '<div id="miko-say-tanya"></div>' +
      mikoKartuError('Gagal konek ke backend. Cek terminal backend nyala gak.<br><small>' + mikoEsc(e.message) + '</small>');
    mikoBicara(document.getElementById('miko-say-tanya'),
      'Aduh, aku gak bisa nyambung ke server. Coba cek dulu backend-nya nyala atau enggak ya.', 'sad');
  }
}

mikoPasangSaran();