import ArtistAlbumCard from "../album/ArtistAlbumCard";

export default function ArtistFollowSection({
  artists = [],
  singleRow = false,
  containerRef,
}) {
  const normalizedArtists = artists.map((artist) => ({
    ...artist,
    artist_id: artist?.artist_id ?? artist?.id ?? artist?.artistId,
    artist_name:
      artist?.artist_name ?? artist?.name ?? artist?.alias ?? "Nghệ sĩ",
    cover_url: artist?.cover_url ?? artist?.avatar_url ?? artist?.cover,
  }));

  if (!normalizedArtists.length) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-white/60 backdrop-blur">
        Chưa có nghệ sĩ nào được theo dõi.
        <br />
        Hãy khám phá để tìm nghệ sĩ bạn yêu thích 🎧
      </div>
    );
  }

  // ===== SLIDER MODE =====
  if (singleRow) {
    return (
      <div
        ref={containerRef}
        className="
            flex gap-3 overflow-x-auto pb-2 sm:gap-4
          scroll-smooth scrollbar-hidden
        "
      >
        {normalizedArtists.map((artist) => (
          <div
            key={artist.artist_id}
            // ✅ width theo breakpoint để khớp với thẻ album
            className="shrink-0 w-44 sm:w-60 lg:w-64"
          >
            <ArtistAlbumCard artist={artist} variant="rail" />
          </div>
        ))}
      </div>
    );
  }

  // ===== GRID MODE =====
  return (
    <div
      ref={containerRef}
      className="grid grid-cols-1 gap-4 min-[520px]:grid-cols-2 sm:gap-6"
    >
      {normalizedArtists.map((artist) => (
        <ArtistAlbumCard key={artist.artist_id} artist={artist} variant="grid" />
      ))}
    </div>
  );
}
