export default function ChartLoadingState({
  height = 260,
  className = "",
  bars = 6,
  compact = false,
}) {
  return (
    <div
      className={[
        "relative overflow-hidden rounded-2xl border border-white/10 bg-[#141414] p-4 sm:p-5",
        className,
      ].join(" ")}
      style={{ width: "100%", height }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(52,211,153,0.14),_transparent_72%)]" />
      <div className="relative flex h-full flex-col">
        <div className="flex items-center justify-between gap-3">
          <div className="ui-skeleton h-3 w-24 rounded-full bg-white/8" />
          <div className="ui-skeleton h-3 w-12 rounded-full bg-white/8" />
        </div>

        <div className="mt-4 flex-1">
          <div className="flex h-full items-end gap-2 sm:gap-3">
            {Array.from({ length: bars }).map((_, index) => {
              const heightPercent = compact
                ? 28 + ((index * 13) % 36)
                : 36 + ((index * 17) % 42);

              return (
                <div key={`chart-skeleton-${index}`} className="flex flex-1 flex-col justify-end gap-2">
                  <div
                    className="ui-skeleton rounded-t-2xl bg-white/8"
                    style={{ height: `${heightPercent}%` }}
                  />
                  <div className="ui-skeleton h-2 rounded-full bg-white/8" />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
