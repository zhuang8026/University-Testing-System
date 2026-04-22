// ═══════════════════════════════════════════════════════════════
//  DATA — Childhood + All Rise
// ═══════════════════════════════════════════════════════════════
let CHILD_CORE = [];
let CHILD_LYRICS = [];
let CHILD_FILLS = [];
let ALLRISE_CORE = [];
let ALLRISE_FILLS = [];

// flattened pools built after load
let allChildSyns = [], allChildForms = [], allChildFormSyns = [];
let allArSyns = [], allArForms = [], allArFormSyns = [], allArWords = [];

const TOTAL_QS = 50;

async function loadData() {
  const resp = await fetch('../../asset/data/en_v2_words.json');
  const data = await resp.json();
  CHILD_CORE   = data.child_core;
  CHILD_LYRICS = data.child_lyrics;
  CHILD_FILLS  = data.child_fills;
  ALLRISE_CORE = data.allrise_core;
  ALLRISE_FILLS = data.allrise_fills;

  allChildSyns     = CHILD_CORE.flatMap(c => c.syns || []);
  allChildForms    = CHILD_CORE.flatMap(c => (c.forms || []).map(f => f.f));
  allChildFormSyns = CHILD_CORE.flatMap(c => (c.forms || []).flatMap(f => f.syns || [])).filter(Boolean);

  allArSyns     = ALLRISE_CORE.flatMap(c => c.syns || []);
  allArForms    = ALLRISE_CORE.flatMap(c => (c.forms || []).map(f => f.f));
  allArFormSyns = ALLRISE_CORE.flatMap(c => (c.forms || []).flatMap(f => f.syns || [])).filter(Boolean);
  allArWords    = ALLRISE_CORE.map(c => c.w);
}

// ═══════════════════════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════════════════════
function shuffle(a) {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}
function pick(a, n) {
  const s = shuffle(a);
  return n == null ? s[0] : s.slice(0, n);
}
function pickOthers(correct, pool, n = 3) {
  return shuffle(pool.filter(x => x !== correct)).slice(0, n);
}

const posLabel = p =>
  p === 'n.'   ? '名詞' :
  p === 'adj.' ? '形容詞' :
  p === 'adv.' ? '副詞' : '動詞';

const TYPE_LABELS = {
  // Childhood
  c_syn:    'Childhood同義詞',
  c_rsyn:   'Childhood反向同義詞',
  c_en2zh:  'Childhood英翻中',
  c_zh2en:  'Childhood中翻英',
  c_wform:  'Childhood詞性',
  c_fsyn:   'Childhood衍生同義詞',
  c_fill:   'Childhood歌詞填空',
  c_phrase: 'Childhood片語',
  // All Rise
  ar_syn:    'AllRise同義詞',
  ar_rsyn:   'AllRise反向同義詞',
  ar_en2zh:  'AllRise英翻中',
  ar_zh2en:  'AllRise中翻英',
  ar_wform:  'AllRise詞性',
  ar_fsyn:   'AllRise衍生同義詞',
  ar_fill:   'AllRise歌詞填空',
  ar_phrase: 'AllRise片語',
};

// ═══════════════════════════════════════════════════════════════
//  QUESTION GENERATORS — Childhood
// ═══════════════════════════════════════════════════════════════
const G = {};

G.c_syn = () => {
  const pool = CHILD_CORE.filter(c => (c.syns || []).length > 0);
  const c = pick(pool);
  const ans = pick(c.syns);
  const distPool = [...allChildSyns, ...allChildFormSyns, ...allArSyns, ...allArFormSyns];
  const dist = pickOthers(ans, distPool, 3);
  return {
    type: 'c_syn',
    question: `下列哪個是 "${c.w}"（${c.zh}）的同義詞？`,
    options: shuffle([ans, ...dist]),
    answer: ans,
    explanation: `${c.w} 的同義詞：${c.syns.join(', ')}`,
  };
};

G.c_rsyn = () => {
  const pool = CHILD_CORE.filter(c => (c.syns || []).length > 0);
  const c = pick(pool);
  const syn = pick(c.syns);
  const others = pick(pool.filter(x => x.w !== c.w), 3).map(x => x.w);
  return {
    type: 'c_rsyn',
    question: `"${syn}" 是下列哪個單字的同義詞？`,
    options: shuffle([c.w, ...others]),
    answer: c.w,
    explanation: `${syn} 是 ${c.w}（${c.zh}）的同義詞`,
  };
};

G.c_en2zh = () => {
  const pool = [...CHILD_CORE, ...CHILD_LYRICS];
  const c = pick(pool);
  const others = pick(pool.filter(x => x.zh !== c.zh), 3).map(x => x.zh);
  return {
    type: 'c_en2zh',
    question: `歌曲 Childhood 中，"${c.w}" 的意思是？`,
    options: shuffle([c.zh, ...others]),
    answer: c.zh,
    explanation: `${c.w} → ${c.zh}`,
  };
};

G.c_zh2en = () => {
  const pool = [...CHILD_CORE, ...CHILD_LYRICS];
  const c = pick(pool);
  const others = pick(pool.filter(x => x.w !== c.w), 3).map(x => x.w);
  return {
    type: 'c_zh2en',
    question: `Childhood 歌詞中，「${c.zh}」的英文是？`,
    options: shuffle([c.w, ...others]),
    answer: c.w,
    explanation: `${c.zh} → ${c.w}`,
  };
};

G.c_wform = () => {
  const pool = CHILD_CORE.filter(c => c.forms && c.forms.length > 0);
  const c = pick(pool);
  const f = pick(c.forms);
  const distPool = [...allChildForms, ...allArForms];
  const dist = pickOthers(f.f, distPool, 3);
  return {
    type: 'c_wform',
    question: `"${c.w}"（${c.zh}）的${posLabel(f.pos)}形式是？`,
    options: shuffle([f.f, ...dist]),
    answer: f.f,
    explanation: `${c.w} → ${f.f}（${f.pos}）`,
  };
};

G.c_fsyn = () => {
  const pool = CHILD_CORE.filter(c => c.forms?.some(f => f.syns?.length > 0));
  const c = pick(pool);
  const f = pick(c.forms.filter(f => f.syns?.length > 0));
  const ans = pick(f.syns);
  const distPool = [...allChildFormSyns, ...allArFormSyns];
  const dist = pickOthers(ans, distPool, 3);
  return {
    type: 'c_fsyn',
    question: `"${f.f}" 的同義詞是？`,
    options: shuffle([ans, ...dist]),
    answer: ans,
    explanation: `${f.f}（${c.w} 的${posLabel(f.pos)}形式）同義詞：${f.syns.join(', ')}`,
  };
};

G.c_fill = () => {
  const q = pick(CHILD_FILLS);
  return {
    type: 'c_fill',
    question: `Childhood 歌詞填空：\n"${q.text}"`,
    options: shuffle([q.ans, ...q.distract]),
    answer: q.ans,
    explanation: `正確填入：${q.ans}（${q.note}）`,
  };
};

G.c_phrase = () => {
  const pool = CHILD_CORE.filter(c => c.phrase);
  const c = pick(pool);
  return {
    type: 'c_phrase',
    question: `片語 "${c.phrase.k}" 的意思是？`,
    options: shuffle([c.phrase.means, ...c.phrase.wrongMeans]),
    answer: c.phrase.means,
    explanation: `${c.phrase.k} = ${c.phrase.means}`,
  };
};

// ═══════════════════════════════════════════════════════════════
//  QUESTION GENERATORS — All Rise
// ═══════════════════════════════════════════════════════════════

G.ar_syn = () => {
  const pool = ALLRISE_CORE.filter(c => (c.syns || []).length > 0);
  const c = pick(pool);
  const ans = pick(c.syns);
  const distPool = [...allArSyns, ...allArFormSyns, ...allChildSyns, ...allChildFormSyns];
  const dist = pickOthers(ans, distPool, 3);
  return {
    type: 'ar_syn',
    question: `下列哪個是 "${c.w}"（${c.zh}）的同義詞？`,
    options: shuffle([ans, ...dist]),
    answer: ans,
    explanation: `${c.w} 的同義詞：${c.syns.join(', ')}`,
  };
};

G.ar_rsyn = () => {
  const pool = ALLRISE_CORE.filter(c => (c.syns || []).length > 0);
  const c = pick(pool);
  const syn = pick(c.syns);
  const others = pick(pool.filter(x => x.w !== c.w), 3).map(x => x.w);
  return {
    type: 'ar_rsyn',
    question: `"${syn}" 是下列哪個單字的同義詞？`,
    options: shuffle([c.w, ...others]),
    answer: c.w,
    explanation: `${syn} 是 ${c.w}（${c.zh}）的同義詞`,
  };
};

G.ar_en2zh = () => {
  const c = pick(ALLRISE_CORE);
  const others = pick(ALLRISE_CORE.filter(x => x.zh !== c.zh), 3).map(x => x.zh);
  return {
    type: 'ar_en2zh',
    question: `All Rise 歌詞中，"${c.w}" 的中文是？`,
    options: shuffle([c.zh, ...others]),
    answer: c.zh,
    explanation: `${c.w} → ${c.zh}`,
  };
};

G.ar_zh2en = () => {
  const c = pick(ALLRISE_CORE);
  const others = pick(ALLRISE_CORE.filter(x => x.w !== c.w), 3).map(x => x.w);
  return {
    type: 'ar_zh2en',
    question: `All Rise 歌詞中，「${c.zh}」的英文是？`,
    options: shuffle([c.w, ...others]),
    answer: c.w,
    explanation: `${c.zh} → ${c.w}`,
  };
};

G.ar_wform = () => {
  const pool = ALLRISE_CORE.filter(c => c.forms && c.forms.length > 0);
  const c = pick(pool);
  const f = pick(c.forms);
  const distPool = [...allArForms, ...allChildForms];
  const dist = pickOthers(f.f, distPool, 3);
  return {
    type: 'ar_wform',
    question: `"${c.w}"（${c.zh}）的${posLabel(f.pos)}形式是？`,
    options: shuffle([f.f, ...dist]),
    answer: f.f,
    explanation: `${c.w} → ${f.f}（${f.pos}）`,
  };
};

G.ar_fsyn = () => {
  const pool = ALLRISE_CORE.filter(c => c.forms?.some(f => f.syns?.length > 0));
  const c = pick(pool);
  const f = pick(c.forms.filter(f => f.syns?.length > 0));
  const ans = pick(f.syns);
  const distPool = [...allArFormSyns, ...allChildFormSyns];
  const dist = pickOthers(ans, distPool, 3);
  return {
    type: 'ar_fsyn',
    question: `"${f.f}" 的同義詞是？`,
    options: shuffle([ans, ...dist]),
    answer: ans,
    explanation: `${f.f}（${c.w} 的${posLabel(f.pos)}形式）同義詞：${f.syns.join(', ')}`,
  };
};

G.ar_fill = () => {
  const q = pick(ALLRISE_FILLS);
  return {
    type: 'ar_fill',
    question: `All Rise 歌詞填空：\n"${q.text}"`,
    options: shuffle([q.ans, ...q.distract]),
    answer: q.ans,
    explanation: `正確填入：${q.ans}`,
  };
};

G.ar_phrase = () => {
  const pool = ALLRISE_CORE.filter(c => c.phrase);
  const c = pick(pool);
  return {
    type: 'ar_phrase',
    question: `片語 "${c.phrase.k}" 的意思是？`,
    options: shuffle([c.phrase.means, ...c.phrase.wrongMeans]),
    answer: c.phrase.means,
    explanation: `${c.phrase.k} = ${c.phrase.means}`,
  };
};

// ═══════════════════════════════════════════════════════════════
//  POOL & GENERATION
// ═══════════════════════════════════════════════════════════════
const POOL = [
  ...Array(5).fill('c_syn'),
  ...Array(4).fill('c_rsyn'),
  ...Array(6).fill('c_en2zh'),
  ...Array(5).fill('c_zh2en'),
  ...Array(3).fill('c_wform'),
  ...Array(2).fill('c_fsyn'),
  ...Array(5).fill('c_fill'),
  ...Array(1).fill('c_phrase'),
  ...Array(6).fill('ar_syn'),
  ...Array(5).fill('ar_rsyn'),
  ...Array(6).fill('ar_en2zh'),
  ...Array(5).fill('ar_zh2en'),
  ...Array(3).fill('ar_wform'),
  ...Array(2).fill('ar_fsyn'),
  ...Array(5).fill('ar_fill'),
  ...Array(2).fill('ar_phrase'),
];

function generateQuiz() {
  const qs = [];
  const keys = new Set();

  const mandatory = [
    // Childhood
    'c_syn', 'c_rsyn', 'c_en2zh', 'c_zh2en',
    'c_wform', 'c_fsyn', 'c_fill', 'c_phrase',
    // All Rise
    'ar_syn', 'ar_rsyn', 'ar_en2zh', 'ar_zh2en',
    'ar_wform', 'ar_fsyn', 'ar_fill', 'ar_phrase',
  ];

  for (const t of mandatory) {
    let tries = 0;
    while (tries < 30) {
      tries++;
      const q = G[t]();
      if (!keys.has(q.question)) {
        keys.add(q.question);
        qs.push(q);
        break;
      }
    }
  }

  let safety = 0;
  while (qs.length < TOTAL_QS && safety < 300) {
    safety++;
    const t = pick(POOL);
    const q = G[t]();
    if (!keys.has(q.question)) {
      keys.add(q.question);
      qs.push(q);
    }
  }
  return shuffle(qs).slice(0, TOTAL_QS);
}

// ═══════════════════════════════════════════════════════════════
//  RENDERING
// ═══════════════════════════════════════════════════════════════
const $ = id => document.getElementById(id);

let quiz = null, cur = 0, sel = {}, submitted = false, reviewing = false;

function render() {
  if (!quiz) return renderHero();
  if (submitted && !reviewing) return renderResult();
  if (submitted && reviewing) return renderReview();
  renderQuiz();
}

function renderHero() {
  $('app').innerHTML = `
<div class="hero">
  <div class="hero-badge">英</div>
  <h1>英文 Childhood & All Rise 模擬考</h1>
  <p>雙歌曲單元完整覆蓋，每次隨機 ${TOTAL_QS} 題</p>
  <div class="coverage">
    <b>Childhood 童年</b>：8 個核心單字（含 <span style="color:#e55">紅色</span>/<span style="color:#4af">藍色</span> 同義詞）、歌詞填空、片語<br>
    <b>All Rise 全體起立</b>：14 個法庭單字（含 <span style="color:#e55">紅色</span>/<span style="color:#4af">藍色</span> 同義詞）、歌詞填空、片語
  </div>
  <button class="btn-primary" onclick="startQuiz()">開始測驗</button>
</div>`;
}

function renderQuiz() {
  const app = $('app');
  const q = quiz[cur];
  const answered = Object.keys(sel).length;
  const letters = 'ABCD';

  const dotsHtml = quiz.map((_, i) => {
    let cls = 'dot';
    if (i === cur) cls += ' current';
    else if (sel[i] != null) cls += ' answered';
    return `<button class="${cls}" onclick="goTo(${i})">${i + 1}</button>`;
  }).join('');

  const optsHtml = q.options.map((o, oi) => {
    const isSel = sel[cur] === o;
    return `<button class="opt-btn${isSel ? ' selected' : ''}" onclick="selectOpt(${cur},'${o.replace(/'/g, "\\'")}')">
  <span class="opt-label">${letters[oi]}</span>${o}
</button>`;
  }).join('');

  const prevDisabled = cur === 0 ? "disabled style='opacity:.3'" : '';
  const nextBtn =
    cur < TOTAL_QS - 1
      ? `<button class="btn-secondary" onclick="goTo(${cur + 1})">下一題 →</button>`
      : answered < TOTAL_QS
        ? `<button class="btn-primary" style="opacity:.45;cursor:not-allowed" disabled>還有 ${TOTAL_QS - answered} 題未答</button>`
        : `<button class="btn-primary" onclick="submitQuiz()">提交答案</button>`;

  app.innerHTML = `
<div class="progress-wrap">
  <div class="progress-bar"><div class="progress-fill" style="width:${(answered / TOTAL_QS) * 100}%"></div></div>
  <div class="progress-label">${answered}/${TOTAL_QS} 已作答</div>
</div>
<div class="dots">${dotsHtml}</div>
<div class="card">
  <div class="card-head">
    <span class="q-num">Q${cur + 1}</span>
    <span class="q-tag">${TYPE_LABELS[q.type] || q.type}</span>
  </div>
  <p class="q-text">${q.question}</p>
  <div class="options">${optsHtml}</div>
</div>
<div class="nav">
  <button class="btn-secondary" onclick="goTo(${cur - 1})" ${prevDisabled}>← 上一題</button>
  ${nextBtn}
</div>`;
}

function renderResult() {
  const app = $('app');
  const score = quiz.filter((_, i) => sel[i] === quiz[i].answer).length;
  const pct = Math.round((score / TOTAL_QS) * 100);
  const grade = pct >= 90 ? 'A' : pct >= 80 ? 'B' : pct >= 70 ? 'C' : pct >= 60 ? 'D' : 'F';
  const emoji = pct >= 90 ? '🎉' : pct >= 70 ? '👍' : pct >= 50 ? '📖' : '💪';
  const barColor = pct >= 70 ? 'var(--green)' : pct >= 50 ? 'var(--amber)' : 'var(--red)';
  app.innerHTML = `
<div class="result">
  <div class="result-emoji">${emoji}</div>
  <div class="result-grade">${grade}</div>
  <div class="result-score">${score} / ${TOTAL_QS}</div>
  <div class="result-pct">${pct}%</div>
  <div class="result-bar"><div class="result-bar-fill" style="width:${pct}%;background:${barColor}"></div></div>
  <div class="result-btns">
    <button class="btn-secondary" onclick="showReview()">查看詳解</button>
    <button class="btn-primary" onclick="startQuiz()">再考一次</button>
  </div>
</div>`;
}

function renderReview() {
  const app = $('app');
  const score = quiz.filter((_, i) => sel[i] === quiz[i].answer).length;
  const items = quiz.map((q, i) => {
    const ok = sel[i] === q.answer;
    return `<div class="r-item${ok ? '' : ' wrong'}">
  <div class="r-meta">
    <span class="r-num">Q${i + 1}</span>
    <span class="r-tag ${ok ? 'ok' : 'ng'}">${ok ? '✓ 正確' : '✗ 錯誤'}</span>
    <span class="r-type">${TYPE_LABELS[q.type] || q.type}</span>
  </div>
  <p class="r-q">${q.question}</p>
  ${!ok && sel[i] ? `<p class="r-wrong">你的答案：${sel[i]}</p>` : ''}
  <p class="r-ans">正確答案：${q.answer}</p>
  <p class="r-expl">${q.explanation}</p>
</div>`;
  }).join('');

  app.innerHTML = `
<div class="review-head">
  <h2>答題詳解</h2>
  <span>${score} / ${TOTAL_QS}</span>
</div>
<div class="review-list">${items}</div>
<div style="text-align:center;padding:4px 0 20px">
  <button class="btn-primary" onclick="startQuiz()">再考一次</button>
</div>`;
}

// ═══════════════════════════════════════════════════════════════
//  ACTIONS
// ═══════════════════════════════════════════════════════════════
window.startQuiz = () => {
  quiz = generateQuiz();
  cur = 0; sel = {}; submitted = false; reviewing = false;
  render();
  window.scrollTo(0, 0);
};
window.goTo = i => {
  if (i >= 0 && i < TOTAL_QS) { cur = i; render(); window.scrollTo(0, 0); }
};
window.selectOpt = (qi, val) => { sel[qi] = val; render(); };
window.submitQuiz = () => { submitted = true; reviewing = false; render(); window.scrollTo(0, 0); };
window.showReview = () => { reviewing = true; render(); window.scrollTo(0, 0); };

// ═══════════════════════════════════════════════════════════════
//  INIT
// ═══════════════════════════════════════════════════════════════
loadData().then(() => render());
