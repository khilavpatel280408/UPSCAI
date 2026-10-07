"use strict";
/* UPSC ZONE AI — teach-back.js
   Features: #110 #111 #112 #117 #118 · TeachAPI isolated & API-ready. */
const LS = "uza_teachback_v1";
const $ = s => document.querySelector(s);
const wait = ms => new Promise(r => setTimeout(r, ms));
const esc = s => { const d = document.createElement("div"); d.textContent = s; return d.innerHTML; };
let S = {}; try { S = JSON.parse(localStorage.getItem(LS)) || {}; } catch {}
S.history = S.history || [];
const save = () => localStorage.setItem(LS, JSON.stringify(S));
function toast(m) { const t = $("#toast"); t.textContent = m; t.hidden = false; clearTimeout(toast._t); toast._t = setTimeout(() => t.hidden = true, 2800); }

const TOPICS = {
  monsoon: { name: "Indian Monsoon",
    keys: ["june", "kerala", "itcz", "rain", "wind", "sea", "heat", "western ghats", "el nino", "agriculture"],
    followups: ["What breaks a monsoon spell mid-season?", "Why does the Bay of Bengal branch matter for the northeast?"],
    quiz: [
      { q: "Monsoon onset over Kerala is normally around?", keys: ["1 june", "june"] },
      { q: "Which two branches does the SW monsoon split into?", keys: ["arabian sea", "bay of bengal"] },
      { q: "El Niño usually does what to the monsoon?", keys: ["weak", "reduc", "suppress"] }] },
  monetary: { name: "Monetary Policy",
    keys: ["repo", "rbi", "inflation", "mpc", "banks", "interest", "liquidity", "cpi", "governor"],
    followups: ["Why does the MPC target CPI and not WPI?", "What happens to bond yields when the repo rises?"],
    quiz: [
      { q: "Who chairs the MPC?", keys: ["governor", "rbi"] },
      { q: "The inflation target band is?", keys: ["4%", "2%", "plus minus", "±"] },
      { q: "How many MPC members come from the Government?", keys: ["three", "3"] }] },
  art32: { name: "Article 32 vs Article 226",
    keys: ["supreme court", "high court", "writ", "fundamental rights", "discretion", "ambedkar", "basic structure"],
    followups: ["Why did Ambedkar call Art 32 the 'heart and soul'?", "Can Art 226 ever be wider than Art 32? How?"],
    quiz: [
      { q: "Which article's writ jurisdiction can be refused?", keys: ["226", "high court"] },
      { q: "Art 32 protects which class of rights?", keys: ["fundamental rights"] },
      { q: "Name one writ.", keys: ["habeas", "mandamus", "certiorari", "quo-warranto", "prohibition"] }] },
  federalism: { name: "Federalism",
    keys: ["union", "state", "lists", "concurrent", "centre", "governor", "gst council", "cooperative"],
    followups: ["Where does residuary power sit, and why does it matter?", "How does the GST Council express cooperative federalism?"],
    quiz: [
      { q: "Which list contains policing?", keys: ["state list"] },
      { q: "Residuary powers belong to?", keys: ["union", "parliament", "centre"] },
      { q: "Name one inter-governmental body.", keys: ["gst council", "inter-state council", "finance commission"] }] }
};
const TeachAPI = {
  async gradeTeaching(topic, text) {     // POST /api/teachback/grade
    await wait(1000);
    const words = text.trim().split(/\s+/).filter(Boolean);
    const low = text.toLowerCase();
    const T = TOPICS[topic];
    const hit = T.keys.filter(k => low.includes(k));
    const coverage = Math.round(hit.length / T.keys.length * 100);
    const jargon = (text.match(/\b(pursuant|aforementioned|herein|notwithstanding)\b/gi) || []).length;
    const clarity = Math.max(0, 100 - jargon * 15 - Math.max(0, Math.round(words.length / 18) - 8) * 3);
    const completeness = Math.min(100, Math.round(words.length / 90 * 100));
    return { coverage, clarity, completeness, hit, miss: T.keys.filter(k => !hit.includes(k)), words: words.length };
  },
  async rateAnswer(text) {               // #117 / #118 grading
    await wait(700);
    const words = text.trim().split(/\s+/).filter(Boolean);
    const causal = /(because|since|so that|therefore|due to|hence|as a result)/i.test(text);
    return { ok: words.length >= 8 && causal, words: words.length, causal };
  }
};

/* ---------- voice prompt (#112) ---------- */
$("#tb-hear").addEventListener("click", () => {
  if (!("speechSynthesis" in window)) { toast("No speech engine in this browser.", true); return; }
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(`Teach me about ${TOPICS[$("#tb-topic").value].name}, as if I were twelve years old.`);
  u.lang = "en-IN"; u.rate = 0.95; speechSynthesis.speak(u);
});

/* ---------- step 1: teach ---------- */
$("#tb-submit").addEventListener("click", async () => {
  const topic = $("#tb-topic").value, text = $("#tb-teach").value.trim(), err = $("#tb-err");
  if (text.split(/\s+/).length < 30) { err.hidden = false; err.textContent = "Teach properly — at least ~30 words."; return; }
  err.hidden = true;
  $("#tb-out").innerHTML = `<div class="verdict mid"><span class="spinner"></span> The AI student is listening… grading clarity, coverage, completeness.</div>`;
  const g = await TeachAPI.gradeTeaching(topic, text);
  const total = Math.round((g.coverage + g.clarity + g.completeness) / 3);
  $("#tb-out").innerHTML = `<div class="score-bar">
      <div class="score-item"><strong>${g.coverage}%</strong><span>coverage</span></div>
      <div class="score-item"><strong>${g.clarity}%</strong><span>clarity</span></div>
      <div class="score-item"><strong>${g.completeness}%</strong><span>completeness</span></div>
      <div class="score-item"><strong>${total}%</strong><span>session</span></div></div>
    <div class="verdict ${total >= 70 ? "good" : total >= 45 ? "mid" : "bad"}">
      ${g.miss.length ? `<strong>Missing anchors:</strong> ${g.miss.slice(0, 4).join(", ")}. ` : "All anchors present. "}${g.clarity < 70 ? "Simplify — jargon detected." : "Clean, plain-language teaching."}</div>`;
  S.history.unshift({ topic: TOPICS[topic].name, total, at: Date.now() }); S.history = S.history.slice(0, 10); save();
  renderHistory();
  renderFollowups(topic); renderQuiz(topic);
  $("#fu-card").hidden = false; $("#oq-card").hidden = false;
  toast(`Lesson graded: ${total}% — follow-ups unlocked.`);
});

/* ---------- step 2: follow-ups (#118) ---------- */
function renderFollowups(topic) {
  const T = TOPICS[topic];
  $("#fu-list").innerHTML = T.followups.map((f, i) => `<div class="fu-item">
    <p class="q">${i + 1}. ${esc(f)} <button class="btn btn-ghost btn-sm" data-speak="${esc(f)}" type="button" style="margin-left:6px">🔊</button></p>
    <textarea rows="2" id="fu-${i}" placeholder="Answer the follow-up…" style="margin-top:8px"></textarea>
    <button class="btn btn-dark btn-sm" data-fu="${i}" type="button" style="margin-top:8px">Check answer</button>
    <div id="fu-r-${i}" style="margin-top:8px"></div></div>`).join("");
  $("#fu-list").querySelectorAll("[data-speak]").forEach(b => b.addEventListener("click", () => {
    if ("speechSynthesis" in window) { const u = new SpeechSynthesisUtterance(b.dataset.speak); u.lang = "en-IN"; speechSynthesis.speak(u); }
  }));
  $("#fu-list").querySelectorAll("[data-fu]").forEach(b => b.addEventListener("click", async () => {
    const i = b.dataset.fu, txt = $(`#fu-${i}`).value.trim();
    if (txt.split(/\s+/).length < 6) { toast("Give the follow-up a real answer.", true); return; }
    $(`#fu-r-${i}`).innerHTML = `<span class="spinner"></span>`;
    const r = await TeachAPI.rateAnswer(txt);
    $(`#fu-r-${i}`).innerHTML = `<div class="verdict ${r.ok ? "good" : "mid"}">${r.ok ? "✓ Follow-up handled — causality present (#117/#118)." : "Answer with a 'because' chain — depth over length (#117)."}</div>`;
  }));
}

/* ---------- step 3: oral quiz (#111 + #117) ---------- */
function renderQuiz(topic) {
  const T = TOPICS[topic];
  $("#oq-list").innerHTML = T.quiz.map((q, i) => `<div class="fu-item">
    <p class="q">Q${i + 1}. ${esc(q.q)} <button class="btn btn-ghost btn-sm" data-speak2="${esc(q.q)}" type="button" style="margin-left:6px">🔊</button></p>
    <textarea rows="2" id="oq-${i}" placeholder="Type your spoken answer…" style="margin-top:8px"></textarea>
    <button class="btn btn-dark btn-sm" data-oq="${i}" type="button" style="margin-top:8px">Check</button>
    <div id="oq-r-${i}" style="margin-top:8px"></div></div>`).join("");
  $("#oq-list").querySelectorAll("[data-speak2]").forEach(b => b.addEventListener("click", () => {
    if ("speechSynthesis" in window) { const u = new SpeechSynthesisUtterance(b.dataset.speak2); u.lang = "en-IN"; speechSynthesis.speak(u); }
  }));
  $("#oq-list").querySelectorAll("[data-oq]").forEach(b => b.addEventListener("click", async () => {
    const i = b.dataset.oq, txt = $(`#oq-${i}`).value.trim();
    if (txt.split(/\s+/).length < 2) { toast("Answer first.", true); return; }
    $(`#oq-r-${i}`).innerHTML = `<span class="spinner"></span>`;
    const q = T.quiz[i], low = txt.toLowerCase();
    const right = q.keys.some(k => low.includes(k));
    $(`#oq-r-${i}`).innerHTML = `<div class="verdict ${right ? "good" : "bad"}">${right ? "✓ Correct anchor detected." : "✗ Not the anchor the examiner wants."} <span class="muted small">Now explain WHY in one sentence (#117) — that's where interview marks live.</span></div>`;
  }));
}

/* ---------- history ---------- */
function renderHistory() {
  if (!S.history.length) return;
  $("#hist-out").innerHTML = S.history.map(h => `<div class="hist-row"><span class="hist-score">${h.total}%</span>
    <strong>${esc(h.topic)}</strong><span class="muted small" style="margin-left:auto">${new Date(h.at).toLocaleString("en-IN")}</span></div>`).join("");
}
document.addEventListener("DOMContentLoaded", renderHistory);
