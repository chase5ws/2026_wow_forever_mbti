# 永恆服MBTI選角測試

用 MBTI 四個維度，透過 20 道艾澤拉斯經典劇情情境題，找出最適合你的《魔獸世界：永恆》種族與職業。

## 特色

- **20 題情境題**：EI / SN / TF / JP 各 5 題，每題 4 個選項（強烈 2 分、稍微 1 分），依加權計算百分比
- **種族、職業分開計算**：9 種族（含天裔精靈）、9 職業各有一組四維性向輪廓，算出契合度排行，再從永恆服可選的 52 種組合中挑出最佳選角
- **MBTI 傾向**：顯示每個維度的強度，接近各半時會標出「也有 XXXX 的影子」
- **結果說明**：為什麼是這個種族、這個職業，以及第一名種族/職業不能搭配時的原因
- **分享**：一鍵產生 1080×1440 的 JPG 結果圖（底部附網站與作者），結果網址 `?p=63-43-33-38` 可還原完整結果
- 純靜態網頁，不需要建置工具

## 部署到 GitHub Pages

1. 把檔案 push 到 `main`
2. Repo → **Settings → Pages**
3. Source 選 **Deploy from a branch**，Branch 選 `main`、資料夾選 `/ (root)`
4. 幾分鐘後網址會是 `https://chase5ws.github.io/2026_wow_forever_mbti/`

## 檔案結構

```
index.html
css/style.css
js/data.js       ← 題目與選項
js/results.js    ← 種族、職業輪廓與說明、可選組合、16 型文案（調整結果改這裡）
js/icons.js      ← 種族頭像 / 職業圖示對照
js/scenes.js     ← 題目場景插畫（原創 SVG）
js/app.js        ← 測驗、計分、結果頁、分享圖
assets/races/    ← 種族頭像
assets/classes/  ← 職業圖示
assets/scenes/   ← 自訂題目截圖（選用）
```

### 調整結果

`js/results.js` 裡每個種族/職業的 `p` 是四維輪廓（-1 ~ 1）：EI 正值偏外向、SN 正值偏實感、TF 正值偏思考、JP 正值偏判斷。調整數值就能改變誰會被分到哪裡。`COMBOS` 是永恆服可選的種族職業組合。

### 換題目截圖

把圖片放進 `assets/scenes/`，在 `js/data.js` 把該題的 `img: ""` 改成 `img: "assets/scenes/檔名.jpg"`。讀取失敗時會自動退回 SVG 插畫。

---

作者：[Chase](https://github.com/chase5ws)

非官方粉絲作品，不以營利為目的，與 Blizzard Entertainment 無關。魔獸世界及相關名稱為 Blizzard Entertainment, Inc. 之商標；種族頭像與職業圖示取自遊戲畫面，版權屬原權利人。
