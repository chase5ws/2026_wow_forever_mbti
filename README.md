# 永恆服選角性向測驗

用 MBTI 四個維度，透過 20 道艾澤拉斯經典劇情情境題，找出最適合你的《魔獸世界：永恆》種族與職業。

- 20 題情境題：EI / SN / TF / JP 各 5 題，奇數題數不會平手
- 16 種結果，包含永恆服新開放的被遺忘者聖騎士、矮人薩滿、人類獵人
- 結果可用網址分享（`?type=INTJ`），附性向百分比與最佳隊友
- 純靜態網頁，不需要建置工具

## 部署到 GitHub Pages

1. 把檔案 push 到 `main`
2. Repo → **Settings → Pages**
3. Source 選 **Deploy from a branch**，Branch 選 `main`、資料夾選 `/ (root)`
4. 幾分鐘後網址會是 `https://chase5ws.github.io/2026_wow_forever_mbti/`

## 換成自己的截圖

每題預設使用原創的 SVG 場景插畫。想換成遊戲截圖：

1. 把圖片放進 `assets/scenes/`（建議 1600×600、JPG、每張 300KB 以下）
2. 在 `js/data.js` 找到該題，把 `img: ""` 改成 `img: "assets/scenes/檔名.jpg"`

圖片讀取失敗時會自動退回 SVG 插畫。

## 檔案結構

```
index.html
css/style.css
js/data.js     ← 題目、結果文案（要改內容改這裡）
js/scenes.js   ← 場景插畫
js/app.js      ← 測驗邏輯
assets/scenes/ ← 自訂截圖
```

---

非官方粉絲作品，與 Blizzard Entertainment 無關。魔獸世界及相關名稱為 Blizzard Entertainment, Inc. 之商標。
