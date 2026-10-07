"use strict";
/* UPSC ZONE AI — mains.js
   Features: #96 #106 #107 #108 #109 #213 · MainsAPI isolated & API-ready. */
const LS = "uza_mains_v1";
const $ = s => document.querySelector(s);
const wait = ms => new Promise(r => setTimeout(r, ms));
const esc = s => { const d = document.createElement("div"); d.textContent = s; return d.innerHTML; };
let S = {}; try { S = JSON.parse(localStorage.getItem(LS)) || {}; } catch {}
const save = () => localStorage.setItem(LS, JSON.stringify(S));
function toast(m) { const t = $("#toast"); t.textContent = m; t.hidden = false; clearTimeout(toast._t); toast._t = setTimeout(() => t.hidden = true, 3000); }

const QUESTIONS = [
  { paper: "GS-2", words: 150, q: "Discuss the significance of Article 32 in light of the statement that it is the 'heart and soul' of the Constitution." },
  { paper: "GS-2", words: 250, q: "'Simultaneous elections strengthen efficiency but test federalism.' Critically analyse with reference to recent committee recommendations." },
  { paper: "GS-1", words: 150, q: "Explain how the variability of the Indian monsoon shapes cropping patterns in peninsular India." },
  { paper: "GS-3", words: 250, q: "Assess the RBI's inflation-targeting framework in an economy prone to supply-side shocks." },
  { paper: "GS-3", words: 150, q: "Discuss the strategic significance of India's semiconductor design-led manufacturing push." },
  { paper: "GS-4", words: 250, q: "A district magistrate faces pressure to clear a project that displaces tribal families without complete rehabilitation. What options and ethical tests apply?" },
  { paper: "Essay", words: 1000, q: "'Cooperative federalism is not a gift of law but a habit of trust.' — Essay." }
];
const ESSAYS = [
  { cat: "Philosophical", t: "The empty vessel makes the loudest sound" },
  { cat: "Social", t: "Women's work is never done" },
  { cat: "Economic", t: "Growth without jobs, jobs without growth" },
  { cat: "International", t: "In a connected world, isolation is not sovereignty" },
  { cat: "Technology", t: "Artificial intelligence: tool, partner or master?" },
  { cat: "Environment", t: "The river remembers what the city forgets" }
];
const MainsAPI = {
  async caseStudy(theme) {              // POST /api/mains/case-study (#106)
    await wait(900);
    const C = {
      "Conflict of interest": { s: "You are the secretary of a state transport department. Your spouse's firm is shortlisted for a bus-fleet tender you oversee. A rival bidder leaks the connection to the press.", st: ["your integrity", "spouse's career", "public exchequer", "media scrutiny"], qs: ["Identify the conflicts of interest.", "What legal/ethical options exist?", "Which option would you choose and why?"] },
      "Corruption vs career": { s: "As a young IAS officer you uncover billing fraud in a flagship scheme. Seniors advise 'adjustment'; the beneficiary list includes genuinely poor families who lose out if funds leak.", st: ["poor beneficiaries", "your career", "seniors", "rule of law"], qs: ["Map the ethical dilemma.", "Evaluate at least three courses of action.", "What does 'courage of conviction' demand here?"] },
      "Disaster & triage ethics": { s: "During flash floods you must allocate the last three rescue boats between a hospital, a school and an old-age home — all calling simultaneously.", st: ["patients", "children", "elderly", "rescue teams"], qs: ["Which ethical frameworks help triage?", "How do you communicate the decision?", "Prepare a 30-second briefing for your team."] },
      "Technology & privacy": { s: "Your city wants facial-recognition CCTV to cut crime. Civil-society groups allege surveillance overreach; police cite rising cyber-fraud.", st: ["citizens' privacy", "police", "vendors", "constitutional rights"], qs: ["Balance security and privacy using proportionality tests.", "Suggest safeguards and oversight.", "Draft a citizen-facing one-line policy statement."] }
    };
    return C[theme];
  },
  async brainstorm(topic) {             // POST /api/mains/brainstorm (#108)
    await wait(950);
    return {
      dims: [
        ["Historical", `Trace how ${topic} evolved — one pre-independence and one post-1991 anchor.`],
        ["Political", `Institutions, federalism angles and governance failures linked to ${topic}.`],
        ["Economic", `Costs, incentives and distributional impact; cite one Economic Survey chapter.`],
        ["Social", `Caste, gender and regional dimensions; one credible data point (NFHS/PLFS).`],
        ["Technological", `How technology accelerates or disrupts ${topic}.`],
        ["Environmental", `Sustainability lens — climate linkages and intergenerational equity.`],
        ["Ethical", `Rights vs duties, justice, and one Gandhian talisman application.`]
      ],
      quotes: ["\"An institution is the lengthened shadow of one man.\" — Emerson", "\"The arc of the moral universe is long, but it bends toward justice.\" — MLK"],
      anecdotes: ["A short human story (one beneficiary/one official) to open the essay.", "A contrasting anecdote for the antithesis paragraph."]
    };
  },
  async evaluate(text) {                // POST /api/mains/essay-eval (#109) — honest heuristic
    await wait(1100);
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    const hasIntro = words > 40;
    const hasConclusion = /(conclusion|to conclude|way forward|in sum|ultimately)/i.test(text);
    const connectors = (text.match(/(however|therefore|moreover|consequently|on the other hand|nevertheless|thus)/gi) || []).length;
    const dims = (text.match(/(economic|social|political|environment|technolog|ethical|historical|cultural)/gi) || []).length;
    const score = Math.min(10, Math.round(
      (Math.min(words / 600, 1) * 2.5) + (hasConclusion ? 2 : 0.5) +
      (Math.min(connectors, 6) / 6 * 2.5) + (Math.min(dims, 5) / 5 * 3)));
    return { words, score, hasIntro, hasConclusion, connectors, dims,
      notes: [
        words >= 500 ? "Length is in the essay zone — good." : "Too short for a full essay — develop at least 5 dimensions.",
        hasConclusion ? "Closing signal detected — examiners reward it." : "No explicit conclusion — end with a forward-looking synthesis.",
        connectors >= 4 ? "Paragraph flow is coherent." : "Add logical connectors; flow is choppy.",
        dims >= 4 ? "Multi-dimensional coverage — strong." : "Widen coverage: add economic/social/environmental lenses."
      ] };
  }
};

/* ---------- question bank (#96 #213) ---------- */
function renderBank() {
  const f = $("#paper-filter").value;
  const list = QUESTIONS.filter(q => !f || q.paper === f);
  $("#qs-count").textContent = `${list.length} question(s) · pick one and write it in the timed workspace.`;
  $("#qs-list").innerHTML = list.length ? list.map(q => `<div class="q-row">
    <span class="paper">${q.paper}</span><p>${esc(q.q)}</p><span class="words">${q.words >= 1000 ? "1000+ words" : q.words + " words"}</span>
    <a class="btn btn-primary btn-sm" href="answer-writing.html?q=${encodeURIComponent(q.q)}&w=${q.words}">Write now →</a></div>`).join("")
    : `<div class="empty">No questions for this paper filter.</div>`;
}
$("#paper-filter").addEventListener("change", renderBank);

/* ---------- ethics cases (#106) ---------- */
$("#cs-gen").addEventListener("click", async () => {
  const out = $("#cs-out"), btn = $("#cs-gen");
  btn.disabled = true; btn.innerHTML = '<span class="spinner"></span> Drafting…';
  out.innerHTML = `<div class="empty">Building case study… (local demo model)</div>`;
  const c = await MainsAPI.caseStudy($("#cs-theme").value);
  out.innerHTML = `<div class="case-box"><strong>Case:</strong> ${esc(c.s)}
    <p class="muted small" style="margin-top:6px"><strong>Stakeholders:</strong> ${c.st.map(esc).join(" · ")}</p>
    <ul>${c.qs.map(q => `<li>${esc(q)}</li>`).join("")}</ul>
    <div class="row" style="margin-top:10px"><a class="btn btn-dark btn-sm" href="answer-writing.html?q=${encodeURIComponent("GS-4 Case Study: " + c.s)}&w=250">Write this case →</a></div></div>`;
  btn.disabled = false; btn.textContent = "Generate case";
  S.lastCase = Date.now(); save(); toast("Case study generated (#106) ✓");
});

/* ---------- essay practice (#107) ---------- */
$("#ep-out").innerHTML = ESSAYS.map(e => `<div class="essay-row"><span><span class="cat">${e.cat}</span>${esc(e.t)}</span>
  <a class="btn btn-ghost btn-sm" href="answer-writing.html?q=${encodeURIComponent("Essay: " + e.t)}&w=1000">Practice →</a></div>`).join("");

/* ---------- brainstorm (#108) ---------- */
$("#bs-gen").addEventListener("click", async () => {
  const topic = $("#bs-topic").value.trim(), err = $("#bs-err"), out = $("#bs-out");
  if (topic.length < 4) { err.hidden = false; err.textContent = "Enter a real essay topic (4+ characters)."; return; }
  err.hidden = true;
  out.innerHTML = `<div class="empty" style="display:flex;gap:9px;justify-content:center;align-items:center"><span class="spinner"></span> Opening dimensions…</div>`;
  const b = await MainsAPI.brainstorm(topic);
  out.innerHTML = `<div class="case-box"><strong>Dimensions</strong><ul>${b.dims.map(([k, v]) => `<li><strong>${k}:</strong> ${esc(v)}</li>`).join("")}</ul>
    <p style="margin-top:9px"><strong>Quotable lines:</strong></p><ul>${b.quotes.map(q => `<li>${esc(q)}</li>`).join("")}</ul>
    <p style="margin-top:9px"><strong>Anecdotes:</strong></p><ul>${b.anecdotes.map(a => `<li>${esc(a)}</li>`).join("")}</ul>
    <div class="row" style="margin-top:10px"><a class="btn btn-dark btn-sm" href="answer-writing.html?q=${encodeURIComponent("Essay: " + topic)}&w=1000">Write this essay →</a></div></div>`;
  toast("Brainstorm map ready (#108) ✓");
});

/* ---------- evaluation (#109) ---------- */
$("#ev-btn").addEventListener("click", async () => {
  const text = $("#ev-text").value.trim(), err = $("#ev-err"), out = $("#ev-out"), btn = $("#ev-btn");
  if (text.split(/\s+/).length < 40) { err.hidden = false; err.textContent = "Paste at least ~40 words for a meaningful evaluation."; return; }
  err.hidden = true;
  btn.disabled = true; btn.innerHTML = '<span class="spinner"></span> Reading…';
  out.innerHTML = `<div class="empty">Evaluating structure, flow and coverage… (honest local heuristic)</div>`;
  const r = await MainsAPI.evaluate(text);
  out.innerHTML = `<div class="eval-box"><span class="marks">${r.score}/10</span> <span class="muted small">· ${r.words} words · ${r.connectors} connectors · ${r.dims} dimensions · ${r.hasConclusion ? "conclusion ✓" : "no conclusion"}</span>
    <ul>${r.notes.map(n => `<li>${esc(n)}</li>`).join("")}</ul>
    <p class="muted small" style="margin-top:8px">Heuristic demo evaluator — the real product uses a trained scoring model.</p></div>`;
  S.evals = (S.evals || []).concat([{ at: Date.now(), score: r.score, words: r.words }]).slice(-10); save();
  btn.disabled = false; btn.textContent = "Evaluate essay";
  toast(`Essay scored ${r.score}/10 — history updated.`);
});

document.addEventListener("DOMContentLoaded", () => { renderBank(); });
