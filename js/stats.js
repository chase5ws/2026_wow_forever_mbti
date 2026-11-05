/* =========================================================
 * 網站統計與投票
 * 使用免費計數服務 Abacus（https://abacus.jasoncameron.dev），不需註冊。
 * 限制：每個 IP 每 10 秒 30 次請求；計數器 6 個月沒人存取會過期。
 * 想換成自己的後端（Supabase、Firebase…），改 hit() 和 get() 即可。
 * ========================================================= */
const STATS = (() => {
  const API = "https://abacus.jasoncameron.dev";
  const NS = "chase5ws-wowforever-mbti";
  const store = {
    get: (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} },
    sget: (k) => { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    sset: (k, v) => { try { sessionStorage.setItem(k, v); } catch (e) {} }
  };

  const FACTIONS = [
    { key: "alliance", name: "聯盟", color: "#3f6fd8" },
    { key: "horde", name: "部落", color: "#c53a2c" }
  ];
  const CLASS_KEYS = {
    "戰士": "warrior", "聖騎士": "paladin", "獵人": "hunter", "盜賊": "rogue", "牧師": "priest",
    "薩滿": "shaman", "法師": "mage", "術士": "warlock", "德魯伊": "druid"
  };

  const values = {};
  const $ = (id) => document.getElementById(id);
  const fmt = (n) => (n == null ? "—" : n.toLocaleString("zh-TW"));

  async function hit(key) {
    try {
      const r = await fetch(`${API}/hit/${NS}/${key}`);
      if (!r.ok) throw 0;
      const j = await r.json();
      values[key] = j.value;
    } catch (e) {
      if (values[key] != null) values[key]++;
    }
    render();
    return values[key];
  }

  async function get(key) {
    try {
      const r = await fetch(`${API}/get/${NS}/${key}`);
      if (r.status === 404) { values[key] = 0; return 0; }
      if (!r.ok) throw 0;
      const j = await r.json();
      values[key] = j.value;
    } catch (e) {
      values[key] = values[key] ?? null;
    }
    return values[key];
  }

  /* ---------- 畫面 ---------- */
  function bars(list, prefix, myVote) {
    const nums = list.map((x) => values[`${prefix}-${x.key}`] || 0);
    const total = nums.reduce((a, b) => a + b, 0);
    return list.map((x, i) => {
      const pct = total ? Math.round((nums[i] / total) * 100) : 0;
      const mine = myVote === x.key;
      return `<button class="vote-opt${mine ? " mine" : ""}" data-key="${x.key}" ${myVote ? "disabled" : ""} style="--vc:${x.color}">
        ${x.icon || ""}<span class="vote-name">${x.name}${mine ? "<em>你的一票</em>" : ""}</span>
        <span class="vote-bar"><i style="width:${myVote ? pct : 0}%"></i></span>
        <span class="vote-pct">${myVote ? `${pct}%` : ""}</span>
      </button>`;
    }).join("");
  }

  function render() {
    if (!$("statViews")) return;
    $("statViews").textContent = fmt(values.views);

    const myF = store.get("vote-faction");
    $("voteFaction").innerHTML = bars(FACTIONS, "vote-faction", myF);
    const fTotal = FACTIONS.reduce((a, x) => a + (values[`vote-faction-${x.key}`] || 0), 0);
    $("voteFactionTotal").textContent = myF ? `共 ${fmt(fTotal)} 票` : "投票後即可看到結果";

    const classList = Object.entries(CLASS_KEYS).map(([name, key]) => ({
      key, name, color: CLASS_COLORS[name], icon: `<span class="vote-icon">${ICONS.cls(name)}</span>`
    }));
    const myC = store.get("vote-class");
    $("voteClass").innerHTML = bars(classList, "vote-class", myC);
    const cTotal = classList.reduce((a, x) => a + (values[`vote-class-${x.key}`] || 0), 0);
    $("voteClassTotal").textContent = myC ? `共 ${fmt(cTotal)} 票` : "投票後即可看到結果";

    $("voteFaction").querySelectorAll(".vote-opt:not([disabled])").forEach((b) =>
      b.addEventListener("click", () => vote("faction", b.dataset.key)));
    $("voteClass").querySelectorAll(".vote-opt:not([disabled])").forEach((b) =>
      b.addEventListener("click", () => vote("class", b.dataset.key)));
  }

  async function vote(kind, key) {
    if (store.get(`vote-${kind}`)) return;
    store.set(`vote-${kind}`, key);
    render();
    await hit(`vote-${kind}-${key}`);
  }

  async function init() {
    render();
    const keys = [
      ...FACTIONS.map((x) => `vote-faction-${x.key}`),
      ...Object.values(CLASS_KEYS).map((k) => `vote-class-${k}`)];
    // 瀏覽次數：同一個分頁工作階段只算一次
    const viewTask = store.sget("viewed") ? get("views") : hit("views").then((v) => (store.sset("viewed", "1"), v));
    await Promise.all([viewTask, ...keys.map(get)]);
    render();
  }

  document.addEventListener("DOMContentLoaded", init);
  return { hit, get, render };
})();
