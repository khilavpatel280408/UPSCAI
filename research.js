"use strict";
/* UPSC ZONE AI — research.js
   Features: #9 #128 #134 #137 #138 #235 · ResearchAPI isolated & API-ready. */
const LS = "uza_research_v1";
const $ = s => document.querySelector(s);
const wait = ms => new Promise(r => setTimeout(r, ms));
const esc = s => { const d = document.createElement("div"); d.textContent = s; return d.innerHTML; };
let S = {}; try { S = JSON.parse(localStorage.getItem(LS)) || {}; } catch {}
S.sessions = S.sessions || [];
const save = () => localStorage.setItem(LS, JSON.stringify(S));
function toast(m) { const t = $("#toast"); t.textContent = m; t.hidden = false; clearTimeout(toast._t); toast._t = setTimeout(() => t.hidden = true, 2800); }

const LIBRARY = [
  { t: "Indian Polity — M. Laxmikanth", tag: "Book", kw: "polity constitution parliament" },
  { t: "Indian Economy — Ramesh Singh", tag: "Book", kw: "economy gdp fiscal" },
  { t: "2nd ARC Reports (summaries)", tag: "Report", kw: "governance administration ethics" },
  { t: "Sarkaria Commission Report", tag: "Report", kw: "federalism centre state" },
  { t: "Economic Survey 2025–26", tag: "Official", kw: "economy survey fiscal growth" },
  { t: "India Physical Environment — NCERT XI", tag: "NCERT", kw: "geography monsoon climate" },
  { t: "Punchhi Commission Report", tag: "Report", kw: "federalism governor" },
  { t: "NCERT XII — India Since Independence", tag: "NCERT", kw: "history post independence" }
];
const ResearchAPI = {
  async deepResearch(topic) {          // POST /api/research/deep (#9 #128)
    await wait(500);
    return {
      topic,
      framing: `“${topic}” framed for GS: define → institutional basis → current debates → way forward.`,
      findings: [
        "Constitutional / institutional basis located and cited.",
        "Two opposing positions mapped for a balanced Mains answer.",
        "One current-affairs hook (last 12 months) attached."
      ],
      sources: [
        { t: "Primary official releases (PIB / Ministry)", c: "hi" },
        { t: "Committee / commission report extract", c: "hi" },
        { t: "PRS legislative brief", c: "hi" },
        { t: "Editorial analysis (2 viewpoints)", c: "md" },
        { t: "Related PYQs (3 found, trend-tagged)", c: "hi" }
      ],
      hooks: ["PYQ frame: statement-based pair on this topic.", "Mains value-add: cite the committee + one data point."]
    };
  }
};

let lastReport = null;

/* ---------- run research ---------- */
$("#res-form").addEventListener("submit", async e => {
  e.preventDefault();
  const topic = $("#res-topic").value.trim(), err = $("#res-err");
  if (topic.length < 4) { err.hidden = false; err.textContent = "Give a real research topic (4+ characters)."; return; }
  err.hidden = true;
  const stages = $("#res-stages"); stages.hidden = false;
  const out = $("#res-out");
  out.innerHTML = `<div class="empty" style="display:flex;gap:9px;align-items:center;justify-content:center"><span class="spinner"></span> Deep Research Mode running (#128)…</div>`;
  const labels = ["Collecting sources (#138)…", "Ranking by credibility…", "Synthesising report…"];
  for (let i = 0; i < 3; i++) {
    stages.querySelectorAll(".stage").forEach((s, j) => { s.classList.toggle("on", j === i); s.classList.toggle("done", j < i); });
    out.innerHTML = `<div class="empty" style="display:flex;gap:9px;align-items:center;justify-content:center"><span class="spinner"></span> ${labels[i]}</div>`;
    await wait(700);
  }
  stages.querySelectorAll(".stage").forEach(s => { s.classList.remove("on"); s.classList.add("done"); });
  const r = await ResearchAPI.deepResearch(topic);
  lastReport = r;
  out.innerHTML = `<div class="report"><h3>${esc(r.topic)} — Deep Research Report</h3>
    <p><strong>Framing:</strong> ${esc(r.framing)}</p>
    <p style="margin-top:6px"><strong>Key findings:</strong></p><ul>${r.findings.map(f => `<li>${esc(f)}</li>`).join("")}</ul>
    <p style="margin-top:8px"><strong>Ranked sources:</strong></p>
    ${r.sources.map(s => `<div class="src-row"><span class="cred ${s.c}">${s.c === "hi" ? "High" : "Medium"}</span><span>${esc(s.t)}</span></div>`).join("")}
    <p style="margin-top:8px"><strong>Exam hooks:</strong></p><ul>${r.hooks.map(h => `<li>${esc(h)}</li>`).join("")}</ul>
    <div class="row" style="margin-top:12px">
      <button class="btn btn-primary btn-sm" id="save-sess" type="button">💾 Save session (#137)</button>
      <a class="btn btn-ghost btn-sm" href="notes.html">Send to Notes</a>
      <a class="btn btn-ghost btn-sm" href="answer-writing.html?q=${encodeURIComponent("Discuss: " + r.topic)}&w=250">Write an answer on this →</a>
    </div></div>`;
  $("#save-sess").addEventListener("click", () => {
    S.sessions.unshift({ name: r.topic, at: new Date().toLocaleString("en-IN"), sources: r.sources.length });
    S.sessions = S.sessions.slice(0, 10); save(); renderSessions();
    toast("Session saved — sources auto-collected (#138) ✓");
  });
});

/* ---------- sessions (#137) ---------- */
function renderSessions() {
  $("#sess-out").innerHTML = S.sessions.length ? S.sessions.map((s, i) => `<div class="sess-item">
    <strong>📁 ${esc(s.name)}</strong><p class="meta">${s.sources} sources collected · saved ${s.at}</p>
    <div class="sess-actions"><button class="btn btn-dark btn-sm" data-re="${i}" type="button">↻ Re-run</button>
    <button class="btn btn-ghost btn-sm" data-del="${i}" type="button">Delete</button></div></div>`).join("")
    : `<div class="empty">No saved sessions yet — run research above, then press “Save session”.</div>`;
  $("#sess-out").querySelectorAll("[data-re]").forEach(b => b.addEventListener("click", () => {
    $("#res-topic").value = S.sessions[+b.dataset.re].name;
    $("#res-form").requestSubmit();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }));
  $("#sess-out").querySelectorAll("[data-del]").forEach(b => b.addEventListener("click", () => {
    S.sessions.splice(+b.dataset.del, 1); save(); renderSessions(); toast("Session deleted.");
  }));
}

/* ---------- resource search (#235) ---------- */
function renderLib(q = "") {
  const list = LIBRARY.filter(l => (l.t + " " + l.kw + " " + l.tag).toLowerCase().includes(q.toLowerCase()));
  $("#lib-out").innerHTML = list.length ? list.map(l => `<div class="lib-row"><span>${esc(l.t)}</span><span class="lib-tag">${l.tag}</span></div>`).join("")
    : `<div class="empty">No resources match — try polity, economy, federalism…</div>`;
}
$("#lib-q").addEventListener("input", e => renderLib(e.target.value.trim()));

document.addEventListener("DOMContentLoaded", () => { renderSessions(); renderLib(); });
