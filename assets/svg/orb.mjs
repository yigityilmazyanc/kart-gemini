// Mystic philosopher's orb emblem with arcane rings and core spark.
export default ({ style, w, h }) => {
  const p = style.palette;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 100 100">
  <circle cx="52" cy="54" r="36" fill="#000" opacity="0.25"/>
  <circle cx="50" cy="50" r="35" fill="#2b194d" stroke="${p.gold}" stroke-width="4"/>
  <ellipse cx="50" cy="50" rx="44" ry="15" fill="none" stroke="${p.gold}" stroke-width="3" transform="rotate(-25 50 50)"/>
  <polygon points="50,26 57,43 74,50 57,57 50,74 43,57 26,50 43,43" fill="${p.spark}"/>
  <circle cx="50" cy="50" r="8" fill="#fff"/>
</svg>`;
};
