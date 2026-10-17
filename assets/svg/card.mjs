// Playing card faces & card back (140x196). params.variant: "front" | "bonus" | "mult" | "steel" | "gold" | "back"
export default ({ params, style, w, h }) => {
  const p = style.palette;
  const v = params.variant ?? "front";

  if (v === "back") {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 140 196">
  <rect x="3" y="5" width="134" height="188" rx="14" fill="#000" opacity="0.35"/>
  <rect x="2" y="2" width="134" height="188" rx="14" fill="#1b1638" stroke="${p.gold}" stroke-width="3"/>
  <rect x="10" y="10" width="118" height="172" rx="10" fill="#261f4c" stroke="${p.goldDark}" stroke-width="1.5" stroke-dasharray="4 3"/>
  <g transform="translate(69 96)">
    <circle r="42" fill="none" stroke="${p.gold}" stroke-width="2" opacity="0.8"/>
    <circle r="30" fill="none" stroke="${p.goldDark}" stroke-width="1.5" stroke-dasharray="5 4"/>
    <polygon points="0,-38 33,19 -33,19" fill="none" stroke="${p.gold}" stroke-width="1.8" opacity="0.85"/>
    <polygon points="0,38 33,-19 -33,-19" fill="none" stroke="${p.gold}" stroke-width="1.8" opacity="0.85"/>
    <polygon points="0,-16 6,-5 16,0 6,5 0,16 -6,5 -16,0 -6,-5" fill="${p.gold}"/>
  </g>
</svg>`;
  }

  const themes = {
    front: { fill1: "#fcf8ee", fill2: "#efe6d2", border: "#c8b696", inner: "#dcd0b8", badge: null },
    bonus: { fill1: "#eef8ff", fill2: "#d2eafc", border: "#38a3f1", inner: "#7bc4f7", badge: "#38a3f1" },
    mult: { fill1: "#fff0f0", fill2: "#fcd8d8", border: "#e63946", inner: "#f28482", badge: "#e63946" },
    steel: { fill1: "#f0f3f8", fill2: "#d5dce6", border: "#6c7a89", inner: "#95a5a6", badge: "#6c7a89" },
    gold: { fill1: "#fffbe6", fill2: "#f7e594", border: "#e09f1f", inner: "#ffd166", badge: "#e09f1f" },
  };
  const t = themes[v] ?? themes.front;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 140 196">
  <defs>
    <linearGradient id="cf" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${t.fill1}"/>
      <stop offset="1" stop-color="${t.fill2}"/>
    </linearGradient>
  </defs>
  <rect x="4" y="6" width="132" height="186" rx="14" fill="#000" opacity="0.32"/>
  <rect x="2" y="2" width="132" height="186" rx="14" fill="url(#cf)" stroke="${t.border}" stroke-width="3.5"/>
  <rect x="9" y="9" width="118" height="172" rx="9" fill="none" stroke="${t.inner}" stroke-width="1.5"/>
  ${
    t.badge
      ? `<polygon points="68,14 75,21 68,28 61,21" fill="${t.badge}" opacity="0.35"/>
         <polygon points="68,164 75,171 68,178 61,171" fill="${t.badge}" opacity="0.35"/>`
      : ""
  }
</svg>`;
};
