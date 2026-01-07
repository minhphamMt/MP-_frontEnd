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

  const layoutClassName = singleRow
    ? "flex flex-nowrap gap-5 overflow-hidden pr-4"
    : "flex flex-wrap gap-5";

  return (
    <>
      {normalizedArtists.length ? (
        <div ref={containerRef} className={layoutClassName}>
          {normalizedArtists.map((artist) => (
            <ArtistAlbumCard
              key={artist.artist_id || artist.id}
              artist={artist}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-white/60 backdrop-blur">
          Chưa có nghệ sĩ nào được theo dõi.
          <br />
          Hãy khám phá để tìm nghệ sĩ bạn yêu thích 🎧
        </div>
      )}
    </>
  );
}