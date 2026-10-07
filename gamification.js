"use strict";
/* UPSC ZONE AI — gamification.js
   Features: #193 #194 #195 #196 #197 #198 #199 #200 #201 #202 #203 #204
   GameAPI isolated & API-ready. */
const LS = "uza_game_v1";
const $ = s => document.querySelector(s);
const esc = s => { const d = document.createElement("div"); d.textContent = s; return d.innerHTML; };
let S = {}; try { S = JSON.parse(localStorage.getItem(LS)) || {}; } catch {}
S.xp = S.xp ?? 1240; S.streak = S.streak ?? 12;
S.missions = S.missions || [
  { t: "Attempt 5 adaptive tests", xp: 120, done: false },
  { t: "Clear 20 revision cards", xp: 80, done: true },
  { t: "Write 3 timed answers", xp: 100, done: false },
  { t: "Hold a 50-min Lock-In", xp: 90, done: false },
  { t: "Log 7 consecutive study days", xp: 150, done: false }
];
S.room = S.room || false; S.chalJoined = !!S.chalJoined; S.chalProg = S.chalProg ?? 9;
S.groupJoined = !!S.groupJoined;
const save = () => localStorage.setItem(LS, JSON.stringify(S));
function toast(m) { const t = $("#toast"); t.textContent = m; t.hidden = false; clearTimeout(toast._t); toast._t = setTimeout(() => t.hidden = true, 2800); }

/* ---------- XP + level (#193 #194 #196) ---------- */
const LEVELS = ["Shishya", "Abhyasi", "Sadhak", "Yoddha", "Rishi", "Chanakya"];
function renderXP() {
  const lvl = Math.floor(S.xp / 150) + 1, into = S.xp % 150;
  $("#lvl-num").textContent = "Lv " + lvl;
  $("#lvl-name").textContent = LEVELS[Math.min(Math.floor((lvl - 1) / 2), LEVELS.length - 1)];
  $("#xp-txt").textContent = `${S.xp} XP · ${150 - into} to next`;
  $("#xp-fill").style.width = Math.round(into / 150 * 100) + "%";
  $("#st-txt").textContent = "🔥 " + S.streak + " days";
  $("#st-fill").style.width = Math.min(100, S.streak / 30 * 100) + "%";
}
$("#claim-btn").addEventListener("click", () => {
  const today = new Date().toDateString();
  if (S.claimDay === today) { toast("Already claimed today — come back tomorrow.", true); return; }
  S.claimDay = today; S.xp += 25; save(); renderXP(); renderBadges(); renderBoard();
  toast("+25 XP claimed — streak day " + S.streak + " counts! 🔥");
});

/* ---------- missions (#197) ---------- */
function renderMissions() {
  $("#mission-out").innerHTML = S.missions.map((m, i) => `
    <div class="mission ${m.done ? "done" : ""}">
      <button class="mk" data-m="${i}" type="button" aria-label="${m.done ? "Mark incomplete" : "Mark complete"}: ${esc(m.t)}">${m.done ? "✓" : ""}</button>
      <span>${esc(m.t)}</span><span class="rew">+${m.xp} XP</span></div>`).join("");
  $("#mission-out").querySelectorAll("[data-m]").forEach(b => b.addEventListener("click", () => {
    const m = S.missions[+b.dataset.m];
    if (!m.done) { m.done = true; S.xp += m.xp; toast(`Mission complete: +${m.xp} XP ✓`); }
    else { m.done = false; S.xp = Math.max(0, S.xp - m.xp); toast("Mission reopened — XP returned."); }
    save(); renderMissions(); renderXP(); renderBadges(); renderBoard();
  }));
}

/* ---------- mastery + bests (#195 #199) ---------- */
(function () {
  const mast = [["Polity", 48], ["Economy", 61], ["Geography", 82], ["History", 70], ["Environment", 55], ["S&T", 63]];
  $("#mastery-out").innerHTML = mast.map(([s, v]) => `<div class="mrow"><span>${s}</span>
    <span class="mbar"><span style="width:${v}%;background:${v >= 70 ? "var(--green)" : v >= 50 ? "var(--saffron)" : "var(--red)"}"></span></span>
    <strong>${v}%</strong></div>`).join("");
  $("#bests-out").innerHTML = ["🏅 Best mock: 82% (GS-2 set)", "⚡ Fastest 10-Q: 4m 12s", "🔁 Longest streak: 21 days", "✍️ Best answer: 7.8/10"]
    .map(b => `<span class="best-chip">${b}</span>`).join("");
})();

/* ---------- badges (#198) ---------- */
function renderBadges() {
  const B = [
    { ico: "🔥", n: "7-Day Flame", ok: S.streak >= 7, need: "7-day streak" },
    { ico: "🧠", n: "First Teach-Back", ok: false, need: "complete a teach-back" },
    { ico: "🎯", n: "80% Club", ok: false, need: "score 80%+ in a mock" },
    { ico: "🔒", n: "Lock-In Legend", ok: S.xp > 1200, need: "earn 1200 XP" },
    { ico: "📚", n: "NCERT Finisher", ok: false, need: "finish Foundation NCERTs" },
    { ico: "⚡", n: "Rapid Reflex", ok: S.missions.some(m => m.done), need: "complete a mission" }
  ];
  $("#badge-out").innerHTML = B.map(b => `<div class="badge ${b.ok ? "earned" : "locked"}" title="${b.need}">
    <span class="bico" aria-hidden="true">${b.ico}</span><span class="bname">${b.n}</span><br>
    <span class="muted small">${b.ok ? "earned ✓" : b.need}</span></div>`).join("");
}

/* ---------- challenges (#200 #201) ---------- */
function renderChallenges() {
  $("#chal-out").innerHTML = `<div class="chal-box"><strong>October Challenge:</strong> 30 hours of deep work in 31 days.
    <div class="meter-row" style="margin-top:8px"><span>Progress</span><span class="meter wide"><span id="ch-fill" style="width:${S.chalProg / 30 * 100}%"></span></span><strong>${S.chalProg}/30h</strong></div>
    <div class="row" style="margin-top:9px">
      <button class="btn btn-dark btn-sm" id="chal-join" type="button">${S.chalJoined ? "Joined ✓" : "Join challenge"}</button>
      <button class="btn btn-ghost btn-sm" id="chal-log" type="button" ${S.chalJoined ? "" : "disabled"}>+ Log 1h study</button></div></div>`;
  $("#chal-join").addEventListener("click", () => { S.chalJoined = true; save(); renderChallenges(); toast("Joined the October Challenge (#200)."); });
  $("#chal-log").addEventListener("click", () => {
    S.chalProg = Math.min(30, S.chalProg + 1); S.xp += 10; save();
    renderChallenges(); renderXP();
    toast(S.chalProg >= 30 ? "🏆 Challenge complete — badge unlocked!" : "Hour logged (+10 XP).");
  });
  $("#grp-out").innerHTML = `<div class="grp-row"><span>🛡 <strong>Tigers vs Panthers</strong> — weekly MCQ duel</span>
    <span class="meter" style="max-width:140px"><span style="width:62%;background:var(--green)"></span></span><span class="muted small">Tigers 62%</span>
    <button class="btn btn-ghost btn-sm" id="grp-join" type="button">${S.groupJoined ? "Joined ✓" : "Join Tigers"}</button></div>`;
  $("#grp-join").addEventListener("click", () => { S.groupJoined = true; save(); renderChallenges(); toast("You're on Team Tigers (#201)."); });
}

/* ---------- study room (#202) ---------- */
function renderRoom() {
  const occ = ["Priya (Polity)", "Rahul (Economy mocks)", "Sneha (Essay outline)"];
  if (S.room) occ.unshift("You (active now)");
  $("#room-out").innerHTML = `<div class="room-box"><h3>🪔 Room: “Dawn Batch — 6 AM Club”</h3>
    <p style="font-size:.8rem;color:#9db0c6">Silent co-study. Cameras optional, presence required.</p>
    <div class="occ">${occ.map(o => `<div class="occ-row"><span class="occ-dot"></span>${esc(o)}</div>`).join("")}</div>
    <button class="btn ${S.room ? "btn-ghost" : "btn-primary"} btn-sm" id="room-btn" type="button">${S.room ? "Leave room" : "Join room"}</button></div>`;
  $("#room-btn").addEventListener("click", () => { S.room = !S.room; save(); renderRoom(); toast(S.room ? "Joined the study room (#202) — welcome." : "Left the room."); });
}

/* ---------- leaderboard + milestones (#203 #204) ---------- */
function renderBoard() {
  const players = [["Priya N.", 1580], ["Aarav S. (you)", S.xp], ["Rahul K.", 1310], ["Sneha M.", 1105], ["Vikram T.", 940]]
    .sort((a, b) => b[1] - a[1]);
  $("#board-out").innerHTML = players.map(([n, p]) => `<li class="${n.includes("(you)") ? "me" : ""}"><span>${esc(n)}</span><span class="pts">${p} XP</span></li>`).join("");
  const done = 3;
  $("#ms-fill").style.width = done / 6 * 100 + "%";
  $("#ms-txt").textContent = `${done}/6`;
}

document.addEventListener("DOMContentLoaded", () => { renderXP(); renderMissions(); renderBadges(); renderChallenges(); renderRoom(); renderBoard(); });
