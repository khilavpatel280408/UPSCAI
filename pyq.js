"use strict";
/* UPSC ZONE AI — pyq.js
   Features: #39 PYQ Practice · #40 PYQ Intelligence · #231 Search PYQs
   PyqAPI isolated & API-ready (swap search for GET /api/pyqs?q=). */
const LS = "uza_pyq_v1";
const $ = s => document.querySelector(s);
const esc = s => { const d = document.createElement("div"); d.textContent = s; return d.innerHTML; };
let S = {}; try { S = JSON.parse(localStorage.getItem(LS)) || {}; } catch {}
S.done = S.done || []; S.picks = S.picks || [];
const save = () => localStorage.setItem(LS, JSON.stringify(S));
function toast(m) { const t = $("#toast"); t.textContent = m; t.hidden = false; clearTimeout(toast._t); toast._t = setTimeout(() => t.hidden = true, 2600); }

const PYQS = [
  { id: "p1", year: 2023, sub: "Polity", q: "Which writ is issued to restrain a person from holding a public office they are not entitled to?", o: ["Mandamus", "Quo-warranto", "Certiorari", "Prohibition"], a: 1, exp: "Quo-warranto ('by what authority'). Repeated frame in 2014, 2019, 2023." },
  { id: "p2", year: 2021, sub: "Geography", q: "The shifting of the ITCZ towards the Indian subcontinent in summer primarily causes:", o: ["Winter rainfall", "Southwest monsoon onset", "Retreating cyclones", "Western disturbances"], a: 1, exp: "Northward ITCZ shift draws the SW monsoon flow." },
  { id: "p3", year: 2020, sub: "Economy", q: "With reference to the Monetary Policy Committee, which is correct?", o: ["It has 4 members", "Target is set by RBI alone", "Governor has a casting vote", "It meets monthly by law"], a: 2, exp: "6 members; Governor holds casting vote; minimum 4 meetings/year." },
  { id: "p4", year: 2019, sub: "Geography", q: "El Niño's usual influence on the Indian summer monsoon is:", o: ["Positive", "Negative", "Neutral", "Only regional"], a: 1, exp: "El Niño weakens monsoon; IOD can offset it." },
  { id: "p5", year: 2022, sub: "Polity", q: "A Money Bill can be introduced in the Rajya Sabha:", o: ["With Speaker's permission", "Never", "After 14 days", "Only in joint sitting"], a: 1, exp: "Only in Lok Sabha, on President's recommendation (Art 110)." },
  { id: "p6", year: 2018, sub: "History", q: "The Swadeshi Movement was triggered by:", o: ["Rowlatt Act", "Partition of Bengal", "Jallianwala Bagh", "Simon Commission"], a: 1, exp: "Curzon's 1905 Partition of Bengal." },
  { id: "p7", year: 2024, sub: "Environment", q: "'Common But Differentiated Responsibilities' is a principle of:", o: ["WTO trade rules", "UNFCCC climate framework", "UNCLOS", "WHO regulations"], a: 1, exp: "CBDR anchors climate equity debates — perennial Prelims frame." },
  { id: "p8", year: 2021, sub: "Economy", q: "Which forms the floor of the current LAF corridor?", o: ["Repo", "SDF", "MSF", "CRR"], a: 1, exp: "Standing Deposit Facility became the corridor floor (2022 framework)." }
];
const PyqAPI = {
  async search(q, year, sub) {           // GET /api/pyqs/search
    await wait ? 0 : 0;
    return PYQS.filter(p => (year == 0 || p.year >= +year) && (!sub || p.sub === sub) && (!q || (p.q + " " + p.exp + " " + p.sub).toLowerCase().includes(q.toLowerCase())));
  }
};

/* ---------- render ---------- */
function render(list) {
  $("#pyq-count").textContent = `${list.length} question(s) found · ${S.done.length} attempted ever · demo bank.`;
  if (!list.length) { $("#pyq-list").innerHTML = `<div class="empty">No PYQs match those filters — try clearing the search or widening the year range.</div>`; return; }
  $("#pyq-list").innerHTML = list.map(p => {
    const picked = S.picks.includes(p.id);
    return `<article class="pyq-card ${S.done.includes(p.id) ? "attempted" : ""}" data-id="${p.id}">
      <div class="pyq-head"><span class="year-tag">${p.year}</span><span class="sub-tag">${p.sub}</span>
        ${S.done.includes(p.id) ? '<span class="sub-tag" style="background:#e8f3ec;color:var(--green)">attempted ✓</span>' : ""}
        <label class="pick"><input type="checkbox" data-pick="${p.id}" ${picked ? "checked" : ""}> add to set</label></div>
      <p class="pyq-q">${esc(p.q)}</p>
      <div class="pyq-opts" role="radiogroup" aria-label="Options">${p.o.map((o, i) => `<label><input type="radio" name="pyq-${p.id}" value="${i}"><span>${String.fromCharCode(65 + i)}. ${esc(o)}</span></label>`).join("")}</div>
      <button class="btn btn-dark btn-sm" data-check="${p.id}" type="button">Check answer (#39)</button>
      <div class="pyq-exp" hidden></div>
    </article>`;
  }).join("");
  $("#pyq-list").querySelectorAll("[data-check]").forEach(b => b.addEventListener("click", () => {
    const id = b.dataset.check, card = b.closest(".pyq-card"), p = PYQS.find(x => x.id === id);
    const sel = card.querySelector(`input[name="pyq-${id}"]:checked`);
    if (!sel) { toast("Pick an option first.", true); return; }
    const right = +sel.value === p.a;
    card.classList.add(right ? "correct" : "wrong");
    const exp = card.querySelector(".pyq-exp");
    exp.hidden = false;
    exp.innerHTML = `${right ? "✅ Correct." : "❌ Correct answer: option " + (p.a + 1) + "."} ${esc(p.exp)}<br><em class="small muted">Logged to your practice record.</em>`;
    if (!S.done.includes(id)) S.done.push(id); save();
    b.disabled = true; b.textContent = "Checked ✓";
    toast(right ? "PYQ solved ✓" : "Logged — the twin adds this frame to your drills.");
  }));
  $("#pyq-list").querySelectorAll("[data-pick]").forEach(c => c.addEventListener("change", () => {
    const id = c.dataset.pick;
    if (c.checked && !S.picks.includes(id)) S.picks.push(id);
    if (!c.checked) S.picks = S.picks.filter(x => x !== id);
    save(); updateAttemptBtn();
  }));
}
function updateAttemptBtn() {
  const b = $("#attempt-set");
  b.disabled = !S.picks.length;
  b.textContent = `Attempt selected as test (${S.picks.length})`;
}
$("#attempt-set").addEventListener("click", () => {
  const qs = PYQS.filter(p => S.picks.includes(p.id)).map(p => ({ q: p.q, o: p.o, a: p.a }));
  localStorage.setItem("uza_generated_test", JSON.stringify({ topic: "PYQ Selection", diff: "PYQ", qs }));
  location.href = "test-interface.html?mode=custom";
});

/* ---------- search events ---------- */
function runSearch() { PyqAPI.search($("#pyq-q").value.trim(), $("#f-year").value, $("#f-sub").value).then(render); }
$("#pyq-search").addEventListener("click", runSearch);
$("#pyq-q").addEventListener("keydown", e => { if (e.key === "Enter") runSearch(); });
$("#f-year").addEventListener("change", runSearch);
$("#f-sub").addEventListener("change", runSearch);

/* ---------- intelligence bars ---------- */
$("#freq-bars").innerHTML = Object.entries(
  PYQS.reduce((m, p) => (m[p.sub] = (m[p.sub] || 0) + 1, m), {})
).map(([sub, n]) => `<div class="freq-row"><span>${sub}</span><span class="freq-bar"><span style="width:${n / PYQS.length * 100}%"></span></span><strong>${n}</strong></div>`).join("");

document.addEventListener("DOMContentLoaded", () => { runSearch(); updateAttemptBtn(); });
