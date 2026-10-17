// Alchemical card table background (1280x720): deep indigo-emerald velvet felt, golden arcane circles, corner ornaments.
export default ({ style, w, h }) => {
  const p = style.palette;
  const cx = 730;
  const cy = 365;
  const stars = Array.from({ length: 28 }, (_, i) => {
    const x = (i * 173 + 89) % w;
    const y = (i * 251 + 43) % h;
    const r = 1 + (i % 2) * 0.8;
    return `<circle cx="${x}" cy="${y}" r="${r}" fill="${p.gold}" fill-opacity="${0.12 + (i % 3) * 0.06}"/>`;
  }).join("\n  ");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <radialGradient id="felt" cx="0.57" cy="0.5" r="0.65">
      <stop offset="0" stop-color="${p.feltLight}"/>
      <stop offset="0.65" stop-color="${p.feltMid}"/>
      <stop offset="1" stop-color="${p.bgDark}"/>
    </radialGradient>
    <linearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${p.gold}"/>
      <stop offset="1" stop-color="${p.goldDark}"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#felt)"/>
  ${stars}
  <!-- Left sidebar backdrop -->
  <rect x="16" y="16" width="316" height="${h - 32}" rx="18" fill="${p.panelDark}" fill-opacity="0.88" stroke="${p.goldDark}" stroke-width="2" stroke-opacity="0.55"/>
  <!-- Top talisman shelf backdrop -->
  <rect x="348" y="16" width="${w - 364}" height="132" rx="16" fill="${p.panelDark}" fill-opacity="0.78" stroke="${p.goldDark}" stroke-width="2" stroke-opacity="0.45"/>
  <!-- Arcane circle on the play table -->
  <g transform="translate(${cx} ${cy})" opacity="0.22">
    <circle r="155" fill="none" stroke="url(#goldGrad)" stroke-width="2.5" stroke-dasharray="8 6"/>
    <circle r="132" fill="none" stroke="url(#goldGrad)" stroke-width="1.5"/>
    <polygon points="0,-130 112,65 -112,65" fill="none" stroke="url(#goldGrad)" stroke-width="1.5"/>
    <polygon points="0,130 112,-65 -112,-65" fill="none" stroke="url(#goldGrad)" stroke-width="1.5"/>
    <circle r="48" fill="none" stroke="url(#goldGrad)" stroke-width="2"/>
  </g>
  <!-- Outer frame border -->
  <rect x="6" y="6" width="${w - 12}" height="${h - 12}" rx="20" fill="none" stroke="${p.goldDark}" stroke-width="2" stroke-opacity="0.35"/>
</svg>`;
};
