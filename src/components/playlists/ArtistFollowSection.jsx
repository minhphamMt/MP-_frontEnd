export default function ArtistFollowSection({ artists = [] }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-white/50">
            Nghệ sĩ theo dõi
          </p>
          <h3 className="text-xl font-bold text-white">Bạn đang quan tâm</h3>
        </div>
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/70">
          {artists.length} nghệ sĩ
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {artists.slice(0, 6).map((artist) => (
          <div
            key={artist.artist_id}
            className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3"
          >
            <img
              src={artist.cover_url}
              alt={artist.artist_name}
              className="h-14 w-14 rounded-full object-cover"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">
                {artist.artist_name}
              </p>
              <p className="text-xs text-white/60">{artist.song_count} bài hát</p>
            </div>
          </div>
        ))}

        {!artists.length && (
          <p className="col-span-2 text-sm text-white/60">
            Chưa có nghệ sĩ nào được theo dõi. Hãy khám phá trang chủ để tìm nghệ sĩ yêu thích.
          </p>
        )}
      </div>
    </div>
  );
}