"use strict";
/* UPSC ZONE AI — notes.js
   Features: #18 #19 #20 #21 #22 #29 #30 #31 · NotesAPI isolated & API-ready. */
const LS = "uza_notes_v1";
const $ = s => document.querySelector(s);
const wait = ms => new Promise(r => setTimeout(r, ms));
const esc = s => { const d = document.createElement("div"); d.textContent = s; return d.innerHTML; };
const uid = () => "n" + Math.random().toString(36).slice(2, 9);
function toast(m, err) { const t = $("#toast"); t.textContent = m; t.hidden = false; clearTimeout(toast._t); toast._t = setTimeout(() => t.hidden = true, 3000); }

/* ---------- seed data ---------- */
const SEED = [
  { id: "n1", type: "ai", title: "Monetary Policy — MPC Framework",
    body: "MPC: 6 members (3 RBI + 3 Govt), chaired by RBI Governor.\nTarget: 4% CPI ± 2% (RBI Act, amended 2016).\nKey rate: repo; corridor floor = SDF, ceiling = MSF.\nMeetings: minimum 4/year; decisions by majority, Governor has casting vote.\nPrelims traps: 'MPC target set by RBI alone' ✗ (Central Govt in consultation with RBI).",
    created: "2026-10-02" },
  { id: "n2", type: "personal", title: "My Polity traps",
    body: "1) Money Bill: RS can only delay 14 days — never amend.\n2) Art 32 cannot be refused; 226 is discretionary.\n3) Governor's ordinance power: same force as an Act, but must be laid before the legislature.",
    created: "2026-10-04" },
  { id: "n3", type: "ai", title: "Indian Monsoon — One Topic Summary",
    body: "SW monsoon June–Sept: ~75% of annual rainfall.\nBranches: Arabian Sea + Bay of Bengal; Western Ghats = orographic rainfall.\nOnset: Kerala ~1 June. Driven by ITCZ shift + Tibetan plateau heating.\nENSO: El Niño weakens monsoon; La Niña strengthens; IOD can offset ENSO.\nMains link: agriculture dependence (~52% unirrigated) → GS-3.",
    created: "2026-10-05" }
];

/* ---------- API-ready layer ---------- */
const NotesAPI = {
  async generateNote(topic) {           // POST /api/notes/ai-generate
    await wait(900);
    return { id: uid(), type: "ai", title: topic, created: new Date().toISOString().slice(0, 10),
      body: `${topic} — AI-generated study note (demo model)\n\nDefinition & core idea: ${topic} is framed here with its constitutional / institutional basis and why UPSC asks it.\nKey facts to memorise:\n• 3 anchor facts UPSC repeats on ${topic}.\n• One committee/report reference for Mains value-add.\n• One current-affairs hook from the last 12 months.\nPrelims angle: statement-based traps around definitions.\nMains angle: link ${topic} to GS-2 governance and GS-1 context.\nNext step: convert this note to MCQs and flashcards below.` };
  },
  async toMCQs(note) {                  // POST /api/notes/to-mcqs
    await wait(850);
    const base = [
      { q: `Which statement about “${note.title}” is CORRECT?`, o: ["It is a purely state subject", "It has a constitutional/institutional basis UPSC loves to test", "It was removed by the 42nd Amendment", "None of the above"], a: 1,
        e: "Anchor fact: UPSC tests the institutional basis first. See your note's 'Key facts' section." },
      { q: `Consider the statements about “${note.title}”:\n1. It appears in recent current affairs.\n2. Committees/reports exist on it.\nWhich is/are correct?`, o: ["1 only", "2 only", "Both 1 and 2", "Neither"], a: 2,
        e: "Statement-format drill: both hooks are real — this is how Prelims wraps static + dynamic." },
      { q: `For Mains, “${note.title}” is BEST linked to:`, o: ["GS-1 art & culture only", "GS-2/GS-3 governance-economy context", "Essay only", "Optional only"], a: 1,
        e: "Your note flags the GS-2/GS-3 linkage — use it as a value-add paragraph." }
    ];
    return base;
  },
  async toFlashcards(note) {            // POST /api/notes/to-flashcards
    await wait(800);
    return [
      { f: `Core idea of “${note.title}”?`, b: note.body.split("\n").filter(Boolean)[1] || "See the definition line in your note." },
      { f: `One Prelims trap on “${note.title}”?`, b: "Statement-based options around definitions — the extreme words (only/never) are usually wrong." },
      { f: `One Mains value-add on “${note.title}”?`, b: "Cite the linked committee/report + a 12-month current-affairs hook." },
      { f: `Where does “${note.title}” fit in GS?`, b: "GS-2 governance / GS-3 economy context; also essay fodder." }
    ];
  },
  async toRevisionPlan(note) {          // POST /api/notes/to-revision-plan
    await wait(700);
    const day = n => new Date(Date.now() + n * 864e5).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    return [
      { when: day(1), what: `First recall: 5 flashcards on “${note.title}”` },
      { when: day(3), what: `MCQ drill (3 Qs) on “${note.title}”` },
      { when: day(7), what: `5-minute quick revision of “${note.title}”` }
    ];
  }
};

/* ---------- state ---------- */
let S = {}; try { S = JSON.parse(localStorage.getItem(LS)) || {}; } catch {}
if (!S.notes) { S.notes = SEED; save(); }
S.cards = S.cards || []; S.plans = S.plans || [];
let selectedId = null, quickTimer = null, cardIdx = 0;
const save = () => localStorage.setItem(LS, JSON.stringify(S));

/* ---------- list (#18 #20) ---------- */
function renderList() {
  const q = $("#nt-search").value.trim().toLowerCase(), f = $("#nt-filter").value;
  const list = S.notes.filter(n => (f === "all" || n.type === f) && n.title.toLowerCase().includes(q));
  const ul = $("#note-list");
  if (!list.length) { ul.innerHTML = `<li class="empty" style="cursor:default">No notes match — adjust search/filter or generate one.</li>`; return; }
  ul.innerHTML = list.map(n => `<li data-id="${n.id}" class="${n.id === selectedId ? "active" : ""}" tabindex="0" role="button" aria-pressed="${n.id === selectedId}">
    <span class="nt-title"><span class="type-tag ${n.type}">${n.type}</span>${esc(n.title)}</span>
    <span class="nt-meta">${n.created}${n.body ? " · " + n.body.split("\n")[0].slice(0, 46) + "…" : ""}</span></li>`).join("");
  ul.querySelectorAll("li[data-id]").forEach(li => {
    const open = () => openNote(li.dataset.id);
    li.addEventListener("click", open);
    li.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } });
  });
}
$("#nt-search").addEventListener("input", renderList);
$("#nt-filter").addEventListener("change", renderList);

/* ---------- viewer ---------- */
function openNote(id) {
  selectedId = id;
  const n = S.notes.find(x => x.id === id);
  $("#view-actions").hidden = false;
  $("#note-view").innerHTML = `<div class="note-meta-row"><span class="type-tag ${n.type}">${n.type}</span><span>${n.created}</span><span>${n.type === "personal" ? "editable — click text to edit (#20)" : "AI-generated (#19)"}</span></div>
    <h3 style="font-family:var(--fd);color:var(--navy);margin:8px 0">${esc(n.title)}</h3>
    <div class="note-body" id="note-body" ${n.type === "personal" ? 'contenteditable="true"' : ""} ${n.type === "personal" ? 'role="textbox" aria-label="Editable note body" tabindex="0"' : ""}>${esc(n.body)}</div>`;
  if (n.type === "personal") {
    $("#note-body").addEventListener("blur", () => { n.body = $("#note-body").textContent; n.created = new Date().toISOString().slice(0, 10); save(); renderList(); toast("Note saved ✓"); });
  }
  renderList();
}
$("#new-note").addEventListener("click", () => {
  const n = { id: uid(), type: "personal", title: "Untitled personal note", body: "Start typing your note…", created: new Date().toISOString().slice(0, 10) };
  S.notes.unshift(n); save(); openNote(n.id); toast("Personal note created — edit it directly (#20).");
});
$("#gen-form").addEventListener("submit", async e => {
  e.preventDefault();
  const inp = $("#gen-topic"), err = $("#gen-err");
  if (inp.value.trim().length < 3) { err.textContent = "Give the AI a real topic (3+ characters)."; err.hidden = false; return; }
  err.hidden = true;
  $("#note-list").insertAdjacentHTML("afterbegin", `<li class="loading"><span class="spinner"></span> AI drafting note…</li>`);
  try {
    const n = await NotesAPI.generateNote(inp.value.trim());
    S.notes.unshift(n); save(); inp.value = ""; openNote(n.id); toast("AI note generated (#19) ✓");
  } catch { toast("Generation failed — retry.", true); }
  renderList();
});
$("#del-note").addEventListener("click", () => {
  if (!selectedId) return;
  S.notes = S.notes.filter(n => n.id !== selectedId); save();
  selectedId = null; $("#view-actions").hidden = true;
  $("#note-view").innerHTML = `<div class="empty">🗑 Note deleted. Select another.</div>`;
  renderList(); toast("Note removed.");
});

/* ---------- MCQs (#29) ---------- */
$("#to-mcq").addEventListener("click", async () => {
  const n = S.notes.find(x => x.id === selectedId); if (!n) return;
  $("#mcq-out").innerHTML = `<div class="loading"><span class="spinner"></span> Generating MCQs from this note…</div>`;
  const qs = await NotesAPI.toMCQs(n);
  $("#mcq-out").innerHTML = qs.map((q, i) => `<div class="mcq" data-i="${i}"><strong>Q${i + 1}. ${esc(q.q).replace(/\n/g, "<br>")}</strong>
    <fieldset><legend class="sr-only">Options for question ${i + 1}</legend>${q.o.map((o, j) => `<label><input type="radio" name="mcq${i}" value="${j}"><span>${esc(o)}</span></label>`).join("")}</fieldset>
    <button class="btn btn-ghost btn-sm check-btn" type="button" data-i="${i}">Check answer</button><div class="exp" hidden></div></div>`).join("");
  $("#mcq-out").querySelectorAll(".check-btn").forEach(b => b.addEventListener("click", () => {
    const i = +b.dataset.i, sel = document.querySelector(`input[name="mcq${i}"]:checked`);
    const box = b.closest(".mcq");
    if (!sel) { toast("Pick an option first.", true); return; }
    const right = +sel.value === qs[i].a;
    box.classList.add(right ? "correct" : "wrong");
    box.querySelector(".exp").hidden = false;
    box.querySelector(".exp").innerHTML = `${right ? "✅ Correct." : "❌ Not quite. Correct: option " + (qs[i].a + 1) + "."} ${esc(qs[i].e)}`;
    b.disabled = true;
  }));
  toast("3 MCQs generated from note (#29) ✓");
});

/* ---------- Flashcards (#30 #22) + quick mode (#21) ---------- */
$("#to-cards").addEventListener("click", async () => {
  const n = S.notes.find(x => x.id === selectedId); if (!n) return;
  $("#cards-out").innerHTML = `<div class="loading"><span class="spinner"></span> Creating AI flashcards…</div>`;
  const cards = await NotesAPI.toFlashcards(n);
  S.cards = cards; cardIdx = 0; save(); renderCards(); toast("4 flashcards ready (#30) ✓");
});
function renderCards() {
  if (!S.cards.length) return;
  const c = S.cards[cardIdx];
  $("#cards-out").innerHTML = `<div class="card-stack">
    ${quickTimer ? `<div class="quick-banner" role="status">⚡ Quick revision mode — auto-advancing every 6s (#21)</div>` : ""}
    <div class="flash ${""}" id="flash-card" role="button" tabindex="0" aria-label="Flashcard ${cardIdx + 1} of ${S.cards.length}. Press Enter to flip.">
      <div class="flash-inner"><div class="flash-face flash-front">${esc(c.f)}</div><div class="flash-face flash-back">${esc(c.b)}</div></div></div>
    <div class="card-nav">
      <button class="btn btn-ghost btn-sm" id="prev-card" type="button" ${cardIdx === 0 ? "disabled" : ""}>← Prev</button>
      <span class="muted small">Card ${cardIdx + 1}/${S.cards.length} · click/Enter to flip (#22)</span>
      <button class="btn btn-ghost btn-sm" id="next-card" type="button" ${cardIdx === S.cards.length - 1 ? "disabled" : ""}>Next →</button>
    </div></div>`;
  const fc = $("#flash-card");
  const flip = () => fc.classList.toggle("flipped");
  fc.addEventListener("click", flip);
  fc.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); flip(); } });
  $("#prev-card").addEventListener("click", () => { if (cardIdx > 0) { cardIdx--; renderCards(); } });
  $("#next-card").addEventListener("click", () => { if (cardIdx < S.cards.length - 1) { cardIdx++; renderCards(); } });
}
$("#quick-mode").addEventListener("click", () => {
  if (!S.cards.length) { toast("Generate flashcards from a note first.", true); return; }
  cardIdx = 0; renderCards();
  quickTimer = setInterval(() => {
    cardIdx = (cardIdx + 1) % S.cards.length; renderCards();
  }, 6000);
  $("#quick-mode").hidden = true; $("#quick-stop").hidden = false;
});
$("#quick-stop").addEventListener("click", () => {
  clearInterval(quickTimer); quickTimer = null;
  $("#quick-mode").hidden = false; $("#quick-stop").hidden = true;
  renderCards(); toast("Quick revision complete — cards reviewed.");
});

/* ---------- revision plan (#31) ---------- */
$("#to-plan").addEventListener("click", async () => {
  const n = S.notes.find(x => x.id === selectedId); if (!n) return;
  $("#plan-out").innerHTML = `<div class="loading"><span class="spinner"></span> Scheduling spaced revisions…</div>`;
  const plan = await NotesAPI.toRevisionPlan(n);
  S.plans = S.plans.concat(plan.map(p => ({ ...p, done: false }))); save(); renderPlans();
  toast("Revision plan created: +1 / +3 / +7 days (#31) ✓");
});
function renderPlans() {
  if (!S.plans.length) return;
  $("#plan-out").innerHTML = S.plans.map((p, i) => `<div class="plan-item" style="${p.done ? "opacity:.55" : ""}">
    <span class="when">${p.when}</span><span>${esc(p.what)}</span>
    <button class="btn btn-ghost btn-sm" data-done="${i}" type="button" style="margin-left:auto">${p.done ? "✓ Done" : "Mark done"}</button></div>`).join("");
  $("#plan-out").querySelectorAll("[data-done]").forEach(b => b.addEventListener("click", () => {
    S.plans[+b.dataset.done].done = !S.plans[+b.dataset.done].done; save(); renderPlans();
  }));
}

/* ---------- init ---------- */
document.addEventListener("DOMContentLoaded", () => {
  renderList(); renderPlans();
  if (S.cards.length) renderCards();
  if (S.notes.length) openNote(S.notes[0].id);
});
