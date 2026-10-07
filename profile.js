"use strict";
/* UPSC ZONE AI — profile.js
   Features: #10 #12 #49 #58 #186 #193 #194 #195 #196 #204
   ProfileAPI isolated & API-ready. */
const LS = "uza_profile_v1";
const $ = s => document.querySelector(s);
const wait = ms => new Promise(r => setTimeout(r, ms));
const esc = s => { const d = document.createElement("div"); d.textContent = s; return d.innerHTML; };
let S = {}; try { S = JSON.parse(localStorage.getItem(LS)) || {}; } catch {}
const save = () => localStorage.setItem(LS, JSON.stringify(S));
function toast(m) { const t = $("#toast"); t.textContent = m; t.hidden = false; clearTimeout(toast._t); toast._t = setTimeout(() => t.hidden = true, 2800); }

const ProfileAPI = {
  async twinSnapshot() {                 // GET /api/twin/snapshot
    await wait(800);
    return { readiness: 68, prepScore: 72, memory: 61, consistency: 74, streak: S.streak ?? 12 };
  }
};

/* ---------- load identity (signup bridge) ---------- */
let base = { name: "Aarav Sharma", attempt: "2027", optional: "PSIR", bio: "IAS through discipline, not drama." };
try { const su = JSON.parse(localStorage.getItem("uza_signup_v1")); if (su?.name) base = { ...base, name: su.name, attempt: su.attempt || base.attempt, optional: su.optional !== "Undecided" ? (su.optional || base.optional) : base.optional }; } catch {}
S = { ...base, ...S };
let game = {}; try { game = JSON.parse(localStorage.getItem("uza_game_v1")) || {}; } catch {}
S.xp = game.xp ?? S.xp ?? 1240;
if (!S.ms) S.ms = [
  { t: "Syllabus mapped to NCERTs", done: true }, { t: "Foundation NCERTs complete", done: true },
  { t: "First full mock attempted", done: true }, { t: "100 PYQs solved", done: false },
  { t: "Mistake Notebook active (20+ entries)", done: false }, { t: "5 full mocks above 90 marks", done: false }
];
save();

/* ---------- render identity ---------- */
function initials(n) { return n.trim().split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase() || "").join(""); }
function renderIdentity() {
  $("#pf-name").textContent = S.name;
  $("#pf-init").textContent = initials(S.name);
  $("#pf-meta").textContent = `${S.attempt} attempt · Optional: ${S.optional} · joined Oct 2026`;
  $("#pf-bio").textContent = S.bio ? `“${S.bio}”` : "";
  const lvl = Math.floor(S.xp / 150) + 1, into = S.xp % 150;
  $("#pf-lvl").textContent = "Lv " + lvl + " · " + (lvl >= 9 ? "Yoddha" : "Sadhak"); // #194
  $("#pf-xp-fill").style.width = Math.round(into / 150 * 100) + "%";
  $("#pf-xp-txt").textContent = `${S.xp} UPSC XP (#193) · ${150 - into} to Lv ${lvl + 1}`;
  $("#pf-streak").textContent = S.streak ?? 12;
}

/* ---------- twin + scores ---------- */
(async function () {
  const t = await ProfileAPI.twinSnapshot();
  $("#tw-out").innerHTML = `<div class="tw-line"><span>Weakest subject</span><strong>Polity (42%)</strong></div>
    <div class="tw-line"><span>Strongest subject</span><strong>Geography (82%)</strong></div>
    <div class="tw-line"><span>Open mistakes</span><strong>5 · 2 repeated</strong></div>
    <div class="tw-line"><span>Last test</span><strong>74/200 · GS Mock 4</strong></div>`;
  setTimeout(() => {
    $("#tw-mem").style.width = t.memory + "%"; $("#tw-mem-v").textContent = t.memory + "%";
    $("#tw-cons").style.width = t.consistency + "%"; $("#tw-cons-v").textContent = t.consistency + "%";
    $("#pf-ready").style.background = `conic-gradient(var(--saffron) ${t.readiness * 3.6}deg,#eee3cf 0deg)`;
    $("#pf-ready-v").textContent = t.readiness;
  }, 80);
  $("#pf-prep").textContent = t.prepScore;
})();

/* ---------- mastery (#195) ---------- */
const MASTERY = [["Polity", 48], ["Economy", 61], ["Geography", 82], ["History", 70], ["Environment", 55], ["S&T", 63]];
$("#mastery-out").innerHTML = MASTERY.map(([s, v]) => `<div class="mrow"><span>${s}</span>
  <span class="mbar"><span style="width:${v}%;background:${v >= 70 ? "var(--green)" : v >= 50 ? "var(--saffron)" : "var(--red)"}"></span></span><strong>${v}%</strong></div>`).join("");

/* ---------- milestones (#204) ---------- */
function renderMs() {
  $("#ms-out").innerHTML = S.ms.map((m, i) => `<div class="ms-item ${m.done ? "done" : ""}" data-ms="${i}" role="button" tabindex="0" aria-pressed="${m.done}">
    <span class="mk">${m.done ? "✓" : ""}</span><span>${esc(m.t)}</span></div>`).join("");
  const done = S.ms.filter(m => m.done).length;
  $("#ms-fill").style.width = Math.round(done / S.ms.length * 100) + "%";
  $("#ms-txt").textContent = `${done}/${S.ms.length}`;
  $("#ms-out").querySelectorAll("[data-ms]").forEach(el => {
    const toggle = () => { const m = S.ms[+el.dataset.ms]; m.done = !m.done; save(); renderMs(); if (m.done) toast("Milestone complete ✓"); };
    el.addEventListener("click", toggle);
    el.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); } });
  });
}

/* ---------- recommendations (#12) ---------- */
$("#reco-out").innerHTML = [
  "Drill Fundamental Rights (42% accuracy) with a mistake-based test today.",
  "Your 7–9 pm window has the best focus score — schedule the sectional mock there.",
  "September CA digest is un-revised — queue it before the October one lands.",
  "Essay practice is 3 weeks stale; one outline this Sunday keeps the muscle warm."
].map(r => `<div class="reco">✦ <span>${esc(r)}</span></div>`).join("");

/* ---------- edit ---------- */
$("#edit-btn").addEventListener("click", () => {
  $("#e-name").value = S.name; $("#e-attempt").value = S.attempt; $("#e-opt").value = S.optional; $("#e-bio").value = S.bio;
  $("#edit-card").hidden = false; $("#e-name").focus();
  $("#edit-card").scrollIntoView({ behavior: "smooth", block: "center" });
});
$("#cancel-btn").addEventListener("click", () => { $("#edit-card").hidden = true; });
$("#save-btn").addEventListener("click", () => {
  const name = $("#e-name").value.trim(), err = $("#e-err");
  if (name.length < 2) { err.hidden = false; err.textContent = "Name needs at least 2 characters."; return; }
  err.hidden = true;
  S.name = name; S.attempt = $("#e-attempt").value; S.optional = $("#e-opt").value; S.bio = $("#e-bio").value.trim();
  save(); renderIdentity();
  $("#edit-card").hidden = true;
  toast("Identity saved ✓ Your twin picks up the new attempt target.");
});

document.addEventListener("DOMContentLoaded", () => { renderIdentity(); renderMs(); });
