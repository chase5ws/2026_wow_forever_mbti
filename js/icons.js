/* 種族與職業圖示（原創線條 SVG，非官方圖示） */
const ICONS = (() => {
  const svg = (body) =>
    `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;

  const cls = {
    "戰士": `<path d="M12 12 L44 44 M52 12 L20 44"/><path d="M38 46 L46 38 M18 38 L26 46"/><path d="M44 44 L52 52 M20 44 L12 52"/>`,
    "聖騎士": `<rect x="18" y="12" width="28" height="14" rx="2"/><path d="M32 26 V56"/><path d="M10 8 L14 12 M54 8 L50 12 M32 2 V6 M8 20 H12 M52 20 H56"/>`,
    "獵人": `<path d="M20 8 Q52 32 20 56"/><path d="M20 8 V56"/><path d="M12 32 H54 M48 26 L54 32 L48 38 M12 32 L8 28 M12 32 L8 36"/>`,
    "盜賊": `<path d="M32 6 L38 34 H26 Z"/><path d="M20 36 H44"/><path d="M32 36 V52"/><circle cx="32" cy="56" r="3"/>`,
    "牧師": `<circle cx="32" cy="32" r="9"/><path d="M32 6 V16 M32 48 V58 M6 32 H16 M48 32 H58 M14 14 L20 20 M44 44 L50 50 M50 14 L44 20 M20 44 L14 50"/>`,
    "薩滿": `<rect x="22" y="8" width="20" height="14" rx="2"/><rect x="24" y="24" width="16" height="14"/><rect x="22" y="40" width="20" height="16" rx="2"/><path d="M22 12 L10 8 L14 20 M42 12 L54 8 L50 20"/><path d="M27 15 H29 M35 15 H37 M28 31 H36"/>`,
    "法師": `<circle cx="32" cy="28" r="12"/><path d="M32 40 V58 M26 58 H38"/><path d="M50 8 V18 M45 13 H55 M12 10 V16 M9 13 H15"/><path d="M27 24 Q32 19 37 24"/>`,
    "術士": `<path d="M32 6 C40 18 48 24 46 38 C44 50 36 56 32 56 C28 56 20 50 18 38 C17 28 24 24 26 16 C30 24 32 24 32 6Z"/><circle cx="32" cy="40" r="4"/>`,
    "德魯伊": `<path d="M12 52 C12 26 28 10 54 10 C54 36 38 52 12 52Z"/><path d="M12 52 L42 22 M26 38 H36 M32 32 V24"/>`
  };

  const race = {
    "人類": `<path d="M10 46 L14 18 L24 32 L32 14 L40 32 L50 18 L54 46 Z"/><path d="M10 54 H54"/><circle cx="32" cy="38" r="3"/>`,
    "矮人": `<path d="M8 22 H46 C46 30 40 33 36 34 V40 H44 V50 H20 V40 H28 V34 C18 33 12 30 8 22Z"/><path d="M46 22 H56 L46 28"/>`,
    "夜精靈": `<path d="M40 12 A22 22 0 1 0 40 52 A18 18 0 1 1 40 12 Z"/><path d="M50 24 L52 30 L58 32 L52 34 L50 40 L48 34 L42 32 L48 30Z"/>`,
    "地精": `<circle cx="32" cy="32" r="13"/><circle cx="32" cy="32" r="5"/><path stroke-width="6" d="M32 8 V14 M32 50 V56 M8 32 H14 M50 32 H56 M15 15 L19 19 M45 45 L49 49 M49 15 L45 19 M19 45 L15 49"/>`,
    "獸人": `<path d="M18 56 L44 8"/><path d="M38 10 C52 8 58 22 52 34 C46 28 40 27 32 24 Z"/><path d="M30 20 C22 14 12 16 10 26 C18 26 24 28 28 30"/>`,
    "不死族": `<path d="M16 30 C16 18 24 10 32 10 C40 10 48 18 48 30 C48 36 44 38 44 42 V48 H20 V42 C20 38 16 36 16 30Z"/><circle cx="25" cy="30" r="4"/><circle cx="39" cy="30" r="4"/><path d="M32 36 V40 M26 48 V54 M32 48 V54 M38 48 V54"/>`,
    "牛頭人": `<path d="M22 26 C22 44 26 54 32 54 C38 54 42 44 42 26 Z"/><path d="M22 28 C12 26 8 18 10 8 C14 16 18 20 24 22 M42 28 C52 26 56 18 54 8 C50 16 46 20 40 22"/><circle cx="32" cy="48" r="3"/><path d="M27 34 H28 M36 34 H37"/>`,
    "天裔精靈": `<path d="M32 8 L38 26 L56 22 L42 34 L50 54 L32 42 L14 54 L22 34 L8 22 L26 26 Z"/>`,
    "食人妖": `<path d="M18 10 H46 V40 C46 48 40 54 32 54 C24 54 18 48 18 40Z"/><path d="M24 24 L30 27 M40 24 L34 27 M28 38 H36"/><path d="M24 44 C22 50 18 54 12 56 M40 44 C42 50 46 54 52 56"/><path d="M18 18 H10 M46 18 H54"/>`
  };

  // 種族頭像（截自遊戲角色選擇畫面），讀取失敗時退回線條圖示
  const portrait = {
    "人類": "human", "矮人": "dwarf", "夜精靈": "nightelf", "地精": "gnome",
    "天裔精靈": "skyborne", "獸人": "orc", "不死族": "undead", "牛頭人": "tauren", "食人妖": "troll"
  };

  // 職業圖示（使用者提供的遊戲風格圖示），讀取失敗時退回線條圖示
  const clsKey = {
    "戰士": "warrior", "聖騎士": "paladin", "獵人": "hunter", "盜賊": "rogue", "牧師": "priest",
    "薩滿": "shaman", "法師": "mage", "術士": "warlock", "德魯伊": "druid"
  };

  return {
    clsRaw: (name) => cls[name] || "",
    clsKey: (name) => clsKey[name],
    clsSvg: (name) => svg(cls[name] || ""),
    cls: (name) =>
      clsKey[name]
        ? `<img class="portrait class-img" src="assets/classes/${clsKey[name]}.png" alt="${name}" loading="lazy" onerror="this.outerHTML=ICONS.clsSvg('${name}')">`
        : svg(cls[name] || ""),
    raceSvg: (name) => svg(race[name] || ""),
    race: (name) =>
      portrait[name]
        ? `<img class="portrait" src="assets/races/${portrait[name]}.jpg" alt="${name}" loading="lazy" onerror="this.outerHTML=ICONS.raceSvg('${name}')">`
        : svg(race[name] || "")
  };
})();
