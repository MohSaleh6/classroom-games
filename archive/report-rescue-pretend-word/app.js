/* Report Rescue: browser game with a class leaderboard */
(function () {
  const R = window.RR;
  const $ = (s, el = document) => el.querySelector(s);
  const app = $('#app');
  const KEY = 'reportRescue.play.v2';
  const GAME_SECONDS = 900;
  const TOTAL = 200;
  const reduced = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const mmss = s => { s = Math.max(0, Math.round(s)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };

  /* ---------- Document + game state ---------- */
  const freshDoc = () => ({
    title: { font: 'Calibri', size: 14, bold: false, italic: false, underline: false, color: 'Black', align: 'left' },
    heading: { font: 'Calibri', size: 12, bold: false, italic: false, underline: false, color: 'Black', align: 'left', style: 'Normal' },
    para: { font: 'Times New Roman', size: 14, bold: false, italic: false, underline: false, color: 'Black', align: 'left' },
    keyword: { bold: false, italic: false, sel: false },
    order: ['intro', 'concl', 'h1', 'h2', 'byline'],
    list: 'none', spacing: 1.0, border: { style: 'none', color: 'Purple' },
    pic: { id: null, w: 3, wrap: 'inline' },
    shape: { type: null, text: '', fill: null },
    model: { id: null, rx: 0, ry: 0 },
    table: { cols: 0, rows: 0, fills: {}, sel: null, shade: null, bold: false, white: false, borders: 'none' },
    fixed: {}, spellTried: {}, spellCheck: false, spellPts: 0,
    print: { paper: 'Letter', orient: 'Landscape', margins: 'Narrow' }
  });
  const fresh = () => ({ name: '', topic: '', startedAt: 0, mi: 0, si: 0, score: 0, scores: {}, tries: 0, hint: false, streak: 0, best: 0,
    done: false, endReason: '', finalSeconds: 0, entry: null, saveStatus: '', saved: false, seen: {}, screen: 'start', D: freshDoc() });
  let S = fresh();
  try { const raw = localStorage.getItem(KEY); if (raw) { const o = JSON.parse(raw); if (o && o.D) S = Object.assign(fresh(), o); } } catch (e) {}
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };
  const T = () => R.TOPICS[S.topic];
  const D = () => S.D;
  const get = p => p.split('.').reduce((o, k) => o[k], S.D);
  const set = (p, v) => { const ks = p.split('.'); const last = ks.pop(); ks.reduce((o, k) => o[k], S.D)[last] = v; };

  /* ---------- Mascot: Inky the editor octopus ---------- */
  function mascot(mood) {
    const mouth = mood === 'wow' ? '<ellipse cx="60" cy="66" rx="7" ry="8" fill="#241B4B"/>'
      : mood === 'think' ? '<path d="M50 67 Q60 63 70 67" stroke="#241B4B" stroke-width="4" fill="none" stroke-linecap="round"/>'
      : '<path d="M46 63 Q60 77 74 63" stroke="#241B4B" stroke-width="4" fill="#FF7AA8" stroke-linecap="round"/>';
    return `<svg viewBox="0 0 120 120" aria-hidden="true">
      <g fill="#9B5DE5" stroke="#241B4B" stroke-width="4" stroke-linecap="round">
        <path d="M28 78 Q16 98 8 96 Q20 104 34 86"/><path d="M44 84 Q38 108 28 112 Q46 114 52 88"/>
        <path d="M68 88 Q74 114 92 112 Q82 108 76 84"/><path d="M86 86 Q100 104 112 96 Q104 98 92 78"/>
        <ellipse cx="60" cy="52" rx="42" ry="40"/>
      </g>
      <ellipse cx="34" cy="62" rx="7" ry="4.5" fill="#FF8FC7"/><ellipse cx="86" cy="62" rx="7" ry="4.5" fill="#FF8FC7"/>
      <circle cx="44" cy="46" r="13" fill="#fff" stroke="#241B4B" stroke-width="4"/><circle cx="76" cy="46" r="13" fill="#fff" stroke="#241B4B" stroke-width="4"/>
      <path d="M57 46 H63" stroke="#241B4B" stroke-width="4"/>
      <circle cx="${mood === 'think' ? 41 : 46}" cy="${mood === 'think' ? 42 : 47}" r="5" fill="#241B4B"/><circle cx="${mood === 'think' ? 73 : 78}" cy="${mood === 'think' ? 42 : 47}" r="5" fill="#241B4B"/>
      ${mouth}
      <g transform="rotate(-35 100 30)"><rect x="92" y="6" width="12" height="40" rx="3" fill="#FFD23F" stroke="#241B4B" stroke-width="3"/><path d="M92 46 L98 58 L104 46 Z" fill="#FFE2B8" stroke="#241B4B" stroke-width="3"/><rect x="92" y="6" width="12" height="8" fill="#FF4F9A" stroke="#241B4B" stroke-width="3"/></g>
    </svg>`;
  }

  /* ---------- Sound, confetti, toast ---------- */
  let soundOn = true, ac = null;
  try { soundOn = localStorage.getItem('rrSound') !== 'off'; } catch (e) {}
  function tone(f, t0, d, type, v) { const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.value = f; const t = ac.currentTime + t0; g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(v, t + .02); g.gain.exponentialRampToValueAtTime(.0001, t + d); o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + d + .05); }
  function sfx(k) {
    if (!soundOn) return;
    try {
      ac = ac || new (window.AudioContext || window.webkitAudioContext)(); if (ac.state === 'suspended') ac.resume();
      if (k === 'win') [523, 659, 784, 1047].forEach((f, i) => tone(f, i * .07, .16, 'triangle', .12));
      if (k === 'wrong') { tone(240, 0, .14, 'square', .05); tone(180, .12, .2, 'square', .05); }
      if (k === 'tap') tone(660, 0, .06, 'sine', .05);
      if (k === 'level') [392, 523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, i * .09, .22, 'triangle', .1));
      if (k === 'tick') tone(880, 0, .06, 'sine', .05);
      if (k === 'end') [784, 659, 523, 392].forEach((f, i) => tone(f, i * .14, .25, 'triangle', .1));
    } catch (e) {}
  }
  function confetti(n = 60) {
    if (reduced) return;
    const box = document.createElement('div'); box.className = 'confetti';
    const cols = ['#FF4F9A', '#FFD23F', '#21C7B0', '#4C8DFF', '#9B5DE5', '#FF9F43'];
    for (let i = 0; i < n; i++) { const p = document.createElement('i'); p.style.left = Math.random() * 100 + '%'; p.style.background = cols[i % 6]; p.style.setProperty('--dx', (Math.random() * 160 - 80) + 'px'); p.style.setProperty('--r', (Math.random() * 900 - 450) + 'deg'); p.style.animationDuration = (1.1 + Math.random()) + 's'; p.style.animationDelay = Math.random() * .25 + 's'; if (i % 3 === 0) p.style.borderRadius = '50%'; box.appendChild(p); }
    document.body.appendChild(box); setTimeout(() => box.remove(), 2700);
  }
  let toastT;
  function toast(msg) { let el = $('.toast'); if (!el) { el = document.createElement('div'); el.className = 'toast'; el.setAttribute('role', 'status'); document.body.appendChild(el); } el.textContent = msg; el.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => el.hidden = true, 2000); }
  function plusFx(pts, near) {
    const r = (near || $('#checkBtn') || app).getBoundingClientRect();
    const el = document.createElement('div'); el.className = 'plus'; el.textContent = '+' + pts + ' ⭐';
    el.style.left = (r.left + r.width / 2 - 40) + 'px'; el.style.top = (r.top - 10) + 'px';
    document.body.appendChild(el); setTimeout(() => el.remove(), 1200);
  }

  /* ---------- Missions and steps ---------- */
  const fmtGoals = (part, tg) => {
    const f = D()[part], out = [];
    if (tg.font) out.push({ t: 'Font: ' + tg.font, ok: f.font === tg.font });
    if (tg.size) out.push({ t: 'Size ' + tg.size, ok: f.size === tg.size });
    if (tg.bold) out.push({ t: 'Bold', ok: f.bold });
    if (tg.underline) out.push({ t: 'Underline', ok: f.underline });
    if (tg.color) out.push({ t: 'Colour: ' + tg.color, ok: f.color === tg.color });
    if (tg.align) out.push({ t: { center: 'Centre', left: 'Left', justify: 'Justify', right: 'Right' }[tg.align], ok: f.align === tg.align });
    return out;
  };
  const ORDER_T = ['byline', 'intro', 'h1', 'h2', 'concl'];
  const secName = id => ({ byline: '✍️ Byline', intro: '👋 Introduction', h1: '📋 ' + T().headings[0], h2: '📌 ' + T().headings[1], concl: '🏁 ' + T().headings[2] })[id];
  const blanksOk = () => T().table.blanks.map(([r, c], i) => ({ t: 'Gap ' + (i + 1), ok: D().table.fills[r + ',' + c] === T().table.rows[r][c] }));
  const DARK = ['Navy', 'Dark Green', 'Dark Purple'];

  const MISSIONS = [
    { id: 'm1', name: 'Text Studio', lesson: 'Formatting text', icon: '🖋️', color: '#FF6B5B', steps: [
      { id: 'title', tab: 'Home', title: 'Make the title POP!', sel: ['title'],
        say: () => `The title looks tiny and boring. Make it big and bold like a real magazine!`,
        goals: () => fmtGoals('title', { font: 'Arial Black', size: 28, bold: true, color: 'Dark Blue', align: 'center' }),
        rib: () => fmtRibbon('title'), hint: 'Use the Font box, the Size box, the B button, the Dark Blue colour and the Centre button.' },
      { id: 'heading', tab: 'Home', title: 'Style the 3 headings', sel: ['heading'],
        say: () => `All 3 headings are selected. Give them an orange, underlined look.`,
        goals: () => fmtGoals('heading', { font: 'Arial', size: 16, bold: true, underline: true, color: 'Orange' }),
        rib: () => fmtRibbon('heading'), hint: 'Font: Arial. Size: 16. Press B and U. Pick the orange circle.' },
      { id: 'para', tab: 'Home', title: 'Tidy the paragraphs', sel: ['para'],
        say: () => `The paragraphs use an old-style font. Make them neat and easy to read.`,
        goals: () => fmtGoals('para', { font: 'Calibri', size: 12, align: 'justify' }),
        rib: () => fmtRibbon('para'), hint: 'Font: Calibri. Size: 12. Justify makes both sides of the text straight.' },
      { id: 'keyword', tab: 'Home', title: 'Make the name stand out', sel: ['kw'],
        say: () => `Tap the yellow name <b>${esc(T().keyword)}</b> in the first paragraph. Then make it <b>Bold</b> and <i>Italic</i>.`,
        goals: () => [{ t: 'Select the name', ok: D().keyword.sel }, { t: 'Bold', ok: D().keyword.bold }, { t: 'Italic', ok: D().keyword.italic }],
        rib: () => kwRibbon(), hint: 'Tap the name in the page first. Then press B and I.' }
    ] },
    { id: 'm2', name: 'Layout Lab', lesson: 'Advanced formatting', icon: '📐', color: '#FF9F43', steps: [
      { id: 'style', tab: 'Home', title: 'Use a heading style', sel: ['heading'],
        say: () => `Styles help Word understand your report. Give the headings the <b>Heading 1</b> style.`,
        goals: () => [{ t: 'Style: Heading 1', ok: D().heading.style === 'Heading 1' }],
        rib: () => styleRibbon(), hint: 'Look in the Styles gallery and tap Heading 1. Watch the Navigation box!' },
      { id: 'order', tab: 'View', title: 'Fix the messy order', sel: [],
        say: () => `Oh no, the parts are mixed up! Use ▲ and ▼ to put them in the right order.`,
        goals: () => ORDER_T.map((id, i) => ({ t: (i + 1) + '. ' + secName(id).replace(/^\S+\s/, ''), ok: D().order[i] === id })),
        rib: () => orderRibbon(), hint: 'Order: Byline, Introduction, ' + '{h1}, {h2}, Conclusion. The byline goes right under the title.' },
      { id: 'list', tab: 'Home', title: 'Make a bullet list', sel: ['list'],
        say: () => `These 4 lines should be a list. Add <b>bullets</b>!`,
        goals: () => [{ t: 'Bullets •', ok: D().list === 'bullets' }],
        rib: () => btnGroup('Paragraph', 'list', [['none', '¶', 'No list'], ['bullets', '•', 'Bullets'], ['numbers', '1.', 'Numbering']], true), hint: 'Tap the Bullets button with the dot •.' },
      { id: 'spacing', tab: 'Home', title: 'Give the text space', sel: ['para'],
        say: () => `The lines are squashed together. Set the line spacing to <b>1.5</b>.`,
        goals: () => [{ t: 'Line spacing 1.5', ok: D().spacing === 1.5 }],
        rib: () => btnGroup('Line spacing', 'spacing', [[1, '☰', '1.0'], [1.15, '☰', '1.15'], [1.5, '☰', '1.5'], [2, '☰', '2.0']], true), hint: 'Tap the button that says 1.5.' },
      { id: 'border', tab: 'Design', title: 'Add a page border', sel: [],
        say: () => `Frame the page! Pick any page border and any colour you like.`,
        goals: () => [{ t: 'A page border', ok: D().border.style !== 'none' }],
        rib: () => borderRibbon(), hint: 'Choose any border except None. Try Rainbow!' }
    ] },
    { id: 'm3', name: 'Picture Party', lesson: 'Images and graphics', icon: '🖼️', color: '#21C7B0', steps: [
      { id: 'pic', tab: 'Insert', title: 'Insert a picture', sel: [],
        say: () => `A magazine needs pictures! Insert a picture that matches <b>${esc(T().name)}</b>.`,
        goals: () => [{ t: 'A matching picture', ok: D().pic.id === T().pic }],
        rib: () => picRibbon(), hint: 'Which picture is about your topic? Not the sock!' },
      { id: 'resize', tab: 'Picture Format', title: 'Resize the picture', sel: ['pic'],
        say: () => `Make the picture about <b>6 cm</b> wide. Drag the slider.`,
        goals: () => [{ t: 'Width about 6 cm', ok: D().pic.w >= 5.5 && D().pic.w <= 6.5 }],
        rib: () => rangeRibbon('Width', 'pic.w', 2, 12, .5, ' cm'), hint: 'Move the slider until it says 6 cm.' },
      { id: 'wrap', tab: 'Picture Format', title: 'Wrap text around it', sel: ['pic'],
        say: () => `The picture is pushing the words away. Choose <b>Square</b> so the text wraps around it.`,
        goals: () => [{ t: 'Wrap: Square', ok: D().pic.wrap === 'square' }],
        rib: () => btnGroup('Wrap Text', 'pic.wrap', [['inline', '▭', 'In Line'], ['square', '▣', 'Square'], ['behind', '⬚', 'Behind Text'], ['front', '◼', 'In Front']], true), hint: 'Try each one and watch the page. You need Square.' },
      { id: 'shape', tab: 'Insert', title: 'Add a fun shape', sel: [],
        say: () => `Add a <b>${R.SHAPES[T().shape].label}</b> shape, give it a bright colour, and type <b>${esc(T().shapeText)}</b> inside.`,
        goals: () => [{ t: 'Shape: ' + R.SHAPES[T().shape].label, ok: D().shape.type === T().shape }, { t: 'A fill colour', ok: !!D().shape.fill }, { t: 'Text: ' + T().shapeText, ok: norm(D().shape.text) === norm(T().shapeText) }],
        rib: () => shapeRibbon(), hint: 'Pick the shape, pick a colour, then type the words in the text box.' },
      { id: 'model', tab: 'Insert', title: 'Insert a 3D model', sel: ['model'],
        say: () => `Insert the 3D model that matches your topic. Then spin it to match the blue dotted cube!`,
        goals: () => [{ t: 'Right 3D model', ok: D().model.id === T().model }, { t: 'Turn ≈ 45°', ok: Math.abs(D().model.ry - 45) <= 15 }, { t: 'Tilt ≈ -20°', ok: Math.abs(D().model.rx + 20) <= 15 }],
        rib: () => modelRibbon(), hint: 'Drag the cube with your finger, or use the sliders: Turn 45 and Tilt -20.' }
    ] },
    { id: 'm4', name: 'Table Builder', lesson: 'Working with tables', icon: '📊', color: '#4C8DFF', steps: [
      { id: 'tinsert', tab: 'Insert', title: 'Insert a table', sel: [],
        say: () => `Readers love quick facts! Insert a table with <b>3 columns</b> and <b>5 rows</b>.`,
        goals: () => [{ t: '3 columns', ok: D().table.cols === 3 }, { t: '5 rows', ok: D().table.rows === 5 }],
        rib: () => gridRibbon(), hint: 'Columns go across ↔. Rows go down ↕. Tap the box 3 across and 5 down.' },
      { id: 'tfill', tab: 'Table', title: 'Fill the gaps', sel: ['table'],
        say: () => `Read the fact cards. Tap a yellow gap in the table, then tap the right answer.`,
        goals: blanksOk, rib: () => fillRibbon(), hint: 'Read each fact card slowly. Each card tells you one missing answer.' },
      { id: 'theader', tab: 'Table Design', title: 'Style the top row', sel: ['table'],
        say: () => `Make the top row (the header) stand out: a <b>dark</b> shading colour, <b>Bold</b>, and <b>white</b> text.`,
        goals: () => [{ t: 'Dark shading', ok: DARK.includes(D().table.shade) }, { t: 'Bold', ok: D().table.bold }, { t: 'White text', ok: D().table.white }],
        rib: () => headerRibbon(), hint: 'Pick Navy, Dark Green or Dark Purple. Then press B and choose White text.' },
      { id: 'tborder', tab: 'Table Design', title: 'Add borders', sel: ['table'],
        say: () => `Give every cell a line. Choose <b>All Borders</b>.`,
        goals: () => [{ t: 'All Borders', ok: D().table.borders === 'all' }],
        rib: () => btnGroup('Borders', 'table.borders', [['none', '⬚', 'No Border'], ['outside', '▢', 'Outside'], ['all', '⊞', 'All Borders'], ['thick', '⬛', 'Thick Box']], true), hint: 'All Borders looks like a window ⊞.' }
    ] },
    { id: 'm5', name: 'Spell & Print', lesson: 'Check and print', icon: '🔍', color: '#9B5DE5', steps: [
      { id: 'spell', tab: 'Review', title: 'Spelling hunt!', sel: [], auto: true,
        say: () => `There are <b>5 spelling mistakes</b> hiding in the paragraphs. Tap a wrong word to fix it. Find them yourself for 2 points each!`,
        goals: () => [{ t: 'Fixed ' + Object.keys(D().fixed).length + ' of 5', ok: Object.keys(D().fixed).length === 5 }],
        rib: () => spellRibbon(), hint: 'Read each paragraph slowly. Stuck? Press Spelling Check: it shows red lines, but each word is then worth 1 point.' },
      { id: 'print', tab: 'File', title: 'Print Preview', sel: [],
        say: () => `Last step! Set up the page for printing: <b>A4</b> paper, <b>Portrait</b>, <b>Normal</b> margins.`,
        goals: () => [{ t: 'Paper: A4', ok: D().print.paper === 'A4' }, { t: 'Portrait', ok: D().print.orient === 'Portrait' }, { t: 'Normal margins', ok: D().print.margins === 'Normal' }],
        rib: () => printRibbon(), hint: 'Portrait is tall like a door. Landscape is wide like a TV.' }
    ] }
  ];
  const ALL_STEPS = MISSIONS.flatMap(m => m.steps);
  const curM = () => MISSIONS[S.mi];
  const curStep = () => curM() && curM().steps[S.si];
  const norm = v => String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  const mPts = m => m.steps.reduce((a, s) => a + (S.scores[s.id] || 0), 0);
  const fillTxt = s => String(s).replace('{h1}', T() ? T().headings[0] : '').replace('{h2}', T() ? T().headings[1] : '');

  /* ---------- Ribbon builders ---------- */
  const pressed = (path, v) => String(get(path)) === String(v);
  function btnGroup(label, path, items, big) {
    return `<div class="rg"><small>${label}</small><div class="opts">${items.map(([v, ic, lab]) =>
      `<button type="button" class="rb ${big ? 'big' : ''}" data-set="${path}" data-val="${esc(v)}" aria-pressed="${pressed(path, v)}">${big ? `<span class="e">${ic}</span>${esc(lab)}` : esc(lab)}</button>`).join('')}</div></div>`;
  }
  function selectBox(label, path, opts) {
    return `<div class="rg"><small>${label}</small><select class="rsel" data-set="${path}" aria-label="${label}">${opts.map(o => `<option ${String(get(path)) === String(o) ? 'selected' : ''}>${o}</option>`).join('')}</select></div>`;
  }
  function toggles(part, keys) {
    const lab = { bold: '<b>B</b>', italic: '<i>I</i>', underline: '<u>U</u>' };
    return `<div class="rg"><small>Style</small><div class="opts">${keys.map(k => `<button type="button" class="rb" data-tog="${part}.${k}" aria-pressed="${!!get(part + '.' + k)}" aria-label="${k}">${lab[k]}</button>`).join('')}</div></div>`;
  }
  function colors(label, path, map) {
    return `<div class="rg"><small>${label}</small><div class="opts">${Object.entries(map).map(([n, hex]) => `<button type="button" class="sw" style="background:${hex}" data-set="${path}" data-val="${n}" aria-pressed="${get(path) === n}" aria-label="${n}" title="${n}"></button>`).join('')}</div></div>`;
  }
  function fmtRibbon(part) {
    return selectBox('Font', part + '.font', Object.keys(R.FONTS)) + selectBox('Size', part + '.size', R.SIZES) + toggles(part, ['bold', 'italic', 'underline']) +
      colors('Font colour', part + '.color', R.COLORS) +
      btnGroup('Align', part + '.align', [['left', '', '⇤ Left'], ['center', '', '↔ Centre'], ['right', '', '⇥ Right'], ['justify', '', '☰ Justify']]);
  }
  function kwRibbon() {
    const on = D().keyword.sel;
    return `<div class="rg"><small>Style</small><div class="opts">
      <button type="button" class="rb" data-tog="keyword.bold" aria-pressed="${D().keyword.bold}" ${on ? '' : 'disabled style="opacity:.4"'} aria-label="Bold"><b>B</b></button>
      <button type="button" class="rb" data-tog="keyword.italic" aria-pressed="${D().keyword.italic}" ${on ? '' : 'disabled style="opacity:.4"'} aria-label="Italic"><i>I</i></button></div></div>
      <div class="rg"><small>Tip</small><div class="small">${on ? '✅ Name selected!' : '👆 Tap the yellow name in the page first'}</div></div>`;
  }
  function styleRibbon() {
    const st = [['Normal', 'Aa', 'Normal'], ['Title', '𝐀𝐚', 'Title'], ['Heading 1', 'Aa', 'Heading 1'], ['Heading 2', 'Aa', 'Heading 2'], ['Quote', '“Aa”', 'Quote']];
    const nav = D().heading.style === 'Heading 1' ? T().headings.map(h => `<div>▸ ${esc(h)}</div>`).join('') : '<div class="muted">No headings found yet</div>';
    return btnGroup('Styles', 'heading.style', st, true) + `<div class="rg"><small>Navigation</small><div class="navpane">${nav}</div></div>`;
  }
  function orderRibbon() {
    return `<div class="rg" style="flex:1 1 100%"><small>Sections (top to bottom)</small><div style="display:grid;gap:5px">${D().order.map((id, i) =>
      `<div class="opts" style="align-items:center"><button type="button" class="rb" data-move="${i},-1" aria-label="Move up" ${i ? '' : 'disabled style="opacity:.3"'}>▲</button><button type="button" class="rb" data-move="${i},1" aria-label="Move down" ${i < 4 ? '' : 'disabled style="opacity:.3"'}>▼</button><span style="padding-left:6px">${esc(secName(id))}</span></div>`).join('')}</div></div>`;
  }
  function borderRibbon() {
    return btnGroup('Page Borders', 'border.style', [['none', '⬚', 'None'], ['line', '▢', 'Line'], ['thick', '⬛', 'Thick'], ['dashed', '┅', 'Dashed'], ['dotted', '⋯', 'Dotted'], ['double', '◫', 'Double'], ['rainbow', '🌈', 'Rainbow']], true) +
      colors('Border colour', 'border.color', R.COLORS);
  }
  function picRibbon() {
    return `<div class="rg"><small>Pictures</small><div class="opts">${R.PIC_CHOICES[S.topic].map(id => { const p = R.PICS[id];
      return `<button type="button" class="rb big" data-set="pic.id" data-val="${id}" aria-pressed="${D().pic.id === id}" style="background:${p.bg}"><span class="e">${p.em}</span>${esc(p.label)}</button>`; }).join('')}</div></div>`;
  }
  function rangeRibbon(label, path, min, max, step, unit) {
    return `<div class="rg"><small>${label}</small><div class="ruler"><span>📏</span><input type="range" min="${min}" max="${max}" step="${step}" value="${get(path)}" data-range="${path}" aria-label="${label}"><b data-show="${path}" data-unit="${unit}">${get(path)}${unit}</b></div></div>`;
  }
  const FILLS = { Yellow: '#FFD23F', Pink: '#FF8FC7', Mint: '#7EE0C3', Sky: '#8EC5FF', Orange: '#FFB067' };
  function shapeRibbon() {
    const sh = Object.entries(R.SHAPES).map(([id, s]) => `<button type="button" class="rb big" data-set="shape.type" data-val="${id}" aria-pressed="${D().shape.type === id}"><svg viewBox="0 0 100 100" width="34" height="34"><path d="${s.path}" fill="${FILLS[D().shape.fill] || '#E6E1F7'}" stroke="#241B4B" stroke-width="5"/></svg>${s.label}</button>`).join('');
    return `<div class="rg"><small>Shapes</small><div class="opts">${sh}</div></div>` + colors('Shape fill', 'shape.fill', FILLS) +
      `<div class="rg"><small>Text in the shape</small><input class="rtext" data-text="shape.text" maxlength="24" value="${esc(D().shape.text)}" placeholder="Type here" autocomplete="off" autocapitalize="characters" spellcheck="false" aria-label="Text in the shape"></div>`;
  }
  function cubeHTML(id, rx, ry, ghost) {
    const m = R.MODELS[id] || R.MODELS.cow;
    const faces = [1, 2, 3, 4, 5, 6].map(i => `<div class="f${i}" style="background:${i % 2 ? m.c1 : m.c2}">${m.em}</div>`).join('');
    return `<div class="cube ${ghost ? 'ghost' : ''}" ${ghost ? '' : 'data-cube'} style="transform:rotateX(${rx}deg) rotateY(${ry}deg)">${faces}</div>`;
  }
  function modelRibbon() {
    const md = D().model;
    const gal = R.MODEL_CHOICES[S.topic].map(id => { const m = R.MODELS[id]; return `<button type="button" class="rb big" data-set="model.id" data-val="${id}" aria-pressed="${md.id === id}" style="background:${m.c2}"><span class="e">${m.em}</span>${esc(m.label)}</button>`; }).join('');
    return `<div class="rg"><small>3D Models</small><div class="opts">${gal}</div></div>
      <div class="rg"><small>Match this! 🎯</small><div class="stage" style="--k:.75">${cubeHTML(T().model, -20, 45, true)}</div></div>
      <div class="rg"><small>Spin it</small>
        <div class="ruler"><span>↔ Turn</span><input type="range" min="-180" max="180" step="5" value="${md.ry}" data-range="model.ry" aria-label="Turn"><b data-show="model.ry" data-unit="°">${md.ry}°</b></div>
        <div class="ruler"><span>↕ Tilt</span><input type="range" min="-90" max="90" step="5" value="${md.rx}" data-range="model.rx" aria-label="Tilt"><b data-show="model.rx" data-unit="°">${md.rx}°</b></div>
        <span class="small">Or drag the model in the page 👆</span></div>`;
  }
  function gridRibbon() {
    let h = '';
    for (let r = 1; r <= 7; r++) for (let c = 1; c <= 6; c++) h += `<button type="button" data-grid="${c},${r}" aria-label="${c} by ${r} table" class="${c <= D().table.cols && r <= D().table.rows ? 'hl' : ''}"></button>`;
    return `<div class="rg"><small>Insert Table</small><div class="gridpick" id="gridpick">${h}</div></div>
      <div class="rg"><small>Size</small><div style="font:700 1.6rem var(--display)" id="gridlbl">${D().table.cols ? D().table.cols + ' × ' + D().table.rows : '–'}</div><span class="small">columns × rows</span></div>`;
  }
  function tiles() {
    const tb = T().table; const answers = tb.blanks.map(([r, c]) => tb.rows[r][c]);
    const all = [answers[1], tb.extra[0], answers[0], tb.extra[2], answers[2], tb.extra[1]];
    return all;
  }
  function fillRibbon() {
    return `<div class="rg" style="flex:1 1 260px"><small>Fact cards</small><ul class="clues">${T().table.clues.map(c => `<li>${esc(c)}</li>`).join('')}</ul></div>
      <div class="rg" style="flex:1 1 220px"><small>Answers (tap a gap first)</small><div class="tiles">${tiles().map(v => `<button type="button" class="tile" data-tile="${esc(v)}">${esc(v)}</button>`).join('')}</div></div>`;
  }
  const SHADES = { 'Light Yellow': '#FFF3B0', 'Light Blue': '#DCEBFF', 'Navy': '#1F3A93', 'Dark Green': '#1E6B45', 'Dark Purple': '#5B2A86' };
  function headerRibbon() {
    return colors('Shading', 'table.shade', SHADES) +
      `<div class="rg"><small>Style</small><div class="opts"><button type="button" class="rb" data-tog="table.bold" aria-pressed="${D().table.bold}" aria-label="Bold"><b>B</b></button></div></div>` +
      `<div class="rg"><small>Text colour</small><div class="opts"><button type="button" class="rb" data-set="table.white" data-val="false" aria-pressed="${!D().table.white}">⚫ Black</button><button type="button" class="rb" data-set="table.white" data-val="true" aria-pressed="${D().table.white}">⚪ White</button></div></div>`;
  }
  function spellRibbon() {
    return `<div class="rg"><small>Proofing</small><div class="opts"><button type="button" class="rb big" id="spellBtn" aria-pressed="${D().spellCheck}"><span class="e">🔤</span>Spelling Check</button></div></div>
      <div class="rg"><small>Score so far</small><div style="font:700 1.5rem var(--display)">⭐ ${D().spellPts}</div><span class="small">${D().spellCheck ? 'Spelling Check is on: 1 point per word' : '2 points per word you find'}</span></div>`;
  }
  function printRibbon() {
    return btnGroup('Paper', 'print.paper', [['A4', '📄', 'A4'], ['Letter', '📃', 'Letter'], ['A3', '🗞️', 'A3']], true) +
      btnGroup('Orientation', 'print.orient', [['Portrait', '▯', 'Portrait'], ['Landscape', '▭', 'Landscape']], true) +
      btnGroup('Margins', 'print.margins', [['Normal', '▣', 'Normal'], ['Narrow', '■', 'Narrow'], ['Wide', '□', 'Wide']], true);
  }

  /* ---------- Page ---------- */
  function css(f, extra) {
    return `font-family:${R.FONTS[f.font]};font-size:calc(${f.size}px * var(--k));font-weight:${f.bold ? 800 : 400};font-style:${f.italic ? 'italic' : 'normal'};text-decoration:${f.underline ? 'underline' : 'none'};color:${R.COLORS[f.color]};text-align:${f.align};${extra || ''}`;
  }
  function fixedText(part) {
    let s = T()[part];
    T().mistakes.forEach((m, i) => { if (D().fixed[i]) s = s.replace(m.wrong, m.right); });
    return s;
  }
  function wordsHTML(str, part, spell) {
    if (!spell) return esc(str);
    return str.split(/(\s+)/).map(tok => {
      if (!tok.trim()) return tok;
      const core = tok.replace(/^[^A-Za-z]+|[^A-Za-z]+$/g, '');
      const mi = T().mistakes.findIndex(m => m.where === part && m.wrong === core);
      const fx = T().mistakes.findIndex((m, i) => m.where === part && m.right === core && D().fixed[i]);
      if (mi >= 0) return `<span class="w mis ${D().spellCheck ? 'found' : ''}" data-m="${mi}">${esc(tok)}</span>`;
      if (fx >= 0) return `<span class="w fixed">${esc(tok)}</span>`;
      return `<span class="w" data-okw>${esc(tok)}</span>`;
    }).join('');
  }
  function paraHTML(part, spell, cls) {
    const st = curStep(), d = D(), text = fixedText(part);
    const lh = `line-height:${(d.spacing * 1.3).toFixed(2)}`;
    let inner;
    if (part === 'intro') {
      const k = T().keyword, at = text.indexOf(k);
      const kwCls = 'kw' + (st && st.id === 'keyword' ? ' tap' : '') + (d.keyword.sel && st && st.id === 'keyword' ? ' on' : '') + (st && st.sel.includes('kw') ? ' sel' : '');
      const kw = `<span class="${kwCls}" style="font-weight:${d.keyword.bold ? 800 : 'inherit'};font-style:${d.keyword.italic ? 'italic' : 'inherit'}">${esc(k)}</span>`;
      inner = wordsHTML(text.slice(0, at), part, spell) + kw + wordsHTML(text.slice(at + k.length), part, spell);
    } else inner = wordsHTML(text, part, spell);
    return `<p class="${cls || ''}" data-part="${part}" style="${css(d.para, lh)}">${inner}</p>`;
  }
  function pageHTML() {
    const st = curStep() || {}, d = D(), t = T();
    const sel = x => (st.sel || []).includes(x) ? ' sel' : '';
    const spell = st.id === 'spell';
    const hd = i => `<h2 class="hd${sel('heading')}" ${d.heading.style !== 'Normal' ? `data-st="${d.heading.style === 'Heading 1' ? 'H1' : d.heading.style === 'Heading 2' ? 'H2' : d.heading.style === 'Title' ? 'T' : '“'}"` : ''} style="${css(d.heading)}">${esc(t.headings[i])}</h2>`;
    const shape = d.shape.type ? `<div class="shape${sel('shape')}"><svg viewBox="0 0 100 100"><path d="${R.SHAPES[d.shape.type].path}" fill="${FILLS[d.shape.fill] || '#ECE8F7'}" stroke="#241B4B" stroke-width="3"/></svg><span>${esc(d.shape.text)}</span></div>` : '';
    const pic = d.pic.id ? `<div class="pic ${d.pic.wrap}${sel('pic')}" style="--pw:calc(${d.pic.w * 22}px * var(--k));width:var(--pw);background:${R.PICS[d.pic.id].bg}"><span class="e">${R.PICS[d.pic.id].em}</span></div>` : '';
    const lstStyle = css(d.para, `line-height:${(d.spacing * 1.3).toFixed(2)};text-align:left`);
    const lst = d.list === 'numbers' ? 'ol' : 'ul';
    const list = `<${lst} class="${d.list === 'none' ? 'plain' : ''}${sel('list')}">${t.list.map(x => `<li style="${lstStyle}">${esc(x)}</li>`).join('')}</${lst}>`;
    const model = d.model.id ? `<div class="model3d${sel('model')}"><div class="stage" data-rot>${cubeHTML(d.model.id, d.model.rx, d.model.ry)}</div></div>` : '';
    let table = '';
    if (d.table.cols) {
      const tb = t.table, real = d.table.cols === 3 && d.table.rows === 5;
      const blankKeys = tb.blanks.map(([r, c]) => r + ',' + c);
      const hstyle = `background:${SHADES[d.table.shade] || 'transparent'};color:${d.table.white ? '#fff' : '#1d1d1f'};font-weight:${d.table.bold ? 800 : 400}`;
      let rows = '';
      for (let r = 0; r < d.table.rows; r++) {
        rows += '<tr>';
        for (let c = 0; c < d.table.cols; c++) {
          if (!real) { rows += r === 0 ? `<th style="${hstyle}"></th>` : '<td></td>'; continue; }
          if (r === 0) { rows += `<th style="${hstyle}">${esc(tb.headers[c])}</th>`; continue; }
          const key = (r - 1) + ',' + c;
          if (blankKeys.includes(key)) {
            const v = d.table.fills[key];
            const active = st.id === 'tfill';
            rows += `<td class="${active ? 'blank' : 'filled'}${d.table.sel === key && active ? ' picked' : ''}" ${active ? `data-b="${key}"` : ''}>${v ? esc(v) : (active ? '❓' : '')}</td>`;
          } else rows += `<td>${esc(tb.rows[r - 1][c])}</td>`;
        }
        rows += '</tr>';
      }
      table = `<p class="cap">Table 1: ${esc(tb.caption)}</p><table class="ptable b-${d.table.borders}${sel('table')}">${rows}</table>`;
    }
    const blocks = {
      byline: `<p class="byline">Written by: ${esc(S.name)}, Grade 7</p>`,
      intro: `<div class="blk intro">${pic}${paraHTML('intro', spell, sel('para').trim())}</div>`,
      h1: hd(0) + list + model,
      h2: hd(1) + paraHTML('body', spell, sel('para').trim()) + table,
      concl: hd(2) + paraHTML('concl', spell, sel('para').trim())
    };
    return `<div class="titlerow">${shape}<h1 class="ttl${sel('title')}" style="${css(d.title)}">${esc(t.name)}</h1></div>` + d.order.map(id => blocks[id]).join('');
  }
  function renderPage() {
    const pg = $('#page'); if (!pg) return;
    const d = D(), st = curStep() || {};
    pg.className = 'page' + (d.border.style !== 'none' ? ' bd-' + d.border.style : '') + (st.id === 'print' ? ` o-${d.print.orient.toLowerCase()} m-${d.print.margins.toLowerCase()}` : '');
    pg.style.setProperty('--bc', R.COLORS[d.border.color]);
    pg.innerHTML = (st.id === 'print' ? `<span class="paperlabel">${esc(d.print.paper)} · ${esc(d.print.orient)}</span>` : '') + pageHTML();
    $('.appwin').classList.toggle('pv', st.id === 'print');
    scalePage();
  }
  function scalePage() { const pg = $('#page'); if (pg) pg.style.setProperty('--k', Math.max(.5, Math.min(1, pg.clientWidth / 680)).toFixed(3)); }
  window.addEventListener('resize', scalePage);

  /* ---------- HUD ---------- */
  function hud() {
    const inGame = S.screen === 'studio' && !S.done;
    $('#timerPill').hidden = $('#scorePill').hidden = $('#endBtn').hidden = !inGame;
    $('#mdots').hidden = !(S.screen === 'studio');
    $('#score').textContent = S.score;
    $('#streakPill').hidden = !(inGame && S.streak >= 2); $('#streak').textContent = S.streak;
    $('#mdots').innerHTML = MISSIONS.map((m, i) => {
      const done = m.steps.filter(s => s.id in S.scores).length;
      return `<div class="mdot ${done === m.steps.length ? 'done' : ''} ${i === S.mi && !S.done ? 'now' : ''}" style="--f:${done / m.steps.length * 100}%"><i></i><span>${m.icon} <span class="lbl">${esc(m.name)}</span></span></div>`;
    }).join('');
    tick(true);
  }
  function timeLeft() { return S.startedAt ? GAME_SECONDS - (Date.now() - S.startedAt) / 1000 : GAME_SECONDS; }
  function tick(quiet) {
    if (S.screen !== 'studio' || S.done) return;
    const left = timeLeft();
    $('#timer').textContent = mmss(left);
    $('#timerPill').classList.toggle('warn', left <= 60);
    if (!quiet && left <= 10 && left > 0) sfx('tick');
    if (left <= 0) finish('time');
  }
  setInterval(() => tick(false), 1000);

  /* ---------- Screens ---------- */
  function go(screen) { S.screen = screen; save(); ({ start: renderStart, studio: renderStudio, results: renderResults, board: renderBigBoard })[screen](); hud(); window.scrollTo(0, 0); }

  let pick = '';
  function renderStart() {
    const topics = Object.values(R.TOPICS).map(t => `<button class="choice" type="button" style="--c:${t.color}" data-topic="${t.id}" aria-pressed="${pick === t.id}"><span class="em">${t.emoji}</span><b>${esc(t.name)}</b><span>${esc(t.blurb)}</span></button>`).join('');
    app.innerHTML = `
      <section class="hero">
        <div class="mascot">${mascot('happy')}</div>
        <div><h1>Report Rescue!</h1>
        <p class="lead">Hi! I'm <b>Inky</b>, the magazine editor. Our report is a total mess and the magazine prints <b>today</b>! Can you fix it before the deadline? 🕐</p></div>
      </section>
      <section class="card" style="--accent:var(--pink)">
        <span class="kicker">How to play</span>
        <div class="how">
          <div><span class="big">🖋️</span><b>5 missions</b>Format text, add pictures, shapes, 3D models and a table.</div>
          <div><span class="big">✅</span><b>Match the goals</b>Use the buttons. Goals turn green when they're right!</div>
          <div><span class="big">⭐</span><b>10 points each</b>Right on your first try = 10. After a mistake or a hint = 5.</div>
          <div><span class="big">⏱️</span><b>15 minutes</b>Most points wins. Same points? The faster editor wins!</div>
        </div>
      </section>
      ${prizeHTML()}
      <section class="card" style="--accent:var(--yellow)">
        <span class="kicker">Step 1 · Pick your report</span>
        <div class="choices">${topics}</div>
      </section>
      <section class="card" style="--accent:var(--teal)">
        <span class="kicker">Step 2 · Your name</span>
        <div class="field"><label for="nameIn">First and last name</label><input id="nameIn" maxlength="20" autocomplete="off" placeholder="For example: Sara Ahmad"></div>
        <p class="err" id="startErr" role="alert"></p>
        <div class="row" style="margin-top:14px"><button class="btn pink" id="startBtn" type="button">Start the rescue! 🚀</button><button class="btn sm" id="startBoard" type="button">🏆 Leaderboard</button></div>
        <p class="small muted" style="margin:10px 0 0">You can play one time. Your score goes to the class leaderboard by itself.</p>
      </section>`;
    app.querySelectorAll('[data-topic]').forEach(b => b.onclick = () => { pick = b.dataset.topic; sfx('tap'); app.querySelectorAll('[data-topic]').forEach(x => x.setAttribute('aria-pressed', x === b)); });
    $('#startBoard').onclick = openBoard;
    const nameIn = $('#nameIn');
    nameIn.addEventListener('keydown', e => { if (e.key === 'Enter') $('#startBtn').click(); });
    $('#startBtn').onclick = async () => {
      const n = nameIn.value.trim().replace(/\s+/g, ' ').slice(0, 20), err = $('#startErr'), btn = $('#startBtn');
      if (!pick) { err.textContent = 'Pick a report first! 👆'; return; }
      if (!n) { err.textContent = 'Type your name first.'; nameIn.focus(); return; }
      btn.disabled = true; btn.textContent = 'Getting ready…';
      let entry = null;
      try { const d = await api('/api/scores', { method: 'POST', body: JSON.stringify({ name: n }) }); entry = { id: d.id, token: d.token }; }
      catch (e) {
        if (e.status === 409) { err.textContent = 'This name already played. Each student plays one time. Ask Ms Rahaf if this is a mistake.'; btn.disabled = false; btn.textContent = 'Start the rescue! 🚀'; return; }
      }
      S = fresh(); S.name = n; S.topic = pick; S.entry = entry; S.startedAt = Date.now();
      sfx('level'); go('studio');
    };
  }

  function renderStudio() {
    if (S.done) return go('results');
    const m = curM();
    app.innerHTML = `<div class="studio" style="--mc:${m.color}">
      <aside class="task" id="task"></aside>
      <section class="appwin" aria-label="Pretend Word window">
        <div class="titlebar"><span class="w">W</span> ${esc(T().name)}.docx — Wordy<span class="dots"><i></i><i></i><i></i></span></div>
        <div class="ribbon" id="ribbon"></div>
        <div class="pagewrap" id="pw"><div class="page" id="page"></div></div>
      </section></div>`;
    renderTask(); renderRibbon(); renderPage();
    if (S.si === 0 && !S.seen[m.id]) splash(m);
    else focusSel();
  }
  function renderTask() {
    const m = curM(), st = curStep();
    $('#task').innerHTML = `
      <span class="mtag">${m.icon} Mission ${S.mi + 1} · ${esc(m.name)}</span>
      <div class="stepdots" aria-label="Step ${S.si + 1} of ${m.steps.length}">${m.steps.map((s, i) => `<i class="${s.id in S.scores ? 'd' : i === S.si ? 'n' : ''}"></i>`).join('')}</div>
      <h2>${esc(st.title)}</h2>
      <div class="say">${mascot(S.tries ? 'think' : 'happy')}<div class="bubble">${st.say()}</div></div>
      <ul class="targets" id="goals"></ul>
      <div class="acts">${st.auto ? '' : '<button class="btn green" id="checkBtn" type="button">Check ✓</button>'}<button class="btn sm" id="hintBtn" type="button">💡 Hint</button></div>
      <div class="fb" id="fb" role="status" aria-live="polite"></div>
      <p class="small muted" style="margin:10px 0 0">Lesson: ${esc(m.lesson)}</p>`;
    renderGoals();
    const cb = $('#checkBtn'); if (cb) cb.onclick = check;
    $('#hintBtn').onclick = () => { if (!curStep().auto) S.hint = true; save(); fb('hint', '💡 ' + esc(fillTxt(curStep().hint))); sfx('tap'); };
  }
  function renderGoals() { const g = $('#goals'); if (g) g.innerHTML = curStep().goals().map(x => `<li class="${x.ok ? 'ok' : ''}">${x.ok ? '✅' : '⬜'} ${esc(x.t)}</li>`).join(''); }
  function renderRibbon() {
    const st = curStep();
    const tabs = ['File', 'Home', 'Insert', 'Design', 'Layout', 'Review', 'View'];
    const extra = tabs.includes(st.tab) ? '' : `<span class="on">${esc(st.tab)}</span>`;
    $('#ribbon').innerHTML = `<div class="rtabs">${tabs.map(t => `<span class="${t === st.tab ? 'on' : ''}">${t}</span>`).join('')}${extra}</div><div class="rgroups">${st.rib()}</div>`;
  }
  function fb(kind, html) { const el = $('#fb'); if (el) { el.className = 'fb ' + kind; el.innerHTML = html; } }
  function refresh(full) { renderPage(); renderGoals(); if (full) renderRibbon(); save(); }
  function focusSel() {
    const el = $('#page .sel'); const pw = $('#pw');
    if (el && pw) { const top = el.getBoundingClientRect().top - pw.getBoundingClientRect().top + pw.scrollTop - 40; pw.scrollTop = Math.max(0, top); }
    else if (pw) pw.scrollTop = 0;
  }
  function splash(m) {
    S.seen[m.id] = 1; save();
    openModal(`<div class="splash"><div class="icon">${m.icon}</div><span class="kicker" style="--accent:${m.color}">Mission ${S.mi + 1} of 5</span>
      <h2>${esc(m.name)}</h2><p>Lesson: <b>${esc(m.lesson)}</b> · ${m.steps.length} quick tasks</p>
      <button class="btn pink" type="button" data-close>Let's go! 🚀</button></div>`, () => focusSel());
  }

  /* ---------- Checking + scoring ---------- */
  let busy = false;
  function check() {
    if (busy) return;
    const st = curStep(); const bad = st.goals().filter(g => !g.ok);
    if (bad.length) {
      S.tries++; S.streak = 0; save(); sfx('wrong');
      fb('bad', `<b>Almost!</b> Still to fix:<ul>${bad.map(b => `<li>${esc(b.t)}</li>`).join('')}</ul>`);
      const t = $('#task'); t.classList.remove('shake'); void t.offsetWidth; t.classList.add('shake');
      $('.say svg').outerHTML = mascot('think');
      hud(); return;
    }
    complete((S.tries === 0 && !S.hint) ? 10 : 5);
  }
  function complete(pts) {
    busy = true;
    const st = curStep();
    S.scores[st.id] = pts; S.score += pts;
    S.streak = pts === 10 || (st.id === 'spell' && pts >= 8) ? S.streak + 1 : 0; S.best = Math.max(S.best, S.streak);
    save(); sfx('win'); plusFx(pts, $('#checkBtn') || $('#goals')); hud();
    const praise = ['Awesome! 🎉', 'Super editor! 🦸', 'Looking great! ✨', 'Nailed it! 🎯', 'Wow! 🤩'][Object.keys(S.scores).length % 5];
    fb('ok', `<b>${praise}</b> +${pts} points${S.streak >= 2 ? ` · 🔥 ${S.streak} in a row!` : ''}`);
    $('.say svg').outerHTML = mascot('wow');
    setTimeout(() => {
      busy = false;
      if (S.done) return;
      S.si++; S.tries = 0; S.hint = false;
      if (S.si >= curM().steps.length) {
        confetti(); sfx('level');
        S.mi++; S.si = 0;
        if (S.mi >= MISSIONS.length) { S.mi = MISSIONS.length - 1; S.si = curM().steps.length - 1; return finish('done'); }
      }
      save(); renderStudio(); hud();
    }, 1100);
  }

  /* ---------- Interaction (one listener for everything) ---------- */
  document.addEventListener('click', e => {
    const c = e.target.closest('[data-close]'); if (c) { closeModal(); return; }
    if (S.screen !== 'studio' || S.done || busy) return;
    const st = curStep(); if (!st) return;
    let t;
    if ((t = e.target.closest('[data-set]')) && t.tagName !== 'SELECT') {
      let v = t.dataset.val; const cur = get(t.dataset.set);
      if (typeof cur === 'number') v = +v; else if (typeof cur === 'boolean') v = v === 'true';
      if (t.dataset.set === 'pic.id' && !D().pic.id) D().pic.w = 3;
      set(t.dataset.set, v); sfx('tap'); refresh(true);
      if (t.dataset.set === 'model.id') setTimeout(() => { const m = $('#page .model3d'); if (m) m.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }, 50);
      return;
    }
    if ((t = e.target.closest('[data-tog]'))) { set(t.dataset.tog, !get(t.dataset.tog)); sfx('tap'); refresh(true); return; }
    if ((t = e.target.closest('[data-move]'))) {
      const [i, dir] = t.dataset.move.split(',').map(Number); const o = D().order, j = i + dir;
      if (j < 0 || j >= o.length) return; [o[i], o[j]] = [o[j], o[i]]; sfx('tap'); refresh(true); return;
    }
    if ((t = e.target.closest('[data-grid]'))) { const [c2, r] = t.dataset.grid.split(',').map(Number); D().table.cols = c2; D().table.rows = r; sfx('tap'); refresh(true); setTimeout(() => { const tb = $('#page .ptable'); if (tb) tb.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }, 50); return; }
    if (st.id === 'keyword' && e.target.closest('.kw')) { D().keyword.sel = true; sfx('tap'); refresh(true); return; }
    if (st.id === 'tfill') {
      if ((t = e.target.closest('[data-b]'))) { D().table.sel = t.dataset.b; sfx('tap'); refresh(); return; }
      if ((t = e.target.closest('[data-tile]'))) {
        const keys = T().table.blanks.map(([r, c2]) => r + ',' + c2);
        const key = D().table.sel || keys.find(k => !D().table.fills[k]) || keys[0];
        D().table.fills[key] = t.dataset.tile;
        D().table.sel = keys.find(k => !D().table.fills[k]) || null;
        sfx('tap'); refresh(); return;
      }
    }
    if (st.id === 'spell') {
      if (e.target.closest('#spellBtn')) { if (!D().spellCheck) { D().spellCheck = true; sfx('tap'); refresh(true); toast('Red wavy lines show the mistakes. Each one is now worth 1 point.'); } return; }
      if ((t = e.target.closest('[data-m]'))) { openSpell(+t.dataset.m); return; }
      if ((t = e.target.closest('[data-okw]'))) { toast('“' + t.textContent.replace(/[^A-Za-z'-]/g, '') + '” is spelled right! 👍'); t.classList.add('shake'); setTimeout(() => t.classList.remove('shake'), 400); return; }
    }
  });
  document.addEventListener('change', e => {
    const t = e.target.closest('select[data-set]'); if (!t || S.screen !== 'studio') return;
    const cur = get(t.dataset.set); set(t.dataset.set, typeof cur === 'number' ? +t.value : t.value); sfx('tap'); refresh(true);
  });
  document.addEventListener('input', e => {
    if (S.screen !== 'studio') return;
    let t;
    if ((t = e.target.closest('[data-range]'))) { set(t.dataset.range, +t.value); syncLive(); renderPage(); renderGoals(); save(); }
    if ((t = e.target.closest('[data-text]'))) { set(t.dataset.text, t.value.slice(0, 24)); renderPage(); renderGoals(); save(); }
  });
  function syncLive() {
    document.querySelectorAll('[data-show]').forEach(b => b.textContent = get(b.dataset.show) + b.dataset.unit);
    document.querySelectorAll('[data-range]').forEach(r => { if (document.activeElement !== r) r.value = get(r.dataset.range); });
  }
  /* Drag to spin the 3D model */
  let drag = null;
  document.addEventListener('pointerdown', e => {
    if (S.screen !== 'studio' || !curStep() || curStep().id !== 'model') return;
    const st = e.target.closest('[data-rot]'); if (!st) return;
    drag = { x: e.clientX, y: e.clientY, rx: D().model.rx, ry: D().model.ry }; e.preventDefault();
  });
  document.addEventListener('pointermove', e => {
    if (!drag) return;
    let ry = drag.ry + (e.clientX - drag.x) * .6, rx = drag.rx - (e.clientY - drag.y) * .6;
    ry = ((ry + 180) % 360 + 360) % 360 - 180; rx = Math.max(-90, Math.min(90, rx));
    D().model.ry = Math.round(ry / 5) * 5; D().model.rx = Math.round(rx / 5) * 5;
    const cube = $('#page [data-cube]'); if (cube) cube.style.transform = `rotateX(${D().model.rx}deg) rotateY(${D().model.ry}deg)`;
    syncLive(); renderGoals();
  });
  document.addEventListener('pointerup', () => { if (drag) { drag = null; save(); } });

  /* Spelling fixer */
  function openSpell(i) {
    const m = T().mistakes[i]; if (D().fixed[i]) return;
    sfx('tap');
    openModal(`<h2>🔤 Fix the spelling</h2><p>The word <b style="text-decoration:underline wavy #E53935">${esc(m.wrong)}</b> is wrong. Which one is right?</p>
      <div class="row">${m.opts.map(o => `<button class="btn yellow" type="button" data-opt="${esc(o)}">${esc(o)}</button>`).join('')}</div>
      <p class="err" id="spErr"></p><div class="row" style="margin-top:10px"><button class="btn sm" type="button" data-close>Cancel</button></div>`);
    $('#modalCard').querySelectorAll('[data-opt]').forEach(b => b.onclick = () => {
      if (b.dataset.opt === m.right) {
        const pts = (D().spellCheck || D().spellTried[i]) ? 1 : 2;
        D().fixed[i] = true; D().spellPts += pts; save(); closeModal(); sfx('win'); plusFx(pts, $('#goals'));
        refresh(true);
        if (Object.keys(D().fixed).length === 5) complete(D().spellPts);
        else toast(`Fixed! ${5 - Object.keys(D().fixed).length} more to find 🔍`);
      } else { D().spellTried[i] = true; save(); sfx('wrong'); $('#spErr').textContent = 'Not that one. Look at each letter carefully!'; b.disabled = true; b.style.opacity = .4; }
    });
  }

  /* ---------- Finish ---------- */
  function finish(reason) {
    if (S.done) return;
    S.done = true; S.endReason = reason;
    S.finalSeconds = Math.min(GAME_SECONDS, Math.max(0, Math.round((Date.now() - S.startedAt) / 1000)));
    save(); closeModal(); sfx(reason === 'done' ? 'level' : 'end');
    go('results');
  }
  function rankFor(s) { return R.RANKS.find(r => s >= r.min); }
  function renderResults() {
    const all = ALL_STEPS.every(s => s.id in S.scores);
    const rk = rankFor(S.score);
    app.innerHTML = `
      <section class="card" style="--accent:var(--yellow);text-align:center">
        <span class="kicker">${S.endReason === 'time' ? "⏰ Time's up!" : S.endReason === 'ended' ? 'Game ended' : '🎉 Report rescued!'}</span>
        ${all ? `<div class="badge"><div><small>School Magazine</small>READY TO PUBLISH<small>${esc(S.name)}</small></div></div>` : `<div class="mascot" style="width:150px;margin:0 auto">${mascot('happy')}</div>`}
        <p class="bigscore">${S.score}<span style="font-size:.4em">/${TOTAL}</span></p>
        <p style="font:700 1.5rem var(--display);margin:4px 0">${rk.emoji} ${rk.name}</p>
        <p class="muted">⏱ Time: ${mmss(S.finalSeconds)} · 🔥 Best streak: ${S.best}</p>
        <div class="mstars">${MISSIONS.map(m => { const p = mPts(m), mx = m.steps.length * 10; return `<div><span>${m.icon} ${esc(m.name)}</span><b>${p}/${mx} ${'⭐'.repeat(Math.round(p / mx * 3))}</b></div>`; }).join('')}</div>
        <p class="save-status" id="saveStatus"></p>
      </section>
      <section class="card" style="--accent:var(--pink)">
        <span class="kicker">🏆 Class leaderboard</span>
        <p class="place-line" id="placeLine"></p>
        <div data-board></div>
        <div class="row" style="margin-top:14px"><button class="btn pink" type="button" id="nextBtn">Next player ▶</button></div>
      </section>`;
    $('#nextBtn').onclick = () => { S = fresh(); pick = ''; save(); go('start'); };
    if (S.endReason === 'done' || all) confetti(90);
    renderSaveStatus(); renderBoards(); saveRun(); refreshBoard();
  }

  /* ---------- Leaderboard ---------- */
  const MEDALS = ['🥇', '🥈', '🥉'];
  const GIFTS = ['🎁 +5 marks, treat, 10 min', '🎁 +3 marks, 10 min', '🎁 10 min free time'];
  const PRIZE_TEXT = ['+5 bonus marks, a sweet treat and 10 minutes free time', '+3 bonus marks and 10 minutes free time', '10 minutes free time'];
  const Board = { rows: [], loaded: false, error: '', pin: '' };
  function prizeHTML() {
    return `<div class="prize"><h3>🏆 Top 3 editors win prizes!</h3>
      <div class="prow"><span class="pm">🥇 1st</span><ul><li>⭐ +5 Bonus Marks</li><li>🍬 A Sweet Treat</li><li>🎮 10 Minutes FREE TIME</li></ul></div>
      <div class="prow"><span class="pm">🥈 2nd</span><ul><li>⭐ +3 Bonus Marks</li><li>🎮 10 Minutes FREE TIME</li></ul></div>
      <div class="prow"><span class="pm">🥉 3rd</span><ul><li>🎮 10 Minutes FREE TIME</li></ul></div>
      <p>The prizes will be given by <b>Ms Rahaf</b> to the first 3 participants on the leaderboard.</p></div>`;
  }
  async function api(path, opts = {}) {
    const r = await fetch(path, { cache: 'no-store', headers: { 'Content-Type': 'application/json' }, ...opts });
    let data = {}; try { data = await r.json(); } catch (e) {}
    if (!r.ok) { const e = new Error(data.error || 'http_' + r.status); e.status = r.status; throw e; }
    return data;
  }
  async function refreshBoard() {
    try { const d = await api('/api/scores'); Board.rows = (d.scores || []).filter(x => x && typeof x.name === 'string'); Board.loaded = true; Board.error = ''; }
    catch (e) { Board.error = 'Could not load the leaderboard. Check the internet.'; }
    renderBoards();
  }
  const ranked = () => Board.rows.filter(r => r.finished).sort((a, b) => b.points - a.points || a.seconds - b.seconds || a.ts - b.ts);
  const playing = () => Board.rows.filter(r => !r.finished);
  const isMe = r => S.saveStatus === 'saved' && r.name.toLowerCase() === S.name.toLowerCase();
  function boardHTML() {
    const rows = ranked(), pl = playing();
    const rm = r => Board.pin ? `<button type="button" class="rm" data-rm="${esc(r.id)}">✕ Remove</button>` : '';
    let table;
    if (!Board.loaded && !Board.error) table = '<div class="board-wrap"><p class="board-empty">Loading the leaderboard…</p></div>';
    else if (!rows.length && !pl.length) table = '<div class="board-wrap"><p class="board-empty">No scores yet. Be the first editor on the board! 🚀</p></div>';
    else table = `<div class="board-wrap"><table class="board"><thead><tr><th>Place</th><th>Editor</th><th>Points</th><th>Time</th></tr></thead><tbody>${rows.map((r, i) => `<tr class="${i < 3 ? 'p' + (i + 1) : ''}">
        <td class="place">${MEDALS[i] || i + 1}</td><td>${esc(r.name)}${isMe(r) ? '<span class="you">You</span>' : ''}${i < 3 ? `<span class="gift">${GIFTS[i]}</span>` : ''}${rm(r)}</td>
        <td class="num">${r.points}/${TOTAL}</td><td class="num">${mmss(r.seconds)}</td></tr>`).join('')}${pl.map(r => `<tr class="playing"><td class="place">✏️</td><td>${esc(r.name)}${rm(r)}</td><td class="num">–</td><td class="num">playing…</td></tr>`).join('')}</tbody></table></div>`;
    return prizeHTML() + table + `<p class="board-note">Most points wins. Same points? The faster time wins. ✏️ = still playing. The board updates by itself. ${esc(Board.error)}</p>`;
  }
  function renderBoards() {
    document.querySelectorAll('[data-board]').forEach(el => el.innerHTML = boardHTML());
    const line = $('#placeLine');
    if (line) { const i = ranked().findIndex(isMe); line.textContent = i < 0 ? '' : i < 3 ? `🎉 You are number ${i + 1} right now! Your prize from Ms Rahaf: ${PRIZE_TEXT[i]}.` : `You are number ${i + 1} on the leaderboard. Great work, editor!`; }
    const clr = $('#boardClear'); if (clr) clr.hidden = !Board.pin;
  }
  setInterval(() => { if (!document.hidden && (S.screen === 'results' || S.screen === 'board' || !$('#modal').hidden && $('#modalCard [data-board]'))) refreshBoard(); }, 6000);

  function renderSaveStatus() {
    const el = $('#saveStatus'); if (!el) return; const st = S.saveStatus;
    el.className = 'save-status' + (st === 'saved' ? ' ok' : st === 'error' || st === 'taken' ? ' bad' : '');
    el.innerHTML = st === 'saving' ? '⏳ Saving your score…' : st === 'saved' ? `✅ Saved! ${esc(S.name)}: ${S.score} points in ${mmss(S.finalSeconds)}.`
      : st === 'taken' ? 'This name already has a score, so this game was not saved. Ask Ms Rahaf.' : st === 'error' ? 'Your score could not be saved. Check the internet. <button class="btn sm green" type="button" id="retrySave">Try again</button>' : '';
    const b = $('#retrySave'); if (b) b.onclick = () => { S.saved = false; saveRun(); };
  }
  async function saveRun() {
    if (S.saved) return;
    S.saved = true; S.saveStatus = 'saving'; save(); renderSaveStatus();
    const result = { points: S.score, seconds: S.finalSeconds };
    for (let a = 0; a < 3; a++) {
      try {
        if (S.entry) {
          try { await api('/api/scores', { method: 'PUT', body: JSON.stringify({ ...S.entry, ...result }) }); }
          catch (e) { if (e.status !== 404) throw e; S.entry = null; continue; }
        } else await api('/api/scores', { method: 'POST', body: JSON.stringify({ name: S.name, ...result }) });
        S.saveStatus = 'saved'; break;
      } catch (e) {
        if (e.status === 409) { S.saveStatus = 'taken'; break; }
        S.saveStatus = 'error'; await new Promise(r => setTimeout(r, 1500));
      }
    }
    if (S.saveStatus !== 'saved') S.saved = S.saveStatus === 'taken';
    save(); renderSaveStatus(); refreshBoard();
  }

  /* Teacher tools */
  function teacherPanel() {
    return `<details class="teacher-add"><summary>👩‍🏫 Teacher tools</summary><div class="add-row"><input id="pinIn" type="password" inputmode="numeric" maxlength="12" placeholder="Teacher PIN" aria-label="Teacher PIN" autocomplete="off"><button class="btn green sm" type="button" id="pinBtn">Unlock</button></div><p class="add-msg" id="pinMsg"></p></details>`;
  }
  async function unlock() {
    const pin = $('#pinIn').value.trim(), msg = $('#pinMsg');
    if (!pin) { msg.className = 'add-msg bad'; msg.textContent = 'Type the teacher PIN.'; return; }
    try { await api('/api/teacher', { method: 'POST', body: JSON.stringify({ pin, action: 'check' }) }); Board.pin = pin; $('#pinIn').value = ''; msg.className = 'add-msg ok'; msg.textContent = 'Unlocked! Remove a name to let that student play again, or clear the board for a new class.'; renderBoards(); }
    catch (e) { msg.className = 'add-msg bad'; msg.textContent = e.status === 401 ? 'Wrong PIN.' : 'Could not connect.'; }
  }
  let clearArm = null;
  async function clearBoard() {
    const b = $('#boardClear'); if (!Board.pin) return;
    if (!clearArm) { b.textContent = 'Tap again to clear ALL scores'; clearArm = setTimeout(() => { clearArm = null; b.textContent = 'Clear leaderboard'; }, 3000); return; }
    clearTimeout(clearArm); clearArm = null; b.textContent = 'Clear leaderboard';
    try { await api('/api/teacher', { method: 'POST', body: JSON.stringify({ pin: Board.pin, action: 'clear' }) }); $('#pinMsg').className = 'add-msg ok'; $('#pinMsg').textContent = 'The board is clear. Ready for a new class!'; } catch (e) {}
    refreshBoard();
  }
  document.addEventListener('click', async e => {
    const r = e.target.closest('[data-rm]');
    if (r && Board.pin) { try { await api('/api/teacher', { method: 'POST', body: JSON.stringify({ pin: Board.pin, action: 'remove', id: Number(r.dataset.rm) }) }); } catch (err) {} refreshBoard(); return; }
    if (e.target.closest('#pinBtn')) unlock();
    if (e.target.closest('#boardClear')) clearBoard();
  });
  function openBoard() {
    openModal(`<div class="row" style="justify-content:space-between;margin-bottom:10px"><h2 style="margin:0">🏆 Leaderboard</h2><button class="btn sm" type="button" data-close>✕ Close</button></div>
      ${teacherPanel()}<div data-board></div><div class="row" style="margin-top:12px"><button class="btn red sm" type="button" id="boardClear" hidden>Clear leaderboard</button></div>`);
    renderBoards(); refreshBoard();
  }
  function renderBigBoard() {
    document.body.classList.add('bigboard');
    app.innerHTML = `<section class="card" style="--accent:var(--pink)"><div class="row" style="justify-content:space-between"><h2 style="margin:0">🏆 Report Rescue Leaderboard</h2><div class="mascot" style="width:90px">${mascot('happy')}</div></div>
      ${teacherPanel()}<div data-board></div><div class="row" style="margin-top:12px"><button class="btn red sm" type="button" id="boardClear" hidden>Clear leaderboard</button></div></section>`;
    renderBoards(); refreshBoard();
  }

  /* ---------- Modal ---------- */
  let onClose = null;
  function openModal(html, cb) { $('#modalCard').innerHTML = html; $('#modal').hidden = false; onClose = cb || null; const f = $('#modalCard').querySelector('button, input'); f && f.focus({ preventScroll: true }); }
  function closeModal() { if ($('#modal').hidden) return; $('#modal').hidden = true; const cb = onClose; onClose = null; cb && cb(); }
  $('#modal').addEventListener('click', e => { if (e.target.id === 'modal') closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  /* ---------- Top buttons ---------- */
  function updateSound() { $('#soundBtn').textContent = soundOn ? '🔊' : '🔇'; $('#soundBtn').setAttribute('aria-label', soundOn ? 'Sound on' : 'Sound off'); }
  $('#soundBtn').onclick = () => { soundOn = !soundOn; try { localStorage.setItem('rrSound', soundOn ? 'on' : 'off'); } catch (e) {} updateSound(); sfx('tap'); };
  $('#boardBtn').onclick = openBoard;
  $('#endBtn').onclick = () => openModal(`<h2>End the game now?</h2><p>Your points so far will go to the leaderboard. You can't play again.</p>
    <div class="row"><button class="btn sm" type="button" data-close>Keep playing</button><button class="btn red" type="button" id="endOk">End game</button></div>`);
  document.addEventListener('click', e => { if (e.target.closest('#endOk')) { closeModal(); finish('ended'); } });

  /* ---------- Boot ---------- */
  updateSound();
  if (new URLSearchParams(location.search).has('board')) { S = fresh(); S.screen = 'board'; renderBigBoard(); hud(); }
  else if (S.done) go('results');
  else if (S.screen === 'studio' && S.startedAt && T()) { if (timeLeft() <= 0) finish('time'); else go('studio'); }
  else { S = fresh(); go('start'); }
})();
