"use strict";
/* UPSC ZONE AI — focus.js
   Features: #181 #182 #183 #184 #185 #186 #187 #188 #189 #190 #191 #192
   FocusAPI isolated & API-ready. */
const LS = "uza_focus_v1";
const $ = s => document.querySelector(s);
const wait = ms => new Promise(r => setTimeout(r, ms));
const esc = s => { const d = document.createElement("div"); d.textContent = s; return d.innerHTML; };
let S = {}; try { S = JSON.parse(localStorage.getItem(LS)) || {}; } catch {}
S.sessions = S.sessions || [];
S.distractions = S.distractions || [];
const save = () => localStorage.setItem(LS, JSON.stringify(S));
function toast(m) { const t = $("#toast"); t.textContent = m; t.hidden = false; clearTimeout(toast._t); toast._t = setTimeout(() => t.hidden = true, 3000); }
const fmt = s => String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0");

/* ---------- focus mode (#181) ---------- */
const ft = $("#focus-toggle");
ft.checked = !!S.focusMode;
function focusUI() {
  $("#focus-state").textContent = ft.checked ? "Focus mode ON" : "Focus mode OFF";
  $("#focus-note").textContent = ft.checked ? "Notifications, social and entertainment blocked (demo)." : "Distraction engine idle.";
  document.body.classList.toggle("focus-on", ft.checked);
}
ft.addEventListener("change", () => { S.focusMode = ft.checked; save(); focusUI(); toast(S.focusMode ? "Focus Mode engaged (#181)." : "Focus Mode off."); });
focusUI();

/* ---------- session tracking (#183) ---------- */
let sessT = null, sessSec = 0, sessDistr = 0;
$("#sess-start").addEventListener("click", () => {
  sessSec = 0; sessDistr = 0;
  $("#sess-start").disabled = true; $("#sess-stop").disabled = false;
  sessT = setInterval(() => { sessSec++; $("#sess-timer").textContent = fmt(sessSec); }, 1000);
  toast("Session tracking started (#183).");
});
$("#sess-stop").addEventListener("click", () => {
  clearInterval(sessT);
  S.sessions.unshift({ mins: Math.max(1, Math.round(sessSec / 60)), distr: sessDistr, at: new Date().toLocaleString("en-IN") });
  S.sessions = S.sessions.slice(0, 15); save();
  $("#sess-start").disabled = false; $("#sess-stop").disabled = true;
  $("#sess-timer").textContent = "00:00";
  renderScores(); renderHistory();
  toast(`Session logged: ${Math.max(1, Math.round(sessSec / 60))} min · ${sessDistr} distraction(s).`);
});

/* ---------- distraction detection (#182) ---------- */
$("#distract-btn").addEventListener("click", () => {
  sessDistr++;
  S.distractions.push({ at: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) });
  save();
  $("#distr-log").textContent = `Detected today: ${S.distractions.length} distraction event(s) — pattern: phone pickups after 4 pm (#182).`;
  renderScores();
  toast("🪰 Distraction detected & logged (#182). Penalty applied to today's score.");
});

/* ---------- scores (#185 #186 #188) ---------- */
function renderScores() {
  const today = new Date().toDateString();
  const todays = S.sessions.filter(x => new Date(x.at).toDateString() === today);
  const mins = todays.reduce((a, x) => a + x.mins, 0) + (sessT ? Math.round(sessSec / 60) : 0);
  const penalty = Math.min(60, S.distractions.length * 6);
  const score = Math.max(5, Math.min(100, 40 + Math.min(50, mins) - penalty + (todays.length ? 10 : 0)));
  $("#fs-val").textContent = score;
  $("#v-mins").textContent = mins + "m"; $("#m-mins").style.width = Math.min(100, mins / 120 * 100) + "%";
  $("#v-dp").textContent = "-" + penalty; $("#m-dp").style.width = penalty / 60 * 100 + "%";
  const streak = S.streak || 12;
  $("#v-st").textContent = streak + " days"; $("#m-st").style.width = Math.min(100, streak / 30 * 100) + "%";
  // consistency dots (#188)
  const week = [72, 80, 55, 90, 40, 65, score];
  $("#dots").innerHTML = week.map((v, i) => `<span class="dot ${v >= 70 ? "hi" : v >= 45 ? "md" : "lo"}" title="Day ${i + 1}: ${v}/100">${["M","T","W","T","F","S","S"][i]}</span>`).join("");
}

/* ---------- break reminders (#187) ---------- */
$("#br-every").value = S.brEvery || 45;
$("#br-save").addEventListener("click", () => { S.brEvery = +$("#br-every").value; save(); toast(`Break reminder set: every ${S.brEvery} minutes (#187).`); });
$("#br-test").addEventListener("click", () => {
  $("#br-out").innerHTML = "";
  setTimeout(() => {
    $("#br-out").innerHTML = `<div class="br-banner">☕ Break reminder (#187): you've been at the desk ${$("#br-every").value} minutes. Stand, stretch, water — 5 minutes, no feeds.</div>`;
    toast("☕ Break reminder fired (#187).");
  }, 1200);
  $("#br-out").innerHTML = `<div class="empty">Reminder armed — it will fire in a moment (demo)…</div>`;
});

/* ---------- analytics + trends (#184 #192) ---------- */
(function () {
  const hours = [3.5, 5, 4.5, 6, 2.5, 5.5, 6.5];
  $("#hours-bars").innerHTML = hours.map((h, i) => `<div class="col"><span style="height:${h / 7 * 70}px" title="${h}h"></span>${["M","T","W","T","F","S","S"][i]}</div>`).join("");
  const scores = [62, 68, 61, 74, 58, 71, 76];
  const w = 320, h = 110;
  const pts = scores.map((v, i) => [20 + i * (w - 40) / 6, h - 12 - (v - 40) / 60 * (h - 26)]);
  $("#trend-svg").innerHTML = `<polyline class="tl" points="${pts.map(p => p.join(",")).join(" ")}"/>` +
    pts.map((p, i) => `<circle class="tdot" cx="${p[0]}" cy="${p[1]}" r="4"><title>Day ${i + 1}: ${scores[i]}</title></circle>`).join("");
  $("#trend-note").textContent = "Focus-score trend (#192): +14 pts over 7 days. Thursday dip correlates with the late-night session — protect sleep.";
})();

/* ---------- history (#191) ---------- */
function renderHistory() {
  $("#hist-out").innerHTML = S.sessions.length ? S.sessions.slice(0, 7).map(x =>
    `<div class="hist-row"><strong>${x.mins}m</strong><span>${x.distr ? x.distr + " distraction(s)" : "clean ✓"}</span>
     <span class="muted small" style="margin-left:auto">${x.at}</span></div>`).join("")
    : `<div class="empty">Logged sessions appear here.</div>`;
}

/* ---------- reports (#189 #190) ---------- */
async function report(btn, out, lines, label) {
  btn.disabled = true; const old = btn.textContent;
  btn.innerHTML = '<span class="spinner"></span> Compiling…';
  $(out).innerHTML = `<div class="empty">Analysing focus data… (local demo)</div>`;
  await wait(950);
  $(out).innerHTML = `<div class="rep-box"><strong>${label}</strong><ul>${lines.map(l => `<li>${esc(l)}</li>`).join("")}</ul>
    <p class="muted small" style="margin-top:7px">Generated ${new Date().toLocaleString("en-IN")}</p></div>`;
  btn.disabled = false; btn.textContent = old;
  toast(label + " ready ✓");
}
$("#wk-btn").addEventListener("click", () => report($("#wk-btn"), "#rep-out",
  ["Deep-work hours: 33.5 (target 35) — 96% of plan.", "Distraction events down 22% week-over-week.", "Best window: 7–9 pm · worst: post-lunch drift.", "Prescription: move CA digest to the 4 pm slump slot."], "Weekly Performance Report (#189)"));
$("#mo-btn").addEventListener("click", () => report($("#mo-btn"), "#rep-out",
  ["Monthly deep work: 141 h (+18% vs last month).", "Average focus score rose 61 → 76.", "Streak integrity: 26/30 days with 60+ minutes.", "Lock-In completion rate: 84% — the exit phrase was typed 3 times."], "Monthly Progress Report (#190)"));

document.addEventListener("DOMContentLoaded", () => { renderScores(); renderHistory(); });
