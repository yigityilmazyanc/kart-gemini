// Background: night sky gradient with a few fixed stars and a soft ground glow. Matches the 720x1280 play area.
export default ({ style, w, h }) => {
  const p = style.palette;
  const dots = Array.from({ length: 36 }, (_, i) => {
    const x = (i * 197 + 61) % w;
    const y = (i * 331 + 29) % (h - 160);
    const r = 1 + (i % 3);
    return `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" fill-opacity="${0.25 + (i % 4) * 0.15}"/>`;
  }).join("\n  ");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${p.skyTop}"/>
      <stop offset="1" stop-color="${p.skyBottom}"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.5" cy="1" r="0.6">
      <stop offset="0" stop-color="${p.gold}" stop-opacity="0.35"/>
      <stop offset="1" stop-color="${p.gold}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#sky)"/>
  ${dots}
  <rect y="${h * 0.6}" width="${w}" height="${h * 0.4}" fill="url(#glow)"/>
  <rect y="${h - 70}" width="${w}" height="70" fill="${p.skyTop}" fill-opacity="0.85"/>
</svg>`;
};
