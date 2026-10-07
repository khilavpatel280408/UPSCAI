"use strict";
/* UPSC ZONE AI — roadmap.js · SIGNATURE SYSTEM: Personal UPSC Roadmap
   Features: #205 #206 #207 #208 #209 #210 #211 #212 #213 #214 #215 #216 #217
   RoadmapAPI isolated & API-ready. */
const LS = "uza_roadmap_v1";
const $ = s => document.querySelector(s);
const wait = ms => new Promise(r => setTimeout(r, ms));
const esc = s => { const d = document.createElement("div"); d.textContent = s; return d.innerHTML; };
let S = {}; try { S = JSON.parse(localStorage.getItem(LS)) || {}; } catch {}
const save = () => localStorage.setItem(LS, JSON.stringify(S));
function toast(m) { const t = $("#toast"); t.textContent = m; t.hidden = false; clearTimeout(toast._t); toast._t = setTimeout(() => t.hidden = true, 3000); }

const STAGES = [
  { n: "Foundation", d: "NCERTs + syllabus mapping", prog: 100, tasks: ["Syllabus mapped to NCERTs", "All Foundation NCERTs read", "Newspaper habit set"], link: ["topic-explorer.html", "Open Topic Explorer"] },
  { n: "Concept Building", d: "Standard texts + first notes", prog: 64, tasks: ["Laxmikanth — Polity core", "Ramesh Singh — Economy", "First notes pass done"], link: ["notes.html", "Smart Notes"] },
  { n: "PYQ Intelligence", d: "Previous-year frames", prog: 30, tasks: ["100 PYQs solved", "Trend tags reviewed", "PYQ-based drills weekly"], link: ["pyq.html", "PYQ Intelligence"] },
  { n: "Mock Tests", d: "Adaptive + sectional + full", prog: 12, tasks: ["6 sectional mocks", "First full mock", "Mistake loops after every test"], link: ["mock-tests.html", "Test Center"] },
  { n: "Spaced Revision", d: "1→3→7→15→30 cycle", prog: 45, tasks: ["Queue under 3 days overdue", "Monthly CA digest cleared"], link: ["revision.html", "Revision Center"] },
  { n: "Mains Writing", d: "Timed answers + essays", prog: 8, tasks: ["3 timed answers/week", "1 essay/week", "Ethics case studies"], link: ["answer-writing.html", "Answer Writing"] },
  { n: "Interview", d: "DAF-based preparation", prog: 0, locked: true, tasks: ["DAF deep-dive", "3 mock interview rounds"], link: ["preparation.html", "Preparation Center"] },
  { n: "Exam Ready", d: "Consolidation week", prog: 0, locked: true, tasks: ["Light revision only", "Sleep & focus hygiene"], link: ["dashboard.html", "Dashboard"] }
];
const DATES = { "2027": "2027-05-30", "2028": "2028-05-28", "2029": "2029-05-27" };
let selStage = STAGES.findIndex(s => s.prog < 100);

const RoadmapAPI = {
  async replan() {                       // signature: dynamic adaptation
    await wait(1000);
    const shift = ["Polity weak block gets +2 weeks in Concept Building", "Mock cadence raised to weekly after accuracy dipped", "Essay track starts 3 weeks earlier — GS-2 demand rising"];
    STAGES[1].prog = Math.min(100, STAGES[1].prog + 4);
    STAGES[3].prog = Math.min(100, STAGES[3].prog + 3);
    return shift;
  },
  async interviewQs(theme) {             // #214
    await wait(850);
    return [
      `Tell us something about ${theme.toLowerCase()} that most candidates would miss.`,
      `A critic says your position on ${theme.toLowerCase()} is idealistic. Defend it in two sentences.`,
      `If you become a district officer, how would ${theme.toLowerCase()} shape your first 100 days?`
    ];
  },
  async strategy(attempt) {              // #215
    await wait(800);
    return {
      "2027": ["Foundation exits in 6 weeks — NCERT gaps are the only blocker.", "Move to output-heavy weeks: 40% practice from month 3.", "One full mock/month until January, then weekly.", "Optional must be 60% covered before Prelims simulation phase."],
      "2028": ["You have runway — build depth, not speed.", "Two optionals-pass worth of reading before next June.", "PYQ habit first: 10/week from day one."],
      "2029": ["Long window: risk is drift, not coverage.", "Quarterly milestones with the Consistency Tracker.", "Keep a light mock habit alive to prevent rust."]
    }[attempt];
  }
};

/* ---------- timeline render ---------- */
function renderTimeline() {
  $("#timeline").innerHTML = STAGES.map((s, i) => {
    const cls = [s.prog >= 100 ? "done" : "", i === selStage ? "current" : "", s.locked ? "locked" : "", i === S.sel ? "sel" : ""].join(" ").trim();
    return `<li class="tl-step ${cls}" data-st="${i}" role="button" tabindex="0" aria-label="Stage ${i + 1}: ${s.n}, ${s.prog} percent complete">
      <span class="tl-dot">${s.prog >= 100 ? "✓" : s.locked ? "🔒" : i + 1}</span>
      <span class="tl-name">${s.n}</span><span class="tl-sub">${s.prog}%${s.locked ? " · locked" : ""}</span></li>`;
  }).join("");
  $("#timeline").querySelectorAll("[data-st]").forEach(li => {
    const open = () => { S.sel = +li.dataset.st; save(); renderTimeline(); renderDetail(+li.dataset.st); };
    li.addEventListener("click", open);
    li.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } });
  });
}
function renderDetail(i) {
  const s = STAGES[i];
  $("#stage-detail").innerHTML = `<div class="stage-detail"><h3>Stage ${i + 1}: ${s.n} — ${s.d}</h3>
    <ul>${s.tasks.map(t => `<li>${esc(t)}</li>`).join("")}</ul>
    <div class="meter-row"><span>Stage progress</span><span class="meter"><span style="width:${s.prog}%"></span></span><strong>${s.prog}%</strong></div>
    <div class="row" style="margin-top:10px"><a class="btn btn-dark btn-sm" href="${s.link[0]}">${s.link[1]} →</a>
    ${i === selStage ? '<button class="btn btn-primary btn-sm" id="sd-work" type="button">Work on this stage now</button>' : ""}</div></div>`;
  const w = $("#sd-work");
  if (w) w.addEventListener("click", () => {
    s.prog = Math.min(100, s.prog + 5); save(); renderTimeline(); renderDetail(i);
    toast(`+5% on ${s.n} — logged to your twin.`);
  });
}

/* ---------- re-plan (signature adaptation) ---------- */
$("#replan").addEventListener("click", async () => {
  const b = $("#replan"); b.disabled = true; b.innerHTML = '<span class="spinner"></span> Re-planning…';
  const shifts = await RoadmapAPI.replan();
  b.disabled = false; b.textContent = "↻ Re-plan from latest performance";
  save(); renderTimeline(); renderDetail(S.sel ?? selStage);
  toast("Roadmap adapted to your latest performance ✓");
  $("#stage-detail").insertAdjacentHTML("afterbegin", "");
  renderDetail(S.sel ?? selStage);
  shifts.forEach((sh, i) => setTimeout(() => toast("Adaptation " + (i + 1) + ": " + sh), i * 1400));
});

/* ---------- tracks + GS (#205–#210) ---------- */
setTimeout(() => {
  $("#p-pre").style.width = "58%"; $("#p-mai").style.width = "22%"; $("#p-ess").style.width = "10%"; $("#p-int").style.width = "0%";
}, 90);
const GS = [["GS-1", 66], ["GS-2", 48], ["GS-3", 55], ["GS-4", 30]];
$("#gs-out").innerHTML = GS.map(([g, v]) => `<div class="gs-row"><span>${g}</span>
  <span class="meter"><span style="width:${v}%;background:${v >= 60 ? "var(--green)" : "var(--saffron)"}"></span></span><strong>${v}%</strong></div>`).join("");
$("#opt-sel").value = S.optional || "PSIR";
$("#opt-prog").value = S.optProg ?? 35;
$("#opt-out").textContent = (S.optProg ?? 35) + "%";
$("#opt-sel").addEventListener("change", e => { S.optional = e.target.value; save(); toast(`Optional set to ${S.optional} (#210).`); });
$("#opt-prog").addEventListener("input", e => { S.optProg = +e.target.value; $("#opt-out").textContent = S.optProg + "%"; save(); });
document.querySelectorAll('input[name="csat"]').forEach(r => r.addEventListener("change", () => { S.csat = r.value; save(); toast("CSAT status saved (#211)."); }));
document.querySelectorAll('input[name="eth"]').forEach(r => r.addEventListener("change", () => { S.eth = r.value; save(); toast("Ethics status saved (#212)."); }));

/* ---------- interview simulator (#214) ---------- */
$("#iv-gen").addEventListener("click", async () => {
  const out = $("#iv-out"), btn = $("#iv-gen");
  btn.disabled = true; btn.innerHTML = '<span class="spinner"></span> Panel thinking…';
  out.innerHTML = `<div class="empty">The panel is reading your DAF theme…</div>`;
  const qs = await RoadmapAPI.interviewQs($("#iv-theme").value);
  out.innerHTML = qs.map((q, i) => `<div class="iv-q"><strong>Member ${i + 1}:</strong> ${esc(q)}</div>`).join("") +
    `<a class="btn btn-ghost btn-sm" href="answer-writing.html?q=${encodeURIComponent("Interview answer: " + $("#iv-theme").value)}&w=250" style="align-self:flex-start">Draft my answers →</a>`;
  btn.disabled = false; btn.textContent = "Generate panel questions";
});

/* ---------- strategy (#215) ---------- */
$("#st-gen").addEventListener("click", async () => {
  const out = $("#st-out"); out.innerHTML = `<div class="empty">Calibrating to your phase…</div>`;
  const lines = await RoadmapAPI.strategy($("#cd-attempt").value);
  out.innerHTML = `<div class="strat-box"><strong>${$("#cd-attempt").value} attempt strategy</strong><ul>${lines.map(l => `<li>${esc(l)}</li>`).join("")}</ul></div>`;
});

/* ---------- countdown + readiness (#216 #217) ---------- */
function renderCountdown() {
  const at = $("#cd-attempt").value || S.attempt || "2027";
  const days = Math.max(0, Math.ceil((new Date(DATES[at] + "T09:30:00+05:30") - Date.now()) / 864e5));
  $("#cd-days").textContent = days;
  $("#rm-count").textContent = `⏳ Prelims ${at}: ${days}d`;
  $("#cd-fill").style.width = Math.min(100, Math.round((365 - days) / 365 * 100)) + "%";
  const ready = 62;
  setTimeout(() => { $("#cd-donut").style.background = `conic-gradient(var(--gold) ${ready * 3.6}deg,#eee3cf 0deg)`; }, 80);
  $("#cd-ready").textContent = ready;
}
$("#cd-attempt").value = S.attempt || "2027";
$("#cd-attempt").addEventListener("change", e => { S.attempt = e.target.value; save(); renderCountdown(); renderStrategyIfOpen(); toast(`Roadmap re-anchored to Prelims ${S.attempt} (#216).`); });
function renderStrategyIfOpen() {}

document.addEventListener("DOMContentLoaded", () => {
  renderTimeline(); renderDetail(S.sel ?? selStage); renderCountdown();
});
