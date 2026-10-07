"use strict";
/* UPSC ZONE AI — topic-explorer.js
   Features: #23 #24 #25 #26 #27 #28 · ExplorerAPI isolated & API-ready.
   Demo topic per design direction: Indian Monsoon. */
const LS = "uza_explorer_v1";
const $ = s => document.querySelector(s);
const wait = ms => new Promise(r => setTimeout(r, ms));
const esc = s => { const d = document.createElement("div"); d.textContent = s; return d.innerHTML; };
let S = {}; try { S = JSON.parse(localStorage.getItem(LS)) || {}; } catch {}
S.bookmarks = S.bookmarks || []; S.ncert = S.ncert || {};
const save = () => localStorage.setItem(LS, JSON.stringify(S));
function toast(m) { const t = $("#toast"); t.textContent = m; t.hidden = false; clearTimeout(toast._t); toast._t = setTimeout(() => t.hidden = true, 2800); }

/* ---------- topic data (#28: one topic → everything) ---------- */
const TOPICS = {
  monsoon: {
    name: "Indian Monsoon",
    sections: [
      { icon: "📝", h: "Notes", chips: ["GS-1"], p: "SW monsoon June–Sept delivers ~75% of rainfall; two branches (Arabian Sea, Bay of Bengal); onset Kerala ~1 June; withdrawal mid-Sept.", act: ["Save to Smart Notes", "notes.html"] },
      { icon: "📜", h: "PYQs", chips: ["3 found"], p: "2019: 'Why does monsoon retreat bring cyclones?' · 2021: ITCZ mechanism · 2023: Western Ghats rainfall type.", act: ["Open in PYQ Intelligence", "pyq.html"] },
      { icon: "🧩", h: "MCQs", chips: ["ready"], p: "Q: Which statements about monsoon onset are correct? (adaptive, UPSC Standard+)", act: ["Attempt now", "test-interface.html"] },
      { icon: "📰", h: "Current Affairs", chips: ["2026"], p: "IMD 2026 forecast: 103% of LPA; El Niño neutral phase — perfect Mains fodder paragraph.", act: ["See in CA Hub", "current-affairs.html"] },
      { icon: "🎬", h: "Videos", chips: ["2"], p: "'Monsoon mechanism in 12 minutes' (study channel, whitelisted) + 'ENSO explained for UPSC'.", act: ["Watch study-only", "study-youtube.html"] },
      { icon: "🃏", h: "Flashcards", chips: ["6"], p: "Onset date, ITCZ, El Niño vs La Niña, IOD, break-monsoon, orographic rainfall.", act: ["Make cards", "notes.html"] },
      { icon: "✍️", h: "Mains", chips: ["GS-1/GS-3"], p: "Practice Q: 'Explain how monsoon variability shapes Indian agriculture.' (150 words, 7 min)", act: ["Write answer", "answer-writing.html"] },
      { icon: "🔁", h: "Revision", chips: ["due +3d"], p: "This topic's memory strength is 82% — next spaced revision auto-scheduled in 3 days.", act: ["Queue revision", "revision.html"] }
    ],
    graph: [
      { id: "mon", label: "Monsoon", x: 230, y: 120, core: true, info: "Core concept — everything here links back to it." },
      { id: "itcz", label: "ITCZ shift", x: 90, y: 55, info: "Prerequisite: drives the seasonal wind reversal." },
      { id: "enso", label: "El Niño / IOD", x: 375, y: 50, info: "Modulator: weakens (El Niño) or strengthens (La Niña/IOD+) the monsoon." },
      { id: "ghats", label: "Western Ghats", x: 80, y: 190, info: "Orographic rainfall — why the windward side gets 250cm+." },
      { id: "agri", label: "Agriculture", x: 375, y: 190, info: "GS-3 impact: ~52% net sown area is unirrigated." },
      { id: "onset", label: "Kerala onset", x: 230, y: 222, info: "Fact anchor: ~1 June; IMD declares onset." }
    ],
    edges: [["mon", "itcz"], ["mon", "enso"], ["mon", "ghats"], ["mon", "agri"], ["mon", "onset"], ["enso", "agri"]],
    deps: [
      { t: "Heat, pressure & wind basics", s: "done" }, { t: "ITCZ & seasonal winds", s: "done" },
      { t: "Monsoon mechanism (this topic)", s: "due" }, { t: "ENSO / IOD effects", s: "new" }, { t: "Agriculture & economy linkage", s: "new" }
    ]
  },
  federalism: {
    name: "Federalism",
    sections: [
      { icon: "📝", h: "Notes", chips: ["GS-2"], p: "Quasi-federal structure; Art 245–263; Centre-State relations; GST Council as cooperative federalism.", act: ["Save to Smart Notes", "notes.html"] },
      { icon: "📜", h: "PYQs", chips: ["4 found"], p: "2018: Federalism & cooperative federalism · 2020: Governor's role · 2022: Article 356 limits.", act: ["Open in PYQ Intelligence", "pyq.html"] },
      { icon: "🧩", h: "MCQs", chips: ["ready"], p: "Statement-format set on legislative lists and residuary powers.", act: ["Attempt now", "test-interface.html"] },
      { icon: "📰", h: "Current Affairs", chips: ["2026"], p: "One Nation One Election report — federalism angles for GS-2 and Essay.", act: ["See in CA Hub", "current-affairs.html"] },
      { icon: "🎬", h: "Videos", chips: ["1"], p: "'Centre-State relations in 15 minutes' (whitelisted study channel).", act: ["Watch study-only", "study-youtube.html"] },
      { icon: "🃏", h: "Flashcards", chips: ["5"], p: "Lists, residuary powers, Art 356, Sarkaria & Punchhi commissions.", act: ["Make cards", "notes.html"] },
      { icon: "✍️", h: "Mains", chips: ["GS-2"], p: "Practice Q: 'Discuss cooperative federalism in light of recent fiscal debates.' (250 words)", act: ["Write answer", "answer-writing.html"] },
      { icon: "🔁", h: "Revision", chips: ["due +1d"], p: "Memory strength 58% — revision due tomorrow morning.", act: ["Queue revision", "revision.html"] }
    ],
    graph: [
      { id: "fed", label: "Federalism", x: 230, y: 120, core: true, info: "Core concept of Indian polity structure." },
      { id: "lists", label: "Legislative lists", x: 90, y: 60, info: "Union / State / Concurrent — Art 246." },
      { id: "g356", label: "Article 356", x: 370, y: 60, info: "President's Rule — limited by S.R. Bommai (1994)." },
      { id: "gst", label: "GST Council", x: 95, y: 185, info: "Cooperative federalism in action — Art 279A." },
      { id: "rajya", label: "Rajya Sabha", x: 370, y: 185, info: "Council of States — federal chamber." }
    ],
    edges: [["fed", "lists"], ["fed", "g356"], ["fed", "gst"], ["fed", "rajya"]],
    deps: [
      { t: "Constitution basics & Preamble", s: "done" }, { t: "Union & its territory (Art 1–4)", s: "done" },
      { t: "Federalism structure (this topic)", s: "due" }, { t: "Centre-State fiscal relations", s: "new" }
    ]
  },
  monetary: {
    name: "Monetary Policy",
    sections: [
      { icon: "📝", h: "Notes", chips: ["GS-3"], p: "MPC framework, repo corridor, inflation targeting 4%±2%, transmission mechanism.", act: ["Save to Smart Notes", "notes.html"] },
      { icon: "📜", h: "PYQs", chips: ["2 found"], p: "2020: 'What is monetary policy transmission?' · 2022: RBI functions MCQ set.", act: ["Open in PYQ Intelligence", "pyq.html"] },
      { icon: "🧩", h: "MCQs", chips: ["ready"], p: "Adaptive set: repo, SDF, MSF, CRR, SLR — 10 questions.", act: ["Attempt now", "test-interface.html"] },
      { icon: "📰", h: "Current Affairs", chips: ["live"], p: "Repo held at 5.5%; stance unchanged — map every MPC decision to GS-3.", act: ["See in CA Hub", "current-affairs.html"] },
      { icon: "🎬", h: "Videos", chips: ["1"], p: "'LAF corridor explained' (whitelisted study channel).", act: ["Watch study-only", "study-youtube.html"] },
      { icon: "🃏", h: "Flashcards", chips: ["6"], p: "MPC composition, target band, corridor floor/ceiling, voting rule.", act: ["Make cards", "notes.html"] },
      { icon: "✍️", h: "Mains", chips: ["GS-3"], p: "Practice Q: 'Assess RBI's inflation-targeting framework in a supply-shock economy.'", act: ["Write answer", "answer-writing.html"] },
      { icon: "🔁", h: "Revision", chips: ["due +2d"], p: "Memory strength 61% — spaced revision in 2 days.", act: ["Queue revision", "revision.html"] }
    ],
    graph: [
      { id: "mp", label: "Monetary Policy", x: 230, y: 120, core: true, info: "Core GS-3 economy concept." },
      { id: "repo", label: "Repo rate", x: 95, y: 60, info: "Key policy rate decided by the MPC." },
      { id: "mpc", label: "MPC", x: 370, y: 60, info: "6 members; 4%±2% CPI target." },
      { id: "laf", label: "LAF corridor", x: 95, y: 185, info: "SDF floor → repo → MSF ceiling." },
      { id: "infl", label: "Inflation", x: 370, y: 185, info: "The target variable — CPI." }
    ],
    edges: [["mp", "repo"], ["mp", "mpc"], ["mp", "laf"], ["mp", "infl"], ["repo", "laf"]],
    deps: [
      { t: "Inflation basics", s: "done" }, { t: "RBI's role", s: "due" },
      { t: "Monetary policy tools (this topic)", s: "due" }, { t: "Transmission & lags", s: "new" }
    ]
  }
};

const NCERTS = [
  { id: "nc1", t: "Class 11 — Fundamentals of Physical Geography", rel: "monsoon" },
  { id: "nc2", t: "Class 11 — India Physical Environment", rel: "monsoon" },
  { id: "nc3", t: "Class 11 — Indian Constitution at Work", rel: "federalism" },
  { id: "nc4", t: "Class 12 — Introductory Macroeconomics", rel: "monetary" }
];
const RESOURCES = [
  { t: "IMD Long-Range Forecast portal", tag: "Official", rel: "monsoon" },
  { t: "NCERT XI Physical Geography — Ch. 4", tag: "Book", rel: "monsoon" },
  { t: "Sarkaria Commission summary", tag: "Report", rel: "federalism" },
  { t: "RBI Monetary Policy statements archive", tag: "Official", rel: "monetary" },
  { t: "PYQ pack: Climatology 2013–2024", tag: "PYQ", rel: "monsoon" }
];

/* ---------- API-ready layer ---------- */
const ExplorerAPI = {
  async explore(key) { await wait(850); return TOPICS[key]; }   // GET /api/topics/:key
};

/* ---------- render topic (#28) ---------- */
async function explore() {
  const key = $("#tx-topic").value;
  const out = $("#tx-out");
  $("#tx-status").textContent = "Assembling one-topic bundle…";
  out.innerHTML = `<div class="empty-big" style="display:flex;gap:12px;align-items:center;justify-content:center"><span class="spinner"></span> Loading notes, PYQs, MCQs, videos, flashcards, mains & revision…</div>`;
  try {
    const t = await ExplorerAPI.explore(key);
    out.innerHTML = `<div class="tx-sections">${t.sections.map(sec => {
      const bmk = `${key}:${sec.h}`;
      const on = S.bookmarks.includes(bmk);
      return `<article class="tx-card">
        <h3>${sec.icon} ${sec.h}
          <button class="bm-btn ${on ? "on" : ""}" data-bm="${bmk}" aria-pressed="${on}" aria-label="Bookmark ${sec.h}" type="button">${on ? "★" : "☆"}</button></h3>
        <div class="chip-row">${sec.chips.map(c => `<span class="mini-chip">${c}</span>`).join("")}</div>
        <p>${esc(sec.p)}</p>
        <a class="btn btn-ghost btn-sm" href="${sec.act[1]}" style="align-self:flex-start">${sec.act[0]} →</a>
      </article>`;
    }).join("")}</div>`;
    out.querySelectorAll("[data-bm]").forEach(b => b.addEventListener("click", () => {
      const id = b.dataset.bm;
      if (S.bookmarks.includes(id)) S.bookmarks = S.bookmarks.filter(x => x !== id);
      else S.bookmarks.push(id);
      save(); b.classList.toggle("on"); b.setAttribute("aria-pressed", String(b.classList.contains("on")));
      b.textContent = b.classList.contains("on") ? "★" : "☆";
      renderBookmarks(); toast(b.classList.contains("on") ? "Bookmarked (#27) ✓" : "Bookmark removed.");
    }));
    renderGraph(t); renderDeps(t);
    $("#tx-status").textContent = `“${t.name}” bundle ready — ${t.sections.length} surfaces loaded.`;
    S.lastTopic = key; save();
  } catch { out.innerHTML = `<div class="empty-big">Topic failed to load — press Explore again.</div>`; $("#tx-status").textContent = ""; }
}
$("#tx-load").addEventListener("click", explore);

/* ---------- knowledge graph (#25) ---------- */
function renderGraph(t) {
  const svg = $("#kg-svg");
  const pos = Object.fromEntries(t.graph.map(n => [n.id, n]));
  let html = t.edges.map(([a, b]) => `<line class="kg-edge" x1="${pos[a].x}" y1="${pos[a].y}" x2="${pos[b].x}" y2="${pos[b].y}"/>`).join("");
  html += t.graph.map(n => `<g class="kg-node ${n.core ? "core" : ""}" data-n="${n.id}" role="button" tabindex="0" aria-label="${n.label}: ${n.info}">
      <circle cx="${n.x}" cy="${n.y}" r="${n.core ? 30 : 24}"/><text x="${n.x}" y="${n.y + 4}">${n.label}</text></g>`).join("");
  svg.innerHTML = html;
  svg.querySelectorAll(".kg-node").forEach(g => {
    const show = () => {
      svg.querySelectorAll(".kg-node").forEach(x => x.classList.remove("sel"));
      g.classList.add("sel");
      const n = t.graph.find(x => x.id === g.dataset.n);
      $("#kg-info").innerHTML = `<strong>${esc(n.label)}:</strong> ${esc(n.info)}`;
    };
    g.addEventListener("click", show);
    g.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); show(); } });
  });
}

/* ---------- dependency map (#26) ---------- */
function renderDeps(t) {
  $("#dep-list").innerHTML = t.deps.map(d => `<li>${esc(d.t)}<span class="dep-status ${d.s}">${d.s === "done" ? "Mastered" : d.s === "due" ? "Due now" : "Locked"}</span></li>`).join("");
}

/* ---------- NCERT hub (#23) ---------- */
function renderNC() {
  $("#nc-list").innerHTML = NCERTS.map(n => `<li><input type="checkbox" id="${n.id}" data-nc="${n.id}" ${S.ncert[n.id] ? "checked" : ""}>
    <label for="${n.id}">${esc(n.t)}</label><span class="dep-status ${S.ncert[n.id] ? "done" : "new"}" style="margin-left:auto">${S.ncert[n.id] ? "Done" : "Queued"}</span></li>`).join("");
  $("#nc-list").querySelectorAll("[data-nc]").forEach(c => c.addEventListener("change", () => {
    S.ncert[c.dataset.nc] = c.checked; save(); renderNC();
    toast(c.checked ? "NCERT marked done — Foundation progress updated." : "Moved back to queue.");
  }));
}

/* ---------- resource library (#24) ---------- */
function renderRes() {
  $("#res-list").innerHTML = RESOURCES.map(r => `<li><span>📚 ${esc(r.t)}</span><span class="tag dep-status ${r.tag === "Official" ? "done" : r.tag === "PYQ" ? "due" : "new"}">${r.tag}</span></li>`).join("");
}

/* ---------- bookmarks (#27) ---------- */
function renderBookmarks() {
  if (!S.bookmarks.length) { $("#bm-out").innerHTML = `<div class="empty">⭐ No bookmarks yet — star any item inside the topic view.</div>`; return; }
  $("#bm-out").innerHTML = `<div class="bm-grid">${S.bookmarks.map(b => {
    const [topic, part] = b.split(":");
    return `<div class="bm-item"><span>⭐ <strong>${esc(part)}</strong> — ${TOPICS[topic]?.name || topic}</span>
      <button type="button" data-rm="${b}" aria-label="Remove bookmark ${part}">✕</button></div>`;
  }).join("")}</div>`;
  $("#bm-out").querySelectorAll("[data-rm]").forEach(b => b.addEventListener("click", () => {
    S.bookmarks = S.bookmarks.filter(x => x !== b.dataset.rm); save(); renderBookmarks(); exploreIfSame(topicOf(b.dataset.rm));
  }));
}
const topicOf = id => id.split(":")[0];
function exploreIfSame(topic) { if ($("#tx-topic").value === topic) explore(); }

/* ---------- init ---------- */
document.addEventListener("DOMContentLoaded", () => {
  renderNC(); renderRes(); renderBookmarks();
  if (S.lastTopic) $("#tx-topic").value = S.lastTopic;
  explore();
});
