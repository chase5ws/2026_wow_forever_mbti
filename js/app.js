(() => {
  const $ = (id) => document.getElementById(id);
  const NEW_COMBOS = ["不死族聖騎士", "矮人薩滿", "人類獵人"]; // 永恆服新開放的組合
  const PAIRS = [["E", "I"], ["S", "N"], ["T", "F"], ["J", "P"]];
  const TOTAL = QUESTIONS.length;

  // 組合每題的 4 個選項（強烈 2 分 / 稍微 1 分），用題號當種子固定洗牌，回上一題時順序不變
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
    q.opts = opts;
  });

  const answers = new Array(TOTAL).fill(null); // 存選項索引
  let idx = 0;

  const show = (id) => {
    document.querySelectorAll(".screen").forEach((s) => s.classList.toggle("active", s.id === id));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const sceneHTML = (q) =>
    q.img ? `<img src="${q.img}" alt="${q.title}" onerror="this.outerHTML=SCENES.render('${q.theme}')">` : SCENES.render(q.theme);

  /* ---------- 進度 ---------- */
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

  /* ---------- 題目 ---------- */
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
      b.innerHTML = `<span class="key">${"ABCD"[i]}</span><span>${o.text}</span>`;
      b.addEventListener("click", () => choose(i, b));
      box.appendChild(b);
    });
  }

  function choose(i, btn) {
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

  /* ---------- 計分（加權） ---------- */
  function score() {
    const pts = {}, cnt = {};
    answers.forEach((ai, qi) => {
      if (ai === null) return;
      const o = QUESTIONS[qi].opts[ai];
      pts[o.pole] = (pts[o.pole] || 0) + o.w;
      cnt[o.pole] = (cnt[o.pole] || 0) + 1;
    });
    let type = "";
    const pct = {};
    PAIRS.forEach(([a, b]) => {
      const pa = pts[a] || 0, pb = pts[b] || 0, total = pa + pb || 1;
      // 分數平手時，看哪一端被選的題數多
      type += pa > pb || (pa === pb && (cnt[a] || 0) >= (cnt[b] || 0)) ? a : b;
      pct[a] = Math.round((pa / total) * 100);
      pct[b] = 100 - pct[a];
    });
    return { type, pct };
  }

  function finish() {
    const { type, pct } = score();
    const params = new URLSearchParams({ type, p: ["E", "S", "T", "J"].map((k) => pct[k]).join("-") });
    history.replaceState(null, "", `?${params}`);
    renderResult(type, pct);
  }

  /* ---------- 結果 ---------- */
  function renderResult(type, pct) {
    const r = RESULTS[type];
    if (!r) return show("intro");
    const color = CLASS_COLORS[r.cls];
    const combo = r.race + r.cls;
    const isNew = NEW_COMBOS.includes(combo);
    const fClass = r.faction === "聯盟" ? "alliance" : "horde";
    const p = RESULTS[r.partner];
    const why = WHY[type];

    const dims = pct
      ? PAIRS.map(([a, b]) => {
          const win = type.includes(a) ? a : b;
          const left = pct[a];
          return `<div class="dim-row">
            <div class="dim-labels">
              <span class="${win === a ? "win" : ""}"><b>${a}</b> ${DIM_LABELS[a]} ${left}%</span>
              <span class="${win === b ? "win" : ""}">${100 - left}% ${DIM_LABELS[b]} <b>${b}</b></span>
            </div>
            <div class="dim-bar"><i style="${win === a ? `left:0;width:${left}%` : `right:0;width:${100 - left}%`}"></i></div>
          </div>`;
        }).join("")
      : "";

    const card = $("resultCard");
    card.style.setProperty("--c", color);
    card.innerHTML = `
      <div class="r-hero">
        <p class="r-type">${type}</p>
        <p class="r-nick">${r.nick}</p>
        <div class="emblems">
          <figure class="emblem race ${fClass}">
            <div class="ring">${ICONS.race(r.race)}</div>
            <figcaption><small>種族</small>${r.race}</figcaption>
          </figure>
          <span class="plus">＋</span>
          <figure class="emblem cls">
            <div class="ring">${ICONS.cls(r.cls)}</div>
            <figcaption><small>職業</small>${r.cls}</figcaption>
          </figure>
        </div>
        <p class="r-combo">${r.race}<span class="cls">${r.cls}</span></p>
        <div class="badges">
          <span class="badge ${fClass}">${r.faction}</span>
          ${isNew ? `<span class="badge new">★ 永恆服新組合</span>` : ""}
        </div>
      </div>
      <div class="r-body">
        <h3>為什麼是${combo}？</h3>
        <div class="why">
          <div class="why-row">
            <span class="why-icon ${fClass}">${ICONS.race(r.race)}</span>
            <div><b>為什麼是${r.race}</b><p>${why.race}</p></div>
          </div>
          <div class="why-row">
            <span class="why-icon cls">${ICONS.cls(r.cls)}</span>
            <div><b>為什麼是${r.cls}</b><p>${why.cls}</p></div>
          </div>
        </div>
        ${dims ? `<h3>性向分布</h3><div class="dims">${dims}</div>` : ""}
        <h3>你的冒險者靈魂</h3>
        <p>${r.desc}</p>
        <h3>擅長</h3>
        <div class="tags">${r.strengths.map((s) => `<span class="tag">${s}</span>`).join("")}</div>
        <h3>小提醒</h3>
        <p>${r.watch}</p>
        <h3>冒險資料</h3>
        <div class="info-grid">
          <div class="info"><small>起始地</small>${r.zone}</div>
          <div class="info"><small>精神上像是</small>${r.like}</div>
        </div>
        <h3>最佳隊友</h3>
        <button class="partner" data-type="${r.partner}">
          <span class="why-icon ${p.faction === "聯盟" ? "alliance" : "horde"}">${ICONS.race(p.race)}</span>
          <span class="pt" style="color:${CLASS_COLORS[p.cls]}">${r.partner}</span>
          <span>${p.race}${p.cls}<br><small style="color:var(--muted)">${p.nick}</small></span>
        </button>
      </div>`;
    card.querySelector(".partner").addEventListener("click", (e) => openType(e.currentTarget.dataset.type));
    $("toast").textContent = "";
    show("result");
  }

  function openType(type) {
    history.replaceState(null, "", `?type=${type}`);
    renderResult(type, null);
  }

  /* ---------- 圖鑑 ---------- */
  function renderGallery() {
    $("grid").innerHTML = Object.entries(RESULTS)
      .map(([t, r]) => {
        const f = r.faction === "聯盟" ? "alliance" : "horde";
        const isNew = NEW_COMBOS.includes(r.race + r.cls) ? " ★" : "";
        return `<button class="cell" data-type="${t}" style="--c:${CLASS_COLORS[r.cls]}">
          <div class="cell-top"><span class="ct">${t}</span><span class="cell-icons"><span class="cp ${f}">${ICONS.race(r.race)}</span><span class="ci">${ICONS.cls(r.cls)}</span></span></div>
          <div class="cc">${r.race}${r.cls}${isNew}</div>
          <div class="cn">${r.nick}</div>
          <div class="cf ${f}">${r.faction}</div>
        </button>`;
      })
      .join("");
    $("grid").querySelectorAll(".cell").forEach((c) =>
      c.addEventListener("click", () => openType(c.dataset.type))
    );
    show("gallery");
  }

  /* ---------- 分享 ---------- */
  async function share() {
    const url = location.href;
    const t = new URLSearchParams(location.search).get("type");
    const r = RESULTS[t];
    const text = r ? `我在永恆服MBTI選角測試是 ${t}「${r.nick}」：${r.race}${r.cls}！你呢？` : "永恆服MBTI選角測試";
    try {
      if (navigator.share) {
        await navigator.share({ title: "永恆服MBTI選角測試", text, url });
        return;
      }
      await navigator.clipboard.writeText(`${text}\n${url}`);
      $("toast").textContent = "已複製結果連結，貼給公會朋友吧！";
    } catch (e) {
      $("toast").textContent = url;
    }
  }

  function reset() {
    answers.fill(null);
    idx = 0;
    history.replaceState(null, "", location.pathname);
    renderQuestion();
    show("quiz");
  }

  /* ---------- 事件 ---------- */
  buildSteps();
  $("introBanner").innerHTML = SCENES.render("mountain");
  $("startBtn").addEventListener("click", reset);
  $("retryBtn").addEventListener("click", reset);
  $("galleryBtn").addEventListener("click", renderGallery);
  $("galleryBtn2").addEventListener("click", renderGallery);
  $("galleryBack").addEventListener("click", () => {
    const t = new URLSearchParams(location.search).get("type");
    t && RESULTS[t] ? show("result") : show("intro");
  });
  $("shareBtn").addEventListener("click", share);
  $("backBtn").addEventListener("click", () => {
    if (idx > 0) { idx--; renderQuestion(); }
  });

  // 從分享連結直接打開結果
  const qs = new URLSearchParams(location.search);
  const t = (qs.get("type") || "").toUpperCase();
  if (RESULTS[t]) {
    let pct = null;
    const p = (qs.get("p") || "").split("-").map(Number);
    if (p.length === 4 && p.every((n) => n >= 0 && n <= 100)) {
      pct = {};
      ["E", "S", "T", "J"].forEach((k, i) => (pct[k] = p[i]));
      pct.I = 100 - pct.E; pct.N = 100 - pct.S; pct.F = 100 - pct.T; pct.P = 100 - pct.J;
    }
    renderResult(t, pct);
  }
})();
