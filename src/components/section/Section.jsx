export default function Section({ title, children, action, subtitle }) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-white/50">
            {subtitle}
          </p>
          <div className="flex items-center gap-3">
            <div className="h-8 w-1 rounded-full bg-gradient-to-b from-violet-400 to-cyan-300 shadow-[0_0_12px_rgba(56,189,248,0.45)]" />
            <h2 className="text-2xl font-bold text-white drop-shadow-sm">{title}</h2>
          </div>
        </div>
        {action ? (
          <div className="flex items-center gap-2 text-xs text-white/70">{action}</div>
        ) : null}
      </div>
      <div className="rounded-2xl border border-white/5 bg-white/5 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-sm">
        {children}
      </div>
    </section>
  );
}