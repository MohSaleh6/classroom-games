/* Report Rescue (browser version): topic content */
window.RR = (function () {
  const TOPICS = {
    park: {
      id: 'park', name: 'Our Dream Theme Park', emoji: '🎢', color: '#FF6B5B', blurb: 'Roller coasters, water slides and robot battles!',
      keyword: 'Wonder World',
      headings: ['Main Attractions', 'Park Facts', 'Conclusion'],
      intro: 'Imagine a theme park built by students, for students. Our dream park is called Wonder World. It has fast rides, quiet gardens and delicous food. There is something excitting for everyone, from the youngest visitor to the bravest thrill-seeker.',
      list: ['Sky Dragon – the tallest roller coaster in the country', 'Splash Lagoon – a giant water park with ten slides', 'Robot Arena – watch robots compete in friendly battles', 'Starlight Garden – a calm place to relax at night'],
      body: 'Wonder World is open every day from 9 a.m. to 10 p.m. Tickets are cheaper for students, and families get a speshal discount. The park uses solar panels to make its own electricity.',
      concl: 'We beleive Wonder World would be the best place to spend a weekend. It is fun, safe and good for the enviroment. We hope you will visit one day!',
      mistakes: [
        { wrong: 'delicous', right: 'delicious', opts: ['delicious', 'delisious', 'delicius'], where: 'intro' },
        { wrong: 'excitting', right: 'exciting', opts: ['exiting', 'exciting', 'excitng'], where: 'intro' },
        { wrong: 'speshal', right: 'special', opts: ['spesial', 'specail', 'special'], where: 'body' },
        { wrong: 'beleive', right: 'believe', opts: ['believe', 'belive', 'beleave'], where: 'concl' },
        { wrong: 'enviroment', right: 'environment', opts: ['enviroment', 'environment', 'envirament'], where: 'concl' }
      ],
      pic: 'coaster',
      shape: 'explosion', shapeText: 'OPEN 7 DAYS!',
      model: 'wheel',
      table: {
        caption: 'Ride information', headers: ['Ride', 'Height (cm)', 'Wait (min)'],
        rows: [['Sky Dragon', '140', '45'], ['Splash Lagoon', '120', '25'], ['Robot Arena', '100', '15'], ['Starlight Garden', 'No limit', '5']],
        blanks: [[0, 1], [2, 2], [3, 0]],
        clues: ['🎢 You must be 140 cm tall to ride Sky Dragon.', '🤖 The wait for Robot Arena is only 15 minutes.', '🌙 The calm night ride is called Starlight Garden.'],
        extra: ['100', '45', 'Splash Lagoon']
      }
    },
    mars: {
      id: 'mars', name: 'A School on Mars', emoji: '🚀', color: '#E8573A', blurb: 'Spacesuits, rovers and lessons in low gravity!',
      keyword: 'Red Planet Academy',
      headings: ['What Students Do', 'Daily Life', 'Conclusion'],
      intro: 'In the year 2050, the first school on Mars opens its doors. It is called Red Planet Academy. Students live in a safe dome with fresh air, warm classrooms and a huge greenhouse. Learning on Mars is a real advanture!',
      list: ['Grow vegetables in the greenhouse', 'Study rocks with robot helpers', 'Exercise in low gravity', 'Talk to friends on Earth by video call'],
      body: 'A day on Mars is 37 minutes longer than a day on Earth. Students wear spacesuits outside because the air is too thin to breathe. The temprature can drop below minus 60 degrees! Every week, students ride a rover to explore giant crators.',
      concl: 'A school on Mars sounds dificult, but it would teach us teamwork, science and courage. We think every student would want to go there at least once. The futur is closer than we think!',
      mistakes: [
        { wrong: 'advanture', right: 'adventure', opts: ['adventure', 'advenchure', 'adventur'], where: 'intro' },
        { wrong: 'temprature', right: 'temperature', opts: ['temperture', 'temperature', 'tempreture'], where: 'body' },
        { wrong: 'crators', right: 'craters', opts: ['craters', 'creators', 'cratters'], where: 'body' },
        { wrong: 'dificult', right: 'difficult', opts: ['difficalt', 'difficult', 'dificult'], where: 'concl' },
        { wrong: 'futur', right: 'future', opts: ['fuchure', 'futer', 'future'], where: 'concl' }
      ],
      pic: 'astronaut',
      shape: 'rounded', shapeText: 'LAUNCH 2050!',
      model: 'rocket',
      table: {
        caption: 'Earth and Mars', headers: ['Fact', 'Earth', 'Mars'],
        rows: [['Length of a day', '24 h', '24 h 37 min'], ['Gravity', '100%', '38%'], ['Temperature', '15 °C', '-60 °C'], ['Number of moons', '1', '2']],
        blanks: [[3, 2], [1, 1], [0, 2]],
        clues: ['🌙 Mars has 2 small moons.', '🌍 On Earth, gravity is 100%.', '⏰ A day on Mars is 24 h 37 min.'],
        extra: ['5', '38%', '12 h']
      }
    },
    games: {
      id: 'games', name: 'The Ultimate Gaming Festival', emoji: '🎮', color: '#9B5DE5', blurb: 'Tournaments, retro games and a game design lab!',
      keyword: 'GameFest',
      headings: ['Festival Zones', 'Rules and Safety', 'Conclusion'],
      intro: 'Get ready for GameFest, the biggest gaming festival our school has ever planned! For one weekend, the sports hall will turn into a world of games, music and competitions. Players of all levels are welcom.',
      list: ['Retro Corner – play classic games from the 1980s', 'Team Arena – join a friendly team tournament', 'Game Design Lab – create your own simple game', 'Board Game Café – enjoy games without screens'],
      body: 'Every player must take a 10-minute break after each hour of play. Drinks are allowed only in the café area. Please take care of all equipmint and respect other players. Winners of the tournamant will receive a golden trophy.',
      concl: 'GameFest is more than a compitition. It is a celebration of creativity, friendship and fun. Bring your friends and join us for an amazeing weekend!',
      mistakes: [
        { wrong: 'welcom', right: 'welcome', opts: ['wellcome', 'welcome', 'welcum'], where: 'intro' },
        { wrong: 'equipmint', right: 'equipment', opts: ['equipment', 'equipmant', 'eqipment'], where: 'body' },
        { wrong: 'tournamant', right: 'tournament', opts: ['turnament', 'tournement', 'tournament'], where: 'body' },
        { wrong: 'compitition', right: 'competition', opts: ['competition', 'competetion', 'compitishun'], where: 'concl' },
        { wrong: 'amazeing', right: 'amazing', opts: ['amazzing', 'amazing', 'amaizing'], where: 'concl' }
      ],
      pic: 'controller',
      shape: 'star', shapeText: 'WIN A TROPHY!',
      model: 'joystick',
      table: {
        caption: 'Festival timetable', headers: ['Time', 'Zone', 'Activity'],
        rows: [['10:00', 'Retro Corner', 'Classic games'], ['11:30', 'Team Arena', 'Tournament'], ['13:00', 'Game Design Lab', 'Build a mini game'], ['14:30', 'Board Game Café', 'Strategy games']],
        blanks: [[0, 0], [2, 1], [3, 2]],
        clues: ['⏰ The festival starts at 10:00 in Retro Corner.', '🛠️ You build a mini game in the Game Design Lab.', '♟️ At the Board Game Café, you play strategy games.'],
        extra: ['16:00', 'Team Arena', 'Dance party']
      }
    }
  };

  const PICS = {
    coaster: { em: '🎢', label: 'Roller coaster', bg: '#FFD3C9' },
    astronaut: { em: '👩‍🚀', label: 'Astronaut', bg: '#FFD9C2' },
    controller: { em: '🎮', label: 'Game controller', bg: '#E5D6FF' },
    fish: { em: '🐟', label: 'Goldfish', bg: '#CDEBFF' },
    broccoli: { em: '🥦', label: 'Broccoli', bg: '#D6F5D6' },
    tractor: { em: '🚜', label: 'Tractor', bg: '#FFF1BF' },
    sock: { em: '🧦', label: 'Sock', bg: '#FFD6EA' },
    toothbrush: { em: '🪥', label: 'Toothbrush', bg: '#D7F3F1' }
  };
  const PIC_CHOICES = { park: ['fish', 'coaster', 'broccoli', 'sock', 'tractor', 'toothbrush'], mars: ['sock', 'tractor', 'astronaut', 'fish', 'toothbrush', 'broccoli'], games: ['broccoli', 'toothbrush', 'fish', 'controller', 'sock', 'tractor'] };

  const MODELS = {
    wheel: { em: '🎡', label: 'Ferris wheel', c1: '#FF8FA3', c2: '#FFC2D1' },
    rocket: { em: '🚀', label: 'Rocket', c1: '#7FB7FF', c2: '#C7E0FF' },
    joystick: { em: '🕹️', label: 'Joystick', c1: '#B28DFF', c2: '#DCCBFF' },
    cow: { em: '🐄', label: 'Cow', c1: '#9EE6A8', c2: '#D2F5D7' },
    bath: { em: '🛁', label: 'Bathtub', c1: '#8FE3E0', c2: '#CFF5F3' },
    carrot: { em: '🥕', label: 'Carrot', c1: '#FFB86B', c2: '#FFDDB5' },
    cactus: { em: '🌵', label: 'Cactus', c1: '#B6E36B', c2: '#E0F5BF' }
  };
  const MODEL_CHOICES = { park: ['cow', 'wheel', 'bath'], mars: ['cactus', 'cow', 'rocket'], games: ['joystick', 'carrot', 'bath'] };

  const SHAPES = {
    star: { label: 'Star', path: 'M50 4 L61 37 L96 37 L68 58 L79 92 L50 71 L21 92 L32 58 L4 37 L39 37 Z' },
    explosion: { label: 'Explosion', path: 'M50 2 L58 28 L82 10 L74 38 L99 40 L77 55 L95 76 L68 70 L66 98 L50 76 L33 97 L32 70 L5 78 L24 56 L1 42 L27 37 L18 10 L42 27 Z' },
    rounded: { label: 'Rounded box', path: 'M18 14 H82 Q96 14 96 28 V72 Q96 86 82 86 H18 Q4 86 4 72 V28 Q4 14 18 14 Z' },
    heart: { label: 'Heart', path: 'M50 90 C20 68 4 50 4 31 C4 16 16 6 29 6 C39 6 46 12 50 20 C54 12 61 6 71 6 C84 6 96 16 96 31 C96 50 80 68 50 90 Z' },
    arrow: { label: 'Arrow', path: 'M4 36 H58 V14 L96 50 L58 86 V64 H4 Z' }
  };

  const FONTS = {
    'Calibri': "Calibri, Carlito, 'Nunito', sans-serif",
    'Arial': 'Arial, Helvetica, sans-serif',
    'Arial Black': "'Arial Black', 'Archivo Black', Arial, sans-serif",
    'Times New Roman': "'Times New Roman', Times, serif",
    'Comic Sans MS': "'Comic Sans MS', 'Comic Neue', cursive",
    'Courier New': "'Courier New', Courier, monospace",
    'Georgia': 'Georgia, serif'
  };
  const COLORS = { 'Black': '#1d1d1f', 'Dark Blue': '#1F3A93', 'Red': '#E53935', 'Orange': '#F28C28', 'Green': '#2E9E4F', 'Purple': '#8E44AD', 'Pink': '#E91E8C' };
  const SIZES = [11, 12, 14, 16, 20, 24, 28, 36];

  const RANKS = [
    { min: 180, name: 'Chief Editor', emoji: '🏆' },
    { min: 140, name: 'Senior Editor', emoji: '🌟' },
    { min: 100, name: 'Junior Editor', emoji: '✏️' },
    { min: 0, name: 'Trainee Editor', emoji: '📰' }
  ];

  return { TOPICS, PICS, PIC_CHOICES, MODELS, MODEL_CHOICES, SHAPES, FONTS, COLORS, SIZES, RANKS };
})();
