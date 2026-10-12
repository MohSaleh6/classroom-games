/* Mystery Box: Word Challenge! Students insert pictures, shapes and 3D models in a pretend Word window. The game checks each box. */
(function () {
  const M = window.MB;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const app = $('#app'), layer = $('#layer');
  const KEY = 'mysteryBox.v2'; // v2: boxes are done in the pretend Word window
  const reduced = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const wait = ms => new Promise(r => setTimeout(r, reduced ? Math.min(ms, 60) : ms));
  const BOARD = new URLSearchParams(location.search).has('board');

  /* ---------- State (kept in localStorage, so a refresh resumes) ---------- */
  const newDoc = () => ({ pic: { id: null, w: 3, wrap: 'inline' }, shape: { type: null, fill: null, text: '' }, model: { id: null, rx: 0, ry: 0 } });
  const fresh = () => ({ screen: 'start', name: '', entry: null, done: [false, false, false, false, false, false], doc: newDoc(),
    colour: 0, dance: '', surprise: { colour: false, dance: false }, support: false, confirmed: false,
    dirty: false, offline: false, clash: false, startedAt: 0, timeUp: false, warned: false, finishedIn: 0 });
  let S = fresh();
  try { const o = JSON.parse(localStorage.getItem(KEY) || 'null'); if (o && Array.isArray(o.done)) { S = Object.assign(fresh(), o); S.doc = Object.assign(newDoc(), S.doc); } } catch (e) {}
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };
  const stars = () => S.done.filter(Boolean).length;
  const mask = () => S.done.reduce((m, d, i) => m | (d ? 1 << i : 0), 0);
  const current = () => S.done.indexOf(false);
  const colourOf = i => M.COLOURS[i] || M.COLOURS[0];
  // The 10-minute clock starts when the student presses "Open the boxes". It uses the real time, so a refresh does not reset it.
  const GAME_SECONDS = M.GAME_MINUTES * 60;
  const left = () => S.startedAt ? Math.max(0, GAME_SECONDS - Math.floor((Date.now() - S.startedAt) / 1000)) : GAME_SECONDS;
  const mmss = s => Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  const over = () => S.timeUp || current() === -1;

  /* ---------- Sound (optional, made with Web Audio) ---------- */
  let soundOn = true, ac = null;
  try { soundOn = localStorage.getItem('mbSound') !== 'off'; } catch (e) {}
  function ctx() { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); if (ac.state === 'suspended') ac.resume(); return ac; }
  function tone(f, t0, d, type = 'sine', v = .08, f2) {
    const c = ctx(), o = c.createOscillator(), g = c.createGain(), t = c.currentTime + t0;
    o.type = type; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d);
    g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(v, t + .015); g.gain.exponentialRampToValueAtTime(.0001, t + d);
    o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + d + .05);
  }
  function whoosh(t0, d, v = .12) {
    const c = ctx(), n = c.createBufferSource(), buf = c.createBuffer(1, c.sampleRate * d, c.sampleRate), data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const bp = c.createBiquadFilter(), g = c.createGain(), t = c.currentTime + t0;
    bp.type = 'bandpass'; bp.Q.value = 1.2; bp.frequency.setValueAtTime(300, t); bp.frequency.exponentialRampToValueAtTime(3200, t + d);
    g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(v, t + d * .6); g.gain.exponentialRampToValueAtTime(.0001, t + d);
    n.buffer = buf; n.connect(bp); bp.connect(g); g.connect(c.destination); n.start(t); n.stop(t + d);
  }
  function sfx(k) {
    if (!soundOn) return;
    try {
      if (k === 'tap') tone(520, 0, .06, 'sine', .05);
      if (k === 'tick') tone(880, 0, .09, 'triangle', .07, 1320);
      if (k === 'untick') tone(660, 0, .08, 'triangle', .05, 440);
      if (k === 'shake') [0, .12, .24, .36].forEach(t => tone(150 + Math.random() * 60, t, .07, 'square', .035));
      if (k === 'open') { whoosh(0, .45); [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, .32 + i * .06, .3, 'triangle', .07)); }
      if (k === 'part') { tone(130, 0, .12, 'square', .06); [1319, 1568, 2093].forEach((f, i) => tone(f, .1 + i * .07, .18, 'sine', .05)); }
      if (k === 'star') [988, 1319].forEach((f, i) => tone(f, i * .08, .2, 'triangle', .07));
      if (k === 'surprise') [660, 880, 740, 990, 1175].forEach((f, i) => tone(f, i * .08, .16, 'square', .035));
      if (k === 'fanfare') { [523, 659, 784].forEach((f, i) => tone(f, i * .14, .22, 'triangle', .09)); [1047, 1319, 1568].forEach(f => tone(f, .46, .7, 'triangle', .06)); }
      if (k === 'boop') tone(400, 0, .12, 'sine', .06, 700);
    } catch (e) {}
  }
  function updateSound() { const b = $('#soundBtn'); b.textContent = soundOn ? '🔊' : '🔇'; b.setAttribute('aria-pressed', String(soundOn)); b.setAttribute('aria-label', soundOn ? 'Sound is on' : 'Sound is off'); b.title = soundOn ? 'Sound on' : 'Sound off'; }

  /* ---------- Little effects ---------- */
  let toastT;
  function toast(msg) { const el = $('#toast'); el.textContent = msg; el.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => { el.hidden = true; }, 2600); }
  function confetti(n = 80) {
    if (reduced) return;
    const box = document.createElement('div'); box.className = 'confetti'; box.setAttribute('aria-hidden', 'true');
    const cols = ['#FF4FA3', '#FFB020', '#18D2FF', '#7CFF6B', '#A66BFF', '#FF7A45', '#FFFFFF'];
    for (let i = 0; i < n; i++) {
      const p = document.createElement('i'); p.style.left = Math.random() * 100 + '%'; p.style.background = cols[i % cols.length];
      p.style.setProperty('--dx', (Math.random() * 220 - 110) + 'px'); p.style.setProperty('--r', (Math.random() * 1000 - 500) + 'deg');
      p.style.animationDuration = (1.4 + Math.random() * 1.2) + 's'; p.style.animationDelay = Math.random() * .3 + 's';
      if (i % 3 === 0) p.style.borderRadius = '50%'; if (i % 4 === 0) p.style.height = '16px';
      box.appendChild(p);
    }
    document.body.appendChild(box); setTimeout(() => box.remove(), 3200);
  }
  function flyStar(fromEl, toEl) {
    if (reduced || !fromEl || !toEl || !fromEl.getBoundingClientRect) return;
    const a = fromEl.getBoundingClientRect(), b = toEl.getBoundingClientRect();
    const s = document.createElement('div'); s.className = 'fly-star'; s.textContent = '⭐';
    s.style.left = (a.left + a.width / 2 - 20) + 'px'; s.style.top = (a.top + a.height / 2 - 20) + 'px'; document.body.appendChild(s);
    const dx = b.left + b.width / 2 - (a.left + a.width / 2), dy = b.top + b.height / 2 - (a.top + a.height / 2);
    s.animate([{ transform: 'translate(0,0) scale(.6) rotate(0)', opacity: 0 }, { transform: `translate(${dx * .3}px,${dy * .3 - 80}px) scale(1.8) rotate(160deg)`, opacity: 1, offset: .35 },
      { transform: `translate(${dx}px,${dy}px) scale(.8) rotate(360deg)`, opacity: 1 }], { duration: 900, easing: 'cubic-bezier(.5,0,.3,1)' }).onfinish = () => s.remove();
  }

  /* ---------- The robot (SVG). Parts appear as students finish boxes. ---------- */
  let uid = 0;
  const PART_ORDER = ['legs', 'arms', 'body', 'screen', 'head', 'power'];
  const partIndex = Object.fromEntries(M.BOXES.map((b, i) => [b.part, i]));
  function partSVG(p, u) {
    const plate = `url(#pl${u})`, metal = `url(#mt${u})`;
    switch (p) {
      case 'legs': return `
        <rect x="76" y="174" width="15" height="40" rx="7" fill="${metal}"/><rect x="109" y="174" width="15" height="40" rx="7" fill="${metal}"/>
        <path class="flame noghost" d="M70 226 Q83 252 96 226 Z"/><path class="flame noghost" d="M104 226 Q117 252 130 226 Z"/>
        <rect x="64" y="208" width="34" height="20" rx="9" fill="${plate}"/><rect x="102" y="208" width="34" height="20" rx="9" fill="${plate}"/>
        <rect class="noghost" x="70" y="212" width="12" height="4" rx="2" fill="#fff" opacity=".45"/><rect class="noghost" x="108" y="212" width="12" height="4" rx="2" fill="#fff" opacity=".45"/>`;
      case 'arms': return `
        <g class="arm arm-l"><rect x="40" y="116" width="15" height="48" rx="7.5" fill="${plate}" transform="rotate(18 48 120)"/><circle cx="36" cy="164" r="10" fill="${metal}"/></g>
        <g class="arm arm-r"><rect x="145" y="116" width="15" height="48" rx="7.5" fill="${plate}" transform="rotate(-18 152 120)"/><circle cx="164" cy="164" r="10" fill="${metal}"/></g>`;
      case 'body': return `
        <rect x="89" y="98" width="22" height="16" rx="5" fill="${metal}"/>
        <rect x="54" y="110" width="92" height="72" rx="24" fill="${plate}"/>
        <rect class="noghost" x="64" y="116" width="34" height="6" rx="3" fill="#fff" opacity=".4"/>
        <circle class="noghost" cx="134" cy="170" r="3.5" fill="#fff" opacity=".5"/><circle class="noghost" cx="66" cy="170" r="3.5" fill="#fff" opacity=".5"/>`;
      case 'screen': return `
        <rect x="74" y="126" width="52" height="38" rx="9" fill="#0A0D2A" stroke="#ffffff55" stroke-width="2"/>
        <path class="pulse noghost" d="M80 146 H91 L95 136 L100 156 L105 140 L109 146 H120" fill="none" stroke="#7CFF6B" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`;
      case 'head': return `
        <rect x="44" y="58" width="14" height="28" rx="6" fill="${metal}"/><rect x="142" y="58" width="14" height="28" rx="6" fill="${metal}"/>
        <rect x="54" y="30" width="92" height="74" rx="30" fill="${plate}"/>
        <rect class="noghost" x="70" y="36" width="36" height="6" rx="3" fill="#fff" opacity=".45"/>
        <rect x="64" y="48" width="72" height="42" rx="18" fill="#0A0D2A"/>
        <g class="eyes noghost"><rect class="eye" x="78" y="59" width="13" height="18" rx="6.5"/><rect class="eye" x="109" y="59" width="13" height="18" rx="6.5"/>
        <path class="mouth" d="M91 82 Q100 87 109 82" fill="none" stroke-width="3" stroke-linecap="round"/></g>`;
      case 'power': return `
        <rect x="96" y="10" width="8" height="24" rx="4" fill="${metal}"/>
        <circle class="bulb" cx="100" cy="10" r="9"/>`;
    }
    return '';
  }
  function robotSVG(have, colour, opts = {}) {
    const u = ++uid, c = colourOf(colour);
    const got = p => have[partIndex[p]];
    const powered = got('power');
    const parts = PART_ORDER.map(p => `<g class="part p-${p}${got(p) ? '' : ' ghost'}${opts.snap === p ? ' snap' : ''}">${partSVG(p, u)}</g>`).join('');
    return `<svg class="robot-svg${powered ? ' powered' : ''}" viewBox="0 0 200 250" role="img" aria-label="Robot with ${have.filter(Boolean).length} of 6 parts" style="--ra:${c.a};--rb:${c.b}">
      <defs><linearGradient id="pl${u}" x1="0" y1="0" x2=".4" y2="1"><stop offset="0" style="stop-color:var(--ra)"/><stop offset="1" style="stop-color:var(--rb)"/></linearGradient>
      <linearGradient id="mt${u}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F1F3FF"/><stop offset="1" stop-color="#8E96BD"/></linearGradient></defs>
      <ellipse class="shadow" cx="100" cy="240" rx="56" ry="7"/>${parts}</svg>`;
  }
  const PICK_LINES = ['Beep boop! 🤖', 'That tickles! 😆', 'Keep going, you are doing great!', 'Pictures, shapes, 3D models… I love them all! ✨', 'Word skills = super powers! ⚡', 'Spin me, spin me! 🔄'];

  /* ---------- Mystery box (CSS 3D cube) ---------- */
  function cubeHTML(b, state) {
    const front = state === 'done' ? `<span class="face-emoji">${b.partEmoji}</span>` : state === 'locked' ? '<span class="face-lock">🔒</span>' : '<span class="face-q">?</span>';
    return `<div class="cube-wrap ${state}" style="--c:${b.color};--c2:${b.color2}"><div class="cube">
      <i class="f front">${front}</i><i class="f back"></i><i class="f right"></i><i class="f left"></i><i class="f top"></i><i class="f bottom"></i></div>
      <i class="cube-shadow"></i></div>`;
  }

  /* ---------- API ---------- */
  async function api(path, body, method) {
    const r = await fetch(path, { method: method || (body ? 'POST' : 'GET'), headers: body ? { 'Content-Type': 'application/json' } : {}, body: body ? JSON.stringify(body) : undefined, cache: 'no-store' });
    let d = {}; try { d = await r.json(); } catch (e) {}
    if (!r.ok) { const err = new Error(d.error || String(r.status)); err.status = r.status; throw err; }
    return d;
  }
  let syncT = null, syncing = false;
  function queueSync(delay = 300) { S.dirty = true; save(); clearTimeout(syncT); syncT = setTimeout(sync, delay); }
  async function sync() {
    if (!S.name || S.clash || BOARD) return;
    if (syncing) { clearTimeout(syncT); syncT = setTimeout(sync, 1200); return; }
    syncing = true;
    try {
      if (!S.entry) {
        try { const d = await api('/api/scores', { name: S.name }); S.entry = { id: d.id, token: d.token }; }
        catch (e) { if (e.status === 409) { S.clash = true; S.dirty = false; return; } throw e; }
      }
      const d = await api('/api/scores', { id: S.entry.id, token: S.entry.token, boxes: mask(), colour: S.colour, support: S.support, planB: false, timeUp: S.timeUp }, 'PUT');
      S.dirty = false; S.offline = false;
      if (!!d.confirmed !== S.confirmed) { S.confirmed = !!d.confirmed; if (S.screen === 'done') renderDone(true); }
    } catch (e) {
      if (e.status === 404) { syncing = false; teacherReset(); return; }
      S.offline = true; clearTimeout(syncT); syncT = setTimeout(sync, 20000);
    } finally { syncing = false; save(); netBadge(); }
  }
  function teacherReset() {
    const snd = soundOn; S = fresh(); save(); soundOn = snd; closeLayer(); go('start');
    toast('Your teacher reset your game. Type your name to start again.');
  }
  function netBadge() { const n = $('#net'); if (n) n.hidden = !(S.offline && S.name); }
  // Every 20 s: send any unsent progress; on the badge screen, also ask if the teacher has checked it.
  setInterval(() => { if (!BOARD && S.name && (S.dirty || S.screen === 'done' || S.offline)) sync(); }, 20000);

  /* ---------- Screens ---------- */
  function go(screen) {
    S.screen = screen; save();
    ({ start: renderStart, ready: renderReady, play: renderPlay, done: renderDone })[screen]();
    hud(); window.scrollTo(0, 0);
  }
  function hud() {
    const inGame = !!S.name && !BOARD;
    $('#starPill').hidden = !inGame; $('#starCount').textContent = stars();
    $('#clockPill').hidden = !inGame || !S.startedAt || over(); $('#clock').textContent = mmss(left());
    $('#supportBtn').setAttribute('aria-pressed', String(S.support)); $('#supportBtn').classList.toggle('on', S.support);
    document.documentElement.classList.toggle('support', S.support);
    updateSound();
  }

  function renderStart() {
    app.innerHTML = `<section class="hero">
      <div class="hero-text">
        <span class="eyebrow">Ms Rahaf’s ICT class · Grade 7</span>
        <h1>Mystery Box:<br><span class="grad">Word Challenge!</span></h1>
        <p class="lead">Ms Rahaf has hidden 6 mystery boxes for you. Insert pictures, shapes and 3D models in the Word window, collect the parts and build your own robot. You have 10 minutes!</p>
        <ul class="chips"><li>📦 6 boxes</li><li>⭐ 6 stars</li><li>🤖 1 robot</li><li>⏱ 10 minutes</li></ul>
        <form class="name-form" id="nameForm" autocomplete="off">
          <label for="nameIn">Your name</label>
          <div class="name-row"><input id="nameIn" maxlength="20" placeholder="First name + last initial" required>
          <button class="btn primary big" type="submit">Let’s go ➜</button></div>
          <p class="form-msg" id="nameMsg" role="alert"></p>
        </form>
        <label class="switch"><input type="checkbox" id="supportIn" ${S.support ? 'checked' : ''}><span class="track"><i></i></span>
          <span><b>Support mode</b><small>Bigger text, hints open and extra help.</small></span></label>
      </div>
      <div class="hero-art" aria-hidden="true">
        <div class="hero-robot robot">${robotSVG([true, true, true, true, true, true], 0)}</div>
        <div class="hero-box">${cubeHTML(M.BOXES[0], 'current')}</div>
        <div class="spark s1">✦</div><div class="spark s2">✦</div><div class="spark s3">✦</div>
      </div>
    </section>`;
    $('#supportIn').onchange = e => { S.support = e.target.checked; save(); hud(); sfx('tap'); };
    $('#nameForm').onsubmit = async e => {
      e.preventDefault();
      const name = $('#nameIn').value.replace(/[<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, 20), msg = $('#nameMsg'), btn = e.target.querySelector('button');
      if (name.length < 2) { msg.textContent = 'Please type your name.'; return; }
      btn.disabled = true; msg.textContent = '';
      try { const d = await api('/api/scores', { name }); S.entry = { id: d.id, token: d.token }; S.offline = false; }
      catch (err) {
        if (err.status === 409) { msg.textContent = 'That name is already used. Add your last initial, like “Sara K”.'; btn.disabled = false; return; }
        S.entry = null; S.offline = true; // no server: play on, progress is sent later
      }
      S.name = name; S.clash = false; sfx('open'); go('ready');
      if (S.entry) queueSync(); else setTimeout(sync, 15000);
    };
    setTimeout(() => $('#nameIn') && $('#nameIn').focus({ preventScroll: true }), 50);
  }

  function renderReady() {
    app.innerHTML = `<section class="ready-screen">
      <div class="card ready-card">
        <span class="eyebrow">How to play</span>
        <h2>Ready, ${esc(S.name)}?</h2>
        <ol class="big-steps">
          <li><b>1</b><span>Open the <b>glowing box</b>.</span></li>
          <li><b>2</b><span>A <b>Word window</b> opens. Use its buttons, just like in real Word.</span></li>
          <li><b>3</b><span>Make every goal <b>green ✅</b>. Then press <b>Check ⭐</b>.</span></li>
          <li><b>4</b><span>Each box gives your robot a new part. Finish all 6!</span></li>
        </ol>
        <button class="btn go big" type="button" data-act="to-play">${S.startedAt ? 'Back to the boxes ➜' : 'Start! Open the boxes ➜'}</button>
        <p class="note center">⏱ You have 10 minutes for all 6 boxes. The clock starts when you open the boxes.</p>
      </div>
      <div class="card preview-card"><span class="eyebrow">Today you will insert</span>
        <ul class="learn">
          <li><span>🖼️</span><div><b>Pictures</b>Insert a picture, make it the right size and wrap the text around it.</div></li>
          <li><span>⭐</span><div><b>Shapes</b>Insert a shape, fill it with colour and type words inside.</div></li>
          <li><span>🧊</span><div><b>3D Models</b>Insert a 3D model and spin it around.</div></li>
        </ul>
        <p class="note">Everything happens on this website. You do not need to open Word.</p></div>
    </section>`;
  }

  function boxState(i) { return S.done[i] ? 'done' : !S.timeUp && i === current() ? 'current' : 'locked'; }
  function boxCard(i) {
    const b = M.BOXES[i], st = boxState(i);
    const label = st === 'done' ? `${b.emoji} ${b.name}` : st === 'current' ? 'Tap to open!' : 'Locked';
    return `<button class="box-card ${st}" type="button" data-act="open-box" data-i="${i}" ${st === 'locked' ? 'aria-disabled="true"' : ''}
      aria-label="Box ${i + 1}: ${st === 'done' ? esc(b.name) + ', finished' : st === 'current' ? 'open this box' : 'locked'}" style="--c:${b.color};--c2:${b.color2}">
      <span class="box-num">BOX ${i + 1}</span>${cubeHTML(b, st)}
      <span class="box-label">${label}</span>${st === 'done' ? '<span class="box-star">⭐</span>' : ''}</button>`;
  }
  function slotsHTML() {
    return M.BOXES.map((b, i) => `<span class="slot${S.done[i] ? ' on' : ''}" title="${esc(b.partName)}" style="--c:${b.color}">${S.done[i] ? '⭐' : '☆'}<small>${S.done[i] ? b.partEmoji : ''}</small></span>`).join('');
  }
  function bubbleText() {
    const n = stars(), c = current();
    if (S.timeUp && c !== -1) return `Time’s up! ⏰ Thanks for building me. Show me to Ms Rahaf!`;
    if (n === 0) return `Hi ${esc(S.name)}! Ms Rahaf sent me in pieces. 😅 Open <b>Box 1</b> to find my head!`;
    if (c === -1) return 'I’m complete! Thank you, Word Champion! 🏅';
    return `${M.BOXES[S.lastBox ?? c - 1]?.say || 'Nice!'} Next: <b>Box ${c + 1}</b>.`;
  }
  function renderPlay(snap) {
    const c = current();
    app.innerHTML = `<section class="play">
      <aside class="card stage">
        <div class="bubble" id="bubble" aria-live="polite">${bubbleText()}</div>
        <button class="robot-btn" type="button" data-act="robot" aria-label="Poke your robot"><div class="robot" id="robot">${robotSVG(S.done, S.colour, { snap })}</div></button>
        <div class="slots" id="slots" aria-label="${stars()} of 6 stars">${slotsHTML()}</div>
        <p class="stage-meta">${esc(S.name)} · <b>${stars()}</b> of 6 parts<span class="net" id="net" hidden> · 📡 saving later</span></p>
      </aside>
      <div class="boxes">
        <div class="boxes-head">
          <div><span class="eyebrow">Your mystery boxes</span><h2>${c === -1 ? 'All 6 boxes open! 🎉' : S.timeUp ? 'Time’s up! ⏰' : `Open Box ${c + 1}`}</h2>
          <p class="muted">${c === -1 ? 'You can still open any box again.' : S.timeUp ? 'You can still open the boxes you finished.' : 'Open the glowing box. Use the Word window. Make the goals green, then press Check.'}</p></div>
        </div>
        <div class="grid">${M.BOXES.map((_, i) => boxCard(i)).join('')}</div>
        ${c === -1 ? '<button class="btn go big wide" type="button" data-act="to-done">🏅 See my Word Champion badge</button>' : S.timeUp ? '<button class="btn go big wide" type="button" data-act="to-done">🤖 See my robot and badge</button>' : ''}
      </div>
    </section>`;
    netBadge(); hud(); eyesFollow();
  }

  function eyesFollow() {
    const r = $('#robot'); if (!r || reduced) return;
    document.onpointermove = e => {
      const box = r.getBoundingClientRect(); if (!box.width) return;
      const dx = Math.max(-1, Math.min(1, (e.clientX - (box.left + box.width / 2)) / 300)), dy = Math.max(-1, Math.min(1, (e.clientY - (box.top + box.height * .3)) / 300));
      r.style.setProperty('--ex', (dx * 4).toFixed(1) + 'px'); r.style.setProperty('--ey', (dy * 3).toFixed(1) + 'px');
    };
  }
  function say(html) { const b = $('#bubble'); if (!b) return; b.innerHTML = html; b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop'); }
  function dance(el, id, times = 1) {
    if (!el || !id) return;
    el.classList.remove('dance-spin', 'dance-bounce', 'dance-wave', 'dance-wiggle'); void el.offsetWidth;
    el.style.setProperty('--times', times); el.classList.add('dance-' + id);
    clearTimeout(el._dt); el._dt = setTimeout(() => el.classList.remove('dance-' + id), reduced ? 10 : 1400 * times);
  }

  /* ---------- The pretend Word window (one page, shared by all 6 boxes) ---------- */
  const T = M.TARGET;
  const D = () => S.doc;
  const getP = p => p.split('.').reduce((o, k) => o && o[k], D());
  const setP = (p, v) => { const ks = p.split('.'), last = ks.pop(); ks.reduce((o, k) => o[k], D())[last] = v; };
  const norm = v => String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  const near = (v, want, ok) => Math.abs(v - want) <= ok;
  // The game checks the page itself. Support mode is a little kinder with sizes and angles.
  function goals(i) {
    const d = D(), sup = S.support, deg = sup ? 25 : 15;
    return [
      () => [{ t: 'A gaming picture', ok: d.pic.id === T.pic }],
      () => [{ t: 'Width about 6 cm', ok: !!d.pic.id && near(d.pic.w, T.width, sup ? 1 : .5) }, { t: 'Wrap Text: Square', ok: !!d.pic.id && d.pic.wrap === T.wrap }],
      () => [{ t: 'Shape: Star', ok: d.shape.type === T.shape }],
      () => [{ t: 'Fill: Yellow', ok: !!d.shape.type && d.shape.fill === T.fill }, { t: 'Text: GAME ON!', ok: !!d.shape.type && norm(d.shape.text) === norm(T.text) }],
      () => [{ t: '3D model: Robot', ok: d.model.id === T.model }],
      () => [{ t: 'Turn about 45°', ok: !!d.model.id && near(d.model.ry, T.ry, deg) }, { t: 'Tilt about -20°', ok: !!d.model.id && near(d.model.rx, T.rx, deg) }]
    ][i]();
  }
  const allOk = i => goals(i).every(g => g.ok);
  const CTX = ['Picture Format', 'Shape Format', '3D Model'];
  const wg = (label, inner, cls) => `<div class="wg${cls ? ' ' + cls : ''}"><small>${label}</small><div class="wopts">${inner}</div></div>`;
  const wb = (path, v, inner, style) => `<button type="button" class="wb" data-set="${path}" data-val="${esc(v)}" aria-pressed="${String(getP(path)) === String(v)}"${style ? ` style="${style}"` : ''}>${inner}</button>`;
  const wrange = (label, path, min, max, step, unit, aria) => `<div class="wrange"><span>${label}</span><input type="range" min="${min}" max="${max}" step="${step}" value="${getP(path)}" data-range="${path}" aria-label="${aria}"><b data-show="${path}" data-unit="${unit}">${getP(path)}${unit}</b></div>`;
  function modelCube(id, rx, ry, ghost) {
    const m = M.MODELS[id] || M.MODELS.robot;
    const faces = [1, 2, 3, 4, 5, 6].map(k => `<div class="f${k}" style="background:${k % 2 ? m.c1 : m.c2}">${m.em}</div>`).join('');
    return `<div class="wcube${ghost ? ' ghost' : ''}"${ghost ? '' : ' data-cube'} style="transform:rotateX(${rx}deg) rotateY(${ry}deg)">${faces}</div>`;
  }
  function groupsHTML(i) {
    const d = D();
    const need = (what, box) => `<div class="wg"><small>Oops</small><p class="wneed">First ${what} in <b>Box ${box}</b>.</p></div>`;
    switch (i) {
      case 0: return wg('Pictures', M.PIC_CHOICES.map(id => { const p = M.PICS[id]; return wb('pic.id', id, `<span class="e">${p.em}</span>${esc(p.label)}`, `background:${p.bg}`); }).join(''));
      case 1: if (!d.pic.id) return need('insert a picture', 1);
        return wg('Size', wrange('↔ Width', 'pic.w', 2, 12, .5, ' cm', 'Picture width'), 'col') +
          wg('Wrap Text', [['inline', '▭', 'In Line'], ['square', '▣', 'Square'], ['behind', '⬚', 'Behind Text'], ['front', '◼', 'In Front']].map(([v, ic, l]) => wb('pic.wrap', v, `<span class="e">${ic}</span>${l}`)).join(''));
      case 2: return wg('Shapes', Object.entries(M.SHAPES).map(([id, sh]) => wb('shape.type', id, `<svg viewBox="0 0 100 100" width="34" height="34" aria-hidden="true"><path d="${sh.path}" fill="${M.FILLS[d.shape.fill] || '#E6E1F7'}" stroke="#241B4B" stroke-width="5"/></svg>${sh.label}`)).join(''));
      case 3: if (!d.shape.type) return need('insert a shape', 3);
        return wg('Shape Fill', Object.entries(M.FILLS).map(([n, hex]) => `<button type="button" class="wsw" style="background:${hex}" data-set="shape.fill" data-val="${n}" aria-pressed="${d.shape.fill === n}" aria-label="${n}" title="${n}"></button>`).join('')) +
          wg('Text in the shape', `<input class="wtext" data-text="shape.text" maxlength="16" value="${esc(d.shape.text)}" placeholder="Type here" autocomplete="off" autocapitalize="characters" spellcheck="false" aria-label="Text in the shape">`);
      case 4: return wg('3D Models', M.MODEL_CHOICES.map(id => { const m = M.MODELS[id]; return wb('model.id', id, `<span class="e">${m.em}</span>${esc(m.label)}`, `background:${m.c2}`); }).join(''));
      case 5: if (!d.model.id) return need('insert a 3D model', 5);
        return wg('Match this! 🎯', `<div class="wstage target">${modelCube(d.model.id, T.rx, T.ry, true)}</div>`) +
          wg('3D Rotation', wrange('↔ Turn', 'model.ry', -180, 180, 5, '°', 'Turn') + wrange('↕ Tilt', 'model.rx', -90, 90, 5, '°', 'Tilt') + '<span class="wsmall">Or drag the model on the page 👆</span>', 'col');
    }
    return '';
  }
  function ribbonHTML(i) {
    const tab = M.BOXES[i].tab, tabs = ['File', 'Home', 'Insert', 'Layout', 'Review'].concat(CTX.includes(tab) ? [tab] : []);
    return `<div class="wtabs">${tabs.map(t => `<span class="${t === tab ? 'on' : ''}${CTX.includes(t) ? ' ctx' : ''}${['File', 'Layout', 'Review'].includes(t) ? ' far' : ''}">${t}</span>`).join('')}</div><div class="wgroups">${groupsHTML(i)}</div>`;
  }
  function pageHTML(i) {
    const d = D(), on = ['pic', 'pic', 'shape', 'shape', 'model', 'model'][i], sel = x => on === x ? ' sel' : '';
    const shape = d.shape.type ? `<div class="wshape${sel('shape')}"><svg viewBox="0 0 100 100" aria-hidden="true"><path d="${M.SHAPES[d.shape.type].path}" fill="${M.FILLS[d.shape.fill] || '#ECE8F7'}" stroke="#241B4B" stroke-width="3"/></svg><span>${esc(d.shape.text)}</span></div>` : '';
    const p = d.pic.id && M.PICS[d.pic.id];
    const pic = p ? `<div class="wpic ${d.pic.wrap}${sel('pic')}" style="--pw:calc(${d.pic.w * 20}px * var(--k));background:${p.bg}" role="img" aria-label="Picture: ${esc(p.label)}"><span>${p.em}</span></div>` : '';
    const model = d.model.id ? `<div class="wmodel${sel('model')}"><div class="wstage" data-rot>${modelCube(d.model.id, d.model.rx, d.model.ry)}</div></div>` : '';
    return `<div class="wtitle-row">${shape}<h1 class="wttl">${esc(M.TITLE)}</h1></div><div class="wblk">${pic}<p>${esc(M.PARA)}</p><p>${esc(M.PARA2)}</p></div>${model}`;
  }
  const goalsHTML = i => goals(i).map(g => `<li class="${g.ok ? 'ok' : ''}">${g.ok ? '✅' : '⬜'} ${esc(g.t)}</li>`).join('');
  function refreshWord(rib) {
    if (openI < 0 || !$('#wpage', layer)) return;
    if (rib) $('#wrib', layer).innerHTML = ribbonHTML(openI);
    $('#wpage', layer).innerHTML = pageHTML(openI);
    refreshGoals();
  }
  function refreshGoals() {
    const g = $('#wgoals', layer); if (!g) return;
    g.innerHTML = goalsHTML(openI);
    const btn = $('[data-act="check"]', layer); if (btn) btn.classList.toggle('ready', allOk(openI));
  }
  function liveLabels() {
    $$('[data-show]', layer).forEach(b => { b.textContent = getP(b.dataset.show) + b.dataset.unit; });
    $$('[data-range]', layer).forEach(r => { if (document.activeElement !== r) r.value = getP(r.dataset.range); });
  }

  /* ---------- Opening a box ---------- */
  let openI = -1, hintOpen = false;
  async function openBox(i, el) {
    const st = boxState(i);
    if (S.timeUp && st !== 'done') { sfx('boop'); say('⏰ Time’s up! You can only open the boxes you finished.'); return; }
    if (st === 'locked') { sfx('boop'); say(`That box is locked. 🔒 Open <b>Box ${current() + 1}</b> first!`); if (el) { el.classList.remove('nope'); void el.offsetWidth; el.classList.add('nope'); } return; }
    openI = i; hintOpen = S.support;
    const b = M.BOXES[i], first = st === 'current' && !S.opened?.[i];
    if (first && !reduced) {
      S.opened = Object.assign({}, S.opened, { [i]: true }); save();
      openLayer(`<div class="opening" style="--c:${b.color};--c2:${b.color2}"><div class="rays"></div>${cubeHTML(b, 'current')}<p class="opening-txt">Box ${i + 1}…</p></div>`, 'dim');
      const o = $('.opening', layer); sfx('shake'); o.classList.add('shake');
      await wait(650); if (!o.isConnected) return;
      o.classList.remove('shake'); o.classList.add('pop'); sfx('open');
      await wait(650); if (!o.isConnected) return;
    }
    showBox(i, true); sfx(first ? 'surprise' : 'tap');
  }
  function hintsHTML(hints) {
    return hints.map(h => `<div class="hint-row"><div class="path">${h.path.map((p, k) => `<span class="chip${k === 0 ? ' tab' : ''}">${esc(p)}</span>`).join('<span class="sep">›</span>')}</div>
      <p>${h.tip}</p></div>`).join('');
  }
  function showBox(i, anim) {
    const b = M.BOXES[i], done = S.done[i];
    const html = `<div class="sheet wide box-sheet${anim ? ' in' : ''}" role="dialog" aria-modal="true" aria-labelledby="boxTitle" style="--c:${b.color};--c2:${b.color2}">
      <header class="sheet-head">
        <span class="sheet-emoji" aria-hidden="true">${b.emoji}</span>
        <div><span class="sheet-kicker">Box ${i + 1} of 6 · Reward: ⭐ + ${b.partEmoji} ${esc(b.partName)}</span><h2 id="boxTitle">${b.name}</h2></div>
        <button class="x" type="button" data-act="close" aria-label="Close">✕</button>
      </header>
      <div class="sheet-body">
        <p class="task">${b.task}</p>
        <div class="word">
          <div class="wbar"><span class="wlogo" aria-hidden="true">W</span><span>Gaming Room - Word</span></div>
          <div class="wribbon" id="wrib">${ribbonHTML(i)}</div>
          <div class="wpagewrap"><div class="wpage" id="wpage">${pageHTML(i)}</div></div>
        </div>
        <div class="goals-row"><span class="goals-label">Goals</span><ul class="wgoals" id="wgoals" aria-live="polite">${goalsHTML(i)}</ul></div>
        <button class="hint-btn" type="button" data-act="hint" aria-expanded="${hintOpen}">💡 Where is it in real Word? <span>${hintOpen ? '▲' : '▼'}</span></button>
        <div class="hints" ${hintOpen ? '' : 'hidden'}>${hintsHTML(b.hints)}${S.support && b.extra ? `<p class="extra">⭐ <b>Extra hint:</b> ${b.extra}</p>` : ''}</div>
      </div>
      <footer class="sheet-foot">
        ${done ? `<p class="done-msg">✅ You finished this box!</p><button class="btn primary" type="button" data-act="close">Close</button>`
          : `<button class="btn go big finish${allOk(i) ? ' ready' : ''}" type="button" data-act="check" data-i="${i}">Check ⭐</button>
             <p class="honest">Make all the goals green ✅, then press Check.</p>`}
      </footer></div>`;
    openLayer(html, 'dim sheet-layer');
    showSelected();
  }
  // Scroll the page so the picture, shape or 3D model for this box is in view.
  function showSelected() {
    const el = $('#wpage .sel', layer); if (el) el.scrollIntoView({ block: 'nearest' });
  }
  function checkBox(i, btn) {
    if (S.done[i] || S.timeUp) return;
    const bad = goals(i).filter(g => !g.ok);
    if (bad.length) {
      sfx('boop'); btn.classList.remove('nope'); void btn.offsetWidth; btn.classList.add('nope');
      toast('Not yet! Still to do: ' + bad.map(g => g.t).join(', ')); return;
    }
    finishBox(i, btn);
  }
  async function finishBox(i, btn) {
    if (S.done[i] || S.timeUp) return;
    S.done[i] = true; S.lastBox = i; if (current() === -1) S.finishedIn = GAME_SECONDS - left(); save(); queueSync();
    const target = $$('#slots .slot')[i];
    flyStar(btn, target); sfx('star'); closeLayer(true);
    await wait(500);
    renderPlay(M.BOXES[i].part); sfx('part');
    const r = $('#robot'); if (r) { r.classList.add('hop'); setTimeout(() => r.classList.remove('hop'), 700); }
    if (!reduced) confetti(i === 5 ? 140 : 40);
    if (i === 1 && !S.surprise.colour) { await wait(1500); surpriseColour(); }
    else if (i === 3 && !S.surprise.dance) { await wait(1500); surpriseDance(); }
    else if (i === 5) { await wait(1800); go('done'); sfx('fanfare'); confetti(160); }
  }

  /* ---------- Surprises after Box 2 and Box 4 ---------- */
  function surpriseColour() {
    sfx('surprise'); const pick = S.colour;
    openLayer(`<div class="sheet surprise in" role="dialog" aria-modal="true" aria-labelledby="sTitle">
      <div class="surprise-burst" aria-hidden="true">🎁</div>
      <span class="sheet-kicker center">Surprise!</span><h2 id="sTitle" class="center">Pick your robot’s colour</h2>
      <div class="surprise-robot" id="sRobot">${robotSVG(S.done, pick)}</div>
      <div class="swatches">${M.COLOURS.map((c, k) => `<button type="button" class="swatch${k === pick ? ' on' : ''}" data-act="colour" data-c="${k}" aria-pressed="${k === pick}" style="--a:${c.a};--b:${c.b}"><i></i><span>${esc(c.name)}</span></button>`).join('')}</div>
      <button class="btn go big wide" type="button" data-act="colour-save">Paint it! 🎨</button></div>`, 'dim');
    layer.dataset.pick = pick;
  }
  function surpriseDance() {
    sfx('surprise'); const pick = S.dance || M.DANCES[0].id;
    openLayer(`<div class="sheet surprise in" role="dialog" aria-modal="true" aria-labelledby="sTitle">
      <div class="surprise-burst" aria-hidden="true">🎁</div>
      <span class="sheet-kicker center">Surprise!</span><h2 id="sTitle" class="center">Teach your robot a dance</h2>
      <div class="surprise-robot"><div class="robot" id="sRobot">${robotSVG(S.done, S.colour)}</div></div>
      <div class="dances">${M.DANCES.map(d => `<button type="button" class="dance-btn${d.id === pick ? ' on' : ''}" data-act="dance" data-d="${d.id}" aria-pressed="${d.id === pick}"><span>${d.emoji}</span>${esc(d.name)}</button>`).join('')}</div>
      <p class="note center">Tap a dance to try it. Your robot will do it at the end!</p>
      <button class="btn go big wide" type="button" data-act="dance-save">That’s my dance! 🕺</button></div>`, 'dim');
    layer.dataset.pick = pick;
  }

  /* ---------- Finale: badge ---------- */
  function badgeSVG() {
    const got = stars(), full = got === 6, n = S.name, fs = n.length > 14 ? 13 : n.length > 10 ? 16 : 19;
    const date = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    return `<svg class="badge-svg" viewBox="0 0 260 310" role="img" aria-label="${full ? 'Word Champion' : 'Robot Builder'} badge for ${esc(n)}">
      <defs><linearGradient id="bg1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFF1A8"/><stop offset=".5" stop-color="#FFC93C"/><stop offset="1" stop-color="#D98E04"/></linearGradient>
      <linearGradient id="bg2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7B4DFF"/><stop offset="1" stop-color="#2A1279"/></linearGradient>
      <linearGradient id="bg3" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FF4FA3"/><stop offset="1" stop-color="#B620E0"/></linearGradient></defs>
      <path d="M78 170 L50 290 L86 272 L108 300 L128 196 Z" fill="url(#bg3)"/><path d="M182 170 L210 290 L174 272 L152 300 L132 196 Z" fill="url(#bg3)"/>
      <polygon points="130,8 230,64 230,176 130,232 30,176 30,64" fill="url(#bg1)"/>
      <polygon points="130,26 214,73 214,167 130,214 46,167 46,73" fill="url(#bg2)"/>
      <polygon points="130,26 214,73 214,96 130,60 46,96 46,73" fill="#fff" opacity=".08"/>
      <text x="130" y="80" text-anchor="middle" font-size="15" fill="#FFD84D" letter-spacing="2">${'★'.repeat(got)}${'☆'.repeat(6 - got)}</text>
      <text x="130" y="122" text-anchor="middle" class="b-big">${full ? 'WORD' : 'ROBOT'}</text>
      <text x="130" y="152" text-anchor="middle" class="b-mid">${full ? 'CHAMPION' : 'BUILDER'}</text>
      <text x="130" y="180" text-anchor="middle" class="b-small">Ms Rahaf’s class</text>
      <rect x="44" y="236" width="172" height="44" rx="14" fill="#fff"/><rect x="44" y="236" width="172" height="44" rx="14" fill="none" stroke="#FFC93C" stroke-width="3"/>
      <text x="130" y="${258 + fs * .35}" text-anchor="middle" class="b-name" font-size="${fs}">${esc(n)}</text>
      <text x="130" y="300" text-anchor="middle" class="b-date">${esc(date)}</text></svg>`;
  }
  function renderDone(quiet) {
    if (!over()) return go('play');
    const full = current() === -1, d = M.DANCES.find(x => x.id === S.dance) || M.DANCES[0];
    app.innerHTML = `<section class="finale">
      <div class="finale-stage"><div class="spot" aria-hidden="true"></div>
        <button class="robot-btn" type="button" data-act="dance-again" aria-label="Make your robot dance"><div class="robot big" id="robot">${robotSVG(S.done, S.colour)}</div></button>
        <button class="btn ghost" type="button" data-act="dance-again">${d.emoji} ${esc(d.name)} again!</button></div>
      <div class="finale-info">
        <span class="eyebrow">${full ? `6 of 6 boxes · robot complete${S.finishedIn ? ' · ' + mmss(S.finishedIn) : ''}` : `Time’s up · ${stars()} of 6 boxes`}</span>
        <h1>${full ? 'You did it' : 'Great building'}, <span class="grad">${esc(S.name)}</span>!</h1>
        <div class="badge-wrap">${badgeSVG()}</div>
        ${full && S.confirmed ? '<p class="stamp ok">✅ Checked by Ms Rahaf. Well done!</p>' : full ? '<p class="stamp">👩‍🏫 Show this badge to Ms Rahaf.</p>' : '<p class="stamp">👩‍🏫 Show your robot to Ms Rahaf. Great try!</p>'}
        <div class="row center"><button class="btn ghost" type="button" data-act="to-play">📦 See my boxes</button></div>
      </div></section>`;
    hud(); eyesFollow();
    if (!quiet) setTimeout(() => dance($('#robot'), S.dance || 'spin', 2), 400);
    sync();
  }

  /* ---------- Layer (pop-ups) ---------- */
  let onCloseLayer = null, lastFocus = null;
  function openLayer(html, cls, onClose) {
    if (layer.hidden) lastFocus = document.activeElement;
    layer.className = 'layer ' + (cls || ''); layer.innerHTML = html; layer.hidden = false; onCloseLayer = onClose || null;
    document.body.classList.add('locked');
    const f = layer.querySelector('.sheet-body button, .sheet button, input, button'); f && f.focus({ preventScroll: true });
  }
  function closeLayer(quiet) {
    if (layer.hidden) return;
    layer.hidden = true; layer.innerHTML = ''; delete layer.dataset.pick; openI = -1; drag = null; document.body.classList.remove('locked');
    clearInterval(teacherPoll); const cb = onCloseLayer; onCloseLayer = null; cb && cb();
    if (!quiet && lastFocus && lastFocus.isConnected) lastFocus.focus({ preventScroll: true });
  }

  /* ---------- Teacher panel ---------- */
  let pin = '', tTab = 'class', players = [], teacherPoll = null;
  function teacherOpen() {
    if (pin) return teacherPanel();
    openLayer(`<div class="sheet in teacher" role="dialog" aria-modal="true" aria-labelledby="tTitle" style="--c:#7B4DFF;--c2:#2A1279">
      <header class="sheet-head"><span class="sheet-emoji" aria-hidden="true">👩‍🏫</span><div><span class="sheet-kicker">Teacher</span><h2 id="tTitle">Ms Rahaf’s panel</h2></div>
      <button class="x" type="button" data-act="close" aria-label="Close">✕</button></header>
      <form class="sheet-body" id="pinForm"><label for="pinIn">Teacher PIN</label>
        <div class="name-row"><input id="pinIn" type="password" inputmode="numeric" autocomplete="off" required><button class="btn primary" type="submit">Unlock</button></div>
        <p class="form-msg" id="pinMsg" role="alert"></p></form></div>`, 'dim sheet-layer');
    $('#pinForm').onsubmit = async e => {
      e.preventDefault(); const p = $('#pinIn').value.trim(), msg = $('#pinMsg'); msg.textContent = 'Checking…';
      try { await api('/api/teacher', { pin: p, action: 'check' }); pin = p; teacherPanel(); }
      catch (err) { msg.textContent = err.status === 401 ? 'Wrong PIN. Try again.' : 'Cannot reach the server. Check the internet and try again.'; }
    };
    $('#pinIn').focus();
  }
  async function loadPlayers() { try { players = (await api('/api/scores')).players || []; } catch (e) { players = null; } }
  function classHTML() {
    if (players === null) return '<p class="form-msg">Cannot load the class list right now.</p>';
    if (!players.length) return '<p class="muted">No students yet. When students type their name, they appear here.</p>';
    const champs = players.filter(p => p.boxes === 63).length;
    return `<p class="muted">${players.length} students · ${champs} finished all 6 boxes · the game checks each box</p>
      <div class="tlist">${players.map(p => {
        const n = M.BOXES.filter((_, i) => p.boxes & (1 << i)).length, all = n === 6;
        return `<div class="trow"><div class="tname"><b>${esc(p.name)}</b>${p.support ? '<span class="tag">Support</span>' : ''}${p.timeUp && p.boxes !== 63 ? '<span class="tag">⏰ Time up</span>' : ''}</div>
          <div class="tdots">${M.BOXES.map((b, i) => `<span class="${p.boxes & (1 << i) ? 'on' : ''}" title="Box ${i + 1}: ${b.name}" style="--c:${b.color}">${i + 1}</span>`).join('')}</div>
          <div class="tact">${all ? `<button class="btn sm ${p.confirmed ? 'ghost' : 'go'}" type="button" data-act="t-confirm" data-id="${p.id}" data-on="${!p.confirmed}">${p.confirmed ? '✅ Badge confirmed' : 'Confirm badge'}</button>` : `<span class="muted small">${n}/6</span>`}
          <button class="btn sm danger" type="button" data-act="t-remove" data-id="${p.id}" data-name="${esc(p.name)}" aria-label="Reset ${esc(p.name)}">Reset</button></div></div>`;
      }).join('')}</div>`;
  }
  function lessonHTML() {
    const total = M.TIMINGS.reduce((a, t) => a + t.min, 0); let t0 = 0;
    return `<table class="ttable"><thead><tr><th>Time</th><th>What happens</th></tr></thead><tbody>${M.TIMINGS.map(t => { const r = `<tr><td>${t0}–${t0 + t.min} min</td><td>${esc(t.what)}</td></tr>`; t0 += t.min; return r; }).join('')}</tbody>
      <tfoot><tr><td><b>${total} min</b></td><td>Total</td></tr></tfoot></table>
      <p class="muted small">The game has a 10-minute clock. It starts when a student presses “Open the boxes”, and a refresh does not reset it. At 0 the game ends and shows the parts the student collected. Resetting a student gives them a new 10 minutes. Everything happens in the pretend Word window on the website: students do not need Microsoft Word. Support mode has bigger text, hints open, extra hints and a little more room for sizes and angles.</p>`;
  }
  function answersHTML() {
    return `<p class="muted">The game checks each box itself: a box only gives a star when every goal is green.</p>
      ${M.ANSWERS.map(c => { const b = M.BOXES[c.box - 1];
        return `<div class="tcheck"><p class="tcheck-h" style="--c:${b.color}">${b.emoji} Box ${c.box}: ${b.name}</p><ul>${c.items.map(it => `<li>${esc(it)}</li>`).join('')}</ul></div>`; }).join('')}
      <div class="tcheck"><p class="tcheck-h" style="--c:#FFC93C">🏅 Word Champion badge</p><ul><li>All 6 boxes done before the clock reaches 0.</li><li>When you have seen the badge on the student’s screen, press <b>Confirm badge</b> in the Class tab. Their screen then shows “Checked by Ms Rahaf”.</li></ul></div>`;
  }
  function resetHTML() {
    return `<div class="reset-box"><h3>Reset the whole class</h3><p class="muted">Removes every name and robot from the class list and the big screen. Do this before a new class.</p>
      <button class="btn danger" type="button" data-act="t-clear">🧹 Reset whole class</button></div>
      <div class="reset-box"><h3>Reset one student</h3><p class="muted">Use the <b>Reset</b> button next to their name in the Class tab. Their game starts again.</p></div>
      <div class="reset-box"><h3>Reset this device</h3><p class="muted">Clears the game on <b>this</b> computer only.</p>
      <button class="btn ghost" type="button" data-act="t-device">🔄 Reset this device</button></div>
      <p class="small"><a href="./?board" target="_blank" rel="noopener">📺 Open the big-screen robot wall</a></p>`;
  }
  async function teacherPanel() {
    if (tTab === 'class') await loadPlayers();
    const tabs = [['class', '👥 Class'], ['lesson', '⏱ 45-min plan'], ['check', '✅ Answers'], ['reset', '🔄 Reset']];
    const scrollY = $('.sheet-body', layer)?.scrollTop || 0;
    openLayer(`<div class="sheet teacher wide" role="dialog" aria-modal="true" aria-labelledby="tTitle" style="--c:#7B4DFF;--c2:#2A1279">
      <header class="sheet-head"><span class="sheet-emoji" aria-hidden="true">👩‍🏫</span><div><span class="sheet-kicker">Teacher</span><h2 id="tTitle">Ms Rahaf’s panel</h2></div>
      <button class="x" type="button" data-act="close" aria-label="Close">✕</button></header>
      <div class="ttabs" role="tablist">${tabs.map(([k, l]) => `<button type="button" role="tab" data-act="t-tab" data-t="${k}" aria-selected="${tTab === k}">${l}</button>`).join('')}</div>
      <div class="sheet-body">${({ class: classHTML, lesson: lessonHTML, check: answersHTML, reset: resetHTML })[tTab]()}</div></div>`, 'dim sheet-layer');
    const sb = $('.sheet-body', layer); if (sb) sb.scrollTop = scrollY;
    clearInterval(teacherPoll);
    if (tTab === 'class') teacherPoll = setInterval(async () => { if (layer.hidden || tTab !== 'class' || !$('.teacher', layer)) return clearInterval(teacherPoll); await loadPlayers(); const b = $('.sheet-body', layer); if (b) b.innerHTML = classHTML(); }, 8000);
  }
  async function teacherAction(action, extra) {
    try { await api('/api/teacher', Object.assign({ pin, action }, extra)); return true; }
    catch (e) { if (e.status === 401) { pin = ''; teacherOpen(); } else toast('Cannot reach the server. Try again.'); return false; }
  }

  /* ---------- Big-screen robot wall (?board) ---------- */
  let wall = [];
  async function renderWall() {
    try { wall = (await api('/api/scores')).players || []; } catch (e) { /* keep the last list */ }
    const champs = wall.filter(p => p.boxes === 63).length;
    app.innerHTML = `<section class="wall">
      <div class="wall-head"><div><span class="eyebrow">Ms Rahaf’s class robot wall</span><h1>Mystery Box: <span class="grad">Word Challenge!</span></h1></div>
        <div class="wall-stats"><span><b>${wall.length}</b> robots building</span><span><b>${champs}</b> 🏅 Word Champions</span></div></div>
      ${wall.length ? `<div class="wall-grid">${wall.map(p => { const have = M.BOXES.map((_, i) => !!(p.boxes & (1 << i))), n = have.filter(Boolean).length;
        return `<div class="wall-tile${n === 6 ? ' champ' : ''}"><div class="robot mini">${robotSVG(have, p.colour)}</div><b>${esc(p.name)}</b>
          <span class="wall-stars">${'⭐'.repeat(n)}<i>${'☆'.repeat(6 - n)}</i></span>${n === 6 ? `<span class="wall-badge">${p.confirmed ? '✅ ' : ''}🏅 Word Champion</span>` : ''}</div>`; }).join('')}</div>`
        : '<div class="card center wall-empty"><p class="lead">Waiting for robots… 🤖</p><p class="muted">Students: open the game and type your name.</p></div>'}
    </section>`;
  }

  /* ---------- 10-minute clock ---------- */
  function timeUp() {
    if (over()) return;
    S.timeUp = true; save(); queueSync(); closeLayer(true); hud(); sfx('fanfare');
    if (S.screen === 'play') renderPlay();
    openLayer(`<div class="sheet surprise in" role="dialog" aria-modal="true" aria-labelledby="sTitle">
      <div class="surprise-burst" aria-hidden="true">⏰</div><h2 id="sTitle" class="center">Time’s up!</h2>
      <p class="center lead">You collected <b>${stars()} of 6</b> robot parts. Great work!</p>
      <button class="btn go big wide" type="button" data-act="time-up-ok">See my robot ➜</button></div>`, 'dim');
  }
  setInterval(() => {
    if (BOARD || !S.name || !S.startedAt || over()) return;
    const l = left(), pill = $('#clockPill');
    $('#clock').textContent = mmss(l); pill.hidden = false; pill.classList.toggle('low', l <= 60);
    if (l <= 120 && !S.warned) { S.warned = true; save(); toast('⏱ 2 minutes left!'); }
    if (l === 0) timeUp();
  }, 1000);

  /* ---------- Clicks ---------- */
  document.addEventListener('click', async e => {
    if (e.target === layer && !layer.querySelector('.surprise')) { closeLayer(); return; }
    const ws = e.target.closest('[data-set]');
    if (ws && openI >= 0 && layer.contains(ws)) {
      let v = ws.dataset.val; if (typeof getP(ws.dataset.set) === 'number') v = +v;
      if (ws.dataset.set === 'pic.id' && !D().pic.id) D().pic.w = 3;
      setP(ws.dataset.set, v); save(); sfx('tap'); refreshWord(true);
      showSelected();
      return;
    }
    const el = e.target.closest('[data-act]'); if (!el) return;
    const act = el.dataset.act;
    if (act === 'to-play') { sfx('tap'); if (!S.startedAt) { S.startedAt = Date.now(); save(); } return go('play'); }
    if (act === 'time-up-ok') { closeLayer(true); return go('done'); }
    if (act === 'to-done') { sfx('fanfare'); return go('done'); }
    if (act === 'open-box') return openBox(Number(el.dataset.i), el);
    if (act === 'close') { sfx('tap'); return closeLayer(); }
    if (act === 'hint') { hintOpen = !hintOpen; sfx('tap'); el.setAttribute('aria-expanded', String(hintOpen)); $('span', el).textContent = hintOpen ? '▲' : '▼'; $('.hints', layer).hidden = !hintOpen; if (hintOpen) $('.hints', layer).scrollIntoView({ block: 'nearest', behavior: reduced ? 'auto' : 'smooth' }); return; }
    if (act === 'check') return checkBox(Number(el.dataset.i), el);
    if (act === 'robot') { const r = $('#robot'); sfx('boop'); if (r) { r.classList.remove('hop'); void r.offsetWidth; r.classList.add('hop'); } say(PICK_LINES[Math.floor(Math.random() * PICK_LINES.length)]); return; }
    if (act === 'colour') {
      const k = Number(el.dataset.c); layer.dataset.pick = k; sfx('tap');
      $$('.swatch', layer).forEach(s => { const on = Number(s.dataset.c) === k; s.classList.toggle('on', on); s.setAttribute('aria-pressed', String(on)); });
      $('#sRobot').innerHTML = robotSVG(S.done, k); return;
    }
    if (act === 'colour-save') { S.colour = Number(layer.dataset.pick) || 0; S.surprise.colour = true; save(); queueSync(); closeLayer(true); renderPlay(); sfx('part'); confetti(50); say(`Ooh, <b>${esc(colourOf(S.colour).name)}</b>! I look amazing. 😎`); return; }
    if (act === 'dance') {
      const d = el.dataset.d; layer.dataset.pick = d;
      $$('.dance-btn', layer).forEach(s => { const on = s.dataset.d === d; s.classList.toggle('on', on); s.setAttribute('aria-pressed', String(on)); });
      sfx('surprise'); dance($('#sRobot'), d); return;
    }
    if (act === 'dance-save') { S.dance = layer.dataset.pick || 'spin'; S.surprise.dance = true; save(); closeLayer(true); renderPlay(); sfx('part'); dance($('#robot'), S.dance); say('I’ll save my best moves for the end! 🕺'); return; }
    if (act === 'dance-again') { sfx('surprise'); dance($('#robot'), S.dance || 'spin', 2); return; }
    if (act === 't-tab') { tTab = el.dataset.t; sfx('tap'); return teacherPanel(); }
    if (act === 't-confirm') { el.disabled = true; if (await teacherAction('confirm', { id: Number(el.dataset.id), on: el.dataset.on === 'true' })) teacherPanel(); return; }
    if (act === 't-remove') { if (!confirm(`Reset ${el.dataset.name}? Their progress is removed and they start again.`)) return; if (await teacherAction('remove', { id: Number(el.dataset.id) })) teacherPanel(); return; }
    if (act === 't-clear') { if (!confirm('Reset the whole class? Every name and robot is removed.')) return; if (await teacherAction('clear')) { toast('The class is reset. Ready for a new lesson!'); tTab = 'class'; teacherPanel(); } return; }
    if (act === 't-device') { if (!confirm('Reset the game on this device?')) return; S = fresh(); save(); closeLayer(true); go('start'); toast('This device is reset.'); return; }
  });
  document.addEventListener('input', e => {
    if (openI < 0 || layer.hidden) return;
    let t;
    if ((t = e.target.closest('[data-range]'))) { setP(t.dataset.range, +t.value); liveLabels(); $('#wpage', layer).innerHTML = pageHTML(openI); refreshGoals(); save(); }
    else if ((t = e.target.closest('[data-text]'))) { setP(t.dataset.text, t.value.slice(0, 16)); $('#wpage', layer).innerHTML = pageHTML(openI); refreshGoals(); save(); }
  });
  /* Drag the 3D model on the page to spin it (Box 6) */
  let drag = null;
  document.addEventListener('pointerdown', e => {
    if (openI !== 5 || layer.hidden || !e.target.closest('#wpage [data-rot]')) return;
    drag = { x: e.clientX, y: e.clientY, rx: D().model.rx, ry: D().model.ry }; e.preventDefault();
  });
  document.addEventListener('pointermove', e => {
    if (!drag) return;
    let ry = drag.ry + (e.clientX - drag.x) * .6, rx = drag.rx - (e.clientY - drag.y) * .6;
    ry = ((ry + 180) % 360 + 360) % 360 - 180; rx = Math.max(-90, Math.min(90, rx));
    D().model.ry = Math.round(ry / 5) * 5; D().model.rx = Math.round(rx / 5) * 5;
    const cube = $('#wpage [data-cube]', layer); if (cube) cube.style.transform = `rotateX(${D().model.rx}deg) rotateY(${D().model.ry}deg)`;
    liveLabels(); refreshGoals();
  });
  document.addEventListener('pointerup', () => { if (drag) { drag = null; save(); } });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !layer.hidden && !layer.querySelector('.surprise')) closeLayer(); });
  $('#soundBtn').onclick = () => { soundOn = !soundOn; try { localStorage.setItem('mbSound', soundOn ? 'on' : 'off'); } catch (e) {} updateSound(); sfx('tick'); };
  $('#supportBtn').onclick = () => {
    S.support = !S.support; save(); hud(); sfx('tap'); if (S.name) queueSync();
    toast(S.support ? '🤝 Support mode on: bigger text, hints open, extra help.' : 'Support mode off.');
    if (S.screen === 'start') { const c = $('#supportIn'); if (c) c.checked = S.support; }
    if (!layer.hidden && openI >= 0 && $('#boxTitle', layer)) { hintOpen = S.support || hintOpen; showBox(openI, false); }
  };
  $('#teacherBtn').onclick = () => { sfx('tap'); teacherOpen(); };

  /* ---------- Start ---------- */
  if (BOARD) {
    document.body.classList.add('board-mode'); $('#top .top-tools').hidden = true; $('#foot').hidden = true;
    renderWall(); setInterval(renderWall, 5000);
  } else {
    if (!S.name) S.screen = 'start';
    if (S.startedAt && !over() && left() === 0) { S.timeUp = true; S.screen = 'done'; queueSync(); }
    go(S.screen === 'done' && !over() ? 'play' : S.screen);
    if (S.name && (S.dirty || !S.entry)) sync();
  }
})();
