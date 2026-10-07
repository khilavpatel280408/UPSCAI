"use strict";
/* UPSC ZONE AI — forgot-password.js · 3-step demo reset flow.
   ResetAPI is isolated & API-ready (request / verify / setPassword). */
const LS_STATE = "uza_pwreset_v1";
const DEMO_EMAIL = "aspirant@upsczone.ai";
const DEMO_CODE = "246810";                 // shown honestly in the UI
const $ = s => document.querySelector(s);
const wait = ms => new Promise(r => setTimeout(r, ms));
const esc = s => { const d = document.createElement("div"); d.textContent = s; return d.innerHTML; };

const ResetAPI = {
  knownEmails() {
    try { return [DEMO_EMAIL, ...((JSON.parse(localStorage.getItem("uza_accounts_v1")) || []).map(a => a.email))]; }
    catch { return [DEMO_EMAIL]; }
  },
  async request(email) {                    // POST /api/auth/reset/request
    await wait(900);
    if (!this.knownEmails().includes(email)) { const e = new Error("No account found for this email."); e.code = "not_found"; throw e; }
    return { code: DEMO_CODE };
  },
  async verify(code) { await wait(700); if (code !== DEMO_CODE) { const e = new Error("Invalid code."); e.code = "bad_code"; throw e; } return true; },  // POST /api/auth/reset/verify
  async setPassword(email, pw) {            // POST /api/auth/reset/confirm
    await wait(900);
    try {
      const list = JSON.parse(localStorage.getItem("uza_accounts_v1")) || [];
      const i = list.findIndex(a => a.email === email);
      if (i > -1) { list[i].password = pw; localStorage.setItem("uza_accounts_v1", JSON.stringify(list)); }
      else if (email === DEMO_EMAIL) localStorage.setItem("uza_demo_password_v1", pw);
    } catch {}
    return true;
  }
};

/* ---------- state (persists across refresh) ---------- */
let state = { step: 1, email: "", attempts: 3 };
try { const saved = JSON.parse(localStorage.getItem(LS_STATE)); if (saved && saved.step) state = saved; } catch {}
const persist = () => localStorage.setItem(LS_STATE, JSON.stringify(state));

const banner = $("#banner"), panels = [...document.querySelectorAll(".step-panel")];
function setBanner(type, html) { banner.hidden = false; banner.className = "banner " + type; banner.innerHTML = html; }
function clearBanner() { banner.hidden = true; banner.innerHTML = ""; }

function goStep(n) {
  state.step = n; persist();
  panels.forEach(p => { p.hidden = Number(p.dataset.step) !== n; });
  document.querySelectorAll("#steps-ind li").forEach(li => {
    const i = Number(li.dataset.ind);
    li.classList.toggle("cur", i === n); li.classList.toggle("done", i < n);
    if (i === n) li.setAttribute("aria-current", "step"); else li.removeAttribute("aria-current");
  });
  $("#steps-ind").style.display = n === 4 ? "none" : "flex";
  const h = document.querySelector(`.step-panel[data-step="${n}"] .panel-h`);
  if (h) h.focus();
  clearBanner();
}

/* ---------- step 1: email ---------- */
function setFieldErr(input, el, msg) { el.textContent = msg; el.hidden = false; input.classList.add("invalid"); input.setAttribute("aria-invalid", "true"); }
function clearFieldErr(input, el) { el.hidden = true; input.classList.remove("invalid"); input.removeAttribute("aria-invalid"); }
function validEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()); }
function btnLoading(btn, on, idle) { btn.disabled = on; btn.innerHTML = on ? '<span class="spinner"></span> Working…' : idle; }

$("#form-email").addEventListener("submit", async e => {
  e.preventDefault();
  const email = $("#email"), err = $("#email-err");
  if (!validEmail(email.value)) { setFieldErr(email, err, "Enter a valid email address."); return; }
  clearFieldErr(email, err);
  btnLoading($("#btn-send"), true, "Send reset code →");
  try {
    await ResetAPI.request(email.value.trim().toLowerCase());
    state.email = email.value.trim().toLowerCase(); state.attempts = 3;
    $("#echo-email").textContent = state.email;
    goStep(2);
    setBanner("info", `Demo honesty: no email is sent. Your code is <strong>${DEMO_CODE}</strong>.`);
  } catch (ex) {
    if (ex.code === "not_found") setFieldErr(email, err, ex.message + " Try the demo account below.");
    setBanner("error", "<strong>Could not send reset code.</strong> Check the email address.");
  } finally { btnLoading($("#btn-send"), false, "Send reset code →"); }
});
$("#email").addEventListener("input", () => clearFieldErr($("#email"), $("#email-err")));

/* ---------- step 2: code ---------- */
$("#form-code").addEventListener("submit", async e => {
  e.preventDefault();
  const code = $("#code"), err = $("#code-err");
  if (!/^\d{6}$/.test(code.value.trim())) { setFieldErr(code, err, "Enter the 6-digit code."); return; }
  clearFieldErr(code, err);
  btnLoading($("#btn-verify"), true, "Verify code");
  try {
    await ResetAPI.verify(code.value.trim());
    goStep(3);
    setBanner("success", "Code verified ✓ Set your new password below.");
  } catch {
    state.attempts--; persist();
    if (state.attempts <= 0) {
      setBanner("error", "<strong>Too many wrong attempts.</strong> Use “Resend code” to restore attempts.");
      $("#btn-verify").disabled = true;
    } else {
      setFieldErr(code, err, `Wrong code — ${state.attempts} attempt${state.attempts === 1 ? "" : "s"} left.`);
      setBanner("error", `That code is incorrect. Hint: the demo code was shown in the blue notice.`);
    }
    code.select();
  } finally { btnLoading($("#btn-verify"), false, "Verify code"); }
});
$("#btn-resend").addEventListener("click", () => {
  state.attempts = 3; persist();
  $("#btn-verify").disabled = false; $("#code").value = "";
  setBanner("info", `Code re-sent (demo). Your code is <strong>${DEMO_CODE}</strong>. Attempts restored: 3.`);
  $("#code").focus();
});
$("#code").addEventListener("input", () => clearFieldErr($("#code"), $("#code-err")));

/* ---------- step 3: new password ---------- */
function strengthOf(p) { let s = 0; if (p.length >= 8) s++; if (p.length >= 12) s++; if (/[a-z]/.test(p) && /[A-Z]/.test(p)) s++; if (/\d/.test(p)) s++; if (/[^A-Za-z0-9]/.test(p)) s++; return Math.min(4, s); }
const SUI = [{t:"Too short",c:"var(--red)"},{t:"Weak",c:"var(--red)"},{t:"Fair",c:"var(--saffron)"},{t:"Good",c:"#7aa647"},{t:"Strong ✓",c:"var(--green)"}];
$("#newpass").addEventListener("input", () => {
  clearFieldErr($("#newpass"), $("#new-err"));
  const s = strengthOf($("#newpass").value), ui = SUI[s];
  $("#strength-bar").style.width = s / 4 * 100 + "%"; $("#strength-bar").style.background = ui.c;
  $("#strength-label").textContent = $("#newpass").value ? "Strength: " + ui.t : "Minimum 8 characters";
});
$("#newconfirm").addEventListener("input", () => clearFieldErr($("#newconfirm"), $("#newc-err")));

$("#form-new").addEventListener("submit", async e => {
  e.preventDefault();
  const p = $("#newpass"), c = $("#newconfirm");
  let ok = true;
  if (p.value.length < 8 || strengthOf(p.value) < 2) { setFieldErr(p, $("#new-err"), "Use 8+ characters with mixed types."); ok = false; }
  if (c.value !== p.value || !c.value) { setFieldErr(c, $("#newc-err"), "Passwords do not match."); ok = false; }
  if (!ok) return;
  btnLoading($("#btn-set"), true, "Set new password");
  await ResetAPI.setPassword(state.email, p.value);
  btnLoading($("#btn-set"), false, "Set new password");
  localStorage.removeItem(LS_STATE);
  state = { step: 4, email: state.email, attempts: 3 };
  goStep(4);
});

/* ---------- init ---------- */
document.addEventListener("DOMContentLoaded", () => {
  $("#known-emails").textContent = [...new Set(ResetAPI.knownEmails())].slice(0, 3).join(" · ");
  if (state.email) $("#echo-email").textContent = state.email;
  if (state.step === 2 && state.attempts <= 0) $("#btn-verify").disabled = true;
  goStep(Math.min(state.step, 3));
});
