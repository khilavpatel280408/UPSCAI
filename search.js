"use strict";
/* UPSC ZONE AI — search.js
   Features: #229 #230 #231 #232 #233 #234 #235 #236 #237
   SearchAPI isolated & API-ready (swap for GET /api/search?q=&semantic=). */
const LS = "uza_search_v1";
const $ = s => document.querySelector(s);
const wait = ms => new Promise(r => setTimeout(r, ms));
const esc = s => { const d = document.createElement("div"); d.textContent = s; return d.innerHTML; };
let S = {}; try { S = JSON.parse(localStorage.getItem(LS)) || {}; } catch {}
S.recent = S.recent || [];
const save = () => localStorage.setItem(LS, JSON.stringify(S));
function toast(m) { const t = $("#toast"); t.textContent = m; t.hidden = false; clearTimeout(toast._t); toast._t = setTimeout(() => t.hidden = true, 2800); }

/* ---------- demo index ---------- */
const INDEX = [
  { type: "note", title: "Federalism — One Topic Summary", snippet: "Quasi-federal structure; Union/State/Concurrent lists; GST Council as cooperative federalism in action.", src: "Smart Notes", href: "notes.html", kw: "federalism centre state gst council cooperative lists" },
  { type: "note", title: "Monetary Policy — MPC Framework", snippet: "Repo corridor, 4%±2% CPI target, MPC composition and casting vote.", src: "Smart Notes", href: "notes.html", kw: "monetary repo mpc inflation rbi" },
  { type: "note", title: "Indian Monsoon — mechanism", snippet: "Onset, branches, retreat and ENSO linkages in one anchor note.", src: "Smart Notes", href: "notes.html", kw: "monsoon itcz kerala el nino" },
  { type: "pyq", title: "PYQ 2022 — President's Rule limits", snippet: "“Under which circumstances can President's Rule be imposed…” (GS-1 Prelims)", src: "PYQ Bank", href: "pyq.html", kw: "federalism article 356 president rule governor" },
  { type: "pyq", title: "PYQ 2020 — Cooperative federalism", snippet: "“The concept of cooperative federalism is best reflected by…”", src: "PYQ Bank", href: "pyq.html", kw: "federalism cooperative gst council inter-state" },
  { type: "pyq", title: "PYQ 2023 — Monsoon statements", snippet: "Statement-format question on monsoon branches and onset timing.", src: "PYQ Bank", href: "pyq.html", kw: "monsoon onset bay bengal arabian sea" },
  { type: "ca", title: "One Nation One Election report tabled", snippet: "Constitutional amendments proposed; federalism angles for GS-2 and Essay.", src: "Current Affairs · Oct 2026", href: "current-affairs.html", kw: "federalism one nation election simultaneous" },
  { type: "ca", title: "GST Council meeting — rate rationalisation", snippet: "Centre-State revenue sharing debate reopens; cite in GS-3 answers.", src: "Current Affairs · Sep 2026", href: "current-affairs.html", kw: "gst council federalism centre state tax" },
  { type: "video", title: "One Nation One Election — federalism debate", snippet: "UPSC Pathshala · 14 min · whitelisted study channel.", src: "Study-Only YouTube", href: "study-youtube.html", kw: "federalism election one nation video" },
  { type: "video", title: "Monsoon mechanism in 12 minutes", snippet: "UPSC Pathshala · onset, branches, retreat with maps.", src: "Study-Only YouTube", href: "study-youtube.html", kw: "monsoon mechanism itcz video" },
  { type: "question", title: "Mains Q — 'Simultaneous elections test federalism'", snippet: "250 words · GS-2 · write it in the timed workspace.", src: "Mains Center", href: "answer-writing.html?q=%27Simultaneous%20elections%20strengthen%20efficiency%20but%20test%20federalism.%27%20Critically%20analyse.&w=250", kw: "federalism simultaneous elections mains gs2" },
  { type: "question", title: "MCQ — which list contains policing?", snippet: "Adaptive question from the topic-wise drill set.", src: "Test Center", href: "test-interface.html?mode=topic&t=Federalism", kw: "federalism lists state list mcq" },
  { type: "resource", title: "Sarkaria Commission Report (summary)", snippet: "Centre-State relations — the canonical federalism reference.", src: "Resource Library", href: "research.html", kw: "federalism sarkaria centre state commission" },
  { type: "resource", title: "Laxmikanth — Federalism chapter", snippet: "Standard text entry with PYQ cross-references.", src: "Resource Library", href: "topic-explorer.html", kw: "federalism laxmikanth polity book" }
];
const SEMANTIC = {
  federalism: ["centre state", "center state", "gst council", "article 356", "cooperative", "inter-state", "one nation one election", "sarkaria", "punchhi", "governor", "concurrent list", "simultaneous"],
  monsoon: ["itcz", "el nino", "la nina", "kerala onset", "rainfall", "western ghats", "agriculture"],
  monetary: ["repo", "rbi", "mpc", "inflation", "liquidity", "sdf", "interest rate"],
  polity: ["constitution", "federalism", "parliament", "rights", "writs"]
};
const GROUP_META = {
  note: ["📝 Notes", "#230"], pyq: ["📜 PYQs", "#231"], ca: ["📰 Current Affairs", "#232"],
  video: ["🎬 Videos", "#233"], question: ["✍️ Questions & MCQs", "#234"], resource: ["📚 Resources", "#235"]
};

const SearchAPI = {
  async run(q, semantic) {               // GET /api/search
    const stages = ["Parse intent", "Expand meaning", "Rank sources"];
    const els = document.querySelectorAll(".stage");
    for (let i = 0; i < 3; i++) {
      els.forEach((e, j) => { e.classList.toggle("on", j === i); e.classList.toggle("done", j < i); });
      await wait(420);
    }
    els.forEach(e => { e.classList.remove("on"); e.classList.add("done"); });
    const tokens = q.toLowerCase().split(/\s+/).filter(Boolean);
    if (semantic) tokens.forEach(t => { if (SEMANTIC[t]) tokens.push(...SEMANTIC[t]); });
    const results = INDEX.map(item => {
      const hay = (item.title + " " + item.snippet + " " + item.kw).toLowerCase();
      const hits = tokens.filter(t => hay.includes(t)).length;
      return { item, hits, score: Math.min(99, Math.round(hits / Math.max(tokens.length, 1) * 70 + hits * 9)) };
    }).filter(r => r.hits > 0).sort((a, b) => b.score - a.score);
    return { results, expanded: semantic && tokens.length > q.toLowerCase().split(/\s+/).length };
  }
};

/* ---------- state ---------- */
let lastResults = [], typeFilter = "";

/* ---------- render ---------- */
function render() {
  const box = $("#results");
  const shown = lastResults.filter(r => !typeFilter || r.item.type === typeFilter);
  $("#tabs-hidden") ;
  const counts = {}; lastResults.forEach(r => counts[r.item.type] = (counts[r.item.type] || 0) + 1);
  $("#c-all").textContent = lastResults.length;
  ["note", "pyq", "ca", "video", "question", "resource"].forEach(t => $("#c-" + t).textContent = counts[t] || 0);
  $("#type-tabs").hidden = false;
  if (!lastResults.length) { box.innerHTML = `<div class="empty-big">No matches in the demo index — try “federalism”, “monsoon”, “repo rate”, “gst council”.</div>`; return; }
  if (!shown.length) { box.innerHTML = `<div class="empty-big">No results of this type — switch tabs above.</div>`; return; }
  const grouped = {};
  shown.forEach(r => { (grouped[r.item.type] = grouped[r.item.type] || []).push(r); });
  box.innerHTML = Object.entries(grouped).map(([type, rows]) => `
    <section class="res-group"><h3>${GROUP_META[type][0]} <span class="cnt">${rows.length}</span> <span class="fid">${GROUP_META[type][1]}</span></h3>
    ${rows.map(r => `<article class="res-item">
      <div class="body"><span class="src">${esc(r.item.src)}</span><h4>${esc(r.item.title)}</h4><p>${esc(r.item.snippet)}</p></div>
      <span class="score">${r.score}% match</span>
      <a class="btn btn-primary" style="padding:9px 14px;font-size:.78rem" href="${r.item.href}">Open →</a></article>`).join("")}</section>`).join("");
}

/* ---------- events ---------- */
$("#s-form").addEventListener("submit", async e => {
  e.preventDefault();
  const q = $("#q").value.trim() || "Federalism", err = $("#s-err");
  if (q.length < 3) { err.hidden = false; err.textContent = "Type at least 3 characters for a meaningful search."; return; }
  err.hidden = true;
  $("#q").value = q;
  $("#s-stages").hidden = false;
  $("#results").innerHTML = `<div class="empty-big" style="display:flex;gap:10px;align-items:center;justify-content:center"><span class="spinner"></span> AI Semantic Search running (#236)…</div>`;
  const { results, expanded } = await SearchAPI.run(q, $("#sem-mode").checked);
  lastResults = results; typeFilter = "";
  document.querySelectorAll("#type-tabs .tab").forEach(t => { t.classList.toggle("active", !t.dataset.t); t.setAttribute("aria-selected", String(!t.dataset.t)); });
  $("#s-stages").hidden = true;
  render();
  if (expanded) $("#results").insertAdjacentHTML("afterbegin", `<div class="sem-note">🧠 Semantic expansion applied (#236): your query was broadened to syllabus-linked terms before ranking.</div>`);
  S.recent = [q, ...S.recent.filter(x => x !== q)].slice(0, 4); save(); renderRecent();
  toast(`${results.length} result(s) across ${new Set(results.map(r => r.item.type)).size} surfaces.`);
});
document.querySelectorAll("#type-tabs .tab").forEach(b => b.addEventListener("click", () => {
  document.querySelectorAll("#type-tabs .tab").forEach(x => { x.classList.toggle("active", x === b); x.setAttribute("aria-selected", String(x === b)); });
  typeFilter = b.dataset.t; render();
}));
function renderRecent() {
  $("#recent-wrap").innerHTML = S.recent.length ? "Recent: " + S.recent.map(r => `<button class="recent-chip" data-re="${esc(r)}" type="button">${esc(r)}</button>`).join("") : "";
  $("#recent-wrap").querySelectorAll("[data-re]").forEach(c => c.addEventListener("click", () => { $("#q").value = c.dataset.re; $("#s-form").requestSubmit(); }));
}
document.addEventListener("DOMContentLoaded", () => { renderRecent(); $("#q").value = "Federalism"; });
