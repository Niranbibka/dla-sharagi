export default function HeroSculpture() {
  return (
    <svg
      viewBox="0 0 480 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="hero-sculpture"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="hero-halo">
          <stop stopColor="#F16D24" stopOpacity=".16" />
          <stop offset=".62" stopColor="#B94A16" stopOpacity=".05" />
          <stop offset="1" stopColor="#111110" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="hero-copper" x1="-120" y1="-150" x2="120" y2="165" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFCA8A" />
          <stop offset=".12" stopColor="#FFAB55" />
          <stop offset=".32" stopColor="#F8822A" />
          <stop offset=".54" stopColor="#FF9D42" />
          <stop offset=".72" stopColor="#E55D13" />
          <stop offset="1" stopColor="#B73C08" />
        </linearGradient>
        <linearGradient id="hero-sides" x1="-100" y1="-100" x2="115" y2="140" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F69B49" />
          <stop offset=".24" stopColor="#B64A13" />
          <stop offset=".55" stopColor="#79300E" />
          <stop offset=".83" stopColor="#9B3D0C" />
          <stop offset="1" stopColor="#50200C" />
        </linearGradient>
        <linearGradient id="hero-edge" x1="-130" y1="-130" x2="130" y2="140" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFE0B4" stopOpacity=".95" />
          <stop offset=".5" stopColor="#FFB86C" stopOpacity=".4" />
          <stop offset="1" stopColor="#FF9B46" stopOpacity=".1" />
        </linearGradient>
        <radialGradient id="hero-reflection" cx="0" cy="0" r="1" gradientTransform="translate(-67 -91) rotate(55) scale(120 39)" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFF1D4" stopOpacity=".55" />
          <stop offset="1" stopColor="#FFCA8C" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="hero-grid-fade">
          <stop stopColor="white" stopOpacity=".55" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </radialGradient>
        <pattern id="hero-grid" width="42" height="42" patternUnits="userSpaceOnUse">
          <path d="M42 0H0V42" stroke="#91816B" strokeOpacity=".2" strokeWidth=".65" />
        </pattern>
        <mask id="hero-grid-mask">
          <rect width="480" height="400" fill="url(#hero-grid-fade)" />
        </mask>
        <filter id="hero-ground-shadow" x="-50%" y="-200%" width="200%" height="500%">
          <feGaussianBlur stdDeviation="13" />
        </filter>
        <filter id="hero-object-shadow" x="-55%" y="-45%" width="210%" height="220%">
          <feDropShadow dx="10" dy="27" stdDeviation="16" floodColor="#000" floodOpacity=".58" />
        </filter>
        <path id="hero-star" d="M138-30H51.96L94.98-104.51L43.02-134.51L0-60L-43.02-134.51L-94.98-104.51L-51.96-30H-138V30H-51.96L-94.98 104.51L-43.02 134.51L0 60L43.02 134.51L94.98 104.51L51.96 30H138V-30Z" />
        <clipPath id="hero-face-clip">
          <use href="#hero-star" />
        </clipPath>
      </defs>

      <ellipse cx="263" cy="195" rx="216" ry="192" fill="url(#hero-halo)" />
      <g mask="url(#hero-grid-mask)">
        <path d="M30 45H450V365H30Z" fill="url(#hero-grid)" transform="rotate(-12 240 200)" />
      </g>
      <path d="M92 86H108M100 78V94M382 300H398M390 292V308" stroke="#AB8A6A" strokeOpacity=".29" strokeWidth=".8" />
      <ellipse cx="266" cy="338" rx="114" ry="12" fill="#000" opacity=".7" filter="url(#hero-ground-shadow)" />

      <g transform="translate(245 183) rotate(-20) skewX(-9) scale(1 .89)" filter="url(#hero-object-shadow)">
        <use href="#hero-star" transform="translate(12 27)" fill="url(#hero-sides)" stroke="url(#hero-sides)" strokeWidth="10" strokeLinejoin="round" />
        <use href="#hero-star" transform="translate(10 23)" fill="url(#hero-sides)" stroke="url(#hero-sides)" strokeWidth="10" strokeLinejoin="round" />
        <use href="#hero-star" transform="translate(8 18)" fill="url(#hero-sides)" stroke="url(#hero-sides)" strokeWidth="10" strokeLinejoin="round" />
        <use href="#hero-star" transform="translate(6 13)" fill="url(#hero-sides)" stroke="url(#hero-sides)" strokeWidth="10" strokeLinejoin="round" />
        <use href="#hero-star" transform="translate(3 7)" fill="url(#hero-sides)" stroke="url(#hero-sides)" strokeWidth="10" strokeLinejoin="round" />
        <use href="#hero-star" fill="url(#hero-copper)" stroke="url(#hero-copper)" strokeWidth="10" strokeLinejoin="round" />
        <g clipPath="url(#hero-face-clip)">
          <ellipse cx="-51" cy="-69" rx="145" ry="116" fill="url(#hero-reflection)" />
          <path d="M-166-93L-90-155L139 90L68 143Z" fill="#FFB967" opacity=".055" />
          <path d="M-150 65L68-154" stroke="#FFE0AE" strokeOpacity=".07" strokeWidth="28" />
        </g>
        <use href="#hero-star" stroke="url(#hero-edge)" strokeWidth="1.3" strokeLinejoin="round" transform="scale(1.018)" />
        <path d="M-138-29H-51.96L-94.98-104.51M1-60L43.02-134.51" stroke="#FFE0B3" strokeOpacity=".45" strokeWidth="1.3" strokeLinecap="round" />
      </g>

      <circle cx="365" cy="100" r="3" fill="#D67435" opacity=".65" />
      <circle cx="104" cy="282" r="2" fill="#D67435" opacity=".35" />
    </svg>
  );
}
