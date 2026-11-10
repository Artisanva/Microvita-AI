/* ============================================================
   miko-panduan.js
   Miko = pemandu MicroVita. File ini ngurus:
     1. Tur pengenalan (muncul sekali di awal, bisa diulang)
     2. Tombol bulat Miko di header Home (sebelah poin) + tombol melayang di halaman fitur
     3. Panel "Tanya Miko" (pilih topik atau ketik pertanyaan)
     4. Tips singkat yang muncul sekali di tiap halaman fitur
     5. Ekspresi Miko ikut kejadian (mikir saat Cari/Scan, senang saat hasil keluar, sedih saat error)
     6. Miko menjelaskan hasil: Miko.jelaskan() dipakai Tanya Miko, dan otomatis dipasang ke hasil scan foto makanan

   SEMUA TEKS MIKO ada di bagian NASKAH di bawah. Mau ganti kalimat? Edit di situ aja.
   Wajib dimuat SETELAH miko-karakter.js (dan setelah miko-tavily.js).
   ============================================================ */
(function () {
  'use strict';

  var K = window.MikoKarakter;
  if (!K) { console.warn('[Miko] miko-karakter.js harus dimuat sebelum miko-panduan.js'); return; }

  /* ---------- penyimpanan kecil di browser (aman kalau diblokir) ---------- */
  var PFX = 'mv3_miko_';
  function get(k, d) { try { var v = localStorage.getItem(PFX + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } }
  function put(k, v) { try { localStorage.setItem(PFX + k, JSON.stringify(v)); } catch (e) {} }
  function hapus(k) { try { localStorage.removeItem(PFX + k); } catch (e) {} }

  /* ============================================================
     NASKAH  (semua kalimat Miko ada di sini)
     ============================================================ */

  /* Topik = satu fitur. ringkas = versi singkat buat tur. teks = versi lengkap buat panel.
     tip = kalimat pendek yang muncul sekali di halaman fiturnya. kata = kata kunci buat pertanyaan bebas. */
  var TOPIK = [
    {
      id: 'tentang', ikon: '🍽️', label: 'Apa itu MicroVita?',
      kata: ['microvita', 'aplikasi', 'apa itu', 'fitur', 'bisa apa', 'gunanya'],
      teks: 'MicroVita itu aplikasi AI buat cek nutrisi dan keamanan makanan.\nKamu tinggal foto atau ketik makanannya, AI menganalisis, lalu hasilnya muncul dalam hitungan detik.\n\nFiturnya: Scan Makanan, Tanya Miko, Cek Expired, Scan Label/Nota, Rekomendasi Gizi, Marketplace, dan Riwayat & Poin.'
    },
    {
      id: 'makanan', screen: 'screen-scan-makanan', ikon: '📷', label: 'Scan Makanan',
      kata: ['scan makanan', 'foto makanan', 'makanan', 'kalori', 'scan', 'kamera', 'upload'],
      tip: 'Ada dua cara: foto makananmu lalu tekan Scan Makanan, atau ketik namanya di kolom Tanya Miko di atas.',
      ringkas: 'Input: foto makananmu, bisa upload dari galeri atau ambil langsung pakai kamera.\nOutput: estimasi kalori, protein, lemak, dan karbo, plus status aman atau waspada beserta alasannya.',
      teks: 'Scan Makanan 📷\n📥 Input: foto makananmu. Bisa upload dari galeri (tab Upload Foto) atau ambil langsung (tab Kamera).\n⚙️ Proses: AI mengenali makanannya lalu menghitung kandungan gizinya.\n📤 Output: estimasi kalori, protein, lemak, karbo, gula, dan garam, plus status kesehatan beserta alasannya.\n\nTekan ⚡ Scan Makanan setelah fotonya terpilih. Hasilnya estimasi AI ya, bukan pengganti saran ahli gizi.'
    },
    {
      id: 'tanya', ikon: '🔎', label: 'Tanya Miko',
      kata: ['tanya miko', 'tavily', 'google', 'cari', 'ketik', 'suara', 'mic', 'gizinya berapa', 'pencarian'],
      ringkas: 'Ada di bagian atas halaman Scan Makanan, kayak mesin pencari khusus makanan.\nInput: ketik atau ucapkan lewat 🎤, misalnya "ayam geprek gizinya berapa?".\nOutput: emoji makanan, kalori, protein, lemak, karbo, alasan kenapa kurang sehat, dan tips makan lebih sehat.',
      teks: 'Tanya Miko 🔎 (di bagian atas halaman Scan Makanan)\n📥 Input: ketik nama makanan atau pertanyaanmu, atau ucapkan lewat tombol 🎤. Contoh: "ayam geprek gizinya berapa?".\n⚙️ Proses: pertanyaanmu dikirim ke AI di server, kayak mesin pencari khusus makanan.\n📤 Output: emoji makanan, kalori, protein, lemak, karbo, alasan kenapa kurang sehat, dan tips makan lebih sehat.\n\nTekan Cari setelah mengetik. Hasilnya estimasi AI.'
    },
    {
      id: 'expired', screen: 'screen-scan-expired', ikon: '⏳', label: 'Cek Expired',
      kata: ['expired', 'kedaluwarsa', 'kadaluarsa', 'kadaluwarsa', 'tanggal', 'masa berlaku', 'basi', 'kemasan'],
      tip: 'Foto bagian kemasan yang ada tanggal expired-nya, pilih kondisi kemasan, lalu tekan Cek Expired.',
      ringkas: 'Input: foto tanggal kedaluwarsa di kemasan, lalu pilih kondisi kemasan: Baik, Penyok, atau Rusak.\nOutput: tanggal expired, sisa hari, dan status aman atau waspada.',
      teks: 'Cek Expired ⏳\n📥 Input: foto bagian kemasan yang ada tanggal kedaluwarsanya, lalu pilih kondisi kemasan: Baik, Penyok, atau Rusak.\n⚙️ Proses: AI membaca tanggalnya (OCR) dan menghitung sisa harinya.\n📤 Output: tanggal expired, sisa hari, dan status aman atau waspada.\n\nBiar kebaca, pastikan tulisan tanggalnya jelas, gak buram, dan gak silau. Lalu tekan ⚡ Cek Expired.'
    },
    {
      id: 'nota', screen: 'screen-scan-nota', ikon: '🏷️', label: 'Scan Label / Nota',
      kata: ['label', 'nota', 'struk', 'komposisi', 'scan label', 'belanja', 'info nilai gizi'],
      tip: 'Pilih mode dulu di atas: Label Nutrisi buat baca komposisi, Struk Belanja buat baca total belanja.',
      ringkas: 'Ada dua mode.\nLabel Nutrisi: foto tabel gizi atau komposisi di kemasan.\nStruk Belanja: foto struk, hasilnya nama toko dan total belanja.',
      teks: 'Scan Label / Nota 🏷️\nAda dua mode di bagian atas:\n🏷️ Label Nutrisi: foto tabel gizi atau komposisi di kemasan, hasilnya isi komposisi dan info gizinya.\n🧾 Struk Belanja: foto struk, hasilnya nama toko dan total belanja.\n\nPilih mode dulu, lalu upload atau ambil foto, lalu tekan ⚡ Scan Sekarang.'
    },
    {
      id: 'gizi', screen: 'screen-rekomendasi', ikon: '🥗', label: 'Rekomendasi Gizi',
      kata: ['rekomendasi', 'gizi harian', 'kebutuhan', 'bmr', 'diet', 'bulk', 'menu', 'tinggi badan', 'berat badan', 'maintain'],
      tip: 'Geser usia, berat, dan tinggi, lalu pilih tujuanmu. Kebutuhan hariannya langsung dihitung.',
      ringkas: 'Input: usia, berat, tinggi, jenis kelamin, tingkat aktivitas, dan tujuan (Diet, Maintain, atau Bulk).\nOutput: kebutuhan kalori dan nutrisi harianmu, plus saran menu dari AI.',
      teks: 'Rekomendasi Gizi 🥗\n📥 Input: geser usia, berat, dan tinggi, lalu pilih jenis kelamin, tingkat aktivitas, dan tujuan (Diet, Maintain, atau Bulk).\n⚙️ Proses: dihitung otomatis setiap kali kamu mengubah isiannya.\n📤 Output: kebutuhan kalori dan nutrisi harianmu.\n\nMau saran menu yang cocok? Tekan 🤖 Rekomendasi Menu AI.'
    },
    {
      id: 'market', screen: 'screen-marketplace', ikon: '🛒', label: 'Marketplace',
      kata: ['marketplace', 'beli', 'produk', 'suplemen', 'belanja produk'],
      tip: 'Cari produk lewat kolom pencarian, atau saring pakai tombol kategori di bawahnya.',
      ringkas: 'Tempat produk makanan sehat dan suplemen. Cari lewat kolom pencarian atau saring pakai kategori.',
      teks: 'Marketplace 🛒\nTempat produk makanan sehat dan suplemen.\n📥 Input: ketik kata kunci di kolom cari, atau pilih tombol kategori.\n📤 Output: daftar produk yang sesuai.'
    },
    {
      id: 'riwayat', screen: 'screen-riwayat', ikon: '📊', label: 'Riwayat & Poin',
      kata: ['riwayat', 'poin', 'point', 'level', 'badge', 'naik level', 'history', 'pts'],
      tip: 'Setiap scan tersimpan di sini dan memberi +50 poin. Kumpulkan poin buat naik level.',
      ringkas: 'Setiap scan tersimpan di sini dan memberi +50 poin. Poin menaikkan levelmu dari Nutrition Scout ke Health Expert.',
      teks: 'Riwayat & Poin 📊\nSetiap scan yang kamu lakukan tersimpan di sini dan memberi +50 poin.\nPoin menaikkan levelmu dari Nutrition Scout ke Health Expert, dan kamu juga bisa mengumpulkan badge.'
    },
    {
      id: 'miko', ikon: '😸', label: 'Siapa kamu, Miko?',
      kata: ['miko', 'siapa kamu', 'kamu siapa', 'kenalan', 'siapa'],
      teks: 'Aku Miko 😸 kucing dokter, pemandu MicroVita.\nTugasku menjelaskan semua fitur: apa yang perlu kamu isi, apa yang terjadi di balik layar, sampai cara membaca hasilnya. Bingung? Tanya aku aja kapan pun.'
    }
  ];

  /* Urutan tur pengenalan. { topik } = ambil judul dan teks ringkas dari TOPIK di atas. */
  var TOUR = [
    {
      state: 'wave', judul: 'Hai, selamat datang di MicroVita AI! 👋',
      teks: 'Aku Miko, kucing dokter yang bakal nemenin kamu di sini.\nTugasku menjelaskan semuanya: dari pertama kamu masuk, apa yang perlu kamu isi, sampai cara membaca hasilnya.'
    },
    {
      state: 'idle', judul: 'MicroVita itu apa?',
      teks: 'Aplikasi AI buat cek nutrisi dan keamanan makanan. Kamu cukup foto atau ketik makanannya, AI menganalisis, lalu hasilnya muncul dalam hitungan detik.\n\nIni fitur-fitur yang bisa kamu pakai 👇'
    },
    { topik: 'makanan' },
    { topik: 'tanya', state: 'think' },
    { topik: 'expired' },
    { topik: 'nota' },
    { topik: 'gizi' },
    {
      state: 'idle', judul: '🛒📊 Marketplace dan Riwayat',
      teks: 'Marketplace: produk makanan sehat dan suplemen.\nRiwayat & Poin: setiap scan tersimpan dan memberi +50 poin, supaya kamu naik level dari Nutrition Scout ke Health Expert.'
    },
    {
      state: 'happy', judul: 'Itu dia, yuk mulai! 🚀',
      teks: 'Nanti di halaman Home ada aku di pojok atas, tepat di samping poin kamu.\nKlik bulatan aku itu kalau ada keperluan, mau tanya, atau masih bingung cara pakai fitur-fitur MicroVita. Aku siap bantu kapan aja!'
    }
  ];

  var SAPA_PANEL = 'Hai, aku Miko 😸 pemandu MicroVita.\nAku bisa jelasin cara pakai tiap fitur, dari apa yang perlu kamu isi sampai cara membaca hasilnya. Pilih topik di bawah atau ketik pertanyaanmu ya.';
  var TIDAK_PAHAM = 'Hmm, aku belum nangkep maksudnya 😿\nCoba pilih salah satu topik di bawah, atau tanya yang lebih spesifik, misalnya "cara cek expired" atau "poin buat apa".';
  var TERIMA_KASIH = 'Sama-sama! 😸 Kalau ada yang bingung lagi, tanya aja ya.';
  var HALO = 'Halo! 😸 Mau tanya soal fitur apa? Pilih topik di bawah atau ketik pertanyaanmu.';

  /* ============================================================
     PERALATAN KECIL
     ============================================================ */
  var TOPIK_ID = {}, TOPIK_LAYAR = {};
  TOPIK.forEach(function (t) { TOPIK_ID[t.id] = t; if (t.screen) TOPIK_LAYAR[t.screen] = t; });
  var LAYAR_FITUR = ['screen-scan-makanan', 'screen-scan-expired', 'screen-scan-nota', 'screen-rekomendasi', 'screen-marketplace', 'screen-riwayat', 'screen-profile'];

  function $(id) { return document.getElementById(id); }
  function buat(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html) e.innerHTML = html; return e; }
  function kunci(on) { document.body.classList.toggle('mk-lock', on); }

  /* efek ngetik. Kembalian: { selesai() } buat loncat ke teks penuh */
  function ketik(el, teks, opsi) {
    opsi = opsi || {};
    var huruf = Array.from(teks), i = 0, mati = false, timer = null;
    var kurangGerak = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    function beres() { if (opsi.selesai) opsi.selesai(); }
    if (kurangGerak) { el.textContent = teks; beres(); return { selesai: function () {}, batal: function () {} }; }
    el.textContent = '';
    function langkah() {
      if (mati) return;
      i = Math.min(huruf.length, i + (huruf.length > 140 ? 2 : 1));
      el.textContent = huruf.slice(0, i).join('');
      if (opsi.tick) opsi.tick();
      if (i >= huruf.length) { beres(); return; }
      timer = setTimeout(langkah, 18);
    }
    langkah();
    return {
      selesai: function () { if (mati || i >= huruf.length) return; mati = true; clearTimeout(timer); el.textContent = teks; if (opsi.tick) opsi.tick(); beres(); },
      batal: function () { mati = true; clearTimeout(timer); }
    };
  }

  /* jebakan Tab biar fokus gak keluar dari jendela yang lagi kebuka */
  function jebakTab(wadah, e) {
    if (e.key !== 'Tab') return;
    var f = Array.prototype.filter.call(
      wadah.querySelectorAll('button,input,[tabindex]:not([tabindex="-1"])'),
      function (x) { return !x.disabled && x.offsetParent !== null; }
    );
    if (!f.length) return;
    var a = f[0], z = f[f.length - 1];
    if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
    else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
  }

  /* ---------- suara (opsional, bawaan browser, default mati) ---------- */
  var suaraOn = get('suara', false);
  var EMOJI = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{200D}]/gu;
  /* paksa = true: tetap bunyi walau suara lagi dimatikan (dipakai tombol "Dengarkan") */
  function ucapkan(teks, paksa, saatSelesai) {
    if ((!suaraOn && !paksa) || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(String(teks).replace(EMOJI, '').replace(/\s+/g, ' ').trim());
      u.lang = 'id-ID'; u.rate = 1.05; u.pitch = 1.15;
      if (saatSelesai) { u.onend = saatSelesai; u.onerror = saatSelesai; }
      window.speechSynthesis.speak(u);
    } catch (e) {}
  }
  function diam() { try { window.speechSynthesis.cancel(); } catch (e) {} }
  function segarkanSuara() {
    var list = document.querySelectorAll('.mk-voice');
    for (var i = 0; i < list.length; i++) {
      list[i].textContent = suaraOn ? '🔊' : '🔇';
      list[i].setAttribute('aria-pressed', suaraOn ? 'true' : 'false');
      list[i].setAttribute('aria-label', suaraOn ? 'Matikan suara Miko' : 'Nyalakan suara Miko');
      list[i].title = suaraOn ? 'Matikan suara Miko' : 'Nyalakan suara Miko';
    }
  }
  function toggleSuara() { suaraOn = !suaraOn; put('suara', suaraOn); if (!suaraOn) diam(); segarkanSuara(); }

  /* ============================================================
     CSS (disuntik sekali). Warna ngikut tema MicroVita (var(--brown-...) / var(--cream-...))
     ============================================================ */
  var CSS = [
    ':root{--mk-brown:var(--brown-dark,#3E1F0F);--mk-cream:var(--cream,#FFF8F0);--mk-surface:var(--cream-surface,#FFF0E0);--mk-border:var(--cream-border,#E8D4C0);--mk-text:var(--brown-text,#2D1206);--mk-muted:var(--brown-muted,#6B3F22)}',
    'body.mk-lock{overflow:hidden!important}',
    '.mk-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap}',

    /* tombol bulat Miko (header Home) + tombol melayang (halaman fitur) */
    '.mk-btn,.mk-fab{position:relative;flex-shrink:0;width:40px;height:40px;padding:2px;border-radius:50%;background:#fff;border:2px solid var(--mk-brown);cursor:pointer;box-shadow:0 2px 8px rgba(62,31,15,.15);display:flex;align-items:center;justify-content:center;transition:transform .15s}',
    '.mk-btn:active,.mk-fab:active{transform:scale(.94)}',
    '.mk-btn-in{display:block;width:100%;height:100%;border-radius:50%;overflow:hidden;background:var(--mk-surface)}',
    '.mk-btn:focus-visible,.mk-fab:focus-visible,.mk-b:focus-visible,.mk-chip:focus-visible,.mk-ic:focus-visible,.mk-link:focus-visible{outline:3px solid #A0683F;outline-offset:2px}',
    '.mk-fab{position:fixed;right:16px;bottom:80px;width:52px;height:52px;z-index:60;display:none;box-shadow:0 4px 16px rgba(62,31,15,.25)}',
    '.mk-pulse::after{content:"";position:absolute;inset:-6px;border-radius:50%;border:2px solid var(--mk-brown);animation:mkRing 1.6s ease-out infinite;pointer-events:none}',
    '@keyframes mkRing{0%{transform:scale(.85);opacity:.8}100%{transform:scale(1.4);opacity:0}}',
    '@keyframes mkPop{0%{opacity:0;transform:translateY(8px)}100%{opacity:1;transform:none}}',

    /* tombol kecil serbaguna */
    '.mk-b{cursor:pointer;font:inherit;font-size:12px;font-weight:700;padding:7px 13px;border-radius:99px;background:#fff;border:1px solid var(--mk-border);color:var(--mk-text)}',
    '.mk-b.mk-main{background:var(--mk-brown);border-color:var(--mk-brown);color:var(--mk-cream)}',
    '.mk-link,.mk-ic{background:none;border:0;cursor:pointer;font:inherit;font-size:12px;font-weight:700;color:var(--mk-muted);padding:6px 8px;border-radius:8px}',

    /* tips di halaman fitur */
    '.mk-tip{position:fixed;right:76px;bottom:80px;z-index:70;width:min(320px,calc(100vw - 92px));background:#fff;border:1px solid var(--mk-border);border-radius:18px;padding:12px 14px;box-shadow:0 8px 28px rgba(62,31,15,.18);display:none;color:var(--mk-text)}',
    '.mk-tip.mk-show{display:block;animation:mkPop .25s ease-out}',
    '.mk-tip-h{display:flex;gap:10px;align-items:flex-start}',
    '.mk-tip p{margin:0 0 10px;font-size:13px;line-height:1.45}',
    '.mk-av{flex-shrink:0;display:block;width:48px;height:48px;border-radius:50%;overflow:hidden;background:var(--mk-surface);border:2px solid var(--mk-brown)}',
    '.mk-tip .mk-av{width:38px;height:38px}',
    '.mk-tip-row{display:flex;gap:8px;justify-content:flex-end}',

    /* jendela tur */
    '.mk-ov{position:fixed;inset:0;z-index:400;display:none;align-items:flex-end;justify-content:center;background:rgba(45,18,6,.72);padding:16px}',
    '.mk-ov.mk-show{display:flex}',
    '.mk-card{width:100%;max-width:420px;max-height:94dvh;overflow:auto;background:var(--mk-cream);border-radius:28px;padding:16px 18px 18px;color:var(--mk-text);box-shadow:0 20px 60px rgba(0,0,0,.35);animation:mkPop .3s ease-out}',
    '.mk-top{display:flex;align-items:center;justify-content:space-between;font-size:12px;font-weight:700;color:var(--mk-muted)}',
    '.mk-char{width:120px;margin:2px auto 0}',
    '.mk-bubble{position:relative;background:#fff;border:1.5px solid var(--mk-border);border-radius:18px;padding:14px 16px;margin-top:12px;min-height:128px;cursor:pointer}',
    '.mk-bubble::before{content:"";position:absolute;top:-8px;left:50%;margin-left:-7px;width:13px;height:13px;background:#fff;border-left:1.5px solid var(--mk-border);border-top:1.5px solid var(--mk-border);transform:rotate(45deg)}',
    '.mk-bub-title{display:block;font-size:15px;font-weight:800;margin-bottom:6px}',
    '.mk-bub-text{margin:0;font-size:14px;line-height:1.55;white-space:pre-line}',
    '.mk-dots{display:flex;gap:6px;justify-content:center;margin:12px 0 10px}',
    '.mk-dot{width:7px;height:7px;border-radius:99px;background:var(--mk-border);transition:width .2s}',
    '.mk-dot.on{background:var(--mk-brown);width:18px}',
    '.mk-nav{display:flex;gap:10px}',
    '.mk-nav .mk-b{flex:1;padding:12px;font-size:14px;border-radius:14px}',

    /* panel tanya */
    '.mk-pan{position:fixed;inset:0;z-index:350;display:none;align-items:flex-end;justify-content:center;background:rgba(45,18,6,.5)}',
    '.mk-pan.mk-show{display:flex}',
    '.mk-sheet{width:100%;max-width:460px;max-height:88dvh;display:flex;flex-direction:column;background:var(--mk-cream);border-radius:26px 26px 0 0;overflow:hidden;color:var(--mk-text);animation:mkPop .25s ease-out}',
    '.mk-sh-head{display:flex;align-items:center;gap:12px;padding:12px 12px 12px 16px;background:var(--mk-brown);color:var(--mk-cream)}',
    '.mk-sh-head .mk-av{border-color:var(--mk-cream)}',
    '.mk-sh-t{flex:1;display:flex;flex-direction:column;line-height:1.25}',
    '.mk-sh-t strong{font-size:16px}',
    '.mk-sh-t span{font-size:12px;opacity:.75}',
    '.mk-sh-head .mk-ic{color:var(--mk-cream);font-size:16px}',
    '.mk-msgs{flex:1;min-height:120px;overflow:auto;padding:14px 16px;display:flex;flex-direction:column;gap:10px}',
    '.mk-msg{max-width:90%;padding:10px 13px;border-radius:16px;font-size:14px;line-height:1.5;white-space:pre-line;overflow-wrap:anywhere}',
    '.mk-m{align-self:flex-start;background:#fff;border:1px solid var(--mk-border);border-top-left-radius:4px;position:relative}',
    '.mk-u{align-self:flex-end;background:var(--mk-brown);color:var(--mk-cream);border-top-right-radius:4px}',
    '.mk-chips{display:flex;flex-wrap:wrap;gap:6px;padding:4px 16px 10px;max-height:104px;overflow:auto}',
    '.mk-chip{cursor:pointer;font:inherit;font-size:12px;font-weight:600;padding:6px 11px;border-radius:99px;background:var(--mk-surface);border:1px solid var(--mk-border);color:var(--mk-text)}',
    '.mk-form{display:flex;gap:8px;padding:10px 16px calc(12px + env(safe-area-inset-bottom));border-top:1px solid var(--mk-border);background:#fff}',
    '.mk-form input{flex:1;min-width:0;font:inherit;font-size:15px;padding:10px 14px;border-radius:99px;border:1.5px solid var(--mk-border);background:var(--mk-cream);color:var(--mk-text);outline:none}',
    '.mk-form input:focus{border-color:var(--mk-brown)}',
    '.mk-form .mk-b{padding:10px 16px;font-size:13px}',

    /* kotak "Kata Miko" di dalam hasil pencarian / hasil scan */
    '.mk-say{display:flex;gap:10px;align-items:flex-start;background:var(--mk-surface);border:1px solid var(--mk-border);border-radius:18px;padding:12px 14px;margin-bottom:12px;color:var(--mk-text)}',
    '.mk-say-av{width:52px;height:52px}',
    '.mk-say-b{flex:1;min-width:0}',
    '.mk-say-n{display:block;font-size:11px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--mk-muted);margin-bottom:3px}',
    '.mk-say-t{margin:0;font-size:13.5px;line-height:1.55;white-space:pre-line;cursor:pointer}',
    '.mk-say-act{margin-top:8px}',
    '@media (min-width:560px){.mk-ov,.mk-pan{align-items:center}.mk-sheet{border-radius:26px}}',
    '@media (prefers-reduced-motion:reduce){.mk-card,.mk-sheet,.mk-tip,.mk-pulse::after{animation:none!important}}'
  ].join('\n');

  function suntikCSS() {
    if ($('miko-css-panduan')) return;
    var s = buat('style'); s.id = 'miko-css-panduan'; s.textContent = CSS; document.head.appendChild(s);
  }

  /* ============================================================
     TOMBOL: header Home + melayang
     ============================================================ */
  var layar = '';          // id layar yang lagi aktif
  var headerOk = false;    // true kalau tombol berhasil dipasang di header Home
  var fab = null;

  function pasangTombolHeader() {
    if ($('miko-btn')) { headerOk = true; return; }
    var home = $('screen-home');
    var chip = home && home.querySelector('.point-chip');
    if (!chip || !chip.parentNode) { console.warn('[Miko] chip poin di header Home gak ketemu, pakai tombol melayang aja.'); return; }
    var b = buat('button', 'mk-btn', '<span class="mk-btn-in">' + K.svg({ face: true, react: true }) + '</span>');
    b.id = 'miko-btn'; b.type = 'button';
    b.setAttribute('aria-label', 'Tanya Miko, pemandu MicroVita'); b.title = 'Tanya Miko';
    b.addEventListener('click', function () { bukaPanel(); });
    chip.parentNode.insertBefore(b, chip.nextSibling); // setelah chip poin, sebelum tombol profil
    headerOk = true;
  }

  function pasangFab() {
    if (fab) return;
    fab = buat('button', 'mk-fab', '<span class="mk-btn-in">' + K.svg({ face: true, react: true }) + '</span>');
    fab.id = 'miko-fab'; fab.type = 'button';
    fab.setAttribute('aria-label', 'Tanya Miko, pemandu MicroVita'); fab.title = 'Tanya Miko';
    fab.addEventListener('click', function () { bukaPanel(); });
    document.body.appendChild(fab);
  }

  function segarkanPulse() {
    var on = !!get('pulse', false);
    var list = [$('miko-btn'), fab];
    for (var i = 0; i < list.length; i++) if (list[i]) list[i].classList.toggle('mk-pulse', on);
  }

  function segarkanFab() {
    if (!fab) return;
    var tampil = LAYAR_FITUR.indexOf(layar) > -1 || (layar === 'screen-home' && !headerOk);
    fab.style.display = (tampil && !tur.buka) ? 'flex' : 'none';
  }

  /* ============================================================
     TUR PENGENALAN
     ============================================================ */
  var tur = { el: null, i: 0, ketik: null, pembuka: null, buka: false };

  function bangunTur() {
    if (tur.el) return;
    var o = buat('div', 'mk-ov');
    o.id = 'miko-tur'; o.setAttribute('role', 'dialog'); o.setAttribute('aria-modal', 'true'); o.setAttribute('aria-label', 'Pengenalan MicroVita oleh Miko');
    o.innerHTML =
      '<div class="mk-card" tabindex="-1">' +
        '<div class="mk-top"><span id="mk-tur-hitung"></span><span>' +
          '<button type="button" class="mk-link mk-voice" data-act="suara"></button>' +
          '<button type="button" class="mk-link" data-act="lewati">Lewati</button></span></div>' +
        '<div class="mk-char" id="mk-tur-char"></div>' +
        '<div class="mk-bubble" id="mk-tur-bubble" title="Ketuk buat langsung tampilkan semua teks">' +
          '<span class="mk-bub-title" id="mk-tur-judul"></span>' +
          '<p class="mk-bub-text" id="mk-tur-teks" aria-hidden="true"></p>' +
          '<span class="mk-sr" id="mk-tur-sr" role="status"></span></div>' +
        '<div class="mk-dots" id="mk-tur-dots" aria-hidden="true"></div>' +
        '<div class="mk-nav"><button type="button" class="mk-b" data-act="kembali">Kembali</button>' +
        '<button type="button" class="mk-b mk-main" data-act="lanjut">Lanjut</button></div>' +
      '</div>';
    document.body.appendChild(o);
    tur.el = o;
    $('mk-tur-char').innerHTML = K.svg({ state: 'wave' });
    o.addEventListener('click', function (e) {
      if (e.target.closest('#mk-tur-bubble')) { if (tur.ketik) tur.ketik.selesai(); return; }
      var a = e.target.closest('[data-act]'); if (!a) return;
      var act = a.getAttribute('data-act');
      if (act === 'lanjut') { tur.i >= TOUR.length - 1 ? tutupTur(true) : langkahTur(tur.i + 1); }
      else if (act === 'kembali') { if (tur.i > 0) langkahTur(tur.i - 1); }
      else if (act === 'lewati') tutupTur(false);
      else if (act === 'suara') toggleSuara();
    });
    o.addEventListener('keydown', function (e) { jebakTab(o, e); });
    segarkanSuara();
  }

  function langkahTur(i) {
    var s = TOUR[i], t = s.topik ? TOPIK_ID[s.topik] : null;
    var judul = s.judul || (t.ikon + ' ' + t.label);
    var teks = s.teks || t.ringkas;
    var char = $('mk-tur-char');
    tur.i = i;
    if (tur.ketik) tur.ketik.batal();
    $('mk-tur-hitung').textContent = (i + 1) + ' / ' + TOUR.length;
    $('mk-tur-judul').textContent = judul;
    $('mk-tur-sr').textContent = judul + '. ' + teks;
    K.setState(char, s.state || (t && t.state) || 'idle');
    var dots = '';
    for (var d = 0; d < TOUR.length; d++) dots += '<span class="mk-dot' + (d === i ? ' on' : '') + '"></span>';
    $('mk-tur-dots').innerHTML = dots;
    tur.el.querySelector('[data-act="kembali"]').style.visibility = i ? 'visible' : 'hidden';
    tur.el.querySelector('[data-act="lanjut"]').textContent = (i === TOUR.length - 1) ? 'Mulai 🚀' : 'Lanjut';
    K.talk(char, true);
    tur.ketik = ketik($('mk-tur-teks'), teks, { selesai: function () { K.talk(char, false); } });
    ucapkan(judul + '. ' + teks);
  }

  function mulaiTur() {
    if (tur.buka) return;
    bangunTur();
    if (pan.buka) tutupPanel(true);
    tutupTip();
    tur.buka = true; tur.pembuka = document.activeElement;
    tur.el.classList.add('mk-show'); kunci(true); segarkanFab(); segarkanSuara();
    langkahTur(0);
    var lanjut = tur.el.querySelector('[data-act="lanjut"]'); if (lanjut) lanjut.focus();
  }

  function tutupTur(selesai) {
    if (!tur.buka) return;
    tur.buka = false;
    if (tur.ketik) tur.ketik.batal();
    diam();
    tur.el.classList.remove('mk-show'); kunci(false);
    put('tourDone', true);
    put('pulse', true);                                  // tombol Miko berdenyut sampai diklik pertama kali
    if (selesai) put('tips', TOPIK.map(function (t) { return t.id; })); // kalau tur tamat, tips per halaman gak perlu lagi
    segarkanPulse(); segarkanFab();
    if (tur.pembuka && tur.pembuka.focus) { try { tur.pembuka.focus(); } catch (e) {} }
  }

  /* ============================================================
     PANEL TANYA MIKO
     ============================================================ */
  var pan = { el: null, msgs: null, av: null, input: null, buka: false, pembuka: null, sapa: false, terakhir: '', ketik: null };

  function bangunPanel() {
    if (pan.el) return;
    var o = buat('div', 'mk-pan'); o.id = 'miko-panel';
    o.innerHTML =
      '<div class="mk-sheet" role="dialog" aria-modal="true" aria-label="Tanya Miko" tabindex="-1">' +
        '<div class="mk-sh-head"><span class="mk-av" id="mk-pan-av"></span>' +
          '<div class="mk-sh-t"><strong>Miko</strong><span>Pemandu MicroVita</span></div>' +
          '<button type="button" class="mk-ic mk-voice" data-act="suara"></button>' +
          '<button type="button" class="mk-ic" data-act="tutup" aria-label="Tutup">✕</button></div>' +
        '<div class="mk-msgs" id="mk-msgs" aria-live="polite"></div>' +
        '<div class="mk-chips" id="mk-chips"></div>' +
        '<form class="mk-form" id="mk-form" autocomplete="off">' +
          '<input id="mk-input" type="text" maxlength="120" placeholder="Ketik pertanyaanmu, misalnya: cara cek expired" aria-label="Pertanyaan untuk Miko">' +
          '<button type="submit" class="mk-b mk-main">Kirim</button></form>' +
      '</div>';
    document.body.appendChild(o);
    pan.el = o; pan.msgs = $('mk-msgs'); pan.av = $('mk-pan-av'); pan.input = $('mk-input');
    pan.av.innerHTML = K.svg({ face: true });

    var chips = '';
    TOPIK.forEach(function (t) { chips += '<button type="button" class="mk-chip" data-topik="' + t.id + '">' + t.ikon + ' ' + t.label + '</button>'; });
    chips += '<button type="button" class="mk-chip" data-act="ulang">🔁 Ulangi pengenalan</button>';
    $('mk-chips').innerHTML = chips;

    o.addEventListener('click', function (e) {
      if (e.target === o) { tutupPanel(); return; }
      var c = e.target.closest('[data-topik]');
      if (c) { tanyaTopik(c.getAttribute('data-topik')); return; }
      var a = e.target.closest('[data-act]'); if (!a) return;
      var act = a.getAttribute('data-act');
      if (act === 'tutup') tutupPanel();
      else if (act === 'suara') toggleSuara();
      else if (act === 'ulang') { tutupPanel(true); mulaiTur(); }
    });
    o.addEventListener('keydown', function (e) { jebakTab(o, e); });
    $('mk-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var q = pan.input.value.trim();
      if (!q) { pan.input.focus(); return; }
      pan.input.value = '';
      kirim(q);
    });
    segarkanSuara();
  }

  function gulirBawah() { pan.msgs.scrollTop = pan.msgs.scrollHeight; }

  function tambahPesan(dari, teks, animasi, selesai) {
    var m = buat('div', 'mk-msg ' + (dari === 'u' ? 'mk-u' : 'mk-m'));
    if (dari === 'u') {
      m.textContent = teks;
      pan.msgs.appendChild(m); gulirBawah();
      return;
    }
    var v = buat('span'); v.setAttribute('aria-hidden', 'true');
    var s = buat('span', 'mk-sr'); s.textContent = teks;
    m.appendChild(v); m.appendChild(s);
    pan.msgs.appendChild(m);
    if (pan.ketik) pan.ketik.selesai();
    if (animasi) pan.ketik = ketik(v, teks, { tick: gulirBawah, selesai: selesai });
    else { v.textContent = teks; if (selesai) selesai(); }
    gulirBawah();
  }

  /* Miko membalas: ganti ekspresi, ngomong, ketik teksnya */
  function balas(teks, state, lanjut) {
    K.setState(pan.av, state || 'idle');
    K.talk(pan.av, true);
    ucapkan(teks);
    tambahPesan('m', teks, true, function () {
      K.talk(pan.av, false);
      if (state === 'sad' || state === 'happy' || state === 'wave') setTimeout(function () { K.setState(pan.av, 'idle'); }, 1800);
      if (lanjut) lanjut();
    });
  }

  function cariJawaban(q) {
    var s = q.toLowerCase();
    if (/(terima ?kasih|makasih|thanks|thx|tengkyu)/.test(s)) return { teks: TERIMA_KASIH, state: 'happy' };
    if (/^(hai|halo|hi|hello|hay|pagi|siang|sore|malam)\b/.test(s) && s.length < 14) return { teks: HALO, state: 'wave' };
    var terbaik = null, skor = 0;
    TOPIK.forEach(function (t) {
      var n = 0;
      t.kata.forEach(function (k) { if (s.indexOf(k) > -1) n += k.length; });
      if (n > skor) { skor = n; terbaik = t; }
    });
    if (terbaik) return { teks: terbaik.teks, state: 'idle', topik: terbaik.id };
    return { teks: TIDAK_PAHAM, state: 'sad' };
  }

  function kirim(q) {
    tambahPesan('u', q);
    K.setState(pan.av, 'think');
    setTimeout(function () {
      var r = cariJawaban(q);
      if (r.topik) pan.terakhir = r.topik;
      balas(r.teks, r.state);
    }, 450);
  }

  function tanyaTopik(id) {
    var t = TOPIK_ID[id]; if (!t) return;
    tambahPesan('u', t.ikon + ' ' + t.label);
    pan.terakhir = id;
    K.setState(pan.av, 'think');
    setTimeout(function () { balas(t.teks, 'idle'); }, 350);
  }

  function bukaPanel(opsi) {
    opsi = opsi || {};
    if (tur.buka) return;
    bangunPanel(); tutupTip();
    pan.pembuka = document.activeElement;
    pan.el.classList.add('mk-show'); pan.buka = true; kunci(true); segarkanSuara();
    if (get('pulse', false)) { put('pulse', false); segarkanPulse(); }

    var t = opsi.topik ? TOPIK_ID[opsi.topik] : TOPIK_LAYAR[layar];
    if (!pan.sapa) {
      pan.sapa = true;
      if (t) { pan.terakhir = t.id; balas('Hai, aku Miko 😸 Kamu lagi di ' + t.label + ', aku jelasin ya:', 'wave', function () { balas(t.teks, 'idle'); }); }
      else balas(SAPA_PANEL, 'wave');
    } else if (t && pan.terakhir !== t.id) {
      pan.terakhir = t.id;
      balas('Kamu lagi di ' + t.label + ', ini penjelasannya:', 'idle', function () { balas(t.teks, 'idle'); });
    }
    var sheet = pan.el.querySelector('.mk-sheet'); if (sheet) sheet.focus();
  }

  function tutupPanel(tanpaFokus) {
    if (!pan.buka) return;
    pan.buka = false;
    if (pan.ketik) pan.ketik.selesai();
    diam();
    pan.el.classList.remove('mk-show');
    if (!tur.buka) kunci(false);
    if (!tanpaFokus && pan.pembuka && pan.pembuka.focus) { try { pan.pembuka.focus(); } catch (e) {} }
  }

  /* ============================================================
     TIPS SEKALI TAMPIL DI HALAMAN FITUR
     ============================================================ */
  var tip = { el: null, timer: null, topik: null };

  function bangunTip() {
    if (tip.el) return;
    var o = buat('div', 'mk-tip'); o.setAttribute('role', 'status');
    o.innerHTML =
      '<div class="mk-tip-h"><span class="mk-av">' + K.svg({ face: true }) + '</span><p id="mk-tip-teks"></p></div>' +
      '<div class="mk-tip-row"><button type="button" class="mk-b" data-act="ok">Mengerti</button>' +
      '<button type="button" class="mk-b mk-main" data-act="detail">Selengkapnya</button></div>';
    document.body.appendChild(o);
    tip.el = o;
    o.addEventListener('click', function (e) {
      var a = e.target.closest('[data-act]'); if (!a) return;
      var topik = tip.topik;
      tutupTip();
      if (a.getAttribute('data-act') === 'detail' && topik) bukaPanel({ topik: topik.id });
    });
  }

  function tampilTip(t) {
    bangunTip();
    tip.topik = t;
    $('mk-tip-teks').textContent = t.tip;
    tip.el.classList.add('mk-show');
    clearTimeout(tip.timer);
    tip.timer = setTimeout(tutupTip, 15000);
  }

  function tutupTip() {
    clearTimeout(tip.timer);
    if (tip.el) tip.el.classList.remove('mk-show');
  }

  /* ============================================================
     DIPANGGIL SETIAP PINDAH LAYAR
     ============================================================ */
  function dilayar(id) {
    layar = id;
    tutupTip();
    segarkanFab();
    if (id === 'screen-home') segarkanPulse();

    /* pertama kali: tur otomatis di layar Welcome (atau Home kalau user langsung masuk) */
    if ((id === 'screen-welcome' || id === 'screen-home') && !get('tourDone', false) && !tur.buka) {
      setTimeout(function () {
        if (!tur.buka && !get('tourDone', false) && (layar === 'screen-welcome' || layar === 'screen-home')) mulaiTur();
      }, 700);
      return;
    }

    /* tips sekali per halaman fitur */
    var t = TOPIK_LAYAR[id];
    if (t && t.tip && get('tips', []).indexOf(t.id) < 0) {
      setTimeout(function () {
        if (layar !== id || tur.buka || pan.buka) return;
        var sudah = get('tips', []); sudah.push(t.id); put('tips', sudah);
        tampilTip(t);
      }, 800);
    }
  }

  /* ============================================================
     MIKO MENJELASKAN HASIL (dipakai Tanya Miko dan hasil scan foto)
     Miko.jelaskan(wadah, teks, { state })  -> isi wadah dengan kotak "Kata Miko" yang ngetik
     ============================================================ */
  var sayAktif = null;

  function jelaskan(wadah, teks, opsi) {
    opsi = opsi || {};
    if (typeof wadah === 'string') wadah = document.querySelector(wadah);
    if (!wadah || !teks) return null;
    teks = String(teks);
    if (sayAktif) sayAktif.selesai();
    diam();
    var state = K.STATES.indexOf(opsi.state) > -1 ? opsi.state : 'idle';
    wadah.innerHTML =
      '<div class="mk-say" role="group" aria-label="Penjelasan dari Miko">' +
        '<span class="mk-av mk-say-av">' + K.svg({ face: true, state: state }) + '</span>' +
        '<div class="mk-say-b"><strong class="mk-say-n">Kata Miko</strong>' +
          '<p class="mk-say-t" aria-hidden="true" title="Ketuk buat langsung tampilkan semua teks"></p>' +
          '<span class="mk-sr" role="status"></span>' +
          '<div class="mk-say-act"></div></div></div>';
    var av = wadah.querySelector('.mk-say-av'), p = wadah.querySelector('.mk-say-t');
    var sr = wadah.querySelector('.mk-sr'), act = wadah.querySelector('.mk-say-act');
    sr.textContent = teks;

    if ('speechSynthesis' in window) {
      var tb = buat('button', 'mk-b'); tb.type = 'button'; tb.textContent = '🔊 Dengarkan';
      tb.addEventListener('click', function () {
        var sedang = false; try { sedang = window.speechSynthesis.speaking; } catch (e) {}
        if (sedang) { diam(); tb.textContent = '🔊 Dengarkan'; return; }
        tb.textContent = '⏹ Berhenti';
        ucapkan(teks, true, function () { tb.textContent = '🔊 Dengarkan'; });
      });
      act.appendChild(tb);
    }

    K.talk(av, true);
    var ctl = { selesai: function () {} };
    var kontrol = ketik(p, teks, { selesai: function () { K.talk(av, false); if (sayAktif === ctl) sayAktif = null; } });
    ctl.selesai = kontrol.selesai;
    sayAktif = ctl;
    p.addEventListener('click', kontrol.selesai);
    if (suaraOn) ucapkan(teks);
    return ctl;
  }

  /* ---------- ringkasan hasil scan foto makanan, disusun dari angka hasil AI ---------- */
  function angka(v) {
    if (v == null || v === '') return null;
    var m = String(v).replace(',', '.').match(/-?\d+(\.\d+)?/);
    return m ? parseFloat(m[0]) : null;
  }
  function bulat(n) { return Math.round(n * 10) / 10; }

  function ringkasMakanan(d) {
    var n = d.nutrition || {};
    var nama = d.food_name || 'makanan ini';
    var kal = angka(d.calories_per_100g), p = angka(n.protein_g), k = angka(n.carbs_g);
    var l = angka(n.fat_g), g = angka(n.sugar_g), s = angka(d.salt);
    if (s != null && /mg/i.test(String(d.salt))) s = s / 1000; // garam kadang ditulis mg

    var kalimat = ['Dari fotomu, ini kelihatannya ' + nama + '.'];
    var gizi = [];
    if (kal) gizi.push('kalori sekitar ' + bulat(kal) + ' kkal');
    if (p != null) gizi.push('protein ' + bulat(p) + ' g');
    if (k != null) gizi.push('karbohidrat ' + bulat(k) + ' g');
    if (l != null) gizi.push('lemak ' + bulat(l) + ' g');
    if (g != null) gizi.push('gula ' + bulat(g) + ' g');
    if (s != null) gizi.push('garam ' + bulat(s) + ' g');
    if (gizi.length) kalimat.push('Estimasinya: ' + gizi.join(', ') + '.');

    /* batas harian anjuran Kemenkes: gula 50 g, lemak 67 g, garam 5 g (natrium 2000 mg) */
    if (g != null && g >= 15) kalimat.push('Gulanya lumayan tinggi, sekitar ' + Math.round(g / 50 * 100) + '% dari batas harian yang dianjurkan (50 g).');
    if (l != null && l >= 20) kalimat.push('Lemaknya cukup banyak, sekitar ' + Math.round(l / 67 * 100) + '% dari batas harian (67 g).');
    if (s != null && s >= 1.5) kalimat.push('Garamnya lumayan, sekitar ' + Math.round(s / 5 * 100) + '% dari batas harian (5 g).');
    if (p != null && p >= 15) kalimat.push('Proteinnya lumayan bagus buat tubuhmu.');

    var st = d.status, state = 'idle';
    if (st === 'AMAN') { kalimat.push('Secara keseluruhan statusnya aman.'); state = 'happy'; }
    else if (st === 'WASPADA') { kalimat.push('Statusnya waspada: boleh sesekali, tapi jangan berlebihan ya.'); state = 'think'; }
    else if (st === 'BAHAYA') { kalimat.push('Sebaiknya jangan terlalu sering makan ini ya.'); state = 'sad'; }
    kalimat.push('Ingat, ini cuma estimasi AI dan bukan pengganti saran ahli gizi.');
    return { teks: kalimat.join('\n'), state: state };
  }

  /* ============================================================
     NYAMBUNG KE KODE YANG SUDAH ADA (tanpa ngubah index.html)
     ============================================================ */
  function pasangKait() {
    // 1. tiap goto() ikut kasih tahu Miko
    if (typeof window.goto === 'function' && !window.goto.__miko) {
      var asliGoto = window.goto;
      var baruGoto = function (id) {
        var hasil = asliGoto.apply(this, arguments);
        try { dilayar(id); } catch (e) { console.warn('[Miko]', e); }
        return hasil;
      };
      baruGoto.__miko = true;
      window.goto = baruGoto;
    } else if (typeof window.goto !== 'function') {
      console.warn('[Miko] fungsi goto() gak ketemu, tur otomatis & tips gak jalan.');
    }

    // 2. tanyaTavily(): Miko mikir saat Cari, senang kalau hasil keluar, sedih kalau error
    if (typeof window.tanyaTavily === 'function' && !window.tanyaTavily.__miko) {
      var asliTanya = window.tanyaTavily;
      var baruTanya = async function () {
        var inp = $('tavily-input');
        if (inp && !inp.value.trim()) return asliTanya.apply(this, arguments); // kosong: gak usah bereaksi
        K.react('think');
        try { return await asliTanya.apply(this, arguments); }
        finally {
          var box = $('tavily-jawaban');
          var gagal = box && /Gagal konek|⚠️/.test(box.textContent || '');
          K.react(gagal ? 'sad' : 'happy', 2500);
        }
      };
      baruTanya.__miko = true;
      window.tanyaTavily = baruTanya;
    }

    // 3. hasil scan foto makanan: Miko ikut menjelaskan (kartu hasil dibuat oleh buildMakananCard)
    if (typeof window.buildMakananCard === 'function' && !window.buildMakananCard.__miko) {
      var asliKartu = window.buildMakananCard;
      var baruKartu = function (d) {
        var html = asliKartu.apply(this, arguments);
        try {
          var r = ringkasMakanan(d || {});
          setTimeout(function () {
            var slot = $('miko-say-makanan');
            if (slot) jelaskan(slot, r.teks, { state: r.state });
          }, 80);
          return '<div id="miko-say-makanan"></div>' + html;
        } catch (e) { console.warn('[Miko]', e); return html; }
      };
      baruKartu.__miko = true;
      window.buildMakananCard = baruKartu;
    }

    // 4. doScan(): Miko mikir saat scan, senang kalau berhasil, sedih kalau gagal
    if (typeof window.doScan === 'function' && !window.doScan.__miko) {
      var asliScan = window.doScan;
      var baruScan = async function (type) {
        var siap = typeof APP !== 'undefined' && APP.scanData && APP.scanData[type] && APP.scanData[type].file &&
                   !(APP.scanning && APP.scanning[type]);
        if (siap) K.react('think');
        try { return await asliScan.apply(this, arguments); }
        finally {
          if (siap) {
            var r = $('result-' + type);
            var gagal = r && /Scan Gagal/.test(r.textContent || '');
            K.react(gagal ? 'sad' : 'happy', 2500);
          }
        }
      };
      baruScan.__miko = true;
      window.doScan = baruScan;
    }
  }

  /* ============================================================
     MULAI
     ============================================================ */
  function init() {
    suntikCSS();
    pasangTombolHeader();
    pasangFab();
    pasangKait();
    segarkanSuara();
    segarkanPulse();
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      if (tur.buka) tutupTur(false);
      else if (pan.buka) tutupPanel();
      else tutupTip();
    });
    var aktif = document.querySelector('.screen.active');
    if (aktif) dilayar(aktif.id);
  }

  /* jalan pintas buat ngetes lewat Console browser:
       Miko.buka()    -> buka panel
       Miko.tur()     -> putar tur pengenalan
       Miko.reset()   -> hapus ingatan (tur, tips, pulse) biar kayak pertama kali pakai */
  window.Miko = {
    buka: bukaPanel,
    tur: mulaiTur,
    jelaskan: jelaskan,
    reset: function () { ['tourDone', 'tips', 'pulse', 'suara'].forEach(hapus); suaraOn = false; segarkanSuara(); segarkanPulse(); }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();