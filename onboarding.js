"use strict";
/* UPSC ZONE AI — onboarding.js
   Features: #3 #11 #12 #13 #14 #23 #205 #206 #207 #208 #210 #211 #212 #216
   OnboardAPI is isolated & API-ready (swap generateProfile for POST /api/onboard). */
const LS_KEY = "uza_onboarding_v1";
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const wait = ms => new Promise(r => setTimeout(r, ms));
const esc = s => { const d = document.createElement("div"); d.textContent = s; return d.innerHTML; };

const EXAM_DATES = { "2027": "2027-05-30", "2028": "2028-05-28", "2029": "2029-05-27" }; // indicative
const NCERTS = [
  { id: "n1", t: "Class 11 — Indian Constitution at Work", tag: "Polity" },
  { id: "n2", t: "Class 10 — Democratic Politics II", tag: "Polity" },
  { id: "n3", t: "Class 11 — Fundamentals of Physical Geography", tag: "Geography" },
  { id: "n4", t: "Class 12 — Introductory Macroeconomics", tag: "Economy" },
  { id: "n5", t: "Class 12 — India Since Independence", tag: "History" },
  { id: "n6", t: "Class 12 — Themes in World History", tag: "World History" }
];
const DIAG = [
  ["polity", "Polity"], ["economy", "Economy"], ["history", "Modern History"],
  ["geography", "Geography"], ["environment", "Environment"], ["scitech", "Science & Tech"]
];

/* ---------- API-ready layer ---------- */
const OnboardAPI = {
  /** POST /api/onboard/profile — replace with real AI call */
  async generateProfile(a) {
    await wait(1200);
    const sorted = DIAG.map(([k, label]) => ({ k, label, v: Number(a.diag[k]) })).sort((x, y) => x.v - y.v);
    const weak = sorted.slice(0, 2);
    const months = { "2027": 8, "2028": 19, "2029": 31 }[a.attempt];
    const per = Math.max(1, Math.round(months / 4));
    const plan = [
      { name: `Foundation — NCERTs + syllabus mapping (${a.ncertDone.length}/${NCERTS.length} NCERTs already done)`, len: `${per} mo`, load: `${a.hours} h/day` },
      { name: `Concept Building + ${a.optional === "Undecided" ? "optional finalization" : a.optional + " core"} + first notes pass`, len: `${per} mo`, load: `${a.hours} h/day` },
      { name: "PYQ Intelligence + sectional mocks + mistake loops", len: `${per} mo`, load: `${a.hours} h/day` },
      { name: "Full mocks + Spaced Revision + Mains answer sprints", len: `${Math.max(per, 1)} mo`, load: "simulator mode" }
    ];
    const whatNow = {
      action: `${a.hours >= 5 ? "Deep block" : "Focused block"}: ${weak[0].label} fundamentals — 45 min concept reading + 20 adaptive MCQs (${a.diff === "expert" ? "Expert" : a.diff === "balanced" ? "Balanced" : "UPSC Standard+"} difficulty), then 15 min NCERT recap.`,
      reasons: [
        `Your self-diagnostic flagged ${weak[0].label} (${weak[0].v}/10) as weakest — #13.`,
        `${a.attempt} attempt window: Foundation phase must start this week — #216.`,
        a.tracks.includes("mains") ? "Mains track is ON: one 150-word answer joins your plan from week 3 — #206." : "Add Mains later if you want answer-writing in the plan — #206."
      ]
    };
    const recos = [
      `Finish ${NCERTS.length - a.ncertDone.length} queued NCERT(s) in the Hub before Concept Building — #23.`,
      a.csat === "not" ? "CSAT not started: 30 minutes every Sunday from month 2 (qualifying but fatal) — #211." : `CSAT status "${a.csat}": a diagnostic CSAT paper in week 2 will confirm — #211.`,
      a.ethics === "not" ? "Ethics (GS-4) untouched: 1 case study per week starts in phase 2 — #212." : `Ethics at "${a.ethics}" stage: case-study generator unlocked in Mains Center — #212.`,
      a.optional === "Undecided" ? "Pick your optional within 8 weeks — the Roadmap will prompt you — #210." : `${a.optional} tracking ON at ${a.optProg}% syllabus covered — #210.`
    ];
    return { weak, plan, whatNow, recos };
  }
};

/* ---------- state ---------- */
let step = 1; const TOTAL = 6;
let saved = {}; try { saved = JSON.parse(localStorage.getItem(LS_KEY)) || {}; } catch {}

/* ---------- build dynamic lists ---------- */
$("#ncert-list").innerHTML = NCERTS.map(n =>
  `<li><input type="checkbox" id="${n.id}" data-ncert="${n.id}"><label for="${n.id}">${esc(n.t)}</label><span class="ncert-tag">${n.tag}</span></li>`).join("");
$("#diag-list").innerHTML = DIAG.map(([k, label]) =>
  `<div class="slider-row"><label for="diag-${k}">${label}</label><input type="range" id="diag-${k}" min="0" max="10" value="5" data-diag="${k}"><output id="out-${k}">5</output></div>`).join("");

/* ---------- helpers ---------- */
function setStep(n) {
  step = n;
  $$(".ob-step").forEach(p => { p.hidden = Number(p.dataset.step) !== n; });
  $("#btn-back").disabled = n === 1;
  $("#btn-next").innerHTML = n === TOTAL ? "✨ Generate my profile" : "Continue →";
  $("#ob-bar").style.width = (n / TOTAL * 100) + "%";
  $("#ob-step-label").textContent = `Step ${n} of ${TOTAL}`;
  const h = document.querySelector(`.ob-step[data-step="${n}"] .step-h`); if (h) h.focus();
}
function countdownText(attempt) {
  const d = Math.max(0, Math.ceil((new Date(EXAM_DATES[attempt] + "T09:30:00+05:30") - Date.now()) / 864e5));
  return { days: d, txt: `⏳ Prelims ${attempt} (indicative): ${d} days away — the plan works backwards from here.` };
}
function collectAnswers() {
  const diag = {}; DIAG.forEach(([k]) => { diag[k] = Number($("#diag-" + k).value); });
  return {
    name: $("#ob-name").value.trim(), attempt: $("#ob-attempt").value, hours: Number($("#ob-hours").value),
    tracks: [["prelims", "#tr-prelims"], ["mains", "#tr-mains"], ["essay", "#tr-essay"], ["interview", "#tr-interview"]]
      .filter(([, id]) => $(id).checked).map(([k]) => k),
    optional: $("#ob-optional").value, optProg: Number($("#ob-opt-prog").value),
    csat: document.querySelector('input[name="csat"]:checked').value,
    ethics: document.querySelector('input[name="ethics"]:checked').value,
    ncertDone: $$("[data-ncert]").filter(c => c.checked).map(c => c.dataset.ncert),
    diag, diff: $("#ob-diff").value
  };
}
function persistProgress() { localStorage.setItem(LS_KEY, JSON.stringify({ ...collectAnswers(), step, generated: saved.generated || false, result: saved.result || null, at: Date.now() })); }

/* ---------- live widgets ---------- */
function refreshCountdown() { $("#ob-count").textContent = countdownText($("#ob-attempt").value).txt; }
$("#ob-attempt").addEventListener("change", refreshCountdown);
$("#ob-hours").addEventListener("input", e => { $("#ob-hours-out").textContent = e.target.value; });
$("#ob-opt-prog").addEventListener("input", e => { $("#ob-opt-out").textContent = e.target.value; });
$$("[data-diag]").forEach(sl => sl.addEventListener("input", () => {
  $("#out-" + sl.dataset.diag).textContent = sl.value;
  refreshWeakPreview(); persistProgress();
}));
function refreshWeakPreview() {
  const sorted = DIAG.map(([k, label]) => ({ label, v: Number($("#diag-" + k).value) })).sort((a, b) => a.v - b.v);
  $("#weak-preview").textContent = `First weak areas detected: ${sorted[0].label} (${sorted[0].v}/10) and ${sorted[1].label} (${sorted[1].v}/10) — #13`;
}
$$(".track input").forEach(c => c.addEventListener("change", () => { c.closest(".track").classList.toggle("checked", c.checked); $("#tracks-err").hidden = true; }));

/* ---------- validation + navigation ---------- */
function validateStep(n) {
  if (n === 2) {
    const any = $$(".track input").some(c => c.checked);
    if (!any) { const e = $("#tracks-err"); e.textContent = "Select at least one stage — Prelims is the minimum."; e.hidden = false; return false; }
  }
  return true;
}
$("#btn-back").addEventListener("click", () => { if (step > 1) setStep(step - 1); });
$("#btn-next").addEventListener("click", async () => {
  if (step < TOTAL) { if (!validateStep(step)) return; setStep(step + 1); persistProgress(); return; }
  await generate();
});

/* ---------- generation ---------- */
async function generate() {
  const btn = $("#btn-next");
  btn.disabled = true; btn.innerHTML = '<span class="spinner"></span> AI analysing… (local demo model)';
  try {
    const answers = collectAnswers();
    const result = await OnboardAPI.generateProfile(answers);
    saved = { ...answers, generated: true, result, step: TOTAL, at: Date.now() };
    localStorage.setItem(LS_KEY, JSON.stringify(saved));
    renderResults(saved);
  } catch {
    const b = $("#banner"); b.hidden = false; b.className = "banner error";
    b.innerHTML = "<strong>Generation failed.</strong> Please try again.";
  } finally { btn.disabled = false; btn.innerHTML = "✨ Generate my profile"; }
}

function renderResults(data) {
  $("#wizard").hidden = true;
  const r = data.result, c = countdownText(data.attempt);
  $("#res-meta").textContent = `Generated ${new Date(data.at).toLocaleString("en-IN")} · ${data.attempt} attempt · ${data.hours} h/day · adaptive: ${data.diff} · honest local demo`;
  $("#res-days").textContent = c.days;
  $("#res-days-note").textContent = `days to Prelims ${data.attempt} (indicative date). ${data.tracks.length} track(s) active: ${data.tracks.join(", ")}.`;
  $("#res-whownow").innerHTML = `<div class="result-card"><strong>Do this now:</strong> ${esc(r.whatNow.action)}<ul>${r.whatNow.reasons.map(x => `<li>${esc(x)}</li>`).join("")}</ul></div>`;
  $("#res-plan").innerHTML = r.plan.map(p => `<li><strong>${esc(p.name)}</strong> — ${esc(p.len)} · ${esc(p.load)}</li>`).join("");
  $("#res-recos").innerHTML = r.recos.map(x => `<li>${esc(x)}</li>`).join("");
  $("#results").hidden = false;
  $("#results").scrollIntoView({ behavior: "smooth", block: "start" });
}

$("#btn-edit").addEventListener("click", () => {
  $("#results").hidden = true; $("#wizard").hidden = false;
  saved.generated = false; localStorage.setItem(LS_KEY, JSON.stringify(saved));
  setStep(1); window.scrollTo({ top: 0, behavior: "smooth" });
});

/* ---------- restore ---------- */
function restore() {
  if (saved.name) $("#ob-name").value = saved.name;
  if (saved.attempt) $("#ob-attempt").value = saved.attempt;
  if (saved.hours) { $("#ob-hours").value = saved.hours; $("#ob-hours-out").textContent = saved.hours; }
  if (saved.optional) $("#ob-optional").value = saved.optional;
  if (typeof saved.optProg === "number") { $("#ob-opt-prog").value = saved.optProg; $("#ob-opt-out").textContent = saved.optProg; }
  if (saved.csat) { const r = document.querySelector(`input[name="csat"][value="${saved.csat}"]`); if (r) r.checked = true; }
  if (saved.ethics) { const r = document.querySelector(`input[name="ethics"][value="${saved.ethics}"]`); if (r) r.checked = true; }
  if (saved.diff) $("#ob-diff").value = saved.diff;
  (saved.tracks || []).forEach(t => { const c = $("#tr-" + t); if (c) { c.checked = true; c.closest(".track").classList.add("checked"); } });
  (saved.ncertDone || []).forEach(id => { const c = document.querySelector(`[data-ncert="${id}"]`); if (c) c.checked = true; });
  if (saved.diag) DIAG.forEach(([k]) => { const el = $("#diag-" + k); if (saved.diag[k] != null && el) { el.value = saved.diag[k]; $("#out-" + k).textContent = saved.diag[k]; } });
  refreshCountdown(); refreshWeakPreview();
}

document.addEventListener("DOMContentLoaded", () => {
  restore();
  if (saved.generated && saved.result) { renderResults(saved); const b = $("#banner"); b.hidden = false; b.className = "banner success"; b.textContent = "Onboarding already completed — here is your saved profile. Edit anytime."; }
  else setStep(Math.min(saved.step || 1, TOTAL - 0) === TOTAL ? TOTAL - 1 : (saved.step || 1));
  setInterval(refreshCountdown, 60e3);
});
