/* =========================================================
 * 玩家回報（右上角按鈕）
 * 後台：Google 表單 → Google 試算表
 *
 * 設定方式：
 * 1. 建立 Google 表單，新增 6 個「簡答」或「段落」題目（順序不拘）：
 *    回報類型、準確度、其實想玩的職業、其實想玩的種族、意見、測驗資料
 * 2. 表單右上「⋮」→「取得預先填入的連結」，每題隨便填，按「取得連結」
 * 3. 從連結中把每題的 entry.xxxxx 數字填到下面 FIELDS
 * 4. FORM_ID 是表單網址 /forms/d/e/ 與 /viewform 中間那一串
 * 在「回覆」分頁按「連結至試算表」，回報就會自動寫進試算表。
 * ========================================================= */
const FEEDBACK = (() => {
  const FORM_ID = "1FAIpQLSdapUoxA_MnXYmJSVB2ENHqPyy5P5huN-JPIafuhK54HgWpHg";
  const FIELDS = {
    category: "entry.1489716530", // 回報類型（詳答）
    accuracy: "entry.250504786",  // 準確度（選擇題）
    wantClass: "entry.223407716", // 其實想玩的職業（選擇題）
    wantRace: "entry.436814056",  // 其實想玩的種族（選擇題）
    message: "entry.3431245",     // 意見（詳答）
    context: "entry.518299650"    // 測驗資料（詳答，自動帶入）
  };
  const READY = FORM_ID && Object.values(FIELDS).every(Boolean);

  const $ = (id) => document.getElementById(id);
  const CLASSES_LIST = ["戰士", "聖騎士", "獵人", "盜賊", "牧師", "薩滿", "法師", "術士", "德魯伊"];
  const RACES_LIST = ["人類", "矮人", "夜精靈", "地精", "天裔精靈", "獸人", "不死族", "牛頭人", "食人妖"];
  // ⚠ 以下三組選項必須與 Google 表單的選擇題選項一字不差，否則回報會被拒收
  const ACCURACY = ["很不準", "不準", "準", "滿準", "超準", "我是大便"];

  // 從目前畫面讀取測驗結果
  function context() {
    const type = document.querySelector("#resultCard .r-type");
    const combo = document.querySelector("#resultCard .r-combo");
    const onResult = $("result").classList.contains("active");
    const parts = [];
    if (onResult && type) parts.push(type.textContent.trim());
    if (onResult && combo) parts.push(combo.textContent.trim());
    if (location.search) parts.push(location.search);
    parts.push(navigator.userAgent.includes("Mobile") ? "手機" : "電腦");
    return parts.join("｜");
  }

  function open(category) {
    const onResult = $("result").classList.contains("active");
    $("fbCategory").value = category || (onResult ? "結果不準" : "題目建議");
    $("fbContext").textContent = onResult ? `會一併附上你的結果：${context()}` : "";
    $("fbStatus").textContent = "";
    $("fbForm").hidden = false;
    $("fbDone").hidden = true;
    $("feedbackModal").classList.add("open");
  }
  const close = () => $("feedbackModal").classList.remove("open");

  async function submit(e) {
    e.preventDefault();
    const data = {
      category: $("fbCategory").value,
      accuracy: (document.querySelector('input[name="fbAcc"]:checked') || {}).value || "",
      wantClass: $("fbClass").value,
      wantRace: $("fbRace").value,
      message: $("fbMessage").value.trim().slice(0, 1000),
      context: context()
    };
    if (!data.accuracy && !data.wantClass && !data.message) {
      $("fbStatus").textContent = "至少填一項再送出喔！";
      return;
    }
    const btn = $("fbSubmit");
    btn.disabled = true;
    $("fbStatus").textContent = "送出中…";
    try {
      if (READY) {
        const body = new URLSearchParams();
        Object.entries(FIELDS).forEach(([k, entry]) => body.append(entry, data[k]));
        // Google 表單不回傳 CORS 標頭，用 no-cors 送出即可（看不到回應但會寫入）
        await fetch(`https://docs.google.com/forms/d/e/${FORM_ID}/formResponse`, { method: "POST", mode: "no-cors", body });
      } else {
        // 尚未設定表單時，先存在本機，方便測試
        const list = JSON.parse(localStorage.getItem("feedback-local") || "[]");
        list.push({ ...data, at: new Date().toISOString() });
        localStorage.setItem("feedback-local", JSON.stringify(list));
        console.warn("[回報] 尚未設定 Google 表單，已暫存在本機：", data);
      }
      window.STATS && STATS.hit("feedbacks");
      $("fbForm").hidden = true;
      $("fbDone").hidden = false;
      $("fbForm").reset();
    } catch (err) {
      $("fbStatus").textContent = "送出失敗，請稍後再試。";
    } finally {
      btn.disabled = false;
    }
  }

  function init() {
    $("fbClass").innerHTML = `<option value="">（選填）</option>` + CLASSES_LIST.map((c) => `<option>${c}</option>`).join("") + `<option>還沒決定</option><option>我是大便</option>`;
    $("fbRace").innerHTML = `<option value="">（選填）</option>` + RACES_LIST.map((c) => `<option>${c}</option>`).join("") + `<option>還沒決定</option><option>我是大便</option>`;
    $("fbAcc").innerHTML = ACCURACY.map((a, i) => `<label><input type="radio" name="fbAcc" value="${a}"><span>${a}</span></label>`).join("");
    $("feedbackBtn").addEventListener("click", () => open());
    document.querySelectorAll("[data-feedback]").forEach((b) => b.addEventListener("click", () => open(b.dataset.feedback)));
    $("fbClose").addEventListener("click", close);
    $("fbDoneClose").addEventListener("click", close);
    $("feedbackModal").addEventListener("click", (e) => { if (e.target.id === "feedbackModal") close(); });
    $("fbForm").addEventListener("submit", submit);
  }
  document.addEventListener("DOMContentLoaded", init);
  return { open };
})();
