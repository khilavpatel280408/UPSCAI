"use strict";
/* UPSC ZONE AI — app-control.js
   Features: #170 #171 #172 #173 #174 #175 #176 #177 #178 #179 #180
   AppCtlAPI isolated & API-ready. Simulation only. */
const LS = "uza_appctl_v1";
const $ = s => document.querySelector(s);
const wait = ms => new Promise(r => setTimeout(r, ms));
const esc = s => { const d = document.createElement("div"); d.textContent = s; return d.innerHTML; };
let S = {}; try { S = JSON.parse(localStorage.getItem(LS)) || {}; } catch {}
if (!S.apps) S.apps = [
  { id: "wa", n: "WhatsApp", ico: "💬", cat: "social", limit: 30, used: 42, allowed: true, breakOk: true, special: "WhatsApp Time Limit #171" },
  { id: "ig", n: "Instagram", ico: "📸", cat: "social", limit: 0, used: 25, allowed: false, breakOk: false },
  { id: "yt", n: "YouTube", ico: "▶️", cat: "entertainment", limit: 20, used: 55, allowed: true, breakOk: true },
  { id: "gm", n: "Games", ico: "🎮", cat: "entertainment", limit: 0, used: 12, allowed: false, breakOk: false },
  { id: "calc", n: "Calculator", ico: "🧮", cat: "tool", limit: null, used: 8, allowed: true, breakOk: true, special: "Calculator Access #174" },
  { id: "nt", n: "Notes / Flashcards", ico: "📝", cat: "study", limit: null, used: 35, allowed: true, breakOk: true },
  { id: "sb", n: "Study Browser", ico: "🔒", cat: "study", limit: null, used: 60, allowed: true, breakOk: true },
  { id: "tw", n: "X / Twitter", ico: "🐦", cat: "social", limit: 10, used: 18, allowed: false, breakOk: false }
];
if (!S.contacts) S.contacts = [{ n: "Amma", num: "98xxxxxx21" }, { n: "Mentor Sir", num: "97xxxxxx88" }];
S.blockedLog = S.blockedLog || [];
const save = () => localStorage.setItem(LS, JSON.stringify(S));
function toast(m) { const t = $("#toast"); t.textContent = m; t.hidden = false; clearTimeout(toast._t); toast._t = setTimeout(() => t.hidden = true, 3000); }

/* ---------- render app list (#170 #171 #174 #175 #177 #178 #179) ---------- */
function renderApps() {
  $("#app-list").innerHTML = S.apps.map(a => `
    <div class="app-row ${a.allowed ? "" : "blocked"}">
      <span class="app-ico" aria-hidden="true">${a.ico}</span>
      <div><p class="app-name">${esc(a.n)}</p>
        <div class="app-tags">
          <span class="chip ${a.allowed ? "on" : "off"}">${a.allowed ? "Allowed" : "Blocked"} <span style="opacity:.7">#170</span></span>
          ${a.special ? `<span class="chip wa">${esc(a.special)}</span>` : ""}
          ${a.breakOk && $("#break-access").checked ? `<span class="chip brk">Break access #178</span>` : ""}
        </div></div>
      <div class="use-meter"><span>${a.used ?? 0} min used${a.limit ? ` / ${a.limit} min limit` : " / no limit"}</span>
        <span class="use-bar"><span class="${a.limit && a.used > a.limit ? "over" : ""}" style="width:${a.limit ? Math.min(100, a.used / a.limit * 100) : Math.min(100, a.used)}%"></span></span></div>
      <div class="app-ctrl">
        ${a.limit !== null ? `<input type="number" min="0" max="240" step="5" value="${a.limit}" data-lim="${a.id}" aria-label="Time limit for ${a.n} (#175)">` : ""}
        ${a.breakOk !== undefined ? `<label class="check small" style="font-size:.68rem"><input type="checkbox" data-brk="${a.id}" ${a.breakOk ? "checked" : ""}>breaks</label>` : ""}
        <label class="switch"><input type="checkbox" data-al="${a.id}" ${a.allowed ? "checked" : ""} aria-label="Allow ${a.n}"><span class="slider-ui"></span></label>
      </div>
    </div>`).join("");
  $("#app-list").querySelectorAll("[data-al]").forEach(c => c.addEventListener("change", () => {
    const a = S.apps.find(x => x.id === c.dataset.al);
    a.allowed = c.checked; save(); renderApps();
    toast(`${a.n} ${a.allowed ? "allowed (#170)" : "blocked (#179)"}`);
  }));
  $("#app-list").querySelectorAll("[data-lim]").forEach(i => i.addEventListener("change", () => {
    const a = S.apps.find(x => x.id === i.dataset.lim);
    a.limit = Math.max(0, Math.min(240, +i.value)); save(); renderApps();
    toast(`${a.n} limit set to ${a.limit} min (#175)`);
  }));
  $("#app-list").querySelectorAll("[data-brk]").forEach(c => c.addEventListener("change", () => {
    const a = S.apps.find(x => x.id === c.dataset.brk); a.breakOk = c.checked; save(); renderApps();
  }));
  // simulate attempts on blocked apps (#177 monitoring)
  $("#app-list").querySelectorAll(".app-row.blocked").forEach(row => row.addEventListener("click", e => {
    if (e.target.closest("input,label")) return;
    const id = row.querySelector("[data-al]")?.dataset.al;
    const a = S.apps.find(x => x.id === id);
    S.blockedLog.push({ n: a.n, at: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) });
    save(); renderMonitor();
    toast(`⛔ ${a.n} blocked — attempt logged to monitoring (#177).`);
  }));
}

/* ---------- monitoring (#177) ---------- */
function renderMonitor() {
  const top = [...S.apps].sort((a, b) => (b.used || 0) - (a.used || 0)).slice(0, 4);
  $("#mon-out").innerHTML = `<p class="muted small">Top usage today:</p>` + top.map(a =>
    `<div class="use-meter" style="margin-bottom:8px"><span>${a.ico} ${esc(a.n)} — ${a.used} min</span>
     <span class="use-bar"><span style="width:${Math.min(100, a.used)}%"></span></span></div>`).join("") +
    `<p class="muted small">Blocked attempts today: <strong>${S.blockedLog.length}</strong>${S.blockedLog.length ? " — " + S.blockedLog.slice(-3).map(b => `${b.n} @ ${b.at}`).join(" · ") : ""}</p>`;
}

/* ---------- emergency contacts (#173) ---------- */
function renderContacts() {
  $("#em-list").innerHTML = S.contacts.length ? S.contacts.map((c, i) =>
    `<div class="em-row"><span>🚨 <strong>${esc(c.n)}</strong> · ${esc(c.num)}</span>
     <button class="mini-x" data-rm="${i}" aria-label="Remove ${c.n}">✕</button></div>`).join("")
    : `<p class="muted small">No emergency contacts — add at least one.</p>`;
  $("#em-list").querySelectorAll("[data-rm]").forEach(b => b.addEventListener("click", () => {
    S.contacts.splice(+b.dataset.rm, 1); save(); renderContacts();
  }));
}
$("#em-add").addEventListener("click", () => {
  const n = $("#em-name").value.trim(), num = $("#em-num").value.trim(), err = $("#em-err");
  if (n.length < 2 || num.length < 6) { err.hidden = false; err.textContent = "Enter a name and a valid number."; return; }
  err.hidden = true;
  S.contacts.push({ n, num }); save();
  $("#em-name").value = ""; $("#em-num").value = ""; renderContacts();
  toast(`${n} added — always reachable, even in Lock-In (#173) ✓`);
});

/* ---------- global toggles ---------- */
$("#autoblock").checked = S.autoblock !== false;
$("#autoblock").addEventListener("change", e => { S.autoblock = e.target.checked; save(); renderApps(); toast(S.autoblock ? "Automatic blocking armed during study hours (#179)." : "Auto-blocking paused."); });
$("#break-access").checked = !!S.breakAccess;
$("#break-access").addEventListener("change", e => { S.breakAccess = e.target.checked; save(); renderApps(); });
$("#phone-access").checked = S.phoneAccess !== false;
$("#phone-access").addEventListener("change", e => { S.phoneAccess = e.target.checked; save(); toast(S.phoneAccess ? "Incoming calls allowed (#172)." : "Calls silenced — emergency contacts still break through (#173)."); });
$("#daily-cap").value = S.cap || 90;
$("#cap-out").textContent = S.cap || 90;
$("#daily-cap").addEventListener("input", e => { S.cap = +e.target.value; $("#cap-out").textContent = S.cap; save(); });

/* ---------- screen-time report (#180) ---------- */
$("#report-btn").addEventListener("click", async () => {
  const btn = $("#report-btn"); btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Compiling…';
  $("#report-out").innerHTML = `<div class="empty">Reading usage, limits and blocks… (local demo)</div>`;
  await wait(900);
  const total = S.apps.reduce((a, x) => a + (x.used || 0), 0);
  const over = S.apps.filter(x => x.limit && x.used > x.limit);
  const study = S.apps.filter(x => x.cat === "study").reduce((a, x) => a + (x.used || 0), 0);
  $("#report-out").innerHTML = `<div class="report-box"><strong>Screen-Time Report — ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long" })}</strong>
    <ul><li>Total app usage: <strong>${total} min</strong> vs daily cap <strong>${S.cap || 90} min</strong> (#176) — ${total <= (S.cap || 90) ? "within budget ✓" : "over budget ✗"}.</li>
    <li>Study-app share: <strong>${Math.round(study / total * 100) || 0}%</strong> of screen time.</li>
    <li>Over-limit apps: ${over.length ? over.map(x => `${x.n} (+${x.used - x.limit}m)`).join(", ") : "none ✓"}.</li>
    <li>Blocked attempts: <strong>${S.blockedLog.length}</strong> — ${S.blockedLog.length ? "the blocker is earning its keep." : "a clean day."}</li>
    <li>AI note: shift WhatsApp to one 15-min evening window; YouTube is your biggest leak (${S.apps.find(x => x.id === "yt").used} min).</li></ul>
    <p class="muted small" style="margin-top:8px">Generated locally · saved with today's date.</p></div>`;
  btn.disabled = false; btn.innerHTML = "📊 Screen-Time Report <span class=\"fid\">#180</span>";
  toast("Screen-Time Report ready ✓");
});

document.addEventListener("DOMContentLoaded", () => { renderApps(); renderContacts(); renderMonitor(); });
