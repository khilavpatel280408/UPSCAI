"use strict";
/* UPSC ZONE AI — preparation.js
   Features: #205 #206 #207 #208 #209 #210 #211 #212 #214 #215 #216 #217
   PrepAPI isolated & API-ready. */
const LS = "uza_prep_v1";
const $ = s => document.querySelector(s);
const wait = ms => new Promise(r => setTimeout(r, ms));
const esc = s => { const d = document.createElement("div"); d.textContent = s; return d.innerHTML; };
let S = {}; try { S = JSON.parse(localStorage.getItem(LS)) || {}; } catch {}
const save = () => localStorage.setItem(LS, JSON.stringify(S));
function toast(m) { const t = $("#toast"); t.textContent = m; t.hidden = false; clearTimeout(toast._t); toast._t = setTimeout(() => t.hidden = true, 2800); }

const PrepAPI = {
  async readiness() {                    // #217
    await wait(700);
    return { prelims: 58, mains: 22, essay: 10, interview: 4, overall: 62,
      note: "Prelims trajectory is healthy; Mains output is the bottleneck — shift 30% of weekly hours to answer writing." };
  },
  async interviewQs() {                  // #214
    await wait(850);
    return ["Why civil services, and why not the private sector?", "Your home district faces a water crisis — first three actions as SDM?", "Defend your optional subject's relevance to administration."];
  },
  async strategy() {                     // #215
    await wait(800);
    return ["Current phase: late Concept Building → start PYQ integration now.", "Weakest lever: GS-2 answer structure (48%) — two timed answers/week.", "CSAT is unstarted — qualifying papers kill attempts; Sunday slot booked.", "Interview stays locked until Mains readiness crosses 70%."];
  }
};

/* ---------- countdown (#216) ---------- */
function renderCountdown() {
  const days = Math.max(0, Math.ceil((new Date("2027-05-30T09:30:00+05:30") - Date.now()) / 864e5));
  $("#pc-days").textContent = days;
}

/* ---------- readiness meters ---------- */
(async function () {
  const r = await PrepAPI.readiness();
  setTimeout(() => {
    $("#m-pre").style.width = r.prelims + "%"; $("#v-pre").textContent = r.prelims + "%";
    $("#m-mai").style.width = r.mains + "%"; $("#v-mai").textContent = r.mains + "%";
    $("#m-ess").style.width = r.essay + "%"; $("#v-ess").textContent = r.essay + "%";
    $("#m-int").style.width = r.interview + "%"; $("#v-int").textContent = r.interview + "%";
    $("#ready-fill").style.width = r.overall + "%"; $("#ready-val").textContent = r.overall + "%";
    $("#ready-note").textContent = r.note;
  }, 80);
})();

/* ---------- GS tracking (#209) ---------- */
const GS = [["GS-1", 66], ["GS-2", 48], ["GS-3", 55], ["GS-4", 30]];
$("#gs-out").innerHTML = GS.map(([g, v]) => `<div class="gs-row"><span>${g}</span>
  <span class="meter"><span style="width:${v}%;background:${v >= 60 ? "var(--green)" : "var(--saffron)"}"></span></span><strong>${v}%</strong></div>`).join("");

/* ---------- optional (#210) ---------- */
$("#opt-sel").value = S.optional || "PSIR";
$("#opt-prog").value = S.optProg ?? 35;
$("#opt-out").textContent = (S.optProg ?? 35) + "%";
$("#opt-sel").addEventListener("change", e => { S.optional = e.target.value; save(); toast(`Optional: ${S.optional} (#210).`); });
$("#opt-prog").addEventListener("input", e => { S.optProg = +e.target.value; $("#opt-out").textContent = S.optProg + "%"; save(); });
document.querySelectorAll('input[name="csat"]').forEach(r => r.addEventListener("change", () => { S.csat = r.value; save(); toast("CSAT status saved (#211)."); }));
document.querySelectorAll('input[name="eth"]').forEach(r => r.addEventListener("change", () => { S.eth = r.value; save(); toast("Ethics status saved (#212)."); }));

/* ---------- interview simulator (#214) ---------- */
$("#iv-btn").addEventListener("click", async () => {
  const out = $("#iv-out"), btn = $("#iv-btn");
  btn.disabled = true; btn.innerHTML = '<span class="spinner"></span> Panel…';
  out.innerHTML = `<div class="empty" style="margin-top:8px">Panel is preparing questions…</div>`;
  const qs = await PrepAPI.interviewQs();
  out.innerHTML = qs.map((q, i) => `<div class="iv-line"><strong>M${i + 1}:</strong> ${esc(q)}</div>`).join("");
  btn.disabled = false; btn.innerHTML = 'Run simulator <span class="fid">#214</span>';
  toast("Mock interview round generated (#214).");
});

/* ---------- strategy (#215) ---------- */
$("#st-btn").addEventListener("click", async () => {
  const out = $("#st-out"); out.innerHTML = `<div class="empty">Calibrating phase strategy…</div>`;
  const lines = await PrepAPI.strategy();
  out.innerHTML = `<div class="strat-box"><strong>Phase strategy</strong><ul>${lines.map(l => `<li>${esc(l)}</li>`).join("")}</ul></div>`;
});

document.addEventListener("DOMContentLoaded", renderCountdown);
