export default function SidebarSection({ title, children }) {
  return (
    <div className="mb-6 space-y-3">
      {title && (
        <div className="relative px-3">
          {/* Accent line */}
          <div className="absolute left-0 top-1/2 h-4 w-1 -translate-y-1/2 rounded-full bg-gradient-to-b from-cyan-300/70 to-violet-400/70 shadow-[0_0_10px_rgba(56,189,248,0.35)]" />

          {/* Title */}
          <div className="pl-3 text-[11px] uppercase tracking-[0.22em] text-white/55">
            {title}
          </div>
        </div>
      )}

      <div className="space-y-1">{children}</div>
    </div>
  );
}
