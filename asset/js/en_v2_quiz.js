// ═══════════════════════════════════════════════════════════════
//  DATA
// ═══════════════════════════════════════════════════════════════
let CORE = [];
let SPORTS = [];
let OLYMPIC = [];
let CHILD_CORE = [];
let CHILD_LYRICS = [];
let CHILD_FILLS = [];
let ALLRISE_CORE = [];
let ALLRISE_FILLS = [];

// flattened pools built after load
let allCoreSyns = [], allFormSyns = [], allForms = [], allCoreWords = [];
let allChildSyns = [], allChildForms = [], allChildFormSyns = [];
let allArSyns = [], allArForms = [], allArFormSyns = [], allArWords = [];

const TOTAL_QS = 33;

async function loadData() {
  const resp = await fetch('../../asset/data/en_v2_words.json');
  const data = await resp.json();
  CORE         = data.core;
  SPORTS       = data.sports;
  OLYMPIC      = data.olympic;
  CHILD_CORE   = data.child_core;
  CHILD_LYRICS = data.child_lyrics;
  CHILD_FILLS  = data.child_fills;
  ALLRISE_CORE = data.allrise_core;
  ALLRISE_FILLS = data.allrise_fills;

  allCoreSyns   = CORE.flatMap(c => c.syns || []);
  allFormSyns   = CORE.flatMap(c => (c.forms || []).flatMap(f => f.syns || [])).filter(Boolean);
  allForms      = CORE.flatMap(c => (c.forms || []).map(f => f.f));
  allCoreWords  = CORE.map(c => c.w);

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
  // Unit 5
  syn: '同義詞', rsyn: '反向同義詞', zh2en: '中翻英', en2zh: '英翻中',
  fill: '填空', wform: '詞性變化', phrase: '片語', sdef: '運動定義',
  szh: '運動翻譯', sen2zh: '運動英翻中', celsyn: 'celebrated同義詞',
  pridesyn: 'pride同義詞', defn: '定義配對', fsyn: '詞形同義詞',
  notsyn: '反向選擇', sformq: '衍生詞配對', passage: '閱讀測驗',
  olvoc: '奧運單字', oldef: '奧運定義',
  // Childhood
  c_syn: 'Childhood同義詞', c_rsyn: 'Childhood反向同義詞',
  c_en2zh: 'Childhood英翻中', c_zh2en: 'Childhood中翻英',
  c_wform: 'Childhood詞性', c_fsyn: 'Childhood衍生同義詞',
  c_fill: 'Childhood歌詞填空', c_phrase: 'Childhood片語',
  // All Rise
  ar_syn: 'AllRise同義詞', ar_rsyn: 'AllRise反向同義詞',
  ar_en2zh: 'AllRise英翻中', ar_zh2en: 'AllRise中翻英',
  ar_wform: 'AllRise詞性', ar_fsyn: 'AllRise衍生同義詞',
  ar_fill: 'AllRise歌詞填空', ar_phrase: 'AllRise片語',
};

// ═══════════════════════════════════════════════════════════════
//  QUESTION GENERATORS — Unit 5
// ═══════════════════════════════════════════════════════════════
const G = {};

G.syn = () => {
  const c = pick(CORE.filter(x => x.syns.length > 0));
  const ans = pick(c.syns);
  const dist = pickOthers(ans, [...allCoreSyns, ...allFormSyns], 3);
  return {
    type: 'syn',
    question: `下列哪個是 "${c.w}"（${c.zh}）的同義詞？`,
    options: shuffle([ans, ...dist]),
    answer: ans,
    explanation: `${c.w} 的同義詞：${c.syns.join(', ')}`,
  };
};

G.rsyn = () => {
  const c = pick(CORE.filter(x => x.syns.length > 0));
  const syn = pick(c.syns);
  const others = pick(CORE.filter(x => x.w !== c.w), 3).map(x => x.w);
  return {
    type: 'rsyn',
    question: `"${syn}" 是下列哪個單字的同義詞？`,
    options: shuffle([c.w, ...others]),
    answer: c.w,
    explanation: `${syn} 是 ${c.w}（${c.zh}）的同義詞`,
  };
};

G.zh2en = () => {
  const c = pick(CORE);
  const others = pick(CORE.filter(x => x.w !== c.w), 3).map(x => x.w);
  return {
    type: 'zh2en',
    question: `「${c.zh}」的英文是？`,
    options: shuffle([c.w, ...others]),
    answer: c.w,
    explanation: `${c.zh} → ${c.w}`,
  };
};

G.en2zh = () => {
  const c = pick(CORE);
  const others = pick(CORE.filter(x => x.zh !== c.zh), 3).map(x => x.zh);
  return {
    type: 'en2zh',
    question: `"${c.w}" 的中文意思是？`,
    options: shuffle([c.zh, ...others]),
    answer: c.zh,
    explanation: `${c.w} → ${c.zh}`,
  };
};

G.fill = () => {
  const pool = CORE.filter(x => x.sent);
  const c = pick(pool);
  const others = pick(pool.filter(x => x.sent.ans !== c.sent.ans), 3).map(x => x.sent.ans);
  return {
    type: 'fill',
    question: `填入最適當的單字：\n"${c.sent.text}"`,
    options: shuffle([c.sent.ans, ...others]),
    answer: c.sent.ans,
    explanation: `正確答案：${c.sent.ans}（源自 ${c.w}，${c.zh}）`,
  };
};

G.wform = () => {
  const pool = CORE.filter(x => x.forms && x.forms.length > 0);
  const c = pick(pool);
  const f = pick(c.forms);
  const dist = pickOthers(f.f, allForms, 3);
  return {
    type: 'wform',
    question: `"${c.w}"（${c.zh}）的${posLabel(f.pos)}形式是？`,
    options: shuffle([f.f, ...dist]),
    answer: f.f,
    explanation: `${c.w} → ${f.f}（${f.pos}）`,
  };
};

G.phrase = () => {
  const pool = CORE.filter(x => x.phrase);
  const c = pick(pool);
  return {
    type: 'phrase',
    question: `片語 "${c.phrase.k}" 的意思是？`,
    options: shuffle([c.phrase.means, ...c.phrase.wrongMeans]),
    answer: c.phrase.means,
    explanation: `${c.phrase.k} = ${c.phrase.means}`,
  };
};

G.sdef = () => {
  const s = pick(SPORTS);
  const others = pick(SPORTS.filter(x => x.w !== s.w), 3).map(x => x.w);
  return {
    type: 'sdef',
    question: `哪個運動的定義是：\n"${s.def}"？`,
    options: shuffle([s.w, ...others]),
    answer: s.w,
    explanation: `${s.w}（${s.zh}）`,
  };
};

G.szh = () => {
  const s = pick(SPORTS);
  const others = pick(SPORTS.filter(x => x.w !== s.w), 3).map(x => x.w);
  return {
    type: 'szh',
    question: `「${s.zh}」的英文是？`,
    options: shuffle([s.w, ...others]),
    answer: s.w,
    explanation: `${s.zh} → ${s.w}`,
  };
};

G.sen2zh = () => {
  const s = pick(SPORTS);
  const others = pick(SPORTS.filter(x => x.zh !== s.zh), 3).map(x => x.zh);
  return {
    type: 'sen2zh',
    question: `"${s.w}" 的中文意思是？`,
    options: shuffle([s.zh, ...others]),
    answer: s.zh,
    explanation: `${s.w} → ${s.zh}`,
  };
};

G.celsyn = () => {
  const syns = ['distinguished', 'outstanding', 'prominent', 'eminent', 'remarkable', 'important', 'well-known'];
  const ans = pick(syns);
  const wrongPool = ['cunning', 'ancient', 'evident', 'competitive', 'painful', 'elementary', 'crafty', 'archaic'];
  const dist = pick(wrongPool, 3);
  return {
    type: 'celsyn',
    question: `"celebrated"（著名的）的同義詞是？`,
    options: shuffle([ans, ...dist]),
    answer: ans,
    explanation: `celebrated 的同義詞：${syns.join(', ')}`,
  };
};

G.pridesyn = () => {
  const syns = ['hubris', 'arrogance', 'insolence', 'scorn', 'disdain', 'contempt'];
  const ans = pick(syns);
  const wrongPool = ['fulfillment', 'accomplishment', 'participation', 'representation', 'convention', 'substitution'];
  const dist = pick(wrongPool, 3);
  return {
    type: 'pridesyn',
    question: `"pride"（傲慢；自尊）的同義詞是？`,
    options: shuffle([ans, ...dist]),
    answer: ans,
    explanation: `pride 的同義詞：${syns.join(', ')}`,
  };
};

G.defn = () => {
  const pool = [
    { w: 'tradition', def: 'a custom or belief handed down from generation to generation' },
    { w: 'ancient', def: 'belonging to the very distant past' },
    ...SPORTS,
  ];
  const c = pick(pool);
  const others = pick(pool.filter(x => x.w !== c.w), 3).map(x => x.w);
  return {
    type: 'defn',
    question: `下列哪個字的定義是：\n"${c.def}"？`,
    options: shuffle([c.w, ...others]),
    answer: c.w,
    explanation: `${c.w}：${c.def}`,
  };
};

G.fsyn = () => {
  const pool = CORE.filter(c => c.forms?.some(f => f.syns?.length > 0));
  const c = pick(pool);
  const f = pick(c.forms.filter(f => f.syns?.length > 0));
  const ans = pick(f.syns);
  const allFS = pool.flatMap(c2 => c2.forms.flatMap(ff => ff.syns || [])).filter(Boolean);
  const dist = pickOthers(ans, allFS, 3);
  return {
    type: 'fsyn',
    question: `"${f.f}" 的同義詞是？`,
    options: shuffle([ans, ...dist]),
    answer: ans,
    explanation: `${f.f}（${c.w} 的${posLabel(f.pos)}形式）同義詞：${f.syns.join(', ')}`,
  };
};

G.notsyn = () => {
  const c = pick(CORE.filter(x => x.syns.length >= 3));
  const realSyns = pick(c.syns, 3);
  const otherSyns = CORE.filter(x => x.w !== c.w).flatMap(x => x.syns).filter(s => !c.syns.includes(s));
  const wrong = pick(otherSyns);
  return {
    type: 'notsyn',
    question: `下列哪個「不是」"${c.w}"（${c.zh}）的同義詞？`,
    options: shuffle([...realSyns, wrong]),
    answer: wrong,
    explanation: `${c.w} 的同義詞是：${c.syns.join(', ')}。${wrong} 不是其中之一。`,
  };
};

G.sformq = () => {
  const pool = CORE.filter(x => x.forms && x.forms.length > 0);
  const c = pick(pool);
  const f = pick(c.forms);
  const others = pick(pool.filter(x => x.w !== c.w), 3).map(x => x.w);
  return {
    type: 'sformq',
    question: `"${f.f}"（${posLabel(f.pos)}）是哪個單字的衍生詞？`,
    options: shuffle([c.w, ...others]),
    answer: c.w,
    explanation: `${f.f} 是 ${c.w}（${c.zh}）的${posLabel(f.pos)}形式`,
  };
};

// ── Olympic Passage ──────────────────────────────────────────
const PASSAGE_QS = [
  { type: 'passage', question: '根據文章，古代奧運會的目的是什麼？\nAccording to the passage, what was the purpose of the ancient Olympic Games?', options: ['To honor the Greek god Zeus', 'To celebrate military victories', 'To promote trade among cities', 'To unite all nations'], answer: 'To honor the Greek god Zeus', explanation: '文章：The purpose of the ancient games was to honor the Greek god Zeus.' },
  { type: 'passage', question: '古代奧運會只允許哪些人參加？\nWho was allowed to take part in the ancient Olympic Games?', options: ['Only Greek males', 'All Greek citizens', 'Only Greek females', 'Athletes from all countries'], answer: 'Only Greek males', explanation: '文章：only Greek males could take part in the games.' },
  { type: 'passage', question: '古代奧運最初只有哪個運動項目？\nWhat was the only sports event at the beginning of the ancient Olympic Games?', options: ['Running', 'Boxing', 'Horse racing', 'Soccer'], answer: 'Running', explanation: '文章：In the beginning, running was the only sports event.' },
  { type: 'passage', question: '古代奧運為何走向終點？\nWhy did the ancient Olympic Games come to an end?', options: ['With the fall of the Greek Empire', 'Due to a great war', 'Because athletes refused to compete', 'The games became too expensive'], answer: 'With the fall of the Greek Empire', explanation: '文章：the ancient games came to an end with the fall of the Greek Empire.' },
  { type: 'passage', question: '奧運中加入的第一個團隊項目是什麼？\nWhat was the first team game added to the Olympics?', options: ['A soccer match', 'A relay race', 'A swimming relay', 'A rowing race'], answer: 'A soccer match', explanation: '文章：The first team game added was a soccer match, introduced in 1900.' },
  { type: 'passage', question: '足球在哪一年被加入奧運會？\nIn what year was soccer introduced to the Olympics?', options: ['1900', '1896', '1908', '1912'], answer: '1900', explanation: '文章：a soccer match was introduced in 1900.' },
  { type: 'passage', question: '運動員在哪一年開始代表自己的國家參賽？\nIn what year did athletes begin representing their own countries?', options: ['1908', '1900', '1896', '1912'], answer: '1908', explanation: '文章：in 1908, individual and team competitors began representing their own countries.' },
  { type: 'passage', question: '1908 年運動員驕傲地走進哪個城市的體育場，身後舉著什麼？\nIn 1908, athletes walked proudly into the stadium in which city, behind what?', options: ['London, national flags', 'Paris, national flags', 'Athens, torches', 'Berlin, flowers'], answer: 'London, national flags', explanation: '文章：athletes walked proudly into the stadium in London behind their national flags.' },
  { type: 'passage', question: '奧運會多久舉辦一次？\nHow often are the Olympic Games held?', options: ['Every four years', 'Every year', 'Every two years', 'Every three years'], answer: 'Every four years', explanation: '文章：Every four years, sports fans tune in to see if more Olympic firsts can be achieved.' },
  { type: 'passage', question: '文章中 "tune in" 的意思最接近下列哪個？\nWhat does "tune in" mean as used in the passage?', options: ['Watch or listen to a broadcast', 'Adjust a musical instrument', 'Participate in sports events', 'Travel to a new country'], answer: 'Watch or listen to a broadcast', explanation: '"tune in" 意指收看或收聽（轉播節目）。' },
  { type: 'passage', question: '史上第一次有記載的奧運大約在何時舉行？\nApproximately when were the first recorded Olympic Games held?', options: ['776 BC', '476 BC', '1000 BC', '500 AD'], answer: '776 BC', explanation: '文章首句：The first recorded Olympic Games were held around 776 BC.' },
  { type: 'passage', question: '文章說古代奧運是為了慶祝什麼而舉辦？\nAccording to the passage, what were the ancient games meant to celebrate?', options: ['Individual greatness', 'Team spirit', 'National pride', 'Religious ceremonies'], answer: 'Individual greatness', explanation: '文章：The ancient games were meant to celebrate individual greatness.' },
];

G.passage = () => {
  const q = pick(PASSAGE_QS);
  return { type: 'passage', question: q.question, options: shuffle([...q.options]), answer: q.answer, explanation: q.explanation };
};

G.olvoc = () => {
  const c = pick(OLYMPIC);
  if (Math.random() < 0.5) {
    const others = pick(OLYMPIC.filter(x => x.w !== c.w), 3).map(x => x.w);
    return { type: 'olvoc', question: `「${c.zh}」的英文是？`, options: shuffle([c.w, ...others]), answer: c.w, explanation: `${c.zh} → ${c.w}` };
  } else {
    const others = pick(OLYMPIC.filter(x => x.zh !== c.zh), 3).map(x => x.zh);
    return { type: 'olvoc', question: `"${c.w}" 的中文意思是？`, options: shuffle([c.zh, ...others]), answer: c.zh, explanation: `${c.w} → ${c.zh}` };
  }
};

G.oldef = () => {
  const pool = OLYMPIC.filter(x => x.def);
  const c = pick(pool);
  const others = pick(pool.filter(x => x.w !== c.w), 3).map(x => x.w);
  return { type: 'oldef', question: `下列哪個字或片語的定義是：\n"${c.def}"？`, options: shuffle([c.w, ...others]), answer: c.w, explanation: `${c.w}（${c.zh}）：${c.def}` };
};

// ═══════════════════════════════════════════════════════════════
//  QUESTION GENERATORS — Childhood
// ═══════════════════════════════════════════════════════════════

G.c_syn = () => {
  const pool = CHILD_CORE.filter(c => (c.syns || []).length > 0);
  const c = pick(pool);
  const ans = pick(c.syns);
  const distPool = [...allChildSyns, ...allChildFormSyns, ...allCoreSyns];
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
  const distPool = [...allChildForms, ...allForms];
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
  const distPool = [...allChildFormSyns, ...allFormSyns];
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
  const distPool = [...allArSyns, ...allArFormSyns, ...allCoreSyns];
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
  const distPool = [...allArForms, ...allForms, ...allChildForms];
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
  const distPool = [...allArFormSyns, ...allFormSyns, ...allChildFormSyns];
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
  ...Array(3).fill('syn'),  ...Array(2).fill('rsyn'),
  ...Array(2).fill('zh2en'), ...Array(2).fill('en2zh'),
  ...Array(2).fill('fill'), ...Array(2).fill('wform'),
  ...Array(1).fill('phrase'),
  ...Array(2).fill('sdef'), ...Array(1).fill('szh'), ...Array(1).fill('sen2zh'),
  ...Array(1).fill('celsyn'), ...Array(1).fill('pridesyn'),
  ...Array(1).fill('defn'), ...Array(2).fill('fsyn'),
  ...Array(1).fill('notsyn'), ...Array(1).fill('sformq'),
  ...Array(2).fill('c_syn'), ...Array(1).fill('c_rsyn'),
  ...Array(2).fill('c_en2zh'), ...Array(1).fill('c_zh2en'),
  ...Array(1).fill('c_wform'), ...Array(1).fill('c_fsyn'),
  ...Array(2).fill('c_fill'), ...Array(1).fill('c_phrase'),
  ...Array(2).fill('ar_syn'), ...Array(1).fill('ar_rsyn'),
  ...Array(2).fill('ar_en2zh'), ...Array(1).fill('ar_zh2en'),
  ...Array(1).fill('ar_wform'), ...Array(1).fill('ar_fsyn'),
  ...Array(2).fill('ar_fill'), ...Array(1).fill('ar_phrase'),
  ...Array(3).fill('passage'), ...Array(2).fill('olvoc'), ...Array(1).fill('oldef'),
];

function generateQuiz() {
  const qs = [];
  const keys = new Set();

  const mandatory = [
    // Unit5
    'syn', 'rsyn', 'fill', 'wform', 'phrase',
    'sdef', 'szh', 'sen2zh',
    'defn', 'fsyn', 'notsyn', 'sformq',
    'celsyn', 'pridesyn', 'zh2en', 'en2zh',
    // Childhood
    'c_syn', 'c_rsyn', 'c_en2zh', 'c_zh2en',
    'c_wform', 'c_fsyn', 'c_fill', 'c_phrase',
    // All Rise
    'ar_syn', 'ar_rsyn', 'ar_en2zh', 'ar_zh2en',
    'ar_wform', 'ar_fsyn', 'ar_fill', 'ar_phrase',
    // Passage
    'passage',
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
  <h1>English V2 模擬考</h1>
  <p>全面覆蓋三個單元，每次隨機 ${TOTAL_QS} 題</p>
  <div class="coverage">
    <b>Unit 5 核心單字</b>：14 個單字、同義詞、詞性、片語、例句填空<br>
    <b>Unit 5 定義</b>：tradition、ancient 及 6 個運動單字（sailing ~ gymnastics）<br>
    <b>特殊同義詞群</b>：celebrated（7 個）、pride（6 個）<br>
    <b>奧運短文閱讀</b>：12 題理解測驗 + 8 個奧運生詞<br>
    <b>Childhood 童年</b>：8 個核心單字（含 <span style="color:#e55">紅色</span>/<span style="color:#4af">藍色</span> 同義詞）、歌詞填空<br>
    <b>All Rise 全體起立</b>：14 個法庭單字（含 <span style="color:#e55">紅色</span>/<span style="color:#4af">藍色</span> 同義詞）、歌詞填空
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
