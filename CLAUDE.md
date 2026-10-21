# Classroom Games

Three browser games for Ms Rahaf's ICT classes, each with one shared class leaderboard.
Plain HTML/CSS/JS frontends plus Vercel serverless functions talking to Neon Postgres.
No build step, no framework. Keep the English simple: the players are 12–14 year olds.

## Projects

| Folder | Game | Live URL | Vercel project |
| --- | --- | --- | --- |
| `crack-the-secret-code/` | Grade 8 Excel: LEFT, RIGHT, MID, SUBSTITUTE. 9 missions, no time limit (time only breaks ties) | https://crack-the-secret-code-moh-93f1.vercel.app | `crack-the-secret-code` (prj_Cjr5IpgxtqXhZNLXVUgay87yN1EL) |
| `midterm-quest/` | Grade 8 ICT midterm practice (Unit 1, Lessons 1–3): 7 levels, one per midterm task (duplicates, records/fields, percentages, text functions, power ^, sorting, filtering). 32 challenges, 3 tries each (10/5/2 points), 320 points, no time limit (time only breaks ties) | https://midterm-quest-moh-93f1.vercel.app | `midterm-quest` |
| `report-rescue/` | Grade 7 Word Unit 1, played in a pretend Word window (no real Word needed). 5 missions, 15 minutes, 200 points | https://report-rescue-moh-93f1.vercel.app | `report-rescue` (prj_6kSTKKVijFKbIbGpX64MIuYw746Q) |
| `archive/report-rescue-real-word/` | First Report Rescue version, where students used real Word. Not deployed; kept for reference only | — | — |

Vercel team: `moh-93f1` (team_dcnImgjOKecfTukD5B2Ebmvd).

Pushing to GitHub does not deploy by itself.
- `crack-the-secret-code`: its Vercel Root Directory is set to `crack-the-secret-code`. Deploy by creating a production
  deployment from GitHub (`MohSaleh6/classroom-games`, ref `main`), e.g. Vercel MCP `create_deployment` with `gitSource`.
- `midterm-quest`: Vercel Root Directory is `midterm-quest`. Deploy the same way as `crack-the-secret-code` (production deployment from GitHub `main`).
- `report-rescue`: still deployed by uploading the files of `report-rescue/` directly (no Root Directory set).

## Cloudflare addresses (because some providers block vercel.app)

Some Jordanian internet providers (e.g. Umniah) block every `*.vercel.app` address by DNS. So students open the games on
Cloudflare `workers.dev` instead. `cloudflare/worker.js` is a tiny Worker that passes every request (page and `/api/*`)
to the game's Vercel site; only `TARGET` changes per game. Vercel, Neon and the PIN stay exactly as they are.
- Cloudflare account subdomain: `mohalisal1.workers.dev`. Worker `midterm-quest` → https://midterm-quest.mohalisal1.workers.dev
- The Cloudflare connector in Claude cannot upload Worker code; paste `cloudflare/worker.js` in the Cloudflare dashboard
  (Workers & Pages → Create → Start with Hello World → Edit code → Deploy). The connector can then check it with
  `workers_get_worker_code`.

## Database (Neon)

- Neon project `misty-dream-98474453`, default branch and database.
- Table `scores` is used by Crack the Secret Code.
- Table `mq_scores` is used by Midterm Quest (same columns as `rr_scores`; points 0–320, seconds 0–3600).
- Table `rr_scores` is used by Report Rescue: id, name, name_key UNIQUE, points 0–200, seconds 0–900, finished, token, created_at.
- All Vercel projects have the env vars `DATABASE_URL` and `TEACHER_PIN`. Never commit them. The PIN is in the
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

## Midterm Quest structure

- One file, `index.html`. `genLevel(n)` builds a level's challenges from a seeded random generator (`mulberry32`), so the
  saved seed rebuilds the same questions after a refresh. Challenge kinds: mcq, type (formula or value), grid (click a cell),
  rows (select rows), order (tap rows in sorted order), chars (pick characters of a code).
- `LESSONS[n]` is the short lesson shown before each level. Keep the wording easy: the teacher asked for it to be easy.
- The questions use a made-up Phone Store table, never the real exam's Car Table, so the game does not give away exam answers.
- A free practice copy (no leaderboard) also exists as a Claude artifact; the study guide is a separate Word/PDF file.
