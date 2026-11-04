// ═══════════════════════════════════════════════════════════════
//  問答題測驗（不計分）— 每題寫完後按「對答案」顯示參考答案
//  用法：<script src="essay_quiz.js" data-src="題庫.json" data-store="localStorage key">
//  題庫：{ title, info, questions: [{ q, score?, ref?, tables?, answer?, sub? }] }
//    answer: [{ k?: 粗體標題, v: 內容 }]
//    tables: [{ caption, pk?: 主鍵欄位索引, head: [], rows: [[]] }]
//    sub:    [{ label, op, ok, rule, why }]   有小題時每個小題各自作答、各自對答案
// ═══════════════════════════════════════════════════════════════
const SCRIPT = document.currentScript;
const STORE = SCRIPT.dataset.store;
const ITEMS = [], byId = {};   // 每個作答格（一般題目或小題）

/* ---------- 狀態（存在 localStorage） ---------- */
const fresh = () => ({ ans: {}, shown: {} });
let S = (() => {
  try {
    const raw = localStorage.getItem(STORE);
    if (raw) { const s = JSON.parse(raw); if (s && s.ans && s.shown) return s; }
  } catch (e) {}
  return fresh();
})();
let saveTimer;
function save() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => { try { localStorage.setItem(STORE, JSON.stringify(S)); } catch (e) {} }, 150);
}

/* ---------- 工具 ---------- */
const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const isAnswered = it => !!(S.ans[it.id] || "").trim();

/* ---------- 渲染 ---------- */
function tableHtml(t) {
  const head = t.head.map((h, i) => `<th${i === t.pk ? ' class="pk"' : ""}>${esc(h)}</th>`).join("");
  const rows = t.rows.map(r => `<tr>${r.map(c => `<td>${esc(c)}</td>`).join("")}</tr>`).join("");
  return `<table class="tbl"><caption>${esc(t.caption)}</caption><thead><tr>${head}</tr></thead><tbody>${rows}</tbody></table>`;
}
function answerHtml(it) {
  const body = it.sub
    ? `<p>${it.sub.ok ? "✅ 允許" : "❌ 不允許"}｜違反的限制：<b>${esc(it.sub.rule)}</b></p><p>原因：${esc(it.sub.why)}</p>`
    : it.answer.map(a => `<p>${a.k ? `<b>${esc(a.k)}</b>：` : ""}${esc(a.v)}</p>`).join("");
  return `<div class="ans"><span class="ans-title">參考答案</span>${body}</div>`;
}
function slotHtml(it) {
  const shown = !!S.shown[it.id];
  return `<div class="fb"><button type="button" class="btn small${shown ? "" : " primary"}" data-act="toggle">${shown ? "隱藏答案" : "對答案"}</button></div>${shown ? answerHtml(it) : ""}`;
}
function writeHtml(it, short) {
  return `<textarea class="write${short ? " short" : ""}" data-id="${it.id}" aria-label="${esc(it.label)}作答" placeholder="在這裡寫下你的答案…">${esc(S.ans[it.id] || "")}</textarea>
    <div class="slot" id="slot-${it.id}" data-id="${it.id}">${slotHtml(it)}</div>`;
}
function questionHtml(q, n) {
  const tags = (q.score ? `<span class="tag">${q.score} 分</span>` : "") + (q.ref ? `<span class="tag ref">${esc(q.ref)}</span>` : "");
  const tables = q.tables ? `<div class="tables">${q.tables.map(tableHtml).join("")}</div>` : "";
  const body = q.sub
    ? q.sub.map(s => {
        const it = byId[`q${n}${s.label}`];
        return `<div class="sub"><p class="sub-op"><b>(${esc(s.label)})</b>${esc(s.op)}</p>${writeHtml(it, true)}</div>`;
      }).join("")
    : writeHtml(byId[`q${n}`]);
  return `<article class="q" id="q-${n}"><div class="q-num">${n}</div><div class="q-body"><p class="q-text">${esc(q.q)}${tags}</p>${tables}${body}</div></article>`;
}
function refreshSlot(it) {
  const el = document.getElementById("slot-" + it.id);
  if (el) el.innerHTML = slotHtml(it);
}
function stats() {
  const total = ITEMS.length, answered = ITEMS.filter(isAnswered).length;
  $("#st-answered").innerHTML = `<span class="lbl">已作答 </span><b>${answered}</b> / ${total}`;
  $("#progress").style.width = (answered / total * 100) + "%";
  $("#btn-all").textContent = ITEMS.every(it => S.shown[it.id]) ? "全部隱藏答案" : "全部對答案";
}

/* ---------- 互動 ---------- */
document.querySelector("main").addEventListener("input", e => {
  const ta = e.target.closest(".write"); if (!ta) return;
  S.ans[ta.dataset.id] = ta.value;
  stats(); save();
});
document.querySelector("main").addEventListener("click", e => {
  const btn = e.target.closest('[data-act="toggle"]'); if (!btn) return;
  const it = byId[btn.closest(".slot").dataset.id];
  if (S.shown[it.id]) delete S.shown[it.id]; else S.shown[it.id] = true;
  refreshSlot(it); stats(); save();
});
$("#btn-all").addEventListener("click", () => {
  const hide = ITEMS.every(it => S.shown[it.id]);
  ITEMS.forEach(it => { if (hide) delete S.shown[it.id]; else S.shown[it.id] = true; refreshSlot(it); });
  stats(); save();
});

// 危險操作需在 4 秒內按第二次才執行
function twoStep(btn, label, run) {
  if (btn.dataset.armed) { clearTimeout(+btn.dataset.armed); delete btn.dataset.armed; btn.classList.remove("warn"); run(); return; }
  const orig = btn.textContent;
  btn.textContent = label; btn.classList.add("warn");
  btn.dataset.armed = setTimeout(() => { delete btn.dataset.armed; btn.classList.remove("warn"); btn.textContent = orig; }, 4000);
}
$("#btn-reset").addEventListener("click", e => {
  const btn = e.currentTarget;
  twoStep(btn, "再按一次就清除所有作答", () => {
    S = fresh(); save();
    btn.textContent = "清除作答";
    document.querySelectorAll(".write").forEach(ta => { ta.value = ""; });
    ITEMS.forEach(refreshSlot); stats();
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  });
});

/* ---------- 初始化 ---------- */
fetch(SCRIPT.dataset.src)
  .then(r => r.json())
  .then(data => {
    data.questions.forEach((q, i) => {
      const n = i + 1;
      if (q.sub) q.sub.forEach(s => { const it = { id: `q${n}${s.label}`, label: `第 ${n} 題 (${s.label}) `, sub: s }; ITEMS.push(it); byId[it.id] = it; });
      else { const it = { id: `q${n}`, label: `第 ${n} 題`, answer: q.answer }; ITEMS.push(it); byId[it.id] = it; }
    });
    document.title = data.title;
    $(".bar h1").textContent = data.title;
    $("#info").textContent = data.info || "";
    $("#list").innerHTML = data.questions.map((q, i) => questionHtml(q, i + 1)).join("");
    stats();
  })
  .catch(() => {
    $("#list").innerHTML = '<p class="loading">題庫載入失敗，請用本地伺服器開啟（例如 python3 -m http.server）。</p>';
  });
