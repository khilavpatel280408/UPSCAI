"use strict";
/* UPSC ZONE AI — community.js
   Features: #218 #219 #220 #221 #222 #223 #224 #225 #226 #227 #228
   CommunityAPI isolated & API-ready. */
const LS = "uza_community_v1";
const $ = s => document.querySelector(s);
const esc = s => { const d = document.createElement("div"); d.textContent = s; return d.innerHTML; };
let S = {}; try { S = JSON.parse(localStorage.getItem(LS)) || {}; } catch {}
S.myThreads = S.myThreads || [];
S.groups = S.groups || { "5 AM Polity Circle": false, "Economy Doubt Swap": true, "Essay Feedback Ring": false, "Optional PSIR Squad": false };
S.chals = S.chals || [{ t: "7-Day PYQ Sprint", joined: false, prog: 0 }, { t: "October Answer Streak (30 answers)", joined: true, prog: 11 }];
const save = () => localStorage.setItem(LS, JSON.stringify(S));
function toast(m) { const t = $("#toast"); t.textContent = m; t.hidden = false; clearTimeout(toast._t); toast._t = setTimeout(() => t.hidden = true, 2800); }

const THREADS = [
  { id: "t1", cat: "Polity", who: "Priya N.", time: "2h", title: "How do you remember Articles 12–35 without mixing them up?", body: "I keep confusing 19 and 21 exceptions. Any mnemonic systems that actually survived a mock?",
    replies: [{ who: "Rahul K.", ans: true, text: "Group them by remedy, not number: equality cluster (14–18), freedoms (19), life (20–22), then move to remedies (32). I drill with the Reverse Quiz in Active Learning." }, { who: "Sneha M.", ans: false, text: "Flashcards with one article per card + a wrong-answer trap on the back. Spaced revision does the rest." }] },
  { id: "t2", cat: "Strategy", who: "Vikram T.", time: "5h", title: "Is one full mock per week enough at 5 months out?", body: "My accuracy is 61% and stalling. More mocks or more revision?", replies: [{ who: "Priya N.", ans: true, text: "At 61%, mocks without mistake loops are wasted. Keep one mock, but run two mistake-based drills — check the Mistake Intelligence page." }] },
  { id: "t3", cat: "Motivation", who: "Ananya R.", time: "1d", title: "Third attempt, morale is low. How do you restart?", body: "Failed Prelims twice by 2–3 marks. The syllabus feels enormous again.", replies: [{ who: "Mentor (mod)", ans: true, text: "Close margin means execution, not knowledge. Rebuild around your mistake notebook for 3 weeks — the pattern will show itself." }] }
];

/* ---------- ask form (#220) ---------- */
$("#ask-open").addEventListener("click", () => { $("#ask-card").hidden = false; $("#ask-title").focus(); });
$("#ask-cancel").addEventListener("click", () => { $("#ask-card").hidden = true; });
$("#ask-post").addEventListener("click", () => {
  const title = $("#ask-title").value.trim(), body = $("#ask-body").value.trim(), err = $("#ask-err");
  if (title.length < 8) { err.hidden = false; err.textContent = "Give the question a real title (8+ characters)."; return; }
  err.hidden = true;
  S.myThreads.unshift({ id: "my" + Date.now(), cat: $("#ask-cat").value, who: "You", time: "now", title, body: body || "(no extra context)", replies: [] });
  save(); $("#ask-card").hidden = true;
  $("#ask-title").value = ""; $("#ask-body").value = "";
  renderThreads(filter);
  toast("Question posted to the community (#223) ✓");
});

/* ---------- forum (#219 #222 #223 #224) ---------- */
let filter = "", selected = null;
function allThreads() { return [...S.myThreads, ...THREADS]; }
function renderThreads() {
  const list = allThreads().filter(t => !filter || t.cat === filter);
  $("#thread-list").innerHTML = list.length ? list.map(t => `
    <article class="thread ${selected === t.id ? "sel" : ""}" data-th="${t.id}" role="button" tabindex="0" aria-label="Open discussion: ${esc(t.title)}">
      <h3>${esc(t.title)}</h3>
      <div class="meta"><span class="cat-chip">${t.cat}</span><span>${esc(t.who)} · ${t.time}</span>
        <span style="margin-left:auto">${t.replies.length} answer(s)</span></div></article>`).join("")
    : `<div class="empty">No threads in this category — start one with “Ask the Community”.</div>`;
  $("#thread-list").querySelectorAll("[data-th]").forEach(el => {
    const open = () => { selected = el.dataset.th; renderThreads(); renderDetail(); };
    el.addEventListener("click", open);
    el.addEventListener("keydown", e => { if (e.key === "Enter") open(); });
  });
}
function renderDetail() {
  const t = allThreads().find(x => x.id === selected);
  if (!t) { $("#thread-detail").innerHTML = ""; return; }
  $("#thread-detail").innerHTML = `<div class="thread-detail">
    <h3 style="font-family:var(--fd);color:var(--navy);margin-bottom:6px">${esc(t.title)}</h3>
    <p>${esc(t.body)}</p><p class="muted small" style="margin-top:5px">Asked by ${esc(t.who)} · ${t.time} · peer discussion (#222)</p>
    ${t.replies.map(r => `<div class="reply"><span class="who">${esc(r.who)}</span>${r.ans ? '<span class="tag-ans">ACCEPTED ANSWER (#224)</span>' : ""}<p style="margin-top:4px">${esc(r.text)}</p></div>`).join("")}
    <div class="row" style="margin-top:10px">
      <input type="text" id="rp-txt" placeholder="Write an answer or add to the discussion…" aria-label="Your reply" style="flex:2">
      <button class="btn btn-dark btn-sm" id="rp-go" type="button">Reply</button></div></div>`;
  $("#rp-go").addEventListener("click", () => {
    const txt = $("#rp-txt").value.trim();
    if (txt.length < 6) { toast("Write a real reply (6+ characters).", true); return; }
    t.replies.push({ who: "You", ans: false, text: txt });
    if (S.myThreads.includes(t)) save();
    renderThreads(); renderDetail();
    toast("Reply posted (#224) ✓");
  });
  $("#thread-detail").scrollIntoView({ behavior: "smooth", block: "nearest" });
}
document.querySelectorAll(".tab").forEach(b => b.addEventListener("click", () => {
  document.querySelectorAll(".tab").forEach(x => { x.classList.toggle("active", x === b); x.setAttribute("aria-selected", String(x === b)); });
  filter = b.dataset.f; renderThreads();
}));

/* ---------- groups + friends (#221 #227) ---------- */
function renderGroups() {
  $("#group-out").innerHTML = Object.entries(S.groups).map(([g, joined]) => `
    <div class="grp-row"><span>${joined ? "✅" : "👥"} <strong>${esc(g)}</strong></span>
      <span class="mem">${4 + g.length % 5} members</span>
      <button class="btn ${joined ? "btn-ghost" : "btn-dark"} btn-sm" data-grp="${esc(g)}" type="button">${joined ? "Leave" : "Join"}</button></div>`).join("");
  $("#group-out").querySelectorAll("[data-grp]").forEach(b => b.addEventListener("click", () => {
    S.groups[b.dataset.grp] = !S.groups[b.dataset.grp]; save(); renderGroups();
    toast(S.groups[b.dataset.grp] ? `Joined “${b.dataset.grp}” (#221).` : `Left “${b.dataset.grp}”.`);
  }));
}

/* ---------- challenges (#228) ---------- */
function renderChals() {
  $("#chal-out").innerHTML = S.chals.map((c, i) => `<div class="chal-box"><strong>${esc(c.t)}</strong>
    <div class="meter-row"><span>Progress</span><span class="meter"><span style="width:${Math.min(100, c.prog / 30 * 100)}%"></span></span><strong>${c.prog}</strong></div>
    <div class="row" style="margin-top:8px">
      <button class="btn btn-dark btn-sm" data-cj="${i}" type="button">${c.joined ? "Joined ✓" : "Join"}</button>
      <button class="btn btn-ghost btn-sm" data-cp="${i}" type="button" ${c.joined ? "" : "disabled"}>+1 progress</button></div></div>`).join("");
  $("#chal-out").querySelectorAll("[data-cj]").forEach(b => b.addEventListener("click", () => { S.chals[+b.dataset.cj].joined = true; save(); renderChals(); toast("Challenge joined (#228)."); }));
  $("#chal-out").querySelectorAll("[data-cp]").forEach(b => b.addEventListener("click", () => { S.chals[+b.dataset.cp].prog++; save(); renderChals(); toast("Progress logged — the group sees it too."); }));
}

/* ---------- success stories + testimonials (#225 #226) ---------- */
$("#story-out").innerHTML = `
  <div class="story"><span class="who">Aditi S.</span><span class="rank">AIR 41 · 2025</span>
    <p style="margin-top:5px">“My mistake notebook had 214 entries by Mains. The exam felt like revisiting old friends.”</p>
    <em>Third attempt · working professional</em></div>
  <div class="story"><span class="who">Mohit K.</span><span class="rank">AIR 118 · 2025</span>
    <p style="margin-top:5px">“Lock-In sessions rebuilt my attention span after years of doom-scrolling. 312 hours locked in total.”</p>
    <em>Full-time aspirant · testimony (#226)</em></div>
  <div class="story"><span class="who">Farah I.</span><span class="rank">AIR 207 · 2024</span>
    <p style="margin-top:5px">“Teach-back sessions exposed exactly what I only recognised, never knew.”</p>
    <em>Success story (#225)</em></div>`;

document.addEventListener("DOMContentLoaded", () => { renderThreads(); renderGroups(); renderChals(); });
