// Talisman frame, shop icons, and unique talisman emblems.
export default ({ params, style, w, h }) => {
  const p = style.palette;
  const kind = params.kind ?? "frame";

  if (kind === "frame") {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 130 112">
      <rect x="4" y="5" width="122" height="102" rx="14" fill="#000" opacity="0.38"/>
      <rect x="2" y="2" width="122" height="102" rx="14" fill="#231c3d" stroke="${p.gold}" stroke-width="2.5"/>
      <rect x="8" y="8" width="110" height="90" rx="10" fill="#18132c" stroke="${p.goldDark}" stroke-width="1" stroke-dasharray="4 3"/>
      <circle cx="14" cy="14" r="3" fill="${p.gold}" opacity="0.7"/>
      <circle cx="112" cy="14" r="3" fill="${p.gold}" opacity="0.7"/>
      <circle cx="14" cy="92" r="3" fill="${p.gold}" opacity="0.7"/>
      <circle cx="112" cy="92" r="3" fill="${p.gold}" opacity="0.7"/>
    </svg>`;
  }

  if (kind === "scroll") {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 100 100">
      <rect x="20" y="14" width="60" height="72" rx="6" fill="#f3e5c8" stroke="#b08d57" stroke-width="3"/>
      <rect x="14" y="10" width="72" height="12" rx="6" fill="${p.gold}" stroke="${p.goldDark}" stroke-width="2.5"/>
      <rect x="14" y="78" width="72" height="12" rx="6" fill="${p.gold}" stroke="${p.goldDark}" stroke-width="2.5"/>
      <path d="M32 36 H68 M32 50 H68 M32 64 H56" stroke="#7a5930" stroke-width="4" stroke-linecap="round"/>
      <circle cx="64" cy="64" r="9" fill="${p.suitH}" stroke="#8a1422" stroke-width="2"/>
    </svg>`;
  }

  if (kind === "potion") {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 100 100">
      <rect x="40" y="10" width="20" height="10" rx="3" fill="#c99a5b" stroke="#7d5828" stroke-width="2"/>
      <path d="M38 20 H62 L58 36 L82 68 Q88 86 70 90 H30 Q12 86 18 68 L42 36 Z" fill="#dff6ff" stroke="#5aa9e6" stroke-width="3"/>
      <path d="M24 62 Q50 56 76 62 L79 72 Q84 85 68 87 H32 Q16 85 21 72 Z" fill="#2ec4b6"/>
      <circle cx="42" cy="74" r="5" fill="#fff" opacity="0.6"/>
      <circle cx="58" cy="68" r="3.5" fill="#fff" opacity="0.6"/>
    </svg>`;
  }

  if (kind === "mirror") {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 100 100">
      <ellipse cx="38" cy="46" rx="22" ry="30" fill="#38bdf8" fill-opacity="0.35" stroke="${p.gold}" stroke-width="4"/>
      <ellipse cx="62" cy="54" rx="22" ry="30" fill="#bae6fd" fill-opacity="0.55" stroke="${p.gold}" stroke-width="4"/>
      <path d="M52 34 L70 50 M48 56 L66 72" stroke="#fff" stroke-width="3" stroke-linecap="round"/>
    </svg>`;
  }

  if (kind === "prism") {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 100 100">
      <polygon points="50,12 88,82 12,82" fill="#a855f7" fill-opacity="0.35" stroke="${p.gold}" stroke-width="4" stroke-linejoin="round"/>
      <polygon points="50,28 72,72 28,72" fill="#38bdf8" fill-opacity="0.55" stroke="#fff" stroke-width="2"/>
      <circle cx="50" cy="56" r="7" fill="${p.gold}"/>
    </svg>`;
  }

  if (kind === "lantern") {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 100 100">
      <path d="M38 16 H62 M44 10 H56" stroke="${p.gold}" stroke-width="4" stroke-linecap="round"/>
      <polygon points="32,24 68,24 76,74 24,74" fill="#1e293b" stroke="${p.gold}" stroke-width="3.5" stroke-linejoin="round"/>
      <circle cx="50" cy="52" r="15" fill="${p.spark}"/>
      <circle cx="50" cy="52" r="8" fill="#fff"/>
      <rect x="28" y="74" width="44" height="10" rx="4" fill="${p.goldDark}"/>
    </svg>`;
  }

  if (kind === "sword") {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 100 100">
      <polygon points="82,14 68,18 28,58 42,72 82,32" fill="#e2e8f0" stroke="#64748b" stroke-width="3" stroke-linejoin="round"/>
      <path d="M22 50 L50 78" stroke="${p.gold}" stroke-width="7" stroke-linecap="round"/>
      <path d="M30 70 L16 84" stroke="${p.strawDark}" stroke-width="8" stroke-linecap="round"/>
      <circle cx="14" cy="86" r="6" fill="${p.red}" stroke="${p.gold}" stroke-width="2"/>
    </svg>`;
  }

  if (kind === "pendulum") {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 100 100">
      <path d="M24 14 H76" stroke="${p.goldDark}" stroke-width="5" stroke-linecap="round"/>
      <line x1="50" y1="14" x2="64" y2="60" stroke="${p.gold}" stroke-width="3"/>
      <path d="M26 72 Q50 90 74 72" fill="none" stroke="#38bdf8" stroke-width="3" stroke-dasharray="5 4"/>
      <polygon points="64,46 78,64 64,82 50,64" fill="#38bdf8" stroke="${p.gold}" stroke-width="3"/>
    </svg>`;
  }

  if (kind === "compass") {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="38" fill="#1e293b" stroke="${p.gold}" stroke-width="4"/>
      <polygon points="50,16 60,50 50,84 40,50" fill="${p.red}"/>
      <polygon points="16,50 50,40 84,50 50,60" fill="${p.gold}"/>
      <circle cx="50" cy="50" r="6" fill="#fff"/>
    </svg>`;
  }

  if (kind === "scale") {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 100 100">
      <path d="M50 16 V82 M32 82 H68 M22 34 H78" stroke="${p.gold}" stroke-width="4" stroke-linecap="round"/>
      <path d="M22 34 L12 58 H32 Z M78 34 L68 58 H88 Z" fill="${p.goldDark}" stroke="${p.gold}" stroke-width="2.5" stroke-linejoin="round"/>
      <circle cx="50" cy="22" r="6" fill="${p.spark}"/>
    </svg>`;
  }

  if (kind === "hourglass") {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 100 100">
      <rect x="24" y="12" width="52" height="8" rx="4" fill="${p.gold}" stroke="${p.goldDark}" stroke-width="2"/>
      <rect x="24" y="80" width="52" height="8" rx="4" fill="${p.gold}" stroke="${p.goldDark}" stroke-width="2"/>
      <path d="M30 20 H70 L54 50 L70 80 H30 L46 50 Z" fill="#dff6ff" fill-opacity="0.3" stroke="${p.gold}" stroke-width="3" stroke-linejoin="round"/>
      <polygon points="36,76 64,76 50,56" fill="${p.spark}"/>
      <polygon points="40,34 60,34 50,46" fill="${p.spark}"/>
    </svg>`;
  }

  if (kind === "lens") {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 100 100">
      <line x1="62" y1="62" x2="86" y2="86" stroke="${p.goldDark}" stroke-width="9" stroke-linecap="round"/>
      <circle cx="42" cy="42" r="26" fill="#38bdf8" fill-opacity="0.38" stroke="${p.gold}" stroke-width="5"/>
      <path d="M30 30 Q40 22 50 28" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round"/>
    </svg>`;
  }

  // coin
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 100 100">
    <circle cx="52" cy="54" r="40" fill="#000" opacity="0.25"/>
    <circle cx="50" cy="50" r="40" fill="${p.gold}" stroke="${p.goldDark}" stroke-width="5"/>
    <circle cx="50" cy="50" r="30" fill="none" stroke="${p.goldDark}" stroke-width="2.5" stroke-dasharray="6 4"/>
    <polygon points="50,26 62,50 50,74 38,50" fill="${p.goldDark}"/>
    <polygon points="50,32 58,50 50,68 42,50" fill="#fff" opacity="0.5"/>
  </svg>`;
};
