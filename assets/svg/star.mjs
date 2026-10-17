// Five-point star, gold with a lighter inner shine.
const points = (cx, cy, outer, inner) =>
  Array.from({ length: 10 }, (_, i) => {
    const r = i % 2 === 0 ? outer : inner;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`;
  }).join(" ");

export default ({ style, w, h }) => {
  const p = style.palette;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 100 100">
  <polygon points="${points(52, 54, 44, 20)}" fill="#000" opacity="0.2" stroke="#000" stroke-width="6" stroke-linejoin="round"/>
  <polygon points="${points(50, 52, 44, 20)}" fill="${p.gold}" stroke="${p.goldDark}" stroke-width="6" stroke-linejoin="round"/>
  <polygon points="${points(50, 52, 26, 12)}" fill="#fff" fill-opacity="0.45"/>
</svg>`;
};
