"use strict";
/* UPSC ZONE AI — ai-browser.js
   Features: #119 #120 #121 #122 #123 #124 #125 #126 #127 #128 #129 #130 #131 #132 #133 #135 #136 #138
   BrowserAPI isolated & API-ready. Simulated web — no real network calls. */
const LS = "uza_browser_v1";
const $ = s => document.querySelector(s);
const wait = ms => new Promise(r => setTimeout(r, ms));
const esc = s => { const d = document.createElement("div"); d.textContent = s; return d.innerHTML; };
let S = {}; try { S = JSON.parse(localStorage.getItem(LS)) || {}; } catch {}
S.whitelist = S.whitelist || ["pib.gov.in", "prsindia.org", "ncert.nic.in", "rbi.org.in", "imd.gov.in", "upsc.gov.in"];
S.blacklist = S.blacklist || ["instagram.com", "facebook.com", "x.com", "netflix.com"];
S.collected = S.collected || [];
const save = () => localStorage.setItem(LS, JSON.stringify(S));
function toast(m) { const t = $("#toast"); t.textContent = m; t.hidden = false; clearTimeout(toast._t); toast._t = setTimeout(() => t.hidden = true, 2800); }

const DISTRACT = ["instagram", "movie", "game", "song", "cricket score", "meme", "reel", "netflix", "shopping"];
const PAGES = [
  { id: "pg1", url: "pib.gov.in/monsoon-release", title: "IMD Season Report: Monsoon at 103% of LPA", site: "pib.gov.in", cred: "hi", kw: ["monsoon", "imd", "rain"], body: "The season concluded at 103% of the long-period average, with four subdivisions in deficit. Prelims anchors: LPA definition, subdivision methodology. Mains: regional imbalance and irrigation policy." },
  { id: "pg2", url: "prsindia.org/onee-bill", title: "One Nation One Election — Legislative Primer", site: "prsindia.org", cred: "hi", kw: ["election", "one nation", "federalism", "simultaneous"], body: "PRS tracks the constitutional amendments proposed for simultaneous elections: federalism implications, anti-defection linkages and state-assembly synchronisation." },
  { id: "pg3", url: "rbi.org.in/mpc-statement", title: "MPC Resolution: Repo held at 5.5%", site: "rbi.org.in", cred: "hi", kw: ["repo", "mpc", "monetary", "rbi", "inflation"], body: "The MPC held the policy repo at 5.5% with an unchanged stance. Know the corridor (SDF floor, MSF ceiling) and the 4%±2% CPI band." },
  { id: "pg4", url: "ncert.nic.in/monsoon-chapter", title: "NCERT XI — Indian Monsoon Mechanism", site: "ncert.nic.in", cred: "hi", kw: ["monsoon", "ncert", "itcz"], body: "The textbook treatment: onset, branches, retreat, break spells, and the role of the Tibetan plateau. The safest first source for GS-1 climatology." },
  { id: "pg5", url: "editorial.example/semiconductors", title: "Editorial: The Design-Led Semiconductor Bet", site: "editorial.example", cred: "md", kw: ["semiconductor", "technology", "mission"], body: "Analysis of Mission 2.0's shift from fabs to design and packaging. Useful essay fodder; cross-check numbers against PIB (demo source)." },
  { id: "pg6", url: "blog.example/upsc-hacks", title: "Blog: 100 Days to AIR-1", site: "blog.example", cred: "lo", kw: ["strategy", "hacks"], body: "Unverified blog content. The credibility checker (#127) flags unknown blogs — treat as opinions, never as sources." }
];
const ENCY = {
  monsoon: { t: "Indian Monsoon", body: ["The Southwest monsoon (June–Sept) delivers ~75% of India's rainfall, splitting into Arabian Sea and Bay of Bengal branches after onset over Kerala (~1 June).", "Syllabus links: GS-1 climatology; GS-3 agriculture. Connected concepts: ITCZ, ENSO, IOD, Western Ghats orographic rainfall."], refs: ["NCERT XI Physical Geography", "IMD LPA methodology"] },
  federalism: { t: "Federalism in India", body: ["India's quasi-federal structure distributes power through the Union, State and Concurrent Lists (Art. 246), with the GST Council as a live example of cooperative federalism.", "Syllabus links: GS-2 polity; Essay. Connected concepts: Art. 356, Sarkaria & Punchhi commissions."], refs: ["Laxmikanth — Federalism", "S.R. Bommai (1994)"] },
  mpc: { t: "Monetary Policy Committee", body: ["The 6-member MPC (3 RBI + 3 Government nominees, chaired by the RBI Governor) sets the repo rate against a 4%±2% CPI target.", "Syllabus links: GS-3 economy. Connected concepts: LAF corridor, SDF, transmission lags."], refs: ["RBI Act (2016 amendment)", "Urjit Patel Committee"] }
};

const BrowserAPI = {
  async search(q) {                     // POST /api/browser/search (#120)
    await wait(800);
    return PAGES.filter(p => (p.title + " " + p.kw.join(" ")).toLowerCase().includes(q.toLowerCase()));
  },
  async summarize(p) { await wait(800); return p.body[0]; },  // #129/#136
  async toNotes(p) { await wait(750); return `${p.title}\nSource: ${p.site} (${p.cred === "hi" ? "high credibility" : "verify"})\n\n${p.body.join("\n\n")}\n\nSaved via AI Study Browser (#130).`; }, // #130
  async toQuiz(p) { await wait(800); return [ { q: `According to “${p.title}”, the core UPSC anchor is:`, o: ["A verified fact from this source", "Rumour", "Irrelevant", "None"], a: 0 } ]; }, // #131
  async toCards(p) { await wait(700); return [ { f: `Key fact from ${p.site}?`, b: p.body[0].slice(0, 120) + "…" } ]; }, // #132
  async mindmap(p) { await wait(700); return [`Central: ${p.title}`, ...p.kw.map(k => `→ ${k}`), "→ PYQ link", "→ Revision entry"]; }, // #133
  async deepResearch(topic) {           // #128
    await wait(400); return ["Collecting sources…", "Ranking by credibility…", "Synthesising report…"];
  }
};

/* ---------- tabs (#135) ---------- */
let tabs = [], active = null;
function renderTabs() {
  const row = $("#tabs-row");
  if (!tabs.length) { row.innerHTML = `<div class="empty-tab">No pages open — search above or use the Encyclopedia.</div>`; return; }
  row.innerHTML = tabs.map(t => `<button class="btab ${t.id === active ? "active" : ""}" data-tab="${t.id}" role="tab" aria-selected="${t.id === active}">
    <span>${esc(t.title)}</span><span class="x" data-close="${t.id}" aria-label="Close tab">✕</span></button>`).join("");
  row.querySelectorAll("[data-tab]").forEach(b => b.addEventListener("click", () => { active = b.dataset.tab; renderTabs(); renderViewer(); }));
  row.querySelectorAll("[data-close]").forEach(x => x.addEventListener("click", e => {
    e.stopPropagation(); tabs = tabs.filter(t => t.id !== x.dataset.close);
    if (active === x.dataset.close) active = tabs[0]?.id || null;
    renderTabs(); renderViewer();
  }));
}
function openPage(p) {
  if (!tabs.some(t => t.id === p.id)) tabs.push(p);
  active = p.id; renderTabs(); renderViewer();
  collect(`${p.site} — ${p.title}`);
}
function renderViewer() {
  const v = $("#viewer");
  if (!active) { v.innerHTML = `<div class="empty">🧭 Multi-Tab Study Session <span class="fid">#135</span> — pages you open appear as tabs here with AI tools.</div>`; return; }
  const p = tabs.find(t => t.id === active);
  v.innerHTML = `<article class="page-doc">
    <span class="cred-chip cred-${p.cred}">${p.cred === "hi" ? "High credibility" : p.cred === "md" ? "Medium — cross-check" : "Low credibility"}</span>
    <h3>${esc(p.title)}</h3><p class="src">${esc(p.url)} · whitelisted: ${S.whitelist.includes(p.site) ? "yes" : "no"}</p>
    ${p.body.map(b => `<p>${esc(b)}</p>`).join("")}
    <div class="tool-row">
      <button class="btn btn-ghost btn-sm" data-act="sum" type="button">📄 Summarize (#129)</button>
      <button class="btn btn-ghost btn-sm" data-act="notes" type="button">📝 → Notes (#130)</button>
      <button class="btn btn-ghost btn-sm" data-act="quiz" type="button">🧩 → Quiz (#131)</button>
      <button class="btn btn-ghost btn-sm" data-act="cards" type="button">🃏 → Flashcards (#132)</button>
      <button class="btn btn-ghost btn-sm" data-act="map" type="button">🗺 → Mind Map (#133)</button>
    </div></article>`;
  $("#tool-out").innerHTML = "";
  v.querySelectorAll("[data-act]").forEach(b => b.addEventListener("click", async () => {
    const out = $("#tool-out");
    out.innerHTML = `<div class="tool-box"><span class="spinner"></span> AI transforming this page…</div>`;
    if (b.dataset.act === "sum") { const t = await BrowserAPI.summarize(p); out.innerHTML = `<div class="tool-box"><strong>Tab summary (#136):</strong> ${esc(t)}</div>`; }
    if (b.dataset.act === "notes") { const n = await BrowserAPI.toNotes(p);
      const store = JSON.parse(localStorage.getItem("uza_ca_notes_v1") || "[]"); store.push({ t: new Date().toISOString(), text: n });
      localStorage.setItem("uza_ca_notes_v1", JSON.stringify(store));
      out.innerHTML = `<div class="tool-box"><strong>Note created (#130)</strong><pre style="white-space:pre-wrap;font-family:var(--fb);font-size:.8rem;margin-top:6px">${esc(n)}</pre><a class="text-link" href="notes.html">Open Smart Notes →</a></div>`; }
    if (b.dataset.act === "quiz") { const qs = await BrowserAPI.toQuiz(p);
      out.innerHTML = `<div class="tool-box"><strong>Quiz from page (#131)</strong><ul>${qs.map(q => `<li>${esc(q.q)} <em>(answer: option ${q.a + 1})</em></li>`).join("")}</ul></div>`; }
    if (b.dataset.act === "cards") { const cs = await BrowserAPI.toCards(p);
      out.innerHTML = `<div class="tool-box"><strong>Flashcards (#132)</strong><ul>${cs.map(c => `<li><strong>${esc(c.f)}</strong> — ${esc(c.b)}</li>`).join("")}</ul></div>`; }
    if (b.dataset.act === "map") { const m = await BrowserAPI.mindmap(p);
      out.innerHTML = `<div class="tool-box"><strong>Mind map (#133)</strong><ul>${m.map(x => `<li>${esc(x)}</li>`).join("")}</ul></div>`; }
    collect(`Transform: ${b.dataset.act} on ${p.site}`);
  }));
}

/* ---------- source collection (#138) ---------- */
function collect(label) {
  if (S.collected.some(c => c.l === label)) return;
  S.collected.unshift({ l: label, at: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) });
  S.collected = S.collected.slice(0, 12); save(); renderCol();
}
function renderCol() {
  $("#col-out").innerHTML = S.collected.length
    ? S.collected.map(c => `<div class="list-row"><span>📎 ${esc(c.l)}</span><span class="muted small">${c.at}</span></div>`).join("")
    : `<div class="empty">Nothing collected yet.</div>`;
}

/* ---------- address bar: search / whitelist / blacklist (#120 #121 #122 #123 #124) ---------- */
$("#go-form").addEventListener("submit", async e => {
  e.preventDefault();
  const q = $("#addr").value.trim().toLowerCase();
  if (!q) return;
  if (DISTRACT.some(d => q.includes(d))) {
    $("#viewer").innerHTML = `<div class="block-screen"><strong>⛔ Content filter engaged (#121)</strong>
      “${esc(q)}” is not study content. The Restricted Knowledge Browser (#124) only passes syllabus-relevant material.<br><br>
      <button class="btn btn-ghost btn-sm" id="back-study" type="button">← Back to study</button></div>`;
    $("#back-study").addEventListener("click", () => renderViewer());
    toast("Blocked by the study-only filter.");
    return;
  }
  const asDomain = q.includes(".");
  if (asDomain && S.blacklist.some(b => q.includes(b))) {
    $("#viewer").innerHTML = `<div class="block-screen"><strong>⛔ Blacklisted domain (#123)</strong>
      ${esc(q)} is on your blacklist. It stays blocked during preparation.<br><br>
      <button class="btn btn-ghost btn-sm" id="back-study2" type="button">← Back to study</button></div>`;
    $("#back-study2").addEventListener("click", () => renderViewer());
    return;
  }
  if (asDomain && !S.whitelist.some(w => q.includes(w))) {
    $("#viewer").innerHTML = `<div class="block-screen"><strong>🚧 Outside the whitelist (#122)</strong>
      ${esc(q)} isn't whitelisted. Add it via the Whitelist manager if it's a genuine study source.<br><br>
      <button class="btn btn-ghost btn-sm" id="back-study3" type="button">← Back to study</button></div>`;
    $("#back-study3").addEventListener("click", () => renderViewer());
    return;
  }
  $("#viewer").innerHTML = `<div class="empty" style="display:flex;gap:9px;align-items:center;justify-content:center"><span class="spinner"></span> Study-only search running (#120)…</div>`;
  const results = await BrowserAPI.search(q);
  if (!results.length) { $("#viewer").innerHTML = `<div class="empty">No study sources match “${esc(q)}” — try monsoon, repo, election, federalism…</div>`; return; }
  $("#viewer").innerHTML = `<p class="muted small">${results.length} whitelisted result(s) for “${esc(q)}”:</p>` + results.map(p =>
    `<div class="result-row"><span class="cred-chip cred-${p.cred}">${p.site}</span><span><strong>${esc(p.title)}</strong><br><span class="muted small">${esc(p.url)}</span></span>
     <button class="btn btn-dark btn-sm open" data-open="${p.id}" type="button">Open in tab</button></div>`).join("");
  $("#viewer").querySelectorAll("[data-open]").forEach(b => b.addEventListener("click", () => openPage(PAGES.find(p => p.id === b.dataset.open))));
});

/* ---------- managers ---------- */
function listManager(title, key, fid) {
  const render = () => `<div class="mgmt"><strong>${title} <span class="fid">${fid}</span></strong>
    ${S[key].map((w, i) => `<div class="list-row"><span>${esc(w)}</span><button class="mini-x" data-rm="${i}" aria-label="Remove ${w}">✕</button></div>`).join("")}
    <div class="row" style="margin-top:9px"><input type="text" id="mg-in" placeholder="add-domain.com" style="flex:1"><button class="btn btn-dark btn-sm" id="mg-add" type="button">+ Add</button></div></div>`;
  $("#mgmt-out").innerHTML = render();
  $("#mgmt-out").querySelectorAll("[data-rm]").forEach(b => b.addEventListener("click", () => { S[key].splice(+b.dataset.rm, 1); save(); $("#mgmt-out").innerHTML = render(); bind(); toast("Removed."); }));
  const bind = () => {
    $("#mg-add").addEventListener("click", () => {
      const v = $("#mg-in").value.trim().toLowerCase();
      if (!v.includes(".")) { toast("Enter a real domain.", true); return; }
      S[key].push(v); save(); $("#mgmt-out").innerHTML = render(); bind(); toast("Saved ✓");
    });
  };
  bind();
}
$("#wl-btn").addEventListener("click", () => listManager("Study Website Whitelist", "whitelist", "#122"));
$("#bl-btn").addEventListener("click", () => listManager("Website Blacklist", "blacklist", "#123"));

/* ---------- credibility (#127) ---------- */
$("#cred-btn").addEventListener("click", () => {
  $("#mgmt-out").innerHTML = `<div class="mgmt"><strong>Source Credibility Checker <span class="fid">#127</span></strong>
    <div class="row" style="margin-top:8px"><input type="text" id="cred-in" placeholder="Paste any source/URL…" style="flex:1">
    <button class="btn btn-dark btn-sm" id="cred-go" type="button">Check</button></div><div id="cred-out" style="margin-top:9px"></div></div>`;
  $("#cred-go").addEventListener("click", () => {
    const v = $("#cred-in").value.trim().toLowerCase();
    if (!v) return;
    let verdict, cls, why;
    if (/(pib|prs|ncert|rbi|imd|upsc|mea|niti)/.test(v)) { verdict = "HIGH credibility"; cls = "cred-hi"; why = "Official/institutional source — safe to cite in Mains."; }
    else if (/(thehindu|indianexpress|wikipedia|prsindia)/.test(v)) { verdict = "MEDIUM — cross-check"; cls = "cred-md"; why = "Reputable but editorial; verify numbers against primary releases."; }
    else { verdict = "LOW — avoid citing"; cls = "cred-lo"; why = "Unknown provenance. Use as a lead, never as a source."; }
    $("#cred-out").innerHTML = `<span class="cred-chip ${cls}">${verdict}</span> <span class="muted small">${why}</span>`;
  });
});

/* ---------- deep research (#128) ---------- */
$("#deep-btn").addEventListener("click", () => {
  $("#mgmt-out").innerHTML = `<div class="mgmt"><strong>AI Deep Research Mode <span class="fid">#128</span></strong>
    <div class="row" style="margin-top:8px"><input type="text" id="dr-in" placeholder="Research topic… e.g. Simultaneous elections" style="flex:1">
    <button class="btn btn-primary btn-sm" id="dr-go" type="button">Run deep research</button></div><div id="dr-out" style="margin-top:9px"></div></div>`;
  $("#dr-go").addEventListener("click", async () => {
    const topic = $("#dr-in").value.trim();
    if (topic.length < 4) { toast("Give a real topic.", true); return; }
    const out = $("#dr-out");
    for (const stage of await BrowserAPI.deepResearch(topic)) {
      out.innerHTML = `<div class="tool-box"><span class="spinner"></span> ${stage}</div>`;
      await wait(650);
    }
    out.innerHTML = `<div class="tool-box"><strong>Deep Research report — “${esc(topic)}”</strong>
      <ul><li>Core question framed for GS-2/GS-3.</li><li>5 sources collected (auto-ranked by credibility, #138).</li><li>2 PYQ hooks + 1 Mains value-add identified.</li></ul>
      <div class="row" style="margin-top:8px"><a class="btn btn-dark btn-sm" href="research.html">Open in Research Workspace →</a></div></div>`;
    collect(`Deep research: ${topic}`);
  });
});

/* ---------- encyclopedia (#125 #126) ---------- */
$("#ency-go").addEventListener("click", () => {
  const e = ENCY[$("#ency-term").value];
  $("#ency-out").innerHTML = `<div class="page-doc"><h3>${esc(e.t)}</h3><p class="src">UPSC Encyclopedia · AI knowledge hub (#126)</p>
    ${e.body.map(b => `<p>${esc(b)}</p>`).join("")}<p class="muted small"><strong>References:</strong> ${e.refs.join(" · ")}</p>
    <div class="tool-row"><button class="btn btn-dark btn-sm" id="ency-tab" type="button">Open as tab</button></div></div>`;
  $("#ency-tab").addEventListener("click", () => openPage({ id: "ency-" + $("#ency-term").value, url: "encyclopedia/" + $("#ency-term").value, title: e.t, site: "encyclopedia (hub)", cred: "hi", kw: [e.t.toLowerCase()], body: e.body }));
  collect(`Encyclopedia: ${e.t}`);
});

document.addEventListener("DOMContentLoaded", () => { renderTabs(); renderViewer(); renderCol(); });
