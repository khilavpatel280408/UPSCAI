"use strict";
/* ============================================================
   UPSC ZONE AI — login.js
   Demo authentication with honest mock behavior.
   AuthAPI is isolated and API-ready: swap each method for a
   real endpoint (POST /api/auth/login, session restore, logout).
   ============================================================ */

const LS_SESSION = "uza_session_v1";
const LS_GUARD   = "uza_login_guard_v1";
const DEMO = { email: "aspirant@upsczone.ai", pass: "upsc2027", name: "Aarav Sharma", attempt: "2027" };
const MAX_ATTEMPTS = 5;
const LOCK_SECONDS = 20;

const $    = (s, c = document) => c.querySelector(s);
const wait = ms => new Promise(r => setTimeout(r, ms));
const esc  = s => { const d = document.createElement("div"); d.textContent = s; return d.innerHTML; };

/* ---------------- API-ready auth layer ---------------- */
const AuthAPI = {
  /** POST /api/auth/login */
  async login(email, password) {
    await wait(950); // simulated latency — replace with real request
    if (email.trim().toLowerCase() === DEMO.email && password === DEMO.pass) {
      return { user: { name: DEMO.name, email: DEMO.email, attempt: DEMO.attempt } };
    }
    const e = new Error("Invalid email or password.");
    e.code = "auth_invalid";
    throw e;
  },
  /** GET /api/auth/session — restore persisted session */
  restore() {
    try { return JSON.parse(localStorage.getItem(LS_SESSION)) || JSON.parse(sessionStorage.getItem(LS_SESSION)); }
    catch { return null; }
  },
  /** Persist session (localStorage when "remember", else sessionStorage) */
  save(user, remember) {
    const session = { ...user, remember, loginAt: new Date().toISOString() };
    (remember ? localStorage : sessionStorage).setItem(LS_SESSION, JSON.stringify(session));
    return session;
  },
  /** POST /api/auth/logout */
  logout() { localStorage.removeItem(LS_SESSION); sessionStorage.removeItem(LS_SESSION); }
};

/* ---------------- login guard (demo rate limiting) ---------------- */
const guard = {
  read() { try { return JSON.parse(localStorage.getItem(LS_GUARD)) || { count: 0, lockUntil: 0 }; } catch { return { count: 0, lockUntil: 0 }; } },
  write(g) { localStorage.setItem(LS_GUARD, JSON.stringify(g)); },
  fail() {
    const g = this.read(); g.count += 1;
    if (g.count >= MAX_ATTEMPTS) { g.lockUntil = Date.now() + LOCK_SECONDS * 1000; g.count = 0; }
    this.write(g); return g;
  },
  reset() { localStorage.removeItem(LS_GUARD); },
  locked() { return this.read().lockUntil > Date.now(); },
  remaining() { return Math.max(0, Math.ceil((this.read().lockUntil - Date.now()) / 1000)); }
};

/* ---------------- element refs ---------------- */
const form = $("#login-form"),
  email = $("#email"), password = $("#password"),
  emailErr = $("#email-err"), passErr = $("#pass-err"),
  banner = $("#banner"), submitBtn = $("#submit-btn"),
  capsHint = $("#caps-hint"), toggleBtn = $("#toggle-pass"),
  demoBox = $("#demo-box"), successCard = $("#success-card"),
  signedCard = $("#signedin-card"),
  pageTitle = $("#page-title"), formSub = $("#form-sub");

/* ---------------- UI helpers ---------------- */
function setBanner(type, html) {
  banner.hidden = false;
  banner.className = "banner " + type;
  banner.innerHTML = html;
}
function clearBanner() { banner.hidden = true; banner.innerHTML = ""; }

function fieldError(input, el, msg) {
  el.textContent = msg; el.hidden = false;
  input.classList.add("invalid"); input.setAttribute("aria-invalid", "true");
}
function clearFieldError(input, el) {
  el.hidden = true; el.textContent = "";
  input.classList.remove("invalid"); input.removeAttribute("aria-invalid");
}
function validEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()); }

function validate() {
  let ok = true;
  if (!email.value.trim()) { fieldError(email, emailErr, "Email is required."); ok = false; }
  else if (!validEmail(email.value)) { fieldError(email, emailErr, "Enter a valid email address."); ok = false; }
  else clearFieldError(email, emailErr);

  if (!password.value) { fieldError(password, passErr, "Password is required."); ok = false; }
  else if (password.value.length < 6) { fieldError(password, passErr, "Password must be at least 6 characters."); ok = false; }
  else clearFieldError(password, passErr);
  return ok;
}
function focusFirstInvalid() {
  const bad = form.querySelector("[aria-invalid='true']");
  if (bad) bad.focus();
}
function setLoading(on) {
  form.setAttribute("aria-busy", String(on));
  submitBtn.disabled = on;
  submitBtn.innerHTML = on ? '<span class="spinner" aria-hidden="true"></span> Signing in…' : "Sign in →";
}

/* ---------------- states ---------------- */
function showLoginForm(msg) {
  signedCard.hidden = true; successCard.hidden = true;
  form.hidden = false; demoBox.hidden = false;
  pageTitle.textContent = "Welcome back, aspirant";
  formSub.textContent = "Log in to continue your preparation.";
  if (msg) setBanner("info", msg);
}
function showSignedIn(session) {
  form.hidden = true; demoBox.hidden = true; successCard.hidden = true; clearBanner();
  pageTitle.textContent = "You're already signed in";
  formSub.textContent = "Your demo session is active in this browser.";
  $("#si-email").textContent = session.email;
  $("#si-time").textContent = new Date(session.loginAt).toLocaleString("en-IN");
  signedCard.hidden = false;
}
function showSuccess(user) {
  form.hidden = true; demoBox.hidden = true; signedCard.hidden = true; clearBanner();
  $("#success-name").textContent = user.name;
  successCard.hidden = false;
  successCard.focus();
  setTimeout(() => { location.href = "dashboard.html"; }, 2000);
}

/* ---------------- lockout ---------------- */
let lockTimer = null;
function startLockout() {
  setLoading(false);
  form.classList.add("locked");
  [email, password, submitBtn].forEach(el => (el.disabled = true));
  const tick = () => {
    const s = guard.remaining();
    if (s <= 0) {
      clearInterval(lockTimer); lockTimer = null;
      [email, password, submitBtn].forEach(el => (el.disabled = false));
      form.classList.remove("locked");
      setBanner("info", "Lockout ended — you can try again now.");
      return;
    }
    setBanner("warn", `<strong>Too many failed attempts.</strong> Try again in <strong>${s}s</strong>. Tip: use the demo credentials below.`);
  };
  tick();
  lockTimer = setInterval(tick, 1000);
}

/* ---------------- events ---------------- */
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (guard.locked()) return;
  if (!validate()) { focusFirstInvalid(); return; }
  clearBanner();
  setLoading(true);
  try {
    const { user } = await AuthAPI.login(email.value, password.value);
    guard.reset();
    AuthAPI.save(user, $("#remember").checked);
    setLoading(false);
    showSuccess(user);
  } catch (err) {
    const g = guard.fail();
    setLoading(false);
    if (g.lockUntil > Date.now()) { startLockout(); return; }
    const left = MAX_ATTEMPTS - g.count;
    setBanner("error",
      `<strong>Could not sign in.</strong> ${esc(err.message)} Check the demo credentials below. <strong>${left}</strong> attempt${left === 1 ? "" : "s"} left before a short lockout.`);
    password.focus();
  }
});

email.addEventListener("input", () => clearFieldError(email, emailErr));
password.addEventListener("input", () => clearFieldError(password, passErr));

["keydown", "keyup"].forEach(ev =>
  password.addEventListener(ev, e => {
    if (e.getModifierState) capsHint.hidden = !e.getModifierState("CapsLock");
  })
);
password.addEventListener("blur", () => { capsHint.hidden = true; });

toggleBtn.addEventListener("click", () => {
  const show = password.type === "password";
  password.type = show ? "text" : "password";
  toggleBtn.setAttribute("aria-pressed", String(show));
  toggleBtn.querySelector(".tp-txt").textContent = show ? "Hide" : "Show";
  password.focus();
});

$("#fill-demo").addEventListener("click", () => {
  email.value = DEMO.email;
  password.value = DEMO.pass;
  clearFieldError(email, emailErr); clearFieldError(password, passErr);
  setBanner("info", "Demo credentials filled — press <strong>Sign in</strong>.");
  submitBtn.focus();
});

$("#signout-btn").addEventListener("click", () => {
  AuthAPI.logout();
  showLoginForm("You have been signed out of this demo session.");
  email.focus();
});

/* ---------------- brand-pane countdown ---------------- */
function renderCountdown() {
  const prelims = new Date("2027-05-30T09:30:00+05:30"); // indicative date
  const days = Math.max(0, Math.ceil((prelims - Date.now()) / 864e5));
  $("#count-chip").textContent = `⏳ UPSC Prelims 2027 (indicative): ${days} days away`;
}

/* ---------------- init ---------------- */
document.addEventListener("DOMContentLoaded", () => {
  renderCountdown();
  const session = AuthAPI.restore();
  if (session) showSignedIn(session);
  else email.focus();
  if (guard.locked()) startLockout();
});
