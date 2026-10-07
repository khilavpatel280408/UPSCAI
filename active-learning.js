"use strict";
/* UPSC ZONE AI — active-learning.js
   Features: #110 #111 #112 #113 #114 #115 #116 #117 #118
   LabAPI isolated & API-ready. */
const LS = "uza_active_v1";
const $ = s => document.querySelector(s);
const wait = ms => new Promise(r => setTimeout(r, ms));
const esc = s => { const d = document.createElement("div"); d.textContent = s; return d.innerHTML; };
let S = {}; try { S = JSON.parse(localStorage.getItem(LS)) || {}; } catch {}
S.best = S.best || {};
const save = () => localStorage.setItem(LS, JSON.stringify(S));
function toast(m) { const t = $("#toast"); t.textContent = m; t.hidden = false; clearTimeout(toast._t); toast._t = setTimeout(() => t.hidden = true, 2800); }
const arena = $("#arena");

const ORAL = [
  { q: "Explain what the repo rate controls in one breath.", keys: ["interest", "bank", "inflation", "liquidity", "rbi", "borrow"],
    fu: "Follow-up (#118): if inflation spikes on a supply shock, should the repo rate still rise? Why?" },
  { q: "Why can't the Rajya Sabha amend a Money Bill?", keys: ["lok sabha", "money", "14 days", "speaker", "article 110", "recommend"],
    fu: "Follow-up (#118): what check exists on the Speaker's Money Bill certification?" },
  { q: "What drives the onset of the Indian monsoon?", keys: ["itcz", "kerala", "june", "heating", "wind", "pressure"],
    fu: "Follow-up (#118): how does El Niño disturb this mechanism?" }
];
const RAPID = [
  { q: "Repo rate is decided by?", o: ["Finance Ministry", "MPC", "SEBI", "NITI Aayog"], a: 1 },
  { q: "Monsoon reaches Kerala around?", o: ["1 May", "1 June", "1 July", "1 August"], a: 1 },
  { q: "Money Bill delay limit in RS?", o: ["1 month", "14 days", "3 months", "None"], a: 1 },
  { q: "El Niño usually ___ the monsoon.", o: ["strengthens", "weakens", "ignores", "delays only"], a: 1 },
  { q: "Quo-warranto restrains?", o: ["Illegal office-holding", "Tax evasion", "Perjury", "None"], a: 0 }
];
const BATTLES = [
  ["Article 32 vs Article 226", ["writ", "supreme court", "high court", "fundamental rights", "discretion"]],
  ["Repo rate vs SDF", ["repo", "sdf", "floor", "corridor", "liquidity"]],
  ["El Niño vs La Niña", ["el nino", "la nina", "monsoon", "pacific", "weaken"]],
  ["Prelims vs Mains ROI", ["accuracy", "answer writing", "syllabus", "revision", "cut-off"]]
];
const DEBATES = ["One Nation One Election strengthens Indian democracy", "Inflation targeting should include growth", "Technology is the biggest reform tool in governance"];

const LabAPI = {
  async grade(text, keys) {            // POST /api/learning/grade
    await wait(700);
    const low = text.toLowerCase();
    const hits = keys.filter(k => low.includes(k));
    const score = Math.round(hits.length / keys.length * 100);
    return { score, hits, miss: keys.filter(k => !hits.includes(k)) };
  },
  async rateExplanation(text) {        // #117 Explain Your Answer
    await wait(650);
    const words = text.trim().split(/\s+/).length;
    const because = /(because|since|therefore|due to|as |hence)/i.test(text);
    return { ok: words >= 12 && because, words, because };
  }
};

/* ---------- mode switching ---------- */
document.querySelectorAll(".mode").forEach(b => b.addEventListener("click", () => {
  document.querySelectorAll(".mode").forEach(x => x.classList.toggle("active", x === b));
  MODES[b.dataset.mode]();
}));

const MODES = {
  /* ---- #111 AI Oral Quiz + #118 follow-ups ---- */
  oral() {
    let i = 0;
    function render() {
      const item = ORAL[i];
      arena.innerHTML = `<h2>🎙 AI Oral Quiz <span class="fid">#111</span> — Q${i + 1}/${ORAL.length}</h2>
        <div class="qbox">${esc(item.q)}</div>
        <label class="sr-only" for="oral-a">Your spoken-style answer</label>
        <textarea id="oral-a" rows="3" placeholder="Answer aloud in words — type as you'd speak…"></textarea>
        <p class="field-err" id="oral-err" hidden></p>
        <div class="row"><button class="btn btn-primary" id="oral-go" type="button">Submit answer</button>
          <button class="btn btn-ghost btn-sm" id="oral-voice" type="button">🔊 Hear question (#112)</button>
          <span class="muted small">Best: ${S.best.oral ?? "—"}%</span></div>
        <div id="oral-out"></div>`;
      $("#oral-voice").addEventListener("click", () => speak(item.q));
      $("#oral-go").addEventListener("click", async () => {
        const txt = $("#oral-a").value.trim(), err = $("#oral-err");
        if (txt.split(/\s+/).length < 6) { err.hidden = false; err.textContent = "Speak in full sentences — at least ~6 words."; return; }
        err.hidden = true;
        $("#oral-out").innerHTML = `<div class="verdict mid"><span class="spinner"></span> AI listening & grading…</div>`;
        const g = await LabAPI.grade(txt, item.keys);
        $("#oral-out").innerHTML = `<div class="verdict ${g.score >= 70 ? "good" : g.score >= 40 ? "mid" : "bad"}">
          <strong>Concept coverage: ${g.score}%</strong> — hit: ${g.hits.join(", ") || "none"}${g.miss.length ? " · missing: " + g.miss.join(", ") : ""}</div>
        <div class="followup"><strong>${esc(item.fu)}</strong>
          <textarea id="fu-a" rows="2" style="margin-top:8px" placeholder="Answer the follow-up…"></textarea>
          <div class="row" style="margin-top:8px"><button class="btn btn-dark btn-sm" id="fu-go" type="button">Answer follow-up (#118)</button></div>
          <div id="fu-out" style="margin-top:8px"></div></div>
        <div class="row" style="margin-top:8px"><button class="btn btn-primary btn-sm" id="oral-next" type="button">${i < ORAL.length - 1 ? "Next question →" : "Finish drill"}</button></div>`;
        S.best.oral = Math.max(S.best.oral || 0, g.score); save();
        $("#fu-go").addEventListener("click", async () => {
          const ft = $("#fu-a").value.trim();
          if (ft.split(/\s+/).length < 5) { toast("Give the follow-up a real answer.", true); return; }
          $("#fu-out").innerHTML = `<span class="spinner"></span> Evaluating…`;
          const r = await LabAPI.rateExplanation(ft);
          $("#fu-out").innerHTML = `<div class="verdict ${r.ok ? "good" : "mid"}">${r.ok ? "✓ Solid reasoning — causality detected (#117)." : "Add a 'because' chain — causality is what interviewers and GS-4 test (#117)."}</div>`;
        });
        $("#oral-next").addEventListener("click", () => { if (i < ORAL.length - 1) { i++; render(); } else { toast("Oral quiz complete — best updated."); oralIntro(); } });
      });
    }
    function oralIntro() {
      arena.innerHTML = `<h2>🎙 AI Oral Quiz complete <span class="fid">#111</span></h2>
        <div class="verdict good">Session logged. Best coverage: <strong>${S.best.oral}%</strong>. Oral production doubles retention vs silent reading.</div>
        <div class="row"><button class="btn btn-primary" id="again" type="button">Run again</button></div>`;
      $("#again").addEventListener("click", () => { i = 0; render(); });
    }
    render();
  },

  /* ---- #112 Voice Questions ---- */
  voice() {
    const item = ORAL[Math.floor(Math.random() * ORAL.length)];
    arena.innerHTML = `<h2>🔊 Voice Questions <span class="fid">#112</span></h2>
      <p class="muted">The AI reads the question aloud. Answer by voice if your browser supports it — otherwise type. Uses your browser's speech engine; no server calls.</p>
      <div class="row"><button class="btn btn-primary" id="v-play" type="button">▶ Play question aloud</button>
        <button class="btn btn-ghost" id="v-rec" type="button">🎤 Answer by voice</button></div>
      <p class="field-err" id="v-err" hidden></p>
      <label class="sr-only" for="v-text">Typed answer</label>
      <textarea id="v-text" rows="3" placeholder="…or type your answer here"></textarea>
      <button class="btn btn-dark" id="v-go" type="button">Grade my answer</button>
      <div id="v-out"></div>`;
    $("#v-play").addEventListener("click", () => speak(item.q));
    $("#v-rec").addEventListener("click", () => {
      const err = $("#v-err"); err.hidden = true;
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SR) { err.hidden = false; err.textContent = "Voice input not supported here — type your answer instead."; return; }
      const rec = new SR(); rec.lang = "en-IN";
      toast("🎤 Listening…");
      rec.onresult = e => { $("#v-text").value = e.results[0][0].transcript; };
      rec.onerror = () => { err.hidden = false; err.textContent = "Microphone unavailable — check permission."; };
      rec.start();
    });
    $("#v-go").addEventListener("click", async () => {
      const t = $("#v-text").value.trim();
      if (t.split(/\s+/).length < 5) { toast("Answer too short.", true); return; }
      $("#v-out").innerHTML = `<div class="verdict mid"><span class="spinner"></span> Grading…</div>`;
      const g = await LabAPI.grade(t, item.keys);
      $("#v-out").innerHTML = `<div class="verdict ${g.score >= 70 ? "good" : g.score >= 40 ? "mid" : "bad"}"><strong>${g.score}%</strong> coverage — ${g.hits.length ? "hit: " + g.hits.join(", ") : "no key anchors yet"}. Question was: “${esc(item.q)}”</div>`;
    });
  },

  /* ---- #113 Reverse Quiz ---- */
  reverse() {
    arena.innerHTML = `<h2>🔄 Reverse Quiz <span class="fid">#113</span></h2>
      <p class="muted">Flip roles: YOU write the UPSC question; the AI answers it and grades your question craft.</p>
      <label class="sr-only" for="rq-q">Your question</label>
      <textarea id="rq-q" rows="2" placeholder="e.g. Which writ can be issued against a private body under Article 226?"></textarea>
      <p class="field-err" id="rq-err" hidden></p>
      <button class="btn btn-primary" id="rq-go" type="button">Let the AI answer</button>
      <div id="rq-out"></div>`;
    $("#rq-go").addEventListener("click", async () => {
      const q = $("#rq-q").value.trim(), err = $("#rq-err");
      if (q.length < 15) { err.hidden = false; err.textContent = "Write a full question (15+ characters)."; return; }
      err.hidden = true;
      $("#rq-out").innerHTML = `<div class="verdict mid"><span class="spinner"></span> AI attempting your question…</div>`;
      await wait(900);
      const qWord = /^(which|what|why|how|consider|assertion|with reference)/i.test(q);
      const craft = qWord && q.length > 30 ? "good" : "mid";
      $("#rq-out").innerHTML = `<div class="verdict good"><strong>AI's attempt:</strong> Based on standard texts and PYQ framing, the answer hinges on the institutional rule your question targets — the examiner-grade response would cite the article/committee and one exception.</div>
        <div class="verdict ${craft}"><strong>Question craft:</strong> ${craft === "good" ? "✓ Proper UPSC stem (command word + specific scope). This is how you should frame self-tests." : "Add a command word (Which/Why/Consider) and a specific scope — vague questions train vague recall."} (#113)</div>`;
      S.best.reverse = (S.best.reverse || 0) + 1; save();
    });
  },

  /* ---- #114 Concept Battle ---- */
  battle() {
    arena.innerHTML = `<h2>⚔️ Concept Battle <span class="fid">#114</span></h2>
      <p class="muted">Two rival concepts. Argue which matters more for Prelims and why. The AI scores your argument.</p>
      <label class="sr-only" for="bt-pick">Choose a battle</label>
      <select id="bt-pick">${BATTLES.map((b, i) => `<option value="${i}">${b[0]}</option>`).join("")}</select>
      <label class="sr-only" for="bt-a">Your argument</label>
      <textarea id="bt-a" rows="3" placeholder="Your argument — take a side, justify with syllabus logic…"></textarea>
      <p class="field-err" id="bt-err" hidden></p>
      <button class="btn btn-primary" id="bt-go" type="button">Enter the battle</button>
      <div id="bt-out"></div>`;
    $("#bt-go").addEventListener("click", async () => {
      const [name, keys] = BATTLES[+$("#bt-pick").value], t = $("#bt-a").value.trim(), err = $("#bt-err");
      if (t.split(/\s+/).length < 10) { err.hidden = false; err.textContent = "A battle needs a real argument (10+ words)."; return; }
      err.hidden = true;
      $("#bt-out").innerHTML = `<div class="verdict mid"><span class="spinner"></span> Judging the duel…</div>`;
      const g = await LabAPI.grade(t, keys);
      const you = 40 + Math.round(g.score * 0.6), ai = 100 - you + Math.floor(Math.random() * 6);
      $("#bt-out").innerHTML = `<div class="verdict ${you >= ai ? "good" : "mid"}">
        <strong>${name}: You ${you} — ${ai} AI</strong> ${you >= ai ? "🏆 You win this round." : "The AI edges it — your anchors: " + (g.hits.join(", ") || "none") + "."}
        <br><span class="muted small">Battles won: ${(S.best.battle = (S.best.battle || 0) + (you >= ai ? 1 : 0)) && S.best.battle}</span></div>`;
      save();
    });
  },

  /* ---- #115 Rapid Fire + #117 Explain Your Answer ---- */
  rapid() {
    let i = 0, score = 0, timer = null;
    function render() {
      const q = RAPID[i];
      arena.innerHTML = `<h2>⚡ Rapid Fire <span class="fid">#115</span> — Q${i + 1}/${RAPID.length}</h2>
        <div class="row"><span class="timer-chip" id="rf-t">10</span><span class="muted small">seconds — instinct training. No going back.</span></div>
        <div class="qbox">${esc(q.q)}</div>
        <div class="row">${q.o.map((o, j) => `<button class="btn btn-ghost" data-o="${j}" type="button">${String.fromCharCode(65 + j)}. ${esc(o)}</button>`).join("")}</div>
        <div id="rf-out"></div>`;
      let left = 10;
      clearInterval(timer);
      timer = setInterval(() => {
        left--; const chip = $("#rf-t");
        if (chip) { chip.textContent = left; chip.classList.toggle("low", left <= 3); }
        if (left <= 0) { clearInterval(timer); answer(null); }
      }, 1000);
      arena.querySelectorAll("[data-o]").forEach(b => b.addEventListener("click", () => { clearInterval(timer); answer(+b.dataset.o); }));
    }
    function answer(choice) {
      const q = RAPID[i], right = choice === q.a;
      if (right) score++;
      $("#rf-out").innerHTML = `<div class="verdict ${right ? "good" : choice === null ? "bad" : "bad"}">${choice === null ? "⏱ Time up — skipped." : right ? "✓ Correct." : `✗ Wrong — correct: ${String.fromCharCode(65 + q.a)}.`}</div>
        <div class="followup"><strong>Explain your answer (#117):</strong> why is this correct?
          <textarea id="ex-a" rows="2" style="margin-top:8px"></textarea>
          <div class="row" style="margin-top:8px"><button class="btn btn-dark btn-sm" id="ex-go" type="button">Check explanation</button>
          <button class="btn btn-primary btn-sm" id="rf-next" type="button">${i < RAPID.length - 1 ? "Next →" : "Finish"}</button></div><div id="ex-out" style="margin-top:8px"></div></div>`;
      $("#ex-go").addEventListener("click", async () => {
        const t = $("#ex-a").value.trim();
        if (t.split(/\s+/).length < 6) { toast("Explain in at least one full sentence.", true); return; }
        $("#ex-out").innerHTML = `<span class="spinner"></span>`;
        const r = await LabAPI.rateExplanation(t);
        $("#ex-out").innerHTML = `<div class="verdict ${r.ok ? "good" : "mid"}">${r.ok ? "✓ Explanation holds — causality present." : "State the rule AND the reason ('because…') — that's the interview-grade habit."}</div>`;
      });
      $("#rf-next").addEventListener("click", () => { if (i < RAPID.length - 1) { i++; render(); } else finish(); });
    }
    function finish() {
      clearInterval(timer);
      S.best.rapid = Math.max(S.best.rapid || 0, score); save();
      arena.innerHTML = `<h2>⚡ Rapid Fire complete <span class="fid">#115</span></h2>
        <div class="verdict ${score >= 4 ? "good" : score >= 2 ? "mid" : "bad"}">Score: <strong>${score}/${RAPID.length}</strong> · Personal best: ${S.best.rapid}</div>
        <div class="row"><button class="btn btn-primary" id="rf-again" type="button">Run again</button></div>`;
      $("#rf-again").addEventListener("click", () => { i = 0; score = 0; render(); });
    }
    render();
  },

  /* ---- #116 Debate Mode ---- */
  debate() {
    arena.innerHTML = `<h2>🏛 Debate Mode <span class="fid">#116</span></h2>
      <label class="sr-only" for="db-m">Motion</label>
      <select id="db-m">${DEBATES.map(d => `<option>${d}</option>`).join("")}</select>
      <div class="row"><label><input type="radio" name="side" value="FOR" checked> Argue FOR</label>
        <label><input type="radio" name="side" value="AGAINST"> Argue AGAINST</label></div>
      <label class="sr-only" for="db-a">Opening argument</label>
      <textarea id="db-a" rows="3" placeholder="Your opening argument…"></textarea>
      <p class="field-err" id="db-err" hidden></p>
      <button class="btn btn-primary" id="db-go" type="button">Open the debate</button>
      <div id="db-out"></div>`;
    $("#db-go").addEventListener("click", async () => {
      const motion = $("#db-m").value, side = document.querySelector('input[name="side"]:checked').value;
      const t = $("#db-a").value.trim(), err = $("#db-err");
      if (t.split(/\s+/).length < 12) { err.hidden = false; err.textContent = "A debate opening needs substance (12+ words)."; return; }
      err.hidden = true;
      $("#db-out").innerHTML = `<div class="verdict mid"><span class="spinner"></span> Opponent preparing rebuttal…</div>`;
      await wait(900);
      const counter = side === "FOR"
        ? `The opposition counters: “${motion}” risks centralisation, weakens state bargaining power, and concentrates reform authority — federalism is process, not efficiency.`
        : `The opposition counters: rejecting “${motion}” preserves necessary flexibility, institutional learning and democratic feedback loops that blanket positions destroy.`;
      $("#db-out").innerHTML = `<div class="verdict mid"><strong>AI (${side === "FOR" ? "AGAINST" : "FOR"}):</strong> ${counter}</div>
        <label class="sr-only" for="db-r">Your rebuttal</label>
        <textarea id="db-r" rows="2" placeholder="Your rebuttal…" style="margin-top:8px"></textarea>
        <div class="row" style="margin-top:8px"><button class="btn btn-dark btn-sm" id="db-rb" type="button">Deliver rebuttal</button></div>
        <div id="db-rt" style="margin-top:8px"></div>`;
      $("#db-rb").addEventListener("click", async () => {
        const r = $("#db-r").value.trim();
        if (r.split(/\s+/).length < 8) { toast("Rebuttal too thin.", true); return; }
        $("#db-rt").innerHTML = `<span class="spinner"></span> Judges scoring…`;
        await wait(800);
        const connectors = (r.match(/(however|because|therefore|but|yet|moreover)/gi) || []).length;
        const pts = Math.min(10, 4 + connectors * 2 + Math.min(3, Math.floor(r.split(/\s+/).length / 12)));
        $("#db-rt").innerHTML = `<div class="verdict ${pts >= 7 ? "good" : "mid"}"><strong>Judges: ${pts}/10.</strong> ${pts >= 7 ? "Structured rebuttal — connectors and counter-evidence present." : "Stronger debates name the opponent's point before dismantling it."} (#116)</div>`;
        S.best.debate = Math.max(S.best.debate || 0, pts); save();
      });
    });
  },

  /* ---- #110 Teach-Back launcher ---- */
  teach() {
    arena.innerHTML = `<h2>🧑‍🏫 Teach-Back Mode <span class="fid">#110</span></h2>
      <div class="verdict good">The strongest active-learning tool: teach a topic as if the examiner is a 12-year-old. Gaps in your teaching are gaps in your knowledge.</div>
      <div class="row"><a class="btn btn-primary" href="teach-back.html">Start a full Teach-Back session →</a>
        <button class="btn btn-ghost" id="tb-quick" type="button">Quick 60-second teach</button></div>
      <div id="tb-out"></div>`;
    $("#tb-quick").addEventListener("click", () => {
      $("#tb-out").innerHTML = `<label class="sr-only" for="tb-a">Teach the Indian monsoon in 60 words</label>
        <textarea id="tb-a" rows="3" placeholder="Teach the Indian monsoon in ~60 words…"></textarea>
        <button class="btn btn-dark btn-sm" id="tb-go" style="margin-top:8px" type="button">AI grades my teaching</button>
        <div id="tb-g" style="margin-top:8px"></div>`;
      $("#tb-go").addEventListener("click", async () => {
        const t = $("#tb-a").value.trim();
        if (t.split(/\s+/).length < 20) { toast("Teach in at least ~20 words.", true); return; }
        $("#tb-g").innerHTML = `<span class="spinner"></span>`;
        const g = await LabAPI.grade(t, ["monsoon", "june", "kerala", "itcz", "rain", "wind", "sea", "heat"]);
        $("#tb-g").innerHTML = `<div class="verdict ${g.score >= 60 ? "good" : "mid"}"><strong>Teaching clarity: ${g.score}%</strong> — ${g.miss.length ? "add: " + g.miss.slice(0, 3).join(", ") : "all anchors covered"}. Full session in the Teach-Back page.</div>`;
      });
    });
  }
};

/* ---------- voice helper (#112) ---------- */
function speak(text) {
  if (!("speechSynthesis" in window)) { toast("No speech engine in this browser.", true); return; }
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text); u.lang = "en-IN"; u.rate = 0.95;
  speechSynthesis.speak(u);
}

document.addEventListener("DOMContentLoaded", () => MODES.oral());
