// Royal alchemy crown emblem for talismans and victory screens.
export default ({ style, w, h }) => {
  const p = style.palette;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 100 100">
  <path d="M12 76 L20 30 L38 52 L50 22 L62 52 L80 30 L88 76 Z" fill="#000" opacity="0.25" transform="translate(2 4)"/>
  <path d="M12 76 L20 30 L38 52 L50 22 L62 52 L80 30 L88 76 Z" fill="${p.gold}" stroke="${p.goldDark}" stroke-width="4" stroke-linejoin="round"/>
  <rect x="14" y="74" width="72" height="12" rx="4" fill="${p.goldDark}"/>
  <circle cx="50" cy="56" r="7" fill="${p.red}"/>
  <circle cx="30" cy="60" r="5" fill="#38a3f1"/>
  <circle cx="70" cy="60" r="5" fill="#2a9d8f"/>
</svg>`;
};
