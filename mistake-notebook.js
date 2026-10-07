"use strict";
/* UPSC ZONE AI — mistake-notebook.js
   Features: #64 #65 #66 #67 #68 #69 #70 #71 #72
   Design requirement: Article 32 vs 226 Why-Wrong example included.
   MistakeAPI isolated & API-ready. */
const LS = "uza_mistakes_v1";
const $ = s => document.querySelector(s);
const wait = ms => new Promise(r => setTimeout(r, ms));
const esc = s => { const d = document.createElement("div"); d.textContent = s; return d.innerHTML; };
let S = {}; try { S = JSON.parse(localStorage.getItem(LS)) || {}; } catch {}
S.fixed = S.fixed || []; S.queued = S.queued || [];
const save = () => localStorage.setItem(LS, JSON.stringify(S));
function toast(m) { const t = $("#toast"); t.textContent = m; t.hidden = false; clearTimeout(toast._t); toast._t = setTimeout(() => t.hidden = true, 2800); }

const MISTAKES = [
  { id: "m1", cat: "Conceptual", cls: "conc", q: "Which court's writ jurisdiction extends to 'any other purpose' beyond Fundamental Rights?", you: "Supreme Court (Art. 32)", right: "High Courts (Art. 226)", sub: "Polity", concept: "Writ jurisdiction scope", times: 3, day: "Today",
    why: "You conflated SUPREMACY with SCOPE. Art 32 is superior (cannot be refused, itself a Fundamental Right), but Art 226 is WIDER — High Courts can issue writs for fundamental rights AND any other legal purpose. The exam weaponizes this exact confusion.",
    fix: "Memorise the pair as: 32 = narrow but guaranteed · 226 = wide but discretionary. Landmark: L. Chandra Kumar (1997) — both are basic structure." },
  { id: "m2", cat: "Memory lapse", cls: "mem", q: "The Standing Deposit Facility (SDF) acts as which part of the LAF corridor?", you: "Ceiling", right: "Floor", sub: "Economy", concept: "Monetary corridor", times: 2, day: "Today",
    why: "Recall failure, not logic: post-2022 the corridor floor shifted from reverse repo to SDF. Your memory strength for Economy tools is 61% — below the 70% safety line.",
    fix: "Add corridor diagram to flashcards; drill floor=SDF / ceiling=MSF with 5 spaced cards." },
  { id: "m3", cat: "Misread", cls: "mis", q: "Consider the statements… which is INCORRECT? (El Niño and monsoon)", you: "Option B (a correct statement)", right: "Option D", sub: "Geography", concept: "ENSO effects", times: 1, day: "Yesterday",
    why: "You answered for the CORRECT statement — the stem asked INCORRECT. Misread rate is 14% of your errors; slow down on first-line reading.",
    fix: "Underline the command word (INCORRECT/NOT) before reading options." },
  { id: "m4", cat: "Elimination error", cls: "elim", q: "MPC decision on rates requires:", you: "Unanimity", right: "Simple majority; Governor holds casting vote", sub: "Economy", concept: "MPC procedure", times: 2, day: "Yesterday",
    why: "You kept two options and picked the more 'official-sounding' one. Elimination collapsed at the final step — a pattern on institutional-procedure questions.",
    fix: "Rule: when 2 options remain, prefer the one consistent with a known anchor fact (here: 'majority' from Art 189-style bodies)." },
  { id: "m5", cat: "Overthinking", cls: "conc", q: "Partition of Bengal (1905) — which Governor-General?", you: "Lord Minto (changed answer from Curzon)", right: "Lord Curzon", sub: "History", concept: "Viceroys timeline", times: 1, day: "3 days ago",
    why: "Your first instinct was correct; you switched in review. Overthinking cost you 2 marks this week — answer-changes after 90 seconds have a 70% failure rate in your history.",
    fix: "Review rule: change an answer only with new evidence, never with doubt." }
];
const CATS = { "": "All categories", Conceptual: "Conceptual", "Memory lapse": "Memory lapse", Misread: "Misread", "Elimination error": "Elimination error", Overthinking: "Overthinking" };

const MistakeAPI = {
  async errorReport() {                    // POST /api/mistakes/report
    await wait(1000);
    return {
      summary: "5 open mistakes · 2 repeated patterns · dominant category: Conceptual (40%).",
      lines: [
        "Pattern 1 — writ-jurisdiction confusion (Polity): appeared 3×. Single highest-value fix.",
        "Pattern 2 — institutional-procedure elimination fails on final step (Economy): 2×.",
        "Misread rate 14%: command-word (INCORRECT/NOT) is being skipped.",
        "Answer-changing rule broken once this week (History) — enforce the 90-second evidence rule.",
        "Prescribed drill: 10 writ-jurisdiction MCQs + 5 corridor cards + 1 misread-aware sectional."
      ]
    };
  }
};

/* ---------- repeated detection banner (#68) ---------- */
(function () {
  const reps = MISTAKES.filter(m => m.times >= 2);
  $("#repeat-banner").innerHTML = reps.length
    ? `🔁 <strong>Repeated Mistake Detection (#68):</strong> ${reps.length} pattern(s) repeated — ${reps.map(r => esc(r.concept)).join(", ")}. Repeated mistakes cost ~6 marks/test on average.`
    : "✓ No repeated mistakes detected.";
})();

/* ---------- list (#64 #67 + #65 expand) ---------- */
function render(filter) {
  const list = MISTAKES.filter(m => !filter || m.cat === filter);
  $("#mn-count").textContent = `${list.length} of ${MISTAKES.length} shown · ${S.fixed.length} fixed this week (#64).`;
  if (!list.length) { $("#mn-list").innerHTML = `<div class="empty">No mistakes in this category — switch filters or enjoy the silence.</div>`; return; }
  $("#mn-list").innerHTML = list.map(m => `
    <article class="m-card ${m.times >= 2 ? "repeated" : ""}" data-id="${m.id}">
      <div class="m-top">
        <span class="cat-chip ${m.cls}">${m.cat} <span style="opacity:.7">#67</span></span>
        <span class="sub-tag" style="font-size:.68rem;font-weight:700;background:#e5eef9;color:#2c5f9e;padding:3px 9px;border-radius:6px">${m.sub}</span>
        ${m.times >= 2 ? `<span class="rep-badge">REPEATED ×${m.times}</span>` : ""}
        <span class="muted small" style="margin-left:auto">${m.day}</span>
      </div>
      <p class="m-q">${esc(m.q)}</p>
      <p class="m-ans">Your answer: <b class="you">${esc(m.you)}</b> · Correct: <b class="right">${esc(m.right)}</b></p>
      <button class="m-toggle" data-t="${m.id}" aria-expanded="false" type="button">🧠 Why was I wrong? (AI) <span class="fid">#65</span></button>
      <div class="why-box" id="why-${m.id}" hidden>
        <strong>AI Why-Wrong:</strong> ${esc(m.why)}<br>
        <strong style="color:var(--green)">Fix:</strong> ${esc(m.fix)}
      </div>
      <div class="m-actions">
        <button class="mini-btn" data-prac="${m.id}" type="button">↻ Practice again</button>
        <button class="mini-btn ${S.queued.includes(m.id) ? "done" : ""}" data-queue="${m.id}" type="button">${S.queued.includes(m.id) ? "In revision queue ✓" : "📅 Add to revision"}</button>
        <a class="mini-btn" href="topic-explorer.html">Explore concept</a>
      </div>
    </article>`).join("");

  $("#mn-list").querySelectorAll("[data-t]").forEach(b => b.addEventListener("click", () => {
    const box = $("#why-" + b.dataset.t);
    box.hidden = !box.hidden;
    b.setAttribute("aria-expanded", String(!box.hidden));
  }));
  $("#mn-list").querySelectorAll("[data-prac]").forEach(b => b.addEventListener("click", () => {
    const m = MISTAKES.find(x => x.id === b.dataset.prac);
    localStorage.setItem("uza_generated_test", JSON.stringify({ topic: m.concept, diff: "Mistake drill", qs: [
      { q: m.q + " (practice-again)", o: [m.right, m.you, "None of the above", "Cannot be determined"], a: 0 }
    ] }));
    location.href = "test-interface.html?mode=custom";
  }));
  $("#mn-list").querySelectorAll("[data-queue]").forEach(b => b.addEventListener("click", () => {
    if (!S.queued.includes(b.dataset.queue)) {
      S.queued.push(b.dataset.queue); save(); render($("#cat-filter").value);
      toast("Queued — spaced schedule updated (#70) ✓");
    }
  }));
}
$("#cat-filter").addEventListener("change", e => render(e.target.value));

/* ---------- weak concepts (#69) ---------- */
(function () {
  const agg = {};
  MISTAKES.forEach(m => { agg[m.concept] = (agg[m.concept] || 0) + m.times; });
  $("#wc-out").innerHTML = Object.entries(agg).sort((a, b) => b[1] - a[1])
    .map(([c, n]) => `<div class="wc-row"><span>${esc(c)}</span><span class="wc-n">×${n}</span></div>`).join("");
})();

/* ---------- revision schedule (#70) ---------- */
function renderSchedule() {
  if (!S.queued.length) { $("#rs-out").innerHTML = `<div class="empty">Nothing queued — add mistakes from the list and the AI schedules them (1→3→7 days).</div>`; return; }
  $("#rs-out").innerHTML = S.queued.map((id, i) => {
    const m = MISTAKES.find(x => x.id === id);
    const due = new Date(Date.now() + [1, 3, 7][i % 3] * 864e5).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    return `<div class="rs-row"><span class="rs-due">${due}</span><span>${m ? esc(m.concept) : id}</span>
      <button class="mini-btn" data-unq="${id}" style="margin-left:auto" type="button">✕</button></div>`;
  }).join("");
  $("#rs-out").querySelectorAll("[data-unq]").forEach(b => b.addEventListener("click", () => {
    S.queued = S.queued.filter(x => x !== b.dataset.unq); save(); renderSchedule(); render($("#cat-filter").value);
  }));
}

/* ---------- mistake-based test (#66) ---------- */
$("#mtest-btn").addEventListener("click", () => {
  const qs = MISTAKES.map(m => ({ q: `${m.q} (from your mistakes)`, o: [m.right, m.you, "None of the above", "Cannot be determined"], a: 0 }));
  localStorage.setItem("uza_generated_test", JSON.stringify({ topic: "Mistake-Based Test", diff: "Targeted", qs }));
  location.href = "test-interface.html?mode=custom";
});

/* ---------- error report (#72) ---------- */
$("#report-btn").addEventListener("click", async () => {
  const btn = $("#report-btn"); btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Compiling…';
  $("#er-out").innerHTML = `<div class="empty">Reading all mistakes, categories and repeats… (local demo)</div>`;
  const r = await MistakeAPI.errorReport();
  $("#er-out").innerHTML = `<div class="report-box"><strong>${r.summary}</strong>
    <ul>${r.lines.map(l => `<li>${esc(l)}</li>`).join("")}</ul>
    <p class="small muted" style="margin-top:8px">Generated ${new Date().toLocaleString("en-IN")} · saved locally.</p></div>`;
  btn.disabled = false; btn.innerHTML = "📄 Error Report <span class=\"fid\">#72</span>";
  S.lastReport = Date.now(); save(); toast("Personalized Error Report ready ✓");
});

/* ---------- history timeline (#71) ---------- */
(function () {
  const byDay = {};
  MISTAKES.forEach(m => { (byDay[m.day] = byDay[m.day] || []).push(m); });
  $("#hist-out").innerHTML = Object.entries(byDay).map(([day, ms]) =>
    `<p class="hist-day">${day}</p>` + ms.map(m => `<div class="hist-item"><strong>${m.sub}</strong> · ${esc(m.concept)} — ${esc(m.cat)}${m.times >= 2 ? " · repeated" : ""}</div>`).join("")).join("");
})();

document.addEventListener("DOMContentLoaded", () => { render(""); renderSchedule(); });
