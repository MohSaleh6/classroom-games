/* Report Rescue: student game */
(function () {
  const R = window.RR;
  const $ = (s, el = document) => el.querySelector(s);
  const app = $('#app');
  const KEY = 'reportRescue.v1';
  const CLASS_KEY = 'reportRescue.class';
  const reduced = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Class layout (from teacher link) ---------- */
  let CLASS = null;
  try {
    const p = new URLSearchParams(location.search).get('class');
    if (p) { const c = R.decodeClass(p); if (c) { CLASS = c; try { localStorage.setItem(CLASS_KEY, p); } catch (e) {} } }
    if (!CLASS) { const saved = localStorage.getItem(CLASS_KEY); if (saved) CLASS = R.decodeClass(saved); }
  } catch (e) {}
  const LAYOUT = CLASS || R.DEFAULT_LAYOUT;

  /* ---------- State ---------- */
  const fresh = () => ({ name: '', topic: '', route: 'standard', startedAt: 0, done: {}, spell: ['', '', '', '', ''], fc: {}, verified: null, seen: {}, screen: 'start', mission: '' });
  let S = fresh();
  try { const raw = localStorage.getItem(KEY); if (raw) S = Object.assign(fresh(), JSON.parse(raw)); } catch (e) {}
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }

  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const T = () => R.TOPICS[S.topic];
  const F = s => R.fill(s, T(), LAYOUT);
  const tasksOf = m => R.routeTasks(m.tasks, S.route);
  const mById = id => R.MISSIONS.find(m => m.id === id);

  function spellCount() {
    if (!T()) return 0;
    return T().mistakes.reduce((n, m, i) => n + (norm(S.spell[i]) === m.right ? 1 : 0), 0);
  }
  function norm(v) { return String(v || '').trim().toLowerCase(); }
  function taskPts(t) { if (!S.done[t.id]) return 0; return t.spell ? Math.min(t.pts, spellCount()) : t.pts; }
  function missionPts(m) { return tasksOf(m).reduce((a, t) => a + taskPts(t), 0); }
  function missionMax(m) { return tasksOf(m).reduce((a, t) => a + t.pts, 0); }
  function missionDone(m) { return tasksOf(m).filter(t => S.done[t.id]).length; }
  function missionComplete(m) { return missionDone(m) === tasksOf(m).length; }
  function allComplete() { return R.MISSIONS.every(missionComplete); }
  function bonusPts() { return R.BONUS.tasks.reduce((a, t) => a + (S.done[t.id] ? t.pts : 0), 0); }
  function claimed() { return R.MISSIONS.reduce((a, m) => a + missionPts(m), 0); }

  /* ---------- Top bar ---------- */
  function hud() {
    const started = !!S.topic && S.screen !== 'start';
    $('#clockPill').hidden = $('#ptsPill').hidden = $('#reportBtn').hidden = $('#tracker').hidden = !started;
    if (!started) return;
    $('#pts').textContent = claimed() + bonusPts();
    $('#ptsMax').textContent = R.routeMax(S.route);
    const nodes = R.MISSIONS.map((m, i) => {
      const f = Math.round(missionDone(m) / tasksOf(m).length * 100);
      const cls = missionComplete(m) ? 'done' : f > 0 ? 'part' : '';
      const here = S.screen === 'mission' && S.mission === m.id ? ' here' : '';
      return (i ? '<span class="link-bar" aria-hidden="true"></span>' : '') +
        `<button class="node ${cls}${here}" style="--c:${m.color};--f:${f}%" data-go="${m.id}" type="button" aria-label="Mission ${m.num}: ${esc(m.title)}, ${f}% done"><span class="dot">${missionComplete(m) ? '✓' : m.num}</span><small>${esc(m.title)}</small></button>`;
    }).join('');
    const fin = `<span class="link-bar" aria-hidden="true"></span><button class="node ${allComplete() ? 'done' : ''}${S.screen === 'final' ? ' here' : ''}" style="--c:#FFD23F" data-go="final" type="button" aria-label="Ready to Publish"><span class="dot">🏁</span><small>Publish</small></button>`;
    $('#tracker').innerHTML = nodes + fin;
    tickClock();
  }
  function tickClock() {
    if (!S.startedAt) return;
    const s = Math.max(0, Math.floor((Date.now() - S.startedAt) / 1000));
    $('#clock').textContent = Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  }
  setInterval(tickClock, 1000);

  function go(screen, mission) {
    S.screen = screen; if (mission) S.mission = mission; save();
    ({ start: renderStart, hq: renderHQ, mission: renderMission, bonus: renderBonus, final: renderFinal })[screen]();
    hud();
    window.scrollTo(0, 0);
  }

  /* ---------- Start ---------- */
  let pick = { topic: S.topic || '', route: S.route || 'standard' };
  function renderStart() {
    const topics = Object.values(R.TOPICS).map(t => `
      <button class="choice" type="button" style="--c:${t.color}" data-topic="${t.id}" aria-pressed="${pick.topic === t.id}">
        <span class="em">${t.emoji}</span><b>${esc(t.name)}</b><span>${esc(t.blurb)}</span>
      </button>`).join('');
    app.innerHTML = `
      <section class="hero">
        <span class="ticker"><i></i> Breaking news</span>
        <h1>Report Rescue! <span>Save the School Magazine</span></h1>
        <p class="lead">The magazine deadline is TODAY, but our report is a mess: spelling mistakes, boring text, no pictures and facts everywhere. You are the editor. Fix it in Microsoft Word and get it <b>Ready to Publish!</b></p>
      </section>

      <section class="card" style="--accent:var(--pink)">
        <span class="kicker">How it works</span>
        <ol class="steps">
          <li><span>Pick a topic and copy the starter report into Word.</span></li>
          <li><span>Complete 5 missions. You do every task <b>in Word</b>. This game guides you.</span></li>
          <li><span>Tap <b>I did it in Word</b> after each task to claim its points.</span></li>
          <li><span>Stuck? Open the 💡 hint. No points lost!</span></li>
          <li><span>Your teacher checks your Word file and stamps your <b>Ready to Publish</b> badge.</span></li>
        </ol>
      </section>

      <section class="card" style="--accent:var(--yellow)">
        <span class="kicker">Step 1 · Choose your report</span>
        <div class="choice-grid" id="topicGrid">${topics}</div>
      </section>

      <section class="card" style="--accent:var(--teal)">
        <span class="kicker">Step 2 · Choose your route</span>
        <div class="choice-grid">
          <button class="choice" type="button" style="--c:var(--yellow)" data-route="standard" aria-pressed="${pick.route === 'standard'}">
            <span class="em">🚀</span><b>Editor Route</b><span>All 26 tasks. 100 points. For editors who like a challenge.</span>
          </button>
          <button class="choice" type="button" style="--c:#7EE0C3" data-route="support" aria-pressed="${pick.route === 'support'}">
            <span class="em">🛟</span><b>Support Route</b><span>19 key tasks, hints already open. You still finish a full report. 73 points.</span>
          </button>
        </div>
      </section>

      <section class="card" style="--accent:var(--blue)">
        <span class="kicker">Step 3 · Sign in, editor</span>
        <div class="field">
          <label for="nameIn">Your name</label>
          <input id="nameIn" maxlength="30" autocomplete="off" placeholder="First and last name" value="${esc(S.name)}">
        </div>
        <p class="err" id="startErr" role="alert"></p>
        <div class="row" style="margin-top:14px">
          <button class="btn pink" id="startBtn" type="button">Start the rescue 🚀</button>
          ${S.topic ? '<button class="btn sm" id="resumeBtn" type="button">Continue my rescue</button>' : ''}
        </div>
        ${CLASS ? `<p class="small muted" style="margin:12px 0 0">✅ Your teacher’s class settings are loaded${CLASS.name ? ': ' + esc(CLASS.name) : ''}.</p>` : ''}
      </section>`;
    app.querySelectorAll('[data-topic]').forEach(b => b.onclick = () => { pick.topic = b.dataset.topic; app.querySelectorAll('[data-topic]').forEach(x => x.setAttribute('aria-pressed', x === b)); });
    app.querySelectorAll('[data-route]').forEach(b => b.onclick = () => { pick.route = b.dataset.route; app.querySelectorAll('[data-route]').forEach(x => x.setAttribute('aria-pressed', x === b)); });
    $('#startBtn').onclick = () => {
      const name = $('#nameIn').value.trim().replace(/\s+/g, ' ');
      const err = $('#startErr');
      if (!pick.topic) { err.textContent = 'Choose a report topic first.'; return; }
      if (!name) { err.textContent = 'Type your name.'; $('#nameIn').focus(); return; }
      const changed = S.topic && (S.topic !== pick.topic || S.route !== pick.route);
      if (changed && !confirm('Start again with a new topic or route? Your ticks and points will reset.')) return;
      if (changed || !S.topic) S = fresh();
      S.name = name; S.topic = pick.topic; S.route = pick.route;
      if (!S.startedAt) S.startedAt = Date.now();
      go('mission', 'm1');
    };
    const r = $('#resumeBtn'); if (r) r.onclick = () => go('hq');
  }

  /* ---------- HQ ---------- */
  function renderHQ() {
    const cards = R.MISSIONS.map(m => {
      const d = missionDone(m), n = tasksOf(m).length;
      return `<button class="mcard ${missionComplete(m) ? 'complete' : ''}" type="button" style="--c:${m.color}" data-go="${m.id}">
        <div class="top"><span class="ic">${m.icon}</span><div><small>Mission ${m.num} · about ${m.minutes} min</small><b>${esc(m.title)}</b></div></div>
        <div class="body">
          <span class="small muted">${esc(m.story)}</span>
          <div class="bar" style="--c:${m.color}"><i style="width:${d / n * 100}%"></i></div>
          <span class="status">${d}/${n} tasks · ⭐ ${missionPts(m)}/${missionMax(m)} pts</span>
        </div></button>`;
    }).join('');
    app.innerHTML = `
      <section class="card" style="--accent:${T().color}">
        <span class="kicker">Editor ${esc(S.name)} · ${S.route === 'support' ? '🛟 Support Route' : '🚀 Editor Route'}</span>
        <h2>${T().emoji} ${esc(T().name)}</h2>
        <p>Do the missions in order. Every task happens in Microsoft Word.</p>
        <div class="row"><button class="btn yellow sm" data-report type="button">📄 Copy the starter report</button>
        <button class="btn sm" data-go="final" type="button">🏁 Ready to Publish</button>
        <button class="btn sm" id="newBtn" type="button">↺ Change topic</button></div>
      </section>
      <div class="mission-grid">${cards}</div>
      <section class="card" style="--accent:#FF3E7F;margin-top:22px">
        <span class="kicker">${R.BONUS.icon} Bonus challenge</span>
        <h3>${esc(R.BONUS.title)}</h3>
        <p>${esc(R.BONUS.story)} Worth up to <b>+10</b> extra points.</p>
        <button class="btn sm" type="button" data-go="bonus">Open the bonus</button>
      </section>`;
    $('#newBtn').onclick = () => go('start');
  }

  /* ---------- Task card ---------- */
  function taskHTML(t, i) {
    const support = S.route === 'support';
    const done = !!S.done[t.id];
    let extra = '';
    if (t.spell) {
      extra = `<div class="spell" id="spellBox">${T().mistakes.map((m, k) => {
        const v = S.spell[k] || ''; const ok = norm(v) === m.right; const tried = v.trim() !== '';
        return `<div class="sp ${ok ? 'ok' : tried ? 'no' : ''}"><label for="sp${k}">${k + 1}.</label><input id="sp${k}" data-k="${k}" value="${esc(v)}" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Correct spelling of mistake ${k + 1}"><span class="mk">${ok ? '✅' : tried ? '❌' : ''}</span></div>`;
      }).join('')}
      <div class="row"><button class="btn sm" id="spellCheck" type="button">Check my words</button><span class="small muted" id="spellMsg">${spellCount()}/5 correct</span></div></div>`;
    }
    return `<article class="task ${done ? 'done' : ''}" id="t-${t.id}">
      <div class="th"><span class="num">${i + 1}</span><h3>${esc(F(t.title))}${t.core ? '' : '<span class="opt">extra</span>'}</h3><span class="pts">${t.pts} pts</span></div>
      <ul class="req">${t.req.map(r => `<li>${esc(F(r))}</li>`).join('')}</ul>
      ${extra}
      <details class="hint" ${support ? 'open' : ''}><summary>💡 ${support ? 'Steps' : 'Show hint'}</summary><ol>${t.how.map(h => `<li>${esc(F(h))}</li>`).join('')}</ol></details>
      <div class="tf"><button class="donebtn" type="button" data-done="${t.id}" aria-pressed="${done}"><span class="box">${done ? '✓' : ''}</span>${done ? 'Done in Word!' : 'I did it in Word'}</button></div>
    </article>`;
  }

  function wireTasks(onChange) {
    app.querySelectorAll('[data-done]').forEach(b => b.onclick = () => {
      const id = b.dataset.done;
      S.done[id] = !S.done[id]; if (!S.done[id]) delete S.done[id];
      save();
      const card = $('#t-' + id); const done = !!S.done[id];
      card.classList.toggle('done', done);
      b.setAttribute('aria-pressed', done);
      b.innerHTML = `<span class="box">${done ? '✓' : ''}</span>${done ? 'Done in Word!' : 'I did it in Word'}`;
      if (done) toast(['Nice edit! ✂️', 'Looking sharp! ✨', 'Editor power! 💪', 'Great work! 🎉'][Math.floor(Math.random() * 4)]);
      hud(); onChange && onChange();
    });
    const sc = $('#spellCheck');
    if (sc) {
      const read = () => app.querySelectorAll('#spellBox input').forEach(inp => { S.spell[+inp.dataset.k] = inp.value.slice(0, 30); });
      app.querySelectorAll('#spellBox input').forEach(inp => inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); sc.click(); } }));
      sc.onclick = () => {
        read(); save();
        const n = spellCount();
        app.querySelectorAll('#spellBox .sp').forEach((row, k) => {
          const v = S.spell[k]; const ok = norm(v) === T().mistakes[k].right; const tried = String(v || '').trim() !== '';
          row.className = 'sp ' + (ok ? 'ok' : tried ? 'no' : ''); row.querySelector('.mk').textContent = ok ? '✅' : tried ? '❌' : '';
        });
        $('#spellMsg').textContent = n + '/5 correct' + (n < 5 ? '. Keep hunting! Check every paragraph again.' : '. All 5 found! 🔍');
        hud();
      };
    }
  }

  /* ---------- Mission ---------- */
  function renderMission() {
    const m = mById(S.mission) || R.MISSIONS[0];
    const T0 = T();
    const idx = R.MISSIONS.indexOf(m);
    let pre = '';
    if (m.id === 'm1') pre = `<div class="datacard" style="--accent:${m.color}"><h3>📄 Your starter report</h3>
      <p class="small">Copy it, then paste it into a new Word document (Ctrl+V). It has mistakes on purpose. Do not fix the spelling yet! That is Mission 5.</p>
      <div class="row"><button class="btn yellow sm" type="button" data-copy="report">📋 Copy report</button><button class="btn sm" type="button" data-report>👀 View report</button></div></div>`;
    if (m.layout) pre = `<div class="datacard" style="--accent:${m.color}"><h3>🗺️ Layout to follow ${CLASS ? '<span class="badge-custom">Your class layout</span>' : ''}</h3>
      <p class="small">Put the parts of your report in this order, top to bottom:</p>
      <ol class="layout-list">${LAYOUT.items.map(x => `<li>${esc(F(x))}</li>`).join('')}</ol>
      <p class="small muted" style="margin:8px 0 0">Line spacing ${esc(LAYOUT.line)} · Spacing after ${esc(LAYOUT.after)} · Page border ${esc(LAYOUT.border)} · ${esc(LAYOUT.list)} list</p></div>`;
    if (m.chartCard) pre = `<div class="datacard" style="--accent:${m.color}"><h3>📈 Chart data: ${esc(T0.chart.title)}</h3>
      <div class="scroll"><table class="dtable"><thead><tr><th></th><th>${esc(T0.chart.series)}</th></tr></thead><tbody>${T0.chart.labels.map((l, i) => `<tr><td>${esc(l)}</td><td>${T0.chart.values[i]}</td></tr>`).join('')}</tbody></table></div>
      <div class="row" style="margin-top:10px"><button class="btn sm" type="button" data-copy="chart">📋 Copy chart data</button><span class="small muted">Paste into cell A1 of the chart’s Excel window.</span></div></div>`;
    if (m.tableCard) pre = `<div class="datacard" style="--accent:${m.color}"><h3>🗂️ Table data: ${esc(T0.table.caption)}</h3>
      <div class="scroll"><table class="dtable"><thead><tr>${T0.table.headers.map(h => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${T0.table.rows.map(r => `<tr>${r.map(c => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>
      <p class="small muted" style="margin:8px 0 0">Type this into your Word table yourself. 3 columns × 5 rows.</p></div>`;

    const next = R.MISSIONS[idx + 1];
    app.innerHTML = `
      <div class="mhead" style="--accent:${m.color}">
        <span class="ic">${m.icon}</span>
        <div><span class="meta">Mission ${m.num} of 5 · ${esc(m.lesson)} · about ${m.minutes} min</span>
        <h2>${esc(m.title)}</h2><p>${esc(m.story)}</p></div>
      </div>
      <div style="--accent:${m.color}">
        ${pre}
        ${tasksOf(m).map(taskHTML).join('')}
      </div>
      <div class="nav-row">
        <button class="btn sm" type="button" data-go="${idx ? R.MISSIONS[idx - 1].id : 'hq'}">← ${idx ? 'Mission ' + idx : 'Mission HQ'}</button>
        <button class="btn pink" type="button" data-go="${next ? next.id : 'final'}">${next ? 'Next: Mission ' + next.num + ' →' : 'Ready to Publish 🏁'}</button>
      </div>`;
    wireTasks(() => {
      if (missionComplete(m) && !S.seen[m.id]) { S.seen[m.id] = 1; save(); celebrate(m, next); }
    });
  }

  function celebrate(m, next) {
    confetti();
    openModal(`<div class="celebrate"><div class="stamp">Mission ${m.num} complete!</div>
      <h2>${m.icon} ${esc(m.title)} fixed!</h2>
      <p>You claimed <b>${missionPts(m)}/${missionMax(m)}</b> points. Your teacher will check them in your Word file.</p>
      <div class="row" style="justify-content:center"><button class="btn sm" type="button" data-close>Stay here</button>
      <button class="btn pink" type="button" data-close data-go="${next ? next.id : 'final'}">${next ? 'Mission ' + next.num + ' →' : 'Ready to Publish 🏁'}</button></div></div>`);
  }

  /* ---------- Bonus ---------- */
  function renderBonus() {
    const B = R.BONUS;
    app.innerHTML = `
      <div class="mhead" style="--accent:${B.color}"><span class="ic">${B.icon}</span>
        <div><span class="meta">Bonus challenge · up to +10 points</span><h2>${esc(B.title)}</h2><p>${esc(B.story)}</p></div></div>
      <div style="--accent:${B.color}">${B.tasks.map(taskHTML).join('')}</div>
      <div class="nav-row"><button class="btn sm" type="button" data-go="hq">← Mission HQ</button><button class="btn pink" type="button" data-go="final">Ready to Publish 🏁</button></div>`;
    wireTasks();
  }

  /* ---------- Final ---------- */
  function renderFinal() {
    const ready = allComplete();
    const max = R.routeMax(S.route);
    const list = R.FINAL_CHECKLIST.filter(c => S.route !== 'support' || c.core);
    const v = S.verified;
    const missing = R.MISSIONS.filter(m => !missionComplete(m));
    let verifiedHTML = '';
    if (v) {
      const pct = Math.round(Math.min(v.score, max) / max * 100);
      const rk = R.rankFor(pct);
      verifiedHTML = `<section class="card" style="--accent:#14894F;text-align:center">
        <div class="stamp">✔ Verified by teacher</div>
        <p class="score-big" style="margin:14px 0 4px">${v.score}<span style="font-size:.45em">/${max}</span>${v.bonus ? ` <span style="font-size:.4em">+${v.bonus} bonus</span>` : ''}</p>
        <p style="font-size:1.3rem;font-weight:900;margin:0">${rk.emoji} ${rk.name}</p>
        <p class="small muted" style="margin:6px 0 0">Checked ${new Date(v.at).toLocaleString()}</p></section>`;
    }
    app.innerHTML = `
      <section class="card" style="--accent:var(--yellow);text-align:center">
        <span class="kicker">The final step</span>
        <h2>${ready ? 'Ready to Publish!' : 'Almost there, editor!'}</h2>
        <div class="badge-wrap"><div class="badge ${ready ? 'pop' : 'locked'}"><div><span class="sm">School Magazine</span><span class="big">READY TO PUBLISH</span><span class="sm">${esc(S.name)}</span></div></div></div>
        <p>${ready ? `All 5 missions done. You claimed <b>${claimed()}/${max}</b> points${bonusPts() ? ` + <b>${bonusPts()}</b> bonus` : ''}.`
          : `Finish these to unlock your badge: ${missing.map(m => `<button class="btn sm" style="margin:4px" type="button" data-go="${m.id}">${m.icon} Mission ${m.num}</button>`).join('')}`}</p>
        <p class="small muted">🖨️ Stop at Print Preview. Print only when your teacher says so.</p>
      </section>
      ${verifiedHTML}
      <section class="card" style="--accent:var(--teal)">
        <span class="kicker">Final checklist</span>
        <h3>Check your Word report one last time</h3>
        <ul class="checklist">${list.map((c, i) => `<li><label><input type="checkbox" data-fc="${i}" ${S.fc[i] ? 'checked' : ''}><span>${esc(F(c.t))}</span></label></li>`).join('')}</ul>
      </section>
      <section class="card" style="--accent:var(--pink)">
        <span class="kicker">For your teacher</span>
        <h3>👩‍🏫 Teacher check</h3>
        <p>Show your Word file to your teacher. Your teacher checks each task in the file, then stamps your badge here.</p>
        <button class="btn pink" type="button" id="verifyBtn">${v ? 'Check again' : 'Teacher: verify this report'}</button>
      </section>
      <div class="nav-row"><button class="btn sm" type="button" data-go="hq">← Mission HQ</button><button class="btn sm" type="button" data-go="bonus">⚡ Bonus challenge</button></div>`;
    app.querySelectorAll('[data-fc]').forEach(c => c.onchange = () => { S.fc[c.dataset.fc] = c.checked; save(); });
    $('#verifyBtn').onclick = openVerify;
    if (ready && !S.seen.final) { S.seen.final = 1; save(); confetti(); }
  }

  function openVerify() {
    const groups = R.MISSIONS.map(m => `<h4 style="color:${m.color}">${m.icon} Mission ${m.num}: ${esc(m.title)}</h4>` +
      tasksOf(m).map(t => t.spell
        ? `<label><span style="flex:1">${esc(F(t.title))}: mistakes fixed in the file (0–5)</span><input class="nb" type="number" min="0" max="5" data-vn="${t.id}" value="${S.done[t.id] ? spellCount() : 0}"></label>`
        : `<label><input type="checkbox" data-v="${t.id}" data-p="${t.pts}" ${S.done[t.id] ? 'checked' : ''}><span><b>${t.pts}</b> · ${esc(F(t.check))}</span></label>`).join('')).join('') +
      `<h4 style="color:${R.BONUS.color}">⚡ Bonus</h4>` + R.BONUS.tasks.map(t => `<label><input type="checkbox" data-vb="${t.id}" data-p="${t.pts}" ${S.done[t.id] ? 'checked' : ''}><span><b>+${t.pts}</b> · ${esc(F(t.check))}</span></label>`).join('');
    openModal(`<h2>👩‍🏫 Teacher verification</h2>
      <p class="small">Open <b>${esc(S.name)}</b>’s Word file. Ticks show what the student claimed. <b>Untick anything you cannot see in the file.</b></p>
      <div class="vlist">${groups}</div>
      <div class="field" style="margin-top:12px"><label for="vcode">Teacher code</label><input id="vcode" type="password" autocomplete="off" placeholder="Teacher code"></div>
      <p class="err" id="verr" role="alert"></p>
      <div class="row" style="margin-top:12px"><button class="btn sm" type="button" data-close>Cancel</button><button class="btn green" type="button" id="vok">Stamp the badge ✔</button></div>`);
    $('#vok').onclick = () => {
      const code = $('#vcode').value;
      const ok = CLASS && CLASS.code ? R.hash(code) === CLASS.code : code.trim().toUpperCase() === R.STAMP;
      if (!ok) { $('#verr').textContent = 'That code is not right.'; return; }
      let score = 0, bonus = 0;
      $('#modalCard').querySelectorAll('[data-v]:checked').forEach(c => score += +c.dataset.p);
      $('#modalCard').querySelectorAll('[data-vn]').forEach(n => score += Math.max(0, Math.min(5, Math.round(+n.value || 0))));
      $('#modalCard').querySelectorAll('[data-vb]:checked').forEach(c => bonus += +c.dataset.p);
      S.verified = { score, bonus, at: Date.now() }; save();
      closeModal(); confetti(); renderFinal(); hud();
    };
  }

  /* ---------- Report modal ---------- */
  function openReport() {
    const t = T(); if (!t) return;
    openModal(`<h2>📄 Starter report</h2>
      <p class="small">Copy it and paste it into a <b>new Word document</b>. It has <b>5 spelling mistakes</b> and the parts are in the wrong order. You will fix them in the missions!</p>
      <div class="row" style="margin-bottom:12px"><button class="btn yellow sm" type="button" data-copy="report">📋 Copy report</button><button class="btn sm" type="button" data-close>Close</button></div>
      <div class="report" id="reportText" tabindex="0">${esc(R.reportText(t))}</div>
      <p class="small muted" style="margin-top:10px">Copy not working? Press and hold the text (or drag over it), copy it, then paste in Word.</p>`);
  }

  async function copy(kind) {
    const t = T(); if (!t) return;
    const text = kind === 'chart' ? R.chartTSV(t) : R.reportText(t);
    let ok = false;
    try { await navigator.clipboard.writeText(text); ok = true; } catch (e) {
      try { const ta = document.createElement('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select(); ok = document.execCommand('copy'); ta.remove(); } catch (e2) {}
    }
    toast(ok ? (kind === 'chart' ? 'Chart data copied! Paste into cell A1.' : 'Report copied! Paste it into Word with Ctrl+V.') : 'Could not copy. Select the text and copy it yourself.');
    if (!ok && kind !== 'chart') openReport();
  }

  /* ---------- Modal, toast, confetti ---------- */
  function openModal(html) { $('#modalCard').innerHTML = html; $('#modal').hidden = false; const f = $('#modalCard').querySelector('button, input'); f && f.focus({ preventScroll: true }); }
  function closeModal() { $('#modal').hidden = true; }
  $('#modal').addEventListener('click', e => { if (e.target.id === 'modal') closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  let toastT;
  function toast(msg) {
    let el = $('.toast'); if (!el) { el = document.createElement('div'); el.className = 'toast'; el.setAttribute('role', 'status'); document.body.appendChild(el); }
    el.textContent = msg; el.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => { el.hidden = true; }, 2200);
  }
  function confetti() {
    if (reduced) return;
    const box = document.createElement('div'); box.className = 'confetti';
    const cols = ['#FF3E7F', '#FFD23F', '#1FB5A3', '#4C8DFF', '#9B5DE5', '#FF6B5B'];
    for (let i = 0; i < 50; i++) {
      const p = document.createElement('i');
      p.style.left = Math.random() * 100 + '%'; p.style.background = cols[i % cols.length];
      p.style.setProperty('--dx', (Math.random() * 160 - 80) + 'px'); p.style.setProperty('--r', (Math.random() * 900 - 450) + 'deg');
      p.style.animationDuration = (1.2 + Math.random()) + 's'; p.style.animationDelay = Math.random() * .3 + 's';
      box.appendChild(p);
    }
    document.body.appendChild(box); setTimeout(() => box.remove(), 2800);
  }

  /* ---------- Global clicks ---------- */
  document.addEventListener('click', e => {
    const g = e.target.closest('[data-go]');
    const c = e.target.closest('[data-close]');
    if (c) closeModal();
    if (g) {
      const to = g.dataset.go;
      if (to === 'hq' || to === 'final' || to === 'bonus') go(to); else go('mission', to);
      return;
    }
    const cp = e.target.closest('[data-copy]'); if (cp) { copy(cp.dataset.copy); return; }
    if (e.target.closest('[data-report]')) openReport();
  });
  $('#reportBtn').onclick = openReport;
  $('#logoBtn').onclick = () => go(S.topic ? 'hq' : 'start');

  /* ---------- Boot ---------- */
  if (!S.topic) S.screen = 'start';
  go(S.screen || 'start', S.mission);
})();
