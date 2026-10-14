/* PRESS START: the magazine design desk. A Word-style editor game for Grade 7, Unit 1. */
(function () {
  'use strict';
  const P = window.PS;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const app = $('#app');
  const KEY = 'pressStart.v1';
  const BOARD = new URLSearchParams(location.search).has('board');
  const reduced = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const clone = o => JSON.parse(JSON.stringify(o));
  const mmss = s => { s = Math.max(0, Math.ceil(s)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
  const hex = c => (P.COLOURS[c] || P.COLOURS.black).hex;
  const PAGE_W = 600, PAGE_H = 848, CM = PAGE_W / 21;
  let uid = 0;

  /* ================= State ================= */
  const fresh = () => ({ screen: 'start', name: '', entry: null, startedAt: 0, endedAt: 0, endReason: '', ti: 0, tStart: 0,
    score: 0, streak: 0, best: 0, warned: false, log: [], hint: {}, wrong: {}, D: P.freshDocs(), PR: P.freshPrint(), saved: false, saveMsg: '' });
  let S = fresh();
  try { const o = JSON.parse(localStorage.getItem(KEY) || 'null'); if (o && o.D && o.PR) S = Object.assign(fresh(), o); } catch (e) {}
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };
  // UI-only state (not saved)
  const U = { sel: null, tab: 'home', view: 'page', compare: false, armed: null, hintOpen: false, undo: [], busy: false, k: 1, pop: null };
  const T = () => P.TICKETS[S.ti];
  const pageIx = () => (T() ? T().page : 4);
  const doc = () => S.D[pageIx()];

  /* ================= Sound (optional) ================= */
  let soundOn = true, ac = null;
  try { soundOn = localStorage.getItem('psSound') !== 'off'; } catch (e) {}
  function tone(f, t0, d, type = 'sine', v = .06, f2) {
    const c = ac, o = c.createOscillator(), g = c.createGain(), t = c.currentTime + t0;
    o.type = type; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d);
    g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(v, t + .01); g.gain.exponentialRampToValueAtTime(.0001, t + d);
    o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + d + .03);
  }
  function noise(t0, d, v = .08, freq = 1800) {
    const c = ac, n = c.createBufferSource(), b = c.createBuffer(1, Math.max(1, c.sampleRate * d), c.sampleRate), x = b.getChannelData(0);
    for (let i = 0; i < x.length; i++) x[i] = (Math.random() * 2 - 1) * (1 - i / x.length);
    const f = c.createBiquadFilter(), g = c.createGain(), t = c.currentTime + t0;
    f.type = 'bandpass'; f.frequency.value = freq; g.gain.value = v; n.buffer = b; n.connect(f); f.connect(g); g.connect(c.destination); n.start(t);
  }
  function sfx(k) {
    if (!soundOn) return;
    try {
      ac = ac || new (window.AudioContext || window.webkitAudioContext)(); if (ac.state === 'suspended') ac.resume();
      if (k === 'click') noise(0, .03, .05, 3200);
      if (k === 'tick') tone(1400, 0, .05, 'triangle', .04);
      if (k === 'pick') { tone(660, 0, .07, 'triangle', .05); tone(990, .05, .08, 'triangle', .04); }
      if (k === 'spec') { tone(880, 0, .08, 'sine', .06); tone(1320, .06, .12, 'sine', .05); }
      if (k === 'wrong') { tone(180, 0, .16, 'square', .035); tone(140, .1, .18, 'square', .03); }
      if (k === 'stamp') { noise(0, .12, .35, 300); tone(90, 0, .18, 'sine', .2, 50); [784, 988, 1319].forEach((f, i) => tone(f, .16 + i * .07, .22, 'triangle', .05)); }
      if (k === 'page') noise(0, .25, .06, 2400);
      if (k === 'print') { for (let i = 0; i < 14; i++) noise(i * .11, .07, .12, 900 + (i % 3) * 300); }
      if (k === 'warn') { tone(1046, 0, .09, 'square', .03); tone(1046, .16, .09, 'square', .03); }
      if (k === 'end') [523, 659, 784, 1047].forEach((f, i) => tone(f, i * .1, .3, 'triangle', .06));
    } catch (e) {}
  }

  /* ================= Icons ================= */
  const I = {
    undo: '<path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>',
    left: '<path d="M4 6h16M4 10h10M4 14h16M4 18h10"/>', center: '<path d="M4 6h16M7 10h10M4 14h16M7 18h10"/>',
    right: '<path d="M4 6h16M10 10h10M4 14h16M10 18h10"/>', justify: '<path d="M4 6h16M4 10h16M4 14h16M4 18h16"/>',
    bullets: '<path d="M10 6h10M10 12h10M10 18h10"/><circle cx="5" cy="6" r="1.4" fill="currentColor" stroke="none"/><circle cx="5" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="5" cy="18" r="1.4" fill="currentColor" stroke="none"/>',
    numbering: '<path d="M10 6h10M10 12h10M10 18h10"/><path d="M4.2 4.6 5.6 4v4.2M4 10.6c.2-.7.8-1 1.4-1 .8 0 1.3.5 1.3 1.1 0 1-2.7 1.8-2.7 2.6h2.8M4.1 16.1h2.6l-1.3 1.5c.8 0 1.4.5 1.4 1.2 0 .7-.6 1.2-1.4 1.2-.6 0-1.1-.3-1.3-.8" stroke-width="1.3"/>',
    spacing: '<path d="M11 6h9M11 12h9M11 18h9M5 4v16M3 6.2 5 4l2 2.2M3 17.8 5 20l2-2.2"/>',
    table: '<rect x="3.5" y="4.5" width="17" height="15" rx="1.5"/><path d="M3.5 9.5h17M3.5 14.5h17M9.2 9.5v10M14.8 9.5v10"/>',
    picture: '<rect x="3.5" y="4.5" width="17" height="15" rx="2"/><circle cx="9" cy="10" r="1.8"/><path d="m20.5 16-5-5-9 8.5"/>',
    shapes: '<circle cx="9" cy="9" r="5.5"/><rect x="11" y="11" width="9.5" height="9.5" rx="1"/>',
    cube: '<path d="M12 2.8 20 7.3v9.4L12 21.2 4 16.7V7.3z"/><path d="m4 7.3 8 4.5 8-4.5M12 11.8v9.4"/>',
    columns: '<path d="M4 5h6.5M4 9h6.5M4 13h6.5M4 17h6.5M13.5 5H20M13.5 9H20M13.5 13H20M13.5 17H20"/>',
    border: '<rect x="3.5" y="3.5" width="17" height="17" rx="1"/><rect x="7.5" y="7.5" width="9" height="9" stroke-dasharray="2 2"/>',
    margins: '<rect x="4.5" y="3.5" width="15" height="17" rx="1"/><path d="M8 3.5v17M16 3.5v17" stroke-dasharray="2 2"/>',
    spell: '<path d="M3.5 13 6.5 5l3 8M4.6 10.4h3.8M12 13V5h2.6a2 2 0 0 1 0 4H12h3a2 2 0 0 1 0 4z"/><path d="m11 17.5 3 3 6.5-7"/>',
    count: '<path d="M5 6h14M5 12h14M5 18h8"/>',
    print: '<path d="M7 9V3.5h10V9"/><rect x="3.5" y="9" width="17" height="8" rx="2"/><rect x="7" y="14" width="10" height="6.5"/>',
    wrap: '<rect x="12.5" y="5" width="8" height="8" rx="1"/><path d="M3.5 5.5h6M3.5 9h6M3.5 12.5h6M3.5 16.5h17M3.5 20h17"/>',
    width: '<path d="M3.5 12h17M7 8.5 3.5 12 7 15.5M17 8.5l3.5 3.5-3.5 3.5"/>',
    fill: '<path d="m4.5 11 7-7 7.5 7.5-6.5 6.5z"/><path d="M4.5 11h14.5"/><path d="M20.5 15.5s1.5 2 1.5 3.1a1.5 1.5 0 0 1-3 0c0-1.1 1.5-3.1 1.5-3.1z" fill="currentColor"/>',
    text: '<path d="M5 6.5v-2h14v2M12 4.5v15M9 19.5h6"/>',
    turn: '<path d="M20 12a8 8 0 1 1-2.4-5.7"/><path d="M20 4v4.5h-4.5"/>',
    tilt: '<path d="M12 20a8 8 0 1 1 5.7-2.4"/><path d="M20 20h-4.5v-4.5"/>',
    reset: '<path d="M4 12a8 8 0 1 0 2.4-5.7L4 8.5"/><path d="M4 4v4.5h4.5"/>',
    shade: '<rect x="3.5" y="4.5" width="17" height="15" rx="1.5"/><path d="M3.5 4.5h17v5h-17z" fill="currentColor" opacity=".45"/><path d="M3.5 9.5h17M3.5 14.5h17M12 9.5v10"/>',
    borders: '<rect x="3.5" y="3.5" width="17" height="17"/><path d="M12 3.5v17M3.5 12h17"/>',
    rowAbove: '<rect x="3.5" y="11" width="17" height="9" rx="1"/><path d="M12 2.5v6M9 5.5h6"/>',
    rowBelow: '<rect x="3.5" y="4" width="17" height="9" rx="1"/><path d="M12 15.5v6M9 18.5h6"/>',
    colRight: '<rect x="3.5" y="3.5" width="9" height="17" rx="1"/><path d="M15.5 12h6M18.5 9v6"/>',
    rowDel: '<rect x="3.5" y="7.5" width="17" height="9" rx="1"/><path d="m9.5 10 5 4M14.5 10l-5 4"/>',
    hint: '<path d="M9.5 18h5M10.5 21h3M12 3a6 6 0 0 0-3.8 10.6c.7.6 1.3 1.6 1.3 2.4h5c0-.8.6-1.8 1.3-2.4A6 6 0 0 0 12 3z"/>',
    skip: '<path d="m5 5 7 7-7 7M13 5l7 7-7 7"/>',
    sound: '<path d="M4 9.5h3.5L12 5v14l-4.5-4.5H4z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/>',
    mute: '<path d="M4 9.5h3.5L12 5v14l-4.5-4.5H4z"/><path d="m16 9.5 5 5M21 9.5l-5 5"/>',
    close: '<path d="M6 6l12 12M18 6 6 18"/>', check: '<path d="m5 12.5 4.5 4.5L19 7"/>',
    compare: '<rect x="3.5" y="3.5" width="11" height="13" rx="1"/><rect x="9.5" y="7.5" width="11" height="13" rx="1" stroke-dasharray="2 2"/>',
    back: '<path d="M15 5l-7 7 7 7"/>', zoom: '<circle cx="10.5" cy="10.5" r="6"/><path d="m15 15 5.5 5.5M8 10.5h5M10.5 8v5"/>',
    board: '<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M7 6H4.5a3 3 0 0 0 3 4M17 6h2.5a3 3 0 0 1-3 4"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>', down: '<path d="m7 10 5 5 5-5"/>',
    minus: '<path d="M6 12h12"/>', plus: '<path d="M6 12h12M12 6v12"/>'
  };
  const ic = (n, cls = '') => `<svg class="ic ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${I[n]}</svg>`;

  /* ================= Page rendering ================= */
  const picSVG = id => { const u = 'pg' + (++uid); return P.PICS[id].svg.replace(/\{u\}/g, u); };
  const shapeSVG = (type, fill) => `<svg viewBox="0 0 100 100" aria-hidden="true"><path d="${P.SHAPES[type].d}" fill="${hex(fill)}" stroke="${fill === 'white' ? '#B9B4A8' : 'rgba(0,0,0,.18)'}" stroke-width="1.2" stroke-linejoin="round"/></svg>`;
  const PIPS = { 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8] };
  function faceHTML(model, n) {
    if (model === 'dice') return `<i class="fc dice-f">${Array.from({ length: 9 }, (_, k) => `<b class="${PIPS[n].includes(k) ? 'on' : ''}"></b>`).join('')}</i>`;
    if (model === 'crate') return '<i class="fc crate-f"></i>';
    return '<i class="fc block-f"><span>?</span></i>';
  }
  function cubeHTML(model, rx, ry, size) {
    const faces = ['front', 'back', 'right', 'left', 'top', 'bottom'], nums = [1, 6, 3, 4, 2, 5];
    return `<div class="m3d" style="--s:${size}px"><div class="cube" style="transform:rotateX(${rx}deg) rotateY(${ry}deg)">
      ${faces.map((f, i) => faceHTML(model, nums[i]).replace('class="fc', `class="fc ${f}`)).join('')}</div></div>`;
  }
  function fmtCSS(f, extra) {
    const st = { 'font-family': P.FONT_CSS[f.font] || P.FONT_CSS.Calibri, 'font-size': f.size + 'px', 'font-weight': f.bold ? 700 : 400,
      'font-style': f.italic ? 'italic' : 'normal', 'text-decoration': f.underline ? 'underline' : 'none', color: hex(f.color), 'text-align': f.align,
      'line-height': ((f.spacing || 1) * 1.22).toFixed(2) };
    return Object.entries(Object.assign(st, extra || {})).map(([k, v]) => `${k}:${v}`).join(';');
  }
  const kwCSS = k => [k.bold ? 'font-weight:700' : 'font-weight:400', k.italic ? 'font-style:italic' : 'font-style:normal', k.underline ? 'text-decoration:underline' : '', k.color ? 'color:' + hex(k.color) : ''].filter(Boolean).join(';');
  const selCls = (key, live, cls) => live ? ` data-sel="${key}" class="${cls}${U.sel === key ? ' is-sel' : ''}"` : ` class="${cls}"`;

  function block(d, key, live, tag = 'p', extraCls = '') {
    const b = d.blocks[key], f = b.fmt, h = f.style === 'h1' ? ' margin-top:.9em;' : f.style === 'h2' ? ' margin-top:.6em;' : '';
    return `<${tag}${selCls(key, live, 'blk ' + extraCls)} style="${fmtCSS(f)};${h}">${esc(b.text)}</${tag}>`;
  }
  function listHTML(d, live) {
    const b = d.blocks.list, f = b.fmt;
    const items = b.items.map(t => `<li>${esc(t)}</li>`).join('');
    const tag = f.list === 'number' ? 'ol' : 'ul';
    return `<${tag}${selCls('list', live, 'blk list list-' + f.list)} style="${fmtCSS(f)}">${items}</${tag}>`;
  }
  const runHead = (sec, n) => `<div class="run"><span>PRESS START</span><span>${sec}</span><span>${n}</span></div>`;

  function picHTML(pic, live) {
    const w = (pic.w * CM).toFixed(1), sel = live && U.sel === 'pic';
    const handles = sel ? '<i class="h nw" data-h="nw"></i><i class="h ne" data-h="ne"></i><i class="h sw" data-h="sw"></i><i class="h se" data-h="se"></i><span class="readout">' + pic.w.toFixed(1) + ' cm</span>' : '';
    return `<span${live ? ' data-sel="pic"' : ''} class="pic wrap-${pic.wrap}${sel ? ' is-sel' : ''}" style="width:${w}px">${picSVG(pic.id)}${handles}</span>`;
  }

  // One page as HTML. live = can be clicked and edited. d = that page's data.
  function pageHTML(i, d, live) {
    const cls = 'pg pg-' + P.PAGES[i].id + (live ? ' live' : '');
    if (i === 0) {
      const b = d.blocks.body, parts = b.text.split(b.kw);
      return `<div class="${cls}">
        <div class="mast">PRESS<em>START</em></div>
        <div class="issue"><span>ISSUE 07</span><span>THE SUMMER ISSUE</span><span>SCHOOL GAMING MAGAZINE</span></div>
        <div class="cover-art">${picSVG('city')}</div>
        ${block(d, 'kicker', live, 'p', 'kicker')}
        ${block(d, 'headline', live, 'p', 'headline')}
        <p${selCls('body', live, 'blk')} style="${fmtCSS(b.fmt)}">${esc(parts[0])}<span${selCls('kw', live, 'kw')} style="${kwCSS(b.kwFmt)}">${esc(b.kw)}</span>${esc(parts.slice(1).join(b.kw))}</p>
        <div class="cover-foot"><span>ALSO INSIDE</span> Our Top 4 games · Inside Neon Drift · Reader ratings</div></div>`;
    }
    if (i === 1) {
      return `<div class="${cls}">${d.border !== 'none' ? `<div class="pborder pb-${d.border}"></div>` : ''}${runHead('REVIEWS', '02')}
        <div class="flow" style="column-count:${d.cols}">${block(d, 'h_a', live)}${block(d, 'para', live)}${block(d, 'h_b', live)}${listHTML(d, live)}
        <p class="blk fixed-txt" style="${fmtCSS(d.blocks.para.fmt, { 'line-height': '1.4' })}">Next month: three new games from small studios that you have probably never heard of. Don’t miss them.</p></div></div>`;
    }
    if (i === 2) {
      const p = d.pic, b = d.blocks.para;
      const flowPic = p && ['inline', 'square', 'tight'].includes(p.wrap) ? picHTML(p, live) : '';
      const absPic = p && ['behind', 'front'].includes(p.wrap) ? picHTML(p, live) : '';
      const shape = d.shape ? `<div${live ? ' data-sel="shape"' : ''} class="shape${live && U.sel === 'shape' ? ' is-sel' : ''}">${shapeSVG(d.shape.type, d.shape.fill)}<span style="color:${['black', 'purple', 'wordblue', 'red', 'green'].includes(d.shape.fill) ? '#fff' : '#1A1A1A'}">${esc(d.shape.text)}</span></div>` : '';
      const model = d.model ? `<div${live ? ' data-sel="model"' : ''} class="model${live && U.sel === 'model' ? ' is-sel' : ''}">${cubeHTML(d.model.id, d.model.rx, d.model.ry, 96)}${live && U.sel === 'model' ? '<span class="readout">Turn ' + Math.round(d.model.ry) + '° · Tilt ' + Math.round(d.model.rx) + '°</span>' : ''}</div>` : '';
      return `<div class="${cls}">${runHead('FEATURE', '03')}${shape}${block(d, 'heading', live, 'h2')}
        <div class="anchor">${absPic}<p${selCls('para', live, 'blk')} style="${fmtCSS(b.fmt)}">${flowPic}${esc(b.text)}</p></div>
        <div class="model-row">${model}</div></div>`;
    }
    if (i === 3) {
      const t = d.table;
      let tb = '';
      if (t) {
        tb = `<table class="dt b-${t.borders}">${t.rows.map((row, r) => { const rf = t.rowFmt[r] || {};
          const st = [rf.shade && rf.shade !== 'none' ? 'background:' + hex(rf.shade) : '', rf.color ? 'color:' + hex(rf.color) : '', rf.bold ? 'font-weight:700' : '', rf.italic ? 'font-style:italic' : ''].filter(Boolean).join(';');
          return `<tr${live ? ` data-sel="row:${r}"` : ''} class="${live && U.sel === 'row:' + r ? 'is-sel' : ''}" style="${st}">${row.map((c, ci) =>
            `<td${live ? ` data-cell="${r}:${ci}"` : ''} class="${c.blank && !c.t ? 'empty' : ''}${c.blank ? ' fillable' : ''}">${esc(c.t) || '&nbsp;'}</td>`).join('')}</tr>`; }).join('')}</table>`;
      }
      return `<div class="${cls}">${runHead('RATINGS', '04')}${block(d, 'heading', live, 'h2')}${block(d, 'para', live)}${tb}
        <p class="note-small">Scores are out of 5. Every reader could vote once.</p></div>`;
    }
    const b = d.blocks.para;
    const html = b.text.split(/\{(\d)\}/).map((part, k) => {
      if (k % 2 === 0) return esc(part);
      const n = Number(part), m = P.SPELL[n];
      return d.fixed[n] ? `<span class="fixed-word">${m.right}</span>` : `<span${live ? ` data-sel="spell:${n}"` : ''} class="miss">${m.wrong}</span>`;
    }).join('');
    return `<div class="${cls}">${runHead('EDITOR’S LETTER', '05')}${block(d, 'heading', live, 'h2')}
      <p${selCls('para', live, 'blk')} style="${fmtCSS(b.fmt)}">${html}</p>
      <p class="sign" style="${fmtCSS(b.fmt)}">— Ms Rahaf, Editor-in-Chief</p>
      <div class="back-cover"><div class="mast small">PRESS<em>START</em></div><p>Made by the Grade 7 design team.</p></div></div>`;
  }
  // The brief: this page as it should look when the ticket is done.
  function briefDoc() { const D = clone(S.D), PR = clone(S.PR); T().apply(D, PR); return { D, PR }; }

  /* ================= Ticket checks ================= */
  const specState = () => T() ? T().specs.map(sp => !!sp.ok(S.D, S.PR)) : [];
  let lastOk = [];

  /* ================= Screens ================= */
  function go(screen) { S.screen = screen; save(); render(); }
  function render() {
    closePop();
    document.body.dataset.screen = S.screen;
    if (BOARD) return renderBoardScreen();
    ({ start: renderStart, play: renderPlay, results: renderResults })[S.screen === 'printing' ? 'results' : S.screen]();
  }

  /* ---------- Start ---------- */
  function renderStart() {
    app.innerHTML = `<section class="start">
      <div class="start-cover" aria-hidden="true">
        <div class="cv-mast">PRESS<em>START</em></div>
        <div class="cv-issue"><span>ISSUE 07</span><span>GRADE 7 DESIGN TEAM</span></div>
        <div class="cv-art">${picSVG('car')}</div>
        <div class="cv-lines"><b>THE<br>DEADLINE<br>ISSUE</b><span>5 pages · 11 jobs · 1 printed issue</span></div>
        <div class="cv-barcode"></div>
      </div>
      <div class="start-card">
        <p class="eyebrow">Ms Rahaf’s ICT class · Unit 1: Creating a document</p>
        <h1>You’re hired.</h1>
        <p class="lead">You are the new designer at <b>PRESS START</b>, the school gaming magazine. Ms Rahaf is the Editor-in-Chief. She sends you jobs. Make each page match her brief, then send the whole issue to the printer.</p>
        <ol class="how">
          <li><b>01</b><span>Read the job and look at the brief.</span></li>
          <li><b>02</b><span>Click the page, then use the toolbar.</span></li>
          <li><b>03</b><span>Match the brief to get it <em>APPROVED</em>.</span></li>
        </ol>
        <div class="topics">${P.PAGES.map(p => `<span><b>${p.num}</b>${esc(p.topic)}</span>`).join('')}</div>
        <form id="startForm" class="start-form" autocomplete="off">
          <label for="nameIn">Your name</label>
          <div class="row"><input id="nameIn" maxlength="20" placeholder="First name + last initial" required>
          <button class="btn primary" type="submit">Start the shift ${ic('skip')}</button></div>
          <p class="form-msg" id="startMsg" role="alert"></p>
        </form>
        <div class="start-foot">
          <button class="btn ghost sm" type="button" data-act="board">${ic('board')} Class leaderboard</button>
          <span class="fine">Faster + fewer hints = more points. One play per name.</span>
        </div>
      </div></section>`;
    $('#startForm').onsubmit = async e => {
      e.preventDefault();
      const name = $('#nameIn').value.replace(/[<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, 20), msg = $('#startMsg'), btn = e.target.querySelector('button');
      if (name.length < 2) { msg.textContent = 'Please type your name.'; return; }
      btn.disabled = true; msg.textContent = '';
      let entry = null;
      try { const d = await api('/api/scores', { method: 'POST', body: JSON.stringify({ name }) }); entry = { id: d.id, token: d.token }; }
      catch (err) { if (err.status === 409) { msg.textContent = 'That name has already played. Add your last initial, like “Sara K”.'; btn.disabled = false; return; } }
      S = fresh(); S.name = name; S.entry = entry; S.startedAt = Date.now(); S.tStart = Date.now();
      sfx('stamp'); go('play');
    };
    setTimeout(() => { const n = $('#nameIn'); n && n.focus({ preventScroll: true }); }, 60);
  }

  /* ---------- Play ---------- */
  function renderPlay() {
    if (!T()) return endGame('print');
    app.innerHTML = `<section class="desk">
      <header class="hud">
        <div class="hud-brand"><span class="logo">PRESS<em>START</em></span><span class="who">${esc(S.name)}</span></div>
        <ol class="pages" id="hudPages"></ol>
        <div class="hud-stats">
          <span class="stat"><small>SCORE</small><b id="score">0</b></span>
          <span class="stat combo" id="combo" hidden></span>
          <button class="iconbtn" type="button" data-act="sound" id="soundBtn" aria-label="Sound"></button>
        </div>
      </header>
      <div class="work">
        <div class="editor" id="editor">
          <div class="titlebar"><span class="app">Draft</span><span class="file" id="fileName"></span><span class="sel-chip" id="selChip"></span></div>
          <div class="tabs" id="tabs" role="tablist"></div>
          <div class="ribbon" id="ribbon"></div>
          <div class="canvas" id="canvas"></div>
          <div class="status" id="status"></div>
        </div>
        <aside class="docket" id="docket"></aside>
      </div></section>`;
    updateSound(); renderAll(true); scrollToJob();
    setTimeout(() => { if (S.screen === 'play' && !U.busy) checkTicket(true); }, 400);
  }
  function renderAll(enter) { renderHud(); renderTabs(); renderRibbon(); renderCanvas(enter); renderDocket(); }
  function renderHud() {
    const pi = pageIx();
    const el = $('#hudPages'); if (!el) return;
    el.innerHTML = P.PAGES.map((p, i) => { const tix = P.TICKETS.map((t, k) => t.page === i ? k : -1).filter(k => k >= 0), done = tix.filter(k => k < S.ti).length;
      return `<li class="${i < pi ? 'done' : i === pi ? 'now' : ''}"><b>${p.num}</b><span>${esc(p.topic)}</span><i>${tix.map(k => `<em class="${k < S.ti ? (S.log[k] && S.log[k].skipped ? 'skip' : 'ok') : k === S.ti ? 'cur' : ''}"></em>`).join('')}</i>${done === tix.length ? ic('check', 'ok') : ''}</li>`; }).join('');
    $('#score').textContent = S.score;
    const c = $('#combo'); if (c) { c.hidden = S.streak < 2; c.innerHTML = `<small>COMBO</small><b>×${S.streak}</b>`; }
    const fn = $('#fileName'); if (fn) fn.textContent = `Issue07_Page${P.PAGES[pi].num}.draft`;
  }

  /* ---------- Ribbon ---------- */
  const CTX = { picture: 'Picture Format', shape: 'Shape Format', model: '3D Model', tdesign: 'Table Design', tlayout: 'Table Layout' };
  function ctxTabs() {
    const s = U.sel || '';
    if (s === 'pic') return ['picture']; if (s === 'shape') return ['shape']; if (s === 'model') return ['model'];
    if (s.startsWith('row:')) return ['tdesign', 'tlayout'];
    return [];
  }
  function renderTabs() {
    const tabs = [['file', 'File'], ['home', 'Home'], ['insert', 'Insert'], ['design', 'Design'], ['layout', 'Layout'], ['review', 'Review']];
    const ctx = ctxTabs();
    if (!['file', 'home', 'insert', 'design', 'layout', 'review'].includes(U.tab) && !ctx.includes(U.tab)) U.tab = 'home';
    $('#tabs').innerHTML = `<button class="qa" type="button" data-act="undo" title="Undo (Ctrl+Z)" aria-label="Undo" ${U.undo.length ? '' : 'disabled'}>${ic('undo')}</button>` +
      tabs.map(([k, l]) => `<button type="button" role="tab" class="tab${k === 'file' ? ' file' : ''}" data-tab="${k}" aria-selected="${U.view === 'print' ? k === 'file' : U.tab === k}">${l}</button>`).join('') +
      ctx.map(k => `<button type="button" role="tab" class="tab ctx" data-tab="${k}" aria-selected="${U.view !== 'print' && U.tab === k}">${CTX[k]}</button>`).join('');
  }
  const sel = () => U.sel || '';
  const textTarget = () => { const s = sel(); if (!s) return null; if (s === 'kw') return { kind: 'kw' }; if (s.startsWith('row:')) return { kind: 'row', r: Number(s.slice(4)) };
    const b = doc().blocks && doc().blocks[s]; return b ? { kind: 'block', b } : null; };
  const curFmt = () => { const t = textTarget(); if (!t) return null; if (t.kind === 'block') return t.b.fmt;
    if (t.kind === 'kw') { const b = doc().blocks.body; return Object.assign({}, b.fmt, b.kwFmt); }
    const rf = (doc().table && doc().table.rowFmt[t.r]) || {}; return { font: 'Calibri', size: 11, bold: !!rf.bold, italic: !!rf.italic, underline: false, color: rf.color || 'black', align: 'left' }; };
  const paraFmt = () => { const s = sel(); if (s === 'kw') return doc().blocks.body.fmt; const t = textTarget(); return t && t.kind === 'block' ? t.b.fmt : null; };
  const btn = (ctl, label, icon, on, title, extra = '') => `<button type="button" class="rb${on ? ' on' : ''}" data-ctl="${ctl}" aria-pressed="${!!on}" title="${title || label}" ${extra}>${icon ? ic(icon) : ''}<span>${label}</span></button>`;
  const big = (ctl, label, icon, title, extra = '') => `<button type="button" class="rb big" data-ctl="${ctl}" title="${title || label}" ${extra}>${ic(icon)}<span>${label}</span>${ic('down', 'dd')}</button>`;
  const group = (name, inner) => `<div class="grp"><div class="grp-in">${inner}</div><div class="grp-name">${name}</div></div>`;
  function renderRibbon() {
    const r = $('#ribbon'); if (!r) return;
    const f = curFmt(), pf = paraFmt(), d = doc();
    let h = '';
    if (U.tab === 'home' || U.tab === 'file') {
      const fs = f ? f.font : '', sz = f ? f.size : '';
      h += group('Font', `<div class="col">
          <div class="rowc"><select data-ctl="font" aria-label="Font" ${f ? '' : 'disabled'}>${f ? '' : '<option>Font</option>'}${P.FONTS.map(x => `<option value="${x}" style="font-family:${P.FONT_CSS[x]}" ${x === fs ? 'selected' : ''}>${x}</option>`).join('')}</select>
          <select data-ctl="size" class="sz" aria-label="Font size" ${f ? '' : 'disabled'}>${f ? '' : '<option>Size</option>'}${P.SIZES.map(x => `<option value="${x}" ${x === sz ? 'selected' : ''}>${x}</option>`).join('')}</select></div>
          <div class="rowc">${btn('bold', 'B', '', f && f.bold, 'Bold (Ctrl+B)', 'style="font-weight:800"')}${btn('italic', 'I', '', f && f.italic, 'Italic (Ctrl+I)', 'style="font-style:italic;font-family:Georgia,serif"')}${btn('underline', 'U', '', f && f.underline, 'Underline (Ctrl+U)', 'style="text-decoration:underline"')}
          <button type="button" class="rb colorbtn" data-ctl="color" title="Font Color"><span class="A">A</span><i style="background:${f ? hex(f.color) : '#E03A2F'}"></i>${ic('down', 'dd')}</button></div></div>`);
      h += group('Paragraph', `<div class="col">
          <div class="rowc">${btn('bullets', '', 'bullets', pf && pf.list === 'bullet', 'Bullets')}${btn('numbering', '', 'numbering', pf && pf.list === 'number', 'Numbering')}
          <label class="spc" title="Line Spacing">${ic('spacing')}<select data-ctl="spacing" aria-label="Line spacing" ${pf ? '' : 'disabled'}>${P.SPACINGS.map(x => `<option value="${x}" ${pf && pf.spacing === x ? 'selected' : ''}>${x.toFixed(x % 1 ? (x * 100 % 10 ? 2 : 1) : 1)}</option>`).join('')}</select></label></div>
          <div class="rowc">${['left', 'center', 'right', 'justify'].map(a => btn('align-' + a, '', a, pf && pf.align === a, { left: 'Align Left (Ctrl+L)', center: 'Center (Ctrl+E)', right: 'Align Right (Ctrl+R)', justify: 'Justify (Ctrl+J)' }[a])).join('')}</div></div>`);
      h += group('Styles', `<div class="styles">${Object.entries(P.STYLES).map(([k, s]) => `<button type="button" class="sty sty-${k}${pf && pf.style === k ? ' on' : ''}" data-ctl="style-${k}" aria-pressed="${!!(pf && pf.style === k)}"><span>AaBb</span><small>${s.name}</small></button>`).join('')}</div>`);
    } else if (U.tab === 'insert') {
      h += group('Tables', big('table', 'Table', 'table'));
      h += group('Illustrations', big('pics', 'Pictures', 'picture') + big('shapes', 'Shapes', 'shapes') + big('models', '3D Models', 'cube'));
    } else if (U.tab === 'design') {
      h += group('Page Background', big('border', 'Page Borders', 'border'));
    } else if (U.tab === 'layout') {
      h += group('Page Setup', big('columns', 'Columns', 'columns') + big('margins', 'Margins', 'margins'));
    } else if (U.tab === 'review') {
      h += group('Proofing', big('spell', 'Spelling & Grammar', 'spell') + big('count', 'Word Count', 'count'));
    } else if (U.tab === 'picture' && d.pic) {
      h += group('Arrange', big('wrap', 'Wrap Text', 'wrap'));
      h += group('Size', `<div class="stepper" data-ctl="width"><span class="lbl">${ic('width')} Width</span><button type="button" data-act="w-" aria-label="Narrower">${ic('minus')}</button><output>${d.pic.w.toFixed(1)} cm</output><button type="button" data-act="w+" aria-label="Wider">${ic('plus')}</button></div>`);
      h += group('Picture', `<button type="button" class="rb" data-act="del-obj">${ic('close')}<span>Delete</span></button>`);
    } else if (U.tab === 'shape' && d.shape) {
      h += group('Shape Styles', big('fill', 'Shape Fill', 'fill'));
      h += group('Text', `<div class="stext" data-ctl="stext"><span class="lbl">${ic('text')} Shape Text</span><input id="stextIn" maxlength="12" value="${esc(d.shape.text)}" placeholder="Type here" aria-label="Shape text"><button type="button" class="rb" data-act="stext">${ic('check')}<span>Add</span></button></div>`);
      h += group('Shape', `<button type="button" class="rb" data-act="del-obj">${ic('close')}<span>Delete</span></button>`);
    } else if (U.tab === 'model' && d.model) {
      h += group('Rotate', `<div class="col"><div class="stepper" data-ctl="turn"><span class="lbl">${ic('turn')} Turn</span><button type="button" data-act="ry-" aria-label="Turn left">${ic('minus')}</button><output>${Math.round(d.model.ry)}°</output><button type="button" data-act="ry+" aria-label="Turn right">${ic('plus')}</button></div>
        <div class="stepper" data-ctl="tilt"><span class="lbl">${ic('tilt')} Tilt</span><button type="button" data-act="rx-" aria-label="Tilt down">${ic('minus')}</button><output>${Math.round(d.model.rx)}°</output><button type="button" data-act="rx+" aria-label="Tilt up">${ic('plus')}</button></div></div>`);
      h += group('Adjust', `<button type="button" class="rb" data-act="m-reset">${ic('reset')}<span>Reset</span></button><button type="button" class="rb" data-act="del-obj">${ic('close')}<span>Delete</span></button>`);
      h += `<p class="tip">Tip: drag the model on the page to spin it.</p>`;
    } else if (U.tab === 'tdesign' && d.table) {
      h += group('Table Styles', big('shade', 'Shading', 'shade') + big('borders', 'Borders', 'borders'));
    } else if (U.tab === 'tlayout' && d.table) {
      h += group('Rows & Columns', `<button type="button" class="rb" data-ctl="rowabove" data-act="row-above">${ic('rowAbove')}<span>Insert Above</span></button><button type="button" class="rb" data-ctl="rowbelow" data-act="row-below">${ic('rowBelow')}<span>Insert Below</span></button><button type="button" class="rb" data-act="col-right">${ic('colRight')}<span>Insert Right</span></button><button type="button" class="rb" data-act="row-del">${ic('rowDel')}<span>Delete Row</span></button>`);
      h += group('Table', `<button type="button" class="rb" data-act="del-table">${ic('close')}<span>Delete Table</span></button>`);
    }
    r.innerHTML = h;
    applyHintGlow();
  }

  /* ---------- Canvas (page or print view) ---------- */
  function renderCanvas(enter) {
    const c = $('#canvas'); if (!c) return;
    if (U.view === 'print') { c.innerHTML = printViewHTML(); fitPrint(); return; }
    const pi = pageIx();
    let ghost = '';
    if (U.compare && !T().print) { const b = briefDoc(); ghost = `<div class="onion" aria-hidden="true">${pageHTML(pi, b.D[pi], false)}</div>`; }
    c.innerHTML = `<div class="stage${enter ? ' enter' : ''}" id="stage"><div class="scaler" id="scaler">${pageHTML(pi, doc(), true)}${ghost}</div></div>`;
    fitPage(); renderStatus();
    if (U.armed) $$('#canvas td.fillable').forEach(td => td.classList.add('drop'));
  }
  function fitPage() {
    const c = $('#canvas'), st = $('#stage'), sc = $('#scaler'); if (!c || !st || !sc) return;
    const w = c.clientWidth - (innerWidth < 700 ? 16 : 48);
    U.k = clamp(w / PAGE_W, .3, 1.05);
    const h = Math.max(PAGE_H, $('.pg', sc) ? $('.pg', sc).offsetHeight : PAGE_H);
    sc.style.transform = `scale(${U.k})`; st.style.width = PAGE_W * U.k + 'px'; st.style.height = h * U.k + 'px';
  }
  function renderStatus() {
    const s = $('#status'); if (!s) return;
    const words = $('#canvas .pg') ? ($('#canvas .pg').innerText.match(/[A-Za-z’']+/g) || []).length : 0;
    s.innerHTML = `<span>Page ${P.PAGES[pageIx()].num} of 05</span><span>${words} words</span><span>${U.sel ? 'Selected: ' + esc(selName(U.sel)) : 'Click something on the page to select it'}</span><span>${Math.round(U.k * 100)}%</span>`;
    const chip = $('#selChip'); if (chip) { chip.textContent = U.sel ? selName(U.sel) : ''; chip.hidden = !U.sel; }
  }
  const SEL_NAMES = { kicker: 'Kicker', headline: 'Headline', body: 'Cover text', kw: '“Neon Drift”', h_a: 'Heading', h_b: 'Heading', para: 'Paragraph',
    list: 'List', heading: 'Heading', pic: 'Picture', shape: 'Shape', model: '3D model' };
  const selName = s => s.startsWith('row:') ? (s === 'row:0' ? 'Table: top row' : 'Table: row ' + (Number(s.slice(4)) + 1)) : SEL_NAMES[s] || s;

  /* ---------- Print view (File › Print) ---------- */
  function printViewHTML() {
    const PR = S.PR, pi = pageIx();
    const seg = (ctl, key, opts) => `<div class="pset" data-ctl="${ctl}" role="group">${opts.map(([v, l]) => `<button type="button" data-act="pr" data-k="${key}" data-v="${v}" aria-pressed="${PR[key] === v}">${l}</button>`).join('')}</div>`;
    return `<div class="printview">
      <div class="pv-side">
        <button type="button" class="pv-back" data-act="pv-back">${ic('back')} Back to the page</button>
        <h3>Print</h3>
        <div class="pv-copies" data-ctl="copies"><span>Copies</span><button type="button" data-act="cp-" aria-label="Fewer copies">${ic('minus')}</button><input id="copiesIn" inputmode="numeric" value="${PR.copies}" aria-label="Copies"><button type="button" data-act="cp+" aria-label="More copies">${ic('plus')}</button></div>
        <button type="button" class="btn primary wide" data-act="do-print">${ic('print')} Print</button>
        <p class="pv-printer"><b>Printer</b> Library Printer · Ready</p>
        <h4>Settings</h4>
        <label>Pages</label>${seg('pages', 'pages', [['all', 'Print All Pages'], ['current', 'Current Page']])}
        <label>Orientation</label>${seg('orient', 'orient', [['portrait', 'Portrait'], ['landscape', 'Landscape']])}
        <label>Paper</label>${seg('paper', 'paper', [['Letter', 'Letter'], ['A4', 'A4'], ['A3', 'A3']])}
        <label>Margins</label>${seg('margins', 'margins', [['normal', 'Normal'], ['narrow', 'Narrow'], ['wide', 'Wide']])}
      </div>
      <div class="pv-prev"><div class="pv-sheet ${PR.orient}" id="pvSheet"><div class="pv-scaler">${pageHTML(pi, doc(), false)}</div></div>
        <p class="pv-cap">${PR.pages === 'all' ? '5 pages' : '1 page'} · ${PR.paper} · ${PR.orient === 'portrait' ? 'Portrait' : 'Landscape'} · ${PR.copies} ${PR.copies === 1 ? 'copy' : 'copies'}</p></div></div>`;
  }
  function fitPrint() {
    const sh = $('#pvSheet'); if (!sh) return;
    const box = $('.pv-prev'); const maxW = Math.min(box.clientWidth - 30, 420), land = S.PR.orient === 'landscape';
    const ratio = { Letter: 279 / 216, A4: 297 / 210, A3: 420 / 297 }[S.PR.paper];
    const w = land ? maxW : Math.min(maxW, 330), h = land ? w / ratio : w * ratio;
    sh.style.width = w + 'px'; sh.style.height = h + 'px';
    const k = land ? h / PAGE_H : w / PAGE_W; const sc = $('.pv-scaler', sh); sc.style.transform = `scale(${k})`;
    sc.style.left = land ? (w - PAGE_W * k) / 2 + 'px' : '0px';
  }

  /* ---------- Docket (the job ticket) ---------- */
  function renderDocket() {
    const t = T(), dk = $('#docket'); if (!dk || !t) return;
    const ok = specState(), n = ok.filter(Boolean).length, pg = P.PAGES[t.page];
    const hintUsed = !!S.hint[S.ti], secs = (Date.now() - S.tStart) / 1000;
    const brief = t.print ? printBriefHTML() : `<div class="mock" style="--k:${t.chips ? .3 : .36}">${pageHTML(t.page, briefDoc().D[t.page], false)}</div>`;
    dk.innerHTML = `<div class="dk-tear"></div>
      <div class="dk-head"><span>JOB ${String(S.ti + 1).padStart(2, '0')}/${P.TICKETS.length}</span><span>PAGE ${pg.num} · ${esc(pg.topic.toUpperCase())}</span></div>
      <h2 class="dk-title">${esc(t.title)}</h2>
      <div class="dk-msg"><span class="av" aria-hidden="true">R</span><div><b>Ms Rahaf</b> <small>Editor-in-Chief</small><p>${esc(t.msg)}</p></div></div>
      ${t.tip ? `<p class="dk-tip">${t.tip}</p>` : ''}
      ${t.chips ? chipsHTML() : ''}
      <div class="dk-brief"><div class="dk-lbl"><span>THE BRIEF</span>${t.print ? '' : `<span class="dk-brief-btns"><button type="button" class="mini${U.compare ? ' on' : ''}" data-act="compare" aria-pressed="${U.compare}">${ic('compare')} Compare</button><button type="button" class="mini" data-act="zoom">${ic('zoom')} Zoom</button></span>`}</div>
        <button type="button" class="dk-mock" data-act="zoom" aria-label="Zoom into the brief" ${t.print ? 'tabindex="-1"' : ''}>${brief}</button></div>
      <div class="dk-lbl"><span>TO DO</span><span class="match">${n}/${ok.length}</span></div>
      <ol class="specs">${t.specs.map((sp, k) => `<li class="${ok[k] ? 'ok' : ''}"><i>${ok[k] ? ic('check') : ''}</i><span>${sp.t}</span>${sp.n ? `<em>${esc(sp.n(S.D) || '')}</em>` : ''}</li>`).join('')}</ol>
      <div class="meter" aria-hidden="true">${ok.map(o => `<i class="${o ? 'on' : ''}"></i>`).join('')}</div>
      ${t.print ? `<button type="button" class="btn primary wide" data-act="open-print">${ic('print')} Open File › Print</button>` : ''}
      <div class="dk-hint" id="dkHint" ${U.hintOpen ? '' : 'hidden'}>${hintHTML()}</div>
      <div class="dk-actions">
        <button type="button" class="btn ghost sm" data-act="hint" aria-expanded="${U.hintOpen}">${ic('hint')} ${hintUsed ? (U.hintOpen ? 'Hide hint' : 'Show hint') : 'Show me how <em>−30</em>'}</button>
        <button type="button" class="btn ghost sm" data-act="skip" id="skipBtn" ${hintUsed || secs >= 45 ? '' : 'hidden'}>${ic('skip')} Skip job</button>
      </div>`;
    lastOk = ok;
  }
  function printBriefHTML() {
    return `<div class="pbrief"><div class="pb-sheet"><span>A4</span></div><dl><dt>Paper</dt><dd>A4</dd><dt>Orientation</dt><dd>Portrait</dd><dt>Copies</dt><dd>30</dd><dt>Pages</dt><dd>All</dd></dl></div>`;
  }
  function chipsHTML() {
    const t = doc().table;
    return `<div class="chips-box"><div class="dk-lbl"><span>MS RAHAF’S NOTES</span></div>
      <ul class="clues">${P.CLUES.map(c => `<li>${esc(c)}</li>`).join('')}</ul>
      <p class="chip-help">${t ? 'Drag a note onto an empty cell (or tap a note, then tap a cell).' : 'Insert the table first: Insert › Table.'}</p>
      <div class="chips">${P.CHIPS.map(c => `<button type="button" class="chip${U.armed === c ? ' armed' : ''}" data-chip="${esc(c)}" ${t ? '' : 'disabled'}>${esc(c)}</button>`).join('')}</div></div>`;
  }
  function firstUnmet() { const ok = specState(); const k = ok.indexOf(false); return k < 0 ? null : T().specs[k]; }
  const SEL_HINT = { headline: 'the headline', body: 'the cover text (not “Neon Drift”)', kw: 'the words “Neon Drift”', h_a: 'each heading, one at a time', para: 'the paragraph',
    list: 'the list of 4 games', pic: 'the picture', shape: 'the shape', model: 'the 3D model', 'row:3': 'the last row of the table', 'row:0': 'the top row of the table', spell: 'a word with a red wavy line' };
  function hintHTML() {
    const sp = firstUnmet(); if (!sp) return '<p>All done! Waiting for approval…</p>';
    const steps = [];
    if (sp.sel) steps.push(`Click <b>${SEL_HINT[sp.sel] || sp.sel}</b> on the page.`);
    steps.push(`Go to <span class="path">${sp.path.map(p => `<span class="pc">${esc(p)}</span>`).join('<span class="sep">›</span>')}</span>`);
    return `<p class="dk-lbl"><span>HOW TO DO IT</span></p><ol>${steps.map(s => `<li>${s}</li>`).join('')}</ol><p class="real">Same place in real Microsoft Word.</p>`;
  }
  function applyHintGlow() {
    $$('.glow').forEach(e => e.classList.remove('glow'));
    if (!U.hintOpen || !T()) return;
    const sp = firstUnmet(); if (!sp) return;
    $$(`[data-tab="${sp.tab}"]`).forEach(e => e.classList.add('glow'));
    if (sp.tab === U.tab || (sp.tab === 'file' && U.view === 'print')) $$(`[data-ctl="${sp.ctl}"]`).forEach(e => e.classList.add('glow'));
    if (sp.ctl === 'chips') $$('.chips .chip').forEach(e => e.classList.add('glow'));
    if (sp.sel && U.sel !== sp.sel && !(sp.sel === 'h_a' && (U.sel === 'h_b'))) {
      const target = sp.sel === 'spell' ? $('#canvas .miss') : sp.sel === 'h_a' ? $(`#canvas [data-sel="${doc().blocks.h_a.fmt.style === 'h1' ? 'h_b' : 'h_a'}"]`) : $(`#canvas [data-sel="${sp.sel}"]`);
      target && target.classList.add('glow');
    }
  }

  // Scroll the page so the part this job is about is in view
  function scrollToJob() {
    const sp = T() && T().specs.find(x => x.sel); const c = $('#canvas'); if (!c) return;
    const key = sp ? (sp.sel === 'spell' ? null : sp.sel) : null;
    const el = (key && $(`#canvas [data-sel="${key}"]`)) || (T() && T().page === 2 ? $('#canvas .anchor') : T() && T().page === 3 ? $('#canvas [data-sel="para"]') : null);
    if (!el) { c.scrollTop = 0; return; }
    const top = el.getBoundingClientRect().top - c.getBoundingClientRect().top + c.scrollTop - 90;
    c.scrollTo({ top: Math.max(0, top), behavior: reduced ? 'auto' : 'smooth' });
  }

  /* ================= Editing ================= */
  function snapshot() { U.undo.push(JSON.stringify({ D: S.D, PR: S.PR })); if (U.undo.length > 40) U.undo.shift(); }
  function undo() {
    const s = U.undo.pop(); if (!s) return;
    const o = JSON.parse(s); S.D = o.D; S.PR = o.PR; save(); sfx('click');
    if (U.sel && !$(`#canvas [data-sel="${U.sel}"]`)) U.sel = null;
    afterEdit(true);
  }
  // Call after every change: redraw and check the job.
  function afterEdit(full) {
    save();
    if (full !== false) { renderTabs(); renderRibbon(); }
    renderCanvas(); renderDocket(); applyHintGlow();
    checkTicket();
  }
  function needText() { toast('First click the text on the page that you want to change.'); flashCanvas(); sfx('wrong'); }
  function flashCanvas() { const c = $('#canvas'); if (c) { c.classList.remove('flash'); void c.offsetWidth; c.classList.add('flash'); } }

  function setFmt(key, val) {
    const t = textTarget(); if (!t) return needText();
    snapshot();
    if (t.kind === 'block') t.b.fmt[key] = val;
    else if (t.kind === 'kw') { const b = doc().blocks.body; if (['bold', 'italic', 'underline', 'color'].includes(key)) b.kwFmt[key] = val; else b.fmt[key] = val; }
    else { const rf = doc().table.rowFmt[t.r]; if (['bold', 'italic', 'color'].includes(key)) rf[key] = val; else { U.undo.pop(); toast('In a table you can use B, I and Font Color here. Shading is in Table Design.'); return; } }
    sfx('click'); afterEdit();
  }
  function toggleFmt(key) { const f = curFmt(); if (!f) return needText(); setFmt(key, !f[key]); }
  function setPara(key, val) {
    const f = paraFmt(); if (!f) { const s = sel(); if (s.startsWith('row:')) { toast('Select a paragraph, not the table.'); sfx('wrong'); return; } return needText(); }
    snapshot(); f[key] = val; sfx('click'); afterEdit();
  }
  function setStyle(k) {
    const f = paraFmt(); if (!f) return needText();
    snapshot(); Object.assign(f, P.STYLES[k].fmt, { style: k, italic: false, underline: false }); sfx('click'); afterEdit();
  }
  function pageOnly(i, what) {
    if (pageIx() === i) return true;
    toast(`This page doesn’t need ${what}. Look at the brief.`); sfx('wrong'); return false;
  }
  function insert(kind, val) {
    const d = doc();
    if (kind === 'pic') { if (!pageOnly(2, 'a picture')) return; snapshot(); d.pic = { id: val, w: 10, wrap: 'inline' }; U.sel = 'pic'; U.tab = 'picture'; }
    if (kind === 'shape') { if (!pageOnly(2, 'a shape')) return; snapshot(); d.shape = { type: val, fill: 'wordblue', text: '' }; U.sel = 'shape'; U.tab = 'shape'; }
    if (kind === 'model') { if (!pageOnly(2, 'a 3D model')) return; snapshot(); d.model = { id: val, rx: 0, ry: 0 }; U.sel = 'model'; U.tab = 'model'; }
    if (kind === 'table') { if (!pageOnly(3, 'a table')) return; snapshot(); const [c, r] = val; d.table = P.makeTable(r, c, true); U.sel = null; toast(`${c} × ${r} table inserted.`); }
    sfx('pick'); closePop(); afterEdit();
  }

  /* ---------- Popovers ---------- */
  const pop = () => $('#pop');
  function closePop() { const p = pop(); if (p) { p.hidden = true; p.innerHTML = ''; } U.pop = null; $$('[data-ctl].open').forEach(e => e.classList.remove('open')); }
  function openPop(anchor, kind, html) {
    const p = pop(); if (U.pop === kind) return closePop();
    closePop(); U.pop = kind; p.innerHTML = html; p.hidden = false; anchor.classList.add('open');
    const a = anchor.getBoundingClientRect(), w = p.offsetWidth, h = p.offsetHeight;
    let x = clamp(a.left, 8, innerWidth - w - 8), y = a.bottom + 6;
    if (y + h > innerHeight - 8) y = Math.max(8, a.top - h - 6);
    p.style.left = x + 'px'; p.style.top = y + 'px';
    const f = p.querySelector('button:not([disabled]), input'); f && f.focus({ preventScroll: true });
  }
  const swatches = (act, list, cur) => `<div class="sw-grid">${list.map(c => c === 'none'
    ? `<button type="button" class="sw none${cur === 'none' || !cur ? ' on' : ''}" data-act="${act}" data-v="none" title="No Color"><i></i><span>No Color</span></button>`
    : `<button type="button" class="sw${cur === c ? ' on' : ''}" data-act="${act}" data-v="${c}" title="${P.COLOURS[c].name}"><i style="background:${hex(c)}"></i><span>${P.COLOURS[c].name}</span></button>`).join('')}</div>`;
  function ctlClick(ctl, el) {
    const d = doc();
    if (ctl === 'bold' || ctl === 'italic' || ctl === 'underline') return toggleFmt(ctl);
    if (ctl.startsWith('align-')) return setPara('align', ctl.slice(6));
    if (ctl === 'bullets' || ctl === 'numbering') { const f = paraFmt(); if (!f) return needText(); const v = ctl === 'bullets' ? 'bullet' : 'number'; return setPara('list', f.list === v ? 'none' : v); }
    if (ctl.startsWith('style-')) return setStyle(ctl.slice(6));
    if (ctl === 'color') { if (!curFmt()) return needText(); return openPop(el, 'color', `<p class="pop-t">Font Color</p>${swatches('fcolor', P.FONT_COLOURS, curFmt().color)}`); }
    if (ctl === 'table') {
      let g = ''; for (let r = 1; r <= 6; r++) for (let c = 1; c <= 7; c++) g += `<button type="button" class="tg" data-act="tbl" data-c="${c}" data-r="${r}" aria-label="${c} by ${r} table"></button>`;
      return openPop(el, 'table', `<p class="pop-t" id="tgLabel">Insert Table</p><div class="tgrid">${g}</div><p class="pop-n">Columns × Rows</p>`);
    }
    if (ctl === 'pics') return openPop(el, 'pics', `<p class="pop-t">Pictures</p><div class="gal">${Object.entries(P.PICS).map(([k, p]) => `<button type="button" class="gi" data-act="ins-pic" data-v="${k}"><span class="gthumb">${picSVG(k)}</span><span>${p.name}</span></button>`).join('')}</div>`);
    if (ctl === 'shapes') return openPop(el, 'shapes', `<p class="pop-t">Shapes</p><div class="gal shapes">${Object.entries(P.SHAPES).map(([k, s]) => `<button type="button" class="gi" data-act="ins-shape" data-v="${k}" title="${s.name}"><span class="gshape">${shapeSVG(k, 'wordblue')}</span><span>${s.name}</span></button>`).join('')}</div>`);
    if (ctl === 'models') return openPop(el, 'models', `<p class="pop-t">3D Models</p><div class="gal models">${Object.entries(P.MODELS).map(([k, m]) => `<button type="button" class="gi" data-act="ins-model" data-v="${k}"><span class="gmodel">${cubeHTML(k, -22, 34, 46)}</span><span>${m.name}</span></button>`).join('')}</div>`);
    if (ctl === 'border') return openPop(el, 'border', `<p class="pop-t">Page Borders</p><div class="opts">${Object.entries(P.BORDERS).map(([k, l]) => `<button type="button" class="opt${(d.border || 'none') === k ? ' on' : ''}" data-act="pborder" data-v="${k}"><i class="bprev pb-${k}"></i>${l}</button>`).join('')}</div>`);
    if (ctl === 'columns') return openPop(el, 'columns', `<p class="pop-t">Columns</p><div class="opts">${[[1, 'One'], [2, 'Two'], [3, 'Three']].map(([n, l]) => `<button type="button" class="opt${(d.cols || 1) === n ? ' on' : ''}" data-act="cols" data-v="${n}"><i class="cprev">${'<b></b>'.repeat(n)}</i>${l}</button>`).join('')}</div>`);
    if (ctl === 'margins') return openPop(el, 'margins', `<p class="pop-t">Margins</p><div class="opts">${['Normal', 'Narrow', 'Wide'].map(l => `<button type="button" class="opt" data-act="margins" data-v="${l}">${ic('margins')}${l}</button>`).join('')}</div>`);
    if (ctl === 'spell') return openSpellPane(el);
    if (ctl === 'count') { const w = ($('#canvas .pg').innerText.match(/[A-Za-z’']+/g) || []).length; return toast(`Word Count: ${w} words on this page.`); }
    if (ctl === 'wrap') return openPop(el, 'wrap', `<p class="pop-t">Wrap Text</p><div class="opts">${Object.entries(P.WRAPS).map(([k, l]) => `<button type="button" class="opt${d.pic.wrap === k ? ' on' : ''}" data-act="wrap" data-v="${k}"><i class="wprev wp-${k}"><b></b></i>${l}</button>`).join('')}</div>`);
    if (ctl === 'fill') return openPop(el, 'fill', `<p class="pop-t">Shape Fill</p>${swatches('sfill', P.FILL_COLOURS, d.shape.fill)}`);
    if (ctl === 'shade') { if (!sel().startsWith('row:')) return toast('Click a row of the table first.'); return openPop(el, 'shade', `<p class="pop-t">Shading</p>${swatches('shade', P.SHADE_COLOURS, d.table.rowFmt[Number(sel().slice(4))].shade)}`); }
    if (ctl === 'borders') return openPop(el, 'borders', `<p class="pop-t">Borders</p><div class="opts">${Object.entries(P.TABLE_BORDERS).map(([k, l]) => `<button type="button" class="opt${d.table.borders === k ? ' on' : ''}" data-act="tborders" data-v="${k}"><i class="tbprev tb-${k}"></i>${l}</button>`).join('')}</div>`);
  }

  /* ---------- Spelling ---------- */
  function openSpellPane(el) {
    if (pageIx() !== 4) { toast('Spelling & Grammar: no mistakes found on this page.'); return; }
    const d = doc(), n = d.fixed.indexOf(false);
    if (n < 0) { closePop(); return toast('Spelling & Grammar: the check is complete. No mistakes!'); }
    const m = P.SPELL[n];
    openPop(el || $('[data-ctl="spell"]'), 'spell', `<p class="pop-t">Spelling</p><p class="sp-word">Not in dictionary: <s>${m.wrong}</s></p><p class="pop-n">Suggestions</p>
      <div class="sp-opts">${m.opts.map(o => `<button type="button" data-act="spfix" data-i="${n}" data-v="${esc(o)}">${esc(o)}</button>`).join('')}</div>`);
  }
  function wordMenu(n, el) {
    const m = P.SPELL[n];
    openPop(el, 'word' + n, `<p class="pop-t">Spelling: <s>${m.wrong}</s></p><div class="sp-opts">${m.opts.map(o => `<button type="button" data-act="spfix" data-i="${n}" data-v="${esc(o)}">${esc(o)}</button>`).join('')}</div><button type="button" class="sp-ignore" data-act="close-pop">Ignore</button>`);
  }
  function fixWord(n, v, fromPane) {
    const m = P.SPELL[n], d = doc();
    if (v === m.right) { snapshot(); d.fixed[n] = true; sfx('pick'); closePop(); afterEdit(); if (fromPane && d.fixed.includes(false) && !U.busy) setTimeout(() => openSpellPane(), 120); }
    else { S.wrong[S.ti] = (S.wrong[S.ti] || 0) + 1; save(); sfx('wrong'); toast(`“${v}” is not right. −${P.SCORE.wrong} points. Try again.`); const b = pop().querySelector(`[data-v="${CSS.escape(v)}"]`); if (b) { b.classList.add('nope'); b.disabled = true; } }
  }

  /* ================= Ticket flow ================= */
  function checkTicket(atStart) {
    if (U.busy || S.screen !== 'play' || !T()) return;
    const ok = specState();
    if (!atStart) ok.forEach((o, k) => { if (o && !lastOk[k]) sfx('spec'); });
    lastOk = ok;
    if (!T().print && ok.every(Boolean)) approve(false);
  }
  function approve(skipped) {
    if (U.busy) return;
    U.busy = true; closePop();
    const secs = (Date.now() - S.tStart) / 1000, sc = P.SCORE, hint = !!S.hint[S.ti], wrong = (S.wrong[S.ti] || 0) * sc.wrong;
    let rec;
    if (skipped) { S.streak = 0; rec = { pts: 0, skipped: true, secs: Math.round(secs) }; }
    else {
      const speed = Math.round(sc.speedMax * clamp((sc.speedZero - secs) / (sc.speedZero - sc.speedFull), 0, 1));
      S.streak = hint ? 0 : S.streak + 1; S.best = Math.max(S.best, S.streak);
      const combo = hint ? 0 : Math.min(sc.comboMax, (S.streak - 1) * sc.comboStep);
      const pts = Math.max(0, sc.base + speed + combo - (hint ? sc.hint : 0) - wrong);
      rec = { pts, base: sc.base, speed, combo, hint: hint ? sc.hint : 0, wrong, secs: Math.round(secs) };
    }
    S.log[S.ti] = rec; S.score += rec.pts; save();
    renderHud();
    if (!skipped) stamp(rec); else toast('Ms Rahaf finished that job for you. No points this time.');
    const wasPrint = T().print;
    setTimeout(() => {
      S.ti++; S.tStart = Date.now(); U.sel = null; U.compare = false; U.hintOpen = false; U.armed = null; U.undo = [];
      U.view = 'page'; U.tab = 'home'; U.busy = false; save();
      if (wasPrint || !T()) return endGame('print');
      const newPage = P.TICKETS[S.ti - 1].page !== T().page;
      if (newPage) sfx('page');
      renderAll(newPage); scrollToJob();
      setTimeout(() => checkTicket(true), 300);
    }, skipped ? 900 : 1700);
  }
  function stamp(rec) {
    sfx('stamp');
    const c = $('#canvas'); if (!c) return;
    const el = document.createElement('div'); el.className = 'stamp-wrap'; el.style.top = c.scrollTop + 'px'; el.style.height = c.clientHeight + 'px';
    el.innerHTML = `<div class="stamp">APPROVED</div><div class="receipt">
      <p><span>Job done</span><b>+${rec.base}</b></p>${rec.speed ? `<p><span>Speed</span><b>+${rec.speed}</b></p>` : ''}${rec.combo ? `<p><span>Combo ×${S.streak}</span><b>+${rec.combo}</b></p>` : ''}
      ${rec.hint ? `<p class="neg"><span>Hint</span><b>−${rec.hint}</b></p>` : ''}${rec.wrong ? `<p class="neg"><span>Wrong picks</span><b>−${rec.wrong}</b></p>` : ''}
      <p class="tot"><span>Total</span><b>+${rec.pts}</b></p></div>`;
    c.appendChild(el);
  }
  function useHint() {
    if (!S.hint[S.ti]) { S.hint[S.ti] = true; save(); toast(`Hint used: −${P.SCORE.hint} points on this job.`); U.hintOpen = true; }
    else U.hintOpen = !U.hintOpen;
    const sp = firstUnmet();
    if (U.hintOpen && sp) {
      if (sp.tab === 'file') { U.view = 'print'; }
      else if (sp.tab && (!CTX[sp.tab] || ctxTabs().includes(sp.tab))) U.tab = sp.tab;
      renderTabs(); renderRibbon(); renderCanvas();
    }
    sfx('click'); renderDocket(); applyHintGlow();
    const hb = $('#dkHint'); if (U.hintOpen && hb) hb.scrollIntoView({ block: 'nearest', behavior: reduced ? 'auto' : 'smooth' });
  }
  function skip() {
    if (U.busy) return;
    if (!confirm('Skip this job? You get 0 points for it, and Ms Rahaf finishes it for you.')) return;
    T().apply(S.D, S.PR); save(); renderCanvas(); approve(true);
  }

  /* ================= Game end ================= */
  function endGame(reason) {
    if (S.screen !== 'play') return;
    U.busy = true;
    S.endReason = reason; S.endedAt = Date.now(); S.screen = 'printing'; save();
    saveScore();
    const ov = document.createElement('div'); ov.className = 'press'; ov.setAttribute('role', 'status');
    const pages = P.PAGES.map((p, i) => `<div class="press-pg" style="--i:${i}"><div class="pp-scale">${pageHTML(i, S.D[i], false)}</div></div>`).join('');
    ov.innerHTML = `<div class="press-in"><p class="eyebrow">Sending to Library Printer</p><h2>Printing ${S.PR.copies} copies…</h2><div class="printer"><div class="slot"></div><div class="tray">${pages}</div></div></div>`;
    document.body.appendChild(ov);
    sfx('print');
    setTimeout(() => { ov.classList.add('out'); setTimeout(() => { ov.remove(); U.busy = false; go('results'); sfx('end'); }, reduced ? 0 : 400); }, reduced ? 600 : 3200);
  }
  const approvedCount = () => S.log.filter(r => r && !r.skipped).length;
  const usedSeconds = () => Math.round(clamp(((S.endedAt || Date.now()) - S.startedAt) / 1000, 0, P.MAX_SECONDS));
  const rankFor = s => P.RANKS.find(r => s >= r.min);

  /* ---------- Results ---------- */
  function renderResults() {
    const rk = rankFor(S.score), ok = approvedCount();
    app.innerHTML = `<section class="results">
      <div class="spread" aria-hidden="true">${P.PAGES.map((p, i) => `<div class="sp-pg" style="--i:${i}"><div class="pp-scale">${pageHTML(i, S.D[i], false)}</div></div>`).join('')}</div>
      <div class="res-card">
        <p class="eyebrow">Issue 07 is printed</p>
        <h1>Designed by <span>${esc(S.name)}</span></h1>
        <div class="res-score"><b>${S.score}</b><span>points</span></div>
        <p class="rank">${rk.name}</p>
        <dl class="res-stats"><div><dt>Jobs approved</dt><dd>${ok}/${P.TICKETS.length}</dd></div><div><dt>Time</dt><dd>${mmss(usedSeconds())}</dd></div><div><dt>Best combo</dt><dd>×${S.best}</dd></div></dl>
        <p class="save-msg" id="saveMsg">${esc(S.saveMsg || 'Saving your score…')}</p>
        <div class="row"><button class="btn primary" type="button" data-act="board">${ic('board')} Class leaderboard</button><button class="btn ghost" type="button" data-act="new-game">${ic('reset')} New game</button></div>
        <p class="fine">Ms Rahaf’s prizes: 1st +5 marks, a sweet treat and 10 min free time · 2nd +3 marks and 10 min · 3rd 10 min free time.</p>
      </div></section>`;
    if (!S.saved) saveScore();
  }
  let saving = false;
  async function saveScore(retried) {
    if (S.saved || saving || !S.name) return;
    saving = true;
    const body = { points: clamp(S.score, 0, 2500), seconds: usedSeconds(), approved: approvedCount() };
    try {
      if (!S.entry) { const d = await api('/api/scores', { method: 'POST', body: JSON.stringify({ name: S.name }) }); S.entry = { id: d.id, token: d.token }; }
      await api('/api/scores', { method: 'PUT', body: JSON.stringify(Object.assign({}, S.entry, body)) });
      S.saved = true; S.saveMsg = 'Score saved to the class leaderboard.';
    } catch (e) {
      S.saveMsg = e.status === 409 ? 'This name was already used, so the score could not be saved. Ask Ms Rahaf.' : 'Could not save yet. Check the internet; it will try again.';
      if (e.status !== 409 && e.status !== 404) setTimeout(saveScore, 8000);
      if (e.status === 404 && !retried) { S.entry = null; saving = false; return saveScore(true); } // the board was reset: save under the name again
      if (e.status === 404) { S.saved = true; S.saveMsg = 'Your score was already saved.'; }
    }
    saving = false; save();
    const m = $('#saveMsg'); if (m) m.textContent = S.saveMsg;
  }

  /* ================= Leaderboard ================= */
  async function api(path, opts = {}) {
    const r = await fetch(path, Object.assign({ headers: { 'Content-Type': 'application/json' }, cache: 'no-store' }, opts));
    let d = {}; try { d = await r.json(); } catch (e) {}
    if (!r.ok) { const err = new Error(d.error || r.status); err.status = r.status; throw err; }
    return d;
  }
  const B = { rows: [], error: '', pin: '' };
  async function loadBoard() { try { B.rows = (await api('/api/scores')).scores || []; B.error = ''; } catch (e) { B.error = 'Could not load the leaderboard. Check the internet.'; } }
  function boardHTML(bigScreen) {
    const done = B.rows.filter(r => r.finished), playing = B.rows.filter(r => !r.finished);
    const podium = done.slice(0, 3);
    return `<div class="lb${bigScreen ? ' big' : ''}">
      ${B.error ? `<p class="form-msg">${B.error}</p>` : ''}
      <div class="podium">${[1, 0, 2].map(i => podium[i] ? `<div class="pod p${i + 1}"><span class="place">${i + 1}</span><b>${esc(podium[i].name)}</b><em>${podium[i].points}</em><small>${mmss(podium[i].seconds)} · ${podium[i].approved}/11 jobs</small><p>${P.PRIZES[i].text}</p></div>` : `<div class="pod p${i + 1} empty"><span class="place">${i + 1}</span><b>—</b></div>`).join('')}</div>
      <ol class="lb-list" start="4">${done.slice(3).map(r => `<li><b>${esc(r.name)}</b><span>${r.points}</span><small>${mmss(r.seconds)}</small>${B.pin ? `<button type="button" class="x" data-rm="${r.id}" aria-label="Remove ${esc(r.name)}">${ic('close')}</button>` : ''}</li>`).join('')}</ol>
      ${playing.length ? `<p class="playing"><b>Still designing:</b> ${playing.map(r => esc(r.name)).join(', ')}</p>` : ''}
      ${!B.rows.length && !B.error ? '<p class="fine">No scores yet. Be the first!</p>' : ''}
      ${B.pin ? `<div class="rm-top">${podium.map(r => `<button type="button" class="btn ghost sm" data-rm="${r.id}">Remove ${esc(r.name)}</button>`).join('')}${playing.map(r => `<button type="button" class="btn ghost sm" data-rm="${r.id}">Remove ${esc(r.name)}</button>`).join('')}</div>` : ''}
    </div>`;
  }
  async function openBoard() {
    openModal(`<div class="modal-head"><h2>Class leaderboard</h2><button type="button" class="iconbtn" data-act="close-modal" aria-label="Close">${ic('close')}</button></div><div id="lbBody"><p class="fine">Loading…</p></div>${teacherHTML()}`);
    await loadBoard(); const b = $('#lbBody'); if (b) b.innerHTML = boardHTML(false);
  }
  function teacherHTML() {
    return `<details class="teacher"><summary>Teacher tools</summary>
      <form id="pinForm" class="row"><input id="pinIn" type="password" inputmode="numeric" placeholder="Teacher PIN" autocomplete="off" aria-label="Teacher PIN"><button class="btn ghost sm" type="submit">Unlock</button></form>
      <p class="form-msg" id="pinMsg"></p>
      <div id="tTools" ${B.pin ? '' : 'hidden'}><button type="button" class="btn ghost sm danger" data-act="clear-board">Clear the whole board</button><p class="fine">Remove a name to let that student play again.</p></div></details>`;
  }
  async function renderBoardScreen() {
    document.body.dataset.screen = 'board';
    await loadBoard();
    app.innerHTML = `<section class="bigboard"><header><span class="logo">PRESS<em>START</em></span><div><p class="eyebrow">Ms Rahaf’s class · Unit 1: Creating a document</p><h1>Class leaderboard</h1></div></header>${boardHTML(true)}</section>`;
  }
  async function teacherAction(action, extra) {
    try { await api('/api/teacher', { method: 'POST', body: JSON.stringify(Object.assign({ pin: B.pin, action }, extra || {})) }); return true; }
    catch (e) { const m = $('#pinMsg'); if (m) m.textContent = e.status === 401 ? 'Wrong PIN.' : 'Could not reach the server.'; if (e.status === 401) B.pin = ''; return false; }
  }

  /* ---------- Modal + toast ---------- */
  function openModal(html, cls) { const m = $('#modal'); $('#modalCard').innerHTML = html; $('#modalCard').className = 'modal-card ' + (cls || ''); m.hidden = false; const f = $('#modalCard').querySelector('button, input'); f && f.focus({ preventScroll: true }); }
  function closeModal() { $('#modal').hidden = true; $('#modalCard').innerHTML = ''; }
  let toastT;
  function toast(msg) { const el = $('#toast'); el.textContent = msg; el.hidden = false; el.classList.remove('in'); void el.offsetWidth; el.classList.add('in'); clearTimeout(toastT); toastT = setTimeout(() => { el.hidden = true; }, 2800); }
  function updateSound() { const b = $('#soundBtn'); if (b) { b.innerHTML = ic(soundOn ? 'sound' : 'mute'); b.setAttribute('aria-pressed', String(soundOn)); b.title = soundOn ? 'Sound on' : 'Sound off'; } }

  /* ================= Events ================= */
  document.addEventListener('click', async e => {
    const t = e.target;
    if (t.id === 'modal') return closeModal();
    if (U.pop && !t.closest('#pop') && !t.closest('[data-ctl].open') && !t.closest('.miss')) closePop();
    const rm = t.closest('[data-rm]');
    if (rm && B.pin) { if (await teacherAction('remove', { id: Number(rm.dataset.rm) })) { await loadBoard(); const b = $('#lbBody'); if (b) b.innerHTML = boardHTML(false); } return; }
    const tab = t.closest('[data-tab]');
    if (tab && S.screen === 'play' && !U.busy) {
      sfx('click'); closePop();
      if (tab.dataset.tab === 'file') { U.view = 'print'; renderTabs(); renderRibbon(); renderCanvas(); applyHintGlow(); return; }
      U.tab = tab.dataset.tab; if (U.view === 'print') { U.view = 'page'; renderCanvas(); }
      renderTabs(); renderRibbon(); return;
    }
    const ctl = t.closest('button[data-ctl], .rb[data-ctl]');
    if (ctl && !ctl.dataset.act && S.screen === 'play' && !U.busy && ctl.tagName === 'BUTTON') { ctlClick(ctl.dataset.ctl, ctl); return; }
    const chip = t.closest('[data-chip]');
    if (chip && !chip.disabled && !U.busy) { if (chipDrag.moved) return; U.armed = U.armed === chip.dataset.chip ? null : chip.dataset.chip; sfx('click'); renderDocket(); $$('#canvas td.fillable').forEach(td => td.classList.toggle('drop', !!U.armed)); applyHintGlow(); return; }
    const cell = t.closest('[data-cell]');
    if (cell && U.armed && S.screen === 'play' && !U.busy) { placeChip(U.armed, cell); return; }
    const miss = t.closest('.miss[data-sel]');
    if (miss && S.screen === 'play' && !U.busy) { const n = Number(miss.dataset.sel.slice(6)); U.sel = 'para'; renderStatus(); wordMenu(n, miss); return; }
    const s = t.closest('#canvas [data-sel]');
    if (s && S.screen === 'play' && !U.busy && U.view === 'page') {
      if (dragJustEnded) return;
      const k = s.dataset.sel; if (U.sel !== k) { U.sel = k; sfx('tick');
        if (k === 'pic' && !['picture'].includes(U.tab)) U.tab = 'picture'; if (k === 'shape') U.tab = 'shape'; if (k === 'model') U.tab = 'model';
        renderTabs(); renderRibbon(); renderCanvas(); applyHintGlow(); }
      return;
    }
    if (t.closest('#canvas') && !t.closest('[data-sel]') && S.screen === 'play' && U.view === 'page' && U.sel && !dragJustEnded) { U.sel = null; renderTabs(); renderRibbon(); renderCanvas(); applyHintGlow(); return; }
    const a = t.closest('[data-act]'); if (!a) return;
    const act = a.dataset.act, v = a.dataset.v, d = S.screen === 'play' ? doc() : null;
    if (act === 'board') return openBoard();
    if (act === 'new-game') { if (!confirm('Start a new game? You need a name that has not played yet.')) return; S = fresh(); save(); U.undo = []; return go('start'); }
    if (act === 'close-modal') return closeModal();
    if (act === 'sound') { soundOn = !soundOn; try { localStorage.setItem('psSound', soundOn ? 'on' : 'off'); } catch (er) {} updateSound(); sfx('click'); return; }
    if (act === 'clear-board') { if (!confirm('Clear the whole leaderboard? This cannot be undone.')) return; if (await teacherAction('clear')) { await loadBoard(); const b = $('#lbBody'); if (b) b.innerHTML = boardHTML(false); } return; }
    if (S.screen !== 'play' || U.busy) return;
    if (act === 'undo') return undo();
    if (act === 'hint') return useHint();
    if (act === 'skip') return skip();
    if (act === 'compare') { U.compare = !U.compare; sfx('click'); renderCanvas(); renderDocket(); applyHintGlow(); return; }
    if (act === 'zoom') { if (T().print) return; const b = briefDoc(); openModal(`<div class="modal-head"><h2>The brief</h2><button type="button" class="iconbtn" data-act="close-modal" aria-label="Close">${ic('close')}</button></div><div class="zoom-brief"><div class="zb-scale">${pageHTML(T().page, b.D[T().page], false)}</div></div>`, 'wide'); fitZoom(); return; }
    if (act === 'close-pop') return closePop();
    if (act === 'open-print') { U.view = 'print'; sfx('click'); renderTabs(); renderRibbon(); renderCanvas(); applyHintGlow(); return; }
    if (act === 'pv-back') { U.view = 'page'; renderTabs(); renderRibbon(); renderCanvas(); applyHintGlow(); return; }
    if (act === 'fcolor') { closePop(); return setFmt('color', v); }
    if (act === 'tbl') return insert('table', [Number(a.dataset.c), Number(a.dataset.r)]);
    if (act === 'ins-pic') return insert('pic', v);
    if (act === 'ins-shape') return insert('shape', v);
    if (act === 'ins-model') return insert('model', v);
    if (act === 'pborder') { if (!pageOnly(1, 'a page border')) return closePop(); snapshot(); d.border = v; closePop(); sfx('click'); return afterEdit(); }
    if (act === 'cols') { if (!pageOnly(1, 'columns')) return closePop(); snapshot(); d.cols = Number(v); closePop(); sfx('click'); return afterEdit(); }
    if (act === 'margins') { closePop(); return toast(`Margins: ${v}. (This job doesn’t need margins.)`); }
    if (act === 'wrap') { snapshot(); d.pic.wrap = v; closePop(); sfx('click'); return afterEdit(); }
    if (act === 'w-' || act === 'w+') { snapshot(); d.pic.w = clamp(Math.round((d.pic.w + (act === 'w+' ? .5 : -.5)) * 10) / 10, 2, 14); sfx('click'); return afterEdit(); }
    if (act === 'sfill') { snapshot(); d.shape.fill = v; closePop(); sfx('click'); return afterEdit(); }
    if (act === 'stext') { snapshot(); d.shape.text = ($('#stextIn').value || '').slice(0, 12); sfx('click'); return afterEdit(); }
    if (/^r[xy][-+]$/.test(act)) { snapshot(); const k = act[1] === 'x' ? 'rx' : 'ry', dv = act[2] === '+' ? 5 : -5; d.model[k] = k === 'rx' ? clamp(d.model.rx + dv, -85, 85) : normDeg(d.model.ry + dv); sfx('click'); return afterEdit(); }
    if (act === 'm-reset') { snapshot(); d.model.rx = 0; d.model.ry = 0; sfx('click'); return afterEdit(); }
    if (act === 'del-obj') { snapshot(); const k = U.sel; if (k === 'pic') d.pic = null; if (k === 'shape') d.shape = null; if (k === 'model') d.model = null; U.sel = null; sfx('click'); return afterEdit(); }
    if (act === 'shade') { snapshot(); d.table.rowFmt[Number(sel().slice(4))].shade = v; closePop(); sfx('click'); return afterEdit(); }
    if (act === 'tborders') { snapshot(); d.table.borders = v; closePop(); sfx('click'); return afterEdit(); }
    if (['row-above', 'row-below', 'col-right', 'row-del', 'del-table'].includes(act)) return tableOp(act);
    if (act === 'spfix') return fixWord(Number(a.dataset.i), v, U.pop === 'spell');
    if (act === 'pr') { snapshot(); const k = a.dataset.k; S.PR[k] = v; sfx('click'); return afterEdit(); }
    if (act === 'cp-' || act === 'cp+') { snapshot(); S.PR.copies = clamp(S.PR.copies + (act === 'cp+' ? 1 : -1), 1, 99); sfx('click'); return afterEdit(); }
    if (act === 'do-print') return doPrint();
  });
  const normDeg = x => { x = ((x + 180) % 360 + 360) % 360 - 180; return Math.round(x); };
  function tableOp(act) {
    const d = doc(), t = d.table, s = sel();
    if (act === 'del-table') { if (!confirm('Delete the whole table?')) return; snapshot(); d.table = null; U.sel = null; sfx('click'); return afterEdit(); }
    if (!s.startsWith('row:')) return toast('Click a row of the table first.');
    const r = Number(s.slice(4)), cols = t.rows[0].length, blank = () => Array.from({ length: cols }, () => ({ t: '', blank: true }));
    snapshot();
    if (act === 'row-above') { t.rows.splice(r, 0, blank()); t.rowFmt.splice(r, 0, {}); U.sel = 'row:' + r; }
    if (act === 'row-below') { t.rows.splice(r + 1, 0, blank()); t.rowFmt.splice(r + 1, 0, {}); U.sel = 'row:' + (r + 1); }
    if (act === 'col-right') { t.rows.forEach(row => row.push({ t: '', blank: true })); }
    if (act === 'row-del') { if (t.rows.length === 1) { d.table = null; U.sel = null; } else { t.rows.splice(r, 1); t.rowFmt.splice(r, 1); U.sel = null; } }
    sfx('click'); afterEdit();
  }
  function placeChip(val, cell) {
    const [r, c] = cell.dataset.cell.split(':').map(Number), t = doc().table, cl = t && t.rows[r] && t.rows[r][c];
    if (!cl) return;
    if (!cl.blank) { toast('That cell already has data. Use an empty cell.'); sfx('wrong'); return; }
    snapshot(); cl.t = val; U.armed = null; sfx('pick'); afterEdit();
  }
  function doPrint() {
    const t = T();
    if (!t.print) { toast('Printing comes at the very end. First finish the job on this page.'); return; }
    const ok = specState();
    if (!ok.every(Boolean)) { sfx('wrong'); toast('Wait! Some print settings don’t match the job yet.'); $('.printview') && $('.printview').classList.add('shake'); setTimeout(() => $('.printview') && $('.printview').classList.remove('shake'), 500); return; }
    approve(false);
  }
  function fitZoom() { const z = $('.zoom-brief'); if (!z) return; const k = Math.min(1, (z.clientWidth - 8) / PAGE_W); const sc = $('.zb-scale', z); sc.style.transform = `scale(${k})`; z.style.height = $('.pg', sc).offsetHeight * k + 'px'; }

  // Form controls in the ribbon / print view
  document.addEventListener('change', e => {
    const t = e.target; if (S.screen !== 'play' || U.busy) return;
    const c = t.dataset.ctl;
    if (c === 'font') return setFmt('font', t.value);
    if (c === 'size') return setFmt('size', Number(t.value));
    if (c === 'spacing') return setPara('spacing', Number(t.value));
    if (t.id === 'copiesIn') { snapshot(); S.PR.copies = clamp(parseInt(t.value, 10) || 1, 1, 99); afterEdit(); }
  });
  document.addEventListener('input', e => {
    if (e.target.id === 'copiesIn' && S.screen === 'play') { const v = parseInt(e.target.value, 10); if (v >= 1 && v <= 99) { S.PR.copies = v; save(); renderDocket(); checkTicket(); } }
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { if (!$('#modal').hidden) return closeModal(); if (U.pop) return closePop(); if (U.armed) { U.armed = null; renderDocket(); renderCanvas(); } }
    if (e.target.id === 'stextIn' && e.key === 'Enter') { e.preventDefault(); $('[data-act="stext"]').click(); return; }
    if (S.screen !== 'play' || U.busy || !(e.ctrlKey || e.metaKey)) return;
    const typing = /INPUT|TEXTAREA|SELECT/.test(e.target.tagName);
    const k = e.key.toLowerCase();
    const map = { b: () => toggleFmt('bold'), i: () => toggleFmt('italic'), u: () => toggleFmt('underline'), e: () => setPara('align', 'center'), l: () => setPara('align', 'left'), r: () => setPara('align', 'right'), j: () => setPara('align', 'justify'), z: undo, p: () => { U.view = 'print'; renderTabs(); renderRibbon(); renderCanvas(); applyHintGlow(); } };
    if (map[k] && !(typing && k !== 'p')) { e.preventDefault(); map[k](); }
  });
  // Table grid preview while hovering
  document.addEventListener('pointerover', e => {
    const g = e.target.closest('.tg'); if (!g) return;
    const c = +g.dataset.c, r = +g.dataset.r;
    $$('.tg').forEach(x => x.classList.toggle('on', +x.dataset.c <= c && +x.dataset.r <= r));
    const l = $('#tgLabel'); if (l) l.textContent = `${c} × ${r} Table`;
  });

  /* ---------- Dragging: picture handles, 3D model, notes ---------- */
  let drag = null, dragJustEnded = false;
  const chipDrag = { moved: false };
  document.addEventListener('pointerdown', e => {
    if (S.screen !== 'play' || U.busy) return;
    const h = e.target.closest('.pic .h');
    const m = e.target.closest('#canvas .model');
    const chip = e.target.closest('[data-chip]');
    if (h) {
      e.preventDefault(); const d = doc(); snapshot();
      drag = { kind: 'pic', x: e.clientX, w: d.pic.w, sign: h.dataset.h.includes('e') ? 1 : -1, el: h.closest('.pic') };
    } else if (m && U.view === 'page') {
      e.preventDefault(); const d = doc(); if (U.sel !== 'model') { U.sel = 'model'; U.tab = 'model'; renderTabs(); renderRibbon(); }
      snapshot(); drag = { kind: 'model', x: e.clientX, y: e.clientY, rx: d.model.rx, ry: d.model.ry };
    } else if (chip && !chip.disabled) {
      drag = { kind: 'chip', x: e.clientX, y: e.clientY, val: chip.dataset.chip, ghost: null }; chipDrag.moved = false;
    } else return;
    try { e.target.setPointerCapture && e.target.setPointerCapture(e.pointerId); } catch (er) {}
  });
  document.addEventListener('pointermove', e => {
    if (!drag) return;
    const d = doc();
    if (drag.kind === 'pic') {
      const dx = (e.clientX - drag.x) / U.k * drag.sign;
      d.pic.w = clamp(Math.round((drag.w + dx / CM) * 10) / 10, 2, 14);
      const el = $('#canvas .pic'); if (el) { el.style.width = (d.pic.w * CM) + 'px'; const ro = $('.readout', el); if (ro) ro.textContent = d.pic.w.toFixed(1) + ' cm'; }
      liveDocket();
    } else if (drag.kind === 'model') {
      d.model.ry = normDeg(drag.ry + (e.clientX - drag.x) * .6); d.model.rx = Math.round(clamp(drag.rx - (e.clientY - drag.y) * .6, -85, 85));
      const cube = $('#canvas .model .cube'); if (cube) cube.style.transform = `rotateX(${d.model.rx}deg) rotateY(${d.model.ry}deg)`;
      const ro = $('#canvas .model .readout'); if (ro) ro.textContent = `Turn ${d.model.ry}° · Tilt ${d.model.rx}°`;
      $$('#ribbon [data-ctl="turn"] output').forEach(o => { o.textContent = d.model.ry + '°'; }); $$('#ribbon [data-ctl="tilt"] output').forEach(o => { o.textContent = d.model.rx + '°'; });
      liveDocket();
    } else if (drag.kind === 'chip') {
      if (!chipDrag.moved && Math.hypot(e.clientX - drag.x, e.clientY - drag.y) < 6) return;
      if (!chipDrag.moved) { chipDrag.moved = true; drag.ghost = document.createElement('div'); drag.ghost.className = 'chip dragging'; drag.ghost.textContent = drag.val; document.body.appendChild(drag.ghost); $$('#canvas td.fillable').forEach(td => td.classList.add('drop')); }
      drag.ghost.style.left = e.clientX + 'px'; drag.ghost.style.top = e.clientY + 'px';
      $$('#canvas td.over').forEach(td => td.classList.remove('over'));
      const over = document.elementFromPoint(e.clientX, e.clientY); const td = over && over.closest && over.closest('[data-cell]'); if (td) td.classList.add('over');
    }
  });
  function endDrag(e) {
    if (!drag) return;
    const dd = drag; drag = null;
    if (dd.kind === 'chip') {
      if (dd.ghost) { dd.ghost.remove(); const over = document.elementFromPoint(e.clientX, e.clientY); const td = over && over.closest && over.closest('[data-cell]'); $$('#canvas td.drop, #canvas td.over').forEach(x => x.classList.remove('drop', 'over')); if (td) placeChip(dd.val, td); setTimeout(() => { chipDrag.moved = false; }, 0); }
      return;
    }
    const d = doc(), changed = dd.kind === 'pic' ? d.pic.w !== dd.w : (d.model.rx !== dd.rx || d.model.ry !== dd.ry);
    if (!changed) U.undo.pop(); else { dragJustEnded = true; setTimeout(() => { dragJustEnded = false; }, 0); }
    afterEdit();
  }
  document.addEventListener('pointerup', endDrag);
  document.addEventListener('pointercancel', endDrag);
  // During a drag only the docket's numbers and ticks change
  function liveDocket() {
    const ok = specState();
    $$('#docket .specs li').forEach((li, k) => { li.classList.toggle('ok', ok[k]); $('i', li).innerHTML = ok[k] ? ic('check') : ''; const em = $('em', li); if (em && T().specs[k].n) em.textContent = T().specs[k].n(S.D); });
    $$('#docket .meter i').forEach((m, k) => m.classList.toggle('on', ok[k])); const mt = $('#docket .match'); if (mt) mt.textContent = ok.filter(Boolean).length + '/' + ok.length;
  }

  window.addEventListener('resize', () => { if (S.screen === 'play') { fitPage(); if (U.view === 'print') fitPrint(); renderStatus(); closePop(); } fitZoom(); });
  setInterval(() => { // show the Skip button after 45 s on a job
    if (S.screen !== 'play' || U.busy) return; const b = $('#skipBtn'); if (b && b.hidden && (Date.now() - S.tStart) / 1000 >= 45) b.hidden = false;
  }, 1000);
  // Teacher PIN form
  document.addEventListener('submit', async e => {
    if (e.target.id !== 'pinForm') return; e.preventDefault();
    B.pin = $('#pinIn').value.trim(); const m = $('#pinMsg'); m.textContent = 'Checking…'; m.classList.remove('ok');
    if (await teacherAction('check')) { m.textContent = 'Unlocked.'; m.classList.add('ok'); $('#tTools').hidden = false; const b = $('#lbBody'); if (b) b.innerHTML = boardHTML(false); }
  });

  /* ================= Start ================= */
  if (BOARD) { renderBoardScreen(); setInterval(renderBoardScreen, 6000); }
  else {
    if (S.screen === 'play' && (!S.name || !S.startedAt)) S = fresh();
    if (S.screen === 'printing') S.screen = 'results';
    render();
  }
})();
