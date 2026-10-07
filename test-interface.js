"use strict";
/* UPSC ZONE AI — test-interface.js · live exam engine
   Features: #32 #33 #41 #42 #45 #46 · TestEngine isolated & API-ready. */
const LS_SESSION = "uza_test_session";
const $ = s => document.querySelector(s);
const esc = s => { const d = document.createElement("div"); d.textContent = s; return d.innerHTML; };
function toast(m) { const t = $("#toast"); t.textContent = m; t.hidden = false; clearTimeout(toast._t); toast._t = setTimeout(() => t.hidden = true, 2600); }

/* ---------- question bank (honest demo) ---------- */
const BANK = [
  { q: "Which Article is called the 'heart and soul' of the Constitution by Dr. Ambedkar?", o: ["Article 14", "Article 19", "Article 32", "Article 44"], a: 2, sub: "Polity", topic: "Fundamental Rights", diff: 1, exp: "Article 32 — right to constitutional remedies." },
  { q: "The repo rate in India is decided by:", o: ["Finance Ministry", "Monetary Policy Committee", "SEBI", "Finance Commission"], a: 1, sub: "Economy", topic: "Monetary Policy", diff: 1, exp: "MPC, chaired by the RBI Governor." },
  { q: "The Indian monsoon normally reaches Kerala around:", o: ["1 May", "1 June", "1 July", "15 June"], a: 1, sub: "Geography", topic: "Indian Monsoon", diff: 1, exp: "Onset over Kerala is ~1 June." },
  { q: "A Money Bill in the Rajya Sabha can be delayed for a maximum of:", o: ["1 month", "14 days", "6 months", "It cannot be delayed"], a: 1, sub: "Polity", topic: "Parliament", diff: 2, exp: "14 days only — no amendment power." },
  { q: "El Niño's typical effect on the Indian monsoon is:", o: ["Strengthening", "Weakening", "No effect", "Only affects winter"], a: 1, sub: "Geography", topic: "Indian Monsoon", diff: 2, exp: "El Niño weakens; La Niña strengthens." },
  { q: "The Partition of Bengal (1905) was carried out by:", o: ["Lord Ripon", "Lord Curzon", "Lord Minto", "Lord Hardinge"], a: 1, sub: "History", topic: "Freedom Struggle", diff: 2, exp: "Curzon, 1905 — sparked Swadeshi." },
  { q: "How many members of the MPC are nominated by the Central Government?", o: ["2", "3", "4", "6"], a: 1, sub: "Economy", topic: "Monetary Policy", diff: 2, exp: "3 of 6 members are Government nominees." },
  { q: "The 'CBDR' principle is central to which domain?", o: ["Trade law", "Climate negotiations", "Maritime borders", "Taxation"], a: 1, sub: "Environment", topic: "Climate Treaties", diff: 3, exp: "Common But Differentiated Responsibilities — UNFCCC." },
  { q: "Which writ cannot be issued against a purely private body (in general)?", o: ["Habeas corpus", "Quo-warranto", "Certiorari under Art 32", "All writs apply equally"], a: 2, sub: "Polity", topic: "Writs", diff: 3, exp: "Art 32 writs target State/Fundamental Rights; 226 is wider." },
  { q: "In the current LAF corridor, the effective floor is the:", o: ["Repo rate", "Standing Deposit Facility", "MSF", "Bank rate"], a: 1, sub: "Economy", topic: "Monetary Policy", diff: 3, exp: "SDF (post-2022) forms the corridor floor." }
];
const CSAT = [
  { q: "If a train travels 240 km at 60 km/h and returns at 40 km/h, the average speed is:", o: ["50 km/h", "48 km/h", "52 km/h", "46 km/h"], a: 1, sub: "CSAT", topic: "Aptitude", diff: 2, exp: "2xy/(x+y) = 48 km/h." },
  { q: "Passage-based: 'Democracy is not a state of the mind.' The author implies:", o: ["Voting is unnecessary", "Democracy needs active civic practice", "Minds are irrelevant", "None"], a: 1, sub: "CSAT", topic: "Comprehension", diff: 2, exp: "Comprehension asks inference, not restatement." }
];

/* ---------- modes ---------- */
const MODES = {
  quick10: { name: "Quick 10-Question Test", fid: "#33", time: 8 * 60, qs: () => BANK, rules: ["10 questions · 8 minutes", "Negative marking simulated", "Autosave every answer (#32)"] },
  adaptive: { name: "Adaptive Difficulty Test", fid: "#41", time: 12 * 60, qs: () => BANK, adaptive: true, rules: ["Difficulty follows your speed (#41)", "Answer under 12s → harder · over 25s → easier", "12 minutes"] },
  rapid: { name: "Rapid Fire Mode", fid: "#42", perQ: 15, qs: () => BANK.slice(0, 8), rules: ["15 seconds per question (#42)", "No going back — instinct training", "Auto-advances on timeout"] },
  pressure: { name: "Exam Pressure Mode", fid: "#45", time: 10 * 60, qs: () => BANK, pressure: true, rules: ["Tight clock + pressure banners (#45)", "Simulates exam-hall stress", "Negative marking ON"] },
  full: { name: "Full Exam Simulator", fid: "#46", time: 20 * 60, qs: () => BANK, rules: ["Full-length discipline (#46)", "Palette navigation · mark for review", "Stamina and time-boxing practice"] },
  prelims: { name: "Prelims Practice", fid: "#36", time: 12 * 60, qs: () => BANK, rules: ["GS Paper-1 pattern", "Negative marking ⅓ (simulated)"] },
  csat: { name: "CSAT Practice", fid: "#38", time: 10 * 60, qs: () => CSAT.concat(BANK.slice(0, 4)), rules: ["Qualifying paper — comprehension & reasoning", "Demo bank (honest mock)"] },
  pyq: { name: "PYQ Practice", fid: "#39", time: 12 * 60, qs: () => BANK.slice(2), rules: ["Previous-year style frames", "Trend-tagged topics"] },
  subject: { name: "Subject-Wise Test", fid: "#34", time: 12 * 60, qs: s => BANK, rules: ["Filtered by subject (demo bank)"] },
  topic: { name: "Topic-Wise Test", fid: "#35", time: 12 * 60, qs: () => BANK, rules: ["Single-topic drilling"] },
  custom: { name: "AI-Generated Test", fid: "#47", time: 12 * 60, qs: () => null, rules: ["Generated by the AI engine (#47/#48)"] }
};
const params = new URLSearchParams(location.search);
const MODE = params.get("mode") || "adaptive";
const cfg = MODES[MODE] || MODES.adaptive;

/* ---------- state ---------- */
let QS = [], answers = {}, marked = [], idx = 0, left = cfg.time || 0;
let started = false, ended = false, qEnteredAt = 0, perQTime = [], rapidLeft = 0, tickTimer = null;

/* ---------- custom quiz bridge ---------- */
if (MODE === "custom") {
  try {
    const gen = JSON.parse(localStorage.getItem("uza_generated_test"));
    if (gen && gen.qs) QS = gen.qs.map((g, i) => ({ q: g.q, o: g.o, a: g.a, sub: gen.topic, topic: gen.topic, diff: 2, exp: "AI-generated (demo)." }));
  } catch {}
} else QS = cfg.qs(params.get("s") || params.get("t") || "");

/* ---------- start screen ---------- */
$("#st-title").textContent = cfg.name;
$("#st-fid"] // placeholder removed below
$("#st-desc").innerHTML = `Mode ${cfg.fid} · ${QS.length} questions${cfg.time ? " · " + Math.round(cfg.time / 60) + " minutes" : cfg.perQ ? " · " + cfg.perQ + "s per question" : ""}.`;
$("#st-rules").innerHTML = cfg.rules.map(r => `<li>${esc(r)}</li>`).join("");
if (!QS.length) {
  $("#start-btn").disabled = true;
  $("#st-err").hidden = false;
  $("#st-err").textContent = "No generated test found. Generate one in the Test Center first.";
  $("#st-rules").insertAdjacentHTML("beforebegin", `<a class="btn btn-ghost btn-sm" href="mock-tests.html">← Go generate a test</a>`);
}

/* ---------- autosave/restore ---------- */
function saveSession() {
  localStorage.setItem(LS_SESSION, JSON.stringify({ MODE, answers, marked, idx, left, startedAt: Date.now() }));
  $("#autosave-note").textContent = "Autosaved ✓ " + new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}
function tryRestore() {
  try {
    const s = JSON.parse(localStorage.getItem(LS_SESSION));
    if (s && s.MODE === MODE && Object.keys(s.answers).length) {
      answers = s.answers; marked = s.marked || []; idx = s.idx || 0; left = s.left || left;
      toast("Session restored from autosave ✓");
      return true;
    }
  } catch {}
  return false;
}

/* ---------- rendering ---------- */
function renderPalette() {
  $("#pal-grid").innerHTML = QS.map((_, i) => {
    const cls = [i === idx ? "cur" : "", answers[i] != null ? "ans" : "", marked.includes(i) ? "mark" : ""].join(" ").trim();
    return `<button type="button" data-p="${i}" class="${cls}" aria-label="Go to question ${i + 1}${answers[i] != null ? ", answered" : ""}${marked.includes(i) ? ", marked" : ""}">${i + 1}</button>`;
  }).join("");
  $("#pal-grid").querySelectorAll("[data-p]").forEach(b => b.addEventListener("click", () => goto(+b.dataset.p)));
}
function renderQuestion() {
  const q = QS[idx];
  $("#q-num").textContent = `Question ${idx + 1} of ${QS.length}`;
  $("#q-meta").textContent = `${q.sub} · ${q.topic} · difficulty ${"★".repeat(q.diff || 2)}`;
  $("#q-text").textContent = q.q;
  $("#q-opts").innerHTML = q.o.map((o, i) => `<label><input type="radio" name="opt" value="${i}" ${answers[idx] === i ? "checked" : ""}><span>${String.fromCharCode(65 + i)}. ${esc(o)}</span></label>`).join("");
  $("#q-opts").querySelectorAll("input").forEach(r => r.addEventListener("change", () => {
    answers[idx] = +r.value; saveSession(); renderPalette();
  }));
  $("#mark-btn").setAttribute("aria-pressed", String(marked.includes(idx)));
  $("#prev-btn").disabled = idx === 0;
  $("#next-btn").disabled = idx === QS.length - 1;
  renderPalette();
  qEnteredAt = Date.now();
  if (cfg.perQ) startRapid();
}
function goto(i) {
  recordTime();
  idx = Math.max(0, Math.min(QS.length - 1, i));
  renderQuestion(); saveSession();
}
function recordTime() { perQTime[idx] = (perQTime[idx] || 0) + (Date.now() - qEnteredAt) / 1000; }

/* ---------- timers ---------- */
function fmt(s) { return String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(Math.max(0, s) % 60).padStart(2, "0"); }
function startClock() {
  if (cfg.perQ) return;
  tickTimer = setInterval(() => {
    left--; $("#ex-timer").textContent = fmt(left);
    $(".timer-box").classList.toggle("low", left <= 60);
    if (left % 30 === 0) saveSession();
    if (left <= 0) { clearInterval(tickTimer); submit(true); }
  }, 1000);
  $("#ex-timer").textContent = fmt(left);
}
function startRapid() {
  rapidLeft = cfg.perQ;
  clearInterval(rapid._t);
  $("#rapid-bar").hidden = false;
  $("#rapid-fill").style.width = "100%";
  rapid._t = setInterval(() => {
    rapidLeft--;
    $("#rapid-fill").style.width = Math.max(0, rapidLeft / cfg.perQ * 100) + "%";
    if (rapidLeft <= 0) {
      clearInterval(rapid._t);
      if (idx < QS.length - 1) goto(idx + 1); else submit(true);
    }
  }, 1000);
}

/* ---------- adaptive (#41) ---------- */
function adaptiveHint() {
  if (!cfg.adaptive) return;
  const last = perQTime[idx];
  const lvl = last != null ? (last < 12 ? "rising ↑ (harder next)" : last > 25 ? "supporting ↓ (easier next)" : "steady →") : "calibrating…";
  $("#ex-adaptive").textContent = `Adaptive engine: difficulty ${lvl} (#41)`;
}

/* ---------- start / submit ---------- */
$("#start-btn").addEventListener("click", () => {
  const restored = tryRestore();
  started = true;
  $("#start-card").hidden = true;
  $("#exam").hidden = false;
  $("#ex-mode").textContent = cfg.name;
  $("#ex-fid").textContent = cfg.fid;
  if (cfg.pressure) $("#pressure-banner").hidden = false;
  renderQuestion();
  startClock();
  if (!restored) toast("Test started — autosave is ON. Good luck!");
});
$("#prev-btn").addEventListener("click", () => goto(idx - 1));
$("#next-btn").addEventListener("click", () => goto(idx + 1));
$("#mark-btn").addEventListener("click", () => {
  if (marked.includes(idx)) marked = marked.filter(x => x !== idx); else marked.push(idx);
  saveSession(); renderPalette();
  $("#mark-btn").setAttribute("aria-pressed", String(marked.includes(idx)));
});
$("#clear-btn").addEventListener("click", () => { delete answers[idx]; saveSession(); renderQuestion(); });

$("#submit-btn").addEventListener("click", () => {
  recordTime();
  const un = QS.length - Object.keys(answers).length;
  if (un > 0 && !confirm(`You have ${un} unanswered question(s). Submit anyway?`)) return;
  submit(false);
});

function submit(auto) {
  if (ended) return; ended = true;
  clearInterval(tickTimer); clearInterval(rapid._t);
  const total = QS.length;
  let correct = 0, wrong = 0;
  const perQ = QS.map((q, i) => {
    const chosen = answers[i] ?? null;
    const ok = chosen === q.a;
    if (chosen == null) {} else if (ok) correct++; else wrong++;
    const t = Math.round(perQTime[i] || 0);
    return { i, chosen, ok, time: t, guessed: chosen != null && t < 8 && !ok };
  });
  const attempted = correct + wrong;
  const bySub = {};
  QS.forEach((q, i) => {
    bySub[q.sub] = bySub[q.sub] || { total: 0, correct: 0 };
    bySub[q.sub].total++;
    if (perQ[i].ok) bySub[q.sub].correct++;
  });
  const allotted = cfg.time || (cfg.perQ ? cfg.perQ * total : 0);
  const result = {
    mode: cfg.name, fid: cfg.fid, at: new Date().toISOString(),
    total, correct, wrong, skipped: total - attempted,
    acc: attempted ? Math.round(correct / attempted * 100) : 0,
    timeUsed: allotted ? Math.min(allotted, allotted - (left || 0)) : total * 20,
    allotted, perQ, bySub, guessed: perQ.filter(p => p.guessed).length
  };
  localStorage.setItem("uza_last_result", JSON.stringify(result));
  let hist = []; try { hist = JSON.parse(localStorage.getItem("uza_test_history")) || []; } catch {}
  hist.unshift({ mode: cfg.name, acc: result.acc, correct, total, at: result.at });
  localStorage.setItem("uza_test_history", JSON.stringify(hist.slice(0, 20)));
  localStorage.removeItem(LS_SESSION);
  toast(auto ? "Time up — auto-submitted." : "Submitted ✓ Generating result…");
  setTimeout(() => { location.href = "test-result.html"; }, 900);
}

/* ---------- keyboard ---------- */
document.addEventListener("keydown", e => {
  if (!started || ended) return;
  if (e.target.matches("input,textarea,select")) return;
  if (["1", "2", "3", "4"].includes(e.key)) {
    const r = $("#q-opts").querySelectorAll("input")[+e.key - 1];
    if (r) { r.checked = true; r.dispatchEvent(new Event("change")); }
  }
  if (e.key === "ArrowRight") goto(idx + 1);
  if (e.key === "ArrowLeft") goto(idx - 1);
  if (e.key.toLowerCase() === "m") $("#mark-btn").click();
});

document.addEventListener("DOMContentLoaded", () => { if (cfg.adaptive) adaptiveHint(); setInterval(adaptiveHint, 4000); });
