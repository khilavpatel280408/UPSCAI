"use strict";
/* UPSC ZONE AI — shared-system.js
   Integration hub: design tokens, component conventions, live localStorage
   schema inspector, mock API contracts, routing map, accessibility checklist.
   Documents and hosts the contract without replacing feature pages. */
const LS = "uza_shared_v1";
const $ = s => document.querySelector(s);
const esc = s => { const d = document.createElement("div"); d.textContent = s; return d.innerHTML; };
function toast(m) { const t = $("#toast"); t.textContent = m; t.hidden = false; clearTimeout(toast._t); toast._t = setTimeout(() => t.hidden = true, 2800); }

/* ---------- tabs ---------- */
document.querySelectorAll(".tab").forEach(b => b.addEventListener("click", () => {
  document.querySelectorAll(".tab").forEach(x => { x.classList.toggle("active", x === b); x.setAttribute("aria-selected", String(x === b)); });
  document.querySelectorAll(".panel").forEach(p => { p.hidden = p.dataset.panel !== b.dataset.p; });
}));

/* ---------- tokens ---------- */
const COLORS = [["--navy", "#12294a"], ["--deep", "#0a1526"], ["--saffron", "#d97a1f"], ["--gold", "#c9a24b"], ["--green", "#1c7a4d"], ["--red", "#b3402f"], ["--cream", "#f6f1e6"], ["--paper", "#fffdf8"], ["--line", "#ddd3bf"], ["--txt", "#23303f"], ["--muted", "#5c6773"]];
$("#color-grid").innerHTML = COLORS.map(([n, v]) => `<button class="swatch" data-c="${v}" type="button" aria-label="Copy ${n} ${v}">
  <span class="c" style="background:${v}"></span><span class="l"><b>${n}</b>${v}</span></button>`).join("");
$("#color-grid").querySelectorAll("[data-c]").forEach(b => b.addEventListener("click", async () => {
  try { await navigator.clipboard.writeText(b.dataset.c); toast(`Copied ${b.dataset.c} ✓`); }
  catch { toast("Clipboard blocked — copy manually: " + b.dataset.c, true); }
}));

/* ---------- components demo ---------- */
$("#demo-switch").addEventListener("change", e => { $("#demo-switch-lbl").textContent = "Demo switch " + (e.target.checked ? "ON" : "OFF"); toast("Switch state changed."); });
$("#meter-btn").addEventListener("click", () => { $("#demo-meter").style.width = (15 + Math.floor(Math.random() * 85)) + "%"; });

/* ---------- schema inspector ---------- */
function scan() {
  const keys = Object.keys(localStorage).filter(k => k.startsWith("uza_")).sort();
  $("#schema-out").innerHTML = keys.length ? keys.map(k => {
    const raw = localStorage.getItem(k);
    let pretty = raw; try { pretty = JSON.stringify(JSON.parse(raw), null, 2); } catch {}
    return `<div class="schema-row"><div class="top"><code>${esc(k)}</code>
      <span class="muted small">${(raw.length / 1024).toFixed(1)} KB</span>
      <button class="btn btn-ghost btn-sm" data-copy="${esc(k)}" type="button" style="margin-left:auto">Copy</button>
      <button class="btn btn-ghost btn-sm danger" data-del="${esc(k)}" type="button">Delete</button></div>
      <pre>${esc(pretty.slice(0, 900))}${pretty.length > 900 ? "\n…truncated" : ""}</pre></div>`;
  }).join("") : `<div class="empty" style="border:2px dashed var(--line);border-radius:11px;padding:16px;text-align:center;color:var(--muted);background:#fbf8f1">No uza_* keys yet — use any page first (dashboard, notes, lock-in…) and re-scan.</div>`;
  $("#schema-out").querySelectorAll("[data-copy]").forEach(b => b.addEventListener("click", async () => {
    try { await navigator.clipboard.writeText(localStorage.getItem(b.dataset.copy)); toast("Key contents copied ✓"); } catch { toast("Clipboard blocked.", true); }
  }));
  $("#schema-out").querySelectorAll("[data-del]").forEach(b => b.addEventListener("click", () => {
    if (!confirm(`Delete ${b.dataset.del}? This clears that demo state.`)) return;
    localStorage.removeItem(b.dataset.del); scan(); toast("Key deleted.");
  }));
}
$("#scan-btn").addEventListener("click", () => { scan(); toast("Storage re-scanned."); });
$("#export-btn").addEventListener("click", () => {
  const dump = {}; Object.keys(localStorage).filter(k => k.startsWith("uza_")).forEach(k => { try { dump[k] = JSON.parse(localStorage.getItem(k)); } catch { dump[k] = localStorage.getItem(k); } });
  const blob = new Blob([JSON.stringify(dump, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = "upsc-zone-ai-demo-data.json"; a.click();
  URL.revokeObjectURL(a.href);
  toast("Demo data exported ✓");
});
$("#wipe-btn").addEventListener("click", () => {
  if (!confirm("Clear ALL uza_* demo data across every page? This cannot be undone.")) return;
  Object.keys(localStorage).filter(k => k.startsWith("uza_")).forEach(k => localStorage.removeItem(k));
  scan(); toast("All demo data cleared.");
});

/* ---------- API contracts ---------- */
const API = [
  ["POST /api/auth/login · /signup · /reset", "login, signup, forgot-password", "session object / error codes"],
  ["POST /api/chat · /explain · /doubts", "ai-copilot", "reply text"],
  ["POST /api/plan/generate · /autopilot/schedule", "ai-planner", "phases[] / schedule blocks[]"],
  ["GET  /api/twin/snapshot · /weak-areas", "preparation-twin, dashboard, profile", "readiness, memory, weak[]"],
  ["POST /api/tests/generate · GET /api/results/analyse", "mock-tests, test-result", "quiz / verdict"],
  ["GET  /api/revision/queue · POST /mark-revised", "revision", "queue items with intervals"],
  ["POST /api/research/deep · GET /api/search", "research, ai-browser, search", "report / grouped results"],
  ["POST /api/mains/evaluate · /essay-eval · /case-study", "answer-writing, mains", "scores + feedback"],
  ["GET  /api/briefing/daily · /recommendations", "dashboard, current-affairs", "brief items / reco list[]"]
];
$("#api-tbody").innerHTML = API.map(r => `<tr><td><code>${esc(r[0])}</code></td><td>${esc(r[1])}</td><td>${esc(r[2])}</td></tr>`).join("");

/* ---------- routing map ---------- */
const ROUTES = [
  ["index.html", "Landing", 0], ["login.html", "Login", 0], ["signup.html", "Signup", 0], ["forgot-password.html", "Forgot Password", 0],
  ["onboarding.html", "Onboarding", 0], ["dashboard.html", "Dashboard · What Now? ★", 1], ["ai-copilot.html", "AI Copilot", 0],
  ["ai-planner.html", "Planner · Autopilot ★", 1], ["preparation-twin.html", "Preparation Twin ★", 1], ["notes.html", "Smart Notes", 0],
  ["topic-explorer.html", "Topic Explorer", 0], ["mock-tests.html", "Test Center", 0], ["test-interface.html", "Live Test Interface", 0],
  ["test-result.html", "Test Results", 0], ["pyq.html", "PYQ Intelligence", 0], ["analytics.html", "Performance Analytics", 0],
  ["mistake-notebook.html", "Mistake Intelligence", 0], ["revision.html", "AI Revision Center", 0], ["current-affairs.html", "Current Affairs Hub", 0],
  ["mains.html", "Mains / Essay", 0], ["answer-writing.html", "Answer Writing", 0], ["active-learning.html", "Active Learning Lab", 0],
  ["teach-back.html", "Teach-Back", 0], ["ai-browser.html", "AI Study Browser", 0], ["research.html", "Research Workspace", 0],
  ["study-youtube.html", "Study-Only YouTube", 0], ["lock-in.html", "Lock-In Mode", 0], ["app-control.html", "App Control", 0],
  ["focus.html", "Focus & Productivity", 0], ["gamification.html", "Gamification", 0], ["roadmap.html", "Roadmap ★", 1],
  ["preparation.html", "Preparation Center", 0], ["community.html", "Community", 0], ["search.html", "Universal Search", 0],
  ["profile.html", "Profile", 0], ["settings.html", "Settings", 0], ["shared-system.html", "Shared System (this page)", 0]
];
$("#route-grid").innerHTML = ROUTES.map(([f, n, sig]) => `<a class="route ${sig ? "sig" : ""}" href="${f}">
  <span>${sig ? "★ " : ""}${n}</span><span class="st">built ✓</span></a>`).join("");

/* ---------- accessibility checklist ---------- */
const A11Y = ["Skip link on every page", "Visible :focus-visible gold outline", "All inputs labelled (visible or sr-only)", "aria-live on AI output regions", "role=alert for errors, role=status for toasts", "Keyboard-operable tabs (arrows, Home/End)", "prefers-reduced-motion respected", "Colour contrast ≥ 4.5:1 for body text", "No dead buttons or broken internal links"];
let S = {}; try { S = JSON.parse(localStorage.getItem(LS)) || {}; } catch {}
S.a11y = S.a11y || {};
const save = () => localStorage.setItem(LS, JSON.stringify(S));
function renderA11y() {
  $("#a11y-out").innerHTML = A11Y.map((t, i) => `<label class="a11y-item"><input type="checkbox" data-a="${i}" ${S.a11y[i] ? "checked" : ""}><span>${t}</span></label>`).join("");
  const done = A11Y.filter((_, i) => S.a11y[i]).length;
  $("#a11y-score").textContent = `${done}/${A11Y.length} conventions verified on this build`;
  $("#a11y-out").querySelectorAll("[data-a]").forEach(c => c.addEventListener("change", () => { S.a11y[c.dataset.a] = c.checked; save(); renderA11y(); }));
}
$("#a11y-reset").addEventListener("click", () => { S.a11y = {}; save(); renderA11y(); toast("Checklist reset."); });

document.addEventListener("DOMContentLoaded", () => { scan(); renderA11y(); });
