// ═══════════════════════════════════════════════════════════════
//  Web 程式設計(一) — 全題測驗（選擇題全部必考）
//  題庫：asset/data/web1.json
//    choice: { q, opts[4], key: "C" | "BD", alt?, note?, tip? }   題目含「（複選）」或 key 多於一個字母即為複選
// ═══════════════════════════════════════════════════════════════
const STORE = "web1_quiz_v1";
const QS = [], byId = {};

function build(data) {
  data.choice.forEach((c, i) => {
    const q = { id: "c" + (i + 1), n: i + 1, text: c.q.replace("（複選）", "").trim(),
      opts: c.opts, key: c.key, multi: c.q.includes("（複選）") || c.key.length > 1,
      alt: c.alt || "", note: c.note || "", tip: c.tip || "" };
    QS.push(q); byId[q.id] = q;
  });
}

/* ---------- 狀態（存在 localStorage） ---------- */
const fresh = () => ({ ans: {}, done: {}, instant: false, submitted: false });
let S = (() => {
  try {
    const raw = localStorage.getItem(STORE);
    if (raw) { const s = JSON.parse(raw); if (s && s.ans && s.done) return Object.assign(fresh(), s); }
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
// 反引號包住的文字顯示為 <code>
const rt = s => String(s).split("`").map((p, i) => i % 2 ? `<code>${esc(p)}</code>` : esc(p)).join("");
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

const isAnswered = q => !!S.ans[q.id];
function isRight(q) {
  const a = S.ans[q.id] || "";
  return a === q.key || (!!q.alt && a === q.alt);
}
const locked = q => S.submitted || !!S.done[q.id];

/* ---------- 題目渲染 ---------- */
function verdict(q) {
  if (!isAnswered(q)) return `<span class="verdict bad">未作答</span>`;
  return isRight(q) ? `<span class="verdict ok">答對了</span>` : `<span class="verdict bad">答錯了</span>`;
}
function redoBtn() { return S.submitted ? "" : `<button type="button" class="link" data-act="redo">重做這題</button>`; }
function noteHtml(q) { return q.note ? `<p class="note">補充：${rt(q.note)}</p>` : ""; }

function htmlQ(q) {
  const a = S.ans[q.id] || "", done = locked(q);
  const opts = q.opts.map((o, i) => {
    const l = "ABCD"[i], on = a.includes(l);
    let cls = "opt";
    if (done) {
      if (q.key.includes(l) || (q.alt === l && on)) cls += " key";
      else if (on) cls += " miss";
    }
    return `<button type="button" class="${cls}" data-act="pick" data-l="${l}" aria-pressed="${on}"${done ? " disabled" : ""}><span class="bubble" aria-hidden="true">${l}</span><span class="opt-text">${rt(o)}</span></button>`;
  }).join("");
  let foot = "";
  if (done) {
    const keyTxt = q.key.split("").join("、") + (q.alt ? `（${q.alt} 也算對）` : "");
    foot = `<div class="fb">${verdict(q)}${isRight(q) ? "" : `<span>正確答案：<b>${keyTxt}</b></span>`}${redoBtn()}</div>${noteHtml(q)}`;
  } else if (S.instant && q.multi) {
    foot = `<div class="fb"><button type="button" class="btn small" data-act="check"${a ? "" : " disabled"}>確認答案</button><span class="hint">複選題選好後再按確認</span></div>`;
  }
  const tags = (q.multi ? '<span class="tag">複選</span>' : "") + (q.tip ? `<span class="tag tip">${esc(q.tip)}</span>` : "");
  return `<div class="q-num">${q.n}</div><div class="q-body"><p class="q-text">${rt(q.text)}${tags}</p><div class="opts" role="group" aria-label="第 ${q.n} 題選項">${opts}</div>${foot}</div>`;
}

/* ---------- 答案卡 ---------- */
function cardRow(q) {
  const done = locked(q);
  const cls = "row" + (done ? (isRight(q) ? " ok" : " bad") : "");
  const jump = `<button type="button" class="rn" data-jump="${q.id}" aria-label="跳到第 ${q.n} 題">${q.n}</button>`;
  const a = S.ans[q.id] || "";
  const bubbles = "ABCD".split("").map(l => {
    const on = a.includes(l);
    return `<button type="button" class="cb${on ? " on" : ""}${done && (q.key.includes(l) || (q.alt === l && on)) ? " key" : ""}" data-card="${q.id}" data-l="${l}" aria-label="第 ${q.n} 題劃記 ${l}" aria-pressed="${on}"${done ? " disabled" : ""}>${l}</button>`;
  }).join("");
  return `<div class="${cls}" data-row="${q.id}">${jump}${bubbles}</div>`;
}
function renderCard() {
  let html = "";
  for (let i = 0; i < QS.length; i += 5) html += `<div class="grp">${QS.slice(i, i + 5).map(cardRow).join("")}</div>`;
  $("#card-c").innerHTML = html;
}
function refreshRow(q) {
  const el = document.querySelector(`[data-row="${q.id}"]`);
  if (el) el.outerHTML = cardRow(q);
}

/* ---------- 整頁渲染 ---------- */
function renderAll() {
  $("#list-c").innerHTML = QS
    .map(q => `<article class="q" id="q-${q.id}" data-id="${q.id}" tabindex="-1">${htmlQ(q)}</article>`).join("");
  renderCard(); stats(); renderSummary(); applyFilter();
}
function refreshQ(q) {
  const el = document.getElementById("q-" + q.id);
  if (el) el.innerHTML = htmlQ(q);
  refreshRow(q); stats();
}
function stats() {
  const total = QS.length, answered = QS.filter(isAnswered).length;
  const graded = QS.filter(locked), right = graded.filter(isRight).length;
  $("#st-answered").innerHTML = `<span class="lbl">已作答 </span><b>${answered}</b> / ${total}`;
  $("#st-score").innerHTML = graded.length ? `答對 <b>${right}</b> / ${graded.length}` : "尚未對答案";
  $("#progress").style.width = (answered / total * 100) + "%";
  $("#btn-submit").textContent = S.submitted ? "看成績" : "交卷";
}
function renderSummary() {
  const box = $("#summary");
  if (!S.submitted) { box.hidden = true; box.innerHTML = ""; return; }
  const ms = QS.filter(q => q.multi);
  const tot = QS.filter(isRight).length, mr = ms.filter(isRight).length;
  const blank = QS.filter(q => !isAnswered(q)).length;
  const pct = Math.round(tot / QS.length * 100);
  box.innerHTML = `<div class="sum-score"><span class="big">${pct}</span><span class="unit">分</span></div>
    <div class="sum-detail"><p>總共答對 ${tot} / ${QS.length} 題（單選 ${tot - mr} / ${QS.length - ms.length}、複選 ${mr} / ${ms.length}）${blank ? `，其中 ${blank} 題未作答，以答錯計分` : ""}。</p>
    <div class="sum-actions">${tot < QS.length ? '<button type="button" class="btn primary small" data-sum="wrong">只看答錯的題目</button>' : ""}<button type="button" class="btn small" data-sum="all">看全部題目</button></div></div>`;
  box.hidden = false;
}
function applyFilter() {
  const f = $("#filter").value;
  let shown = 0;
  QS.forEach(q => {
    let show = true;
    if (f === "multi") show = q.multi;
    else if (f === "todo") show = !isAnswered(q);
    else if (f === "wrong") show = locked(q) && !isRight(q);
    document.getElementById("q-" + q.id).hidden = !show;
    if (show) shown++;
  });
  $("#sec-c").hidden = !shown;
  $("#empty").hidden = shown > 0;
}

/* ---------- 互動 ---------- */
function pick(id, l) {
  const q = byId[id];
  if (locked(q)) return;
  let a = S.ans[id] || "";
  if (q.multi) a = a.includes(l) ? a.replace(l, "") : (a + l).split("").sort().join("");
  else a = l;
  if (a) S.ans[id] = a; else delete S.ans[id];
  if (!q.multi && S.instant) S.done[id] = true;
  refreshQ(q); save();
}
function check(id) {
  const q = byId[id];
  if (!isAnswered(q)) return;
  S.done[id] = true; refreshQ(q); save();
}
function redo(id) {
  const q = byId[id];
  delete S.ans[id]; delete S.done[id];
  refreshQ(q); save();
  const first = document.querySelector(`#q-${id} .opt`);
  if (first) first.focus({ preventScroll: true });
}
function jumpTo(id) {
  const el = document.getElementById("q-" + id);
  if (el.hidden) { $("#filter").value = "all"; applyFilter(); }
  closeCard();
  el.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  el.classList.remove("flash"); void el.offsetWidth; el.classList.add("flash");
  setTimeout(() => {
    const first = el.querySelector(".opt:not(:disabled)");
    (first || el).focus({ preventScroll: true });
  }, reduced ? 0 : 350);
}

/* 題目區事件 */
document.querySelector("main").addEventListener("click", e => {
  const sumBtn = e.target.closest("[data-sum]");
  if (sumBtn) {
    $("#filter").value = sumBtn.dataset.sum; applyFilter();
    const target = sumBtn.dataset.sum === "wrong" ? QS.find(q => locked(q) && !isRight(q)) : QS[0];
    if (target) document.getElementById("q-" + target.id).scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
    return;
  }
  const btn = e.target.closest("[data-act]");
  if (!btn) return;
  const art = btn.closest(".q"); if (!art) return;
  const id = art.dataset.id, act = btn.dataset.act, kb = e.detail === 0;
  if (act === "pick") {
    const l = btn.dataset.l; pick(id, l);
    if (kb) { const nb = art.querySelector(`[data-l="${l}"]`); (nb && !nb.disabled ? nb : art).focus(); }
  } else if (act === "check") { check(id); if (kb) art.focus(); }
  else if (act === "redo") redo(id);
});

/* 答案卡事件 */
$("#card").addEventListener("click", e => {
  const j = e.target.closest("[data-jump]");
  if (j) { jumpTo(j.dataset.jump); return; }
  const b = e.target.closest("[data-card]");
  if (b) {
    const id = b.dataset.card, l = b.dataset.l;
    pick(id, l);
    const nb = document.querySelector(`[data-card="${id}"][data-l="${l}"]`);
    if (nb && !nb.disabled && e.detail === 0) nb.focus();
  }
});

/* 工具列 */
const instantBox = $("#opt-instant");
instantBox.checked = S.instant;
instantBox.addEventListener("change", () => {
  S.instant = instantBox.checked; save();
  QS.forEach(q => { if (!locked(q)) document.getElementById("q-" + q.id).innerHTML = htmlQ(q); });
});
$("#filter").addEventListener("change", applyFilter);

// 危險操作需在 4 秒內按第二次才執行
function twoStep(btn, label, run) {
  if (btn.dataset.armed) { clearTimeout(+btn.dataset.armed); delete btn.dataset.armed; btn.classList.remove("warn"); run(); return; }
  const orig = btn.textContent;
  btn.textContent = label; btn.classList.add("warn");
  btn.dataset.armed = setTimeout(() => { delete btn.dataset.armed; btn.classList.remove("warn"); btn.textContent = orig; stats(); }, 4000);
}
// 不用全部答完就能交卷，未作答的題目直接算答錯
$("#btn-submit").addEventListener("click", () => {
  if (!S.submitted) {
    S.submitted = true; QS.forEach(q => { S.done[q.id] = true; });
    save(); renderAll();
  }
  $("#summary").scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
});
$("#btn-reset").addEventListener("click", e => {
  const btn = e.currentTarget;
  twoStep(btn, "再按一次就清除所有作答", () => {
    S = Object.assign(fresh(), { instant: S.instant });
    save();
    btn.textContent = "重新作答";
    $("#filter").value = "all";
    renderAll();
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  });
});

/* 手機版答案卡 */
const card = $("#card"), scrim = $("#scrim"), fab = $("#fab");
function openCard() { card.classList.add("open"); scrim.classList.add("show"); $("#card-close").focus(); }
function closeCard() { if (!card.classList.contains("open")) return; card.classList.remove("open"); scrim.classList.remove("show"); }
fab.addEventListener("click", openCard);
$("#card-close").addEventListener("click", () => { closeCard(); fab.focus(); });
scrim.addEventListener("click", closeCard);
document.addEventListener("keydown", e => { if (e.key === "Escape") closeCard(); });

/* ---------- 初始化 ---------- */
fetch("../../asset/data/web1.json")
  .then(r => r.json())
  .then(data => {
    build(data);
    const multi = QS.filter(q => q.multi).length;
    $("#n-c").textContent = QS.length;
    $("#sub-c").textContent = `單選 ${QS.length - multi} 題、複選 ${multi} 題`;
    renderAll();
  })
  .catch(() => {
    $("#list-c").innerHTML = '<p class="loading">題庫載入失敗，請用本地伺服器開啟（例如 python3 -m http.server）。</p>';
  });
