"use strict";
/* UPSC ZONE AI — signup.js · demo accounts persist in localStorage.
   AccountsAPI is isolated & API-ready (swap for POST /api/auth/signup). */
const LS_ACCOUNTS = "uza_accounts_v1", LS_SIGNUP = "uza_signup_v1", DEMO_EMAIL = "aspirant@upsczone.ai";
const $ = s => document.querySelector(s);
const wait = ms => new Promise(r => setTimeout(r, ms));
const esc = s => { const d = document.createElement("div"); d.textContent = s; return d.innerHTML; };

const AccountsAPI = {
  all() { try { return JSON.parse(localStorage.getItem(LS_ACCOUNTS)) || []; } catch { return []; } },
  save(l) { localStorage.setItem(LS_ACCOUNTS, JSON.stringify(l)); },
  exists(email) { return this.all().some(a => a.email === email); },
  seed() { if (!this.exists(DEMO_EMAIL)) { const l = this.all(); l.push({ name: "Aarav Sharma", email: DEMO_EMAIL, demo: true, createdAt: new Date().toISOString() }); this.save(l); } },
  async signup(profile) {                       // POST /api/auth/signup
    await wait(950);
    if (this.exists(profile.email)) { const e = new Error("An account with this email already exists."); e.code = "email_taken"; throw e; }
    const l = this.all(); l.push({ ...profile, createdAt: new Date().toISOString() }); this.save(l);
    localStorage.setItem(LS_SIGNUP, JSON.stringify(profile));
    return profile;
  }
};

const form = $("#signup-form"), banner = $("#banner"), submitBtn = $("#submit-btn");
const fields = { name: $("#name"), email: $("#email"), password: $("#password"), confirm: $("#confirm"), terms: $("#terms") };
const errs = { name: $("#name-err"), email: $("#email-err"), password: $("#pass-err"), confirm: $("#confirm-err"), terms: $("#terms-err") };

function setBanner(type, html) { banner.hidden = false; banner.className = "banner " + type; banner.innerHTML = html; }
function setErr(key, msg) { errs[key].textContent = msg; errs[key].hidden = false; if (fields[key].type !== "checkbox") fields[key].classList.add("invalid"); fields[key].setAttribute("aria-invalid", "true"); }
function clearErr(key) { errs[key].hidden = true; if (fields[key].type !== "checkbox") fields[key].classList.remove("invalid"); fields[key].removeAttribute("aria-invalid"); }
function validEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()); }

/* password strength (0–4) */
function strengthOf(p) { let s = 0; if (p.length >= 8) s++; if (p.length >= 12) s++; if (/[a-z]/.test(p) && /[A-Z]/.test(p)) s++; if (/\d/.test(p)) s++; if (/[^A-Za-z0-9]/.test(p)) s++; return Math.min(4, s); }
const STRENGTH_UI = [
  { t: "Too short", c: "var(--red)" }, { t: "Weak — add length & numbers", c: "var(--red)" },
  { t: "Fair — add a capital or symbol", c: "var(--saffron)" },
  { t: "Good", c: "#7aa647" }, { t: "Strong ✓", c: "var(--green)" }
];
fields.password.addEventListener("input", () => {
  clearErr("password");
  const s = strengthOf(fields.password.value), ui = STRENGTH_UI[s];
  $("#strength-bar").style.width = (s / 4 * 100) + "%";
  $("#strength-bar").style.background = ui.c;
  $("#strength-label").textContent = fields.password.value ? `Strength: ${ui.t}` : "Minimum 8 characters";
});
fields.confirm.addEventListener("input", () => clearErr("confirm"));
fields.name.addEventListener("input", () => clearErr("name"));
fields.email.addEventListener("input", () => clearErr("email"));

function validate() {
  let ok = true, first = null;
  if (fields.name.value.trim().length < 2) { setErr("name", "Please enter your name (2+ characters)."); ok = false; first = first || fields.name; } else clearErr("name");
  if (!fields.email.value.trim()) { setErr("email", "Email is required."); ok = false; first = first || fields.email; }
  else if (!validEmail(fields.email.value)) { setErr("email", "Enter a valid email address."); ok = false; first = first || fields.email; }
  else if (AccountsAPI.exists(fields.email.value.trim().toLowerCase())) { setErr("email", "This email is already registered — try logging in."); ok = false; first = first || fields.email; }
  else clearErr("email");
  if (fields.password.value.length < 8) { setErr("password", "Password must be at least 8 characters."); ok = false; first = first || fields.password; }
  else if (strengthOf(fields.password.value) < 2) { setErr("password", "Password is too weak — mix cases, numbers or symbols."); ok = false; first = first || fields.password; }
  else clearErr("password");
  if (fields.confirm.value !== fields.password.value || !fields.confirm.value) { setErr("confirm", "Passwords do not match."); ok = false; first = first || fields.confirm; } else clearErr("confirm");
  if (!fields.terms.checked) { setErr("terms", "Please accept the demo terms to continue."); ok = false; first = first || fields.terms; } else clearErr("terms");
  if (first) first.focus();
  return ok;
}

function setLoading(on) {
  submitBtn.disabled = on;
  submitBtn.innerHTML = on ? '<span class="spinner"></span> Creating account…' : "Create account →";
}

form.addEventListener("submit", async e => {
  e.preventDefault();
  if (!validate()) return;
  setLoading(true); banner.hidden = true;
  try {
    const p = await AccountsAPI.signup({
      name: fields.name.value.trim(), email: fields.email.value.trim().toLowerCase(),
      attempt: $("#attempt").value, optional: $("#optional").value
    });
    setLoading(false);
    form.hidden = true; $("#demo-box").hidden = true;
    $("#su-name").textContent = p.name.split(" ")[0];
    const sc = $("#success-card"); sc.hidden = false; sc.focus();
    setBanner("success", "Account created locally (demo). Redirecting to onboarding…");
    setTimeout(() => { location.href = "onboarding.html"; }, 2200);
  } catch (err) {
    setLoading(false);
    if (err.code === "email_taken") { setErr("email", err.message); setBanner("error", `<strong>Could not create account.</strong> ${esc(err.message)} <a href="login.html" style="color:inherit;font-weight:700">Log in instead →</a>`); fields.email.focus(); }
    else setBanner("error", "<strong>Something went wrong.</strong> Please try again.");
  }
});

/* prefill from a previous session */
document.addEventListener("DOMContentLoaded", () => {
  AccountsAPI.seed();
  try {
    const prev = JSON.parse(localStorage.getItem(LS_SIGNUP));
    if (prev && prev.name) setBanner("info", `Signed up before as <strong>${esc(prev.name)}</strong>? <a href="login.html" style="color:inherit;font-weight:700">Log in →</a>`);
  } catch {}
  fields.name.focus();
});
