// ═══════════════════════════════════════════════════════════════
//  大一下 奧運課文 模擬考
//  來源：Notion「大一下/奧運課文」
//  涵蓋 §2 Ancient Olympics / §4 Team Competitions / §6 Conclusion
// ═══════════════════════════════════════════════════════════════

// ── DATA ────────────────────────────────────────────────────────
const VOCAB = [
  { w: 'recorded',       zh: '有記錄的',         syns: ['documented', 'noted', 'historical', 'written'] },
  { w: 'honor',          zh: '敬拜；尊崇',        syns: ['respect', 'revere', 'glorify', 'worship'] },
  { w: 'individual',     zh: '個人的',            syns: ['personal', 'single', 'separate', 'sole'] },
  { w: 'greatness',      zh: '偉大；卓越能力',    syns: ['excellence', 'brilliance', 'magnificence', 'distinction'] },
  { w: 'thus',           zh: '因此',              syns: ['therefore', 'hence', 'consequently', 'as a result'] },
  { w: 'introduced',     zh: '引進；加入',         syns: ['brought in', 'launched', 'added', 'established'] },
  { w: 'representing',   zh: '代表',              syns: ['standing for', 'acting for', 'speaking for', 'symbolizing'] },
  { w: 'stadium',        zh: '體育場；運動場',     syns: ['arena', 'ground', 'venue', 'colosseum'] },
  { w: 'tune in',        zh: '收看；收聽',         syns: ['watch', 'listen to', 'follow', 'turn on'] },
  { w: 'achieved',       zh: '達成；實現',         syns: ['accomplished', 'attained', 'fulfilled', 'reached'] },
  { w: 'tradition',      zh: '傳統',              syns: ['convention', 'custom', 'practice', 'heritage'] },
  { w: 'lives on',       zh: '延續下去',           syns: ['continues', 'persists', 'endures', 'survives'] },
  { w: 'take part in',   zh: '參加；參與',         syns: ['participate in', 'join in', 'engage in', 'be involved in'] },
  { w: 'came to an end', zh: '結束；終止',         syns: ['finished', 'concluded', 'terminated', 'stopped'] },
  { w: 'came along',     zh: '出現；興起',         syns: ['appeared', 'emerged', 'arose', 'developed'] },
  { w: 'in addition',    zh: '此外；另外',         syns: ['besides', 'moreover', 'furthermore', 'also'] },
  { w: 'national',       zh: '國家的；民族的',     syns: ['public', 'state', 'governmental', 'patriotic'] },
  { w: 'ancient',        zh: '古代的；古老的',     syns: ['old', 'archaic', 'historic', 'classical'] },
];

const allSyns = VOCAB.flatMap(v => v.syns);

const PHRASES = [
  {
    k: 'take part in',
    means: '參加；參與 (to participate in)',
    wrongMeans: ['在旁觀看 (to watch from the sidelines)', '組織活動 (to organize an event)', '拒絕加入 (to refuse to join)'],
  },
  {
    k: 'came to an end',
    means: '結束；終止 (to stop happening or finish)',
    wrongMeans: ['重新開始 (to start again)', '達到新高點 (to reach a new high)', '繼續進行 (to continue as usual)'],
  },
  {
    k: 'the fall of',
    means: '…的衰落；崩潰 (the decline or collapse of)',
    wrongMeans: ['…的興起 (the rise of)', '…的慶祝 (the celebration of)', '…的開始 (the beginning of)'],
  },
  {
    k: 'be meant to',
    means: '目的是…；本意是為了… (to be intended to)',
    wrongMeans: ['偶然發生 (to happen by accident)', '被禁止 (to be forbidden)', '已完成 (to be completed)'],
  },
  {
    k: 'in addition',
    means: '此外；另外 (besides; furthermore)',
    wrongMeans: ['因此；結果 (as a result; therefore)', '相反地；然而 (in contrast; however)', '總的來說 (in summary)'],
  },
  {
    k: 'tune in',
    means: '收看；收聽（廣播或節目）(to watch or listen to a broadcast)',
    wrongMeans: ['大聲播放音樂 (to play music loudly)', '參加比賽 (to participate in a competition)', '前往活動現場 (to travel to an event)'],
  },
  {
    k: 'live on',
    means: '繼續存在；延續下去 (to continue to exist)',
    wrongMeans: ['突然終止 (to end suddenly)', '隨時間被遺忘 (to be forgotten over time)', '快速成長 (to grow rapidly)'],
  },
  {
    k: 'such as',
    means: '例如；像是 (for example; like)',
    wrongMeans: ['因此；結果 (as a result)', '與…相反 (in contrast to)', '儘管 (in spite of)'],
  },
];

const FILLS = [
  { text: 'The first ___ Olympic Games were held around 776 BC in Olympia, Greece.', ans: 'recorded', distract: ['ancient', 'modern', 'official'] },
  { text: 'The purpose of the ancient games was to ___ the Greek god Zeus.', ans: 'honor', distract: ['replace', 'challenge', 'represent'] },
  { text: 'In the beginning, running was the ___ sports event.', ans: 'only', distract: ['first', 'main', 'popular'] },
  { text: 'Later, more games were included, such as boxing and horse ___.', ans: 'racing', distract: ['running', 'jumping', 'fighting'] },
  { text: 'Only Greek ___ could take part in the games.', ans: 'males', distract: ['women', 'athletes', 'citizens'] },
  { text: 'The ancient games came to an end with the fall of the ___ Empire.', ans: 'Greek', distract: ['Roman', 'Persian', 'Olympic'] },
  { text: 'The ancient games were meant to celebrate individual ___.', ans: 'greatness', distract: ['courage', 'friendship', 'tradition'] },
  { text: '___, team competitions came along only much later.', ans: 'Thus', distract: ['However', 'Besides', 'Instead'] },
  { text: 'The first team game added was a soccer match, which was introduced in ___.', ans: '1900', distract: ['1896', '1908', '1912'] },
  { text: 'In ___, a swimming pool was used for the first time.', ans: 'addition', distract: ['contrast', 'summary', 'particular'] },
  { text: 'Every four years, sports fans ___ to see if more Olympic "firsts" can be achieved.', ans: 'tune in', distract: ['show up', 'cheer on', 'sign up'] },
  { text: 'The Olympic tradition ___, and it continues to give us much fun.', ans: 'lives on', distract: ['moves on', 'fades out', 'gives up'] },
  { text: 'Athletes walked proudly into the ___ in London behind their national flags.', ans: 'stadium', distract: ['colosseum', 'building', 'park'] },
  { text: 'In 1908, individual and team competitors began ___ their own countries.', ans: 'representing', distract: ['joining', 'competing', 'organizing'] },
  { text: 'The first recorded Olympic Games were held ___ 776 BC.', ans: 'around', distract: ['before', 'after', 'since'] },
];

const PASSAGE_QS = [
  {
    question: '根據文章，古代奧運會的目的是什麼？',
    options: ['To honor the Greek god Zeus', 'To celebrate military victories', 'To promote trade among cities', 'To unite all nations'],
    answer: 'To honor the Greek god Zeus',
    explanation: '文章：The purpose of the ancient games was to honor the Greek god Zeus.',
  },
  {
    question: '古代奧運會只允許哪些人參加？',
    options: ['Only Greek males', 'All Greek citizens', 'Only Greek females', 'Athletes from all countries'],
    answer: 'Only Greek males',
    explanation: '文章：only Greek males could take part in the games.',
  },
  {
    question: '古代奧運最初只有哪個運動項目？',
    options: ['Running', 'Boxing', 'Horse racing', 'Soccer'],
    answer: 'Running',
    explanation: '文章：In the beginning, running was the only sports event.',
  },
  {
    question: '古代奧運為何走向終點？',
    options: ['With the fall of the Greek Empire', 'Due to a great war', 'Because athletes refused to compete', 'The games became too expensive'],
    answer: 'With the fall of the Greek Empire',
    explanation: '文章：the ancient games came to an end with the fall of the Greek Empire.',
  },
  {
    question: '奧運中加入的第一個團隊項目是什麼？',
    options: ['A soccer match', 'A relay race', 'A swimming relay', 'A rowing race'],
    answer: 'A soccer match',
    explanation: '文章：The first team game added was a soccer match, introduced in 1900.',
  },
  {
    question: '足球在哪一年被加入奧運會？',
    options: ['1900', '1896', '1908', '1912'],
    answer: '1900',
    explanation: '文章：a soccer match was introduced in 1900.',
  },
  {
    question: '運動員在哪一年開始代表自己的國家參賽？',
    options: ['1908', '1900', '1896', '1912'],
    answer: '1908',
    explanation: '文章：in 1908, individual and team competitors began representing their own countries.',
  },
  {
    question: '1908 年奧運在哪個城市舉行？',
    options: ['London', 'Paris', 'Athens', 'Berlin'],
    answer: 'London',
    explanation: '文章：athletes walked proudly into the stadium in London behind their national flags.',
  },
  {
    question: '奧運會多久舉辦一次？',
    options: ['Every four years', 'Every year', 'Every two years', 'Every three years'],
    answer: 'Every four years',
    explanation: '文章：Every four years, sports fans tune in...',
  },
  {
    question: '"tune in" 的意思最接近哪個？',
    options: ['Watch or listen to a broadcast', 'Adjust a musical instrument', 'Participate in sports events', 'Travel to a new country'],
    answer: 'Watch or listen to a broadcast',
    explanation: '"tune in" 意指收看或收聽（轉播節目）。',
  },
  {
    question: '史上第一次有記載的奧運大約在何時舉行？',
    options: ['776 BC', '476 BC', '1000 BC', '500 AD'],
    answer: '776 BC',
    explanation: '文章首句：The first recorded Olympic Games were held around 776 BC.',
  },
  {
    question: '文章說古代奧運是為了慶祝什麼而舉辦？',
    options: ['Individual greatness', 'Team spirit', 'National pride', 'Religious ceremonies'],
    answer: 'Individual greatness',
    explanation: '文章：The ancient games were meant to celebrate individual greatness.',
  },
  {
    question: '1908 年奧運出現了哪項新設施？',
    options: ['A swimming pool', 'A running track', 'A cycling velodrome', 'A shooting range'],
    answer: 'A swimming pool',
    explanation: '文章：In addition, a swimming pool was used for the first time (in 1908).',
  },
  {
    question: '根據文章，"The Olympic tradition lives on" 的最佳詮釋是？',
    options: ['The tradition continues to exist', 'The tradition has ended', 'The tradition is being replaced', 'The tradition is forgotten'],
    answer: 'The tradition continues to exist',
    explanation: '"live on" 意指延續下去、繼續存在。',
  },
  {
    question: '古代奧運以個人賽為主的原因是？',
    options: ['They were meant to celebrate individual greatness', 'Team sports had not been invented', 'The stadium was too small for teams', 'Rules forbade team events'],
    answer: 'They were meant to celebrate individual greatness',
    explanation: '文章：The ancient games were meant to celebrate individual greatness. Thus, team competitions came along only much later.',
  },
  {
    question: '1900 年加入奧運的足球賽，是哪種形式的比賽？',
    options: ['Clubs from different countries', 'National teams', 'City representative teams', 'Individual players'],
    answer: 'Clubs from different countries',
    explanation: '文章：These soccer matches were played between clubs from different countries.',
  },
];

const GRAMMAR_QS = [
  {
    question: '下列哪個片語與 "take part in" 意思最相近？',
    options: ['participate in', 'take care of', 'take place in', 'give up on'],
    answer: 'participate in',
    explanation: '"take part in" = participate in（參加；參與）',
  },
  {
    question: '"Thus, team competitions came along only much later." — "Thus" 在此句的作用是？',
    options: ['表示因果（showing cause and effect）', '表示轉折（showing contrast）', '表示時間（showing time）', '表示條件（showing condition）'],
    answer: '表示因果（showing cause and effect）',
    explanation: '"Thus" = Therefore，表因果關係，常放句首後加逗號。',
  },
  {
    question: '"In addition, a swimming pool was used for the first time." — "In addition" 最接近哪個連接詞？',
    options: ['Besides / Moreover', 'However / Nevertheless', 'Therefore / Thus', 'Although / Even though'],
    answer: 'Besides / Moreover',
    explanation: '"In addition" = Besides / Moreover，用於補充說明，放句首後加逗號。',
  },
  {
    question: '"The ancient games were meant to celebrate individual greatness." — "be meant to + V" 的意思是？',
    options: ['目的是…；本意是為了…', '被迫要做…', '恰好做到…', '避免做…'],
    answer: '目的是…；本意是為了…',
    explanation: '"be meant to V" = to be intended to V，表示目的或意圖。',
  },
  {
    question: '"athletes began representing their own countries" — "begin" 後的動詞形式可以是？',
    options: ['V-ing 或 to V，意思相同', '只能是 V-ing', '只能是 to V', '只能是原形動詞'],
    answer: 'V-ing 或 to V，意思相同',
    explanation: '"begin" 後可接 to V 或 V-ing，兩者意思相同，均正確。',
  },
  {
    question: '"more games were included, such as boxing and horse racing" — "such as" 的語法作用是？',
    options: ['列舉例子（giving examples）', '表示對比（showing contrast）', '表示結果（showing result）', '表示讓步（showing concession）'],
    answer: '列舉例子（giving examples）',
    explanation: '"such as" = like / for example，用於列舉具體例子，後接名詞（或名詞片語）。',
  },
  {
    question: '"come to an end" 最接近哪個說法？',
    options: ['finish / conclude', 'start / begin', 'grow / expand', 'change / transform'],
    answer: 'finish / conclude',
    explanation: '"come to an end" = finish / conclude / terminate，表示結束、終止。',
  },
];

// ═══════════════════════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════════════════════
const TOTAL_QS = 40;

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

const TYPE_LABELS = {
  voc_en2zh: '英翻中',
  voc_zh2en: '中翻英',
  voc_syn:   '同義詞',
  phrase:    '片語辨義',
  fill:      '句子填空',
  passage:   '閱讀測驗',
  grammar:   '文法選擇',
};

// ═══════════════════════════════════════════════════════════════
//  QUESTION GENERATORS
// ═══════════════════════════════════════════════════════════════
const G = {};

G.voc_en2zh = () => {
  const c = pick(VOCAB);
  const others = pick(VOCAB.filter(x => x.zh !== c.zh), 3).map(x => x.zh);
  return {
    type: 'voc_en2zh',
    question: `"${c.w}" 的中文意思是？`,
    options: shuffle([c.zh, ...others]),
    answer: c.zh,
    explanation: `${c.w} → ${c.zh}`,
  };
};

G.voc_zh2en = () => {
  const c = pick(VOCAB);
  const others = pick(VOCAB.filter(x => x.w !== c.w), 3).map(x => x.w);
  return {
    type: 'voc_zh2en',
    question: `「${c.zh}」的英文是？`,
    options: shuffle([c.w, ...others]),
    answer: c.w,
    explanation: `${c.zh} → ${c.w}`,
  };
};

G.voc_syn = () => {
  const c = pick(VOCAB);
  const ans = pick(c.syns);
  const dist = pickOthers(ans, allSyns, 3);
  return {
    type: 'voc_syn',
    question: `下列哪個是 "${c.w}"（${c.zh}）的同義詞？`,
    options: shuffle([ans, ...dist]),
    answer: ans,
    explanation: `${c.w} 的同義詞：${c.syns.join(', ')}`,
  };
};

G.phrase = () => {
  const p = pick(PHRASES);
  return {
    type: 'phrase',
    question: `片語 "${p.k}" 的意思是？`,
    options: shuffle([p.means, ...p.wrongMeans]),
    answer: p.means,
    explanation: `${p.k} = ${p.means}`,
  };
};

G.fill = () => {
  const f = pick(FILLS);
  return {
    type: 'fill',
    question: `填入最適當的單字或片語：\n"${f.text}"`,
    options: shuffle([f.ans, ...f.distract]),
    answer: f.ans,
    explanation: `正確答案：${f.ans}`,
  };
};

G.passage = () => {
  const q = pick(PASSAGE_QS);
  return {
    type: 'passage',
    question: q.question,
    options: shuffle([...q.options]),
    answer: q.answer,
    explanation: q.explanation,
  };
};

G.grammar = () => {
  const q = pick(GRAMMAR_QS);
  return {
    type: 'grammar',
    question: q.question,
    options: shuffle([...q.options]),
    answer: q.answer,
    explanation: q.explanation,
  };
};

// ═══════════════════════════════════════════════════════════════
//  POOL & GENERATION
// ═══════════════════════════════════════════════════════════════
const POOL = [
  ...Array(8).fill('voc_en2zh'),
  ...Array(8).fill('voc_zh2en'),
  ...Array(7).fill('voc_syn'),
  ...Array(5).fill('phrase'),
  ...Array(8).fill('fill'),
  ...Array(8).fill('passage'),
  ...Array(6).fill('grammar'),
];

function generateQuiz() {
  const qs = [];
  const keys = new Set();

  // 確保每種題型至少出現一題
  const mandatory = ['voc_en2zh', 'voc_zh2en', 'voc_syn', 'phrase', 'fill', 'passage', 'grammar'];
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

  // 從 POOL 補滿至 TOTAL_QS 題
  let safety = 0;
  while (qs.length < TOTAL_QS && safety < 500) {
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
  <div class="hero-badge">奧</div>
  <h1>大一下 奧運課文 模擬考</h1>
  <p>全面覆蓋課文所有內容，每次隨機 ${TOTAL_QS} 題</p>
  <div class="coverage">
    <b>課文單字</b>：18 個關鍵字彙，英翻中、中翻英<br>
    <b>同義詞</b>：各單字對應的同義詞群（syns）<br>
    <b>重要片語</b>：8 個短語辨義（take part in、tune in 等）<br>
    <b>句子填空</b>：15 題課文關鍵句填空練習<br>
    <b>閱讀測驗</b>：16 題閱讀理解（含時間軸 776BC / 1900 / 1908）<br>
    <b>文法選擇</b>：7 題重點文法（thus、such as、be meant to 等）
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
render();
