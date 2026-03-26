function SkeletonBlock({ className = "" }) {
  return <div className={`ui-skeleton ${className}`.trim()} />;
}

export function UserSurfaceRowsLoading({ rows = 5, showHeader = true }) {
  return (
    <div className="user-surface p-6">
      {showHeader ? (
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 space-y-3">
            <SkeletonBlock className="h-3 w-24 rounded-full bg-white/8" />
            <SkeletonBlock className="h-8 w-52 rounded-full bg-white/8" />
            <SkeletonBlock className="h-3 w-72 max-w-full rounded-full bg-white/8" />
          </div>
          <div className="flex items-center gap-2">
            <SkeletonBlock className="h-10 w-24 rounded-full bg-white/8" />
            <SkeletonBlock className="h-10 w-28 rounded-full bg-white/8" />
          </div>
        </div>
      ) : null}

      <div className={showHeader ? "mt-6 overflow-x-auto rounded-2xl border border-white/10 bg-[#121212]" : ""}>
        <div className={showHeader ? "divide-y divide-white/10" : "space-y-3"}>
          {Array.from({ length: rows }).map((_, index) => (
            <div
              key={`user-row-skeleton-${index}`}
              className={[
                showHeader
                  ? "grid grid-cols-[1fr_auto] items-center gap-3 px-4 py-3 xl:grid-cols-[48px_minmax(0,3fr)_minmax(0,2fr)_minmax(0,1fr)]"
                  : "grid grid-cols-[1fr_auto] items-center gap-3 rounded-[24px] border border-white/10 bg-[#121212] px-4 py-3",
              ].join(" ")}
            >
              {showHeader ? (
                <div className="hidden justify-center xl:flex">
                  <SkeletonBlock className="h-5 w-8 rounded-full bg-white/8" />
                </div>
              ) : null}

              <div className="flex min-w-0 items-center gap-3">
                <SkeletonBlock className="h-11 w-11 shrink-0 rounded-xl bg-white/8 sm:h-12 sm:w-12" />
                <div className="min-w-0 flex-1 space-y-2">
                  <SkeletonBlock className="h-4 w-44 max-w-[80%] rounded-full bg-white/8" />
                  <SkeletonBlock className="h-3 w-24 rounded-full bg-white/8" />
                </div>
              </div>

              <div className="hidden xl:block">
                <SkeletonBlock className="h-3 w-28 rounded-full bg-white/8" />
              </div>

              <div className="flex items-center justify-end gap-2 xl:gap-4">
                {!showHeader ? <SkeletonBlock className="hidden h-7 w-24 rounded-full bg-white/8 sm:block" /> : null}
                <SkeletonBlock className="h-8 w-8 rounded-full bg-white/8 xl:h-9 xl:w-9" />
                <SkeletonBlock className="h-8 w-8 rounded-full bg-white/8 xl:h-9 xl:w-9" />
                <SkeletonBlock className="h-8 w-8 rounded-full bg-white/8 xl:h-9 xl:w-9" />
                {showHeader ? (
                  <SkeletonBlock className="hidden h-3 w-12 rounded-full bg-white/8 xl:block" />
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function UserCardGridLoading({ cards = 5, roundCover = false }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {Array.from({ length: cards }).map((_, index) => (
        <div key={`user-card-grid-skeleton-${index}`} className="user-surface p-3 sm:p-4">
          <SkeletonBlock
            className={[
              roundCover ? "aspect-square rounded-[28px]" : "aspect-square rounded-[24px]",
              "bg-white/8",
            ].join(" ")}
          />
          <div className="mt-4 space-y-3">
            <SkeletonBlock className="h-4 w-3/4 rounded-full bg-white/8" />
            <SkeletonBlock className="h-3 w-1/2 rounded-full bg-white/8" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function UserTrashLoading({ sections = 2, rows = 3 }) {
  return (
    <div className="space-y-5">
      {Array.from({ length: sections }).map((_, sectionIndex) => (
        <section
          key={`trash-skeleton-section-${sectionIndex}`}
          className="overflow-hidden rounded-3xl border border-white/10 bg-[#131415]"
        >
          <div className="flex flex-col gap-2 border-b border-white/10 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <SkeletonBlock className="h-5 w-36 rounded-full bg-white/8" />
              <SkeletonBlock className="h-3 w-52 rounded-full bg-white/8" />
            </div>
            <SkeletonBlock className="h-3 w-16 rounded-full bg-white/8" />
          </div>

          <div className="hidden grid-cols-1 gap-3 px-4 py-3 text-[11px] uppercase tracking-[0.3em] text-white/40 sm:grid sm:grid-cols-[1.6fr_1fr_0.8fr_0.8fr]">
            <SkeletonBlock className="h-3 w-16 rounded-full bg-white/8" />
            <SkeletonBlock className="h-3 w-16 rounded-full bg-white/8" />
            <SkeletonBlock className="h-3 w-16 rounded-full bg-white/8" />
            <SkeletonBlock className="ml-auto h-3 w-16 rounded-full bg-white/8" />
          </div>

          <div className="divide-y divide-white/6">
            {Array.from({ length: rows }).map((__, rowIndex) => (
              <div
                key={`trash-skeleton-row-${sectionIndex}-${rowIndex}`}
                className="grid gap-4 px-4 py-4 sm:grid-cols-[1.6fr_1fr_0.8fr_0.8fr] sm:items-center"
              >
                <div className="space-y-2">
                  <SkeletonBlock className="h-4 w-40 rounded-full bg-white/8" />
                  <SkeletonBlock className="h-3 w-28 rounded-full bg-white/8" />
                </div>
                <SkeletonBlock className="h-3 w-24 rounded-full bg-white/8" />
                <SkeletonBlock className="h-3 w-20 rounded-full bg-white/8" />
                <div className="flex justify-start gap-2 sm:justify-end">
                  <SkeletonBlock className="h-8 w-24 rounded-full bg-white/8" />
                  <SkeletonBlock className="h-8 w-24 rounded-full bg-white/8" />
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

export function UserGenreGridLoading({ cards = 6 }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: cards }).map((_, index) => (
        <div key={`genre-grid-skeleton-${index}`} className="user-surface overflow-hidden p-4">
          <SkeletonBlock className="aspect-[16/9] rounded-[22px] bg-white/8" />
          <div className="mt-4 space-y-3">
            <SkeletonBlock className="h-4 w-1/2 rounded-full bg-white/8" />
            <SkeletonBlock className="h-3 w-3/4 rounded-full bg-white/8" />
            <div className="space-y-2 pt-1">
              <SkeletonBlock className="h-3 w-full rounded-full bg-white/8" />
              <SkeletonBlock className="h-3 w-5/6 rounded-full bg-white/8" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
