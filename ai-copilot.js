"use strict";
/* UPSC ZONE AI — ai-copilot.js
   Features: #1 #2 #6 #7 #15 #16 #17 · CopilotAPI isolated & API-ready. */
const LS = "uza_copilot_v1";
const $ = s => document.querySelector(s);
const wait = ms => new Promise(r => setTimeout(r, ms));
const esc = s => { const d = document.createElement("div"); d.textContent = s; return d.innerHTML; };

let S = {}; try { S = JSON.parse(localStorage.getItem(LS)) || {}; } catch {}
const save = () => localStorage.setItem(LS, JSON.stringify(S));

const EXPLAIN = {
  monetary: {
    eli5: "Imagine RBI is the mother of all banks. When banks run short of money they borrow from her overnight — the interest she charges is the repo rate. If prices rise too fast, she charges more, everyone spends less, and prices calm down.",
    aspirant: "Repo rate = rate at which RBI lends short-term funds to banks against securities. It is the MPC's key policy rate (6 members, chaired by RBI Governor, 4% ±2% CPI target). Transmission: repo ↑ → bank lending ↑ → demand ↓ → inflation cools. GS-3 links: LAF tools (repo, SDF, MSF), CRR/SLR, MPC composition (3 RBI + 3 govt nominees).",
    expert: "Under flexible inflation targeting (RBI Act amended 2016), the MPC sets repo against a 4% CPI band. Note corridor asymmetry: SDF now forms the effective floor; MSF/BRF the ceiling. Examine transmission-lag evidence (Urjit Patel Committee 2013) and the post-2022 'withdrawal of accommodation' debate. PYQ angle: 'effective lower bound' of Indian policy rates."
  },
  monsoon: {
    eli5: "Every summer India's land gets very hot while the sea stays cooler. Wind rushes in from the sea carrying water, and squeezes it out over mountains as rain. That's the monsoon — India's biggest water delivery system.",
    aspirant: "SW monsoon (June–Sept) delivers ~75% of India's rainfall. Mechanism: differential heating + ITCZ shift; splits into Arabian Sea & Bay of Bengal branches; Western Ghats give orographic rainfall. Key facts: Kerala onset ~1 June, break-monsoon spells, ENSO & IOD influence. GS-1 climatology + GS-3 agriculture (~52% net sown area unirrigated).",
    expert: "Contrast thermodynamic (land–sea contrast) vs dynamic frameworks (TEJ, cross-equatorial flow, MJO modulation). Recent literature downplays pure thermal theory. Link IMD long-range models, MONEX/TRMM datasets, and Economic Survey chapters on monsoon–GDP elasticity; 2023 IMD monsoon mission upgrades are worth a line in answers."
  },
  art32: {
    eli5: "If someone takes your basic rights, you can knock on two doors. The big Delhi door (Supreme Court, Art. 32) MUST open for rights. State doors (High Courts, Art. 226) can open for rights AND many other problems — so they're actually wider!",
    aspirant: "Art. 32: SC writ jurisdiction for Fundamental Rights — itself a FR ('heart and soul' per Ambedkar). Art. 226: HC jurisdiction is WIDER — FRs + 'any other purpose' — but discretionary; Art. 32 cannot be refused. Writs: habeas corpus, mandamus, prohibition, certiorari, quo-warranto.",
    expert: "Width vs certainty trade-off: 226 exceeds 32 in scope, yet 32's non-derogability (post-44th Amendment, Arts 20–21 survive Emergency) is structurally superior. Landmarks: Romesh Thappar (1950), ADM Jabalpur (1976) overruled in Puttaswamy (2017), L. Chandra Kumar (1997) — 226/32 as basic structure."
  }
};

/* ---------- API-ready layer ---------- */
const CopilotAPI = {
  async chat(msg, buddy) {             // POST /api/chat
    await wait(650);
    const s = msg.toLowerCase(); let r;
    if (s.includes("study now") || s.includes("what should")) r = "Based on your twin: 1 hour → 25 adaptive MCQs on Fundamental Rights (42% accuracy, your weakest). Then 15 min revision cards. Queue it?";
    else if (s.includes("repo")) r = EXPLAIN.monetary.aspirant;
    else if (s.includes("evening") || s.includes("plan")) r = "Built: 19:00–19:45 Polity weak block → break → 19:55–20:45 sectional mock → 20:45–20:50 error log. I can hand this to Lock-In.";
    else if (s.includes("quiz")) r = "Q1: Which writ is issued to restrain a person from holding a public office they are not entitled to? (a) Mandamus (b) Quo-warranto (c) Certiorari (d) Prohibition. Reply with your answer.";
    else if (s.includes("demotivat") || s.includes("tired")) r = buddy ? "Buddy mode: remember day 1. You've held a 12-day streak — most aspirants quit at day 4. One honest hour today. I'll stay with you." : "Reset protocol: 10-minute walk, then a 25-minute block on your strongest subject to rebuild momentum.";
    else if (s.includes("quo-warranto") || s.includes("b")) r = "Correct — (b) Quo-warranto ('by what authority'). Next: which writ can be issued against BOTH public and private bodies? (That one's mandamus territory — think about it.)";
    else r = "I can plan, explain at 3 depths, resolve doubts, generate MCQs and keep you accountable. Try the quick prompts below.";
    return r + (buddy ? "" : "");
  },
  async explain(topic, level) { await wait(700); return EXPLAIN[topic][level]; },   // POST /api/explain
  async solveDoubt(q) {            // POST /api/doubts
    await wait(800);
    const s = q.toLowerCase();
    if (s.includes("money bill")) return "Art. 109–110: Money Bills can only be introduced in Lok Sabha, on the President's recommendation. Rajya Sabha may delay only 14 days — no amendment, no rejection. The Speaker certifies a Money Bill; limited judicial review (Aadhaar case 2018). Exam trap: 'RS can amend Money Bills' — always false.";
    if (s.includes("monsoon")) return "Onset: monsoon hits Kerala ~1 June, advances via two branches. Withdrawal begins mid-September over NW India. 'Mawsynram wettest' and Western Ghats orographic effect are classic Prelims frames.";
    return "In the full product this cites NCERTs, standard texts and PYQs, then converts to a flashcard. Demo shortcuts: ask about Money Bills, the monsoon, repo rate or Article 32.";
  }
};

/* ---------- chat render ---------- */
const log = $("#chat-log");
const LEVEL_NAMES = { eli5: "ELI5 · #15", aspirant: "Aspirant · #16", expert: "Expert · #17" };
function emptyState() {
  log.innerHTML = `<div class="empty-chat">👋 Conversation cleared. Ask anything — plans, explanations, doubts, motivation.<br><span class="small">History persists in this browser until cleared.</span></div>`;
}
function addMsg(role, text, meta, persist = true) {
  if (log.querySelector(".empty-chat")) log.innerHTML = "";
  const d = document.createElement("div");
  d.className = "msg " + role;
  d.innerHTML = (meta ? `<span class="meta">${meta}</span>` : "") + `<div class="msg-txt">${text}</div>`;
  if (role === "ai") {
    const acts = document.createElement("div");
    acts.className = "msg-actions";
    const copy = document.createElement("button"); copy.type = "button"; copy.className = "mini-btn"; copy.textContent = "⧉ Copy";
    copy.addEventListener("click", async () => {
      try { await navigator.clipboard.writeText(d.querySelector(".msg-txt").textContent); toast("Copied to clipboard ✓"); }
      catch { toast("Clipboard blocked by browser — select & copy manually.", true); }
    });
    const saveBtn = document.createElement("button"); saveBtn.type = "button"; saveBtn.className = "mini-btn"; saveBtn.textContent = "💾 Save to Notes";
    saveBtn.addEventListener("click", () => {
      const notes = JSON.parse(localStorage.getItem("uza_saved_copilot_v1") || "[]");
      notes.push({ t: new Date().toISOString(), text: d.querySelector(".msg-txt").textContent });
      localStorage.setItem("uza_saved_copilot_v1", JSON.stringify(notes));
      toast("Saved — find it in Smart Notes (demo bridge) ✓");
    });
    acts.append(copy, saveBtn); d.appendChild(acts);
  }
  log.appendChild(d); log.scrollTop = log.scrollHeight;
  if (persist) { S.history = S.history || []; S.history.push({ role, text, meta }); S.history = S.history.slice(-40); save(); }
  return d;
}
function typing(on) {
  let t = log.querySelector(".typing");
  if (on && !t) { t = document.createElement("div"); t.className = "typing"; t.innerHTML = "<i></i><i></i><i></i>"; t.setAttribute("aria-label", "Copilot is typing"); log.appendChild(t); log.scrollTop = log.scrollHeight; }
  if (!on && t) t.remove();
}

/* ---------- send ---------- */
async function send(text, meta) {
  if (!text.trim()) return;
  addMsg("user", esc(text));
  typing(true);
  try {
    const r = await CopilotAPI.chat(text, $("#buddy-toggle").checked);
    typing(false); addMsg("ai", esc(r), meta);
  } catch { typing(false); addMsg("ai", "⚠ Something went wrong on my side (demo). Please retry."); }
}
$("#chat-form").addEventListener("submit", e => {
  e.preventDefault();
  const i = $("#chat-input"); send(i.value); i.value = "";
});
document.querySelectorAll(".chip").forEach(c => c.addEventListener("click", () => send(c.textContent)));

/* ---------- explain (#15/16/17) ---------- */
$("#exp-btn").addEventListener("click", async () => {
  const topic = $("#exp-topic").value, level = document.querySelector('input[name="lvl"]:checked').value;
  addMsg("user", `Explain “${$("#exp-topic").selectedOptions[0].text}” — ${LEVEL_NAMES[level]}`);
  typing(true);
  const txt = await CopilotAPI.explain(topic, level);
  typing(false);
  addMsg("ai", esc(txt), LEVEL_NAMES[level]);
  S.lastReply = txt; save();
});

/* ---------- doubts (#6) ---------- */
$("#doubt-form").addEventListener("submit", async e => {
  e.preventDefault();
  const q = $("#doubt-q"), err = $("#doubt-err");
  if (q.value.trim().length < 8) { err.textContent = "Describe the doubt in a few more words."; err.hidden = false; q.focus(); return; }
  err.hidden = true;
  addMsg("user", "Doubt: " + esc(q.value.trim()), null);
  typing(true);
  const a = await CopilotAPI.solveDoubt(q.value.trim());
  typing(false); addMsg("ai", esc(a), "Doubt Solver · #6");
  S.lastReply = a; save(); q.value = "";
});

/* ---------- voice (#7) ---------- */
const readBtn = $("#voice-read");
readBtn.addEventListener("click", () => {
  const err = $("#voice-err"); err.hidden = true;
  if (!("speechSynthesis" in window)) { err.textContent = "This browser has no speech engine — try Chrome/Edge."; err.hidden = false; return; }
  if (speechSynthesis.speaking) { speechSynthesis.cancel(); readBtn.textContent = "🔊 Read last reply"; readBtn.setAttribute("aria-pressed", "false"); return; }
  const txt = S.lastReply || "Hello aspirant. Generate an explanation or doubt answer first, and I will read it aloud.";
  const u = new SpeechSynthesisUtterance(txt); u.lang = "en-IN"; u.rate = 0.98;
  u.onend = () => { readBtn.textContent = "🔊 Read last reply"; readBtn.setAttribute("aria-pressed", "false"); };
  speechSynthesis.speak(u);
  readBtn.textContent = "⏹ Stop"; readBtn.setAttribute("aria-pressed", "true");
});
$("#voice-ask").addEventListener("click", () => {
  const err = $("#voice-err"); err.hidden = true;
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) { err.textContent = "Voice input isn't supported here — type your question instead."; err.hidden = false; return; }
  const rec = new SR(); rec.lang = "en-IN"; rec.interimResults = false;
  toast("🎤 Listening… speak your question.");
  rec.onresult = e => { const t = e.results[0][0].transcript; $("#chat-input").value = t; send(t); };
  rec.onerror = () => { err.textContent = "Couldn't hear you — check microphone permission and retry."; err.hidden = false; };
  rec.start();
});

/* ---------- buddy (#2) ---------- */
const buddy = $("#buddy-toggle");
buddy.checked = S.buddy !== false;
function buddyUI() { $("#buddy-note").textContent = buddy.checked ? "Buddy ON: replies include accountability nudges and streak protection." : "Buddy OFF: pure tutor mode."; }
buddy.addEventListener("change", () => { S.buddy = buddy.checked; save(); buddyUI(); toast(buddy.checked ? "Study Buddy active." : "Buddy paused."); });
buddyUI();

/* ---------- clear + restore ---------- */
$("#clear-chat").addEventListener("click", () => {
  S.history = []; save(); emptyState(); toast("Chat cleared.");
});
function toast(msg, isErr) { const t = $("#toast"); t.textContent = msg; t.hidden = false; clearTimeout(toast._t); toast._t = setTimeout(() => t.hidden = true, 2800); }

document.addEventListener("DOMContentLoaded", () => {
  if (!S.history || !S.history.length) { emptyState(); return; }
  S.history.forEach(m => addMsg(m.role, m.text.startsWith("<") ? m.text : esc(m.text), m.meta, false));
});
