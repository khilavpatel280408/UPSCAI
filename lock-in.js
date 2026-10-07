"use strict";
/* UPSC ZONE AI — lock-in.js
   Features: #153 #154 #155 #156 #157 #158 #159 #160 #161 #162 #163 #164 #165 #166 #167 #168 #169
   LockAPI isolated & API-ready. Simulation only — no real OS blocking. */
const LS = "uza_lockin_v1";
const $ = s => document.querySelector(s);
const esc = s => { const d = document.createElement("div"); d.textContent = s; return d.innerHTML; };
let S = {}; try { S = JSON.parse(localStorage.getItem(LS)) || {}; } catch {}
S.sessions = S.sessions || [];
const save = () => localStorage.setItem(LS, JSON.stringify(S));
function toast(m) { const t = $("#toast"); t.textContent = m; t.hidden = false; clearTimeout(toast._t); toast._t = setTimeout(() => t.hidden = true, 3000); }
const fmt = s => String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(Math.max(0, s) % 60).padStart(2, "0");

/* ---------- state ---------- */
let total = 0, left = 0, tick = null, elapsed = 0;
let pomo = false, cycle = 1, phase = "focus";
let breaks = 2, distr = 0, commitMins = 15, breakTick = null, breakLeft = 0;

/* ---------- scheduled sessions (#157 bridge) ---------- */
function renderSched() {
  let sched = []; try { sched = (JSON.parse(localStorage.getItem("uza_planner_v1"))?.schedule || []).filter(s => !s.done); } catch {}
  const fmtT = d => new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
  $("#sched-out").innerHTML = sched.length ? sched.slice(0, 4).map(s =>
    `<div class="sched-row"><strong>${fmtT(s.from)}</strong><span>${esc(s.task)}</span>
     <button class="btn btn-dark btn-sm" style="margin-left:auto" data-s="${s.from}" type="button">Start under Lock-In</button></div>`).join("")
    : `<div class="empty">No scheduled sessions — let the AI Planner build today's schedule.</div>`;
  $("#sched-out").querySelectorAll("[data-s]").forEach(b => b.addEventListener("click", () => {
    $("#li-mins").value = 45; $("#mins-out").textContent = 45;
    startLock();
  }));
}
$("#li-mins").addEventListener("input", e => { $("#mins-out").textContent = e.target.value; });

/* ---------- start ---------- */
$("#li-start").addEventListener("click", () => {
  const goal = $("#li-goal").value.trim(), err = $("#li-err");
  if (goal.length < 5) { err.hidden = false; err.textContent = "Write your Study Contract goal (#160) — a lock without a purpose is just a timer."; return; }
  err.hidden = true;
  startLock();
});
function startLock() {
  total = (+$("#li-mins").value) * 60; left = total; elapsed = 0;
  pomo = $("#li-pomo").checked; cycle = 1; phase = "focus";
  breaks = 2; distr = 0; commitMins = +$("#li-commit").value;
  $("#setup").hidden = true; $("#complete").hidden = true; $("#recovery").hidden = true;
  $("#locked").hidden = false;
  $("#contract-line").textContent = `Contract (#160): “${$("#li-goal").value.trim() || "Deep study session"}” — notifications${$("#bk-notif").checked ? ", social" : ""}${$("#bk-ent").checked ? ", entertainment" : ""} blocked${$("#bk-white").checked ? " · whitelist-only web" : ""}.`;
  updateBlockNote();
  tick = setInterval(step, 1000);
  window.scrollTo({ top: 0, behavior: "smooth" });
}
function step() {
  left--; elapsed++;
  if (pomo && phase === "focus" && elapsed % (25 * 60) === 0 && left > 0) startBreakOverlay(true);
  if (left <= 60) $("#big-timer").classList.add("low");
  $("#big-timer").textContent = fmt(left);
  $("#big-timer").classList.toggle("low", left <= 60);
  $("#prog-fill").style.width = Math.min(100, elapsed / total * 100) + "%";
  $("#st-cycle").textContent = pomo ? `${cycle} · ${phase}` : "continuous";
  $("#mode-line").textContent = pomo ? `Pomodoro (#156) — 25-min focus blocks. Cycle ${cycle}.` : "Focus Timer (#155) — continuous deep work.";
  // commitment timer (#161)
  const free = elapsed >= commitMins * 60;
  $("#exit-btn").disabled = !free;
  $("#commit-note").textContent = free ? "Emergency Exit unlocked." : `Emergency Exit locked for ${fmt(commitMins * 60 - elapsed)} more (#161).`;
  if (left <= 0) completeSession();
}
function updateBlockNote() {
  const on = [$("#bk-notif").checked && "notifications", $("#bk-social").checked && "social", $("#bk-ent").checked && "entertainment", $("#bk-dist").checked && "distraction engine"].filter(Boolean);
  $("#prog-note").textContent = `Blocking active (#165–#169): ${on.join(", ") || "none"}. Progressive Lock (#162): every attempt adds +30 seconds.`;
}

/* ---------- distraction attempts (#162 #165) ---------- */
document.querySelectorAll(".dist-btn").forEach(b => b.addEventListener("click", () => {
  distr++; left += 30; total += 30;
  $("#st-distr").textContent = distr;
  toast(`⛔ ${b.dataset.dist} blocked (#165) — Progressive Lock +30s (#162). Attempts: ${distr}`);
}));

/* ---------- break budget + break timer (#158 #164) ---------- */
$("#break-btn").addEventListener("click", () => {
  if (breaks <= 0) { toast("Break budget exhausted (#164). Finish strong.", true); return; }
  breaks--; $("#st-breaks").textContent = breaks;
  startBreakOverlay(false);
});
function startBreakOverlay(isPomo) {
  clearInterval(tick);
  breakLeft = isPomo ? 5 * 60 : 5 * 60;
  $("#break-overlay").hidden = false;
  $("#break-timer").textContent = fmt(breakLeft);
  clearInterval(breakTick);
  breakTick = setInterval(() => {
    breakLeft--; $("#break-timer").textContent = fmt(breakLeft);
    if (breakLeft <= 0) {
      clearInterval(breakTick);
      $("#break-overlay").hidden = true;
      if (isPomo) { cycle++; phase = "focus"; }
      tick = setInterval(step, 1000);
      toast("Break over — back to the desk.");
    }
  }, 1000);
}

/* ---------- emergency exit (#159) ---------- */
$("#exit-btn").addEventListener("click", () => {
  $("#exit-panel").hidden = false;
  $("#exit-panel").innerHTML = `<strong>Emergency Exit (#159)</strong>
    <p class="muted small" style="color:#9db0c6">Exiting costs the streak point for this session and logs a recovery suggestion. Type <strong>I ACCEPT THE COST</strong> to unlock the door.</p>
    <input type="text" id="exit-phrase" placeholder="Type the phrase…" aria-label="Emergency exit confirmation phrase">
    <div class="row" style="margin-top:10px"><button class="btn btn-primary btn-sm" id="exit-confirm" type="button">Confirm exit</button>
    <button class="btn btn-ghost btn-sm" id="exit-cancel" type="button">Stay locked</button></div>`;
  $("#exit-cancel").addEventListener("click", () => { $("#exit-panel").hidden = true; });
  $("#exit-confirm").addEventListener("click", () => {
    if ($("#exit-phrase").value.trim().toUpperCase() !== "I ACCEPT THE COST") { toast("Phrase not matched — the door stays closed.", true); return; }
    clearInterval(tick);
    S.sessions.push({ at: Date.now(), planned: total, done: elapsed, exited: true }); save();
    $("#locked").hidden = true;
    $("#recovery").hidden = false;
    $("#rec-text").textContent = `You exited after ${fmt(elapsed)} of ${fmt(total)}. That happens — what matters is the return. Focus Recovery (#163) recommends one clean 25-minute block to rebuild momentum.`;
  });
});
$("#rec-restart").addEventListener("click", () => {
  $("#li-mins").value = 25; $("#mins-out").textContent = 25;
  $("#recovery").hidden = true; $("#setup").hidden = false;
  startLock();
});

/* ---------- completion ---------- */
function completeSession() {
  clearInterval(tick); clearInterval(breakTick);
  $("#break-overlay").hidden = true;
  S.sessions.push({ at: Date.now(), planned: total, done: elapsed, exited: false }); save();
  $("#locked").hidden = true; $("#complete").hidden = false;
  $("#comp-text").textContent = `${fmt(elapsed)} locked · ${distr} distraction(s) blocked · ${2 - breaks} break(s) used. Logged to Focus analytics.`;
  toast("Lock-In complete — contract honoured ✓");
}

document.addEventListener("DOMContentLoaded", renderSched);
