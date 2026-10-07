/* ============================================================
   UPSC ZONE AI — index.js
   Isolated mock-AI layer (API-ready) + all page interactions.
   Replace functions in `UPSC_API` with real endpoints later.
   ============================================================ */
"use strict";

/* ---------------- storage ---------------- */
const STORE_KEY = "uza_index_v1";
const store = {
  get() { try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; } catch { return {}; } },
  set(patch) { const s = { ...this.get(), ...patch }; localStorage.setItem(STORE_KEY, JSON.stringify(s)); return s; }
};
const wait = ms => new Promise(r => setTimeout(r, ms));
const $  = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];

/* ---------------- honest mock AI (API-ready) ---------------- */
const UPSC_API = {
  /** #11 What Should I Study Now? — swap for POST /api/recommend/next-action */
  async whatNow(minutes) {
    await wait(700);
    const weak = MOCK.weakAreas[0];
    if (minutes <= 30) return { action: `Rapid revision of ${weak.topic}`, why: `Your weakest area (${weak.sub}, ${weak.acc}% accuracy) plus a due revision slot. Short window → retrieval practice beats new study.`, ctas: [["revision.html", "Open Revision Center"], ["mock-tests.html", "Quick 10-Q Test"]] };
    if (minutes <= 60) return { action: `25 MCQs: ${weak.topic} (adaptive, UPSC Standard+)`, why: `1-hour window targets your ${weak.sub} weakness with adaptive difficulty, then auto-logs mistakes.`, ctas: [["mock-tests.html", "Start Topic Test"], ["mistake-notebook.html", "View Mistake Notebook"]] };
    if (minutes <= 120) return { action: `Deep block: ${weak.topic} → concept reading + 40 MCQs + error log`, why: `2 hours allows a full learn→practice→analyze loop on your weakest subject before tonight's CA digest.`, ctas: [["topic-explorer.html", "Explore Topic"], ["test-interface.html", "Open Test Interface"]] };
    return { action: `Full cycle: Polity weak block → sectional mock → mistake review → 20-min current affairs`, why: `3+ hours is a mini-simulation day. Your readiness (68%) rewards depth over breadth right now.`, ctas: [["ai-planner.html", "Generate Full Schedule"], ["lock-in.html", "Enter Lock-In Mode"]] };
  },

  /** #5 AI Daily Briefing — swap for GET /api/briefing/daily */
  async dailyBrief() {
    await wait(600);
    return MOCK.briefing;
  },

  /** #3 AI Personalized Study Plan — swap for POST /api/plan/generate */
  async generatePlan(input) {
    await wait(900);
    const months = input.attempt === "2027" ? 8 : 18;
    const per = Math.max(2, Math.round(months / 7));
    const intensity = { balanced: "steady", standard: "high", expert: "peak" }[input.diff] || "high";
    return {
      attempt: input.attempt, intensity,
      phases: [
        { name: "Foundation (NCERTs + syllabus mapping)", len: `${per} mo`, load: `${input.hours} h/day` },
        { name: "Concept Building + first notes pass", len: `${per} mo`, load: `${input.hours} h/day` },
        { name: "PYQ Intelligence + sectional tests", len: `${per} mo`, load: `${input.hours} h/day` },
        { name: "Mock Tests + Mistake Notebook loops", len: `${per} mo`, load: "+1 h tests" },
        { name: "Spaced Revision cycles (AI-scheduled)", len: `${per} mo`, load: "40% of day" },
        { name: "Mains Answer Writing + Essay sprints", len: `${per} mo`, load: "2 answers/day" },
        { name: "Final consolidation → Exam Ready", len: "last 4 wks", load: "simulator mode" }
      ]
    };
  },

  /** #4 AI Study Autopilot — swap for POST /api/autopilot/schedule */
  async autopilot(hours) {
    await wait(750);
    if (!hours || hours < 1 || hours > 14) throw new Error("Enter hours between 1 and 14.");
    const start = new Date(); start.setMinutes(start.getMinutes() < 30 ? 30 : 60, 0, 0);
    const units = [
      ["Polity — Fundamental Rights (weak area)", "practice"],
      ["Current Affairs digest + notes", "learn"],
      ["Economy — Monetary Policy revision cards", "revise"],
      ["40 adaptive MCQs + error log", "practice"],
      ["Mains: one 150-word answer", "writing"],
      ["Recall test: yesterday's topics", "revise"]
    ];
    const blocks = [];
    let t = new Date(start), left = hours;
    for (let i = 0; i < units.length && left > 0; i++) {
      const len = Math.min(left, i === 0 ? 0.75 : 0.75);
      const end = new Date(t.getTime() + len * 3600e3);
      blocks.push({ from: t, to: end, task: units[i][0], type: units[i][1] });
      t = new Date(end.getTime() + 10 * 6e4); left -= len + (10 / 60);
    }
    return blocks;
  },

  /** #15/16/17 Explain levels — swap for POST /api/explain */
  async explain(topic, level) { await wait(650); return MOCK.explanations[topic][level]; },

  /** #6 Doubt Solver — swap for POST /api/doubts */
  async solveDoubt(q) {
    await wait(800);
    const s = q.toLowerCase();
    if (s.includes("money bill")) return { a: "Article 109 + 110: a Money Bill can only be introduced in the Lok Sabha, and only on the President's recommendation. The Rajya Sabha may only delay it by 14 days — it cannot amend or reject it. The Lok Sabha Speaker certifies a bill as a Money Bill, and that decision is subject to limited judicial review (Aadhaar case, 2018).", tip: "Prelims trap: 'Rajya Sabha can amend Money Bills' — always false." };
    if (s.includes("repo") || s.includes("monetary")) return { a: "The repo rate is the rate at which RBI lends short-term funds to banks against government securities. Raising it tightens liquidity and cools inflation; cutting it boosts credit growth. It is decided by the 6-member Monetary Policy Committee chaired by the RBI Governor.", tip: "Link to GS-3: MPC composition = 3 RBI + 3 Government nominees." };
    if (s.includes("article 32") || s.includes("article 226")) return { a: "Article 32 gives the Supreme Court power to issue writs for Fundamental Rights enforcement — itself a fundamental right. Article 226 gives High Courts wider writ jurisdiction: they can issue writs for fundamental rights AND 'any other purpose' (ordinary legal rights).", tip: "This exact confusion appears repeatedly in PYQs — see your Mistake Notebook entry." };
    return { a: "Good doubt. In the full product, the Doubt Solver cites NCERTs, standard texts and PYQs to answer this precisely and converts it into a flashcard. In this demo, try asking about: Money Bills, the repo rate, or Article 32 vs 226.", tip: "Every resolved doubt can become a note, flashcard or MCQ." };
  },

  /** #1/#2 Copilot + Buddy chat — swap for POST /api/chat */
  async chat(msg, buddyMode) {
    await wait(600);
    const s = msg.toLowerCase();
    let out;
    if (s.includes("study now") || s.includes("what should")) out = "Based on your twin profile: 1 hour → 25 adaptive MCQs on Fundamental Rights (your weakest area at 42% accuracy). Then 15 minutes of revision cards. Want me to queue it in the planner?";
    else if (s.includes("repo")) out = "Repo rate, simply: the interest rate at which RBI lends to banks overnight against securities. Higher repo → costlier loans → less money chasing goods → inflation cools. Currently held at 5.5% by the MPC.";
    else if (s.includes("plan") || s.includes("2-hour") || s.includes("2 hour")) out = "Built: 0–45 min Polity weak block → 10 min break → 55–115 min sectional mock (Polity+CSAT mix) → last 5 min error logging. I can lock this session for you.";
    else if (s.includes("demotivat") || s.includes("tired")) out = buddyMode ? "Buddy mode on: remember why you started. You've held a 12-day streak — most aspirants quit at day 4. One honest hour today. I'll stay with you. 🇮🇳" : "A short reset helps: 10-minute walk, then a 25-minute Pomodoro on your strongest subject to rebuild momentum.";
    else out = "I can build plans, explain concepts at 3 depths, pick revision topics, generate MCQs and keep you accountable. Try: 'What should I study now?'";
    return out + (buddyMode ? "" : "");
  },

  /** #10/#13 Preparation Twin + weak areas — swap for GET /api/twin/snapshot */
  async twinSnapshot() {
    await wait(850);
    return { readiness: 68, memory: 61, streak: "12 days", lastMock: "74/200 (GS Set 4)", forgotten: 5, weak: MOCK.weakAreas };
  },

  /** #9 Research Assistant — swap for POST /api/research */
  async research(q) {
    await wait(850);
    return [
      { t: `Committee report relevant to “${q}”`, src: "PRS Legislative Research", cred: "high" },
      { t: `Constitutional & legal framework for “${q}”`, src: "Laxmikanth, Ch. 8–11", cred: "high" },
      { t: `Latest official data & press releases`, src: "PIB / Ministry portal", cred: "high" },
      { t: `Editorial analysis (2 perspectives)`, src: "The Hindu / Indian Express", cred: "med" },
      { t: `3 related PYQs found (2019–2024)`, src: "PYQ Intelligence", cred: "high" }
    ];
  },

  /** #8 Exam Strategy — swap for POST /api/strategy */
  async strategy(stage) {
    await wait(700);
    return MOCK.strategies[stage];
  }
};

/* ---------------- mock data (UPSC-realistic) ---------------- */
const MOCK = {
  prelimsDate: new Date("2027-05-30T09:30:00+05:30"), // indicative
  weakAreas: [
    { sub: "Polity", topic: "Fundamental Rights: Art. 20–32", acc: 42 },
    { sub: "Economy", topic: "Monetary Policy & RBI tools", acc: 51 },
    { sub: "Environment", topic: "Climate treaties & bodies", acc: 55 },
    { sub: "History", topic: "Modern India 1905–1919", acc: 61 }
  ],
  briefing: {
    items: [
      { tag: "pre", label: "Prelims", txt: "MPC holds repo rate at 5.5%; stance unchanged — map tools for GS-3." },
      { tag: "mains", label: "Mains", txt: "One Nation One Election committee report — prepare GS-2 federalism arguments." },
      { tag: "rev", label: "Revise", txt: "Spaced revision due: Fundamental Rights (memory strength 48%)." }
    ],
    tasks: ["25 CA-based MCQs queued", "Daily quiz unlocks in 2 h", "Essay outline pending from Sunday"]
  },
  explanations: {
    monetary: {
      eli5: "Imagine RBI is the mother of all banks. When banks run short of money, they borrow from her overnight — the interest she charges is the repo rate. If prices rise too fast, she charges more, so everyone spends less and prices calm down.",
      aspirant: "Repo rate = rate at which RBI lends short-term funds to banks against eligible securities. It is the key policy rate of the MPC (6 members, chaired by RBI Governor, 4% ± 2% inflation target). Transmission: repo ↑ → bank lending ↑ → demand ↓ → inflation cools. GS-3 links: liquidity tools (repo, reverse repo/SDF, CRR, SLR), Monetary Policy Committee composition.",
      expert: "Under the flexible inflation-targeting framework (amended RBI Act, 1934 via 2016 amendment), the MPC sets the repo rate against a 4% CPI target with a ±2% band. Note the asymmetric tools: the Standing Deposit Facility now forms the effective floor, while the MSF/BRF form the ceiling of the LAF corridor. Examine transmission lag evidence (RBI's internal working group, 2013 Urjit Patel committee) and the post-2022 withdrawal-of-accommodation debate."
    },
    monsoon: {
      eli5: "Every summer, the land of India gets very hot and the sea stays cooler. Wind rushes from the sea carrying water, and squeezes it out over the mountains as rain. That's the monsoon — India's biggest water delivery system.",
      aspirant: "Southwest monsoon (June–Sept) delivers ~75% of India's rainfall. Mechanism: differential heating (Tibetan plateau + ITCZ shift), split into Arabian Sea & Bay of Bengal branches, Western Ghats orographic rainfall. Key terms: onset over Kerala (~1 June), break-monsoon, El Niño/La Niña (ENSO), Indian Ocean Dipole. GS-1 climatology + GS-3 agriculture dependence (~52% net sown area unirrigated).",
      expert: "Analyse through thermodynamic (land–sea thermal contrast) vs dynamic (TEJ, cross-equatorial flow, MJO modulation) frameworks. Recent research downplays pure thermal theory in favour of tropical circulation dynamics. Link: IMD's long-range models, MONEX/TRMM datasets, and agrarian distress correlation (Economic Survey chapters on monsoon-GDP elasticity)."
    },
    art32: {
      eli5: "If someone takes away your basic rights, you can knock on two doors. The big door in Delhi (Supreme Court, Article 32) MUST open for rights. The doors in each state (High Courts, Article 226) can open for rights AND many other problems — so they're actually wider!",
      aspirant: "Art. 32: SC's writ jurisdiction for Fundamental Rights enforcement — Dr. Ambedkar called it the 'heart and soul' of the Constitution; it is itself a FR (Part III). Art. 226: HC writ jurisdiction is WIDER — FRs + 'any other purpose'. But Art. 32 cannot be refused; 226 is discretionary. Writs: habeas corpus, mandamus, certiorari, quo-warranto, prohibition.",
      expert: "Compare jurisdictional width vs remedy certainty: 226's 'any other purpose' exceeds 32, yet 32's non-derogability (even under Emergency, Art. 20–21 survive post-44th Amendment) makes it structurally superior. Landmarks: Romesh Thappar (1950), ADM Jabalpur (1976) and its burial in Puttaswamy (2017); L. Chandra Kumar (1997) on 226/32 as basic structure."
    }
  },
  strategies: {
    early: ["Build NCERT + standard-text foundation with weekly recall tests.", "Start a light PYQ habit (10/week) to calibrate question sense.", "Current affairs: one 25-min daily digest, no hoarding PDFs.", "Optional finalisation within 8 weeks using the Roadmap module."],
    mid: ["Shift 40% of time to output: MCQs, answer writing, teach-back.", "Run mistake-notebook loops after every test — no test without review.", "Monthly full mocks under exam pressure mode.", "Begin 5-minute daily spaced revision queue."],
    final: ["Stop new sources. Revision → simulate → analyse → repeat.", "Two full simulators/week at real exam hours.", "Daily: 30 PYQs + 1 answer + 20-min CA recap.", "Sleep and focus hygiene are now a scoring strategy."]
  }
};

/* ---------------- UI helpers ---------------- */
function toast(msg, err = false) {
  const t = $("#toast");
  t.textContent = msg; t.classList.toggle("err", err); t.hidden = false;
  clearTimeout(toast._t); toast._t = setTimeout(() => (t.hidden = true), 3200);
}
function loading(msg = "AI is thinking…") {
  return `<div class="ai-loading" role="status"><span class="spinner"></span>${msg} <span class="honest">(local demo model)</span></div>`;
}
function esc(s) { const d = document.createElement("div"); d.textContent = s; return d.innerHTML; }
const fmtT = d => d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });

/* ---------------- countdown ---------------- */
function renderCountdown() {
  const days = Math.max(0, Math.ceil((MOCK.prelimsDate - Date.now()) / 864e5));
  $("#countdown-days").textContent = days;
  const total = 365, used = Math.min(total, Math.max(0, total - days));
  $("#count-fill").style.width = `${Math.round((used / total) * 100)}%`;
  $("#today-date").textContent = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

/* ---------------- tabs (#demo) ---------------- */
function initTabs() {
  const tabs = $$(".tab");
  const activate = tab => {
    tabs.forEach(t => {
      const on = t === tab;
      t.classList.toggle("active", on);
      t.setAttribute("aria-selected", on);
      t.tabIndex = on ? 0 : -1;
      const p = $("#" + t.getAttribute("aria-controls"));
      p.hidden = !on; p.classList.toggle("active", on);
    });
  };
  tabs.forEach(t => {
    t.addEventListener("click", () => activate(t));
    t.addEventListener("keydown", e => {
      const i = tabs.indexOf(t);
      if (e.key === "ArrowRight") { tabs[(i + 1) % tabs.length].focus(); activate(tabs[(i + 1) % tabs.length]); }
      if (e.key === "ArrowLeft") { tabs[(i - 1 + tabs.length) % tabs.length].focus(); activate(tabs[(i - 1 + tabs.length) % tabs.length]); }
      if (e.key === "Home") { tabs[0].focus(); activate(tabs[0]); }
      if (e.key === "End") { tabs[tabs.length - 1].focus(); activate(tabs[tabs.length - 1]); }
    });
  });
  // deep-link buttons (hero + feature cards)
  $$("[data-goto-tab]").forEach(b => b.addEventListener("click", () => {
    const tab = $("#tab-" + b.dataset.gotoTab);
    if (tab) { activate(tab); tab.focus({ preventScroll: true }); }
    const target = $(b.dataset.scroll || "#demo");
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  }));
}

/* ---------------- Panel 1: What Now (#11) + Briefing (#5) ---------------- */
async function runWhatNow(e) {
  e.preventDefault();
  const out = $("#whatnow-out");
  out.innerHTML = loading("Analysing time × weakness × revision queue…");
  try {
    const r = await UPSC_API.whatNow(+$("#wn-time").value);
    out.innerHTML = `<div class="result-card">
      <span class="level-pill">Do this now</span>
      <h4>${esc(r.action)}</h4>
      <p><strong>Why:</strong> ${esc(r.why)}</p>
      <div class="result-actions">${r.ctas.map(([h, l]) => `<a class="btn btn-dark" href="${h}">${l}</a>`).join("")}</div>
    </div>`;
    store.set({ lastWhatNow: { at: Date.now(), action: r.action } });
    toast("Recommendation generated ✓");
  } catch { out.innerHTML = `<div class="error-msg">Something went wrong generating your plan. Please try again.</div>`; }
}
async function runBrief() {
  const out = $("#brief-out");
  out.innerHTML = loading("Compiling today's brief…");
  const b = await UPSC_API.dailyBrief();
  out.innerHTML = `<ul class="brief-mini-list">${b.items.map(i =>
    `<li><span class="tag tag-${i.tag}">${i.label}</span> ${esc(i.txt)}</li>`).join("")}</ul>
    <p style="font-size:.8rem;color:var(--muted)">Also queued: ${b.tasks.map(esc).join(" · ")}</p>`;
}

/* ---------------- Panel 2: Plan (#3) + Autopilot (#4) ---------------- */
async function runPlan(e) {
  e.preventDefault();
  const out = $("#plan-out");
  out.innerHTML = loading("Drafting a phase-wise plan…");
  const p = await UPSC_API.generatePlan({
    attempt: $("#plan-attempt").value, hours: $("#plan-hours").value,
    stage: $("#plan-stage").value, diff: $("#plan-diff").value
  });
  out.innerHTML = `<div class="result-card">
    <span class="level-pill">${p.attempt} attempt · ${p.intensity} intensity</span>
    <ul>${p.phases.map(f => `<li><strong>${esc(f.name)}</strong> — ${esc(f.len)} · ${esc(f.load)}</li>`).join("")}</ul>
    <div class="result-actions"><a class="btn btn-dark" href="ai-planner.html">Send to AI Planner →</a></div>
  </div>`;
  store.set({ plan: p });
  toast("Plan generated & saved (demo) ✓");
}
async function runAuto(e) {
  e.preventDefault();
  const out = $("#auto-out");
  out.innerHTML = loading("Autopilot building your day…");
  try {
    const blocks = await UPSC_API.autopilot(parseFloat($("#auto-hours").value));
    out.innerHTML = `<div class="result-card"><ul>` + blocks.map(b =>
      `<li><strong>${fmtT(b.from)}–${fmtT(b.to)}</strong> · ${esc(b.task)} <em style="color:var(--muted)">(${b.type})</em></li>`).join("") +
      `</ul><div class="result-actions"><a class="btn btn-primary" href="lock-in.html">🔒 Start Lock-In Mode</a><a class="btn btn-ghost" href="ai-planner.html">Refine in Planner</a></div></div>`;
    store.set({ autopilot: { hours: $("#auto-hours").value, at: Date.now() } });
    toast("Today's schedule ready ✓");
  } catch (err) { out.innerHTML = `<div class="error-msg">${esc(err.message)}</div>`; }
}

/* ---------------- Panel 3: Explain (#15–17) + Doubt (#6) + Voice (#7) ---------------- */
let lastExplained = "";
async function runExplain() {
  const out = $("#exp-out"), topic = $("#exp-topic").value,
        level = $('input[name="exp-level"]:checked').value,
        names = { eli5: "Explain Like I'm 5 · #15", aspirant: "UPSC Aspirant Level · #16", expert: "Expert Level · #17" };
  out.innerHTML = loading("Adapting explanation depth…");
  const txt = await UPSC_API.explain(topic, level);
  lastExplained = txt;
  out.innerHTML = `<div class="result-card"><span class="level-pill">${names[level]}</span><p style="margin-top:8px">${esc(txt)}</p>
    <div class="result-actions"><a class="btn btn-ghost" href="notes.html">Save as Note</a><a class="btn btn-ghost" href="topic-explorer.html">Explore Full Topic</a></div></div>`;
  store.set({ lastExplain: { topic, level } });
}
async function runDoubt(e) {
  e.preventDefault();
  const q = $("#doubt-q").value.trim(), out = $("#doubt-out");
  if (q.length < 8) { out.innerHTML = `<div class="error-msg">Please describe your doubt in at least a few words so the solver can help properly.</div>`; return; }
  out.innerHTML = loading("Consulting sources…");
  const r = await UPSC_API.solveDoubt(q);
  out.innerHTML = `<div class="result-card"><p>${esc(r.a)}</p><p style="margin-top:8px"><strong>Exam tip:</strong> ${esc(r.tip)}</p>
    <div class="result-actions"><a class="btn btn-dark" href="ai-copilot.html">Continue in Copilot →</a></div></div>`;
}
function initVoice() {
  const btn = $("#voice-btn");
  btn.addEventListener("click", () => {
    if (!("speechSynthesis" in window)) { toast("Voice Tutor needs a browser with speech support.", true); return; }
    if (speechSynthesis.speaking) { speechSynthesis.cancel(); btn.setAttribute("aria-pressed", "false"); btn.textContent = "🔊 Voice Tutor "; return; }
    const txt = lastExplained || "Hello aspirant. Generate an explanation first, and I will read it aloud like your personal tutor.";
    const u = new SpeechSynthesisUtterance(txt); u.rate = 0.98; u.lang = "en-IN";
    u.onend = () => btn.setAttribute("aria-pressed", "false");
    speechSynthesis.speak(u);
    btn.setAttribute("aria-pressed", "true"); btn.textContent = "⏹ Stop Voice ";
    toast("Voice Tutor speaking (browser speech engine)");
  });
}

/* ---------------- Panel 4: Copilot (#1) + Buddy (#2) ---------------- */
function addMsg(text, who) {
  const log = $("#chat-log"), d = document.createElement("div");
  d.className = "msg " + who; d.innerHTML = text;
  log.appendChild(d); log.scrollTop = log.scrollHeight; return d;
}
async function sendChat(text) {
  if (!text.trim()) return;
  addMsg(esc(text), "user");
  const typing = addMsg("…", "ai");
  const reply = await UPSC_API.chat(text, $("#buddy-mode").checked);
  typing.innerHTML = esc(reply);
  const hist = (store.get().chat || []).concat([{ u: text, a: reply }]).slice(-15);
  store.set({ chat: hist });
}
function initChat() {
  $("#chat-form").addEventListener("submit", e => { e.preventDefault(); const i = $("#chat-input"); sendChat(i.value); i.value = ""; });
  $$(".chat-chips .chip").forEach(c => c.addEventListener("click", () => sendChat(c.textContent)));
  (store.get().chat || []).slice(-4).forEach(m => { addMsg(esc(m.u), "user"); addMsg(esc(m.a), "ai"); });
}

/* ---------------- Panel 5: Twin (#10) + Weak (#13) + Reco (#12) ---------------- */
async function runTwin() {
  const donut = $("#twin-donut"), weakOut = $("#weak-out");
  weakOut.innerHTML = loading("Scanning mistakes, tests & memory traces…");
  const t = await UPSC_API.twinSnapshot();
  donut.style.background = `conic-gradient(var(--saffron) ${t.readiness * 3.6}deg, #eee3cf 0deg)`;
  $("#twin-score").textContent = t.readiness + "%";
  $("#mem-fill").style.width = t.memory + "%"; $("#mem-pct").textContent = t.memory + "%";
  $("#twin-streak").textContent = t.streak; $("#twin-mock").textContent = t.lastMock; $("#twin-forgotten").textContent = t.forgotten;
  weakOut.innerHTML = `<div class="result-card"><h4>Weakest first — that's the strategy</h4>` +
    t.weak.map(w => `<div class="weak-row"><span class="weak-sub">${esc(w.sub)}</span>
      <span style="flex:1.4;font-size:.8rem;color:var(--muted)">${esc(w.topic)}</span>
      <span class="weak-bar"><span class="${w.acc > 50 ? "mid" : ""}" style="width:${w.acc}%"></span></span>
      <span class="weak-pct">${w.acc}%</span></div>`).join("") +
    `<div class="reco-item"><span class="fid">#12</span><span><strong>Recommended:</strong> Mistake-based test on ${esc(t.weak[0].topic)} today, then 5-minute spaced revision of Climate treaties tomorrow.</span></div>
     <div class="reco-item"><span class="fid">#14</span><span><strong>Adaptive difficulty:</strong> your tests auto-tune — accuracy above 75% raises difficulty; below 45% reinforces fundamentals first.</span></div>
     <div class="result-actions"><a class="btn btn-dark" href="preparation-twin.html">Open Full Twin</a><a class="btn btn-ghost" href="analytics.html">Analytics</a></div></div>`;
  toast("Preparation twin updated ✓");
}

/* ---------------- Panel 6: Research (#9) + Strategy (#8) ---------------- */
async function runResearch(e) {
  e.preventDefault();
  const q = $("#res-q").value.trim(), out = $("#res-out");
  if (!q) { out.innerHTML = `<div class="error-msg">Enter a research topic first.</div>`; return; }
  out.innerHTML = loading("Collecting & ranking sources…");
  const srcs = await UPSC_API.research(q);
  out.innerHTML = `<div class="result-card"><h4>Source pack for “${esc(q)}”</h4>` +
    srcs.map(s => `<div class="source-row"><span>${esc(s.t)}<br><small style="color:var(--muted)">${esc(s.src)}</small></span>
      <span class="cred cred-${s.cred}">${s.cred === "high" ? "High credibility" : "Cross-check"}</span></div>`).join("") +
    `<div class="result-actions"><a class="btn btn-dark" href="research.html">Save Session →</a></div></div>`;
}
async function runStrategy() {
  const out = $("#strat-out");
  out.innerHTML = loading("Calibrating strategy to your phase…");
  const s = await UPSC_API.strategy($("#strat-stage").value);
  out.innerHTML = `<div class="result-card"><ul>${s.map(i => `<li>${esc(i)}</li>`).join("")}</ul>
    <div class="result-actions"><a class="btn btn-dark" href="roadmap.html">Apply to Roadmap →</a></div></div>`;
}

/* ---------------- Feature grid (17 features) ---------------- */
const FEATURES = [
  [1, "AI Study Copilot", "Always-on tutor that plans, teaches and quizzes you.", "copilot"],
  [2, "AI Study Buddy", "Accountability mode with check-ins and streak protection.", "copilot"],
  [3, "AI Personalized Study Plan", "Phase-wise plan built from your attempt, hours and stage.", "plan"],
  [4, "AI Study Autopilot", "Give it your hours — get a timed schedule + Lock-In launch.", "plan"],
  [5, "AI Daily Briefing", "Morning brief: what's new, what's due, what to attempt.", "whatnow"],
  [6, "AI Doubt Solver", "Any UPSC doubt resolved with sources and exam tips.", "explain"],
  [7, "AI Voice Tutor", "Listen to any explanation read aloud by the tutor.", "explain"],
  [8, "AI Exam Strategy", "Phase-aware strategic playbooks for your timeline.", "research"],
  [9, "AI Research Assistant", "Credible, credibility-ranked source packs per topic.", "research"],
  [10, "AI Preparation Twin", "A live digital model of everything you've studied.", "twin"],
  [11, "What Should I Study Now?", "One command: time + weakness + revision → next action.", "whatnow"],
  [12, "Personalized Recommendations", "Daily picks derived from your twin's analysis.", "twin"],
  [13, "Weak-Area Detection", "Accuracy-ranked weak topics, surfaced automatically.", "twin"],
  [14, "Adaptive Difficulty", "Tests that tighten or reinforce based on your accuracy.", "twin"],
  [15, "AI Explain Like I'm 5", "Every concept in plain, simple language.", "explain"],
  [16, "AI Explain Like a UPSC Aspirant", "Syllabus-mapped, exam-ready explanations.", "explain"],
  [17, "AI Explain Like an Expert", "Committee-level depth for serious mastery.", "explain"]
];
function renderFeatures() {
  $("#feature-grid").innerHTML = FEATURES.map(([id, name, desc, tab]) =>
    `<button class="feature-card" data-goto-tab="${tab}" data-scroll="#demo" aria-label="Try ${name} in the live demo">
      <span class="fid">#${id}</span><h3>${name}</h3><p>${desc}</p><span class="go">Try in live demo →</span>
    </button>`).join("");
  $$("#feature-grid [data-goto-tab]").forEach(b => b.addEventListener("click", () => {
    const tab = $("#tab-" + b.dataset.gotoTab);
    if (tab) { tab.click(); tab.focus({ preventScroll: true }); }
    $("#demo").scrollIntoView({ behavior: "smooth" });
  }));
}

/* ---------------- init ---------------- */
document.addEventListener("DOMContentLoaded", () => {
  renderCountdown(); setInterval(renderCountdown, 60e3);
  initTabs(); renderFeatures();
  $("#whatnow-form").addEventListener("submit", runWhatNow);
  runBrief();
  $("#plan-form").addEventListener("submit", runPlan);
  $("#auto-form").addEventListener("submit", runAuto);
  $("#exp-btn").addEventListener("click", runExplain);
  initVoice();
  $("#doubt-form").addEventListener("submit", runDoubt);
  initChat();
  $("#twin-refresh").addEventListener("click", runTwin);
  $("#res-form").addEventListener("submit", runResearch);
  $("#strat-btn").addEventListener("click", runStrategy);
  // restore plan if previously generated
  const saved = store.get();
  if (saved.plan) toast("Welcome back — your demo plan is saved in this browser.");
});
