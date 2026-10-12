# Classroom Games

Two browser games for Ms Rahaf's ICT classes, each with one shared class leaderboard.
Plain HTML/CSS/JS frontends plus Vercel serverless functions talking to Neon Postgres.
No build step, no framework. Keep the English simple: the players are 12–14 year olds.

## Projects

| Folder | Game | Live URL | Vercel project |
| --- | --- | --- | --- |
| `crack-the-secret-code/` | Grade 8 Excel: LEFT, RIGHT, MID, SUBSTITUTE. 9 missions, about 10 minutes | https://crack-the-secret-code-moh-93f1.vercel.app | `crack-the-secret-code` (prj_Cjr5IpgxtqXhZNLXVUgay87yN1EL) |
| `report-rescue/` | Grade 7 Word Unit 1, played in a pretend Word window (no real Word needed). 5 missions, 15 minutes, 200 points | https://report-rescue-moh-93f1.vercel.app | `report-rescue` (prj_6kSTKKVijFKbIbGpX64MIuYw746Q) |
| `archive/report-rescue-real-word/` | First Report Rescue version, where students used real Word. Not deployed; kept for reference only | — | — |

Vercel team: `moh-93f1` (team_dcnImgjOKecfTukD5B2Ebmvd).

These Vercel projects are **not** connected to this GitHub repo. Pushing here does not deploy.
To deploy, upload the contents of one game folder as a production deployment of its Vercel project
(for example `vercel deploy --prod` from inside that folder after `vercel link`), or connect the repo in
Vercel with that folder as the Root Directory.

## Database (Neon)

- Neon project `misty-dream-98474453`, default branch and database.
- Table `scores` is used by Crack the Secret Code.
- Table `rr_scores` is used by Report Rescue: id, name, name_key UNIQUE, points 0–200, seconds 0–900, finished, token, created_at.
- Both Vercel projects have the env vars `DATABASE_URL` and `TEACHER_PIN`. Never commit them. The PIN is in the
  teacher guide the teacher already has; don't print it in code or docs.

## How the leaderboard works (both games)

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

## Testing

Run a play-through with Playwright against a small mock API before deploying. Chromium is usually preinstalled in Claude
cloud sessions; don't run `playwright install`. Check both desktop width and phone width (about 390px).
