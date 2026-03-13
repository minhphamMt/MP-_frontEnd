import { useId } from "react";

function BrandGlyph({ className = "h-11 w-11" }) {
  const uid = useId().replace(/:/g, "");
  const shellId = `${uid}-shell`;
  const lineId = `${uid}-line`;
  const arcId = `${uid}-arc`;
  const glowId = `${uid}-glow`;

  return (
    <svg
      viewBox="0 0 52 52"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={shellId} x1="6" y1="5" x2="44" y2="47" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0B0D0C" />
          <stop offset="0.62" stopColor="#050605" />
          <stop offset="1" stopColor="#020303" />
        </linearGradient>
        <linearGradient id={lineId} x1="15" y1="13" x2="29" y2="37" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FCFFFD" />
          <stop offset="1" stopColor="#D7E8DE" />
        </linearGradient>
        <linearGradient id={arcId} x1="27" y1="14" x2="39" y2="37" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2AF598" />
          <stop offset="1" stopColor="#12B76A" />
        </linearGradient>
        <radialGradient id={glowId} cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(35 16) rotate(136) scale(16 18)">
          <stop stopColor="#2AF598" stopOpacity="0.28" />
          <stop offset="1" stopColor="#2AF598" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect
        x="2.5"
        y="2.5"
        width="47"
        height="47"
        rx="15"
        fill={`url(#${shellId})`}
        stroke="#2AF598"
        strokeOpacity="0.15"
      />
      <circle cx="34" cy="17" r="12" fill={`url(#${glowId})`} />

      <path d="M16 13.5V38.5" stroke={`url(#${lineId})`} strokeWidth="4.5" strokeLinecap="round" />
      <path d="M18.8 26L30.4 15.4" stroke={`url(#${lineId})`} strokeWidth="4.5" strokeLinecap="round" />
      <path d="M18.8 26L30.8 36.6" stroke={`url(#${lineId})`} strokeWidth="4.5" strokeLinecap="round" />

      <path
        d="M28.9 16.6C34 18 37.5 21.6 37.5 26C37.5 30.4 34 34 28.9 35.4"
        stroke={`url(#${arcId})`}
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <path
        d="M31.8 13C38.6 15.1 43 20 43 26C43 32 38.6 36.9 31.8 39"
        stroke={`url(#${arcId})`}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeOpacity="0.9"
      />

      <circle cx="39.6" cy="12.8" r="1.8" fill="#2AF598" />
    </svg>
  );
}

export default function BrandLogo({ compact = false, className = "" }) {
  if (compact) {
    return (
      <div className={`flex items-center justify-center ${className}`.trim()}>
        <BrandGlyph className="h-10 w-10 shrink-0" />
      </div>
    );
  }

  return (
    <div className={`flex min-w-0 items-center gap-3 ${className}`.trim()}>
      <BrandGlyph className="h-11 w-11 shrink-0" />

      <div className="min-w-0">
        <div className="truncate text-[15px] font-black tracking-[0.12em] text-white/97">
          Khoaluan
        </div>
        <div className="mt-1 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.36em] text-white/46">
          <span className="text-emerald-300/94">Music</span>
        </div>
      </div>
    </div>
  );
}
