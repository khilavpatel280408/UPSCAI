"use strict";
/* UPSC ZONE AI — analytics.js · 19 features
   #49 #50 #51 #52 #53 #54 #55 #56 #57 #58 #59 #60 #61 #62 #63 #184 #189 #190 #192
   AnalyticsAPI isolated & API-ready. */
const LS = "uza_analytics_v1";
const $ = s => document.querySelector(s);
const wait = ms => new Promise(r => setTimeout(r, ms));
const esc = s => { const d = document.createElement("div"); d.textContent = s; return d.innerHTML; };
let S = {}; try { S = JSON.parse(localStorage.getItem(LS)) || {}; } catch {}
const save = () => localStorage.setItem(LS, JSON.stringify(S));
function toast(m) { const t = $("#toast"); t.textContent = m; t.hidden = false; clearTimeout(toast._t); toast._t = setTimeout(() => t.hidden = true, 2600); }

const D = {
  prep: 72, cons: 74, cov: 66, out: 71, readiness: 68,
  subjects: [
    { s: "Polity", acc: 48, t: "41s", tr: -3 }, { s: "Economy", acc: 61, t: "38s", tr: +5 },
    { s: "Geography", acc: 82, t: "29s", tr: +2 }, { s: "Modern History", acc: 70, t: "33s", tr: +1 },
    { s: "Environment", acc: 55, t: "44s", tr: -1 }, { s: "Science & Tech", acc: 63, t: "36s", tr: +4 }
  ],
  topics: [["Fundamental Rights 20–32", 42], ["Monetary Policy & RBI", 51], ["Climate treaties", 55], ["Monsoon mechanism", 88], ["Freedom Struggle 30–47", 84], ["Parliament procedures", 79]],
  trend: [52, 58, 55, 64, 67, 74],
  memory: [["Polity", 48], ["Economy", 61], ["Geography", 82], ["History", 70], ["Environment", 55]],
  hours: [3.5, 5, 4.5, 6, 2.5, 5.5, 6.5],
  rev: { on: 62, late: 26, skip: 12 }
};
const AnalyticsAPI = {
  async weekly() { await wait(900); return ["Accuracy +6 pts week-over-week; Polity still the drag (-3).", "Revision on-time rate 62% — target 75%.", "Focus hours 33.5 (target 35) — Thursday dip detected.", "Next week's AI prescription: 2 Polity drills + 1 pressure mock."]; },
  async monthly() { await wait(950); return ["Mock average rose 52 → 74 over the month.", "Syllabus coverage +9% (now 66%).", "Memory strength stable in Geography, decaying in Polity (-11).", "Milestones: 2 of 6 closed. On trajectory for Foundation exit next month."]; }
};

/* ---------- scores (#49 #58 #61) ---------- */
$("#a-prep").textContent = D.prep + "/100";
setTimeout(() => {
  $("#b-cons").style.width = D.cons + "%"; $("#b-cov").style.width = D.cov + "%"; $("#b-out").style.width = D.out + "%";
  $("#a-ready-d").style.background = `conic-gradient(var(--saffron) ${D.readiness * 3.6}deg,#eee3cf 0deg)`;
}, 70);
$("#a-ready").textContent = D.readiness;
const conf = $("#a-conf"); conf.value = S.confidence ?? 6;
function confUI() {
  const gap = Math.round(conf.value * 7) - 67;
  $("#a-conf-out").textContent = `Confidence ${conf.value}/10 · calibration ${Math.abs(gap) <= 10 ? "healthy ✓" : gap > 0 ? "overconfident — add pressure tests" : "underconfident — take one quick win"}.`;
}
conf.addEventListener("input", () => { S.confidence = +conf.value; save(); confUI(); });
confUI();

/* ---------- subjects table (#50 #52 #53) ---------- */
$("#sub-tbl").innerHTML = D.subjects.map(x => `<tr><td><strong>${x.s}</strong></td><td>${x.acc}%</td><td>${x.t}</td>
  <td class="${x.tr >= 0 ? "trend-up" : "trend-dn"}">${x.tr >= 0 ? "▲ +" : "▼ "}${x.tr}</td></tr>`).join("");

/* ---------- topics + weak/strong (#51 #54 #55) ---------- */
$("#topic-list").innerHTML = D.topics.map(([t, v]) => `<div class="topic-row"><span>${esc(t)}</span>
  <span class="topic-bar"><span style="width:${v}%;background:${v >= 70 ? "var(--green)" : v >= 50 ? "var(--saffron)" : "var(--red)"}"></span></span>
  <strong>${v}%</strong></div>`).join("");
const sorted = [...D.topics].sort((a, b) => a[1] - b[1]);
$("#weak-ul").innerHTML = sorted.slice(0, 3).map(x => `<li>${esc(x[0])} (${x[1]}%)</li>`).join("");
$("#strong-ul").innerHTML = sorted.slice(-3).reverse().map(x => `<li>${esc(x[0])} (${x[1]}%)</li>`).join("");

/* ---------- trend svg (#57 #192) ---------- */
(function () {
  const w = 320, h = 120, n = D.trend.length;
  const pts = D.trend.map((v, i) => [20 + i * (w - 40) / (n - 1), h - 14 - (v - 40) / 45 * (h - 30)]);
  $("#trend-svg").innerHTML =
    `<polyline class="tl" points="${pts.map(p => p.join(",")).join(" ")}"/>` +
    pts.map((p, i) => `<circle class="tdot" cx="${p[0]}" cy="${p[1]}" r="4"><title>Test ${i + 1}: ${D.trend[i]}%</title></circle>`).join("") +
    pts.map((p, i) => `<text x="${p[0]}" y="${p[1] - 10}" text-anchor="middle" font-size="9" fill="#5c6773">${D.trend[i]}</text>`).join("");
  $("#trend-legend").textContent = `Last ${n} tests · +${D.trend[n - 1] - D.trend[0]} pts overall · productivity trend mirrors study hours (#192).`;
})();

/* ---------- heatmap + memory (#59 #60) ---------- */
(function () {
  const subs = ["Pol", "Eco", "Geo", "His", "Env", "S&T"];
  $("#hm-grid").innerHTML = D.subjects.map((s, i) => {
    const cells = [s.acc - 14, s.acc - 6, s.acc].map(v => {
      const c = v >= 70 ? "var(--green)" : v >= 45 ? "var(--saffron)" : "var(--red)";
      return `<span class="hm-cell" style="background:${c}" title="${s.s}: ${Math.max(15, Math.round(v))}%">${Math.max(15, Math.round(v))}</span>`;
    }).join("");
    return cells;
  }).join("");
  $("#mem-bars").innerHTML = D.memory.map(([t, v]) => `<div class="mem-row"><span>${t}</span>
    <span class="bar"><span style="width:${v}%;background:${v >= 70 ? "var(--green)" : v >= 55 ? "var(--saffron)" : "var(--red)"}"></span></span>
    <strong>${v}%</strong></div>`).join("");
})();

/* ---------- revision (#56) ---------- */
setTimeout(() => {
  $("#rv-on").style.width = D.rev.on + "%"; $("#rv-late").style.width = D.rev.late + "%"; $("#rv-skip").style.width = D.rev.skip + "%";
}, 90);
$("#rv-on-v").textContent = D.rev.on + "%"; $("#rv-late-v").textContent = D.rev.late + "%"; $("#rv-skip-v").textContent = D.rev.skip + "%";

/* ---------- productivity hours (#184) ---------- */
$("#hours-bars").innerHTML = D.hours.map((h, i) => `<div class="col"><span style="height:${h / 7 * 70}px" title="${h}h"></span>${["M", "T", "W", "T", "F", "S", "S"][i]}</div>`).join("");

/* ---------- AI analysis (#63) ---------- */
$("#ai-out").innerHTML = `<div class="report-box"><strong>AI reading:</strong> gains are real (+22 pts/month) but concentrated in Geography/History. Polity accuracy keeps falling — root cause traced in Mistake Intelligence to writ-jurisdiction confusion. Recommendation: swap one weekly mock for two Polity concept drills until accuracy crosses 55%. Confidence calibration is healthy.</div>`;

/* ---------- reports (#189 #190) ---------- */
async function makeReport(btn, out, fn, label) {
  btn.disabled = true; const old = btn.textContent;
  btn.innerHTML = '<span class="spinner"></span> Compiling…';
  $(out).innerHTML = `<div class="empty" style="margin-top:6px">Analysing activity… (local demo)</div>`;
  const lines = await fn();
  $(out).innerHTML = `<div class="report-box"><strong>${label}</strong><ul>${lines.map(l => `<li>${esc(l)}</li>`).join("")}</ul>
    <p class="small muted" style="margin-top:8px">Generated ${new Date().toLocaleString("en-IN")} · saved locally.</p></div>`;
  btn.disabled = false; btn.textContent = "↻ " + old;
  toast(label + " ready ✓");
}
$("#wk-btn").addEventListener("click", () => makeReport("#wk-btn", "#wk-out", AnalyticsAPI.weekly, "Weekly Performance Report (#189)"));
$("#mo-btn").addEventListener("click", () => makeReport("#mo-btn", "#mo-out", AnalyticsAPI.monthly, "Monthly Progress Report (#190)"));
