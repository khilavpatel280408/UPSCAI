"use strict";
/* UPSC ZONE AI — settings.js
   Features: #122 #123 #143 #159 #165 #166 #167 #168 #169 #170 #171 #172 #173 #174 #175 #176 #178 #179
   Cross-page integration: reads/writes the SAME localStorage stores used by
   ai-browser.html, study-youtube.html, app-control.html and lock-in.html. */
const $ = s => document.querySelector(s);
const esc = s => { const d = document.createElement("div"); d.textContent = s; return d.innerHTML; };
function toast(m) { const t = $("#toast"); t.textContent = m; t.hidden = false; clearTimeout(toast._t); toast._t = setTimeout(() => t.hidden = true, 3000); }
const read = (k, fb) => { try { return JSON.parse(localStorage.getItem(k)) ?? fb; } catch { return fb; } };
const write = (k, v) => localStorage.setItem(k, JSON.stringify(v));

/* ---------- shared stores (same shapes as owner pages) ---------- */
let browser = read("uza_browser_v1", null) || { whitelist: ["pib.gov.in", "prsindia.org", "ncert.nic.in", "rbi.org.in", "imd.gov.in", "upsc.gov.in"], blacklist: ["instagram.com", "facebook.com", "x.com", "netflix.com"] };
let yt = read("uza_youtube_v1", null) || { channels: { "UPSC Pathshala": true, "Sleepless IAS": true, "Polity Simplified": true, "Vlog Nation": false } };
let apps = read("uza_appctl_v1", null) || { apps: [
  { id: "wa", n: "WhatsApp", ico: "💬", cat: "social", limit: 30, used: 42, allowed: true, breakOk: true, special: "WhatsApp Time Limit #171" },
  { id: "ig", n: "Instagram", ico: "📸", cat: "social", limit: 0, used: 25, allowed: false, breakOk: false },
  { id: "yt", n: "YouTube", ico: "▶️", cat: "entertainment", limit: 20, used: 55, allowed: true, breakOk: true },
  { id: "calc", n: "Calculator", ico: "🧮", cat: "tool", limit: null, used: 8, allowed: true, breakOk: true, special: "Calculator Access #174" },
  { id: "nt", n: "Notes / Flashcards", ico: "📝", cat: "study", limit: null, used: 35, allowed: true, breakOk: true },
  { id: "gm", n: "Games", ico: "🎮", cat: "entertainment", limit: 0, used: 12, allowed: false, breakOk: false }],
  contacts: [{ n: "Amma", num: "98xxxxxx21" }], cap: 90, autoblock: true, breakAccess: false, phoneAccess: true };
let lock = read("uza_lockin_v1", null) || {};
lock.blocking = lock.blocking || { distr: true, notif: true, social: true, ent: true };

function persistAll() {
  write("uza_browser_v1", browser); write("uza_youtube_v1", yt);
  write("uza_appctl_v1", apps); write("uza_lockin_v1", lock);
}

/* ---------- web managers ---------- */
function listUI(el, arr) {
  el.innerHTML = arr.map((w, i) => `<div class="list-row"><span>${esc(w)}</span><button class="mini-x" data-i="${i}" aria-label="Remove ${esc(w)}">✕</button></div>`).join("") || `<p class="muted small">Empty.</p>`;
  el.querySelectorAll("[data-i]").forEach(b => b.addEventListener("click", () => { arr.splice(+b.dataset.i, 1); persistAll(); renderWeb(); toast("Removed — saved to the Study Browser store."); }));
}
function renderWeb() {
  listUI($("#wl-out"), browser.whitelist);
  listUI($("#bl-out"), browser.blacklist);
  $("#ch-out").innerHTML = Object.entries(yt.channels).map(([c, on]) => `<div class="list-row"><span>${esc(c)} ${on ? "🟢" : "⛔"}</span>
    <button class="btn btn-ghost btn-sm" data-ch="${esc(c)}" type="button">${on ? "Remove" : "Allow"}</button></div>`).join("");
  $("#ch-out").querySelectorAll("[data-ch]").forEach(b => b.addEventListener("click", () => {
    yt.channels[b.dataset.ch] = !yt.channels[b.dataset.ch]; persistAll(); renderWeb();
    toast("Study YouTube channel list updated (#143).");
  }));
}
function addDomain(input, arr) {
  const v = $(input).value.trim().toLowerCase(), err = $("#web-err");
  if (!v.includes(".")) { err.hidden = false; err.textContent = "Enter a real domain (with a dot)."; return; }
  err.hidden = true;
  arr.push(v); $(input).value = ""; persistAll(); renderWeb(); toast("Saved ✓ the Study Browser reads this list.");
}
$("#wl-btn").addEventListener("click", () => addDomain("#wl-add", browser.whitelist));
$("#bl-btn").addEventListener("click", () => addDomain("#bl-add", browser.blacklist));

/* ---------- blocking toggles (#165–168) ---------- */
const BMAP = [["#b-distr", "distr"], ["#b-notif", "notif"], ["#b-social", "social"], ["#b-ent", "ent"]];
BMAP.forEach(([sel, key]) => {
  const el = $(sel); el.checked = lock.blocking[key];
  el.addEventListener("change", () => { lock.blocking[key] = el.checked; persistAll(); });
});

/* ---------- emergency exit (#159) ---------- */
$("#exit-check").addEventListener("click", () => {
  const v = $("#exit-test").value.trim().toUpperCase();
  $("#exit-out").innerHTML = v === "I ACCEPT THE COST"
    ? `<span style="color:var(--green);font-weight:700">✓ Phrase accepted — emergency exit would unlock.</span>`
    : `<span style="color:var(--red);font-weight:700">✗ Phrase rejected. The door stays closed.</span>`;
});

/* ---------- app rules ---------- */
function renderApps() {
  $("#a-auto").checked = apps.autoblock;
  $("#a-break").checked = apps.breakAccess;
  $("#a-phone").checked = apps.phoneAccess;
  $("#a-cap").value = apps.cap; $("#cap-out").textContent = apps.cap;
  $("#apps-out").innerHTML = apps.apps.map(a => `
    <div class="app-row ${a.allowed ? "" : "blocked"}">
      <span class="app-ico">${a.ico}</span>
      <div><p class="app-name">${esc(a.n)}</p>
        <div class="app-tags"><span class="chip ${a.allowed ? "on" : "off"}">${a.allowed ? "Allowed #170" : "Blocked"}</span>
        ${a.special ? `<span class="chip spec">${esc(a.special)}</span>` : ""}</div></div>
      <div class="use-meter">${a.used ?? 0} min used${a.limit ? ` / limit ${a.limit} min (#175)` : " / no limit"}
        <span class="use-bar"><span style="width:${a.limit ? Math.min(100, a.used / a.limit * 100) : Math.min(100, a.used)}%"></span></span></div>
      <div class="app-ctrl">
        ${a.limit !== null ? `<input type="number" min="0" max="240" step="5" value="${a.limit}" data-lim="${a.id}" aria-label="Limit for ${esc(a.n)}">` : ""}
        <span class="switch"><input type="checkbox" data-al="${a.id}" ${a.allowed ? "checked" : ""} aria-label="Allow ${esc(a.n)}"><span class="slider-ui"></span></span>
      </div></div>`).join("");
  $("#apps-out").querySelectorAll("[data-al]").forEach(c => c.addEventListener("change", () => {
    apps.apps.find(x => x.id === c.dataset.al).allowed = c.checked; renderApps(); toast("App rule updated (#170).");
  }));
  $("#apps-out").querySelectorAll("[data-lim]").forEach(i => i.addEventListener("change", () => {
    apps.apps.find(x => x.id === i.dataset.lim).limit = Math.max(0, Math.min(240, +i.value)); renderApps(); toast("Custom limit saved (#175).");
  }));
  $("#em-out").innerHTML = apps.contacts.map((c, i) => `<div class="list-row"><span>🚨 <strong>${esc(c.n)}</strong> · ${esc(c.num)}</span>
    <button class="mini-x" data-em="${i}" aria-label="Remove ${esc(c.n)}">✕</button></div>`).join("") || `<p class="muted small">None — add at least one.</p>`;
  $("#em-out").querySelectorAll("[data-em]").forEach(b => b.addEventListener("click", () => { apps.contacts.splice(+b.dataset.em, 1); renderApps(); toast("Contact removed."); }));
}
$("#a-auto").addEventListener("change", e => apps.autoblock = e.target.checked);
$("#a-break").addEventListener("change", e => apps.breakAccess = e.target.checked);
$("#a-phone").addEventListener("change", e => apps.phoneAccess = e.target.checked);
$("#a-cap").addEventListener("input", e => { apps.cap = +e.target.value; $("#cap-out").textContent = apps.cap; });
$("#em-add").addEventListener("click", () => {
  const n = $("#em-name").value.trim(), num = $("#em-num").value.trim(), err = $("#app-err");
  if (n.length < 2 || num.length < 6) { err.hidden = false; err.textContent = "Enter a name and valid number."; return; }
  err.hidden = true; apps.contacts.push({ n, num });
  $("#em-name").value = ""; $("#em-num").value = ""; renderApps(); toast("Emergency contact added (#173).");
});

/* ---------- save all ---------- */
$("#save-all").addEventListener("click", () => { persistAll(); toast("All settings saved across pages ✓"); });

document.addEventListener("DOMContentLoaded", () => { renderWeb(); renderApps(); });
