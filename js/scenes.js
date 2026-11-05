/* 內建場景插畫（原創 SVG，不使用任何官方美術）
 * 每個 theme 回傳一段 SVG 字串，作為題目的頂部橫幅。 */
const SCENES = (() => {
  const W = 800, H = 300;
  const wrap = (defs, body) =>
    `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${defs}${body}</svg>`;
  const sky = (id, top, bottom) =>
    `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bottom}"/></linearGradient>`;
  const stars = (n, seed = 1) => {
    let s = seed, out = "";
    const rnd = () => (s = (s * 9301 + 49297) % 233280) / 233280;
    for (let i = 0; i < n; i++)
      out += `<circle cx="${(rnd() * W).toFixed(0)}" cy="${(rnd() * 150).toFixed(0)}" r="${(rnd() * 1.4 + .3).toFixed(1)}" fill="#fff" opacity="${(rnd() * .6 + .2).toFixed(2)}"/>`;
    return out;
  };
  const pines = (y, color, count, h, seed) => {
    let s = seed, out = "";
    const rnd = () => (s = (s * 9301 + 49297) % 233280) / 233280;
    for (let i = 0; i < count; i++) {
      const x = (i / count) * W + rnd() * 30 - 10, hh = h * (.7 + rnd() * .6), w = hh * .38;
      out += `<path d="M${x} ${y - hh} L${x + w} ${y} L${x - w} ${y} Z" fill="${color}"/>`;
    }
    return out + `<rect x="0" y="${y - 2}" width="${W}" height="${H - y + 2}" fill="${color}"/>`;
  };

  const T = {
    forest: () => wrap(`<defs>${sky("g", "#1d3b4f", "#e2a35b")}</defs>`,
      `<rect width="${W}" height="${H}" fill="url(#g)"/>
       <circle cx="620" cy="190" r="46" fill="#ffd38a" opacity=".85"/>
       <path d="M0 220 Q200 170 400 210 T800 195 V300 H0Z" fill="#35523a" opacity=".7"/>
       ${pines(250, "#22372a", 26, 90, 3)}
       ${pines(285, "#142219", 18, 110, 7)}`),

    snow: () => wrap(`<defs>${sky("g", "#1b2a44", "#8fb2cf")}</defs>`,
      `<rect width="${W}" height="${H}" fill="url(#g)"/>${stars(40, 5)}
       <path d="M0 230 L120 110 L210 190 L330 70 L450 200 L560 100 L680 180 L800 120 V300 H0Z" fill="#c8d8e6"/>
       <path d="M330 70 L370 115 L345 110 L320 125 L300 100Z M120 110 L150 140 L120 135 L100 145Z M560 100 L590 130 L560 128 L545 138Z" fill="#fff"/>
       <path d="M300 300 V200 H500 V300Z" fill="#3a3530"/>
       <path d="M290 205 H510 L400 150Z" fill="#4c443c"/>
       <rect x="370" y="235" width="60" height="65" rx="30" fill="#ffb347" opacity=".9"/>
       ${pines(290, "#24343f", 20, 60, 11)}`),

    barrens: () => wrap(`<defs>${sky("g", "#f1a95b", "#f6dd9a")}</defs>`,
      `<rect width="${W}" height="${H}" fill="url(#g)"/>
       <circle cx="180" cy="120" r="55" fill="#fff3c4" opacity=".9"/>
       <path d="M0 230 Q300 205 520 225 T800 215 V300 H0Z" fill="#c98d48"/>
       <path d="M0 260 Q260 240 500 262 T800 250 V300 H0Z" fill="#9f6a33"/>
       <g fill="#4a2f1a">
         <rect x="560" y="160" width="8" height="70"/><ellipse cx="564" cy="158" rx="70" ry="14"/>
         <rect x="140" y="190" width="6" height="45"/><ellipse cx="143" cy="188" rx="46" ry="9"/>
       </g>
       <path d="M640 230 L690 175 L740 230Z" fill="#6b3b22"/><path d="M690 175 L690 160" stroke="#6b3b22" stroke-width="3"/>`),

    city: () => wrap(`<defs>${sky("g", "#0d1430", "#3b4a7a")}</defs>`,
      `<rect width="${W}" height="${H}" fill="url(#g)"/>${stars(70, 2)}
       <circle cx="660" cy="70" r="28" fill="#f4f1d6"/><circle cx="672" cy="62" r="26" fill="#1a244a"/>
       <g fill="#1a1f33">
         <rect x="80" y="150" width="70" height="150"/><path d="M75 150 L115 90 L155 150Z"/>
         <rect x="250" y="110" width="50" height="190"/><path d="M245 110 L275 40 L305 110Z"/>
         <rect x="320" y="170" width="160" height="130"/><path d="M315 170 L400 120 L485 170Z"/>
         <rect x="500" y="130" width="55" height="170"/><path d="M495 130 L527 60 L560 130Z"/>
         <rect x="620" y="180" width="110" height="120"/><path d="M615 180 L675 140 L735 180Z"/>
       </g>
       <g fill="#ffcf73" opacity=".85">
         <rect x="105" y="190" width="8" height="14"/><rect x="268" y="150" width="8" height="14"/><rect x="268" y="200" width="8" height="14"/>
         <rect x="380" y="230" width="40" height="70" rx="20"/><rect x="520" y="170" width="8" height="14"/><rect x="660" y="215" width="8" height="14"/>
       </g>
       <rect x="0" y="285" width="${W}" height="15" fill="#0b0f1f"/>`),

    ruins: () => wrap(`<defs>${sky("g", "#231c33", "#6a5d72")}</defs>`,
      `<rect width="${W}" height="${H}" fill="url(#g)"/>
       <rect width="${W}" height="${H}" fill="#7bbf6a" opacity=".06"/>
       <g fill="#2c2433">
         <path d="M90 300 V150 L110 130 L120 160 L135 120 L150 300Z"/>
         <path d="M300 300 V120 H330 V90 L350 70 L370 90 V100 L385 140 L400 120 V300Z"/>
         <path d="M520 300 V170 L540 150 L560 175 L575 140 L600 160 V300Z"/>
         <path d="M660 300 V210 L700 190 L730 215 V300Z"/>
       </g>
       <path d="M0 270 Q200 250 400 268 T800 260 V300 H0Z" fill="#1b1622"/>
       <g fill="#9ee37d" opacity=".35"><circle cx="200" cy="240" r="40"/><circle cx="470" cy="250" r="55"/><circle cx="740" cy="240" r="35"/></g>`),

    fire: () => wrap(`<defs>${sky("g", "#1a0806", "#7a1d0c")}<radialGradient id="l" cx=".5" cy="1" r=".8"><stop offset="0" stop-color="#ffb02e"/><stop offset=".5" stop-color="#e2431b" stop-opacity=".6"/><stop offset="1" stop-color="#e2431b" stop-opacity="0"/></radialGradient></defs>`,
      `<rect width="${W}" height="${H}" fill="url(#g)"/>
       <rect width="${W}" height="${H}" fill="url(#l)"/>
       <path d="M0 0 L60 60 L40 120 L90 160 L70 0Z M800 0 L730 80 L760 140 L700 200 L720 0Z" fill="#120403"/>
       <path d="M0 240 Q120 220 220 245 T420 235 T620 250 T800 238 V300 H0Z" fill="#2b0c06"/>
       <path d="M150 300 Q250 255 330 275 T520 268 T700 300Z" fill="#ff7a1a"/>
       <path d="M220 300 Q300 275 360 287 T520 285 T620 300Z" fill="#ffd166"/>`),

    camp: () => wrap(`<defs>${sky("g", "#0b1022", "#222a45")}<radialGradient id="f" cx=".5" cy=".8" r=".5"><stop offset="0" stop-color="#ffb347" stop-opacity=".55"/><stop offset="1" stop-color="#ffb347" stop-opacity="0"/></radialGradient></defs>`,
      `<rect width="${W}" height="${H}" fill="url(#g)"/>${stars(90, 9)}
       <rect width="${W}" height="${H}" fill="url(#f)"/>
       ${pines(260, "#0e1526", 24, 100, 13)}
       <path d="M0 270 H800 V300 H0Z" fill="#0a0f1b"/>
       <g transform="translate(400 262)">
         <path d="M-34 8 L34 -6 M-34 -6 L34 8" stroke="#5a3a22" stroke-width="7" stroke-linecap="round"/>
         <path d="M0 -60 C18 -35 22 -15 0 4 C-22 -15 -16 -35 0 -60Z" fill="#ff8c2b"/>
         <path d="M0 -36 C9 -22 10 -10 0 2 C-10 -10 -8 -22 0 -36Z" fill="#ffe08a"/>
       </g>`),

    mountain: () => wrap(`<defs>${sky("g", "#2d1f4d", "#d78c6a")}</defs>`,
      `<rect width="${W}" height="${H}" fill="url(#g)"/>${stars(30, 4)}
       <path d="M0 260 L180 140 L300 200 L420 90 L560 210 L700 150 L800 200 V300 H0Z" fill="#41315c"/>
       <g fill="#1f1a2e">
         <path d="M408 260 C405 200 415 150 420 95 C425 150 435 200 432 260Z"/>
         <ellipse cx="420" cy="70" rx="120" ry="45"/><ellipse cx="360" cy="90" rx="70" ry="28"/><ellipse cx="490" cy="88" rx="75" ry="30"/>
       </g>
       <g fill="#b9f3ff" opacity=".55"><circle cx="380" cy="60" r="3"/><circle cx="455" cy="55" r="2.5"/><circle cx="420" cy="40" r="3.5"/><circle cx="500" cy="80" r="2"/></g>
       <path d="M0 275 Q400 245 800 275 V300 H0Z" fill="#16121f"/>`),

    cave: () => wrap(`<defs>${sky("g", "#120d0a", "#3b2a1d")}<radialGradient id="lamp" cx=".5" cy=".55" r=".4"><stop offset="0" stop-color="#ffbf5a" stop-opacity=".45"/><stop offset="1" stop-color="#ffbf5a" stop-opacity="0"/></radialGradient></defs>`,
      `<rect width="${W}" height="${H}" fill="url(#g)"/>
       <rect width="${W}" height="${H}" fill="url(#lamp)"/>
       <path d="M0 0 H800 V60 Q700 110 600 70 Q500 120 400 80 Q300 120 200 70 Q100 110 0 60Z" fill="#0b0806"/>
       <path d="M0 300 V240 Q120 215 240 245 Q400 225 560 248 Q680 230 800 245 V300Z" fill="#0b0806"/>
       <g stroke="#6b4a2c" stroke-width="10"><path d="M260 245 V120 H540 V245" fill="none"/></g>
       <path d="M200 250 H600" stroke="#5a5550" stroke-width="5"/>
       <circle cx="400" cy="150" r="9" fill="#ffd27a"/>`),

    hills: () => wrap(`<defs>${sky("g", "#4d7ea8", "#d8e6c7")}</defs>`,
      `<rect width="${W}" height="${H}" fill="url(#g)"/>
       <ellipse cx="200" cy="80" rx="80" ry="18" fill="#fff" opacity=".6"/><ellipse cx="600" cy="60" rx="100" ry="20" fill="#fff" opacity=".5"/>
       <path d="M0 200 Q200 140 400 190 T800 170 V300 H0Z" fill="#7aa35c"/>
       <path d="M0 240 Q250 200 500 240 T800 225 V300 H0Z" fill="#5a8344"/>
       <g fill="#6a4a33"><rect x="150" y="190" width="40" height="30"/><path d="M145 192 L170 170 L195 192Z" fill="#8a3b2a"/>
       <rect x="610" y="180" width="46" height="34"/><path d="M604 182 L633 160 L662 182Z" fill="#2f4f7a"/></g>
       ${pines(290, "#344f2a", 14, 60, 21)}`),

    swamp: () => wrap(`<defs>${sky("g", "#2c3b33", "#8e9c7c")}</defs>`,
      `<rect width="${W}" height="${H}" fill="url(#g)"/>
       <rect y="120" width="${W}" height="80" fill="#cfd8c0" opacity=".2"/>
       <g fill="#25301f">
         <path d="M120 260 C115 200 130 150 125 90 L135 90 C140 150 150 200 145 260Z"/><path d="M128 100 Q80 120 60 110 M130 120 Q180 130 200 115" stroke="#25301f" stroke-width="5" fill="none"/>
         <path d="M620 260 C615 210 630 170 625 120 L635 120 C640 170 650 210 645 260Z"/>
       </g>
       <path d="M0 250 Q400 235 800 250 V300 H0Z" fill="#3d4a35"/>
       <path d="M0 270 H800 V300 H0Z" fill="#2a3a36" opacity=".9"/>
       <g stroke="#a7b896" opacity=".4"><path d="M100 282 H180 M300 288 H420 M560 280 H650"/></g>`),

    castle: () => wrap(`<defs>${sky("g", "#28203f", "#b5788a")}</defs>`,
      `<rect width="${W}" height="${H}" fill="url(#g)"/>${stars(25, 8)}
       <g fill="#1d1730">
         <rect x="250" y="140" width="300" height="160"/>
         <rect x="220" y="90" width="60" height="210"/><rect x="520" y="90" width="60" height="210"/><rect x="370" y="60" width="60" height="240"/>
         <path d="M215 90 L250 40 L285 90Z M515 90 L550 40 L585 90Z M365 60 L400 5 L435 60Z"/>
       </g>
       <g fill="#ffcf73" opacity=".8"><rect x="392" y="100" width="16" height="26" rx="8"/><rect x="243" y="130" width="12" height="18" rx="6"/><rect x="543" y="130" width="12" height="18" rx="6"/></g>
       <path d="M0 280 Q400 260 800 280 V300 H0Z" fill="#120e1e"/>`),

    holy: () => wrap(`<defs>${sky("g", "#1d1830", "#5b4a6e")}<radialGradient id="h" cx=".5" cy=".35" r=".55"><stop offset="0" stop-color="#ffe9a8" stop-opacity=".95"/><stop offset=".35" stop-color="#ffd36b" stop-opacity=".4"/><stop offset="1" stop-color="#ffd36b" stop-opacity="0"/></radialGradient></defs>`,
      `<rect width="${W}" height="${H}" fill="url(#g)"/>
       <rect width="${W}" height="${H}" fill="url(#h)"/>
       <g stroke="#fff3c4" stroke-width="2" opacity=".35">
         <path d="M400 105 L250 0 M400 105 L330 0 M400 105 L470 0 M400 105 L550 0 M400 105 L150 40 M400 105 L650 40"/>
       </g>
       <g fill="#2a2338">
         <path d="M380 300 L388 190 L400 175 L412 190 L420 300Z"/>
         <rect x="392" y="100" width="16" height="80"/><rect x="368" y="88" width="64" height="24" rx="4"/>
       </g>
       <path d="M0 270 Q120 250 230 268 L260 240 L280 270 Q500 255 800 272 V300 H0Z" fill="#17131f"/>`)
  };
  return { render: (theme) => (T[theme] || T.forest)() };
})();
