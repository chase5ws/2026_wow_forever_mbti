(() => {
  const $ = (id) => document.getElementById(id);
  const SITE_URL = "https://chase5ws.github.io/2026_wow_forever_mbti/";
  const AUTHOR = "Chase";
  const AUTHOR_LINK = "github.com/chase5ws";
  const PAIRS = [["E", "I"], ["S", "N"], ["T", "F"], ["J", "P"]];
  const DIMS = ["EI", "SN", "TF", "JP"];
  const TOTAL = QUESTIONS.length;
  const factionClass = (f) => (f === "聯盟" ? "alliance" : f === "部落" ? "horde" : "both");

  /* ================= 題目選項（強烈 2 分 / 稍微 1 分） ================= */
  QUESTIONS.forEach((q) => {
    const extra = EXTRA_OPTIONS[q.id] || [];
    const opts = [
      { text: q.a.text, pole: q.a.pole, w: 2 },
      { text: q.b.text, pole: q.b.pole, w: 2 }
    ];
    if (extra[0]) opts.push({ text: extra[0], pole: q.a.pole, w: 1 });
    if (extra[1]) opts.push({ text: extra[1], pole: q.b.pole, w: 1 });
    let s = q.id * 7919;
    const rnd = () => (s = (s * 9301 + 49297) % 233280) / 233280;
    for (let i = opts.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      [opts[i], opts[j]] = [opts[j], opts[i]];
    }
    // 第一題彩蛋：撿大便 → 直接進入 IMSB 隱藏人格
    if (q.id === 1) opts.push({ text: "都不要，我先蹲下來撿地上的大便 💩", special: "poop" });
    q.opts = opts;
  });

  const answers = new Array(TOTAL).fill(null);
  let idx = 0;
  let current = null; // 目前顯示的結果
  let changes = 0;     // 改答案的次數（IMSB 彩蛋用）
  let poopRoute = false; // 是否在第一題撿了大便

  const show = (id) => {
    document.querySelectorAll(".screen").forEach((s) => s.classList.toggle("active", s.id === id));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const sceneHTML = (q) =>
    q.img ? `<img src="${q.img}" alt="${q.title}" onerror="this.outerHTML=SCENES.render('${q.theme}')">` : SCENES.render(q.theme);

  /* ================= 進度 ================= */
  function buildSteps() {
    const box = $("steps");
    box.innerHTML = "";
    for (let i = 0; i < TOTAL; i++) {
      const b = document.createElement("button");
      b.className = "step";
      b.setAttribute("aria-label", `第 ${i + 1} 題`);
      b.addEventListener("click", () => {
        if (answers[i] !== null || i === firstUnanswered()) { idx = i; renderQuestion(); }
      });
      box.appendChild(b);
    }
  }
  const firstUnanswered = () => { const i = answers.indexOf(null); return i === -1 ? TOTAL - 1 : i; };
  const answeredCount = () => answers.filter((a) => a !== null).length;

  function renderProgress() {
    const done = answeredCount();
    $("counter").innerHTML = `第 <b>${idx + 1}</b> 題 <span>/ 共 ${TOTAL} 題</span>`;
    $("remain").textContent = done === TOTAL ? "已全部作答" : `已答 ${done} 題・還剩 ${TOTAL - done} 題`;
    $("dimTag").textContent = DIM_NAMES[QUESTIONS[idx].dim];
    $("backBtn").disabled = idx === 0;
    const reachable = firstUnanswered();
    [...$("steps").children].forEach((el, i) => {
      el.className = "step" + (answers[i] !== null ? " done" : "") + (i === idx ? " current" : "");
      el.disabled = !(answers[i] !== null || i === reachable);
    });
  }

  /* ================= 題目 ================= */
  function renderQuestion() {
    const q = QUESTIONS[idx];
    $("scene").innerHTML = sceneHTML(q);
    $("sceneNo").textContent = String(idx + 1).padStart(2, "0");
    $("place").textContent = q.place;
    $("qTitle").textContent = q.title;
    $("story").textContent = q.story;
    $("lore").textContent = q.lore;
    document.querySelector(".lore").open = false;
    $("qText").textContent = q.q;
    renderProgress();

    const box = $("options");
    box.innerHTML = "";
    q.opts.forEach((o, i) => {
      const b = document.createElement("button");
      b.className = "opt" + (answers[idx] === i ? " chosen" : "");
      b.className += o.special ? " opt-poop" : "";
      b.innerHTML = `<span class="key">${"ABCDE"[i]}</span><span>${o.text}</span>`;
      b.addEventListener("click", () => choose(i, b));
      box.appendChild(b);
    });
  }

  function choose(i, btn) {
    if (QUESTIONS[idx].opts[i].special === "poop") {
      answers[idx] = i;
      poopRoute = true;
      btn.classList.add("chosen");
      setTimeout(() => {
        window.STATS && STATS.hit("completes");
        openType("IMSB");
      }, 400);
      return;
    }
    if (answers[idx] !== null && answers[idx] !== i) changes++;
    answers[idx] = i;
    $("options").querySelectorAll(".opt").forEach((o) => o.classList.remove("chosen"));
    btn.classList.add("chosen");
    renderProgress();
    setTimeout(() => {
      const next = answers.indexOf(null);
      if (next === -1) return finish();
      idx = idx < TOTAL - 1 && answers[idx + 1] === null ? idx + 1 : next;
      renderQuestion();
      $("quiz").scrollIntoView({ behavior: "smooth", block: "start" });
    }, 240);
  }

  /* ================= 計分 ================= */
  // 回傳每個維度「第一個字母」的百分比，例如 { E: 60, S: 20, T: 60, J: 40 }
  function scorePct() {
    const pts = {}, cnt = {};
    answers.forEach((ai, qi) => {
      if (ai === null) return;
      const o = QUESTIONS[qi].opts[ai];
      pts[o.pole] = (pts[o.pole] || 0) + o.w;
      cnt[o.pole] = (cnt[o.pole] || 0) + 1;
    });
    const pct = {};
    PAIRS.forEach(([a, b]) => {
      const pa = pts[a] || 0, pb = pts[b] || 0, total = pa + pb || 1;
      let v = Math.round((pa / total) * 100);
      // 剛好 50% 時，看哪一端被選的題數多
      if (v === 50) v += (cnt[a] || 0) >= (cnt[b] || 0) ? 1 : -1;
      pct[a] = v;
    });
    return pct;
  }

  // 從百分比推出完整結果（分享連結也走這裡，結果完全一致）
  function analyze(pct) {
    const u = {};
    PAIRS.forEach(([a], i) => (u[DIMS[i]] = (pct[a] - 50) / 50));
    const type = PAIRS.map(([a, b]) => (pct[a] > 50 ? a : b)).join("");

    const dist = (p) => DIMS.reduce((s, d) => s + (u[d] - p[d]) ** 2, 0);
    const match = (d) => Math.max(1, Math.min(99, Math.round(100 * (1 - d / 6))));

    const races = Object.entries(RACES)
      .map(([key, r]) => ({ key, ...r, d: dist(r.p) }))
      .sort((x, y) => x.d - y.d)
      .map((r) => ({ ...r, m: match(r.d) }));
    const classes = Object.entries(CLASSES)
      .map(([name, c]) => {
        const rec = CLASS_MBTI[name].types.includes(type); // 對照表推薦加分
        return { name, ...c, rec, d: Math.max(0, dist(c.p) - (rec ? 0.4 : 0)) };
      })
      .sort((x, y) => x.d - y.d)
      .map((c) => ({ ...c, m: match(c.d) }));

    const combos = [];
    races.forEach((r) =>
      COMBOS[r.key].forEach((cn) => {
        const c = classes.find((x) => x.name === cn);
        combos.push({ race: r, cls: c, d: r.d + c.d });
      })
    );
    combos.sort((x, y) => x.d - y.d);

    // 為什麼：挑出你和它最一致的兩個面向
    const whyLines = (item) =>
      DIMS.map((d, i) => {
        const pole = item.p[d] >= 0 ? PAIRS[i][0] : PAIRS[i][1];
        return { pole, s: u[d] * item.p[d], line: item.lines[pole] };
      })
        .filter((x) => x.s > 0.03 && x.line)
        .sort((a, b) => b.s - a.s)
        .slice(0, 2);

    // 傾向：每個維度的強度與「影子類型」
    const strength = PAIRS.map(([a, b], i) => {
      const v = pct[a];
      const lead = v > 50 ? a : b;
      const lv = Math.max(v, 100 - v);
      const label = lv >= 80 ? "非常明顯的" : lv >= 65 ? "明顯的" : lv >= 57 ? "稍微偏向" : "幾乎各半，略偏";
      return { a, b, i, v, lead, lv, label };
    });
    const weakest = [...strength].sort((x, y) => x.lv - y.lv)[0];
    let shadow = null;
    if (weakest.lv < 60) {
      const arr = type.split("");
      arr[weakest.i] = weakest.lead === weakest.a ? weakest.b : weakest.a;
      shadow = { type: arr.join(""), dim: DIM_NAMES[DIMS[weakest.i]] };
    }

    const best = combos[0];
    return {
      pct, type, races, classes, best, second: combos[1],
      raceWhy: whyLines(best.race), clsWhy: whyLines(best.cls),
      strength, shadow
    };
  }

  /* ================= IMSB 隱藏人格（獨立結果頁） ================= */
  function renderImsb() {
    current = { imsb: true, type: "IMSB" };
    const I = IMSB;
    const card = $("resultCard");
    card.style.setProperty("--c", I.color);
    card.innerHTML = `
      <div class="r-hero imsb-hero">
        <p class="eyebrow">隱藏人格解鎖</p>
        <div class="poop" aria-hidden="true">💩</div>
        <p class="r-type imsb-type">${I.type}</p>
        <p class="imsb-nick">${I.nick}</p>
        <p class="imsb-alias">又稱 ${I.alias}</p>
        <div class="emblems">
          <figure class="emblem imsb-emblem">
            <div class="ring"><span class="emoji">${I.raceEmoji}</span></div>
            <figcaption><small>種族</small>${I.race}</figcaption>
          </figure>
          <span class="plus">＋</span>
          <figure class="emblem imsb-emblem">
            <div class="ring"><span class="emoji">${I.clsEmoji}</span></div>
            <figcaption><small>職業</small>${I.cls}</figcaption>
          </figure>
        </div>
        <p class="r-combo">${I.race}<span class="cls">${I.cls}</span></p>
        <div class="badges">
          <span class="badge">${I.faction}</span>
          <span class="badge">${I.role}</span>
          <span class="badge new">★ 隱藏人格</span>
        </div>
      </div>
      <div class="r-body">
        <h3>你的內心戲</h3>
        <div class="imsb-voices">
          <p class="v1">${I.voices[0]}</p>
          <p class="v2">${I.voices[1]}</p>
          <p class="v3">（最後：做了一件大便事 💩）</p>
        </div>

        <h3>${I.type}・${I.nick}</h3>
        <p>${I.desc}</p>

        <h3>為什麼是${I.race}？</h3>
        <div class="why-row">
          <span class="why-icon imsb-mini">${I.raceEmoji}</span>
          <div><ul class="why-lines">${I.whyRace.map((x) => `<li><span class="pole">💩</span>${x}</li>`).join("")}</ul></div>
        </div>
        <h3>為什麼是${I.cls}？</h3>
        <div class="why-row">
          <span class="why-icon imsb-mini">${I.clsEmoji}</span>
          <div><ul class="why-lines">${I.whyCls.map((x) => `<li><span class="pole">💩</span>${x}</li>`).join("")}</ul></div>
        </div>

        <h3>人格指數</h3>
        <div class="dims">${I.meters.map((m) => `
          <div class="dim-row">
            <div class="dim-labels"><span class="win"><b>${m.name}</b></span><span class="win">${m.v}%</span></div>
            <div class="dim-bar"><i style="left:0;width:${m.v}%"></i></div>
          </div>`).join("")}
        </div>

        <h3>招牌大便行為</h3>
        <ul class="imsb-list">
          ${poopRoute ? `<li><b>開服第一件事，是蹲在北郡修道院撿大便</b></li>` : ""}
          ${I.habits.map((h) => `<li>${h}</li>`).join("")}
        </ul>

        <h3>小提醒</h3>
        <p class="muted">💡 ${I.watch}</p>

        <h3>冒險資料</h3>
        <div class="info-grid">
          <div class="info"><small>起始地</small>${I.zone}</div>
          <div class="info"><small>職業定位</small>${I.role}</div>
          <div class="info"><small>最佳隊友</small>${I.partner}</div>
          <div class="info"><small>天敵</small>${I.enemy}</div>
        </div>
        <p class="imsb-note">${I.source}</p>
      </div>`;
    $("toast").textContent = "";
    show("result");
  }

  function finish() {
    window.STATS && STATS.hit("completes");
    const pct = scorePct();
    history.replaceState(null, "", `?p=${["E", "S", "T", "J"].map((k) => pct[k]).join("-")}`);
    renderResult(analyze(pct));
  }

  const comboName = (c) => c.race.name + c.cls.name;
  const isNewCombo = (c) => NEW_COMBOS.includes(`${c.race.key}-${c.cls.name}`);

  // 16 型的「典型」百分比（每個字母 80%）
  function idealPct(type) {
    const pct = {};
    PAIRS.forEach(([a], i) => (pct[a] = type[i] === a ? 80 : 20));
    return pct;
  }

  /* ================= 結果頁 ================= */
  function renderResult(R) {
    current = R;
    const { best } = R;
    const color = CLASS_COLORS[best.cls.name];
    const fClass = factionClass(best.race.faction);
    const t = TYPES[R.type];
    const pt = TYPES[t.partner];
    const partner = analyze(idealPct(t.partner)).best;
    const topRace = R.races[0], topCls = R.classes[0];

    const rankRows = (list, kind) =>
      list.slice(0, 3).map((x, i) => {
        const isRace = kind === "race";
        const chosen = isRace ? x.key === best.race.key : x.name === best.cls.name;
        return `<div class="rank-row${chosen ? " chosen" : ""}" style="--rc:${isRace ? "var(--gold)" : CLASS_COLORS[x.name]}">
          <span class="rank-no">${i + 1}</span>
          <span class="rank-icon ${isRace ? factionClass(x.faction) : "cls"}">${isRace ? ICONS.race(x.name) : ICONS.cls(x.name)}</span>
          <span class="rank-name">${x.name}${chosen ? `<em>選定</em>` : ""}${!isRace && x.rec ? `<em class="rec">推薦</em>` : ""}</span>
          <span class="rank-bar"><i style="width:${x.m}%"></i></span>
          <span class="rank-pct">${x.m}%</span>
        </div>`;
      }).join("");

    const dims = R.strength.map(({ a, b, i, v, lead, label }) => `
      <div class="dim-row">
        <div class="dim-labels">
          <span class="${lead === a ? "win" : ""}"><b>${a}</b> ${DIM_LABELS[a]} ${v}%</span>
          <span class="${lead === b ? "win" : ""}">${100 - v}% ${DIM_LABELS[b]} <b>${b}</b></span>
        </div>
        <div class="dim-bar"><i style="${lead === a ? `left:0;width:${v}%` : `right:0;width:${100 - v}%`}"></i></div>
        <div class="dim-strength">${DIM_NAMES[DIMS[i]]}：${label} <b>${lead}</b></div>
      </div>`).join("");

    // 第一名種族或職業沒被選上時的說明
    let note;
    if (topRace.key === best.race.key && topCls.name === best.cls.name)
      note = `種族與職業都是你的第一名，這是你的<b>天選組合</b>。`;
    else if (topRace.key === best.race.key)
      note = `你契合度最高的職業是<b>${topCls.name}</b>，但${best.race.name}在永恆服不能當${topCls.name}，所以選了整體最契合的<b>${comboName(best)}</b>。`;
    else if (topCls.name === best.cls.name)
      note = `你契合度最高的種族是<b>${topRace.name}</b>，但${topRace.name}在永恆服不能當${best.cls.name}，所以選了整體最契合的<b>${comboName(best)}</b>。`;
    else
      note = `分開看，你最契合的是<b>${topRace.name}</b>和<b>${topCls.name}</b>；兩者加總後，最契合的可選組合是<b>${comboName(best)}</b>。`;

    const whyList = (arr) =>
      arr.length ? `<ul class="why-lines">${arr.map((x) => `<li><span class="pole">${x.pole}</span>${x.line}</li>`).join("")}</ul>` : "";

    const card = $("resultCard");
    card.style.setProperty("--c", color);
    card.innerHTML = `
      <div class="r-hero">
        <p class="eyebrow">你的永恆服選角</p>
        <div class="emblems">
          <figure class="emblem race ${fClass}">
            <div class="ring">${ICONS.race(best.race.name)}</div>
            <figcaption><small>種族</small>${best.race.name}</figcaption>
          </figure>
          <span class="plus">＋</span>
          <figure class="emblem cls">
            <div class="ring">${ICONS.cls(best.cls.name)}</div>
            <figcaption><small>職業</small>${best.cls.name}</figcaption>
          </figure>
        </div>
        <p class="r-combo">${best.race.name}<span class="cls">${best.cls.name}</span></p>
        <div class="badges">
          <span class="badge ${fClass}">${best.race.faction}</span>
          <span class="badge">${best.cls.role}</span>
          ${isNewCombo(best) ? `<span class="badge new">★ 永恆服新組合</span>` : ""}
        </div>
        <div class="r-mbti">
          <span class="r-type">${R.type}</span>
          <span class="r-nick">${t.nick}</span>
        </div>
        ${R.shadow ? `<p class="r-shadow">你的${R.shadow.dim}幾乎各半，也有 <b>${R.shadow.type}</b>「${TYPES[R.shadow.type].nick}」的影子</p>` : ""}
      </div>
      <div class="r-body">
        <h3>為什麼是${best.race.name}？</h3>
        <div class="why-row">
          <span class="why-icon ${fClass}">${ICONS.race(best.race.name)}</span>
          <div><p class="muted">${best.race.blurb}</p>${whyList(R.raceWhy)}</div>
        </div>
        <h3>為什麼是${best.cls.name}？</h3>
        <div class="why-row">
          <span class="why-icon cls">${ICONS.cls(best.cls.name)}</span>
          <div><p class="muted">${best.cls.blurb}</p>${whyList(R.clsWhy)}
            <div class="rec-box">
              <small>社群推薦・${CLASS_MBTI[best.cls.name].trait}</small>
              <div class="mb-list">${CLASS_MBTI[best.cls.name].types.map((x) => `<span class="mb${x === R.type ? " on" : ""}">${x}</span>`).join("")}</div>
              <p>${CLASS_MBTI[best.cls.name].pos}</p>
            </div>
          </div>
        </div>
        <p class="note">${note}</p>

        <h3>種族契合度</h3>
        <div class="rank">${rankRows(R.races, "race")}</div>
        <h3>職業契合度</h3>
        <div class="rank">${rankRows(R.classes, "cls")}</div>

        <h3>性向分布</h3>
        <div class="dims">${dims}</div>

        <h3>${R.type}・${t.nick}</h3>
        <p>${t.desc}</p>
        <div class="tags" style="margin-top:10px">${t.strengths.map((s) => `<span class="tag">${s}</span>`).join("")}</div>
        <p class="muted" style="margin-top:10px">💡 ${t.watch}</p>

        <h3>冒險資料</h3>
        <div class="info-grid">
          <div class="info"><small>起始地</small>${best.race.zone}</div>
          <div class="info"><small>職業定位</small>${best.cls.role}</div>
          <div class="info wide"><small>第二人選</small>${comboName(R.second)}${isNewCombo(R.second) ? " ★" : ""}</div>
        </div>

        <h3>最佳隊友</h3>
        <button class="partner" data-type="${t.partner}">
          <span class="why-icon ${factionClass(partner.race.faction)}">${ICONS.race(partner.race.name)}</span>
          <span class="pt" style="color:${CLASS_COLORS[partner.cls.name]}">${t.partner}</span>
          <span>${comboName(partner)}<br><small class="muted">${pt.nick}</small></span>
        </button>
      </div>`;
    card.querySelector(".partner").addEventListener("click", (e) => openType(e.currentTarget.dataset.type));
    $("toast").textContent = "";
    show("result");
  }

  function openType(type) {
    history.replaceState(null, "", `?t=${type}`);
    if (type === "IMSB") return renderImsb();
    renderResult(analyze(idealPct(type)));
  }

  /* ================= 職業 × MBTI 對照表 ================= */
  function renderClassTable() {
    const myType = current ? current.type : null;
    $("classTable").innerHTML = Object.entries(CLASS_MBTI)
      .map(([name, m]) => `
        <details class="ct-row" style="--rc:${CLASS_COLORS[name]}">
          <summary>
            <span class="ct-icon">${ICONS.cls(name)}</span>
            <span class="ct-main"><b>${name}</b><small>${m.trait}</small></span>
            <span class="mb-list">${m.types.map((t) => `<span class="mb${t === myType ? " on" : ""}">${t}</span>`).join("")}</span>
          </summary>
          <p>${m.pos}</p>
        </details>`)
      .join("");
  }

  /* ================= 圖鑑 ================= */
  function renderGallery() {
    renderClassTable();
    $("grid").innerHTML = Object.keys(TYPES)
      .map((type) => {
        const b = analyze(idealPct(type)).best;
        const f = factionClass(b.race.faction);
        return `<button class="cell" data-type="${type}" style="--c:${CLASS_COLORS[b.cls.name]}">
          <div class="cell-top"><span class="ct">${type}</span><span class="cell-icons"><span class="cp ${f}">${ICONS.race(b.race.name)}</span><span class="ci">${ICONS.cls(b.cls.name)}</span></span></div>
          <div class="cc">${comboName(b)}${isNewCombo(b) ? " ★" : ""}</div>
          <div class="cn">${TYPES[type].nick}</div>
          <div class="cf ${f}">${b.race.faction}</div>
        </button>`;
      })
      .join("") + `<button class="cell imsb-cell" data-type="IMSB">
          <div class="cell-top"><span class="ct">？？？</span><span class="poop-sm">💩</span></div>
          <div class="cc">隱藏人格</div>
          <div class="cn">據說改答案改太多次的人會遇到</div>
        </button>`;
    $("grid").querySelectorAll(".cell").forEach((c) => c.addEventListener("click", () => openType(c.dataset.type)));
    show("gallery");
  }

  /* ================= 分享圖（JPG） ================= */
  const loadImg = (src) =>
    new Promise((res, rej) => {
      const im = new Image();
      im.onload = () => res(im);
      im.onerror = rej;
      im.src = src;
    });

  function wrapText(ctx, text, x, y, maxW, lh, maxLines = 3) {
    let line = "", lines = [];
    for (const ch of text) {
      if (ctx.measureText(line + ch).width > maxW && line) { lines.push(line); line = ch; }
      else line += ch;
    }
    if (line) lines.push(line);
    if (lines.length > maxLines) { lines = lines.slice(0, maxLines); lines[maxLines - 1] = lines[maxLines - 1].slice(0, -1) + "…"; }
    lines.forEach((l, i) => ctx.fillText(l, x, y + i * lh));
    return y + lines.length * lh;
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  // 分享圖左上角的永恆 logo
  async function drawLogo(ctx) {
    try {
      const logo = await loadImg("assets/logo.png");
      const h = 170, w = (logo.width / logo.height) * h;
      ctx.drawImage(logo, 62, 52, w, h);
    } catch (e) {}
  }

  async function drawImsbCard() {
    const W = 1080, H = 1440, I = IMSB;
    const cv = document.createElement("canvas");
    cv.width = W; cv.height = H;
    const ctx = cv.getContext("2d");
    const serif = '"Noto Serif TC", "Songti TC", "PingFang TC", serif';
    const display = '"Cinzel", "Noto Serif TC", serif';
    const emoji = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
    try { await document.fonts.ready; } catch (e) {}

    ctx.fillStyle = "#17110c"; ctx.fillRect(0, 0, W, H);
    let g = ctx.createRadialGradient(W / 2, 330, 40, W / 2, 330, 640);
    g.addColorStop(0, "#8b5a2b88"); g.addColorStop(1, "#17110c00");
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = "#b07a4588"; ctx.lineWidth = 3; ctx.setLineDash([18, 12]);
    roundRect(ctx, 30, 30, W - 60, H - 60, 28); ctx.stroke(); ctx.setLineDash([]);

    ctx.textAlign = "center";
    ctx.fillStyle = "#e8b77d"; ctx.font = `600 30px ${serif}`;
    ctx.fillText("永恆服MBTI選角測試・隱藏人格解鎖", W / 2, 118);
    await drawLogo(ctx);

    ctx.font = `220px ${emoji}`;
    ctx.fillText("💩", W / 2, 400);

    ctx.fillStyle = "#e8b77d"; ctx.font = `800 110px ${display}`;
    ctx.fillText(I.type, W / 2, 560);
    ctx.fillStyle = "#f3d9a1"; ctx.font = `700 44px ${serif}`;
    ctx.fillText(I.nick, W / 2, 630);

    ctx.font = `900 76px ${serif}`;
    const rw = ctx.measureText(I.race).width, cw = ctx.measureText(I.cls).width;
    const sx = W / 2 - (rw + cw) / 2;
    ctx.textAlign = "left";
    ctx.fillStyle = "#ece4d6"; ctx.fillText(I.race, sx, 740);
    ctx.fillStyle = I.color; ctx.fillText(I.cls, sx + rw, 740);
    ctx.textAlign = "center";
    ctx.fillStyle = "#a99c88"; ctx.font = `400 28px ${serif}`;
    ctx.fillText(`${I.faction}・${I.role}`, W / 2, 790);

    let by = 850;
    I.meters.forEach((m) => {
      const bx = 330, bw = W - 560;
      ctx.textAlign = "right"; ctx.fillStyle = "#e8b77d"; ctx.font = `600 28px ${serif}`;
      ctx.fillText(m.name, bx - 24, by + 16);
      ctx.textAlign = "left"; ctx.fillText(`${m.v}%`, bx + bw + 20, by + 16);
      ctx.fillStyle = "#ffffff18"; roundRect(ctx, bx, by, bw, 16, 8); ctx.fill();
      ctx.fillStyle = I.color; roundRect(ctx, bx, by, Math.max(16, (bw * m.v) / 100), 16, 8); ctx.fill();
      by += 54;
    });

    ctx.textAlign = "center"; ctx.fillStyle = "#ece4d6"; ctx.font = `400 30px ${serif}`;
    wrapText(ctx, `「${I.voices[0]}」「${I.voices[1]}」最後，做了一件大便事。`, W / 2, by + 40, W - 220, 46, 3);

    const fy = H - 196;
    ctx.strokeStyle = "#b07a4566"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(120, fy); ctx.lineTo(W - 120, fy); ctx.stroke();
    ctx.fillStyle = "#f3d9a1"; ctx.font = `700 34px ${serif}`;
    ctx.fillText("你是哪個種族職業？還是你也是 💩？", W / 2, fy + 58);
    ctx.fillStyle = "#e6b35a"; ctx.font = `600 28px ${serif}`;
    ctx.fillText(SITE_URL.replace(/^https?:\/\//, "").replace(/\/$/, ""), W / 2, fy + 104);
    ctx.fillStyle = "#7f7466"; ctx.font = `400 22px ${serif}`;
    ctx.fillText(`開發者 ${AUTHOR}・${AUTHOR_LINK}・迷因娛樂，非官方粉絲作品`, W / 2, fy + 144);
    return cv;
  }

  async function drawShareCard(R) {
    if (R.imsb) return drawImsbCard();
    const W = 1080, H = 1440;
    const cv = document.createElement("canvas");
    cv.width = W; cv.height = H;
    const ctx = cv.getContext("2d");
    const { best } = R;
    const color = CLASS_COLORS[best.cls.name];
    const t = TYPES[R.type];
    const serif = '"Noto Serif TC", "Songti TC", "PingFang TC", serif';
    const display = '"Cinzel", "Noto Serif TC", serif';
    try { await document.fonts.ready; } catch (e) {}

    // 背景
    ctx.fillStyle = "#0e0b14"; ctx.fillRect(0, 0, W, H);
    let g = ctx.createRadialGradient(W / 2, 330, 40, W / 2, 330, 640);
    g.addColorStop(0, color + "55"); g.addColorStop(1, "#0e0b1400");
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    g = ctx.createRadialGradient(W, H, 0, W, H, 700);
    g.addColorStop(0, "#2a160fcc"); g.addColorStop(1, "#2a160f00");
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = "#e6b35a66"; ctx.lineWidth = 3;
    roundRect(ctx, 30, 30, W - 60, H - 60, 28); ctx.stroke();
    ctx.strokeStyle = "#e6b35a22"; ctx.lineWidth = 1;
    roundRect(ctx, 44, 44, W - 88, H - 88, 22); ctx.stroke();

    ctx.textAlign = "center";
    ctx.fillStyle = "#e6b35a";
    ctx.font = `600 30px ${serif}`;
    ctx.fillText("永恆服MBTI選角測試", W / 2, 118);
    await drawLogo(ctx);
    ctx.fillStyle = "#a99c88";
    ctx.font = `400 28px ${serif}`;
    ctx.fillText("我的命定角色是", W / 2, 168);

    // 種族頭像
    const S = 250, gap = 90, y0 = 210;
    const xL = W / 2 - gap / 2 - S, xR = W / 2 + gap / 2;
    try {
      const portrait = await loadImg(`assets/races/${best.race.key}.jpg`);
      ctx.save(); roundRect(ctx, xL, y0, S, S, 22); ctx.clip();
      ctx.drawImage(portrait, xL, y0, S, S); ctx.restore();
    } catch (e) {}
    ctx.strokeStyle = "#c9a35a"; ctx.lineWidth = 8;
    roundRect(ctx, xL, y0, S, S, 22); ctx.stroke();
    ctx.strokeStyle = best.race.faction === "部落" ? "#c53a2c" : best.race.faction === "聯盟" ? "#3f6fd8" : "#a98be0";
    ctx.lineWidth = 4;
    roundRect(ctx, xL - 9, y0 - 9, S + 18, S + 18, 28); ctx.stroke();

    // 職業圖示
    ctx.fillStyle = "#00000066";
    ctx.beginPath(); ctx.arc(xR + S / 2, y0 + S / 2, S / 2, 0, Math.PI * 2); ctx.fill();
    try {
      const icon = await loadImg(`assets/classes/${ICONS.clsKey(best.cls.name)}.png`);
      ctx.save(); ctx.beginPath(); ctx.arc(xR + S / 2, y0 + S / 2, S / 2 - 4, 0, Math.PI * 2); ctx.clip();
      ctx.drawImage(icon, xR + 4, y0 + 4, S - 8, S - 8); ctx.restore();
    } catch (e) {
      try {
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 64 64" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">${ICONS.clsRaw(best.cls.name)}</svg>`;
        const icon = await loadImg("data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg));
        ctx.drawImage(icon, xR + 45, y0 + 45, S - 90, S - 90);
      } catch (e2) {}
    }
    ctx.beginPath(); ctx.arc(xR + S / 2, y0 + S / 2, S / 2, 0, Math.PI * 2);
    ctx.strokeStyle = "#c9a35a"; ctx.lineWidth = 8; ctx.stroke();
    ctx.beginPath(); ctx.arc(xR + S / 2, y0 + S / 2, S / 2 + 9, 0, Math.PI * 2);
    ctx.strokeStyle = color; ctx.lineWidth = 4; ctx.stroke();
    ctx.fillStyle = "#a99c88"; ctx.font = `400 46px ${serif}`;
    ctx.fillText("＋", W / 2, y0 + S / 2 + 16);

    // 組合名稱
    ctx.font = `900 92px ${serif}`;
    const rw = ctx.measureText(best.race.name).width, cw = ctx.measureText(best.cls.name).width;
    const sx = W / 2 - (rw + cw) / 2;
    ctx.textAlign = "left";
    ctx.fillStyle = "#ece4d6"; ctx.fillText(best.race.name, sx, 600);
    ctx.fillStyle = color; ctx.fillText(best.cls.name, sx + rw, 600);
    ctx.textAlign = "center";
    ctx.fillStyle = "#a99c88"; ctx.font = `400 30px ${serif}`;
    ctx.fillText(`${best.race.faction}・${best.cls.role}${isNewCombo(best) ? "・★ 永恆服新組合" : ""}`, W / 2, 652);

    // MBTI
    ctx.fillStyle = "#e6b35a"; ctx.font = `800 76px ${display}`;
    ctx.fillText(R.type, W / 2, 762);
    ctx.fillStyle = "#f3d9a1"; ctx.font = `600 36px ${serif}`;
    ctx.fillText(t.nick, W / 2, 814);
    if (R.shadow) {
      ctx.fillStyle = "#a99c88"; ctx.font = `400 26px ${serif}`;
      ctx.fillText(`也有 ${R.shadow.type} 的影子`, W / 2, 856);
    }

    // 四維長條
    let by = 900;
    ctx.font = `600 26px ${serif}`;
    R.strength.forEach(({ a, b, v, lead }) => {
      const bx = 230, bw = W - 460;
      ctx.textAlign = "right"; ctx.fillStyle = lead === a ? color : "#a99c88";
      ctx.fillText(`${a} ${v}%`, bx - 20, by + 14);
      ctx.textAlign = "left"; ctx.fillStyle = lead === b ? color : "#a99c88";
      ctx.fillText(`${100 - v}% ${b}`, bx + bw + 20, by + 14);
      ctx.fillStyle = "#ffffff18"; roundRect(ctx, bx, by, bw, 14, 7); ctx.fill();
      ctx.fillStyle = color;
      if (lead === a) roundRect(ctx, bx, by, (bw * v) / 100, 14, 7);
      else roundRect(ctx, bx + (bw * v) / 100, by, (bw * (100 - v)) / 100, 14, 7);
      ctx.fill();
      by += 48;
    });

    // 一句話理由
    ctx.textAlign = "center";
    ctx.fillStyle = "#ece4d6"; ctx.font = `400 30px ${serif}`;
    const line1 = (R.raceWhy[0] && R.raceWhy[0].line) || best.race.blurb;
    const line2 = (R.clsWhy[0] && R.clsWhy[0].line) || best.cls.blurb;
    const ty = wrapText(ctx, line1, W / 2, by + 36, W - 220, 44, 2);
    wrapText(ctx, line2, W / 2, ty + 8, W - 220, 44, 2);

    // 底部宣傳
    const fy = H - 196;
    ctx.strokeStyle = "#e6b35a55"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(120, fy); ctx.lineTo(W - 120, fy); ctx.stroke();
    ctx.fillStyle = "#f3d9a1"; ctx.font = `700 34px ${serif}`;
    ctx.fillText("你是哪個種族職業？20 題測出你的永恆服選角", W / 2, fy + 58);
    ctx.fillStyle = "#e6b35a"; ctx.font = `600 28px ${serif}`;
    ctx.fillText(SITE_URL.replace(/^https?:\/\//, "").replace(/\/$/, ""), W / 2, fy + 104);
    ctx.fillStyle = "#7f7466"; ctx.font = `400 22px ${serif}`;
    ctx.fillText(`開發者 ${AUTHOR}・${AUTHOR_LINK}・非官方粉絲作品`, W / 2, fy + 144);

    return cv;
  }

  let shareBlob = null;
  async function openShare() {
    if (!current) return;
    $("shareModal").classList.add("open");
    $("shareToast").textContent = "";
    $("sharePreview").innerHTML = `<p class="muted">產生圖片中…</p>`;
    try {
      const cv = await drawShareCard(current);
      const url = cv.toDataURL("image/jpeg", 0.92);
      shareBlob = await new Promise((res) => cv.toBlob(res, "image/jpeg", 0.92));
      $("sharePreview").innerHTML = `<img src="${url}" alt="我的永恆服選角結果圖">`;
      $("downloadBtn").href = url;
      $("downloadBtn").download = current.imsb ? "永恆服選角_IMSB_大便人糞術士.jpg" : `永恆服選角_${current.type}_${comboName(current.best)}.jpg`;
    } catch (e) {
      $("sharePreview").innerHTML = `<p class="muted">圖片產生失敗，請改用複製連結。</p>`;
    }
  }

  const shareText = () =>
    current && current.imsb ? `我在永恆服MBTI選角測試解鎖了隱藏人格 IMSB「${IMSB.nick}」：${IMSB.race}${IMSB.cls} 💩 你敢測嗎？` :
    current ? `我在永恆服MBTI選角測試是 ${current.type}「${TYPES[current.type].nick}」，命定角色是 ${comboName(current.best)}！你呢？` : "永恆服MBTI選角測試";

  async function nativeShare() {
    window.STATS && STATS.hit("shares");
    const url = location.href;
    try {
      if (shareBlob && navigator.canShare) {
        const file = new File([shareBlob], "result.jpg", { type: "image/jpeg" });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: "永恆服MBTI選角測試", text: `${shareText()}\n${url}` });
          return;
        }
      }
      if (navigator.share) { await navigator.share({ title: "永恆服MBTI選角測試", text: shareText(), url }); return; }
      await copyLink();
    } catch (e) {}
  }

  async function copyLink() {
    window.STATS && STATS.hit("shares");
    const msg = `${shareText()}\n${location.href}`;
    try {
      await navigator.clipboard.writeText(msg);
      $("toast").textContent = $("shareToast").textContent = "已複製結果連結，貼給公會朋友吧！";
    } catch (e) {
      $("toast").textContent = $("shareToast").textContent = location.href;
    }
  }

  function reset() {
    answers.fill(null);
    changes = 0;
    poopRoute = false;
    idx = 0;
    current = null;
    history.replaceState(null, "", location.pathname);
    renderQuestion();
    show("quiz");
  }

  /* ================= 事件 ================= */
  buildSteps();
  // 首頁主視覺讀取失敗時，退回原創插畫
  const heroImg = document.querySelector("#introBanner img");
  if (heroImg) heroImg.addEventListener("error", () => { heroImg.outerHTML = SCENES.render("mountain"); });
  $("startBtn").addEventListener("click", reset);
  $("retryBtn").addEventListener("click", reset);
  $("galleryBtn").addEventListener("click", renderGallery);
  $("galleryBtn2").addEventListener("click", renderGallery);
  $("galleryBack").addEventListener("click", () => (current ? show("result") : show("intro")));
  $("shareBtn").addEventListener("click", openShare);
  $("downloadBtn").addEventListener("click", () => window.STATS && STATS.hit("shares"));
  $("copyBtn").addEventListener("click", copyLink);
  $("nativeShareBtn").addEventListener("click", nativeShare);
  $("closeShare").addEventListener("click", () => $("shareModal").classList.remove("open"));
  $("shareModal").addEventListener("click", (e) => { if (e.target.id === "shareModal") $("shareModal").classList.remove("open"); });
  $("backBtn").addEventListener("click", () => { if (idx > 0) { idx--; renderQuestion(); } });

  // 從分享連結直接打開結果
  const qs = new URLSearchParams(location.search);
  const p = (qs.get("p") || "").split("-").map(Number);
  const t = (qs.get("t") || qs.get("type") || "").toUpperCase();
  if (p.length === 4 && p.every((n) => Number.isFinite(n) && n >= 0 && n <= 100)) {
    const pct = {};
    ["E", "S", "T", "J"].forEach((k, i) => (pct[k] = p[i] === 50 ? 51 : p[i]));
    renderResult(analyze(pct));
  } else if (t === "IMSB") {
    openType("IMSB");
  } else if (TYPES[t]) {
    renderResult(analyze(idealPct(t)));
  }
})();
