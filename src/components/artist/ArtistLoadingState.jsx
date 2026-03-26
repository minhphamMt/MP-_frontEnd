function SkeletonBlock({ className = "" }) {
  return <div className={`ui-skeleton ${className}`.trim()} />;
}

export function ArtistAlbumGridLoading({ cards = 6 }) {
  return (
    <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: cards }).map((_, index) => (
        <div key={`artist-album-grid-skeleton-${index}`} className="artist-soft-card overflow-hidden p-4">
          <SkeletonBlock className="aspect-square w-full rounded-[24px] bg-white/8" />
          <div className="mt-4 space-y-3">
            <SkeletonBlock className="h-4 w-3/4 rounded-full bg-white/8" />
            <SkeletonBlock className="h-3 w-1/2 rounded-full bg-white/8" />
          </div>
          <div className="mt-4 flex gap-2">
            <SkeletonBlock className="h-9 w-24 rounded-full bg-white/8" />
            <SkeletonBlock className="h-9 w-24 rounded-full bg-white/8" />
          </div>
        </div>
      ))}
    </section>
  );
}

export function ArtistSongListLoading({ rows = 5 }) {
  return (
    <section className="artist-page-shell artist-glass overflow-hidden">
      <div className="hidden grid-cols-[2.2fr_1fr_1fr] gap-4 border-b border-white/10 bg-white/5 px-6 py-4 md:grid">
        <SkeletonBlock className="h-3 w-20 rounded-full bg-white/8" />
        <SkeletonBlock className="h-3 w-20 rounded-full bg-white/8" />
        <SkeletonBlock className="ml-auto h-3 w-20 rounded-full bg-white/8" />
      </div>
      <div className="divide-y divide-white/5">
        {Array.from({ length: rows }).map((_, index) => (
          <div
            key={`artist-song-row-skeleton-${index}`}
            className="flex flex-col gap-4 px-6 py-4 md:grid md:grid-cols-[2.2fr_1fr_1fr] md:items-center"
          >
            <div className="flex items-center gap-4">
              <SkeletonBlock className="h-14 w-14 rounded-2xl bg-white/8" />
              <div className="space-y-2">
                <SkeletonBlock className="h-4 w-40 rounded-full bg-white/8" />
                <SkeletonBlock className="h-3 w-24 rounded-full bg-white/8" />
                <SkeletonBlock className="h-3 w-32 rounded-full bg-white/8" />
              </div>
            </div>
            <div className="flex justify-start md:justify-center">
              <SkeletonBlock className="h-8 w-24 rounded-full bg-white/8" />
            </div>
            <div className="flex justify-start gap-2 md:justify-end">
              <SkeletonBlock className="h-9 w-24 rounded-full bg-white/8" />
              <SkeletonBlock className="h-9 w-24 rounded-full bg-white/8" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function ArtistProfileLoading() {
  return (
    <div className="space-y-6">
      <section className="artist-page-shell artist-glass p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-3">
            <SkeletonBlock className="h-3 w-16 rounded-full bg-white/8" />
            <SkeletonBlock className="h-8 w-44 rounded-full bg-white/8" />
            <SkeletonBlock className="h-3 w-72 max-w-full rounded-full bg-white/8" />
          </div>
          <SkeletonBlock className="h-10 w-36 rounded-full bg-white/8" />
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="artist-page-shell artist-glass p-6">
          <div className="space-y-5">
            <SkeletonBlock className="h-40 w-full rounded-[28px] bg-white/8" />
            <div className="space-y-3">
              <SkeletonBlock className="h-4 w-40 rounded-full bg-white/8" />
              <SkeletonBlock className="h-3 w-full rounded-full bg-white/8" />
              <SkeletonBlock className="h-3 w-4/5 rounded-full bg-white/8" />
            </div>
          </div>
        </section>

        <section className="artist-page-shell artist-glass p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={`artist-profile-meta-${index}`} className="artist-soft-card p-5">
                <SkeletonBlock className="h-3 w-24 rounded-full bg-white/8" />
                <SkeletonBlock className="mt-4 h-4 w-32 rounded-full bg-white/8" />
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="artist-page-shell artist-glass p-6">
        <div className="space-y-3">
          <SkeletonBlock className="h-3 w-28 rounded-full bg-white/8" />
          <SkeletonBlock className="h-24 w-full rounded-[24px] bg-white/8" />
        </div>
      </section>
    </div>
  );
}
