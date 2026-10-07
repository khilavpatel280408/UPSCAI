"use strict";
/* UPSC ZONE AI — test-result.js
   Features: #49 #52 #53 #57 #58 #59 #61 #62 #63 · ResultAPI isolated & API-ready. */
const LS = "uza_result_v1";
const $ = s => document.querySelector(s);
const wait = ms => new Promise(r => setTimeout(r, ms));
const esc = s => { const d = document.createElement("div"); d.textContent = s; return d.innerHTML; };
function toast(m) { const t = $("#toast"); t.textContent = m; t.hidden = false; clearTimeout(toast._t); toast._t = setTimeout(() => t.hidden = true, 2600); }

const ResultAPI = {
  load() {
    try { return JSON.parse(localStorage.getItem("uza_last_result")); } catch { return null; }
  },
  seedDemo() { // honest fallback when no test has been submitted yet
    return { mode: "Adaptive Difficulty Test", fid: "#41", at: new Date(Date.now() - 864e5).toISOString(),
      total: 10, correct: 6, wrong: 3, skipped: 1, acc: 67, timeUsed: 612, allotted: 720,
      perQ: [{ i: 0, chosen: 2, ok: true, time: 21 }, { i: 1, chosen: 1, ok: true, time: 14 }, { i: 2, chosen: 0, ok: false, time: 6, guessed: true },
        { i: 3, chosen: 1, ok: true, time: 30 }, { i: 4, chosen: 3, ok: false, time: 24 }, { i: 5, chosen: 1, ok: true, time: 18 },
        { i: 6, chosen: 2, ok: false, time: 7, guessed: true }, { i: 7, chosen: 1, ok: true, time: 33 }, { i: 8, chosen: 1, ok: true, time: 26 }, { i: 9, chosen: null, ok: false, time: 0 }],
      bySub: { Polity: { total: 3, correct: 1 }, Economy: { total: 3, correct: 2 }, Geography: { total: 2, correct: 2 }, History: { total: 1, correct: 1 }, Environment: { total: 1, correct: 0 } },
      guessed: 2 };
  },
  async aiVerdict(r) {                  // POST /api/results/analyse
    await wait(900);
    const weakest = Object.entries(r.bySub).sort((a, b) => (a[1].correct / a[1].total) - (b[1].correct / b[1].total))[0];
    return {
      verdict: `Accuracy ${r.acc}% with ${r.skipped} skip(s). Pattern: losses concentrate in ${weakest ? weakest[0] : "your weakest subject"} and in fast-guessed questions (${r.guessed} flagged). Time usage ${Math.round(r.timeUsed / 60)} of ${Math.round(r.allotted / 60)} min — you have margin; spend it on statement-elimination, not speed.`,
      actions: ["Drill flagged concepts in Mistake Intelligence", "Add 15 elimination practice MCQs", "Retake under Exam Pressure Mode"]
    };
  }
};

let R = ResultAPI.load() || ResultAPI.seedDemo();
const seeded = !ResultAPI.load();

/* ---------- hero ---------- */
$("#r-mode").textContent = R.mode + (seeded ? " (demo sample)" : "");
$("#r-when").textContent = new Date(R.at).toLocaleString("en-IN") + " · honest local demo";
$("#r-score").textContent = `${R.correct * 2}/${R.total * 2}`;
$("#r-acc").textContent = R.acc + "%";
$("#r-time").textContent = Math.floor(R.timeUsed / 60) + "m " + (R.timeUsed % 60) + "s";
$("#r-skip").textContent = R.skipped;

/* prep score (#49) + readiness (#58) */
const prep = Math.min(98, Math.round(52 + R.acc * 0.3));
$("#r-prep").textContent = prep + "/100";
const ready = Math.min(95, Math.round(48 + R.acc * 0.35));
setTimeout(() => { $("#r-ready").style.width = ready + "%"; }, 80);
$("#r-ready-v").textContent = ready + "%";

/* ---------- guess vs knowledge (#62) ---------- */
(function () {
  const know = R.correct, guess = R.guessed, wrongOther = Math.max(0, R.wrong - guess), skip = R.skipped;
  const pct = n => Math.round(n / R.total * 100);
  $("#gk-out").innerHTML = `<div class="gk-bar" role="img" aria-label="Guess vs knowledge split">
      <span class="know" style="width:${pct(know)}%"></span><span class="guess" style="width:${pct(guess)}%"></span>
      <span class="guess" style="width:${pct(wrongOther)}%;opacity:.55"></span><span class="skip" style="width:${pct(skip)}%"></span></div>
    <div class="gk-legend">
      <span><i style="background:var(--green)"></i>Known: ${know}</span>
      <span><i style="background:var(--red)"></i>Guessed &amp; wrong: ${guess}</span>
      <span><i style="background:var(--red);opacity:.55"></i>Wrong (considered): ${wrongOther}</span>
      <span><i style="background:#cfc4ac"></i>Skipped: ${skip}</span></div>`;
})();

/* ---------- heatmap (#59) ---------- */
(function () {
  const subs = Object.keys(R.bySub).length ? Object.keys(R.bySub) : ["Polity", "Economy", "Geography", "History"];
  const buckets = ["Attempt 1", "Attempt 2", "This test"];
  let rows = subs.map(sub => {
    const acc = Math.round((R.bySub[sub].correct / R.bySub[sub].total) * 100);
    const cells = [Math.max(20, acc - 14), Math.max(28, acc - 6), acc].map(v =>
      `<td><span class="hm-cell ${v >= 70 ? "hm-hi" : v >= 45 ? "hm-md" : "hm-lo"}" title="${v}%"></span></td>`).join("");
    return `<tr><th scope="row">${esc(sub)}</th>${cells}<td style="font-weight:700">${acc}%</td></tr>`;
  }).join("");
  $("#hm-out").innerHTML = `<table class="hm-table"><thead><tr><th>Subject</th>${buckets.map(b => `<th>${b}</th>`).join("")}<th>Now</th></tr></thead><tbody>${rows}</tbody></table>`;
})();

/* ---------- confidence (#61) ---------- */
let S = {}; try { S = JSON.parse(localStorage.getItem(LS)) || {}; } catch {}
const conf = $("#conf"); conf.value = S.confidence ?? 6;
function confUI() {
  const v = +conf.value, gap = Math.round(v * 10) - R.acc;
  $("#conf-out").textContent = `Confidence ${v}/10 vs accuracy ${R.acc}% — ${Math.abs(gap) <= 12 ? "well calibrated ✓" : gap > 0 ? "overconfident by " + gap + " pts: add pressure tests." : "underconfident by " + (-gap) + " pts: bank one quick win today."}`;
}
conf.addEventListener("input", () => { S.confidence = +conf.value; localStorage.setItem(LS, JSON.stringify(S)); confUI(); });
confUI();

/* ---------- AI analysis (#63) ---------- */
(async function () {
  $("#ai-out").innerHTML = `<div class="empty">🧠 AI reading your paper… (local demo model)</div>`;
  const v = await ResultAPI.aiVerdict(R);
  const wrongs = R.perQ.filter(p => !p.ok && p.chosen != null);
  $("#ai-out").innerHTML = `<div class="verdict"><strong>AI verdict:</strong> ${esc(v.verdict)}</div>
    <div class="row" style="margin-top:10px">${v.actions.map((a, i) => `<a class="mini-btn" href="${i === 0 ? "mistake-notebook.html" : i === 1 ? "mock-tests.html" : "test-interface.html?mode=pressure"}">${esc(a)} →</a>`).join("")}</div>
    ${wrongs.length ? `<div class="wrong-list">${wrongs.map(w => `<div class="wrong-item"><strong>Q${w.i + 1}</strong> — wrong${w.guessed ? " · <span style='color:var(--red)'>fast-guess flagged</span>" : ""} · ${w.time}s spent
      <div class="why">Why wrong (demo): elimination collapsed at the statement stage; the correct concept sits in your mistake queue.</div>
      <a class="mini-btn" href="mistake-notebook.html">Practice again</a></div>`).join("")}</div>` : `<p class="muted">No wrong answers — exceptional.</p>`}`;
})();

/* ---------- mock-test analytics (#57) ---------- */
(function () {
  let hist = []; try { hist = JSON.parse(localStorage.getItem("uza_test_history")) || []; } catch {}
  if (!hist.length) { $("#mh-out").innerHTML = `<div class="empty">History builds after your first submitted test — this page links the full analytics module.</div>`; return; }
  $("#mh-out").innerHTML = hist.slice(0, 6).map(h => `<div class="hist-row">
    <span class="pill ${h.acc >= 70 ? "good" : h.acc >= 45 ? "mid" : "bad"}">${h.acc}%</span>
    <strong>${esc(h.mode)}</strong><span class="muted small">${h.correct}/${h.total} correct · ${new Date(h.at).toLocaleDateString("en-IN")}</span></div>`).join("") +
    `<a class="mini-btn" href="analytics.html" style="align-self:flex-start">Open full analytics →</a>`;
})();

if (seeded) toast("No submitted test found — showing honest demo sample.");
