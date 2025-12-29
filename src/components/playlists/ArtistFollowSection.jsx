export default function ArtistFollowSection({ artists = [] }) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 shadow-[0_20px_70px_rgba(0,0,0,0.45)]">
      {/* BACKGROUND GLOW */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-green-400/15 blur-3xl" />

      {/* HEADER */}
      <div className="relative z-10 flex items-center justify-between gap-2">
        <div>
          <p className="text-[11px] uppercase tracking-[0.35em] text-white/50">
            Nghệ sĩ theo dõi
          </p>
          <h3 className="text-xl font-bold text-white">Bạn đang quan tâm</h3>
        </div>

        <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/70">
          {artists.length} nghệ sĩ
        </span>
      </div>

      {/* LIST */}
      <div className="relative z-10 mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {artists.slice(0, 6).map((artist) => (
          <div
            key={artist.artist_id}
            className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 shadow-md transition
                       hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/10 hover:shadow-lg"
          >
            {/* AVATAR */}
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full">
              <img
                src={artist.cover_url}
                alt={artist.artist_name}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
              />
            </div>

            {/* INFO */}
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">
                {artist.artist_name}
              </p>
              <p className="mt-0.5 text-xs text-white/60">
                {artist.song_count} bài hát
              </p>
            </div>
          </div>
        ))}

        {/* EMPTY */}
        {!artists.length && (
          <div className="col-span-full rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-sm text-white/60">
            Chưa có nghệ sĩ nào được theo dõi.  
            <br />
            Hãy khám phá để tìm nghệ sĩ bạn yêu thích 🎧
          </div>
        )}
      </div>
    </div>
  );
}
