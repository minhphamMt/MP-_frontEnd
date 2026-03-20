function BrandGlyph({ className = "h-11 w-11" }) {
  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-[15px] shadow-[0_12px_28px_rgba(0,0,0,0.34)] ${className}`.trim()}
      aria-hidden="true"
    >
      <img
        src="/logo-brand.png"
        alt=""
        className="h-full w-full select-none object-cover"
        draggable="false"
      />
    </div>
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
