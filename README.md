# University Testing System 大學模擬考

用來準備大學課程考試的線上模擬考網站。先選年級、再選科目，就能在瀏覽器上作答、對答案、看詳解。

純前端靜態網站（HTML + CSS + 原生 JavaScript），不需要框架、建置工具或後端；題庫以 JSON 存放，新增題目不用改程式。

## 科目

### 大一

| 科目 | 題庫 | 出題方式 |
|---|---|---|
| 管理資訊系統（MIS） | 第 1～8 章，共 315 題 | 單章隨機 20 題；期中考（1～8 章）隨機 50 題 |
| 英文（Unit5） | 核心單字、運動、奧運生詞、閱讀測驗 | 依題型自動出題，每次 50 題 |
| 英文（Childhood + All Rise） | 兩首歌曲的單字、同義詞、歌詞填空、片語 | 依題型自動出題，每次 50 題 |
| 英文（奧運） | 單字、片語、填空、閱讀、文法 | 依題型自動出題，每次 40 題 |

### 大二

| 科目 | 題庫 | 出題方式 |
|---|---|---|
| Web 程式設計(一) | 期中考選擇題 121 題（單選 103、複選 18） | 全部題目必考 |
| 資料庫（CH01 & 02） | 期中考問答題 7 題（第 5 題含 a～g 小題） | 寫完逐題對答案，不計分 |
| 無線區域及個人網路 | 第 2 章 49 題、第 2.1 章 34 題、第 3 章 53 題，共 136 題 | 分章或全部章節，題目全部必考 |

## 功能

- **MIS**：逐題作答，點選後立即顯示對錯；結束後列出答錯的題目。會記住上次選的章節。
- **英文**：可來回切換題目，全部答完後交卷，顯示等第（A～F）與每題詳解。
- **Web 程式設計(一)、無線區域及個人網路**
  - 所有題目列在同一頁，附答案卡（手機版由右下角按鈕開啟），點題號可跳到該題
  - 可隨時交卷，未作答的題目以答錯計分
  - 「作答後立即對答案」模式，適合邊做邊複習
  - 篩選：只看複選題、未作答、答錯的題目
  - 作答進度自動存在瀏覽器，重新整理不會消失
  - 支援深色模式
- **資料庫**：問答題，在每題下方寫答案，按「對答案」就在下方顯示參考答案；也可一次全部對答案。不計分，作答內容自動存在瀏覽器。

## 本機執行

頁面會用 `fetch` 讀取 JSON 題庫，直接雙擊 HTML 檔會被瀏覽器擋下，請在專案根目錄開一個本地伺服器：

```bash
python3 -m http.server
```

然後打開 <http://localhost:8000>。

## 目錄結構

```
index.html                 首頁：選擇年級 → 選擇科目（#y1 大一、#y2 大二、#y2-web／#y2-db／#y2-wlan 大二各科目的考試列表）
page/
  mis/mis_testing.html     大一 MIS 測驗
  enlish/                  大一英文測驗（3 份）
  y2/web1.html             大二 Web 程式設計(一)
  y2/db_mid0102.html       大二 資料庫 期中考（問答題）
  y2/wlan_*.html           大二 無線區域及個人網路（ch2、ch2_1、ch3、all）
asset/
  css/                     global（共用配色）、home、style（MIS）、en（英文）、web1、essay（問答題）
  js/                      題庫載入與各測驗邏輯（choice_quiz 選擇題全題測驗、essay_quiz 問答題）
  data/                    題庫 JSON（qa01～08、en_v2_words、web1、db_mid0102、wlan_ch2／ch2_1／ch3）
  files/                   MIS 題庫原始文字檔
data/                      Web 程式設計(一)、資料庫、無線網路的原始題目（Markdown）
list/                      MIS 第 9～16 章選擇題筆記
```

## 題庫格式

**MIS**（`asset/data/qa01.json`～`qa08.json`）：`correct` 是正確選項的索引（從 0 開始）。

```json
{ "q": "下列何者是資訊的特性重點？", "a": ["有用的", "原始的", "全部皆非", "未經整理"], "correct": 0 }
```

**選擇題全題測驗**（`web1.json`、`wlan_*.json`，由 `asset/js/choice_quiz.js` 顯示）：`key` 為答案字母，複選題寫多個字母；`alt` 是也算對的答案、`note` 是交卷後顯示的補充、`tip` 是題目旁的提示標籤、`topic` 是主題標籤。文字中用反引號包住的部分會顯示為程式碼。新增一份考試只要準備 JSON，並複製 `page/y2/web1.html`，改掉 `<script>` 上的 `data-src`（題庫路徑，可用逗號合併多個題庫）與 `data-store`（作答存檔名稱）。

```json
{ "q": "要定義常數 ABC，且其值為 10，應使用下列何種方式？",
  "opts": ["`ABC = 10;`", "`const ABC = 10;`", "`define('ABC',10);`", "`$ABC = 10;`"],
  "key": "C", "alt": "B", "note": "PHP 5.3 以後 B 也可以" }
```

**問答題**（`asset/data/db_mid0102.json`，由 `asset/js/essay_quiz.js` 顯示）：`answer` 為參考答案段落，`k` 是粗體標題；題目可附 `tables`（`pk` 為主鍵欄位，會加底線）；有 `sub` 時每個小題各自作答、各自對答案。

```json
{ "q": "解說 ODBC（Open Database Connectivity）作用", "score": 10, "ref": "Ch01 第 9 節",
  "answer": [{ "v": "是標準連結介面…" }] }
```

新增一份問答題考試只要準備 JSON，並複製 `page/y2/db_mid0102.html`，改掉 `<script>` 上的 `data-src`（題庫路徑）與 `data-store`（作答存檔名稱）。

## 新增科目

1. 把題庫放進 `asset/data/`，測驗頁放進 `page/`（大二放在 `page/y2/`）。
2. 在 `index.html` 對應的區塊加入一張 `.card` 連到新頁面：大一放在 `#view-y1`；大二是「科目 → 考試」兩層，新的章節考題加在該科目的列表（`#view-y2-web`、`#view-y2-db`、`#view-y2-wlan`）。
3. 測驗頁的返回連結指向所屬的列表，例如 `../../index.html#y2-db`。
4. 大二要新增科目時，在 `#view-y2` 加一張連到 `#y2-xxx` 的卡片，新增一個 `view-y2-xxx` 區塊，並在 `index.html` 底部的 `views` 加上這個 hash。

## 部署

推送到 `master` 分支後，GitHub Actions 會自動部署到 Azure Static Web Apps（設定檔在 `.github/workflows/`）。
