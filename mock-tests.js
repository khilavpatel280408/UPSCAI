"use strict";
/* UPSC ZONE AI — mock-tests.js · Test Center
   Features: #32 #33 #34 #35 #36 #37 #38 #39 #41 #42 #43 #44 #45 #46 #47 #48
   TestsAPI isolated & API-ready (swap generators for real AI endpoints). */
const LS = "uza_mocktests_v1";
const $ = s => document.querySelector(s);
const wait = ms => new Promise(r => setTimeout(r, ms));
const esc = s => { const d = document.createElement("div"); d.textContent = s; return d.innerHTML; };
let S = {}; try { S = JSON.parse(localStorage.getItem(LS)) || {}; } catch {}
const save = () => localStorage.setItem(LS, JSON.stringify(S));
function toast(m) { const t = $("#toast"); t.textContent = m; t.hidden = false; clearTimeout(toast._t); toast._t = setTimeout(() => t.hidden = true, 2800); }

/* ---------- quiz generators (#47 #48, engine of #32) ---------- */
const TestsAPI = {
  async generateQuiz(topic, n, diff) {        // POST /api/tests/generate
    await wait(900);
    const T = [
      q => ({ q: `With reference to “${q}”, which statement is CORRECT?`, o: ["It is outside UPSC syllabus", "It has a testable constitutional/institutional basis", "It was repealed in 1976", "It applies only to states"], a: 1 }),
      q => ({ q: `Consider the statements about “${q}”. Which pair uses classic UPSC traps?`, o: ["Extreme words like 'only' & 'never'", "Neutral definitions", "Direct NCERT lines", "None"], a: 0 }),
      q => ({ q: `“${q}” is MOST relevant to which GS paper?`, o: ["GS-1 only", "GS-2 / GS-3 governance-economy", "Essay only", "Optional only"], a: 1 }),
      q => ({ q: `Which committee/report is linked to “${q}” for Mains value-add?`, o: ["No committee exists", "A standing committee/report exists and is frequently cited", "Only a 1950s report", "UN reports only"], a: 1 }),
      q => ({ q: `In the last 12 months, “${q}” appeared in current affairs via:`, o: ["No relevance", "A policy decision / report worth one Prelims line", "Sports news", "None"], a: 1 }),
      q => ({ q: `Assertion–Reason: “${q}” questions usually test:`, o: ["Memorised dates", "Conceptual linkage between two facts", "Spelling", "None"], a: 1 }),
      q => ({ q: `Negative-marking strategy for “${q}” MCQs:`, o: ["Attempt everything blindly", "Attempt when 2 options can be eliminated", "Skip all", "None"], a: 1 }),
      q => ({ q: `Which source is PRIMARY for “${q}”?`, o: ["Random blogs", "NCERT + standard text + official releases", "Social media", "None"], a: 1 })
    ];
    const diffLbl = ["Foundation", "UPSC Standard", "Expert"][diff - 1];
    return { topic, diff: diffLbl, qs: T.slice(0, n).map(f => f(topic)) };
  }
};

/* ---------- daily quiz (#43) + challenge (#44) ---------- */
const DQ = { q: "The Monetary Policy Committee's inflation target is set by:", o: ["RBI Governor alone", "Central Govt in consultation with RBI", "Finance Commission", "Parliament by law"], a: 1,
  e: "Target (4% ±2%) is set by the Central Government in consultation with RBI, every 5 years." };
const DC = { q: "Which writ is issued to restrain a person from holding a public office they are not entitled to?", o: ["Mandamus", "Quo-warranto", "Certiorari", "Prohibition"], a: 1,
  e: "Quo-warranto = 'by what authority'. Classic repeated PYQ frame." };
const today = new Date().toDateString();

function renderDaily(box, item, key, label) {
  const out = $(box);
  if (S[key] === today) { out.innerHTML = `<div class="done-note">✓ ${label} completed for today. Streak protected — come back tomorrow.</div>`; return; }
  out.innerHTML = `<p style="font-size:.88rem"><strong>${esc(item.q)}</strong></p>
    ${item.o.map((o, i) => `<label class="dq-opt" style="display:flex;gap:9px;font-size:.84rem;align-items:flex-start;cursor:pointer"><input type="radio" name="${key}" value="${i}" style="accent-color:var(--saffron);margin-top:3px">${esc(o)}</label>`).join("")}
    <div class="row" style="margin-top:4px"><button class="btn btn-dark btn-sm" data-d="${key}" type="button">Check answer</button></div>
    <div class="dq-exp" hidden></div>`;
  out.querySelector(`[data-d="${key}"]`).addEventListener("click", () => {
    const sel = out.querySelector(`input[name="${key}"]:checked`);
    if (!sel) { toast("Pick an option first.", true); return; }
    const right = +sel.value === item.a;
    const exp = out.querySelector(".dq-exp");
    exp.hidden = false;
    exp.innerHTML = `<div class="${right ? "done-note" : "error-msg"}" style="margin-top:8px">${right ? "✅ Correct!" : "❌ Not quite — correct: option " + (item.a + 1) + "."} ${esc(item.e)}</div>`;
    S[key] = today; save();
    out.querySelector("[data-d]").textContent = "Done ✓"; out.querySelector("[data-d]").disabled = true;
    toast(right ? "+10 XP · Daily done ✓" : "Logged to mistakes — review later.");
  });
}

/* ---------- generator UI ---------- */
$("#gen-form").addEventListener("submit", async e => {
  e.preventDefault();
  const topic = $("#g-topic").value.trim(), err = $("#g-err");
  if (topic.length < 3) { err.textContent = "Give a real topic (3+ characters)."; err.hidden = false; return; }
  err.hidden = true;
  const out = $("#g-out"), btn = $("#g-btn");
  btn.disabled = true; btn.innerHTML = '<span class="spinner"></span> Generating…';
  out.innerHTML = `<div class="empty" style="display:flex;gap:10px;justify-content:center;align-items:center"><span class="spinner"></span> AI MCQ engine (#48) assembling questions…</div>`;
  try {
    const quiz = await TestsAPI.generateQuiz(topic, +$("#g-n").value, +$("#g-diff").value);
    S.lastQuiz = quiz; save();
    out.innerHTML = `<p class="muted small">Generated: ${quiz.qs.length} questions · ${quiz.topic} · ${quiz.diff} (demo model)</p>` +
      quiz.qs.map((q, i) => `<div class="gen-q"><strong>Q${i + 1}.</strong> ${esc(q.q)}<br>
        <span class="muted small">Options: ${q.o.map((o, j) => `${j + 1}) ${esc(o)}`).join(" · ")}</span><br>
        <span class="small" style="color:var(--green);font-weight:700">Answer: option ${q.a + 1}</span></div>`).join("") +
      `<div class="row"><button class="btn btn-primary" id="take-quiz" type="button">🚀 Take this in Test Interface</button>
       <button class="btn btn-ghost" id="regen" type="button">↻ Regenerate</button></div>`;
    $("#take-quiz").addEventListener("click", () => {
      localStorage.setItem("uza_generated_test", JSON.stringify(quiz));
      location.href = "test-interface.html?mode=custom";
    });
    $("#regen").addEventListener("click", () => $("#gen-form").requestSubmit());
    toast("Quiz generated ✓");
  } catch { out.innerHTML = `<div class="error-msg">Generation failed — please retry.</div>`; }
  btn.disabled = false; btn.innerHTML = "✨ Generate quiz (#47)";
});

/* ---------- subject/topic launchers (#34 #35) ---------- */
$("#sw-sub").addEventListener("change", e => { $("#sw-go").href = "test-interface.html?mode=subject&s=" + encodeURIComponent(e.target.value); });
$("#tw-top").addEventListener("change", e => { $("#tw-go").href = "test-interface.html?mode=topic&t=" + encodeURIComponent(e.target.value); });

/* ---------- history + stats ---------- */
function renderHistory() {
  let hist = []; try { hist = JSON.parse(localStorage.getItem("uza_test_history")) || []; } catch {}
  if (!hist.length) { $("#tc-stats").textContent = "No tests taken yet."; return; }
  $("#tc-stats").textContent = `${hist.length} test(s) taken · latest accuracy ${hist[0].acc}%.`;
  $("#hist-out").innerHTML = hist.slice(0, 6).map(h => `<div class="hist-row">
    <span class="pill ${h.acc >= 70 ? "good" : h.acc >= 45 ? "mid" : "bad"}">${h.acc}%</span>
    <strong>${esc(h.mode)}</strong><span class="muted small">${h.correct}/${h.total} correct · ${new Date(h.at).toLocaleDateString("en-IN")}</span>
    <a class="text-link" style="margin-left:auto" href="test-result.html">View result →</a></div>`).join("");
}

document.addEventListener("DOMContentLoaded", () => {
  renderDaily("#dq-out", DQ, "dq", "Daily Quiz");
  renderDaily("#dc-out", DC, "dc", "Daily Challenge");
  renderHistory();
});
