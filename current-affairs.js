"use strict";
/* UPSC ZONE AI — current-affairs.js
   Features: #84 #85 #86 #87 #88 #89 #90 #91 #92 #93 #94 #95 #232
   CaAPI isolated & API-ready. */
const LS = "uza_ca_v1";
const $ = s => document.querySelector(s);
const wait = ms => new Promise(r => setTimeout(r, ms));
const esc = s => { const d = document.createElement("div"); d.textContent = s; return d.innerHTML; };
let S = {}; try { S = JSON.parse(localStorage.getItem(LS)) || {}; } catch {}
const save = () => localStorage.setItem(LS, JSON.stringify(S));
function toast(m) { const t = $("#toast"); t.textContent = m; t.hidden = false; clearTimeout(toast._t); toast._t = setTimeout(() => t.hidden = true, 3000); }

const ITEMS = [
  { id: "c1", date: "7 Oct 2026", title: "MPC holds repo rate at 5.5%, stance unchanged", src: "RBI / PIB", tags: ["pre", "mains"], topic: "monetary policy",
    body: "The six-member MPC kept rates steady citing balanced inflation-growth trade-off. Prelims: know MPC composition & target band. Mains: use in GS-3 monetary transmission answers." },
  { id: "c2", date: "6 Oct 2026", title: "One Nation One Election committee report tabled in Parliament", src: "PRS", tags: ["mains", "essay"], topic: "federalism elections",
    body: "Constitutional amendments proposed for simultaneous polls. Mains GS-2: cooperative federalism vs unitary tilt. Essay: 'One nation, one election — federalism at the altar of efficiency?'" },
  { id: "c3", date: "5 Oct 2026", title: "IMD wraps monsoon season: 103% of LPA, four subdivisions in deficit", src: "IMD", tags: ["pre"], topic: "monsoon",
    body: "Normal all-India rainfall masks regional deficits — classic statement-trap material. Link: MSP & irrigation policy." },
  { id: "c4", date: "3 Oct 2026", title: "India–EU FTA negotiations enter final cluster", src: "Ministry of Commerce", tags: ["mains"], topic: "economy trade",
    body: "Services mobility and CBAM remain sticking points. GS-2 IR + GS-3 trade. Note 'trade agreement' template for answers." },
  { id: "c5", date: "1 Oct 2026", title: "Semiconductor Mission 2.0 approved — focus on design & packaging", src: "Cabinet / PIB", tags: ["pre", "mains", "essay"], topic: "technology industry",
    body: "Incentives shift from fabs to design-led manufacturing. Essay fodder: technology sovereignty. Prelims: mission structure." },
  { id: "c6", date: "28 Sep 2026", title: "Supreme Court verdict on sub-classification within SC reservations", src: "Supreme Court", tags: ["pre", "mains"], topic: "polity rights",
    body: "Constitution Bench allows sub-classification with quantifiable data test. Landmark-cite in GS-2 answers." },
  { id: "c7", date: "25 Sep 2026", title: "Loss & Damage fund: new pledges at climate ministerial", src: "UNFCCC", tags: ["pre", "mains"], topic: "climate",
    body: "CBDR reasserted by developing bloc. Environment Prelims + GS-3 climate justice." },
  { id: "c8", date: "22 Sep 2026", title: "Chandrayaan follow-up mission cleared with international payload", src: "ISRO", tags: ["pre"], topic: "science space",
    body: "S&T Prelims staple: mission objectives & agency partnerships." }
];
const TIMELINE = [
  ["Jun 2026", "Monsoon onset declared over Kerala (1 June)"],
  ["Jul 2026", "Budget session: fiscal glidepath reaffirmed"],
  ["Aug 2026", "G20 working groups conclude under Indian troika"],
  ["Sep 2026", "SC sub-classification verdict; climate ministerial pledges"],
  ["Oct 2026", "ONEE report tabled; Semiconductor Mission 2.0; MPC holds at 5.5%"]
];
const QUIZ = [
  { q: "The repo rate after the October 2026 MPC meeting stands at:", o: ["5.25%", "5.5%", "6.0%", "6.25%"], a: 1 },
  { q: "Sub-classification within SC reservations was held permissible subject to:", o: ["Parliamentary approval", "Quantifiable inadequacy data", "President's ordinance", "None"], a: 1 },
  { q: "All-India monsoon rainfall for the 2026 season was reported at:", o: ["97% of LPA", "100% of LPA", "103% of LPA", "110% of LPA"], a: 2 },
  { q: "Semiconductor Mission 2.0 shifts incentives towards:", o: ["Only fab construction", "Design-led manufacturing & packaging", "Import substitution quotas", "None"], a: 1 },
  { q: "'Loss & Damage' funding debates are anchored in the principle of:", o: ["MFN", "CBDR", "National treatment", "Subsidiarity"], a: 1 }
];

const CaAPI = {
  async toNotes(item) { await wait(700); return `${item.title} (${item.date})\nSource: ${item.src}\n\n${item.body}\n\nExam hooks: ${item.tags.map(t => t.toUpperCase()).join(", ")}.`; },
  async toMCQs(item) { await wait(750); return [
    { q: `With reference to “${item.title}”, which statement is correct?`, o: ["It is outside UPSC syllabus", "It is relevant to " + item.tags.join(" & ") + " preparation", "It was withdrawn", "None"], a: 1, e: item.body.slice(0, 90) + "…" },
    { q: `The most credible primary source for “${item.topic}” updates is:`, o: ["Social media threads", `${item.src} / official releases`, "Opinion columns only", "None"], a: 1, e: "Source credibility drives CA retention." }] },
  async toFlashcards(item) { await wait(700); return [
    { f: `${item.title} — why does UPSC care?`, b: item.body.slice(0, 110) + "…" },
    { f: `One Prelims fact to store from ${item.date}?`, b: "The headline number/name + the body that announced it." },
    { f: `Mains link for “${item.topic}”?`, b: "Use as a current-affairs hook in GS-2/GS-3 introductions." }] }
};

/* ---------- daily brief (#85) ---------- */
$("#brief-out").innerHTML = `<ul class="brief-list">
  <li><span class="tag tag-pre">Prelims</span> MPC holds repo at 5.5% — revise the LAF corridor today.</li>
  <li><span class="tag tag-mains">Mains</span> ONEE report: prepare federalism arguments (GS-2) before Friday answer.</li>
  <li><span class="tag tag-essay">Essay</span> Collect 2 quotes on cooperative federalism from today's editorials.</li>
  <li><span class="tag tag-rev">Revise</span> September digest due — queue it from the Monthly Revision panel.</li></ul>`;

/* ---------- feed (#86 + relevance #87/88/89 + search #232) ---------- */
let rel = "", query = "";
const TAG_META = { pre: ["tag-pre", "Prelims #87"], mains: ["tag-mains", "Mains #88"], essay: ["tag-essay", "Essay #89"] };
function renderFeed() {
  const list = ITEMS.filter(i => (!rel || i.tags.includes(rel)) &&
    (!query || (i.title + " " + i.body + " " + i.topic).toLowerCase().includes(query)));
  const feed = $("#feed");
  if (!list.length) { feed.innerHTML = `<div class="empty">No current-affairs items match — clear the search or relevance filter.</div>`; return; }
  feed.innerHTML = list.map(i => `<article class="item" data-id="${i.id}">
    <div class="meta"><strong class="small" style="color:var(--muted)">${i.date}</strong> · <span class="small" style="color:var(--muted)">${esc(i.src)}</span>
      ${i.tags.map(t => `<span class="tag ${TAG_META[t][0]}">${TAG_META[t][1].split(" ")[0]}</span>`).join("")}</div>
    <h3>${esc(i.title)}</h3><p>${esc(i.body)}</p>
    <div class="item-actions">
      <button class="mini-btn" data-act="notes" data-id="${i.id}" type="button">📝 → Notes <span class="fid">#91</span></button>
      <button class="mini-btn" data-act="mcq" data-id="${i.id}" type="button">🧩 → MCQs <span class="fid">#92</span></button>
      <button class="mini-btn" data-act="cards" data-id="${i.id}" type="button">🃏 → Flashcards <span class="fid">#93</span></button>
    </div>
    <div class="item-out" data-out="${i.id}" hidden></div></article>`).join("");
  feed.querySelectorAll("[data-act]").forEach(b => b.addEventListener("click", async () => {
    const item = ITEMS.find(x => x.id === b.dataset.id), out = feed.querySelector(`[data-out="${item.id}"]`);
    out.hidden = false;
    if (b.dataset.act === "notes") {
      out.innerHTML = `<div class="empty" style="display:flex;gap:9px;justify-content:center;align-items:center"><span class="spinner"></span> Drafting note…</div>`;
      const txt = await CaAPI.toNotes(item);
      const notes = JSON.parse(localStorage.getItem("uza_ca_notes_v1") || "[]");
      notes.push({ t: new Date().toISOString(), text: txt });
      localStorage.setItem("uza_ca_notes_v1", JSON.stringify(notes));
      out.innerHTML = `<pre style="white-space:pre-wrap;font-family:var(--fb);font-size:.83rem;background:#fff;border:1px solid var(--line);border-radius:9px;padding:12px">${esc(txt)}</pre>
        <p class="muted small" style="margin-top:6px">Saved to the Smart Notes bridge (<a class="text-link" href="notes.html">open Notes</a>) ✓</p>`;
      toast("Note created & saved (#91) ✓");
    }
    if (b.dataset.act === "mcq") {
      out.innerHTML = `<div class="empty" style="display:flex;gap:9px;justify-content:center;align-items:center"><span class="spinner"></span> Generating MCQs…</div>`;
      const qs = await CaAPI.toMCQs(item);
      out.innerHTML = qs.map((q, qi) => `<div class="quiz-q" data-q="${qi}"><strong>Q${qi + 1}. ${esc(q.q)}</strong>
        <fieldset>${q.o.map((o, oi) => `<label><input type="radio" name="x${item.id}${qi}" value="${oi}">${esc(o)}</label>`).join("")}</fieldset>
        <button class="mini-btn" data-c="${qi}" type="button">Check</button><p class="small" data-e="${qi}" hidden style="margin-top:6px;color:var(--muted)"></p></div>`).join("");
      out.querySelectorAll("[data-c]").forEach(cb => cb.addEventListener("click", () => {
        const qi = cb.dataset.c, sel = out.querySelector(`input[name="x${item.id}${qi}"]:checked`);
        if (!sel) { toast("Pick an option first.", true); return; }
        const box = cb.closest(".quiz-q"), right = +sel.value === qs[qi].a;
        box.classList.add(right ? "correct" : "wrong");
        box.querySelector(`[data-e="${qi}"]`).hidden = false;
        box.querySelector(`[data-e="${qi}"]`).textContent = (right ? "✅ Correct. " : `❌ Correct: option ${qs[qi].a + 1}. `) + qs[qi].e;
        cb.disabled = true;
      }));
      toast("MCQs generated from this item (#92) ✓");
    }
    if (b.dataset.act === "cards") {
      out.innerHTML = `<div class="empty" style="display:flex;gap:9px;justify-content:center;align-items:center"><span class="spinner"></span> Making flashcards…</div>`;
      const cards = await CaAPI.toFlashcards(item);
      out.innerHTML = cards.map((c, ci) => `<div class="quiz-q" style="cursor:pointer" data-flip="${ci}" role="button" tabindex="0">
        <strong>Card ${ci + 1}:</strong> ${esc(c.f)}<p class="small" style="margin-top:6px;color:var(--muted)" hidden>${esc(c.b)}</p>
        <span class="muted small">tap to reveal</span></div>`).join("");
      out.querySelectorAll("[data-flip]").forEach(f => {
        const reveal = () => { f.querySelector("p").hidden = false; f.querySelector(".muted").remove(); };
        f.addEventListener("click", reveal);
        f.addEventListener("keydown", e => { if (e.key === "Enter") reveal(); });
      });
      toast("Flashcards ready (#93) ✓");
    }
  }));
}
document.querySelectorAll(".rel-btn").forEach(b => b.addEventListener("click", () => {
  document.querySelectorAll(".rel-btn").forEach(x => x.classList.toggle("active", x === b));
  rel = b.dataset.rel; renderFeed();
}));
$("#ca-search").addEventListener("input", e => { query = e.target.value.trim().toLowerCase(); renderFeed(); });

/* ---------- quiz (#90) ---------- */
function renderQuiz() {
  const out = $("#quiz-out"), today = new Date().toDateString();
  if (S.quizDay === today) { out.innerHTML = `<div class="done-note">✓ Today's quiz done — you scored ${S.quizScore}/5. Come back tomorrow; consistency beats intensity.</div>`; return; }
  out.innerHTML = QUIZ.map((q, i) => `<div class="quiz-q" data-i="${i}"><strong>Q${i + 1}. ${esc(q.q)}</strong>
    <fieldset>${q.o.map((o, j) => `<label><input type="radio" name="qz${i}" value="${j}">${esc(o)}</label>`).join("")}</fieldset></div>`).join("") +
    `<button class="btn btn-primary" id="quiz-submit" type="button">Submit quiz</button><p class="field-err" id="quiz-err" hidden></p>`;
  $("#quiz-submit").addEventListener("click", () => {
    let score = 0, missing = false;
    QUIZ.forEach((q, i) => {
      const sel = out.querySelector(`input[name="qz${i}"]:checked`), box = out.querySelector(`[data-i="${i}"]`);
      if (!sel) { missing = true; return; }
      const right = +sel.value === q.a; if (right) score++;
      box.classList.add(right ? "correct" : "wrong");
      box.querySelectorAll("input").forEach(r => r.disabled = true);
    });
    if (missing) { const e = $("#quiz-err"); e.hidden = false; e.textContent = "Answer every question before submitting."; return; }
    S.quizDay = today; S.quizScore = score; save();
    out.insertAdjacentHTML("afterbegin", `<div class="done-note">Score: ${score}/5 — ${score >= 4 ? "excellent CA retention" : score >= 2 ? "solid; the misses go to your revision queue" : "the misses are now queued for revision"} ✓</div>`);
    $("#quiz-submit").remove();
    toast("Quiz saved — one per day, like the real habit.");
  });
}

/* ---------- timeline (#95) ---------- */
$("#timeline").innerHTML = TIMELINE.map(([d, t]) => `<li><span class="tl-date">${d}</span><br>${esc(t)}</li>`).join("");

/* ---------- monthly revision queue (#94) ---------- */
$("#queue-month").addEventListener("click", () => {
  let rev = []; try { rev = JSON.parse(localStorage.getItem("uza_revision_v1")).queue || []; } catch {}
  if (rev.some(i => i.t === "October 2026 CA digest")) { toast("October digest is already in the Revision Center queue.", true); return; }
  try {
    const store = JSON.parse(localStorage.getItem("uza_revision_v1")) || {};
    store.queue = store.queue || [];
    store.queue.push({ id: "ca-oct", t: "October 2026 CA digest", sub: "Current Affairs", step: 0, due: Date.now() + 864e5, mem: 45, w: 2, cad: "monthly", src: "#94" });
    localStorage.setItem("uza_revision_v1", JSON.stringify(store));
    toast("Queued — Revision Center will schedule it (1→3→7→15→30) ✓");
  } catch { toast("Could not reach the Revision queue storage.", true); }
});

document.addEventListener("DOMContentLoaded", () => { renderFeed(); renderQuiz(); });
