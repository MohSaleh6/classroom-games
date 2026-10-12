# Classroom Games

Three browser games for Ms Rahaf's ICT classes, each with one shared class board.
Plain HTML/CSS/JS frontends plus Vercel serverless functions talking to Neon Postgres.
No build step, no framework. Keep the English simple: the players are 12–14 year olds.

## Projects

| Folder | Game | Live URL | Vercel project |
| --- | --- | --- | --- |
| `crack-the-secret-code/` | Grade 8 Excel: LEFT, RIGHT, MID, SUBSTITUTE. 9 missions, about 10 minutes | https://crack-the-secret-code-moh-93f1.vercel.app | `crack-the-secret-code` (prj_Cjr5IpgxtqXhZNLXVUgay87yN1EL) |
| `report-rescue/` | Grade 7 Word Unit 1, played in a pretend Word window (no real Word needed). 5 missions, 15 minutes, 200 points | https://report-rescue-moh-93f1.vercel.app | `report-rescue` (prj_6kSTKKVijFKbIbGpX64MIuYw746Q) |
| `mystery-box/` | **Mystery Box: Word Challenge!** for Ms Rahaf's Grade 7 class. 6 mystery boxes in 10 minutes, played in a pretend Word window: insert pictures, shapes and 3D models (no chart, no real Word) and build a robot | https://mystery-box-moh-93f1.vercel.app | `mystery-box` (prj_5oXnhsce7eaJENFPJm8RcoE0WMgp) |
| `archive/report-rescue-real-word/` | First Report Rescue version, where students used real Word. Not deployed; kept for reference only | — | — |

Vercel team: `moh-93f1` (team_dcnImgjOKecfTukD5B2Ebmvd).

These Vercel projects are **not** connected to this GitHub repo. Pushing here does not deploy.
To deploy, upload the contents of one game folder as a production deployment of its Vercel project
(for example `vercel deploy --prod` from inside that folder after `vercel link`), or connect the repo in
Vercel with that folder as the Root Directory.

Mystery Box was first deployed from a GitHub commit on `claude/mystery-box-word-challenge` (a one-off deployment, not a Git
connection). Vercel Authentication is off for it, as for Report Rescue. When you deploy it again from a GitHub commit,
always pass `projectSettings.rootDirectory: "mystery-box"` with the deployment: without it Vercel builds the repo root and the site 404s.

## Database (Neon)

- Neon project `misty-dream-98474453`, default branch and database.
- Table `scores` is used by Crack the Secret Code.
- Table `mb_players` is used by Mystery Box (`mystery-box/`): id, name, name_key UNIQUE, boxes 0–63 (bit per box), colour 0–5,
  support, plan_b, confirmed, time_up, token, created_at, updated_at. `api/_db.js` creates it with CREATE TABLE IF NOT EXISTS on first use.
- Table `rr_scores` is used by Report Rescue: id, name, name_key UNIQUE, points 0–200, seconds 0–900, finished, token, created_at.
- The Crack the Secret Code, Report Rescue and Mystery Box Vercel projects have the env vars `DATABASE_URL` and `TEACHER_PIN`
  (Mystery Box uses the same values as Report Rescue, so the teacher PIN is the same). Never commit them. The PIN is in the
  teacher guide the teacher already has; don't print it in code or docs.

## How the leaderboard works (Crack the Secret Code and Report Rescue)

- `api/scores.js`
  - GET returns the board.
  - POST {name} reserves a name and returns {id, token}, or 409 if the name is taken (one play per name).
  - PUT {id, token, points, seconds} saves the final score once.
- `api/teacher.js`: POST {pin, action: check | remove | clear}. It checks the PIN with timingSafeEqual and adds a delay on a wrong PIN.
- Ranking: most points first, then fastest time. Prizes are given by Ms Rahaf:
  - 1st: +5 bonus marks, a sweet treat and 10 minutes free time.
  - 2nd: +3 marks and 10 minutes free time.
  - 3rd: 10 minutes free time.
- `?board` on either site shows the big projector leaderboard.
- Scores save automatically. Ms Rahaf rejected score codes, so don't bring them back.
- Game progress is kept in localStorage, so a refresh resumes the game.

## Report Rescue structure

- `data.js` is `window.RR`. It holds 3 topics (park, mars, games), each with its text, 5 spelling mistakes, picture, shape,
  3D model and table data, plus the shared lists of pictures, models, shapes, fonts, colours and ranks.
- `app.js` is the game engine. MISSIONS → steps, each with `goals()` returning [{t, ok}], plus `rib()` and `say()`.
  A step scores 10 points if correct on the first Check with no hint, otherwise 5.
- `teacher-24spt9.html` is an unlinked teacher guide (lesson plan, scoring, answer keys). Don't link it from the student page.
- Mission 3 is pictures, shapes and spinnable CSS 3D models. The teacher asked for no chart, so don't add one.

## Mystery Box: Word Challenge (`mystery-box/`)

A separate game from Report Rescue, made for **Ms Rahaf's** Grade 7 ICT class. Her name appears in the game
(start screen, robot, badge, teacher panel, wall). Report Rescue stays as it is; don't mix the two (Mystery Box has its
own copy of the pretend Word window code).

- **No real Word.** Ms Rahaf asked that students do not use Microsoft Word. Each box opens a pretend Word window (ribbon tab +
  page about "My Dream Gaming Room") inside the box pop-up. Only **pictures, shapes and 3D models**. **No chart**, no text
  formatting, no tables, no spelling. Don't add those back.
- The game checks the work itself: each box has `goals(i)` returning [{t, ok}]; **Check ⭐** only gives the star when all
  are green. One shared page (`S.doc` = pic {id, w, wrap}, shape {type, fill, text}, model {id, rx, ry}) builds up over the boxes.
- The 6 boxes (answers in `MB.TARGET` / `MB.ANSWERS`): 1 Insert › Pictures (game controller) · 2 Picture Format: width 6 cm
  + Wrap Text Square · 3 Insert › Shapes: Star · 4 Shape Fill Yellow + text GAME ON! · 5 Insert › 3D Models: Robot ·
  6 spin the 3D model to Turn 45°, Tilt -20° (drag or sliders; ±15°, ±25° in Support mode).
- Each box has a "Where is it in real Word?" hint with the real Word menu path as chips.
- **10-minute game** (`GAME_MINUTES` in `data.js`). The clock starts at "Start! Open the boxes", uses wall-clock time
  (`S.startedAt`) so a refresh does not reset it, warns at 2 minutes, and at 0 the game ends (`S.timeUp`): only
  finished boxes can be reopened. All 6 = Word Champion badge; otherwise a Robot Builder badge with the stars collected.
- No points, no penalties, no ranking. 6 boxes open in order. Each box = 1 star + 1 robot part (head, body, arms,
  rocket legs, chest screen, power core). Surprises: robot colour after Box 2, celebration dance after Box 4.
- Support mode: bigger text (html.support), hints open, an extra hint per box, wider size/angle tolerance.
- `data.js` is `window.MB`: page text, pictures, shapes, fills, 3D models, targets, boxes, colours, dances, 45-minute
  lesson timings (game = 10-minute block), answers.
- `app.js`: screens start → ready → play → done, plus `?board` (class robot wall) and the in-game 👩‍🏫 Teacher panel
  ("Ms Rahaf's panel", PIN): class progress, Confirm badge, reset one student / whole class / this device,
  45-minute plan, answers. localStorage key `mysteryBox.v2`.
- `api/scores.js`: GET list; POST {name} reserves a name → {id, token} or 409; PUT {id, token, boxes, colour, support,
  planB, timeUp} saves progress (any number of times) and returns {confirmed}. `planB` is always false now (it was the
  real-Word icon fallback). A 404 on PUT means the teacher reset the student, and the game goes back to the name screen.
- `api/teacher.js`: POST {pin, action: check | confirm {id, on} | remove {id} | clear}.
- `teacher-m7q4kx.html` is an unlinked, printable teacher guide. Don't link it from the student page.
- Simple English for 12–13 year olds. Sound is optional (🔊 toggle).

## Testing

Run a play-through with Playwright against a small mock API before deploying. Chromium is usually preinstalled in Claude
cloud sessions; don't run `playwright install`. Check both desktop width and phone width (about 390px).
