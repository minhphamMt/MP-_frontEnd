function SkeletonBlock({ className = "" }) {
  return <div className={`ui-skeleton ${className}`.trim()} />;
}

function SkeletonButton({ width = "w-24" }) {
  return <SkeletonBlock className={`h-10 ${width} rounded-full bg-white/8`} />;
}

function TableRowShell({ className = "", children, keyValue }) {
  return (
    <div
      key={keyValue}
      className={`admin-row-card px-4 py-4 text-sm text-white/80 ${className}`.trim()}
    >
      {children}
    </div>
  );
}

function UsersRows({ rows = 6 }) {
  return (
    <div className="divide-y divide-white/5">
      {Array.from({ length: rows }).map((_, index) => (
        <TableRowShell
          keyValue={`users-loading-${index}`}
          className="grid grid-cols-1 gap-4 lg:grid-cols-[1.2fr_1fr_0.7fr_0.8fr] lg:items-center"
        >
          <div className="flex min-w-0 items-center gap-3">
            <SkeletonBlock className="h-12 w-12 shrink-0 rounded-full bg-white/8" />
            <div className="min-w-0 flex-1 space-y-2">
              <SkeletonBlock className="h-4 w-40 max-w-[85%] rounded-full bg-white/8" />
              <SkeletonBlock className="h-3 w-20 rounded-full bg-white/8" />
              <div className="flex gap-2 lg:hidden">
                <SkeletonBlock className="h-7 w-20 rounded-full bg-white/8" />
                <SkeletonBlock className="h-7 w-24 rounded-full bg-white/8" />
              </div>
            </div>
          </div>
          <div className="hidden space-y-2 lg:block">
            <SkeletonBlock className="h-3 w-40 rounded-full bg-white/8" />
            <SkeletonBlock className="h-3 w-28 rounded-full bg-white/8" />
          </div>
          <div className="hidden lg:flex lg:justify-start">
            <SkeletonBlock className="h-8 w-24 rounded-full bg-white/8" />
          </div>
          <div className="flex justify-end">
            <SkeletonButton width="w-28" />
          </div>
        </TableRowShell>
      ))}
    </div>
  );
}

function SongsRows({ rows = 6, withSelector = false }) {
  const rowClassName = withSelector
    ? "grid grid-cols-[40px_1fr_auto] items-center gap-2 lg:grid-cols-[40px_1.5fr_1fr_0.6fr_0.9fr]"
    : "grid grid-cols-[1fr_auto] items-center gap-3 lg:grid-cols-[1.35fr_0.8fr_0.75fr_0.55fr_0.72fr]";

  return (
    <div className="divide-y divide-white/5">
      {Array.from({ length: rows }).map((_, index) => (
        <TableRowShell
          keyValue={`songs-loading-${withSelector ? "review" : "management"}-${index}`}
          className={rowClassName}
        >
          {withSelector ? (
            <div className="flex items-center justify-center">
              <SkeletonBlock className="h-4 w-4 rounded bg-white/8" />
            </div>
          ) : null}

          <div className="flex min-w-0 items-center gap-3">
            <SkeletonBlock className="h-12 w-12 shrink-0 rounded-lg bg-white/8" />
            <div className="min-w-0 flex-1 space-y-2">
              <SkeletonBlock className="h-4 w-44 max-w-[85%] rounded-full bg-white/8" />
              <SkeletonBlock className="h-3 w-28 rounded-full bg-white/8" />
            </div>
          </div>

          <div className="hidden space-y-2 lg:block">
            <SkeletonBlock className="h-3 w-36 rounded-full bg-white/8" />
            {!withSelector ? (
              <SkeletonBlock className="h-3 w-24 rounded-full bg-white/8" />
            ) : null}
          </div>

          <div className="hidden lg:block">
            <SkeletonBlock className="h-8 w-24 rounded-full bg-white/8" />
          </div>

          <div className="flex justify-end gap-2">
            <SkeletonButton width={withSelector ? "w-24" : "w-28"} />
            {withSelector ? <SkeletonButton width="w-24" /> : null}
          </div>
        </TableRowShell>
      ))}
    </div>
  );
}

function ArtistRows({ rows = 6 }) {
  return (
    <div className="divide-y divide-white/5">
      {Array.from({ length: rows }).map((_, index) => (
        <TableRowShell
          keyValue={`artists-loading-${index}`}
          className="grid grid-cols-[1fr_auto] gap-4 lg:grid-cols-[1.4fr_0.8fr_0.6fr]"
        >
          <div className="flex min-w-0 items-center gap-3">
            <SkeletonBlock className="h-12 w-12 shrink-0 rounded-full bg-white/8" />
            <div className="min-w-0 flex-1 space-y-2">
              <SkeletonBlock className="h-4 w-40 max-w-[82%] rounded-full bg-white/8" />
              <SkeletonBlock className="h-3 w-28 rounded-full bg-white/8" />
            </div>
          </div>

          <div className="hidden space-y-2 lg:block">
            <SkeletonBlock className="h-3 w-28 rounded-full bg-white/8" />
            <SkeletonBlock className="h-3 w-24 rounded-full bg-white/8" />
          </div>

          <div className="flex justify-end gap-2">
            <SkeletonButton width="w-24" />
            <SkeletonButton width="w-24" />
          </div>
        </TableRowShell>
      ))}
    </div>
  );
}

function GenreRows({ rows = 6 }) {
  return (
    <div className="divide-y divide-white/5">
      {Array.from({ length: rows }).map((_, index) => (
        <TableRowShell
          keyValue={`genres-loading-${index}`}
          className="flex items-center justify-between gap-4"
        >
          <SkeletonBlock className="h-4 w-36 rounded-full bg-white/8" />
          <SkeletonButton width="w-24" />
        </TableRowShell>
      ))}
    </div>
  );
}

function AlbumGrid({ cards = 8 }) {
  return (
    <div className="admin-collection-grid">
      {Array.from({ length: cards }).map((_, index) => (
        <article key={`albums-loading-${index}`} className="admin-collection-card">
          <SkeletonBlock className="admin-collection-cover bg-white/8" />
          <div className="space-y-3">
            <SkeletonBlock className="h-5 w-3/4 rounded-full bg-white/8" />
            <SkeletonBlock className="h-3 w-2/5 rounded-full bg-white/8" />
            <div className="flex gap-2">
              <SkeletonBlock className="h-7 w-24 rounded-full bg-white/8" />
              <SkeletonBlock className="h-7 w-16 rounded-full bg-white/8" />
            </div>
          </div>
          <div className="mt-auto flex flex-wrap gap-2 pt-2">
            <SkeletonButton width="w-24" />
            <SkeletonButton width="w-24" />
          </div>
        </article>
      ))}
    </div>
  );
}

function ArtistRequestRows({ rows = 4 }) {
  return (
    <div className="divide-y divide-white/5">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={`requests-loading-${index}`} className="px-3 py-3 sm:px-4">
          <div className="admin-row-card flex flex-col gap-4 rounded-2xl border border-white/10 bg-[#171819] px-3 py-3 sm:px-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                <SkeletonBlock className="h-7 w-24 rounded-full bg-white/8" />
                <SkeletonBlock className="h-7 w-20 rounded-full bg-white/8" />
              </div>
              <SkeletonBlock className="h-7 w-24 rounded-full bg-white/8" />
            </div>
            <div className="grid gap-3 lg:grid-cols-[1fr_0.8fr_0.8fr]">
              <div className="space-y-2">
                <SkeletonBlock className="h-4 w-40 rounded-full bg-white/8" />
                <SkeletonBlock className="h-3 w-56 max-w-full rounded-full bg-white/8" />
              </div>
              <div className="space-y-2">
                <SkeletonBlock className="h-3 w-28 rounded-full bg-white/8" />
                <SkeletonBlock className="h-3 w-20 rounded-full bg-white/8" />
              </div>
              <div className="space-y-2">
                <SkeletonBlock className="h-3 w-24 rounded-full bg-white/8" />
                <SkeletonBlock className="h-3 w-32 rounded-full bg-white/8" />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <SkeletonButton width="w-24" />
              <SkeletonButton width="w-24" />
              <SkeletonButton width="w-24" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ListeningHistoryPanel({ rows = 5 }) {
  return (
    <div className="admin-data-panel">
      <div className="admin-data-head flex flex-wrap items-center justify-between gap-3 px-5 py-4">
        <div className="space-y-2">
          <SkeletonBlock className="h-3 w-28 rounded-full bg-white/8" />
          <SkeletonBlock className="h-3 w-56 rounded-full bg-white/8" />
        </div>
        <SkeletonBlock className="h-8 w-20 rounded-full bg-white/8" />
      </div>
      <div className="divide-y divide-white/6">
        {Array.from({ length: rows }).map((_, index) => (
          <div
            key={`listening-history-loading-${index}`}
            className="admin-row-card grid gap-4 px-5 py-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(180px,0.8fr)_minmax(220px,1fr)_110px_170px] xl:items-center"
          >
            <div className="flex min-w-0 items-center gap-3">
              <SkeletonBlock className="h-14 w-14 shrink-0 rounded-2xl bg-white/8" />
              <div className="min-w-0 flex-1 space-y-2">
                <SkeletonBlock className="h-4 w-40 max-w-[85%] rounded-full bg-white/8" />
                <SkeletonBlock className="h-3 w-24 rounded-full bg-white/8" />
              </div>
            </div>
            <SkeletonBlock className="h-3 w-28 rounded-full bg-white/8" />
            <SkeletonBlock className="h-3 w-40 rounded-full bg-white/8" />
            <SkeletonBlock className="h-8 w-16 rounded-full bg-white/8" />
            <SkeletonBlock className="h-3 w-28 rounded-full bg-white/8 xl:ml-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}

function SearchHistoryPanel({ rows = 6 }) {
  return (
    <div className="admin-data-panel">
      <div className="admin-data-head flex flex-wrap items-center justify-between gap-3 px-5 py-4">
        <div className="space-y-2">
          <SkeletonBlock className="h-3 w-28 rounded-full bg-white/8" />
          <SkeletonBlock className="h-3 w-56 rounded-full bg-white/8" />
        </div>
        <SkeletonBlock className="h-8 w-20 rounded-full bg-white/8" />
      </div>
      <div className="divide-y divide-white/6">
        {Array.from({ length: rows }).map((_, index) => (
          <div
            key={`search-history-loading-${index}`}
            className="admin-row-card flex flex-col gap-4 px-5 py-4 md:flex-row md:items-center md:justify-between"
          >
            <div className="min-w-0 flex-1 space-y-3">
              <SkeletonBlock className="h-7 w-24 rounded-full bg-white/8" />
              <SkeletonBlock className="h-4 w-48 max-w-[85%] rounded-full bg-white/8" />
            </div>
            <SkeletonBlock className="h-3 w-28 rounded-full bg-white/8" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminListLoadingState({ variant = "users" }) {
  switch (variant) {
    case "users":
      return <UsersRows />;
    case "songs":
      return <SongsRows withSelector />;
    case "song-management":
      return <SongsRows />;
    case "artists":
      return <ArtistRows />;
    case "genres":
      return <GenreRows />;
    case "albums":
      return <AlbumGrid />;
    case "artist-requests":
      return <ArtistRequestRows />;
    case "listening-history":
      return <ListeningHistoryPanel />;
    case "search-history":
      return <SearchHistoryPanel />;
    default:
      return <UsersRows />;
  }
}
