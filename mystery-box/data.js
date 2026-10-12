/* Mystery Box: Word Challenge! Content for the six boxes, the pretend Word page and the robot. */
window.MB = (function () {
  // The short page that sits in the pretend Word window. Students do not type it; they add pictures, shapes and 3D models.
  const TITLE = 'My Dream Gaming Room';
  const PARA = 'My dream gaming room is the best place to play and relax with my friends. The walls are dark blue, and bright lights glow purple and green. There is a soft sofa, a mini fridge full of snacks and a big shelf of games.';
  const PARA2 = 'It has a huge curved screen for racing games, two loud speakers for music and a gaming chair that glows in the dark. It is an awesome room!';

  // Insert > Pictures. One is about gaming; the others are silly.
  const PICS = {
    controller: { em: '🎮', label: 'Game controller', bg: '#E5D6FF' },
    broccoli: { em: '🥦', label: 'Broccoli', bg: '#D6F5D6' },
    sock: { em: '🧦', label: 'Sock', bg: '#FFD6EA' },
    tractor: { em: '🚜', label: 'Tractor', bg: '#FFF1BF' },
    fish: { em: '🐟', label: 'Goldfish', bg: '#CDEBFF' },
    toothbrush: { em: '🪥', label: 'Toothbrush', bg: '#D7F3F1' }
  };
  const PIC_CHOICES = ['broccoli', 'sock', 'controller', 'fish', 'tractor', 'toothbrush'];

  // Insert > Shapes
  const SHAPES = {
    star: { label: 'Star', path: 'M50 4 L61 37 L96 37 L68 58 L79 92 L50 71 L21 92 L32 58 L4 37 L39 37 Z' },
    heart: { label: 'Heart', path: 'M50 90 C20 68 4 50 4 31 C4 16 16 6 29 6 C39 6 46 12 50 20 C54 12 61 6 71 6 C84 6 96 16 96 31 C96 50 80 68 50 90 Z' },
    arrow: { label: 'Arrow', path: 'M4 36 H58 V14 L96 50 L58 86 V64 H4 Z' },
    explosion: { label: 'Explosion', path: 'M50 2 L58 28 L82 10 L74 38 L99 40 L77 55 L95 76 L68 70 L66 98 L50 76 L33 97 L32 70 L5 78 L24 56 L1 42 L27 37 L18 10 L42 27 Z' },
    rounded: { label: 'Rounded box', path: 'M18 14 H82 Q96 14 96 28 V72 Q96 86 82 86 H18 Q4 86 4 72 V28 Q4 14 18 14 Z' }
  };
  const FILLS = { Yellow: '#FFD23F', Pink: '#FF8FC7', Mint: '#7EE0C3', Sky: '#8EC5FF', Orange: '#FFB067', Purple: '#B79BFF' };

  // Insert > 3D Models (spinnable CSS cubes)
  const MODELS = {
    robot: { em: '🤖', label: 'Robot', c1: '#8EC5FF', c2: '#CFE5FF' },
    carrot: { em: '🥕', label: 'Carrot', c1: '#FFB86B', c2: '#FFDDB5' },
    cow: { em: '🐄', label: 'Cow', c1: '#9EE6A8', c2: '#D2F5D7' },
    cactus: { em: '🌵', label: 'Cactus', c1: '#B6E36B', c2: '#E0F5BF' }
  };
  const MODEL_CHOICES = ['carrot', 'robot', 'cactus', 'cow'];

  // What each box asks for. The game checks these itself.
  const TARGET = { pic: 'controller', width: 6, wrap: 'square', shape: 'star', fill: 'Yellow', text: 'GAME ON!', model: 'robot', ry: 45, rx: -20 };

  /* Each box: tab = the Word tab that opens, task = what to do (short), hints = the real Word menu path shown as chips. */
  const BOXES = [
    {
      id: 'picture', n: 1, emoji: '🖼️', name: 'PICTURE IT', color: '#FF4FA3', color2: '#B620E0',
      part: 'head', partName: 'Robot Head', partEmoji: '🤖', tab: 'Insert',
      task: 'Insert a <b>picture</b> about gaming.',
      hints: [{ path: ['Insert', 'Pictures'], tip: 'Pick the picture that matches a <b>gaming</b> room. Not the sock!' }],
      extra: 'Look for the 🎮 game controller.',
      say: 'My head! Now I can see your gaming picture. 👀'
    },
    {
      id: 'size', n: 2, emoji: '📐', name: 'SIZE IT', color: '#FFB020', color2: '#FF5E3A',
      part: 'body', partName: 'Robot Body', partEmoji: '🦾', tab: 'Picture Format',
      task: 'Make the picture <b>6 cm</b> wide. Set <b>Wrap Text</b> to <b>Square</b>.',
      hints: [
        { path: ['Picture Format', 'Size', 'Width'], tip: 'Drag the slider until it says <b>6 cm</b>.' },
        { path: ['Picture Format', 'Wrap Text', 'Square'], tip: 'Square lets the words go around the picture.' }
      ],
      extra: 'Try each Wrap Text button and watch the page. You need Square ▣.',
      say: 'A body! The words wrap around your picture now. ✨'
    },
    {
      id: 'shape', n: 3, emoji: '⭐', name: 'SHAPE IT', color: '#18D2FF', color2: '#2D6BFF',
      part: 'arms', partName: 'Robot Arms', partEmoji: '💪', tab: 'Insert',
      task: 'Insert a <b>Star</b> shape.',
      hints: [{ path: ['Insert', 'Shapes', 'Star'], tip: 'In real Word, you click the shape and then drag on the page to draw it.' }],
      extra: 'The star has 5 points. ⭐',
      say: 'Arms! Now I can high-five you. 🙌'
    },
    {
      id: 'colour', n: 4, emoji: '🎨', name: 'COLOUR IT', color: '#A66BFF', color2: '#5B2BE0',
      part: 'legs', partName: 'Rocket Legs', partEmoji: '🚀', tab: 'Shape Format',
      task: 'Fill the star with <b>Yellow</b>. Type <b>GAME ON!</b> inside it.',
      hints: [
        { path: ['Shape Format', 'Shape Fill', 'Yellow'], tip: 'Click the yellow circle.' },
        { path: ['Right-click the shape', 'Add Text'], tip: 'Then type <b>GAME ON!</b> in the box.' }
      ],
      extra: 'Type the words in the white box: GAME ON!',
      say: 'Rocket legs! I can fly! 🚀'
    },
    {
      id: 'model', n: 5, emoji: '🧊', name: 'MAKE IT 3D', color: '#7CFF6B', color2: '#00B37A',
      part: 'screen', partName: 'Chest Screen', partEmoji: '📟', tab: 'Insert',
      task: 'Insert the <b>Robot</b> 3D model.',
      hints: [{ path: ['Insert', '3D Models', 'Stock 3D Models'], tip: 'Pick the 🤖 robot model.' }],
      extra: 'A 3D model is like a toy you can turn around.',
      say: 'A chest screen! Look at me glow. 📟'
    },
    {
      id: 'spin', n: 6, emoji: '🔄', name: 'SPIN IT', color: '#FF7A45', color2: '#FF2E63',
      part: 'power', partName: 'Power Core', partEmoji: '⚡', tab: '3D Model',
      task: 'Spin the 3D model to match the <b>blue dotted cube</b>.',
      hints: [{ path: ['3D Model', 'Drag the 3D control'], tip: 'Drag the model with your mouse or finger. Or use the sliders: <b>Turn 45°</b> and <b>Tilt -20°</b>.' }],
      extra: 'Sliders: Turn = 45°, Tilt = -20°.',
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

  const GAME_MINUTES = 10; // the boxes game ends after 10 minutes

  // Suggested 45-minute lesson with Ms Rahaf. The game itself is the 10-minute block. Minutes add up to 45.
  const TIMINGS = [
    { min: 8, what: 'Ms Rahaf shows Insert Pictures, Shapes and 3D Models on the projector (quick demo).' },
    { min: 2, what: 'Students open the game and type their name.' },
    { min: 10, what: 'Mystery Box game: 10-minute clock, 6 boxes. The game ends when the clock reaches 0.' },
    { min: 10, what: 'Talk about it: Which Wrap Text did you use? Why? Where do you find 3D Models? Students who ran out of time watch a friend finish.' },
    { min: 10, what: 'Robot wall on the projector (?board). Celebrate the Word Champions and confirm badges.' },
    { min: 5, what: 'Exit question: name the 3 things you inserted today. Tidy up.' }
  ];

  // Answer key for Ms Rahaf (also in the teacher guide).
  const ANSWERS = [
    { box: 1, items: ['Insert › Pictures: the 🎮 game controller'] },
    { box: 2, items: ['Picture Format › Width: 6 cm (5.5 to 6.5 is OK; 5 to 7 in Support mode)', 'Picture Format › Wrap Text: Square'] },
    { box: 3, items: ['Insert › Shapes: Star'] },
    { box: 4, items: ['Shape Format › Shape Fill: Yellow', 'Text in the shape: GAME ON!'] },
    { box: 5, items: ['Insert › 3D Models: the 🤖 robot'] },
    { box: 6, items: ['3D Model: Turn about 45°, Tilt about -20° (15° either way is OK; 25° in Support mode)'] }
  ];

  return { GAME_MINUTES, TITLE, PARA, PARA2, PICS, PIC_CHOICES, SHAPES, FILLS, MODELS, MODEL_CHOICES, TARGET, BOXES, COLOURS, DANCES, TIMINGS, ANSWERS };
})();
