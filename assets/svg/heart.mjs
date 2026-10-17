// Crimson alchemy heart seal emblem for vouchers and talismans.
const PATH = "M50 90 C22 68 6 50 6 32 C6 16 18 6 31 6 C41 6 47 12 50 19 C53 12 59 6 69 6 C82 6 94 16 94 32 C94 50 78 68 50 90 Z";

export default ({ style, w, h }) => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 100 100">
  <path d="${PATH}" fill="#000" opacity="0.25" transform="translate(2 4)"/>
  <path d="${PATH}" fill="${style.palette.red}"/>
  <path d="${PATH}" fill="none" stroke="#fff" stroke-opacity="0.4" stroke-width="3" transform="translate(50 50) scale(0.78) translate(-50 -50)"/>
</svg>`;
