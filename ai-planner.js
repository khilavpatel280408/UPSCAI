"use strict";
/* UPSC ZONE AI — ai-planner.js
   Features: #3 #4 #8 #11 #12 #73 #74 #153 #157 #215 #216
   Signature owner: AI Study Autopilot. PlannerAPI isolated & API-ready. */
const LS = "uza_planner_v1";
const $ = s => document.querySelector(s);
const wait = ms => new Promise(r => setTimeout(r, ms));
const esc = s => { const d = document.createElement("div"); d.textContent = s; return d.innerHTML; };

let S = {}; try { S = JSON.parse(localStorage.getItem(LS)) || {}; } catch {}
const save = () => localStorage.setItem(LS, JSON.stringify(S));
function toast(m) { const t = $("#toast"); t.textContent = m; t.hidden = false; clearTimeout(toast._t); toast._t = setTimeout(() => t.hidden = true, 2800); }
const loading = m => `<div class="loading"><span class="spinner"></span>${m} <span class="small muted">(local demo model)</span></div>`;

const DATES = { "2027": "2027-05-30", "2028": "2028-05-28", "2029": "2029-05-27" };
const INTERVALS = [1, 3, 7, 15]; // spaced repetition days (#73)

/* ---------- API-ready layer ---------- */
const PlannerAPI = {
  async generatePlan(i) {              // POST /api/plan/generate
    await wait(900);
    const months = (S.attempt || "2027") === "2027" ? 8 : (S.attempt === "2028" ? 19 : 31);
    const per = Math.max(1, Math.round(months / 4));
    return [
      { n: `Foundation — NCERTs + syllabus mapping`, d: `${per} mo`, l: `${i.hours} h/day · ${i.diff === "expert" ? "peak" : i.diff === "balanced" ? "steady" : "high"} intensity` },
      { n: `Concept Building + first notes pass`, d: `${per} mo`, l: `${i.hours} h/day` },
      { n: `PYQ Intelligence + sectional tests`, d: `${per} mo`, l: `${i.hours} h/day + weekly mock` },
      { n: `Full mocks + Spaced Revision + Mains sprints`, d: `${Math.max(per, 1)} mo`, l: "simulator mode" }
    ];
  },
  async autopilot(hours) {             // POST /api/autopilot/schedule
    await wait(800);
    if (!hours || hours < 1 || hours > 14) { const e = new Error("Hours must be between 1 and 14."); e.code = "range"; throw e; }
    const units = [
      ["Polity — Fundamental Rights (weak area)", "practice"],
      ["Current Affairs digest + note capture", "learn"],
      ["Economy — Monetary Policy revision cards", "revise"],
      ["40 adaptive MCQs + error logging", "practice"],
      ["Mains: one 150-word answer", "writing"],
      ["Recall test: yesterday's topics", "revise"]
    ];
    const start = new Date(); start.setMinutes(start.getMinutes() < 30 ? 30 : 60, 0, 0);
    const blocks = []; let t = new Date(start), left = hours;
    for (let i = 0; i < units.length && left > 0.2; i++) {
      const len = 0.75;
      const end = new Date(t.getTime() + len * 36e5);
      blocks.push({ from: t, to: end, task: units[i][0], type: units[i][1] });
      t = new Date(end.getTime() + 10 * 6e4); left -= len + 10 / 60;
    }
    return blocks;
  },
  async strategy(stage) {              // POST /api/strategy
    await wait(700);
    return {
      early: ["Foundation first: NCERTs + one standard text per subject, weekly recall tests.", "PYQ habit: 10/week to calibrate question sense early.", "Finalize optional within 8 weeks using the Roadmap.", "Current affairs: one 25-min daily digest, never hoard PDFs."],
      mid: ["Flip to 40% output: MCQs, answer writing, teach-back.", "Every test followed by a mistake-notebook loop — no exceptions.", "Monthly full mocks under exam pressure mode.", "Daily 5-minute spaced revision queue is now non-negotiable."],
      final: ["Stop new sources: revise → simulate → analyse → repeat.", "Two full simulators per week at real exam hours.", "Daily: 30 PYQs + 1 answer + 20-min CA recap.", "Sleep and focus hygiene are scoring strategy now."]
    }[stage];
  },
  async whatNow(mins) {                // GET /api/recommend/next-action
    await wait(600);
    const weak = "Fundamental Rights: Art. 20–32";
    if (mins <= 30) return `Rapid revision: 15 flashcards on ${weak}. Short windows favour retrieval over new input.`;
    if (mins <= 60) return `25 adaptive MCQs on ${weak} (UPSC Standard+), then auto error-log. Your accuracy here is 42%.`;
    return `Deep block: ${weak} concept pass → 40 MCQs → mistake review. Queue a sectional mock after.`;
  },
  async recos() {                      // GET /api/recommendations
    await wait(650);
    return ["Run the Autopilot for tomorrow morning — 2 h window is your peak focus slot.", "3 revision cards are overdue by 2 days — clear them before new study.", "CSAT diagnostic lands Sunday; keep 11:00–12:00 free.", "Essay outline from Sunday is still open — 40 minutes closes it."];
  }
};

/* ---------- countdown (#216) ---------- */
function renderCountdown() {
  const at = S.attempt || "2027";
  $("#cd-attempt").value = at;
  const days = Math.max(0, Math.ceil((new Date(DATES[at] + "T09:30:00+05:30") - Date.now()) / 864e5));
  $("#cd-days").textContent = days; $("#cd-year").textContent = at;
  $("#cd-fill").style.width = Math.min(100, Math.round((365 - days) / 365 * 100)) + "%";
}
$("#cd-attempt").addEventListener("change", e => { S.attempt = e.target.value; save(); renderCountdown(); toast(`Plan re-anchored to Prelims ${S.attempt}.`); });

/* ---------- strategy (#215 #8) ---------- */
$("#st-btn").addEventListener("click", async () => {
  const out = $("#st-out"); out.innerHTML = loading("Calibrating strategy…");
  const list = await PlannerAPI.strategy($("#st-stage").value);
  out.innerHTML = `<div class="result-card"><ul>${list.map(x => `<li>${esc(x)}</li>`).join("")}</ul><div class="row" style="margin-top:10px"><a class="btn btn-dark btn-sm" href="roadmap.html">Apply to Roadmap →</a></div></div>`;
});

/* ---------- plan (#3) ---------- */
$("#plan-form").addEventListener("submit", async e => {
  e.preventDefault();
  const out = $("#plan-out"); out.innerHTML = loading("Drafting phase-wise plan…");
  const phases = await PlannerAPI.generatePlan({ hours: $("#pl-hours").value, stage: $("#pl-stage").value, diff: $("#pl-diff").value });
  S.plan = phases; save();
  out.innerHTML = `<div class="result-card">${phases.map((p, i) => `<div class="phase"><span class="phase-num">${i + 1}</span><span><strong>${esc(p.n)}</strong><br><small>${esc(p.d)} · ${esc(p.l)}</small></span></div>`).join("")}</div>`;
  toast("Plan generated & saved ✓");
});

/* ---------- autopilot (#4 #153) + sessions (#157) ---------- */
const fmtT = d => d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
$("#ap-form").addEventListener("submit", async e => {
  e.preventDefault();
  const out = $("#ap-out"), err = $("#ap-err"); err.hidden = true;
  out.innerHTML = loading("Autopilot building your day…");
  try {
    const blocks = await PlannerAPI.autopilot(parseFloat($("#ap-hours").value));
    S.schedule = blocks.map(b => ({ ...b, from: b.from.toISOString(), to: b.to.toISOString(), done: false }));
    save();
    out.innerHTML = `<div class="result-card"><div class="sched">${blocks.map(b =>
      `<div class="sched-row"><span class="t">${fmtT(b.from)}–${fmtT(b.to)}</span><span>${esc(b.task)}</span><span class="type">${b.type}</span></div>`).join("")}</div>
      <div class="row" style="margin-top:12px"><a class="btn btn-primary btn-sm" href="lock-in.html">🔒 Start Lock-In Mode</a><a class="btn btn-ghost btn-sm" href="focus.html">Focus settings</a></div></div>`;
    renderSessions();
    toast("Schedule built — sessions saved ✓");
  } catch (ex) { err.textContent = ex.message; err.hidden = false; out.innerHTML = `<div class="empty">🤖 Autopilot idle — tell it how many hours you have.</div>`; }
});

function renderSessions() {
  const list = $("#ss-list");
  const sess = S.schedule || [];
  if (!sess.length) { list.innerHTML = `<li class="empty" style="justify-content:center">No scheduled sessions yet — let Autopilot build them above.</li>`; $("#ss-note").textContent = ""; return; }
  const open = sess.filter(s => !s.done).length;
  $("#ss-note").textContent = `${open} upcoming · ${sess.length - open} done today`;
  list.innerHTML = sess.map((s, i) => `<li class="${s.done ? "done" : ""}"><span class="when">${fmtT(new Date(s.from))}</span><span>${esc(s.task)}</span>
    <button type="button" data-i="${i}" aria-label="${s.done ? "Mark as not done" : "Mark session complete"}">${s.done ? "↺" : "✓"}</button></li>`).join("");
  list.querySelectorAll("button").forEach(b => b.addEventListener("click", () => {
    const i = +b.dataset.i; S.schedule[i].done = !S.schedule[i].done; save(); renderSessions();
    if (S.schedule[i].done) toast("Session complete — logged to Focus analytics ✓");
  }));
}
$("#ss-clear").addEventListener("click", () => {
  S.schedule = (S.schedule || []).filter(s => !s.done); save(); renderSessions(); toast("Completed sessions cleared.");
});

/* ---------- what now (#11) ---------- */
$("#wn-form").addEventListener("submit", async e => {
  e.preventDefault();
  const out = $("#wn-out"); out.innerHTML = loading("Thinking…");
  const r = await PlannerAPI.whatNow(+$("#wn-time").value);
  out.innerHTML = `<div class="result-card"><strong>Do this:</strong> ${esc(r)}</div>`;
});

/* ---------- spaced revision (#73 #74) ---------- */
function seedRevision() {
  if (S.rev) return;
  const now = Date.now();
  S.rev = [
    { t: "Fundamental Rights: Art. 20–32", step: 0, due: now - 2 * 864e5 },
    { t: "Monetary Policy & RBI tools", step: 1, due: now },
    { t: "Climate treaties & bodies", step: 0, due: now + 864e5 }
  ];
  save();
}
function dueInfo(due) {
  const diff = Math.round((due - Date.now()) / 864e5);
  if (diff < 0) return { cls: "overdue", txt: `Overdue by ${-diff} day(s)` };
  if (diff === 0) return { cls: "today", txt: "Due today" };
  return { cls: "soon", txt: `Due in ${diff} day(s)` };
}
function renderRevision() {
  const out = $("#rv-out");
  if (!S.rev || !S.rev.length) { out.innerHTML = `<div class="empty">Queue is empty — add a topic below and the AI auto-schedules it (+1 day, #74).</div>`; return; }
  out.innerHTML = S.rev.map((r, i) => {
    const d = dueInfo(r.due);
    const next = INTERVALS[Math.min(r.step + 1, INTERVALS.length - 1)];
    return `<div class="rv-item"><div class="rv-top"><strong>${esc(r.t)}</strong><span class="rv-due ${d.cls}">${d.txt}</span></div>
      <p class="rv-meta">Interval ${INTERVALS[Math.min(r.step, 3)]}d · next after revise: ${next}d · auto-scheduled (#74)</p>
      <div class="rv-actions">
        <button class="btn btn-dark btn-sm" data-rev="${i}" type="button">✓ Mark revised</button>
        <button class="btn btn-ghost btn-sm" data-del="${i}" type="button">Remove</button>
      </div></div>`;
  }).join("");
  out.querySelectorAll("[data-rev]").forEach(b => b.addEventListener("click", () => {
    const r = S.rev[+b.dataset.rev];
    r.step = Math.min(r.step + 1, INTERVALS.length - 1);
    r.due = Date.now() + INTERVALS[r.step] * 864e5;
    save(); renderRevision(); toast(`“${r.t}” rescheduled in ${INTERVALS[r.step]} day(s) ✓`);
  }));
  out.querySelectorAll("[data-del]").forEach(b => b.addEventListener("click", () => {
    S.rev.splice(+b.dataset.del, 1); save(); renderRevision();
  }));
}
$("#rv-add").addEventListener("submit", e => {
  e.preventDefault();
  const inp = $("#rv-topic");
  if (inp.value.trim().length < 3) { toast("Topic name too short.", true); return; }
  S.rev = S.rev || [];
  S.rev.push({ t: inp.value.trim(), step: 0, due: Date.now() + INTERVALS[0] * 864e5 });
  save(); inp.value = ""; renderRevision(); toast("Added — auto-scheduled for tomorrow (#74) ✓");
});

/* ---------- recommendations (#12) ---------- */
async function renderRecos() {
  try {
    const r = await PlannerAPI.recos();
    $("#rc-out").innerHTML = r.map(x => `<div class="result-card" style="margin-bottom:8px">✦ ${esc(x)}</div>`).join("");
  } catch { $("#rc-out").innerHTML = `<div class="error-msg">Recommendations unavailable — retry on refresh.</div>`; }
}

/* ---------- init ---------- */
document.addEventListener("DOMContentLoaded", () => {
  renderCountdown(); renderSessions(); seedRevision(); renderRevision(); renderRecos();
  if (S.plan) {
    $("#plan-out").innerHTML = `<div class="result-card">${S.plan.map((p, i) => `<div class="phase"><span class="phase-num">${i + 1}</span><span><strong>${esc(p.n)}</strong><br><small>${esc(p.d)} · ${esc(p.l)}</small></span></div>`).join("")}</div><p class="small muted">Restored from your last session.</p>`;
  }
  setInterval(renderCountdown, 60e3);
});
