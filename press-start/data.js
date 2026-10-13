/* PRESS START: content. Pages, pictures, shapes, 3D models and the 11 job tickets. */
window.PS = (function () {
  const MAX_SECONDS = 660; // time is saved for the leaderboard tie-break; the database allows up to 660

  /* ---------- Look-up lists for the editor ---------- */
  const FONTS = ['Calibri', 'Arial', 'Arial Black', 'Times New Roman', 'Georgia', 'Impact', 'Verdana', 'Comic Sans MS'];
  const FONT_CSS = {
    'Calibri': "Calibri, Carlito, 'Instrument Sans', sans-serif",
    'Arial': "Arial, 'Liberation Sans', Helvetica, sans-serif",
    'Arial Black': "'Arial Black', 'Archivo Black', Arial, sans-serif",
    'Times New Roman': "'Times New Roman', Tinos, Times, serif",
    'Georgia': "Georgia, Gelasio, serif",
    'Impact': "Impact, Anton, 'Arial Narrow', sans-serif",
    'Verdana': "Verdana, 'DejaVu Sans', sans-serif",
    'Comic Sans MS': "'Comic Sans MS', 'Comic Neue', cursive"
  };
  const SIZES = [8, 10, 11, 12, 14, 16, 18, 20, 24, 28, 36, 48, 72];
  const SPACINGS = [1, 1.15, 1.5, 2];
  const COLOURS = {
    black: { name: 'Black', hex: '#1A1A1A' }, grey: { name: 'Grey', hex: '#6B6B6B' }, red: { name: 'Red', hex: '#E03A2F' },
    orange: { name: 'Orange', hex: '#F07F1F' }, yellow: { name: 'Yellow', hex: '#FFD23F' }, green: { name: 'Green', hex: '#2E9E5B' },
    blue: { name: 'Blue', hex: '#2F6FE0' }, navy: { name: 'Dark Blue', hex: '#1E2F6B' }, purple: { name: 'Purple', hex: '#7A43C9' },
    white: { name: 'White', hex: '#FFFFFF' }, accent: { name: 'Blue, Accent 1', hex: '#2F5496' },
    lightblue: { name: 'Light Blue', hex: '#CFE0F7' }, lightgrey: { name: 'Light Grey', hex: '#E6E6E6' }, wordblue: { name: 'Blue', hex: '#4472C4' }
  };
  const FONT_COLOURS = ['black', 'grey', 'red', 'orange', 'yellow', 'green', 'blue', 'navy', 'purple', 'white'];
  const FILL_COLOURS = ['wordblue', 'yellow', 'red', 'orange', 'green', 'purple', 'black', 'white'];
  const SHADE_COLOURS = ['none', 'navy', 'lightblue', 'orange', 'lightgrey', 'green', 'yellow'];
  const STYLES = {
    normal: { name: 'Normal', fmt: { font: 'Calibri', size: 11, bold: false, color: 'black' } },
    title: { name: 'Title', fmt: { font: 'Calibri', size: 28, bold: false, color: 'black' } },
    h1: { name: 'Heading 1', fmt: { font: 'Calibri', size: 16, bold: false, color: 'accent' } },
    h2: { name: 'Heading 2', fmt: { font: 'Calibri', size: 13, bold: false, color: 'accent' } }
  };
  const BORDERS = { none: 'None', box: 'Box', thick: 'Thick', double: 'Double', dotted: 'Dotted' };
  const WRAPS = { inline: 'In Line with Text', square: 'Square', tight: 'Tight', behind: 'Behind Text', front: 'In Front of Text' };
  const TABLE_BORDERS = { none: 'No Border', outside: 'Outside Borders', all: 'All Borders' };

  /* ---------- Pictures: small poster-style artworks. {u} is replaced by a unique id. ---------- */
  const PICS = {
    car: { name: 'Race Car', svg: `<svg viewBox="0 0 160 100" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="{u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1B1446"/><stop offset="1" stop-color="#5B1E6E"/></linearGradient></defs>
      <rect width="160" height="100" fill="url(#{u})"/><circle cx="124" cy="24" r="11" fill="#FFB347"/>
      <path d="M0 62V46h12v-8h12v16h10V34h14v22h12V44h14v18h16V40h12v14h14V46h14v16h12v8H0z" fill="#120D33"/>
      <rect y="68" width="160" height="32" fill="#0C0A22"/><path d="M0 92h20m12 0h20m12 0h20m12 0h20m12 0h20" stroke="#FF3D7F" stroke-width="2"/>
      <path d="M36 82q2-11 15-13l19-2q8-8 21-8h17q11 1 17 9l8 2q6 2 6 9v3H36z" fill="#FF6A1A"/><path d="M73 67q6-6 18-6h12q8 1 13 6z" fill="#2B2560"/>
      <circle cx="57" cy="83" r="8" fill="#141218"/><circle cx="57" cy="83" r="3" fill="#C9C9D6"/><circle cx="118" cy="83" r="8" fill="#141218"/><circle cx="118" cy="83" r="3" fill="#C9C9D6"/>
      <path d="M4 72h24M10 77h18M2 82h20" stroke="#FF3D7F" stroke-width="2" stroke-linecap="round" opacity=".85"/></svg>` },
    controller: { name: 'Controller', svg: `<svg viewBox="0 0 160 100" preserveAspectRatio="xMidYMid slice"><rect width="160" height="100" fill="#FFD23F"/>
      <circle cx="20" cy="18" r="30" fill="#FFC21A"/><path d="M44 38q8-8 22-6h28q14-2 22 6 12 14 10 28-2 10-12 8-8-2-14-10H60q-6 8-14 10-10 2-12-8-2-14 10-28z" fill="#1D1B2E"/>
      <rect x="52" y="44" width="5" height="16" rx="1" fill="#F4F1EA"/><rect x="46.5" y="49.5" width="16" height="5" rx="1" fill="#F4F1EA"/>
      <circle cx="104" cy="45" r="4" fill="#FF4A1C"/><circle cx="112" cy="52" r="4" fill="#2F6FE0"/><circle cx="96" cy="52" r="4" fill="#2E9E5B"/><circle cx="104" cy="59" r="4" fill="#F4F1EA"/></svg>` },
    trophy: { name: 'Trophy', svg: `<svg viewBox="0 0 160 100" preserveAspectRatio="xMidYMid slice"><rect width="160" height="100" fill="#127C78"/>
      <path d="M0 100L60 0h12L12 100zM148 100L88 0h12l60 100z" fill="#16908B"/>
      <path d="M60 30H48q0 16 14 18M100 30h12q0 16-14 18" stroke="#F4C430" stroke-width="5" fill="none"/>
      <path d="M60 22h40v18a20 20 0 0 1-40 0z" fill="#F4C430"/><rect x="76" y="58" width="8" height="10" fill="#E0A800"/><rect x="64" y="68" width="32" height="9" rx="2" fill="#E0A800"/>
      <path d="M80 28l3 6 6 1-4.5 4 1 6-5.5-3-5.5 3 1-6-4.5-4 6-1z" fill="#FFF3C4"/></svg>` },
    city: { name: 'Night City', svg: `<svg viewBox="0 0 160 100" preserveAspectRatio="xMidYMid slice"><rect width="160" height="100" fill="#0E1630"/>
      <circle cx="128" cy="20" r="9" fill="#F4F1EA"/><circle cx="132" cy="17" r="8" fill="#0E1630"/>
      <path d="M0 100V58h14V40h16v22h10V28h18v34h8V48h16v52zM78 100V36h14v14h12V22h20v30h10V44h16v12h10v44z" fill="#1F2B58"/>
      <g fill="#FFD23F"><rect x="34" y="34" width="3" height="4"/><rect x="42" y="42" width="3" height="4"/><rect x="34" y="50" width="3" height="4"/><rect x="18" y="46" width="3" height="4"/><rect x="108" y="30" width="3" height="4"/><rect x="116" y="38" width="3" height="4"/><rect x="108" y="54" width="3" height="4"/><rect x="82" y="44" width="3" height="4"/><rect x="140" y="52" width="3" height="4"/><rect x="62" y="56" width="3" height="4"/></g>
      <g fill="#FF3D7F"><rect x="42" y="34" width="3" height="4"/><rect x="116" y="54" width="3" height="4"/><rect x="88" y="60" width="3" height="4"/></g></svg>` },
    headset: { name: 'Headset', svg: `<svg viewBox="0 0 160 100" preserveAspectRatio="xMidYMid slice"><rect width="160" height="100" fill="#FF5C8A"/>
      <circle cx="140" cy="86" r="34" fill="#FF7AA0"/><path d="M50 62V50a30 30 0 0 1 60 0v12" stroke="#1D1B2E" stroke-width="8" fill="none"/>
      <rect x="40" y="50" width="18" height="28" rx="7" fill="#1D1B2E"/><rect x="102" y="50" width="18" height="28" rx="7" fill="#1D1B2E"/>
      <path d="M49 76q2 12 18 12h6" stroke="#1D1B2E" stroke-width="4" fill="none"/><rect x="72" y="84" width="10" height="7" rx="3" fill="#1D1B2E"/></svg>` },
    planet: { name: 'Planet', svg: `<svg viewBox="0 0 160 100" preserveAspectRatio="xMidYMid slice"><rect width="160" height="100" fill="#0B0B22"/>
      <g fill="#F4F1EA"><circle cx="18" cy="16" r="1.2"/><circle cx="40" cy="70" r="1"/><circle cx="140" cy="20" r="1.4"/><circle cx="124" cy="80" r="1"/><circle cx="20" cy="88" r="1.2"/><circle cx="98" cy="10" r="1"/></g>
      <ellipse cx="80" cy="52" rx="44" ry="9" fill="none" stroke="#FFD23F" stroke-width="3" transform="rotate(-14 80 52)"/>
      <circle cx="80" cy="50" r="22" fill="#7A43C9"/><path d="M62 42q18 6 36-2M60 54q20 6 40-2" stroke="#9A6BE0" stroke-width="3" fill="none"/>
      <path d="M37 60q43-6 86-26" stroke="#FFD23F" stroke-width="3" fill="none"/></svg>` }
  };

  /* ---------- Shapes (viewBox 0 0 100 100) ---------- */
  const starPath = (n, R, r, cy = 50) => {
    let d = '';
    for (let i = 0; i < n * 2; i++) {
      const rad = i % 2 ? r : R, a = Math.PI / n * i - Math.PI / 2;
      d += (i ? 'L' : 'M') + (50 + rad * Math.cos(a)).toFixed(1) + ' ' + (cy + rad * Math.sin(a)).toFixed(1);
    }
    return d + 'Z';
  };
  const SHAPES = {
    rect: { name: 'Rectangle', d: 'M6 20h88v60H6z' },
    rounded: { name: 'Rounded Rectangle', d: 'M22 20h56a16 16 0 0 1 16 16v28a16 16 0 0 1-16 16H22A16 16 0 0 1 6 64V36a16 16 0 0 1 16-16z' },
    oval: { name: 'Oval', d: 'M6 50a44 34 0 1 0 88 0a44 34 0 1 0-88 0z' },
    star: { name: 'Star', d: starPath(5, 47, 19, 54) },
    starburst: { name: 'Starburst', d: starPath(12, 48, 35) },
    bubble: { name: 'Speech Bubble', d: 'M14 12h72a8 8 0 0 1 8 8v42a8 8 0 0 1-8 8H46L26 88l4-18H14a8 8 0 0 1-8-8V20a8 8 0 0 1 8-8z' },
    arrow: { name: 'Arrow', d: 'M6 36h52V14l36 36-36 36V64H6z' }
  };

  /* ---------- 3D models (CSS cubes). Face order: front, back, right, left, top, bottom ---------- */
  const MODELS = { dice: { name: 'Game Dice' }, crate: { name: 'Crate' }, block: { name: 'Mystery Block' } };

  /* ---------- Page text ---------- */
  const F = o => Object.assign({ font: 'Calibri', size: 11, bold: false, italic: false, underline: false, color: 'black', align: 'left', style: 'normal', list: 'none', spacing: 1 }, o);
  const COVER_BODY = 'This summer, five new games are coming out. Our team played all of them. The best one is Neon Drift, a racing game where you build your own car and race through a glowing city at night.';
  const SPELL = [
    { wrong: 'isue', right: 'issue', opts: ['isseu', 'issue', 'is sue'] },
    { wrong: 'realy', right: 'really', opts: ['really', 'reely', 'relay'] },
    { wrong: 'vist', right: 'visit', opts: ['vest', 'vast', 'visit'] },
    { wrong: 'peple', right: 'people', opts: ['people', 'pebble', 'peeple'] }
  ];
  // {0} {1} … mark where the spelling mistakes go.
  const LETTER = 'Thank you for reading this {0} of Press Start. Our team worked {1} hard to make it, and we hope you enjoy every page. Next month we will {2} a real game studio and meet the {3} who make the games you love. See you then, and keep playing!';
  const TABLE_HEAD = ['Game', 'Type', 'Score'];
  const TABLE_ROWS = [['Neon Drift', 'Racing', '4.8'], ['Pixel Quest', 'Puzzle', '4.5'], ['Sky Builders', 'Building', '4.6']];
  const TABLE_BLANKS = [[1, 2], [2, 1], [3, 0]]; // [row, col] in the full table (row 0 = header)
  const CHIPS = ['4.8', 'Racing', 'Puzzle', 'Sky Builders', '4.2'];
  const CLUES = ['Neon Drift got a score of 4.8.', 'Pixel Quest is a Puzzle game.', 'The Building game is Sky Builders.'];

  const PAGES = [
    { id: 'cover', num: '01', topic: 'Formatting text', name: 'Cover' },
    { id: 'review', num: '02', topic: 'Advanced formatting', name: 'Top 4' },
    { id: 'feature', num: '03', topic: 'Images and graphics', name: 'Feature' },
    { id: 'stats', num: '04', topic: 'Working with tables', name: 'Ratings' },
    { id: 'letter', num: '05', topic: 'Check and print', name: 'Print' }
  ];
  function freshDocs() {
    return [
      { blocks: {
        kicker: { text: 'COVER STORY', fmt: F({ font: 'Arial', size: 10, bold: true, color: 'red' }) },
        headline: { text: 'The Summer of Games', fmt: F({ size: 14 }) },
        body: { text: COVER_BODY, kw: 'Neon Drift', kwFmt: { bold: false, italic: false, underline: false }, fmt: F({ font: 'Times New Roman', size: 11 }) } } },
      { cols: 1, border: 'none', blocks: {
        h_a: { text: 'How We Test Games', fmt: F({ size: 11 }) },
        para: { text: 'Every game is played by three of our writers for one full week. They check the story, the controls, the music and how much fun it is to play with friends. Then they give it a score.', fmt: F({ size: 11 }) },
        h_b: { text: 'Our Top 4', fmt: F({ size: 11 }) },
        list: { items: ['Neon Drift', 'Sky Builders', 'Pixel Quest', 'Robo League'], fmt: F({ size: 11 }) } } },
      { pic: null, shape: null, model: null, blocks: {
        heading: { text: 'Inside Neon Drift', fmt: F({ font: 'Arial Black', size: 22, color: 'orange' }) },
        para: { text: 'In Neon Drift, you start with an old car and a small garage. Win races to earn coins, then spend them on new wheels, lights and engines. The city changes every night, so no two races are the same. The best part is the online cup, where you race against players from all over the world. Our tip: save your coins for a better engine first.', fmt: F({ size: 11 }) } } },
      { table: null, blocks: {
        heading: { text: 'Reader Ratings', fmt: F({ font: 'Arial Black', size: 22, color: 'navy' }) },
        para: { text: 'We asked 200 readers to give each game a score out of 5. Here are the results.', fmt: F({ size: 11 }) } } },
      { fixed: [false, false, false, false], blocks: {
        heading: { text: 'From the Editor', fmt: F({ font: 'Georgia', size: 20, italic: true }) },
        para: { text: LETTER, fmt: F({ font: 'Georgia', size: 11, spacing: 1.15 }) } } }
    ];
  }
  const freshPrint = () => ({ paper: 'Letter', orient: 'landscape', copies: 1, pages: 'current', margins: 'normal' });

  /* ---------- The 11 job tickets ---------- */
  // ok(D, PR) checks a spec. apply(D, PR) makes the brief (also used when a ticket is skipped).
  // sel: what to click on the page first. path: where the tool is (also the real Word path).
  const near = (a, b, tol) => Math.abs(a - b) <= tol;
  const norm = s => String(s || '').toUpperCase().replace(/[^A-Z]/g, '');
  const tbl = D => D[3].table;
  const cellOk = (t, r, c, v) => !!(t && t.rows[r] && t.rows[r][c] && t.rows[r][c].t === v);
  const firstRowsOk = t => !!t && TABLE_ROWS.every((row, i) => row.every((v, c) => cellOk(t, i + 1, c, v))) && TABLE_HEAD.every((v, c) => cellOk(t, 0, c, v));
  const headFmt = t => (t && t.rowFmt[0]) || {};
  const TICKETS = [
    { page: 0, title: 'Loud headline',
      msg: 'The cover headline is too quiet. Make it LOUD so people see it from across the room.',
      tip: '<b>How the editor works:</b> click something on the page to select it (it gets a blue frame), then use the toolbar.',
      specs: [
        { t: 'Headline font: <b>Impact</b>', ok: D => D[0].blocks.headline.fmt.font === 'Impact', sel: 'headline', tab: 'home', ctl: 'font', path: ['Home', 'Font', 'Impact'] },
        { t: 'Headline size: <b>36</b>', ok: D => D[0].blocks.headline.fmt.size === 36, sel: 'headline', tab: 'home', ctl: 'size', path: ['Home', 'Font Size', '36'] },
        { t: 'Headline colour: <b>Red</b>', ok: D => D[0].blocks.headline.fmt.color === 'red', sel: 'headline', tab: 'home', ctl: 'color', path: ['Home', 'Font Color', 'Red'] },
        { t: 'Headline: <b>Center</b>', ok: D => D[0].blocks.headline.fmt.align === 'center', sel: 'headline', tab: 'home', ctl: 'align-center', path: ['Home', 'Center'] }],
      apply: D => Object.assign(D[0].blocks.headline.fmt, { font: 'Impact', size: 36, color: 'red', align: 'center' }) },
    { page: 0, title: 'Clean cover text',
      msg: 'Good! Now make the cover text neat, and make the game name stand out.',
      specs: [
        { t: 'Text font: <b>Calibri</b>, size <b>12</b>', ok: D => D[0].blocks.body.fmt.font === 'Calibri' && D[0].blocks.body.fmt.size === 12, sel: 'body', tab: 'home', ctl: 'font', path: ['Home', 'Font', 'Calibri', 'Font Size', '12'] },
        { t: 'Text: <b>Justify</b>', ok: D => D[0].blocks.body.fmt.align === 'justify', sel: 'body', tab: 'home', ctl: 'align-justify', path: ['Home', 'Justify'] },
        { t: '“Neon Drift”: <b>Bold</b> and <b>Italic</b>', ok: D => D[0].blocks.body.kwFmt.bold && D[0].blocks.body.kwFmt.italic, sel: 'kw', tab: 'home', ctl: 'bold', path: ['Click “Neon Drift”', 'Home', 'B', 'I'] }],
      apply: D => { Object.assign(D[0].blocks.body.fmt, { font: 'Calibri', size: 12, align: 'justify' }); Object.assign(D[0].blocks.body.kwFmt, { bold: true, italic: true }); } },
    { page: 1, title: 'Styles and a list',
      msg: 'The review page has no order. Use proper headings, and number our Top 4.',
      specs: [
        { t: 'Both headings: <b>Heading 1</b> style', n: D => [D[1].blocks.h_a, D[1].blocks.h_b].filter(b => b.fmt.style === 'h1').length + '/2', ok: D => D[1].blocks.h_a.fmt.style === 'h1' && D[1].blocks.h_b.fmt.style === 'h1', sel: 'h_a', tab: 'home', ctl: 'style-h1', path: ['Home', 'Styles', 'Heading 1'] },
        { t: 'Top 4 games: <b>Numbering</b> (1. 2. 3. 4.)', ok: D => D[1].blocks.list.fmt.list === 'number', sel: 'list', tab: 'home', ctl: 'numbering', path: ['Home', 'Numbering'] }],
      apply: D => { ['h_a', 'h_b'].forEach(k => Object.assign(D[1].blocks[k].fmt, STYLES.h1.fmt, { style: 'h1' })); D[1].blocks.list.fmt.list = 'number'; } },
    { page: 1, title: 'Magazine layout',
      msg: 'Now give it a real magazine look: more space between lines, two columns and a frame.',
      specs: [
        { t: 'Paragraph line spacing: <b>1.5</b>', ok: D => D[1].blocks.para.fmt.spacing === 1.5, sel: 'para', tab: 'home', ctl: 'spacing', path: ['Home', 'Line Spacing', '1.5'] },
        { t: 'Page: <b>Two</b> columns', ok: D => D[1].cols === 2, sel: '', tab: 'layout', ctl: 'columns', path: ['Layout', 'Columns', 'Two'] },
        { t: 'Page border: <b>Box</b>', ok: D => D[1].border === 'box', sel: '', tab: 'design', ctl: 'border', path: ['Design', 'Page Borders', 'Box'] }],
      apply: D => { D[1].blocks.para.fmt.spacing = 1.5; D[1].cols = 2; D[1].border = 'box'; } },
    { page: 2, title: 'Photo time',
      msg: 'The feature page needs a photo of the car. Make it small enough for the text to go around it.',
      tip: 'Drag a <b>corner</b> of the picture to resize it, or use the Width buttons in Picture Format.',
      specs: [
        { t: 'Insert the <b>Race Car</b> picture', ok: D => !!D[2].pic && D[2].pic.id === 'car', sel: '', tab: 'insert', ctl: 'pics', path: ['Insert', 'Pictures', 'Race Car'] },
        { t: 'Picture width: <b>6 cm</b>', n: D => D[2].pic ? D[2].pic.w.toFixed(1) + ' cm' : '', ok: D => !!D[2].pic && near(D[2].pic.w, 6, 0.3), sel: 'pic', tab: 'picture', ctl: 'width', path: ['Drag a corner', 'or Picture Format', 'Width'] },
        { t: 'Wrap Text: <b>Square</b>', ok: D => !!D[2].pic && D[2].pic.wrap === 'square', sel: 'pic', tab: 'picture', ctl: 'wrap', path: ['Picture Format', 'Wrap Text', 'Square'] }],
      apply: D => { D[2].pic = { id: 'car', w: 6, wrap: 'square' }; } },
    { page: 2, title: 'Sticker',
      msg: 'Add a bright sticker in the corner that shouts NEW!',
      specs: [
        { t: 'Insert a <b>Starburst</b> shape', ok: D => !!D[2].shape && D[2].shape.type === 'starburst', sel: '', tab: 'insert', ctl: 'shapes', path: ['Insert', 'Shapes', 'Starburst'] },
        { t: 'Shape fill: <b>Yellow</b>', ok: D => !!D[2].shape && D[2].shape.fill === 'yellow', sel: 'shape', tab: 'shape', ctl: 'fill', path: ['Shape Format', 'Shape Fill', 'Yellow'] },
        { t: 'Shape text: <b>NEW!</b>', ok: D => !!D[2].shape && norm(D[2].shape.text) === 'NEW', sel: 'shape', tab: 'shape', ctl: 'stext', path: ['Shape Format', 'Shape Text', 'type NEW!'] }],
      apply: D => { D[2].shape = { type: 'starburst', fill: 'yellow', text: 'NEW!' }; } },
    { page: 2, title: '3D dice',
      msg: 'Readers love 3D. Add the dice model and turn it so it looks like the brief.',
      tip: 'Drag the model with your mouse to spin it. Look at the brief: which faces can you see?',
      specs: [
        { t: 'Insert the <b>Game Dice</b> 3D model', ok: D => !!D[2].model && D[2].model.id === 'dice', sel: '', tab: 'insert', ctl: 'models', path: ['Insert', '3D Models', 'Game Dice'] },
        { t: 'Turn: <b>40°</b> (left/right)', n: D => D[2].model ? Math.round(D[2].model.ry) + '°' : '', ok: D => !!D[2].model && near(D[2].model.ry, 40, 12), sel: 'model', tab: 'model', ctl: 'turn', path: ['Drag the model', 'or 3D Model', 'Turn'] },
        { t: 'Tilt: <b>-25°</b> (up/down)', n: D => D[2].model ? Math.round(D[2].model.rx) + '°' : '', ok: D => !!D[2].model && near(D[2].model.rx, -25, 12), sel: 'model', tab: 'model', ctl: 'tilt', path: ['Drag the model', 'or 3D Model', 'Tilt'] }],
      apply: D => { D[2].model = { id: 'dice', rx: -25, ry: 40 }; } },
    { page: 3, title: 'Build the table', chips: true,
      msg: 'Readers sent in their scores. Put them in a table. Three cells are empty: use my notes to fill them.',
      tip: 'Empty cells have yellow stripes. Not every note is right: read the clues!',
      specs: [
        { t: 'Insert a table: <b>3 columns × 4 rows</b>', ok: D => !!tbl(D) && tbl(D).rows.length >= 4 && tbl(D).rows[0].length === 3 && (tbl(D).rows.length === 4), sel: '', tab: 'insert', ctl: 'table', path: ['Insert', 'Table', '3×4'] },
        { t: 'Fill the <b>3 empty cells</b>', n: D => TABLE_BLANKS.filter(([r, c]) => cellOk(tbl(D), r, c, (r ? TABLE_ROWS[r - 1] : TABLE_HEAD)[c])).length + '/3',
          ok: D => TABLE_BLANKS.every(([r, c]) => cellOk(tbl(D), r, c, TABLE_ROWS[r - 1][c])), sel: '', tab: '', ctl: 'chips', path: ['Drag a note', 'onto a cell'] }],
      apply: D => { D[3].table = makeTable(4, 3, true); } },
    { page: 3, title: 'Pro table',
      msg: 'Make the table look professional, and add one empty row at the bottom for next week’s game.',
      specs: [
        { t: 'Add <b>1 empty row</b> at the bottom', ok: D => { const t = tbl(D); return !!t && t.rows.length === 5 && firstRowsOk(t) && t.rows[4].every(c => !c.t); }, sel: 'row:3', tab: 'tlayout', ctl: 'rowbelow', path: ['Click the last row', 'Table Layout', 'Insert Below'] },
        { t: 'Header row shading: <b>Dark Blue</b>', ok: D => headFmt(tbl(D)).shade === 'navy', sel: 'row:0', tab: 'tdesign', ctl: 'shade', path: ['Click the top row', 'Table Design', 'Shading', 'Dark Blue'] },
        { t: 'Header text: <b>White</b> and <b>Bold</b>', ok: D => headFmt(tbl(D)).color === 'white' && !!headFmt(tbl(D)).bold, sel: 'row:0', tab: 'home', ctl: 'color', path: ['Click the top row', 'Home', 'Font Color', 'White', 'B'] },
        { t: 'Borders: <b>All Borders</b>', ok: D => !!tbl(D) && tbl(D).borders === 'all', sel: 'row:0', tab: 'tdesign', ctl: 'borders', path: ['Table Design', 'Borders', 'All Borders'] }],
      apply: D => { const t = makeTable(4, 3, true); t.rows.push([{ t: '', blank: true }, { t: '', blank: true }, { t: '', blank: true }]); t.rowFmt.push({}); t.rowFmt[0] = { shade: 'navy', color: 'white', bold: true }; t.borders = 'all'; D[3].table = t; } },
    { page: 4, title: 'Spell check',
      msg: 'Never print with mistakes! My letter has 4 spelling mistakes. Find and fix them all.',
      specs: [
        { t: 'Fix all <b>4 spelling mistakes</b>', n: D => D[4].fixed.filter(Boolean).length + '/4', ok: D => D[4].fixed.every(Boolean), sel: 'spell', tab: 'review', ctl: 'spell', path: ['Click a red word', 'or Review', 'Spelling & Grammar'] }],
      apply: D => { D[4].fixed = [true, true, true, true]; } },
    { page: 4, title: 'Print the issue', print: true,
      msg: 'Perfect. Last job: print 30 copies for the class. Check the settings before you press Print!',
      specs: [
        { t: 'Paper: <b>A4</b>', ok: (D, PR) => PR.paper === 'A4', sel: '', tab: 'file', ctl: 'paper', path: ['File', 'Print', 'Paper', 'A4'] },
        { t: 'Orientation: <b>Portrait</b>', ok: (D, PR) => PR.orient === 'portrait', sel: '', tab: 'file', ctl: 'orient', path: ['File', 'Print', 'Portrait'] },
        { t: 'Copies: <b>30</b>', ok: (D, PR) => PR.copies === 30, sel: '', tab: 'file', ctl: 'copies', path: ['File', 'Print', 'Copies', '30'] },
        { t: 'Pages: <b>Print All Pages</b>', ok: (D, PR) => PR.pages === 'all', sel: '', tab: 'file', ctl: 'pages', path: ['File', 'Print', 'Print All Pages'] }],
      apply: (D, PR) => Object.assign(PR, { paper: 'A4', orient: 'portrait', copies: 30, pages: 'all' }) }
  ];

  // A table r×c with the readers' data. With blanks = true the 3 note cells start empty.
  function makeTable(r, c, blanks) {
    const rows = [];
    for (let i = 0; i < r; i++) {
      const row = [];
      for (let j = 0; j < c; j++) {
        const src = i === 0 ? TABLE_HEAD : TABLE_ROWS[i - 1];
        let t = src && src[j] !== undefined ? src[j] : '';
        if (blanks && TABLE_BLANKS.some(([a, b]) => a === i && b === j)) t = '';
        row.push({ t, blank: !t });
      }
      rows.push(row);
    }
    return { rows, rowFmt: rows.map(() => ({})), borders: 'none' };
  }

  // Ranks shown at the end
  const RANKS = [
    { min: 1700, name: 'Art Director' }, { min: 1300, name: 'Senior Designer' },
    { min: 900, name: 'Designer' }, { min: 500, name: 'Junior Designer' }, { min: 0, name: 'Intern' }];
  const PRIZES = [
    { place: '1st', text: '+5 bonus marks, a sweet treat and 10 minutes free time' },
    { place: '2nd', text: '+3 bonus marks and 10 minutes free time' },
    { place: '3rd', text: '10 minutes free time' }];

  const SCORE = { base: 100, speedMax: 50, speedFull: 15, speedZero: 75, hint: 30, wrong: 10, comboStep: 10, comboMax: 50 };

  return { MAX_SECONDS, FONTS, FONT_CSS, SIZES, SPACINGS, COLOURS, FONT_COLOURS, FILL_COLOURS, SHADE_COLOURS, STYLES, BORDERS, WRAPS, TABLE_BORDERS,
    PICS, SHAPES, MODELS, SPELL, LETTER, TABLE_HEAD, TABLE_ROWS, TABLE_BLANKS, CHIPS, CLUES, PAGES, TICKETS, RANKS, PRIZES, SCORE,
    freshDocs, freshPrint, makeTable };
})();
