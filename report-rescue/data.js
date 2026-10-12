/* Mystery Box: Word Challenge! Content for the six boxes, the starter text and the robot. */
window.MB = (function () {
  const TITLE = 'My Dream Gaming Room';
  const PARA = 'My dream gaming room is the best place to play and relax with my freinds. The walls are dark blue, and bright lights glow purple and green. There is a soft sofa, a mini fridge full of snaks and a big shelf of games. It is an awsome room!';
  const HEADING = 'Room Features';
  const FEATURES = ['A huge curved screen for racing games', 'Two loud speakers for music', 'A gaming chair that glows in the dark'];

  // The three spelling mistakes. Word's spelling checker underlines all three.
  const MISTAKES = [
    { wrong: 'freinds', right: 'friends' },
    { wrong: 'snaks', right: 'snacks' },
    { wrong: 'awsome', right: 'awesome' }
  ];

  const plainText = [TITLE, '', PARA, '', HEADING, ...FEATURES].join('\r\n');

  // Ready-formatted version for Support mode: Word keeps these styles when it is pasted.
  const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const readyHTML = `<html><body>
<p style="text-align:center;font-family:Calibri,sans-serif;font-size:20pt;font-weight:bold;margin:0 0 12pt">${esc(TITLE)}</p>
<p style="font-family:Calibri,sans-serif;font-size:12pt;line-height:150%;margin:0 0 8pt">${esc(PARA)}</p>
<h1>${esc(HEADING)}</h1>
<ul style="font-family:Calibri,sans-serif;font-size:12pt;line-height:150%">${FEATURES.map(f => `<li>${esc(f)}</li>`).join('')}</ul>
</body></html>`;

  const CHART_DATA = [['Activity', 'Hours'], ['Gaming', '2'], ['Reading', '1'], ['Exercise', '1']];

  /* Each box: steps are 2–4 short lines. path = the Word menu path shown as chips in "Show me how". */
  const BOXES = [
    {
      id: 'style', n: 1, emoji: '🎨', name: 'STYLE IT', color: '#FF4FA3', color2: '#B620E0',
      part: 'head', partName: 'Robot Head', partEmoji: '🤖',
      steps: [
        'Select the title. Click <b>Bold</b>.',
        'Make the title size <b>20</b>.',
        'Click <b>Center</b>.',
        'Select the other text. Make it size <b>12</b>.'
      ],
      supportSteps: [
        'Look at your title. Is it <b>bold</b>, size <b>20</b> and in the <b>centre</b>?',
        'Click in the paragraph. Is the size <b>12</b>?'
      ],
      hints: [
        { path: ['Home', 'Font', 'B'], tip: 'Bold. Shortcut: <kbd>Ctrl</kbd> + <kbd>B</kbd>' },
        { path: ['Home', 'Font', 'Font Size'], tip: 'Type <b>20</b> in the box, then press <kbd>Enter</kbd>.' },
        { path: ['Home', 'Paragraph', 'Center'], tip: 'Shortcut: <kbd>Ctrl</kbd> + <kbd>E</kbd>' }
      ],
      extra: 'Select = drag your mouse over the words so they turn grey.',
      say: 'My head! Now I can see your awesome title. 👀'
    },
    {
      id: 'organize', n: 2, emoji: '✨', name: 'ORGANIZE IT', color: '#FFB020', color2: '#FF5E3A',
      part: 'body', partName: 'Robot Body', partEmoji: '🦾',
      steps: [
        'Click on <b>Room Features</b>. Choose <b>Heading 1</b>.',
        'Select the 3 features. Click <b>Bullets</b>.',
        'Select the paragraph. Set <b>Line Spacing</b> to <b>1.5</b>.'
      ],
      supportSteps: [
        'Is <b>Room Features</b> a blue <b>Heading 1</b>?',
        'Do the 3 features have <b>bullets</b> (•)?'
      ],
      hints: [
        { path: ['Home', 'Styles', 'Heading 1'], tip: 'Click anywhere in the words first.' },
        { path: ['Home', 'Paragraph', 'Bullets'], tip: 'The button with dots: •≡' },
        { path: ['Home', 'Paragraph', 'Line and Paragraph Spacing', '1.5'], tip: 'The button with up and down arrows: ↕≡' }
      ],
      extra: 'Heading 1 makes the words bigger and blue. That is how you know it worked!',
      say: 'A body! I feel so organised. ✨'
    },
    {
      id: 'decorate', n: 3, emoji: '🖼️', name: 'DECORATE IT', color: '#18D2FF', color2: '#2D6BFF',
      part: 'arms', partName: 'Robot Arms', partEmoji: '💪',
      steps: [
        'Insert one <b>gaming picture</b>.',
        'Drag a corner to make it <b>smaller</b>.',
        'Set <b>Wrap Text</b> to <b>Square</b>.',
        'Insert one <b>shape</b>. Give it a <b>colour</b>.'
      ],
      hints: [
        { path: ['Insert', 'Pictures', 'Online Pictures'], tip: 'Search <b>game controller</b>. Or use <b>Stock Images</b>.' },
        { path: ['Picture Format', 'Wrap Text', 'Square'], tip: 'Click the picture first, so the Picture Format tab appears.' },
        { path: ['Insert', 'Shapes'], tip: 'Pick a shape, then drag on the page to draw it.' },
        { path: ['Shape Format', 'Shape Fill'], tip: 'Pick any colour you like.' }
      ],
      extra: 'Use a <b>corner</b> circle to resize, so the picture does not stretch.',
      say: 'Arms! Now I can high-five you. 🙌'
    },
    {
      id: 'model', n: 4, emoji: '🤖', name: 'MAKE IT 3D', color: '#A66BFF', color2: '#5B2BE0',
      part: 'legs', partName: 'Rocket Legs', partEmoji: '🚀',
      steps: [
        'Insert one <b>3D model</b>.',
        'Pick a gaming or robot model.',
        'Drag the <b>3D control</b> in the middle to <b>rotate</b> it.'
      ],
      planB: {
        label: 'Plan B: No 3D Models? Insert an icon',
        note: 'Use Plan B only if your Word has no 3D Models button.',
        steps: [
          'Click <b>Insert</b>, then <b>Icons</b>.',
          'Search <b>game</b>. Pick one icon and click <b>Insert</b>.',
          'Drag the round arrow on top to <b>rotate</b> it a little.'
        ],
        hints: [
          { path: ['Insert', 'Icons'], tip: 'Type <b>game</b> or <b>robot</b> in the search box.' },
          { path: ['Graphics Format', 'Graphics Fill'], tip: 'Optional: give your icon a colour.' }
        ]
      },
      hints: [
        { path: ['Insert', '3D Models', 'Stock 3D Models'], tip: 'Search <b>robot</b> or <b>controller</b>, then click <b>Insert</b>.' },
        { path: ['3D Model', 'Drag the middle circle'], tip: 'Hold the mouse on the 3D control and move it to spin the model.' }
      ],
      extra: 'The 3D control is the round arrow in the middle of the model.',
      say: 'Rocket legs! I can fly! 🚀'
    },
    {
      id: 'data', n: 5, emoji: '📊', name: 'SHOW THE DATA', color: '#7CFF6B', color2: '#00B37A',
      part: 'screen', partName: 'Chart Screen', partEmoji: '📟',
      steps: [
        'Insert a table: <b>2</b> columns, <b>4</b> rows. Type the data.',
        'Select the header row. Add <b>Shading</b>.',
        'Insert a <b>Column</b> chart. Type the same data.',
        'Change the chart title to <b>My Daily Activities</b>.'
      ],
      hints: [
        { path: ['Insert', 'Table', '2×4'], tip: 'Move your mouse over the squares: 2 across, 4 down. Click.' },
        { path: ['Table Design', 'Shading'], tip: 'Select the top row first. Pick any colour.' },
        { path: ['Insert', 'Chart', 'Column', 'OK'], tip: 'A small sheet opens. Paste the data in cell <b>A1</b>, then close the sheet.' },
        { path: ['Click Chart Title', 'Type'], tip: 'Click on the words <b>Chart Title</b> and type the new title.' }
      ],
      extra: 'In the chart sheet, delete the extra columns (C and D) so only your data is left.',
      say: 'A chart screen! Look at my bars go. 📊'
    },
    {
      id: 'check', n: 6, emoji: '🔍', name: 'FINAL CHECK', color: '#FF7A45', color2: '#FF2E63',
      part: 'power', partName: 'Power Core', partEmoji: '⚡',
      steps: [
        'Run <b>Spelling & Grammar</b>. Fix the <b>3</b> mistakes.',
        'Open <b>Print Preview</b>.',
        'Check: <b>A4</b>, <b>Portrait</b>, and it all fits neatly.',
        'Print only if Ms Rahaf says so.'
      ],
      hints: [
        { path: ['Review', 'Spelling & Grammar'], tip: 'Shortcut: <kbd>F7</kbd>. Red wavy lines show spelling mistakes.' },
        { path: ['File', 'Print'], tip: 'Shortcut: <kbd>Ctrl</kbd> + <kbd>P</kbd>. The preview is on the right.' },
        { path: ['Layout', 'Size', 'A4'], tip: 'And <b>Layout → Orientation → Portrait</b>.' }
      ],
      extra: 'Right-click a word with a red line to see the right spelling.',
      say: 'POWER ON! I am complete! ⚡'
    }
  ];

  const COLOURS = [
    { id: 'cyan', name: 'Cyber Blue', a: '#3EE6FF', b: '#1C7CFF' },
    { id: 'pink', name: 'Neon Pink', a: '#FF6AD5', b: '#C2189B' },
    { id: 'lime', name: 'Toxic Lime', a: '#C6FF4D', b: '#3DBB2F' },
    { id: 'orange', name: 'Lava Orange', a: '#FFB347', b: '#F2502A' },
    { id: 'purple', name: 'Galaxy Purple', a: '#C79BFF', b: '#6A3BE8' },
    { id: 'gold', name: 'Gold Legend', a: '#FFE680', b: '#D99A0B' }
  ];

  const DANCES = [
    { id: 'spin', name: 'Turbo Spin', emoji: '🌀' },
    { id: 'bounce', name: 'Bounce', emoji: '⬆️' },
    { id: 'wave', name: 'Wave', emoji: '👋' },
    { id: 'wiggle', name: 'Robot Wiggle', emoji: '🕺' }
  ];

  // Suggested 45-minute lesson. Minutes add up to 45.
  const TIMINGS = [
    { min: 5, what: 'Start: open Word, type your name in the game, copy and paste the starter text.' },
    { min: 6, what: 'Box 1 🎨 Style it' },
    { min: 6, what: 'Box 2 ✨ Organize it' },
    { min: 7, what: 'Box 3 🖼️ Decorate it' },
    { min: 5, what: 'Box 4 🤖 Make it 3D' },
    { min: 9, what: 'Box 5 📊 Show the data' },
    { min: 5, what: 'Box 6 🔍 Final check' },
    { min: 2, what: 'Badges: check work, show the class robot wall (?board).' }
  ];

  // What the teacher looks for in each student's Word file.
  const CHECKLIST = [
    { box: 1, items: ['Title is bold, size 20 and centred', 'Body text is size 12'] },
    { box: 2, items: ['“Room Features” uses Heading 1', 'The 3 features have bullets', 'Paragraph line spacing is 1.5'] },
    { box: 3, items: ['One gaming picture, resized', 'Picture wrap is Square', 'One shape with a fill colour'] },
    { box: 4, items: ['One 3D model, rotated (or Plan B: one icon)'] },
    { box: 5, items: ['Table: 2 columns (Activity, Hours) with the 3 rows of data', 'Header row is shaded', 'Column chart with the same data', 'Chart title is “My Daily Activities”'] },
    { box: 6, items: ['friends, snacks, awesome are spelled right', 'Fits neatly on A4 portrait pages'] }
  ];

  return { TITLE, PARA, HEADING, FEATURES, MISTAKES, plainText, readyHTML, CHART_DATA, BOXES, COLOURS, DANCES, TIMINGS, CHECKLIST };
})();
