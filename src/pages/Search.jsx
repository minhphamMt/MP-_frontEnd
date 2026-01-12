import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { searchEntities } from "../api/search.api";
import AlbumCard from "../components/album/AlbumCard";
import ArtistAlbumCard from "../components/album/ArtistAlbumCard";
import Section from "../components/section/Section";
import SongRow from "../components/song/SongRow";
import { filterPlayableSongs } from "../utils/song";
import { saveSearchHistory } from "../api/search.api";
import useAuthStore from "../store/auth.store";

const normalizeArtist = (artist) => ({
  ...artist,
  artist_id: artist.artist_id ?? artist.id,
  artist_name: artist.artist_name ?? artist.name ?? artist.title,
  cover_url:
    artist.cover_url ||
    artist.avatar ||
    artist.image_url ||
    artist.thumbnail ||
    artist.image,
  song_count:
    artist.song_count ?? artist.track_count ?? artist.songs_count ?? 0,
});

const normalizeAlbum = (album) => ({
  ...album,
  title: album.title ?? album.name,
  artist_name:
    album.artist_name ?? album.artist?.name ?? album.creator?.name ?? "",
});

export default function Search() {
  const location = useLocation();
  const keyword = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return (params.get("q") || params.get("keyword") || "").trim();
  }, [location.search]);

  const [songs, setSongs] = useState([]);
  const [artists, setArtists] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(false);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    const loadResults = async () => {
      if (!keyword) {
        setSongs([]);
        setArtists([]);
        setAlbums([]);
        return;
      }

      setLoading(true);
      try {
        const res = await searchEntities({ q: keyword, limit: 30, page: 1 });
        const payload = res?.data?.data ?? res?.data ?? {};
        const items = payload?.items ?? payload;

        const rawSongs = Array.isArray(items?.songs) ? items.songs : [];
        const rawArtists = Array.isArray(items?.artists) ? items.artists : [];
        const rawAlbums = Array.isArray(items?.albums) ? items.albums : [];

        setSongs(filterPlayableSongs(rawSongs));
        setArtists(rawArtists.map(normalizeArtist));
        setAlbums(rawAlbums.map(normalizeAlbum));

        if (user?.id) {
          try {
            await saveSearchHistory(keyword, user.id);
          } catch (err) {
            console.error("Save search history error", err);
          }
        }
      } catch (err) {
        console.error("Search page error:", err);
        setSongs([]);
        setArtists([]);
        setAlbums([]);
      } finally {
        setLoading(false);
      }
    };

    loadResults();
  }, [keyword, user?.id]);

  return (
    <div className="space-y-8 pb-12">
      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#0f1d3a] via-[#0c1833] to-[#0a1329] p-6 shadow-[0_25px_70px_rgba(0,0,0,0.5)]">
        <div className="flex flex-col gap-2">
          <p className="text-[11px] uppercase tracking-[0.25em] text-white/50">
            Kết quả tìm kiếm
          </p>
          <h1 className="text-2xl font-semibold text-white sm:text-3xl">
            {keyword ? `“${keyword}”` : "Nhập từ khóa để tìm kiếm"}
          </h1>
          <p className="text-sm text-white/60">
            {loading
              ? "Đang tải dữ liệu..."
              : "Khám phá bài hát, nghệ sĩ và album phù hợp nhất."}
          </p>
        </div>
      </div>

      {!!keyword && !loading && !songs.length && !artists.length && !albums.length && (
        <div className="rounded-2xl border border-white/10 bg-[#0f1d3a] p-6 text-white/70">
          Không tìm thấy kết quả phù hợp.
        </div>
      )}

      {!!songs.length && (
        <Section title="Bài hát" subtitle="Songs">
          <div className="space-y-2">
            {songs.map((song) => (
              <SongRow key={song.id} song={song} queue={songs} />
            ))}
          </div>
        </Section>
      )}

      {!!artists.length && (
        <Section title="Nghệ sĩ" subtitle="Artists">
          <div className="flex flex-wrap gap-6">
            {artists.map((artist) => (
              <ArtistAlbumCard
                key={artist.artist_id}
                artist={artist}
              />
            ))}
          </div>
        </Section>
      )}

      {!!albums.length && (
        <Section title="Album" subtitle="Albums">
          <div className="flex flex-wrap gap-6">
            {albums.map((album) => (
              <AlbumCard key={album.id} album={album} />
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}