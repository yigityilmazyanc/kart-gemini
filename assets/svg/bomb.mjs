// Round black bomb with a fuse and a spark.
export default ({ style, w, h }) => {
  const p = style.palette;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 100 100">
  <circle cx="48" cy="60" r="34" fill="#000" opacity="0.2" transform="translate(3 3)"/>
  <circle cx="48" cy="60" r="34" fill="${p.ink}"/>
  <rect x="38" y="20" width="20" height="14" rx="3" fill="#555a78"/>
  <path d="M50 22 Q58 8 72 12" fill="none" stroke="#c9b28a" stroke-width="4" stroke-linecap="round"/>
  <g transform="translate(74 12)">
    <polygon points="0,-12 3,-3 12,0 3,3 0,12 -3,3 -12,0 -3,-3" fill="${p.spark}"/>
    <polygon points="0,-6 1.5,-1.5 6,0 1.5,1.5 0,6 -1.5,1.5 -6,0 -1.5,-1.5" fill="#fff"/>
  </g>
  <ellipse cx="36" cy="48" rx="9" ry="6" fill="#fff" fill-opacity="0.35" transform="rotate(-35 36 48)"/>
  <path d="M38 62 L58 62 M48 52 L48 72" stroke="${p.red}" stroke-width="5" stroke-linecap="round" opacity="0.9" transform="rotate(45 48 62)"/>
</svg>`;
};
