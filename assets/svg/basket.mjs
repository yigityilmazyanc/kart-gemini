// Woven basket seen from the front, opening at the top (catch zone = the top ~40 px).
export default ({ style, w, h }) => {
  const p = style.palette;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 180 110">
  <defs>
    <pattern id="weave" width="14" height="14" patternUnits="userSpaceOnUse">
      <path d="M0 14 L14 0 M-3 3 L3 -3 M11 17 L17 11" stroke="${p.strawDark}" stroke-width="2.4" opacity="0.7"/>
    </pattern>
  </defs>
  <path d="M14 24 L166 24 L146 100 Q144 106 136 106 L44 106 Q36 106 34 100 Z" fill="#000" opacity="0.2" transform="translate(3 4)"/>
  <path d="M14 24 L166 24 L146 100 Q144 106 136 106 L44 106 Q36 106 34 100 Z" fill="${p.straw}"/>
  <path d="M14 24 L166 24 L146 100 Q144 106 136 106 L44 106 Q36 106 34 100 Z" fill="url(#weave)"/>
  <ellipse cx="90" cy="24" rx="78" ry="14" fill="${p.strawDark}"/>
  <ellipse cx="90" cy="25" rx="70" ry="9" fill="#3a2410"/>
  <path d="M12 24 Q90 4 168 24" fill="none" stroke="${p.straw}" stroke-width="7" stroke-linecap="round"/>
  <path d="M20 22 Q90 8 160 22" fill="none" stroke="#fff" stroke-opacity="0.3" stroke-width="2"/>
</svg>`;
};
