(() => {
  const $ = (id) => document.getElementById(id);
  const NEW_COMBOS = ["不死族聖騎士", "矮人薩滿", "人類獵人"]; // 永恆服新開放的組合
  const answers = new Array(QUESTIONS.length).fill(null);
  let idx = 0;

  const show = (id) => {
    document.querySelectorAll(".screen").forEach((s) => s.classList.toggle("active", s.id === id));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const sceneHTML = (q) =>
    q.img ? `<img src="${q.img}" alt="${q.title}" onerror="this.outerHTML=SCENES.render('${q.theme}')">` : SCENES.render(q.theme);

  /* ---------- 題目 ---------- */
  function renderQuestion() {
    const q = QUESTIONS[idx];
    $("scene").innerHTML = sceneHTML(q);
    $("place").textContent = q.place;
    $("qTitle").textContent = q.title;
    $("story").textContent = q.story;
    $("lore").textContent = q.lore;
    document.querySelector(".lore").open = false;
    $("qText").textContent = q.q;
    $("counter").textContent = `${idx + 1} / ${QUESTIONS.length}`;
    $("barFill").style.width = `${(idx / QUESTIONS.length) * 100}%`;
    $("backBtn").disabled = idx === 0;

    // 偶數題交換選項順序，避免固定位置帶來偏差
    const opts = q.id % 2 === 0 ? [q.b, q.a] : [q.a, q.b];
    const box = $("options");
    box.innerHTML = "";
    opts.forEach((o, i) => {
      const b = document.createElement("button");
      b.className = "opt" + (answers[idx] === o.pole ? " chosen" : "");
      b.innerHTML = `<span class="key">${"AB"[i]}</span><span>${o.text}</span>`;
      b.addEventListener("click", () => choose(o.pole, b));
      box.appendChild(b);
    });
  }

  function choose(pole, btn) {
    answers[idx] = pole;
    btn.classList.add("chosen");
    setTimeout(() => {
      if (idx < QUESTIONS.length - 1) {
        idx++;
        renderQuestion();
        $("qCard").scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        $("barFill").style.width = "100%";
        finish();
      }
    }, 220);
  }

  /* ---------- 計分 ---------- */
  function score() {
    const pairs = [["E", "I"], ["S", "N"], ["T", "F"], ["J", "P"]];
    const count = {};
    answers.forEach((p) => p && (count[p] = (count[p] || 0) + 1));
    let type = "";
    const pct = {};
    pairs.forEach(([a, b]) => {
      const ca = count[a] || 0, cb = count[b] || 0, total = ca + cb || 1;
      type += ca >= cb ? a : b;
      pct[a] = Math.round((ca / total) * 100);
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

    const dims = pct
      ? [["E", "I"], ["S", "N"], ["T", "F"], ["J", "P"]].map(([a, b]) => {
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
        <p class="r-combo">${r.race}<span class="cls">${r.cls}</span></p>
        <div class="badges">
          <span class="badge ${fClass}">${r.faction}</span>
          ${isNew ? `<span class="badge new">★ 永恆服新組合</span>` : ""}
        </div>
      </div>
      <div class="r-body">
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
        <button class="partner" data-type="${r.partner}" style="--pc:${CLASS_COLORS[p.cls]}">
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
          <div class="ct">${t}</div>
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
    const text = r ? `我在永恆服選角測驗是 ${t}「${r.nick}」：${r.race}${r.cls}！你呢？` : "永恆服選角測驗";
    try {
      if (navigator.share) {
        await navigator.share({ title: "永恆服選角測驗", text, url });
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
