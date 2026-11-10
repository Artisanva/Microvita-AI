/* ============================================================
   miko-karakter.js
   Gambar + animasi Miko (kucing dokter) dibuat 100% dari kode (SVG).
   File ini CUMA ngurus tampilan karakter. Naskah & alur ada di miko-panduan.js

   Cara pakai dari file lain:
     MikoKarakter.svg({ face:true, state:'idle' })   -> string SVG
     MikoKarakter.setState(elemen, 'happy')          -> ganti ekspresi
     MikoKarakter.react('happy', 2500)               -> ganti ekspresi semua avatar
                                                        yang punya data-react, lalu balik
                                                        ke 'idle' setelah 2500 ms

   State yang tersedia: idle | think | happy | sad | wave
   ============================================================ */
(function () {
  'use strict';

  var O = '#4A2A1A'; // warna garis (cokelat tua)

  /* ---------- CSS animasi (disuntik sekali ke <head>) ---------- */
  var CSS = [
    '.mk{display:block;width:100%;height:auto}',
    '.mk *{transform-box:fill-box}',

    /* gerakan dasar (state diam) */
    '.mk .mk-body{transform-origin:50% 100%;animation:mkBr 3s ease-in-out infinite}',
    '.mk .mk-head{transform-origin:50% 100%;animation:mkHd 3s ease-in-out infinite}',
    '.mk .mk-tail{transform-origin:0% 100%;animation:mkTl 2.4s ease-in-out infinite}',
    '.mk .mk-eyes-n{transform-origin:50% 50%;animation:mkBl 4s infinite}',

    /* tangan: titik putar di bahu */
    '.mk .mk-arm{transform-origin:50% 0%;transition:transform .5s ease}',
    '.mk .mk-aw{transform-origin:50% 0%}',
    '.mk .mk-armL{transform:rotate(10deg)}',
    '.mk .mk-armR{transform:rotate(-10deg)}',

    /* bagian yang cuma muncul di ekspresi tertentu */
    '.mk .mk-eyes-h,.mk .mk-m-happy,.mk .mk-m-sad,.mk .mk-m-think,.mk .mk-x-think,.mk .mk-x-sad{display:none}',
    '.mk.mk-s-think .mk-m-idle,.mk.mk-s-happy .mk-m-idle,.mk.mk-s-sad .mk-m-idle,.mk.mk-s-happy .mk-eyes-n,.mk.mk-s-wave .mk-eyes-n{display:none}',
    '.mk.mk-s-think .mk-m-think,.mk.mk-s-think .mk-x-think,.mk.mk-s-happy .mk-m-happy,.mk.mk-s-happy .mk-eyes-h,.mk.mk-s-wave .mk-eyes-h,.mk.mk-s-sad .mk-m-sad,.mk.mk-s-sad .mk-x-sad{display:inline}',

    /* MIKIR: tangan kanan ke dagu, kepala miring */
    '.mk.mk-s-think .mk-head{animation:none;transform:rotate(-6deg)}',
    '.mk.mk-s-think .mk-armR{transform:rotate(98deg)}',

    /* SENANG: dua tangan naik, loncat, ekor goyang cepat */
    '.mk.mk-s-happy .mk-armL{transform:rotate(150deg)}',
    '.mk.mk-s-happy .mk-armR{transform:rotate(-150deg)}',
    '.mk.mk-s-happy .mk-aw{animation:mkWg .5s ease-in-out infinite}',
    '.mk.mk-s-happy .mk-all{animation:mkBn .6s ease-in-out infinite}',
    '.mk-face.mk-s-happy .mk-all{animation:mkBnS .6s ease-in-out infinite}',
    '.mk.mk-s-happy .mk-tail{animation-duration:.5s}',

    /* SEDIH: kepala turun, tangan lemas, air mata */
    '.mk.mk-s-sad .mk-head{animation:none;transform:translateY(5px)}',
    '.mk.mk-s-sad .mk-body{animation:none;transform:scaleY(.97)}',
    '.mk.mk-s-sad .mk-armL{transform:rotate(-6deg)}',
    '.mk.mk-s-sad .mk-armR{transform:rotate(6deg)}',
    '.mk.mk-s-sad .mk-tail{animation-duration:5s}',

    /* LAMBAI: tangan kanan naik dan melambai */
    '.mk.mk-s-wave .mk-armR{transform:rotate(-150deg)}',
    '.mk.mk-s-wave .mk-armR .mk-aw{animation:mkWv .6s ease-in-out infinite}',

    /* lagi ngomong: kepala ngangguk-ngangguk kecil */
    '.mk.mk-talk:not(.mk-s-think):not(.mk-s-sad) .mk-head{animation:mkTalk .34s ease-in-out infinite}',

    '.mk .mk-tear{animation:mkTr 1.6s ease-in infinite}',
    '.mk .mk-d1,.mk .mk-d2,.mk .mk-d3{animation:mkPl 1.2s infinite}',
    '.mk .mk-d2{animation-delay:.2s}.mk .mk-d3{animation-delay:.4s}',

    '@keyframes mkBr{50%{transform:scaleY(1.025)}}',
    '@keyframes mkHd{50%{transform:translateY(-2px)}}',
    '@keyframes mkTl{0%,100%{transform:rotate(-8deg)}50%{transform:rotate(10deg)}}',
    '@keyframes mkBl{0%,92%,100%{transform:scaleY(1)}95%{transform:scaleY(.1)}}',
    '@keyframes mkBn{50%{transform:translateY(-10px)}}',
    '@keyframes mkBnS{50%{transform:translateY(-5px)}}',
    '@keyframes mkWg{0%,100%{transform:rotate(-10deg)}50%{transform:rotate(10deg)}}',
    '@keyframes mkWv{0%,100%{transform:rotate(-18deg)}50%{transform:rotate(18deg)}}',
    '@keyframes mkTalk{50%{transform:translateY(-3px)}}',
    '@keyframes mkTr{0%{transform:translateY(0);opacity:1}100%{transform:translateY(16px);opacity:0}}',
    '@keyframes mkPl{0%,100%{opacity:.25}50%{opacity:1}}',

    /* hormati pengaturan "kurangi gerakan" di HP/laptop */
    '@media (prefers-reduced-motion:reduce){.mk *{animation:none!important;transition:none!important}}'
  ].join('\n');

  function ensureCSS() {
    if (document.getElementById('miko-css-karakter')) return;
    var s = document.createElement('style');
    s.id = 'miko-css-karakter';
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  /* ---------- gambar Miko ---------- */
  var BADAN =
    '<g class="mk-all">' +
      /* ekor */
      '<g class="mk-tail">' +
        '<path d="M140 190 Q186 188 178 142" fill="none" stroke="' + O + '" stroke-width="15" stroke-linecap="round"/>' +
        '<path d="M140 190 Q186 188 178 142" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round"/>' +
      '</g>' +
      /* badan + jas dokter + stetoskop */
      '<g class="mk-body">' +
        '<ellipse cx="80" cy="212" rx="13" ry="11" fill="#fff" stroke="' + O + '" stroke-width="3.5"/>' +
        '<ellipse cx="120" cy="212" rx="13" ry="11" fill="#fff" stroke="' + O + '" stroke-width="3.5"/>' +
        '<path d="M62 132 L138 132 L148 208 L52 208 Z" fill="#fff" stroke="' + O + '" stroke-width="3.5" stroke-linejoin="round"/>' +
        '<path d="M100 146 V208" stroke="' + O + '" stroke-width="2.5"/>' +
        '<path d="M82 130 L100 148 L94 128 Z" fill="#fff" stroke="' + O + '" stroke-width="3" stroke-linejoin="round"/>' +
        '<path d="M118 130 L100 148 L106 128 Z" fill="#fff" stroke="' + O + '" stroke-width="3" stroke-linejoin="round"/>' +
        '<circle cx="109" cy="164" r="2.5" fill="' + O + '"/><circle cx="109" cy="176" r="2.5" fill="' + O + '"/>' +
        '<path d="M78 136 Q64 172 90 174" fill="none" stroke="#555" stroke-width="3" stroke-linecap="round"/>' +
        '<path d="M122 136 Q136 160 120 170" fill="none" stroke="#555" stroke-width="3" stroke-linecap="round"/>' +
        '<circle cx="92" cy="174" r="6.5" fill="#8A8F99" stroke="#333" stroke-width="2.5"/>' +
      '</g>' +
      /* kepala */
      '<g class="mk-head">' +
        '<path d="M50 80 L52 30 L92 52 Z" fill="#fff" stroke="' + O + '" stroke-width="3.5" stroke-linejoin="round"/>' +
        '<path d="M150 80 L148 30 L108 52 Z" fill="#fff" stroke="' + O + '" stroke-width="3.5" stroke-linejoin="round"/>' +
        '<path d="M58 62 L59 42 L78 51 Z" fill="#F9B8B8"/><path d="M142 62 L141 42 L122 51 Z" fill="#F9B8B8"/>' +
        '<ellipse cx="100" cy="90" rx="60" ry="48" fill="#fff" stroke="' + O + '" stroke-width="3.5"/>' +
        '<ellipse cx="66" cy="102" rx="11" ry="7" fill="#F9B8B8" opacity=".75"/>' +
        '<ellipse cx="134" cy="102" rx="11" ry="7" fill="#F9B8B8" opacity=".75"/>' +
        /* mata */
        '<g class="mk-eyes-n">' +
          '<circle cx="78" cy="88" r="5.5" fill="' + O + '"/><circle cx="122" cy="88" r="5.5" fill="' + O + '"/>' +
          '<circle cx="80" cy="86" r="1.8" fill="#fff"/><circle cx="124" cy="86" r="1.8" fill="#fff"/>' +
        '</g>' +
        '<g class="mk-eyes-h">' +
          '<path d="M69 91 Q78 80 87 91" fill="none" stroke="' + O + '" stroke-width="3.5" stroke-linecap="round"/>' +
          '<path d="M113 91 Q122 80 131 91" fill="none" stroke="' + O + '" stroke-width="3.5" stroke-linecap="round"/>' +
        '</g>' +
        /* hidung + mulut (tiap ekspresi beda) */
        '<ellipse cx="100" cy="95" rx="5" ry="3.5" fill="#F4A0A5"/>' +
        '<path class="mk-m-idle" d="M93 104 Q96.5 110 100 104 Q103.5 110 107 104" fill="none" stroke="#C9707A" stroke-width="2.4" stroke-linecap="round"/>' +
        '<path class="mk-m-happy" d="M92 103 Q100 118 108 103 Z" fill="#E57F8A" stroke="#C9707A" stroke-width="2" stroke-linejoin="round"/>' +
        '<path class="mk-m-sad" d="M93 111 Q100 103 107 111" fill="none" stroke="#C9707A" stroke-width="2.4" stroke-linecap="round"/>' +
        '<ellipse class="mk-m-think" cx="100" cy="106" rx="3.5" ry="4.5" fill="none" stroke="#C9707A" stroke-width="2.4"/>' +
        '<path class="mk-tear mk-x-sad" d="M133 98 Q137 106 133 111 Q129 106 133 98 Z" fill="#85B7EB"/>' +
        /* kumis */
        '<path d="M56 96 L34 92 M56 103 L34 107 M144 96 L166 92 M144 103 L166 107" stroke="' + O + '" stroke-width="2" stroke-linecap="round"/>' +
      '</g>' +
      /* tangan (grup sendiri biar bisa digerakkan) */
      '<g class="mk-arm mk-armL"><g class="mk-aw"><ellipse cx="56" cy="150" rx="9" ry="18" fill="#fff" stroke="' + O + '" stroke-width="3.5"/></g></g>' +
      '<g class="mk-arm mk-armR"><g class="mk-aw"><ellipse cx="144" cy="150" rx="9" ry="18" fill="#fff" stroke="' + O + '" stroke-width="3.5"/></g></g>' +
      /* gelembung "mikir..." */
      '<g class="mk-x-think">' +
        '<circle cx="156" cy="42" r="3" fill="#B4B2A9"/><circle cx="164" cy="33" r="4.5" fill="#B4B2A9"/>' +
        '<ellipse cx="177" cy="16" rx="18" ry="11" fill="#D3D1C7" stroke="#B4B2A9" stroke-width="1"/>' +
        '<circle class="mk-d1" cx="169" cy="16" r="2.4" fill="#5F5E5A"/><circle class="mk-d2" cx="177" cy="16" r="2.4" fill="#5F5E5A"/><circle class="mk-d3" cx="185" cy="16" r="2.4" fill="#5F5E5A"/>' +
      '</g>' +
    '</g>';

  var STATES = ['idle', 'think', 'happy', 'sad', 'wave'];

  /* opts: { face:true -> cuma wajah (buat bulatan avatar), state:'idle', react:true } */
  function svg(opts) {
    opts = opts || {};
    var face = !!opts.face;
    var state = STATES.indexOf(opts.state) > -1 ? opts.state : 'idle';
    var vb = face ? '20 8 160 160' : '0 0 200 230';
    return '<svg class="mk' + (face ? ' mk-face' : '') + ' mk-s-' + state + '"' +
      (opts.react ? ' data-react="1"' : '') +
      ' viewBox="' + vb + '" role="img" aria-label="Miko, kucing dokter pemandu MicroVita">' +
      BADAN + '</svg>';
  }

  function svgDari(el) {
    if (!el) return null;
    if (el.classList && el.classList.contains('mk')) return el;
    return el.querySelector ? el.querySelector('.mk') : null;
  }

  function setState(el, state) {
    var s = svgDari(el);
    if (!s || STATES.indexOf(state) < 0) return;
    STATES.forEach(function (x) { s.classList.remove('mk-s-' + x); });
    s.classList.add('mk-s-' + state);
  }

  function talk(el, on) {
    var s = svgDari(el);
    if (s) s.classList.toggle('mk-talk', !!on);
  }

  /* ganti ekspresi semua avatar yang bertanda data-react (tombol header + tombol melayang) */
  var timerReact = null;
  function react(state, ms) {
    ensureCSS();
    clearTimeout(timerReact);
    var list = document.querySelectorAll('.mk[data-react]');
    for (var i = 0; i < list.length; i++) setState(list[i], state);
    if (ms) {
      timerReact = setTimeout(function () {
        var l2 = document.querySelectorAll('.mk[data-react]');
        for (var j = 0; j < l2.length; j++) setState(l2[j], 'idle');
      }, ms);
    }
  }

  ensureCSS();
  window.MikoKarakter = { svg: svg, setState: setState, talk: talk, react: react, ensureCSS: ensureCSS, STATES: STATES };
  window.mikoReact = react; // jalan pintas: mikoReact('happy', 2500)
})();