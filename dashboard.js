"use strict";
/* UPSC ZONE AI — dashboard.js · command center.
   Features: #1 #2 #5 #11 #12 #13 #49 #58 #61 #181 #185 #186 #193 #196 #204
   DashAPI is isolated & API-ready (replace with real endpoints). */
const LS = "uza_dash_v1";
const $ = s => document.querySelector(s);
const wait = ms => new Promise(r => setTimeout(r, ms));
const esc = s => { const d = document.createElement("div"); d.textContent = s; return d.innerHTML; };

let S = {}; try { S = JSON.parse(localStorage.getItem(LS)) || {}; } catch {}
const save = () => localStorage.setItem(LS, JSON.stringify(S));

/* ---------- API-ready mock layer ---------- */
const DashAPI = {
  async snapshot() {                    // GET /api/dashboard/snapshot
    await wait(800);
    return { readiness: 68, prepScore: 72, memory: 61 };
  },
  async brief() {                       // GET /api/briefing/daily
    await wait(650);
    return [
      { tag: "pre", l: "Prelims", t: "MPC holds repo rate at 5.5% — revise monetary tools." },
      { tag: "mains", l: "Mains", t: "One Nation One Election report — GS-2 federalism angles." },
      { tag: "rev", l: "Revise", t: "Fundamental Rights due (memory 48%) — 5-min cards ready." },
      { tag: "focus", l: "Focus", t: "Yesterday's focus score 76/100 — beat it before 8 pm." }
    ];
  },
  async weak() {                        // GET /api/twin/weak-areas
    await wait(700);
    return [
      { sub: "Polity", topic: "Fundamental Rights 20–32", acc: 42 },
      { sub: "Economy", topic: "Monetary Policy & RBI", acc: 51 },
      { sub: "Environment", topic: "Climate treaties", acc: 55 }
    ];
  },
  async recos() {                       // GET /api/recommendations
    await wait(750);
    return [
      "Mistake-based test on Fundamental Rights — your #1 weak area.",
      "25 current-affairs MCQs are queued from yesterday's digest.",
      "Essay outline pending since Sunday — 40 minutes will close it.",
      "CSAT diagnostic in 3 days — keep Sunday 11:00 free."
    ];
  },
  async whatNow(mins) {                 // GET /api/recommend/next-action
    await wait(700);
    const weak = "Fundamental Rights: Art. 20–32";
    if (mins <= 30) return { a: `Rapid retrieval practice: 15 flashcards on ${weak}.`, why: "Short window + due revision + weakest topic beats new study.", cta: ["revision.html", "Revision Center"] };
    if (mins <= 60) return { a: `25 adaptive MCQs on ${weak} (UPSC Standard+), then error log.`, why: "1-hour blocks convert weakness into accuracy fastest.", cta: ["mock-tests.html", "Start Topic Test"] };
    if (mins <= 120) return { a: `Deep block: ${weak} concept reading → 40 MCQs → mistake review.`, why: "2 hours allow a full learn→practice→analyze loop.", cta: ["test-interface.html", "Open Test Interface"] };
    return { a: "Full cycle: Polity weak block → sectional mock → mistake review → 20-min CA digest.", why: "3+ hours rewards a mini-simulation day at 68% readiness.", cta: ["ai-planner.html", "Build Full Schedule"] };
  },
  async copilotPing(q) {                // POST /api/chat/quick
    await wait(600);
    const s = q.toLowerCase();
    if (s.includes("repo")) return "Repo rate = rate at which RBI lends overnight to banks against securities. Held at 5.5% by the MPC. Higher repo → costlier credit → inflation cools. Want 5 MCQs on this?";
    if (s.includes("plan") || s.includes("evening")) return "Tonight: 19:00 Polity weak block (45m) → 19:50 break → 20:00 sectional mock (50m) → 20:50 error log. I can lock this session.";
    if (s.includes("monsoon")) return "Indian monsoon: June–Sept SW monsoon delivers ~75% of rainfall; onset over Kerala ~1 June; driven by ITCZ shift + Tibetan plateau heating. 3 PYQs exist on this.";
    return "I can plan, explain at 3 depths, quiz you or pick revision topics. For the full conversation, open the AI Copilot page.";
  }
};

/* ---------- helpers ---------- */
function toast(msg) { const t = $("#toast"); t.textContent = msg; t.hidden = false; clearTimeout(toast._t); toast._t = setTimeout(() => t.hidden = true, 3000); }
function loading(msg) { return `<div class="loading"><span class="spinner"></span>${msg}</div>`; }

/* ---------- topbar ---------- */
function renderTop() {
  const days = Math.max(0, Math.ceil((new Date("2027-05-30T09:30:00+05:30") - Date.now()) / 864e5));
  $("#top-count").textContent = `⏳ Prelims 2027: ${days}d`;
  const h = new Date().getHours();
  $("#greet-h").textContent = `${h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening"}, ${S.name || "aspirant"}`;
  $("#today-date").textContent = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

/* ---------- readiness (#58 #49) ---------- */
async function renderReadiness() {
  try {
    const r = await DashAPI.snapshot();
    $("#rd-out").innerHTML = `<div class="donut-wrap">
      <div class="donut" id="rd-donut" role="img" aria-label="Overall readiness ${r.readiness} percent"><div>${r.readiness}%</div></div>
      <ul class="rd-list">
        <li><div class="meter-row"><span>Overall readiness <span class="fid">#58</span></span><span class="meter"><span style="width:${r.readiness}%"></span></span><strong>${r.readiness}%</strong></div></li>
        <li><div class="meter-row"><span>Preparation score <span class="fid">#49</span></span><span class="meter"><span style="width:${r.prepScore}%"></span></span><strong>${r.prepScore}%</strong></div></li>
        <li><div class="meter-row"><span>Memory strength</span><span class="meter"><span style="width:${r.memory}%"></span></span><strong>${r.memory}%</strong></div></li>
      </ul></div>`;
    setTimeout(() => { $("#rd-donut").style.background = `conic-gradient(var(--saffron) ${r.readiness * 3.6}deg,#eee3cf 0deg)`; }, 60);
  } catch { $("#rd-out").innerHTML = `<div class="error-msg">Could not load readiness. Refresh to retry.</div>`; }
}

/* ---------- briefing (#5) ---------- */
async function renderBrief() {
  try {
    const items = await DashAPI.brief();
    $("#bf-out").innerHTML = `<ul class="brief-list">${items.map(i => `<li><span class="tag tag-${i.tag}">${i.l}</span>${esc(i.t)}</li>`).join("")}</ul>`;
  } catch { $("#bf-out").innerHTML = `<div class="error-msg">Brief unavailable — try refreshing.</div>`; }
}

/* ---------- weak areas (#13) ---------- */
async function renderWeak() {
  try {
    const w = await DashAPI.weak();
    $("#wk-out").innerHTML = w.map(x => `<div class="weak-row"><span class="weak-sub">${esc(x.sub)}</span><span class="weak-bar"><span class="${x.acc > 50 ? "mid" : ""}" style="width:${x.acc}%"></span></span><span class="weak-pct">${x.acc}%</span></div>`).join("");
  } catch { $("#wk-out").innerHTML = `<div class="error-msg">Weak-area scan failed.</div>`; }
}

/* ---------- recommendations (#12) ---------- */
async function renderRecos() {
  try {
    const r = await DashAPI.recos();
    $("#rc-out").innerHTML = r.map(x => `<div class="reco">✦ <span>${esc(x)}</span></div>`).join("");
  } catch { $("#rc-out").innerHTML = `<div class="error-msg">Recommendations unavailable.</div>`; }
}

/* ---------- what now (#11) ---------- */
$("#wn-form").addEventListener("submit", async e => {
  e.preventDefault();
  const out = $("#wn-out");
  out.innerHTML = loading("Analysing time × weakness × revision queue…");
  try {
    const r = await DashAPI.whatNow(+$("#wn-time").value);
    out.innerHTML = `<div class="result-card"><strong>Do this now:</strong> ${esc(r.a)}<p class="muted" style="margin-top:6px"><strong>Why:</strong> ${esc(r.why)}</p><div class="row" style="margin-top:10px"><a class="btn btn-dark btn-sm" href="${r.cta[0]}">${r.cta[1]} →</a></div></div>`;
    S.lastWhatNow = Date.now(); save();
  } catch { out.innerHTML = `<div class="error-msg">Recommendation failed — please retry.</div>`; }
});

/* ---------- copilot mini (#1) + buddy (#2) ---------- */
$("#cp-form").addEventListener("submit", async e => {
  e.preventDefault();
  const q = $("#cp-q"), err = $("#cp-err"), out = $("#cp-out");
  if (q.value.trim().length < 4) { err.textContent = "Type a real question (4+ characters)."; err.hidden = false; return; }
  err.hidden = true;
  out.innerHTML = loading("Copilot thinking… (local demo model)");
  try {
    const a = await DashAPI.copilotPing(q.value.trim());
    out.innerHTML = `<div class="result-card">${esc(a)} <a class="text-link" href="ai-copilot.html">Continue →</a></div>`;
    S.lastPing = q.value.trim(); save(); q.value = "";
  } catch { out.innerHTML = `<div class="error-msg">Copilot unavailable — retry.</div>`; }
});
const buddyT = $("#buddy-toggle");
buddyT.checked = S.buddy !== false;
function buddyText() { $("#buddy-status").textContent = buddyT.checked ? `Buddy mode ON${S.checkin ? " · checked in at " + S.checkin : " — accountability check-ins enabled."}` : "Buddy mode OFF — you're on self-drive."; }
buddyT.addEventListener("change", () => { S.buddy = buddyT.checked; if (!buddyT.checked) S.checkin = null; save(); buddyText(); toast(buddyT.checked ? "Study Buddy is watching over your streak." : "Study Buddy paused."); });
$("#buddy-checkin").addEventListener("click", () => {
  S.checkin = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }); save(); buddyText();
  toast("Buddy check-in logged — streak protected ✓");
});
buddyText();

/* ---------- focus (#181 #185) ---------- */
const focusT = $("#focus-toggle");
focusT.checked = !!S.focusMode;
function focusUI() {
  $("#focus-state").textContent = focusT.checked ? "Focus mode ON" : "Focus mode OFF";
  $("#focus-note").textContent = focusT.checked ? "Notifications + social + entertainment blocked (demo)." : "Distraction blocking idle.";
  document.body.classList.toggle("focus-on", focusT.checked);
  const score = S.focusScore ?? 76;
  $("#focus-score").textContent = score + "/100";
  $("#focus-fill").style.width = score + "%";
}
focusT.addEventListener("change", () => {
  S.focusMode = focusT.checked;
  if (S.focusMode) { S.focusScore = Math.min(100, (S.focusScore ?? 76) + 3); }
  save(); focusUI();
  toast(S.focusMode ? "Focus Mode engaged — distractions blocked." : "Focus Mode off.");
});
focusUI();

/* ---------- streak + XP (#186 #196 #193) ---------- */
function renderXP() {
  S.xp = S.xp ?? 1240;
  const lvl = Math.floor(S.xp / 150) + 1, into = S.xp % 150;
  $("#xp-num").textContent = `${S.xp} XP · ${into}/150 to Lv ${lvl + 1}`;
  $("#xp-fill").style.width = Math.round(into / 150 * 100) + "%";
  const today = new Date().toDateString();
  const btn = $("#xp-claim");
  if (S.xpClaimed === today) { btn.disabled = true; btn.textContent = "Daily XP claimed ✓"; }
}
$("#xp-claim").addEventListener("click", () => {
  const today = new Date().toDateString();
  if (S.xpClaimed === today) return;
  S.xp = (S.xp ?? 1240) + 25; S.xpClaimed = today; save(); renderXP();
  toast("+25 UPSC XP claimed — streak day " + (S.streak ?? 12) + " counts! 🔥");
});
$("#streak-days").textContent = S.streak ?? 12;
renderXP();

/* ---------- confidence (#61) ---------- */
const conf = $("#conf-slider");
conf.value = S.confidence ?? 6;
function confUI() { $("#conf-label").textContent = `Confidence: ${conf.value}/10 — ${conf.value >= 8 ? "exam-tempered" : conf.value >= 5 ? "steady" : "shaky — run a small win today"}`; }
conf.addEventListener("input", () => { S.confidence = +conf.value; save(); confUI(); });
confUI();

/* ---------- milestones (#204) ---------- */
const MILESTONES = [
  ["m1", "Syllabus mapped to NCERTs"], ["m2", "All Foundation NCERTs done"],
  ["m3", "First full mock attempted"], ["m4", "100 PYQs solved"],
  ["m5", "Mistake Notebook active (20+ entries)"], ["m6", "5 full mocks above 90 marks"]
];
function renderMS() {
  $("#ms-list").innerHTML = MILESTONES.map(([id, t]) => `<li data-ms="${id}" class="${S.ms?.[id] ? "done" : ""}" tabindex="0" role="button" aria-pressed="${!!S.ms?.[id]}"><span class="mk" aria-hidden="true">${S.ms?.[id] ? "✓" : ""}</span>${t}</li>`).join("");
  const done = MILESTONES.filter(([id]) => S.ms?.[id]).length;
  $("#ms-fill").style.width = Math.round(done / MILESTONES.length * 100) + "%";
  $("#ms-pct").textContent = `${done}/${MILESTONES.length}`;
  $$("#ms-list li").forEach(li => {
    const toggle = () => {
      S.ms = S.ms || {}; const id = li.dataset.ms;
      S.ms[id] = !S.ms[id]; save(); renderMS();
      if (S.ms[id]) toast("Milestone marked complete ✓");
    };
    li.addEventListener("click", toggle);
    li.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); } });
  });
}
const $$ = s => [...document.querySelectorAll(s)];

/* ---------- init ---------- */
document.addEventListener("DOMContentLoaded", () => {
  try { const ob = JSON.parse(localStorage.getItem("uza_onboarding_v1")); if (ob?.name) S.name = ob.name.split(" ")[0]; } catch {}
  renderTop(); renderReadiness(); renderBrief(); renderWeak(); renderRecos(); renderMS();
  setInterval(renderTop, 60e3);
});
