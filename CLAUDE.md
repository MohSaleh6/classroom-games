# Classroom Games

Three browser games for Ms Rahaf's ICT classes, each with one shared class board.
Plain HTML/CSS/JS frontends plus Vercel serverless functions talking to Neon Postgres.
No build step, no framework. Keep the English simple: the players are 12–14 year olds.

## Projects

| Folder | Game | Live URL | Vercel project |
| --- | --- | --- | --- |
| `crack-the-secret-code/` | Grade 8 Excel: LEFT, RIGHT, MID, SUBSTITUTE. 9 missions, about 10 minutes | https://crack-the-secret-code-moh-93f1.vercel.app | `crack-the-secret-code` (prj_Cjr5IpgxtqXhZNLXVUgay87yN1EL) |
| `report-rescue/` | Grade 7 Word Unit 1, played in a pretend Word window (no real Word needed). 5 missions, 15 minutes, 200 points | https://report-rescue-moh-93f1.vercel.app | `report-rescue` (prj_6kSTKKVijFKbIbGpX64MIuYw746Q) |
| `mystery-box/` | **Mystery Box: Word Challenge!** for Ms Rahaf's Grade 7 class. Students work in real Microsoft Word; the site guides them through 6 mystery boxes in 10 minutes and they build a robot | Not deployed yet | None yet. Needs its own Vercel project with `DATABASE_URL` and `TEACHER_PIN` |
| `archive/report-rescue-real-word/` | First Report Rescue version, where students used real Word. Not deployed; kept for reference only | — | — |

Vercel team: `moh-93f1` (team_dcnImgjOKecfTukD5B2Ebmvd).

These Vercel projects are **not** connected to this GitHub repo. Pushing here does not deploy.
To deploy, upload the contents of one game folder as a production deployment of its Vercel project
(for example `vercel deploy --prod` from inside that folder after `vercel link`), or connect the repo in
Vercel with that folder as the Root Directory.

## Database (Neon)

- Neon project `misty-dream-98474453`, default branch and database.
- Table `scores` is used by Crack the Secret Code.
- Table `mb_players` is used by Mystery Box (`mystery-box/`): id, name, name_key UNIQUE, boxes 0–63 (bit per box), colour 0–5,
  support, plan_b, confirmed, time_up, token, created_at, updated_at. `api/_db.js` creates it with CREATE TABLE IF NOT EXISTS on first use.
- Table `rr_scores` is used by Report Rescue: id, name, name_key UNIQUE, points 0–200, seconds 0–900, finished, token, created_at.
- The Crack the Secret Code and Report Rescue Vercel projects have the env vars `DATABASE_URL` and `TEACHER_PIN`. Never commit them. The PIN is in the
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
(start screen, robot, badge, teacher panel, wall). Report Rescue stays as it is; don't mix the two.

- Students work in **real Microsoft Word**. The site never inspects their file: "I've finished" is student-reported
  progress, and the wording must never claim otherwise. Ms Rahaf checks the Word file with the checklist.
- **10-minute game** (`GAME_MINUTES` in `data.js`). The clock starts at "Start! Open the boxes", uses wall-clock time
  (`S.startedAt`) so a refresh does not reset it, warns at 2 minutes, and at 0 the game ends (`S.timeUp`): only
  finished boxes can be reopened. All 6 = Word Champion badge; otherwise a Robot Builder badge with the stars collected.
- No points, no penalties, no ranking. 6 boxes open in order. Each box = 1 star + 1 robot part (head, body, arms,
  rocket legs, chart screen, power core). Surprises: robot colour after Box 2, celebration dance after Box 4.
- Box 5 includes a column chart ("My Daily Activities"). Box 4 has Plan B (insert an icon) for Word without 3D Models.
- Support mode: bigger text (html.support), hints open, extra hints, ready-formatted starter text (rich HTML copy and
  `dream-gaming-room-ready.docx`); Boxes 1–2 become "just check it".
- `data.js` is `window.MB`: starter text (about 70 words, exactly 3 spelling mistakes: freinds, snaks, awsome), boxes
  (2–4 steps each, hints as Word menu paths), colours, dances, 45-minute lesson timings (game = 10-minute block),
  teacher checklist. The two starter .docx files are built by `scripts/make_starter_docx.py`; keep their text in sync.
- `app.js`: screens start → ready → play → done, plus `?board` (class robot wall) and the in-game 👩‍🏫 Teacher panel
  ("Ms Rahaf's panel", PIN): class progress, Confirm badge, reset one student / whole class / this device,
  45-minute plan, spelling corrections, checklist.
- `api/scores.js`: GET list; POST {name} reserves a name → {id, token} or 409; PUT {id, token, boxes, colour, support,
  planB, timeUp} saves progress (any number of times) and returns {confirmed}. A 404 on PUT means the teacher reset
  the student, and the game goes back to the name screen.
- `api/teacher.js`: POST {pin, action: check | confirm {id, on} | remove {id} | clear}.
- `teacher-m7q4kx.html` is an unlinked, printable teacher guide. Don't link it from the student page.
- Simple English for 12–13 year olds. Sound is optional (🔊 toggle).

## Testing

Run a play-through with Playwright against a small mock API before deploying. Chromium is usually preinstalled in Claude
cloud sessions; don't run `playwright install`. Check both desktop width and phone width (about 390px).
