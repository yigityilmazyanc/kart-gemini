// Suit emblems (64x64): params.suit = "H" (Kupa), "D" (Karo), "S" (Maça), "C" (Sinek)
export default ({ params, style, w, h }) => {
  const p = style.palette;
  const s = params.suit ?? "H";

  if (s === "H") {
    const d = "M50 88 C22 66 8 49 8 31 C8 16 19 7 32 7 C41 7 47 13 50 20 C53 13 59 7 68 7 C81 7 92 16 92 31 C92 49 78 66 50 88 Z";
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 100 100">
      <path d="${d}" fill="#000" opacity="0.2" transform="translate(2 3)"/>
      <path d="${d}" fill="${p.suitH}" stroke="#9e1929" stroke-width="3"/>
      <ellipse cx="34" cy="27" rx="9" ry="6" fill="#fff" opacity="0.35" transform="rotate(-25 34 27)"/>
    </svg>`;
  }

  if (s === "D") {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 100 100">
      <polygon points="52,9 90,52 52,95 14,52" fill="#000" opacity="0.2"/>
      <polygon points="50,6 88,50 50,94 12,50" fill="${p.suitD}" stroke="#b85d00" stroke-width="3" stroke-linejoin="round"/>
      <polygon points="50,18 74,50 50,82 26,50" fill="#fff" opacity="0.22"/>
    </svg>`;
  }

  if (s === "S") {
    const d = "M50 8 C78 34 90 50 90 64 C90 77 80 85 68 85 C60 85 55 81 52 75 L58 94 L42 94 L48 75 C45 81 40 85 32 85 C20 85 10 77 10 64 C10 50 22 34 50 8 Z";
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 100 100">
      <path d="${d}" fill="#000" opacity="0.22" transform="translate(2 3)"/>
      <path d="${d}" fill="${p.suitS}" stroke="#121629" stroke-width="3" stroke-linejoin="round"/>
      <ellipse cx="38" cy="52" rx="7" ry="11" fill="#fff" opacity="0.22" transform="rotate(20 38 52)"/>
    </svg>`;
  }

  // Sinek (C)
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 100 100">
    <g fill="#000" opacity="0.2" transform="translate(2 3)">
      <circle cx="50" cy="29" r="21"/>
      <circle cx="29" cy="58" r="21"/>
      <circle cx="71" cy="58" r="21"/>
      <polygon points="46,62 54,62 60,93 40,93"/>
    </g>
    <g fill="${p.suitC}" stroke="#0f5238" stroke-width="2.5">
      <circle cx="50" cy="29" r="21"/>
      <circle cx="29" cy="58" r="21"/>
      <circle cx="71" cy="58" r="21"/>
      <polygon points="46,60 54,60 60,93 40,93" stroke-linejoin="round"/>
    </g>
    <circle cx="43" cy="22" r="6" fill="#fff" opacity="0.28"/>
  </svg>`;
};
