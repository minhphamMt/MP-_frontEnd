import ArtistAlbumCard from "../album/ArtistAlbumCard";

export default function ArtistFollowSection({
  artists = [],
  singleRow = false,
  containerRef,
  cardVariant = "grid",
  gridClassName,
}) {
  const isLibrary = cardVariant === "library";
  const normalizedArtists = artists.map((artist) => ({
    ...artist,
    artist_id: artist?.artist_id ?? artist?.id ?? artist?.artistId,
    artist_name: artist?.artist_name ?? artist?.name ?? artist?.alias ?? "Nghệ sĩ",
    cover_url: artist?.cover_url ?? artist?.avatar_url ?? artist?.cover,
  }));

  if (!normalizedArtists.length) {
    return (
      <div className={isLibrary ? "user-surface p-6 text-sm text-white/60" : "user-page-shell p-6 text-sm text-white/60"}>
        Chưa có nghệ sĩ nào được theo dõi.
        <br />
        Hãy khám phá để tìm nghệ sĩ bạn yêu thích.
      </div>
    );
  }

  if (singleRow) {
    return (
      <div ref={containerRef} className="scrollbar-hidden flex gap-3 overflow-x-auto pb-2 sm:gap-4 scroll-smooth">
        {normalizedArtists.map((artist) => (
          <div key={artist.artist_id} className="w-44 shrink-0 sm:w-60 lg:w-64">
            <ArtistAlbumCard artist={artist} variant="rail" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div ref={containerRef} className={gridClassName || "grid min-[520px]:grid-cols-2 grid-cols-1 gap-4 sm:gap-6"}>
      {normalizedArtists.map((artist) => (
        <ArtistAlbumCard key={artist.artist_id} artist={artist} variant={cardVariant} />
      ))}
    </div>
  );
}
