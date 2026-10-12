/* Report Rescue: all lesson content (shared by the student game and the teacher guide) */
window.RR = (function () {
  const TOPICS = {
    park: {
      id: 'park', name: 'Our Dream Theme Park', emoji: '🎢', color: '#FF6B5B',
      blurb: 'Roller coasters, water slides and robot battles!',
      keyword: 'Wonder World',
      headings: ['Main Attractions', 'Park Facts', 'Conclusion'],
      lines: [
        'Our Dream Theme Park',
        'Imagine a theme park built by students, for students. Our dream park is called Wonder World. It has fast rides, quiet gardens and delicous food. There is something excitting for everyone, from the youngest visitor to the bravest thrill-seeker.',
        'Conclusion',
        'We beleive Wonder World would be the best place to spend a weekend. It is fun, safe and good for the enviroment. We hope you will visit one day!',
        'Main Attractions',
        'Sky Dragon – the tallest roller coaster in the country',
        'Splash Lagoon – a giant water park with ten slides',
        'Robot Arena – watch robots compete in friendly battles',
        'Starlight Garden – a calm place to relax at night',
        'Park Facts',
        'Wonder World is open every day from 9 a.m. to 10 p.m. Tickets are cheaper for students, and families get a speshal discount. The park uses solar panels to make its own electricity.',
        'Written by: [Your Name], Grade 7'
      ],
      mistakes: [
        { wrong: 'delicous', right: 'delicious', where: 'Introduction (first paragraph)' },
        { wrong: 'excitting', right: 'exciting', where: 'Introduction (first paragraph)' },
        { wrong: 'beleive', right: 'believe', where: 'Conclusion' },
        { wrong: 'enviroment', right: 'environment', where: 'Conclusion' },
        { wrong: 'speshal', right: 'special', where: 'Park Facts' }
      ],
      img: 'roller coaster', model: 'a hot air balloon, a ferris wheel or any fun object',
      shapeName: 'Explosion: 8 Points (Stars and Banners)', shapeText: 'OPEN 7 DAYS!',
      table: {
        caption: 'Table 1: Ride information',
        headers: ['Ride', 'Minimum height (cm)', 'Average wait (minutes)'],
        rows: [['Sky Dragon', '140', '45'], ['Splash Lagoon', '120', '25'], ['Robot Arena', '100', '15'], ['Starlight Garden', 'No limit', '5']]
      },
      chart: { title: 'Favourite Rides (Student Survey)', series: 'Votes',
        labels: ['Sky Dragon', 'Splash Lagoon', 'Robot Arena', 'Starlight Garden'], values: [42, 35, 28, 15] }
    },
    mars: {
      id: 'mars', name: 'A School on Mars', emoji: '🚀', color: '#E8573A',
      blurb: 'Spacesuits, rovers and lessons in low gravity!',
      keyword: 'Red Planet Academy',
      headings: ['What Students Do', 'Daily Life', 'Conclusion'],
      lines: [
        'A School on Mars',
        'In the year 2050, the first school on Mars opens its doors. It is called Red Planet Academy. Students live in a safe dome with fresh air, warm classrooms and a huge greenhouse. Learning on Mars is a real advanture!',
        'Conclusion',
        'A school on Mars sounds dificult, but it would teach us teamwork, science and courage. We think every student would want to go there at least once. The futur is closer than we think!',
        'What Students Do',
        'Grow vegetables in the greenhouse',
        'Study rocks with robot helpers',
        'Exercise in low gravity',
        'Talk to friends on Earth by video call',
        'Daily Life',
        'A day on Mars is called a sol, and it is 37 minutes longer than a day on Earth. Students wear spacesuits when they go outside because the air is too thin to breathe. The temprature can drop below minus 60 degrees! Every week, students ride a rover to explore giant crators.',
        'Written by: [Your Name], Grade 7'
      ],
      mistakes: [
        { wrong: 'advanture', right: 'adventure', where: 'Introduction (first paragraph)' },
        { wrong: 'dificult', right: 'difficult', where: 'Conclusion' },
        { wrong: 'futur', right: 'future', where: 'Conclusion' },
        { wrong: 'temprature', right: 'temperature', where: 'Daily Life' },
        { wrong: 'crators', right: 'craters', where: 'Daily Life' }
      ],
      img: 'Mars planet', model: 'a rocket, an astronaut or a planet (look in the Space category)',
      shapeName: 'Rectangle: Rounded Corners', shapeText: 'LAUNCH: 2050!',
      table: {
        caption: 'Table 1: Earth and Mars',
        headers: ['Fact', 'Earth', 'Mars'],
        rows: [['Length of a day', '24 h', '24 h 37 min'], ['Gravity', '100%', '38%'], ['Average temperature', '15 °C', '-60 °C'], ['Number of moons', '1', '2']]
      },
      chart: { title: 'Weekly Lessons at Red Planet Academy', series: 'Hours per week',
        labels: ['Science', 'Maths', 'Engineering', 'Art'], values: [8, 6, 5, 2] }
    },
    games: {
      id: 'games', name: 'The Ultimate Gaming Festival', emoji: '🎮', color: '#9B5DE5',
      blurb: 'Tournaments, retro games and a game design lab!',
      keyword: 'GameFest',
      headings: ['Festival Zones', 'Rules and Safety', 'Conclusion'],
      lines: [
        'The Ultimate Gaming Festival',
        'Get ready for GameFest, the biggest gaming festival our school has ever planned! For one weekend, the sports hall will turn into a world of games, music and competitions. Players of all levels are welcom.',
        'Conclusion',
        'GameFest is more than a compitition. It is a celebration of creativity, friendship and fun. Bring your friends and join us for an amazeing weekend!',
        'Festival Zones',
        'Retro Corner – play classic games from the 1980s',
        'Team Arena – join a friendly team tournament',
        'Game Design Lab – create your own simple game',
        'Board Game Café – enjoy games without screens',
        'Rules and Safety',
        'Every player must take a 10-minute break after each hour of play. Drinks are allowed only in the café area. Please take care of all equipmint and respect other players. Winners of the tournamant will receive a golden trophy.',
        'Written by: [Your Name], Grade 7'
      ],
      mistakes: [
        { wrong: 'welcom', right: 'welcome', where: 'Introduction (first paragraph)' },
        { wrong: 'compitition', right: 'competition', where: 'Conclusion' },
        { wrong: 'amazeing', right: 'amazing', where: 'Conclusion' },
        { wrong: 'equipmint', right: 'equipment', where: 'Rules and Safety' },
        { wrong: 'tournamant', right: 'tournament', where: 'Rules and Safety' }
      ],
      img: 'game controller', model: 'a game controller or joystick (look in Electronics and Gadgets)',
      shapeName: 'Star: 5 Points (Stars and Banners)', shapeText: 'WIN A TROPHY!',
      table: {
        caption: 'Table 1: Festival timetable',
        headers: ['Time', 'Zone', 'Activity'],
        rows: [['10:00', 'Retro Corner', 'Classic game challenge'], ['11:30', 'Team Arena', 'Tournament round 1'], ['13:00', 'Game Design Lab', 'Build a mini game'], ['14:30', 'Board Game Café', 'Strategy games']]
      },
      chart: { title: 'Most Popular Game Types (Student Vote)', series: 'Votes',
        labels: ['Sports', 'Adventure', 'Puzzle', 'Racing'], values: [30, 45, 20, 25] }
    }
  };

  /* Words used when no topic is chosen (teacher guide) */
  const GENERIC = {
    title: 'the report title', topic: 'the chosen topic', keyword: 'the park / school / festival name',
    h1: 'the first heading', h2: 'the second heading', h3: 'Conclusion',
    img: 'a topic picture', model: 'a topic-related object', shapeName: 'a star, explosion or rounded rectangle',
    shapeText: 'a short slogan', tableCaption: 'the table caption', chartTitle: 'the chart title'
  };

  const DEFAULT_LAYOUT = {
    items: [
      'Title',
      'Byline: Written by: (your name), Grade 7',
      'Introduction paragraph (picture on the right in Mission 3)',
      '{h1} + list (chart under the list in Mission 3)',
      '{h2} + paragraph (table under it in Mission 4)',
      '{h3} + paragraph'
    ],
    line: '1.15', after: '6 pt', border: 'Box, 3 pt', list: 'bulleted'
  };

  const MISSIONS = [
    { id: 'm1', num: 1, title: 'Formatting Text', lesson: 'Lesson 1: Formatting text', color: '#FF6B5B', icon: '🖋️', minutes: 8,
      story: 'The report looks plain and boring. Give it a real magazine look!',
      tasks: [
        { id: 'f0', pts: 2, core: true, title: 'Paste and save the report',
          req: ['Open Word and start a Blank document', 'Paste the starter report from the game', 'Save it now as ReportRescue_YourName'],
          how: ['In the game, tap 📄 Report → Copy report.', 'In Word: File → New → Blank document.', 'Press Ctrl+V to paste.', 'Press Ctrl+S → choose your class folder → type ReportRescue_YourName → Save.'],
          check: 'File is saved with the student’s name and all the report text is there.' },
        { id: 'f1', pts: 5, core: true, title: 'Format the title',
          req: ['Font: Arial Black', 'Size: 28', 'Bold', 'Colour: Dark Blue', 'Alignment: Center'],
          how: ['Select the title "{title}" (the first line).', 'Home tab → Font box → Arial Black. Size box → 28.', 'Click B (Bold).', 'Font Color ▼ → Dark Blue (in Standard Colors).', 'Home → Center (Ctrl+E).'],
          check: 'Click the title: Arial Black, 28, bold, dark blue, centred.' },
        { id: 'f2', pts: 5, core: true, title: 'Format the 3 headings',
          req: ['Headings: {h1}, {h2}, {h3}', 'Font: Arial, Size: 16', 'Bold and Underline', 'Colour: Orange', 'Alignment: Left'],
          how: ['Select one heading line.', 'Home → Arial, 16, B, U.', 'Font Color ▼ → Orange.', 'Shortcut: double-click Format Painter 🖌️ and click the other two headings. Press Esc when done.'],
          check: 'All 3 headings: Arial 16, bold, underlined, orange, left-aligned.' },
        { id: 'f3', pts: 4, core: true, title: 'Format the paragraphs',
          req: ['All other text (paragraphs and list lines)', 'Font: Calibri, Size: 12', 'Colour: Black (Automatic)', 'Alignment: Justify'],
          how: ['Triple-click a paragraph to select it. Hold Ctrl to select more.', 'Home → Calibri, 12.', 'Home → Justify (Ctrl+J).'],
          check: 'Body text is Calibri 12, black, justified.' },
        { id: 'f4', pts: 2, core: false, title: 'Format the byline',
          req: ['The line "Written by: [Your Name], Grade 7"', 'Replace [Your Name] with your real name', 'Calibri, 12, Italic', 'Align Right'],
          how: ['Type your name instead of [Your Name].', 'Select the line → Home → I (Italic).', 'Home → Align Right (Ctrl+R).'],
          check: 'Byline has the student’s real name, is italic and right-aligned.' },
        { id: 'f5', pts: 2, core: false, title: 'Make the name stand out',
          req: ['In the introduction, find "{keyword}"', 'Make it Bold and Italic'],
          how: ['Select {keyword} in the first paragraph.', 'Press Ctrl+B, then Ctrl+I.'],
          check: '{keyword} in the introduction is bold and italic.' }
      ] },
    { id: 'm2', num: 2, title: 'Advanced Formatting', lesson: 'Lesson 2: Advanced formatting', color: '#F5A623', icon: '📐', minutes: 8,
      story: 'The information is in the wrong order! Use styles and layout tools to organise it.',
      layout: true,
      tasks: [
        { id: 's1', pts: 5, core: true, title: 'Apply heading styles',
          req: ['Apply the Heading 1 style to {h1}, {h2} and {h3}', 'Keep your orange Mission 1 look'],
          how: ['Select the heading {h1} (it is already orange from Mission 1).', 'Home → Styles → right-click Heading 1 → Update Heading 1 to Match Selection. Now Heading 1 looks like your heading!', 'Click inside {h2} → click Heading 1. Do the same for {h3}.', 'Check it worked: View → tick Navigation Pane. Your 3 headings appear on the left!'],
          check: 'View → Navigation Pane lists all 3 headings.' },
        { id: 's2', pts: 5, core: true, title: 'Fix the order of the report',
          req: ['Move the sections so they match the Layout to follow (above)', 'The byline goes right under the title'],
          how: ['Open View → Navigation Pane.', 'Drag a heading up or down. Its text moves with it!', 'Or select text → Cut (Ctrl+X) → click the new place → Paste (Ctrl+V).'],
          check: 'Sections follow the class layout; byline is under the title.' },
        { id: 's3', pts: 4, core: false, title: 'Set line and paragraph spacing',
          req: ['Line spacing: {line}', 'Spacing After each paragraph: {after}'],
          how: ['Press Ctrl+A to select the whole report.', 'Home → Line and Paragraph Spacing ↕ → {line}.', 'Layout tab → Spacing → After: {after}.'],
          check: 'Paragraph dialog shows line spacing {line} and spacing after {after}.' },
        { id: 's4', pts: 3, core: true, title: 'Make a list',
          req: ['Turn the 4 lines under {h1} into a {list} list'],
          how: ['Select the 4 lines.', 'Home → Bullets (•) or Numbering (1.).', 'Want a cooler look? Bullets ▼ → pick a fun symbol.'],
          check: 'The 4 items under {h1} are a bulleted or numbered list.' },
        { id: 's5', pts: 3, core: true, title: 'Add a page border',
          req: ['Page border: {border}', 'Any colour you like'],
          how: ['Design tab → Page Borders.', 'Setting: Box. Width: 3 pt. Color: your choice.', 'Click OK.'],
          check: 'A page border is visible ({border}).' }
      ] },
    { id: 'm3', num: 3, title: 'Images and Graphics', lesson: 'Lesson 3: Images and graphics', color: '#1FB5A3', icon: '🖼️', minutes: 11,
      story: 'A magazine with no pictures? No way! Add images, a shape, a 3D model and a chart.',
      chartCard: true,
      tasks: [
        { id: 'g1', pts: 4, core: true, title: 'Insert a picture',
          req: ['Insert a picture that matches your report', 'Search idea: "{img}"'],
          how: ['Click at the start of the introduction paragraph.', 'Insert → Pictures → Stock Images (or Online Pictures).', 'Search {img} → choose one → Insert.', 'No internet? Use Insert → Icons, or a picture from your teacher’s folder (Insert → Pictures → This Device).'],
          check: 'A relevant picture is in the report.' },
        { id: 'g2', pts: 3, core: true, title: 'Resize the picture',
          req: ['Width: about 6 cm', 'Keep its shape. Do not stretch it!'],
          how: ['Click the picture.', 'Picture Format → Size → Width: 6 cm. The height changes by itself.', 'Or drag a corner handle (not a side handle).'],
          check: 'Picture is about 6 cm wide and not stretched.' },
        { id: 'g3', pts: 3, core: true, title: 'Wrap text around the picture',
          req: ['Text wrapping: Square', 'Put the picture on the right of the introduction'],
          how: ['Click the picture → Picture Format → Wrap Text → Square.', 'Drag the picture to the right side of the introduction.'],
          check: 'Wrap Text is Square and the text flows beside the picture.' },
        { id: 'g4', pts: 4, core: false, title: 'Add a shape',
          req: ['Shape: {shapeName}', 'Text inside: {shapeText}', 'A bright fill colour', 'Place it near the title'],
          how: ['Insert → Shapes → {shapeName}.', 'Click and drag near the title to draw it.', 'Right-click the shape → Add Text → type {shapeText}.', 'Shape Format → Shape Fill → choose a bright colour.'],
          check: 'A shape near the title with the text "{shapeText}".' },
        { id: 'g5', pts: 4, core: false, title: 'Insert a 3D model',
          req: ['Insert a 3D model', 'Ideas: {model}', 'Resize it and turn it to a cool angle'],
          how: ['Insert → 3D Models → Stock 3D Models.', 'Choose a model → Insert.', 'Drag a corner to resize. Drag the 360° circle in the middle to turn it.', 'No 3D Models button? Alternative: click your picture → Picture Format → Picture Effects → 3-D Rotation → choose a style.'],
          check: 'A 3D model is in the report (or the alternative: a picture with a 3-D Rotation effect).' },
        { id: 'g6', pts: 7, core: true, title: 'Create a chart',
          req: ['Chart type: Clustered Column', 'Use the chart data card above', 'Chart title: {chartTitle}', 'Place it under the list in {h1}'],
          how: ['Click under the list in {h1}.', 'Insert → Chart → Column → Clustered Column → OK.', 'An Excel window opens. Type the data, or tap Copy data in the game and paste into cell A1.', 'Delete the extra columns (Series 2 and 3) and any extra rows. Close the Excel window.', 'Click Chart Title and type {chartTitle}.'],
          check: 'A clustered column chart with the 4 correct values and the title "{chartTitle}".' }
      ] },
    { id: 'm4', num: 4, title: 'Working with Tables', lesson: 'Lesson 4: Working with tables', color: '#4C8DFF', icon: '📊', minutes: 7,
      story: 'Readers love quick facts. Put the data in a neat table.',
      tableCard: true,
      tasks: [
        { id: 'b1', pts: 4, core: true, title: 'Insert a table',
          req: ['Size: 3 columns × 5 rows', 'Place it under the {h2} paragraph', 'Type this caption above it: {tableCaption}'],
          how: ['Click at the end of the {h2} paragraph → press Enter.', 'Type the caption {tableCaption} → press Enter.', 'Insert → Table → drag over a 3×5 grid → click.'],
          check: 'A 3×5 table under {h2}, with the caption above it.' },
        { id: 'b2', pts: 4, core: true, title: 'Type the data',
          req: ['Type the data from the card above', 'Check the spelling of every word'],
          how: ['Click the first cell and type.', 'Press Tab to jump to the next cell.'],
          check: 'All 15 cells match the data card.' },
        { id: 'b3', pts: 4, core: true, title: 'Style the header row',
          req: ['Row 1: Bold and white text', 'A dark shading colour', 'Text centred'],
          how: ['Select row 1.', 'Table Design → Shading ▼ → a dark colour.', 'Home → B, Font Color → White, Center (Ctrl+E).'],
          check: 'Header row is bold, white text, dark shading, centred.' },
        { id: 'b4', pts: 4, core: false, title: 'Add borders and shading',
          req: ['All Borders, 1½ pt', 'Light shading on rows 2 to 5'],
          how: ['Select the whole table (click ✥ at the top-left corner of the table).', 'Table Design → Pen Weight: 1½ pt → Borders ▼ → All Borders.', 'Select rows 2 to 5 → Shading ▼ → a light colour.'],
          check: 'All borders are visible; rows 2 to 5 have light shading.' },
        { id: 'b5', pts: 4, core: false, title: 'Fix the column widths',
          req: ['Columns fit their text (AutoFit Contents)', 'Table centred on the page'],
          how: ['Click in the table → Layout (Table Layout) → AutoFit → AutoFit Contents.', 'Select the whole table → Home → Center.'],
          check: 'Column widths fit the text; the table is centred.' }
      ] },
    { id: 'm5', num: 5, title: 'Check and Print', lesson: 'Lesson 5: Check and print', color: '#9B5DE5', icon: '🔍', minutes: 6,
      story: 'Last check before the magazine goes to print. Hunt the spelling mistakes!',
      tasks: [
        { id: 'c1', pts: 5, core: true, title: 'Spelling hunt', spell: true,
          req: ['The report has 5 spelling mistakes', 'Fix them in Word', 'Type each correct spelling in the boxes below (1 point each)'],
          how: ['Look for red wavy lines under words.', 'Read every paragraph slowly. The mistakes hide in the paragraphs, not in the list.'],
          check: 'All 5 words are corrected in the document (see the answer key).' },
        { id: 'c2', pts: 2, core: true, title: 'Use Spelling & Grammar',
          req: ['Run the Spelling & Grammar check', 'Fix any other mistakes', 'For names like {keyword}, choose Ignore'],
          how: ['Review → Spelling & Grammar (or press F7).', 'Pick the right word → Change. For names, click Ignore Once.'],
          check: 'No red underlines left (except names the student ignored).' },
        { id: 'c3', pts: 3, core: false, title: 'Review the layout',
          req: ['Nothing covers the text', 'All headings look the same', 'The table and chart are not cut across two pages', 'No empty page at the end'],
          how: ['Scroll through the whole report.', 'View → Multiple Pages to see everything at once.'],
          check: 'Clean layout: nothing overlaps, no blank pages.' },
        { id: 'c4', pts: 3, core: true, title: 'Check Print Preview',
          req: ['Open Print Preview', 'Paper size: A4', 'Orientation: Portrait', 'Margins: Normal', 'STOP here. Print only when your teacher says!'],
          how: ['File → Print (Ctrl+P). The preview is on the right.', 'Under Settings, check: Portrait Orientation, A4, Normal Margins.', 'Fix any wrong setting, then press Esc to go back.'],
          check: 'Layout tab shows A4, Portrait, Normal margins (2.54 cm).' },
        { id: 'c5', pts: 2, core: true, title: 'Save your final report',
          req: ['Save your work (Ctrl+S)', 'File name: ReportRescue_YourName'],
          how: ['Press Ctrl+S.', 'Wrong name? File → Save As → type the new name.'],
          check: 'Saved file named ReportRescue_StudentName.' }
      ] }
  ];

  const BONUS = { id: 'bonus', title: 'Editor’s Extra', color: '#FF3E7F', icon: '⚡',
    story: 'Finished early? Add two pro magazine touches.',
    tasks: [
      { id: 'x1', pts: 5, core: false, title: 'Drop cap',
        req: ['Make the first letter of the introduction a Drop Cap'],
        how: ['Click inside the introduction paragraph.', 'Insert → Drop Cap → Dropped.'],
        check: 'The introduction starts with a drop cap.' },
      { id: 'x2', pts: 5, core: false, title: 'Magazine footer',
        req: ['Footer text: School Magazine – Grade 7', 'Add a page number'],
        how: ['Insert → Footer → Blank.', 'Type: School Magazine – Grade 7', 'Insert → Page Number → Current Position → Plain Number.', 'Double-click the page to close the footer.'],
        check: 'Footer shows the text and a page number.' }
    ] };

  const LESSON_PLAN = [
    ['0–3', 'Hook and setup', 'Read the story. Students enter their name, choose a topic and a route, copy the report into Word and save it.', 3],
    ['3–11', 'Mission 1: Formatting Text', 'Title, headings, paragraphs, byline and the bold-italic name.', 8],
    ['11–19', 'Mission 2: Advanced Formatting', 'Heading styles, fix the order, spacing, list, page border.', 8],
    ['19–30', 'Mission 3: Images and Graphics', 'Picture, resize, wrap, shape, 3D model, chart.', 11],
    ['30–37', 'Mission 4: Working with Tables', 'Insert, type data, header row, borders and shading, widths.', 7],
    ['37–43', 'Mission 5: Check and Print', 'Spelling hunt, Spelling & Grammar, layout review, Print Preview, save.', 6],
    ['43–45', 'Ready to Publish', 'Students show their final screen; teacher checks files and stamps badges. Early finishers do the bonus.', 2]
  ];

  const STAMP = 'MAGAZINE';

  const FINAL_CHECKLIST = [
    { t: 'Title: Arial Black, 28, bold, dark blue, centred', core: true },
    { t: 'Byline under the title, with my real name, italic, right-aligned', core: true },
    { t: '3 headings use the Heading 1 style and look the same', core: true },
    { t: 'Paragraphs: Calibri 12, black, justified', core: true },
    { t: 'Sections are in the right order', core: true },
    { t: 'A list under {h1}', core: true },
    { t: 'A page border', core: true },
    { t: 'A picture: about 6 cm wide, Square wrapping', core: true },
    { t: 'A shape with the text "{shapeText}"', core: false },
    { t: 'A 3D model (or a picture with 3-D Rotation)', core: false },
    { t: 'A column chart titled "{chartTitle}"', core: true },
    { t: 'A table with a dark, bold header row', core: true },
    { t: 'All 5 spelling mistakes fixed. No red lines!', core: true },
    { t: 'Print Preview checked: A4, Portrait, Normal margins', core: true },
    { t: 'Saved as ReportRescue_YourName', core: true }
  ];

  const RANKS = [
    { min: 90, name: 'Chief Editor', emoji: '🏆' },
    { min: 70, name: 'Senior Editor', emoji: '🌟' },
    { min: 50, name: 'Junior Editor', emoji: '✏️' },
    { min: 0, name: 'Trainee Editor', emoji: '📰' }
  ];

  /* Fill {placeholders} in task text for a topic and layout */
  function fill(str, topic, layout) {
    const L = layout || DEFAULT_LAYOUT;
    const T = topic;
    const map = T ? {
      title: T.name, topic: T.name, keyword: T.keyword, h1: T.headings[0], h2: T.headings[1], h3: T.headings[2],
      img: T.img, model: T.model, shapeName: T.shapeName, shapeText: T.shapeText,
      tableCaption: T.table.caption, chartTitle: T.chart.title
    } : Object.assign({}, GENERIC);
    Object.assign(map, { line: L.line, after: L.after, border: L.border, list: L.list });
    return String(str).replace(/\{(\w+)\}/g, (m, k) => (k in map ? map[k] : m));
  }

  function reportText(T) { return T.lines.join('\n'); }
  function chartTSV(T) { return '\t' + T.chart.series + '\n' + T.chart.labels.map((l, i) => l + '\t' + T.chart.values[i]).join('\n'); }

  function hash(code) {
    let h = 0x811c9dc5;
    for (const ch of String(code || '').trim().toUpperCase()) { h ^= ch.codePointAt(0); h = Math.imul(h, 0x01000193) >>> 0; }
    return h.toString(16);
  }

  function routeTasks(tasks, route) { return route === 'support' ? tasks.filter(t => t.core) : tasks; }
  function routeMax(route) { return MISSIONS.reduce((n, m) => n + routeTasks(m.tasks, route).reduce((a, t) => a + t.pts, 0), 0); }
  function rankFor(pct) { return RANKS.find(r => pct >= r.min); }

  function encodeClass(cfg) { return btoa(unescape(encodeURIComponent(JSON.stringify(cfg)))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
  function decodeClass(s) {
    try {
      const b = s.replace(/-/g, '+').replace(/_/g, '/');
      const o = JSON.parse(decodeURIComponent(escape(atob(b + '==='.slice((b.length + 3) % 4)))));
      if (!o || typeof o !== 'object') return null;
      const items = Array.isArray(o.items) ? o.items.map(x => String(x).slice(0, 120)).filter(Boolean).slice(0, 12) : null;
      return {
        items: items && items.length ? items : DEFAULT_LAYOUT.items,
        line: String(o.line || DEFAULT_LAYOUT.line).slice(0, 10), after: String(o.after || DEFAULT_LAYOUT.after).slice(0, 10),
        border: String(o.border || DEFAULT_LAYOUT.border).slice(0, 40), list: o.list === 'numbered' ? 'numbered' : 'bulleted',
        code: typeof o.code === 'string' ? o.code.slice(0, 16) : '', name: String(o.name || '').slice(0, 40), custom: true
      };
    } catch (e) { return null; }
  }

  return { TOPICS, GENERIC, DEFAULT_LAYOUT, MISSIONS, BONUS, LESSON_PLAN, STAMP, FINAL_CHECKLIST, RANKS,
    fill, reportText, chartTSV, hash, routeTasks, routeMax, rankFor, encodeClass, decodeClass };
})();
