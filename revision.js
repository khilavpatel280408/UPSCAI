"use strict";
/* UPSC ZONE AI — revision.js
   Features: #73 #74 #75 #76 #77 #78 #79 #80 #81 #82 #83 #94
   RevisionAPI isolated & API-ready. */
const LS = "uza_revision_v1";
const $ = s => document.querySelector(s);
const esc = s => { const d = document.createElement("div"); d.textContent = s; return d.innerHTML; };
const DAY = 864e5, uid = () => "r" + Math.random().toString(36).slice(2, 9);
let S = {}; try { S = JSON.parse(localStorage.getItem(LS)) || {}; } catch {}
const save = () => localStorage.setItem(LS, JSON.stringify(S));
function toast(m) { const t = $("#toast"); t.textContent = m; t.hidden = false; clearTimeout(toast._t); toast._t = setTimeout(() => t.hidden = true, 3000); }
const INTERVALS = [1, 3, 7, 15, 30]; // #73 spaced repetition
const FACTS = t => `Recall 3 anchors for “${t}”: 1) the definition/date/article, 2) one PYQ angle, 3) one current-affairs link. Say them aloud before flipping.`;

/* ---------- seed queue ---------- */
if (!S.queue) {
  const now = Date.now();
  S.queue = [
    { id: "r1", t: "Fundamental Rights: Art. 20–32", sub: "Polity", step: 2, due: now, mem: 48, w: 3, cad: "daily", src: "weak area" },
    { id: "r2", t: "Monetary Policy & RBI tools", sub: "Economy", step: 1, due: now, mem: 61, w: 2, cad: "daily", src: "test miss" },
    { id: "r3", t: "Indian Monsoon mechanism", sub: "Geography", step: 3, due: now + 2 * DAY, mem: 82, w: 2, cad: "weekly", src: "strong topic" },
    { id: "r4", t: "UN bodies & reform committees", sub: "IR", step: 0, due: now - 2 * DAY, mem: 26, w: 1, cad: "weekly", src: "forgotten" },
    { id: "r5", t: "Five-Year Plan targets", sub: "Economy", step: 0, due: now - DAY, mem: 33, w: 1, cad: "monthly", src: "forgotten" },
    { id: "r6", t: "Climate treaties: Kyoto→Paris→COP outcomes", sub: "Environment", step: 1, due: now + DAY, mem: 55, w: 2, cad: "weekly", src: "syllabus" },
    { id: "r7", t: "Parliament procedures & bills", sub: "Polity", step: 2, due: now + 3 * DAY, mem: 70, w: 2, cad: "weekly", src: "syllabus" },
    { id: "r8", t: "September 2026 CA digest", sub: "Current Affairs", step: 1, due: now + DAY, mem: 52, w: 2, cad: "monthly", src: "#94" }
  ];
  save();
}
const RevisionAPI = {
  priority(item) {                       // #83 formula
    const overdue = Math.max(0, Math.floor((Date.now() - item.due) / DAY));
    return Math.round(0.5 * (100 - item.mem) + 0.3 * Math.min(10, overdue) * 10 + 0.2 * item.w * 10);
  },
  markRevised(item) {                    // #74 rescheduling
    item.step = Math.min(item.step + 1, INTERVALS.length - 1);
    item.due = Date.now() + INTERVALS[item.step] * DAY;
    item.mem = Math.min(100, item.mem + 14);
  }
};

/* ---------- stats ---------- */
function stats() {
  const due = S.queue.filter(i => i.due <= Date.now() + DAY).length;
  const avg = Math.round(S.queue.reduce((a, i) => a + i.mem, 0) / S.queue.length);
  const today = new Date().toDateString();
  $("#rv-stats").innerHTML = `<strong>${due}</strong> due today · avg memory <strong>${avg}%</strong> <span class="fid">#81</span> · revision streak <strong>${S.streak || 4}</strong> days.`;
  if (S.lastRevDay !== today) S.revisedToday = 0;
}
function bumpStreak() {
  const today = new Date().toDateString();
  if (S.lastRevDay !== today) {
    const yesterday = new Date(Date.now() - DAY).toDateString();
    S.streak = (S.lastRevDay === yesterday) ? (S.streak || 4) + 1 : 1;
    S.lastRevDay = today; S.revisedToday = 0; save();
  }
  S.revisedToday = (S.revisedToday || 0) + 1; save();
}

/* ---------- due label ---------- */
function dueInfo(item) {
  const d = Math.round((item.due - Date.now()) / DAY);
  if (d < 0) return { cls: "over", row: "due-over", txt: `Overdue ${-d}d` };
  if (d === 0) return { cls: "today", row: "due-today", txt: "Due today" };
  return { cls: "soon", row: "due-soon", txt: `In ${d}d` };
}

/* ---------- queue render (#77/78/79 filters) ---------- */
let filter = "";
function renderQueue() {
  const list = S.queue.filter(i => !filter || i.cad === filter).sort((a, b) => RevisionAPI.priority(b) - RevisionAPI.priority(a));
  const q = $("#queue");
  if (!list.length) { q.innerHTML = `<div class="empty">Nothing in this cadence — switch tabs or add a topic above. That silence is earned.</div>`; return; }
  q.innerHTML = list.map(i => {
    const d = dueInfo(i), p = RevisionAPI.priority(i);
    return `<article class="q-row ${d.row}">
      <div class="q-main"><strong>${esc(i.t)}</strong>
        <div class="q-meta"><span class="chip sub">${i.sub}</span><span class="chip cad">${i.cad}</span>
          <span class="muted small">interval ${INTERVALS[i.step]}d</span>
          <span class="mem-mini" title="Memory ${i.mem}% (#81)"><span style="width:${i.mem}%;background:${i.mem >= 70 ? "var(--green)" : i.mem >= 45 ? "var(--saffron)" : "var(--red)"}"></span></span>
          <span class="muted small">${i.mem}%</span></div></div>
      <span class="prio" title="Revision Priority Score (#83)">P${p}</span>
      <span class="q-due ${d.cls}">${d.txt}</span>
      <div class="q-actions">
        <button class="mini-btn rev" data-rev="${i.id}" type="button">✓ Revised</button>
        <button class="mini-btn" data-snz="${i.id}" type="button" aria-label="Snooze one day">+1d</button>
        <button class="mini-btn" data-del="${i.id}" type="button" aria-label="Remove">✕</button>
      </div></article>`;
  }).join("");
  q.querySelectorAll("[data-rev]").forEach(b => b.addEventListener("click", () => {
    const it = S.queue.find(x => x.id === b.dataset.rev);
    RevisionAPI.markRevised(it); bumpStreak(); save(); renderQueue(); renderForgotten(); stats();
    toast(`“${it.t}” → next revision in ${INTERVALS[it.step]} day(s) ✓`);
  }));
  q.querySelectorAll("[data-snz]").forEach(b => b.addEventListener("click", () => {
    const it = S.queue.find(x => x.id === b.dataset.snz); it.due += DAY; save(); renderQueue();
    toast("Snoozed +1 day (priority will rise tomorrow).");
  }));
  q.querySelectorAll("[data-del]").forEach(b => b.addEventListener("click", () => {
    S.queue = S.queue.filter(x => x.id !== b.dataset.del); save(); renderQueue(); renderForgotten(); stats();
  }));
}
$$tab();
function $$tab() {
  const tabs = [...document.querySelectorAll(".tab")];
  tabs.forEach(t => t.addEventListener("click", () => {
    tabs.forEach(x => { x.classList.toggle("active", x === t); x.setAttribute("aria-selected", String(x === t)); x.tabIndex = x === t ? 0 : -1; });
    filter = t.dataset.f; renderQueue();
  }));
}

/* ---------- add topic (#74 auto-schedule) ---------- */
$("#add-btn").addEventListener("click", () => {
  const t = $("#add-t").value.trim();
  if (t.length < 3) { toast("Topic too short — give it a real name.", true); return; }
  S.queue.push({ id: uid(), t, sub: $("#add-sub").value, step: 0, due: Date.now() + DAY, mem: 50, w: 2, cad: "daily", src: "manual" });
  save(); $("#add-t").value = ""; renderQueue(); stats();
  toast("Scheduled: first revision tomorrow (#74 auto-scheduling) ✓");
});

/* ---------- forgotten topics (#82) ---------- */
function renderForgotten() {
  const fg = S.queue.filter(i => i.mem < 40);
  $("#fg-out").innerHTML = fg.length ? fg.map(i => `<div class="fg-item"><strong>${esc(i.t)}</strong>
    <p class="muted small">Memory decayed to ${i.mem}% · learned ${i.src}. Forgetting curve says: rescue within 24h.</p>
    <button class="mini-btn" data-rescue="${i.id}" type="button">🚑 Rescue revision (due now)</button></div>`).join("")
    : `<div class="empty">No forgotten topics right now — memory strength is holding.</div>`;
  $("#fg-out").querySelectorAll("[data-rescue]").forEach(b => b.addEventListener("click", () => {
    const it = S.queue.find(x => x.id === b.dataset.rescue);
    it.due = Date.now(); save(); renderQueue(); renderForgotten();
    toast(`“${it.t}” moved to the top of today's queue.`);
  }));
}

/* ---------- monthly CA (#94) ---------- */
$$mc();
function $$mc() {
  document.querySelectorAll("[data-mc]").forEach(b => b.addEventListener("click", () => {
    if (S.queue.some(i => i.t === b.dataset.mc)) { toast("Already in the queue.", true); return; }
    S.queue.push({ id: uid(), t: b.dataset.mc, sub: "Current Affairs", step: 0, due: Date.now() + DAY, mem: 45, w: 2, cad: "monthly", src: "#94" });
    save(); renderQueue(); stats(); toast("Monthly digest queued (#94) ✓");
  }));
}

/* ---------- 5-minute mode (#75) ---------- */
let fv = null;
$("#five-btn").addEventListener("click", () => {
  const due = [...S.queue].sort((a, b) => RevisionAPI.priority(b) - RevisionAPI.priority(a)).slice(0, 6);
  if (!due.length) { toast("Queue is empty — nothing to revise.", true); return; }
  fv = { cards: due, idx: 0, total: 300, perCard: 25, done: [] };
  $("#five-panel").hidden = false;
  $("#five-panel").scrollIntoView({ behavior: "smooth" });
  renderFvCard(); startFvTimers();
  toast("5-minute session started — 6 priority cards.");
});
function renderFvCard() {
  const c = fv.cards[fv.idx];
  $("#fv-front").textContent = `${c.sub}: ${c.t}`;
  $("#fv-back").textContent = FACTS(c.t);
  $("#fv-card").classList.remove("flipped");
  $("#fv-count").textContent = `card ${fv.idx + 1}/${fv.cards.length}`;
  $("#fv-bar").style.width = ((fv.idx) / fv.cards.length * 100) + "%";
  fv.cardLeft = fv.perCard;
}
function startFvTimers() {
  clearInterval(fv.t1); clearInterval(fv.t2);
  fv.t1 = setInterval(() => {
    fv.total--; $("#fv-total").textContent = `${String(Math.floor(fv.total / 60)).padStart(2, "0")}:${String(fv.total % 60).padStart(2, "0")}`;
    if (fv.total <= 0) endFive(true);
  }, 1000);
  fv.t2 = setInterval(() => {
    fv.cardLeft--;
    if (fv.cardLeft <= 0) nextFvCard();
  }, 1000);
}
function nextFvCard() {
  if (!fv.done.includes(fv.cards[fv.idx].id)) fv.done.push(fv.cards[fv.idx].id);
  if (fv.idx >= fv.cards.length - 1) { endFive(true); return; }
  fv.idx++; renderFvCard();
}
$("#fv-next").addEventListener("click", nextFvCard);
const flip = () => $("#fv-card").classList.toggle("flipped");
$("#fv-card").addEventListener("click", flip);
$("#fv-card").addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); flip(); } });
$("#fv-stop").addEventListener("click", () => endFive(false));
function endFive(completed) {
  clearInterval(fv.t1); clearInterval(fv.t2);
  fv.done.forEach(id => { const it = S.queue.find(x => x.id === id); if (it) RevisionAPI.markRevised(it); });
  bumpStreak(); save();
  $("#five-panel").hidden = true;
  renderQueue(); renderForgotten(); stats();
  toast(completed ? `Session complete — ${fv.done.length} cards revised, intervals advanced ✓` : `Session ended — ${fv.done.length} card(s) revised.`);
  fv = null;
}

/* ---------- quick mode (#76) ---------- */
$("#quick-btn").addEventListener("click", () => {
  const grid = $("#quick-grid"), on = grid.hidden;
  grid.hidden = !on;
  $("#quick-btn").setAttribute("aria-pressed", String(on));
  if (on) {
    const due = [...S.queue].sort((a, b) => RevisionAPI.priority(b) - RevisionAPI.priority(a)).slice(0, 8);
    grid.innerHTML = due.map(i => `<div class="flash" role="button" tabindex="0" aria-label="Quick card: ${esc(i.t)}">
      <div class="flash-inner"><div class="flash-face flash-front">${esc(i.sub)}: ${esc(i.t)}</div>
      <div class="flash-face flash-back">${esc(FACTS(i.t))}</div></div></div>`).join("");
    grid.querySelectorAll(".flash").forEach(f => {
      const fl = () => f.classList.toggle("flipped");
      f.addEventListener("click", fl);
      f.addEventListener("keydown", e => { if (e.key === "Enter") fl(); });
    });
  }
});

document.addEventListener("DOMContentLoaded", () => { stats(); renderQueue(); renderForgotten(); });
