"use strict";
/* UPSC ZONE AI — preparation-twin.js · SIGNATURE OWNER: AI Preparation Twin
   Features: #10 #13 #14 #49 #54 #55 #58 #60 #61 #63 #69 #82 #83 #217
   TwinAPI isolated & API-ready (swap for GET /api/twin/*). */
const LS = "uza_twin_v1";
const $ = s => document.querySelector(s);
const wait = ms => new Promise(r => setTimeout(r, ms));
const esc = s => { const d = document.createElement("div"); d.textContent = s; return d.innerHTML; };
let S = {}; try { S = JSON.parse(localStorage.getItem(LS)) || {}; } catch {}
const save = () => localStorage.setItem(LS, JSON.stringify(S));
function toast(m) { const t = $("#toast"); t.textContent = m; t.hidden = false; clearTimeout(toast._t); toast._t = setTimeout(() => t.hidden = true, 3000); }

const TwinAPI = {
  async snapshot() {                    // GET /api/twin/snapshot
    await wait(950);
    return {
      readiness: 68, examReadiness: 62, prepScore: 72,
      cons: 74, cov: 66, out: 71,
      memory: [
        { t: "Polity", v: 48 }, { t: "Economy", v: 61 }, { t: "Geography", v: 82 },
        { t: "Modern History", v: 70 }, { t: "Environment", v: 55 }, { t: "S&T", v: 63 }
      ],
      weak: [
        { sub: "Polity", topic: "Fundamental Rights: Art. 20–32", acc: 42, concept: "Writ-jurisdiction overlap (32 vs 226)" },
        { sub: "Economy", topic: "Monetary Policy & RBI tools", acc: 51, concept: "SDF vs reverse-repo corridor shift" },
        { sub: "Environment", topic: "Climate treaties & bodies", acc: 55, concept: "CBDR applications in MCQs" }
      ],
      strong: [
        { sub: "Geography", topic: "Indian Monsoon mechanism", acc: 88 },
        { sub: "History", topic: "Freedom Struggle 1930–47", acc: 84 },
        { sub: "Polity", topic: "Parliament procedures", acc: 79 }
      ],
      forgotten: [
        { t: "UN bodies & reform committees", learned: 41, decay: 74, weight: 3 },
        { t: "North-Indian rivers & tributaries", learned: 29, decay: 58, weight: 2 },
        { t: "Five-Year Plan targets", learned: 22, decay: 47, weight: 1 }
      ],
      lastTest: { name: "GS Full Mock 4", score: "74/200", acc: 37, time: "142 / 120 min", verdict: "Accuracy dropped 9 points in Polity Qs 40–60 — fatigue pattern after minute 90. Negative marking came from elimination-guesses on statement-based questions. Fix: 20 statement-format drills + time-boxing at Q40 and Q70." }
    };
  }
};

/* ---------- render: scores (#58 #217 #49) ---------- */
function donut(el, pct, gold) {
  el.style.background = `conic-gradient(${gold ? "var(--gold)" : "var(--saffron)"} ${pct * 3.6}deg, #eee3cf 0deg)`;
}
async function renderAll() {
  ["#weak-out", "#strong-out", "#forgotten-out", "#test-out", "#mem-bars"].forEach(id =>
    $(id).innerHTML = `<div class="loading"><span class="spinner"></span> Twin analysing… (local demo)</div>`);
  try {
    const d = await TwinAPI.snapshot();
    $("#v-ready").textContent = d.readiness; donut($("#dn-ready"), d.readiness);
    $("#ready-note").textContent = d.readiness >= 65 ? "On trajectory — weakness work is the lever now." : "Below trajectory — increase output practice.";
    $("#v-exam").textContent = d.examReadiness; donut($("#dn-exam"), d.examReadiness, true);
    $("#exam-note").textContent = "Weighted for Prelims 2027 pattern & cut-off trend.";
    $("#v-prep").textContent = d.prepScore + "/100";
    setTimeout(() => { $("#m-cons").style.width = d.cons + "%"; $("#m-cov").style.width = d.cov + "%"; $("#m-out").style.width = d.out + "%"; }, 60);
    renderMemory(d.memory); renderWeak(d.weak); renderStrong(d.strong); renderForgotten(d.forgotten); renderTest(d.lastTest);
  } catch {
    ["#weak-out", "#strong-out", "#forgotten-out", "#test-out", "#mem-bars"].forEach(id =>
      $(id).innerHTML = `<div class="muted">Analysis failed — press Re-sync to retry.</div>`);
  }
}

/* ---------- memory meter (#60) ---------- */
function renderMemory(mem) {
  $("#mem-bars").innerHTML = mem.map(m => {
    const cls = m.v >= 75 ? "hi" : m.v >= 55 ? "md" : "lo";
    return `<div class="mem-row"><span>${esc(m.t)}</span><span class="bar"><span class="${cls}" style="width:${m.v}%;background:${m.v >= 75 ? "var(--green)" : m.v >= 55 ? "var(--saffron)" : "var(--red)"}"></span></span><span class="pct ${cls}">${m.v}%</span></div>`;
  }).join("");
}

/* ---------- weak (#13 #54 #69) ---------- */
function renderWeak(weak) {
  $("#weak-out").innerHTML = weak.map((w, i) => `
    <div class="topic-row">
      <div class="topic-top"><strong>${esc(w.sub)} — ${esc(w.topic)}</strong><span class="acc ${w.acc < 45 ? "bad" : "ok"}">${w.acc}%</span></div>
      <span class="concept-chip" title="Weak concept detected (#69)">Weak concept detected: ${esc(w.concept)}</span>
      <div class="topic-actions">
        <a class="mini-btn" href="test-interface.html">⚡ Drill this concept</a>
        <a class="mini-btn" href="mistake-notebook.html">View mistakes</a>
      </div>
    </div>`).join("");
}

/* ---------- strong (#55) ---------- */
function renderStrong(strong) {
  $("#strong-out").innerHTML = strong.map(s => `
    <div class="topic-row">
      <div class="topic-top"><strong>${esc(s.sub)} — ${esc(s.topic)}</strong><span class="acc good">${s.acc}%</span></div>
      <p class="muted small" style="margin-top:5px">${s.acc >= 85 ? "Maintenance mode: revision every 15 days." : "Solid — one sectional test/month keeps it sharp."}</p>
    </div>`).join("");
}

/* ---------- forgotten (#82) + priority (#83) ---------- */
function priority(f) { return Math.round(0.5 * f.decay + 0.3 * Math.min(90, f.learned) + 0.2 * f.weight * 20); }
function renderForgotten(list) {
  const sorted = [...list].sort((a, b) => priority(b) - priority(a));
  $("#forgotten-out").innerHTML = sorted.map(f => {
    const p = priority(f);
    const cls = f.decay >= 70 ? "overdue" : f.decay >= 50 ? "warn" : "ok";
    const queued = S.queued?.includes(f.t);
    return `<div class="fg-row ${cls} ${queued ? "queued" : ""}">
      <div class="fg-top"><strong>${esc(f.t)}</strong><span class="prio">Priority ${p} <span style="opacity:.7">#83</span></span></div>
      <p class="muted small">Learned ${f.learned} days ago · memory decay ${f.decay}% · exam weight ${"★".repeat(f.weight)}</p>
      <div class="topic-actions">
        <button class="mini-btn" data-q="${esc(f.t)}" type="button">${queued ? "Queued ✓" : "🔁 Queue revision"}</button>
        <a class="mini-btn" href="revision.html">Open Revision Center</a>
      </div></div>`;
  }).join("");
  $("#forgotten-out").querySelectorAll("[data-q]").forEach(b => b.addEventListener("click", () => {
    S.queued = S.queued || [];
    if (!S.queued.includes(b.dataset.q)) { S.queued.push(b.dataset.q); save(); toast(`“${b.dataset.q}” queued — AI will schedule it (#74 bridge).`); }
    TwinAPI.snapshot().then(d => renderForgotten(d.forgotten));
  }));
}

/* ---------- test analysis (#63) ---------- */
function renderTest(t) {
  $("#test-out").innerHTML = `<div class="test-box">
    <div class="score-line"><span><strong>${t.score}</strong><br><span class="muted small">${esc(t.name)}</span></span>
    <span><strong>${t.acc}%</strong><br><span class="muted small">accuracy</span></span>
    <span><strong>${t.time}</strong><br><span class="muted small">time used</span></span></div>
    <div class="ai-verdict"><strong>AI verdict:</strong> ${esc(t.verdict)}</div></div>`;
}

/* ---------- confidence (#61) ---------- */
const conf = $("#conf");
conf.value = S.confidence ?? 6;
function confUI() {
  const v = +conf.value;
  const gap = v - 6; // vs twin baseline 68% readiness ~6
  $("#conf-out").textContent = `Confidence ${v}/10 — ${v >= 8 ? "high; twin will add harder mocks to test it" : v >= 5 ? "steady; matches your readiness curve" : "low; twin suggests one quick win before deep work"}.`;
}
conf.addEventListener("input", () => { S.confidence = +conf.value; save(); confUI(); });
confUI();

/* ---------- adaptive (#14) ---------- */
const ad = $("#adaptive");
ad.value = S.adaptive || "standard";
function adUI() {
  $("#adaptive-note").textContent = {
    balanced: "Next tests start easier and ramp up — good after a bad mock.",
    standard: "Tests mirror real cut-off pressure. Recommended at 68% readiness.",
    expert: "Harder than the real paper. Use only with 6+ hours/week for review."
  }[ad.value];
}
ad.addEventListener("change", () => { S.adaptive = ad.value; save(); adUI(); toast("Adaptive difficulty updated — applied to your next test."); });
adUI();

/* ---------- resync ---------- */
$("#resync").addEventListener("click", async () => {
  const b = $("#resync"); b.disabled = true; b.innerHTML = '<span class="spinner"></span> Syncing…';
  await renderAll();
  b.disabled = false; b.innerHTML = "↻ Re-sync twin";
  S.lastSync = Date.now(); save();
  toast("Twin re-synced with your last 7 days of activity ✓");
});

document.addEventListener("DOMContentLoaded", () => {
  renderAll();
  if (S.lastSync) toast("Twin data restored from your last session.");
});
