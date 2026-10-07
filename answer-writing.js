"use strict";
/* UPSC ZONE AI — answer-writing.js
   Features: #97 #98 #99 #100 #101 #102 #103 #104 #105
   AwAPI isolated & API-ready. Draft + history persist locally. */
const LS = "uza_aw_v1";
const $ = s => document.querySelector(s);
const wait = ms => new Promise(r => setTimeout(r, ms));
const esc = s => { const d = document.createElement("div"); d.textContent = s; return d.innerHTML; };
let S = {}; try { S = JSON.parse(localStorage.getItem(LS)) || {}; } catch {}
const save = () => localStorage.setItem(LS, JSON.stringify(S));
function toast(m) { const t = $("#toast"); t.textContent = m; t.hidden = false; clearTimeout(toast._t); toast._t = setTimeout(() => t.hidden = true, 3000); }

/* ---------- question from URL or default ---------- */
const params = new URLSearchParams(location.search);
const Q = params.get("q") || "Discuss the significance of Article 32 in light of the statement that it is the 'heart and soul' of the Constitution.";
const WORD_TARGET = Math.min(1000, Math.max(150, +(params.get("w") || 150)));
const TIME_LIMIT = WORD_TARGET >= 1000 ? 55 * 60 : WORD_TARGET === 250 ? 12 * 60 : 7 * 60;
$("#aw-question").textContent = Q;
$("#aw-target").textContent = WORD_TARGET >= 1000 ? "Target: 1000+ words (essay)" : `Target: ${WORD_TARGET} words`;

/* ---------- draft restore ---------- */
const area = $("#answer-area");
if (S.drafts && S.drafts[Q]) area.value = S.drafts[Q];

/* ---------- word counter (#103) ---------- */
function countWords() { return area.value.trim() ? area.value.trim().split(/\s+/).length : 0; }
function wordsUI() {
  const n = countWords(), pill = $("#aw-words");
  pill.textContent = `${n} words`;
  pill.classList.toggle("over", WORD_TARGET < 1000 && n > Math.round(WORD_TARGET * 1.15));
}
area.addEventListener("input", () => {
  wordsUI();
  S.drafts = S.drafts || {}; S.drafts[Q] = area.value; save();
  $("#save-note").textContent = "Autosaved locally ✓ " + new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
});
wordsUI();

/* ---------- timer (#104) ---------- */
let elapsed = 0, ticking = null;
const fmt = s => String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0");
function timerUI() {
  $("#aw-time").textContent = "⏱ " + fmt(elapsed);
  if (elapsed === TIME_LIMIT) toast("Time limit reached — the real exam moves on. Submit now.");
  $("#aw-time").style.background = elapsed > TIME_LIMIT ? "var(--red)" : "";
}
$("#timer-btn").addEventListener("click", () => {
  if (ticking) { clearInterval(ticking); ticking = null; $("#timer-btn").textContent = "▶ Resume timer"; toast("Timer paused."); return; }
  ticking = setInterval(() => { elapsed++; timerUI(); }, 1000);
  $("#timer-btn").textContent = "⏸ Pause timer";
});
$("#timer-reset").addEventListener("click", () => { clearInterval(ticking); ticking = null; elapsed = 0; timerUI(); $("#timer-btn").textContent = "▶ Start timer"; });

/* ---------- AI tools (#99 #100 #101 #102) ---------- */
function toolBox(html, insertText) {
  $("#tool-out").innerHTML = `<div class="tool-box">${html}${insertText != null ? `<button class="insert-btn" type="button">⤵ Insert into answer</button>` : ""}</div>`;
  const b = $("#tool-out .insert-btn");
  if (b) b.addEventListener("click", () => { area.value = area.value ? area.value + "\n\n" + insertText : insertText; wordsUI(); S.drafts = S.drafts || {}; S.drafts[Q] = area.value; save(); toast("Inserted into your draft ✓"); });
}
$("#struct-btn").addEventListener("click", () => {
  const outline = WORD_TARGET >= 1000
    ? ["Intro: anecdote + thesis", "Historical context", "Political dimension", "Economic dimension", "Social dimension", "Technology & future", "Antithesis — honest counter", "Way forward (policy anchors)", "Conclusion: synthesising image"]
    : ["1. Intro — define/context (20–25 words)", "2. Body ¶1 — core argument + example", "3. Body ¶2 — second dimension + data/committee", "4. Body ¶3 — challenges/counterpoint", "5. Way forward — 2 concrete steps", "6. Conclusion — constitutional/SDG anchor"];
  toolBox(`<strong>Answer Structure (#99)</strong><ul>${outline.map(o => `<li>${esc(o)}</li>`).join("")}</ul>`);
});
$("#intro-btn").addEventListener("click", () => {
  const t = WORD_TARGET >= 1000 ? "Open with a concrete scene or data point, then land your thesis in one clean sentence." :
    `Recent reports have brought “${Q.split(" ").slice(0, 6).join(" ")}…” back into debate. At its core, this question tests a constitutional principle and its practical limits.`;
  toolBox(`<strong>Introduction (#100)</strong><p style="margin-top:6px">${esc(t)}</p>`, t);
});
$("#concl-btn").addEventListener("click", () => {
  const t = "In conclusion, the way forward lies in balancing principle with pragmatism — anchored in constitutional values and the SDG agenda, implemented through cooperative federalism.";
  toolBox(`<strong>Conclusion (#101)</strong><p style="margin-top:6px">${esc(t)}</p>`, t);
});
$("#diag-btn").addEventListener("click", () => {
  toolBox(`<strong>Diagram suggestions (#102)</strong><ul>
    <li>Hub-and-spoke: central concept → stakeholders/dimensions.</li>
    <li>Flowchart: cause → mechanism → outcome (great for processes).</li>
    <li>Venn: two overlapping ideas (e.g., efficiency vs federalism).</li></ul>
    <p class="muted small" style="margin-top:6px">Sketch in 30–40 seconds; label axes clearly. Examiners reward structure under time.</p>`);
});

/* ---------- evaluation (#97) + history (#105) ---------- */
const AwAPI = {
  async evaluate(text, target) {       // POST /api/mains/evaluate
    await wait(1100);
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    const connectors = (text.match(/(however|therefore|moreover|consequently|on the other hand|nevertheless|thus|furthermore)/gi) || []).length;
    const hasConcl = /(conclusion|to conclude|way forward|in sum|ultimately)/i.test(text);
    const keywords = Q.toLowerCase().match(/[a-z]{5,}/g) || [];
    const covered = keywords.filter(k => text.toLowerCase().includes(k)).length;
    const coverage = keywords.length ? covered / keywords.length : 0.5;
    const lengthScore = Math.min(1, words / (target * 0.9));
    const score = Math.min(10, Math.round((lengthScore * 2.5 + Math.min(connectors, 6) / 6 * 2 + (hasConcl ? 2 : 0.5) + coverage * 3.5) * 10) / 10);
    return { words, score, connectors, hasConcl, coverage: Math.round(coverage * 100),
      notes: [
        words >= target * 0.85 ? "Length on target." : `Below target (${words}/${target}) — develop further.`,
        hasConcl ? "Conclusion detected — good closure." : "Add an explicit conclusion/way-forward.",
        connectors >= 4 ? "Logical flow is strong." : "Use more connectors for flow.",
        `Question-keyword coverage ${Math.round(coverage * 100)}% — ${coverage > 0.6 ? "stay on-topic" : "anchor more phrases to the stem"}.`
      ] };
  },
  model(target) {
    return target >= 1000
      ? "A top essay opens with a human vignette, states its thesis within 60 words, develops 6+ dimensions with one data point each, hosts a genuine antithesis, and closes on a synthesising image — not a summary."
      : "The model answer defines the core term in one line, takes a clear position, supports it with one constitutional anchor and one current example, concedes a limitation, and ends with a concrete way forward — all within the word limit.";
  }
};
$("#eval-btn").addEventListener("click", async () => {
  const text = area.value.trim(), btn = $("#eval-btn");
  if (countWords() < 30) { toast("Write at least ~30 words before submitting.", true); return; }
  btn.disabled = true; btn.innerHTML = '<span class="spinner"></span> AI reading your answer…';
  $("#eval-out").innerHTML = `<div class="empty">Scoring structure, content, balance, length… (honest local heuristic)</div>`;
  const r = await AwAPI.evaluate(text, WORD_TARGET);
  $("#eval-out").innerHTML = `<div class="eval-box"><span class="marks">${r.score}/10</span>
    <span class="muted small"> · ${r.words} words · ${elapsed ? fmt(elapsed) + " taken" : "untimed"} · coverage ${r.coverage}%</span>
    <ul>${r.notes.map(n => `<li>${esc(n)}</li>`).join("")}</ul>
    <p class="muted small" style="margin-top:8px">Heuristic demo evaluator (#97).</p></div>`;
  btn.disabled = false; btn.innerHTML = "Submit for AI Evaluation <span class=\"fid\">#97</span>";
  $("#model-btn").disabled = false;
  S.history = S.history || [];
  S.history.unshift({ q: Q.slice(0, 70), at: Date.now(), score: r.score, words: r.words, secs: elapsed });
  S.history = S.history.slice(0, 15); save();
  renderHistory();
  toast(`Evaluated: ${r.score}/10 · logged to improvement history.`);
});

/* ---------- model answer (#98) ---------- */
$("#model-btn").addEventListener("click", () => {
  $("#eval-out").insertAdjacentHTML("beforeend", `<div class="model-box"><strong>Model answer — what a topper includes (#98)</strong>
    <p style="margin-top:6px">${esc(AwAPI.model(WORD_TARGET))}</p>
    <ul><li>Every claim carries one concrete anchor (article, data, committee).</li>
    <li>Structure is visible: intro → 2–3 developed points → counter → way forward.</li>
    <li>Word discipline: nothing decorative survives the limit.</li></ul></div>`);
  $("#model-btn").disabled = true;
});

/* ---------- history (#105) ---------- */
function renderHistory() {
  const h = S.history || [];
  if (!h.length) return;
  $("#hist-out").innerHTML = h.slice(0, 6).map((x, i) => {
    const prev = h[i + 1];
    const delta = prev ? Math.round((x.score - prev.score) * 10) / 10 : 0;
    return `<div class="hist-row"><span class="hist-score">${x.score}/10</span>
      <span>${esc(x.q)}${x.q.length >= 70 ? "…" : ""}</span>
      <span class="muted small" style="margin-left:auto">${x.words}w · ${fmt(x.secs)} · ${new Date(x.at).toLocaleDateString("en-IN")}</span>
      ${prev ? `<span class="hist-delta ${delta > 0 ? "up" : delta < 0 ? "dn" : "eq"}">${delta > 0 ? "▲ +" : delta < 0 ? "▼ " : "＝"}${Math.abs(delta)}</span>` : ""}</div>`;
  }).join("");
}
renderHistory();
