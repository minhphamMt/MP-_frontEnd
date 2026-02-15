import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { searchEntities } from "../api/search.api";
import AlbumCard from "../components/album/AlbumCard";
import ArtistAlbumCard from "../components/album/ArtistAlbumCard";
import SongRow from "../components/song/SongRow";
import { filterPlayableSongs } from "../utils/song";
import { saveSearchHistory } from "../api/search.api";
import useAuthStore from "../store/auth.store";
import { resolveAssetUrl } from "../utils/asset";
import OptimizedImage from "../components/common/OptimizedImage";

const normalizeArtist = (artist) => ({
  ...artist,
  artist_id: artist.artist_id ?? artist.id,
  artist_name: artist.artist_name ?? artist.name ?? artist.title,
  cover_url:
    artist.cover_url ||
    artist.avatar_url ||
    artist.avatar ||
    artist.image_url ||
    artist.thumbnail_m ||
    artist.thumbnail ||
    artist.image ||
    artist.cover,
  song_count:
    artist.song_count ?? artist.track_count ?? artist.songs_count ?? 0,
});

const normalizeAlbum = (album) => ({
  ...album,
  title: album.title ?? album.name,
  artist_name:
    album.artist_name ?? album.artist?.name ?? album.creator?.name ?? "",
});
const SEARCH_TABS = [
 { id: "all", label: "All" },
  { id: "songs", label: "Songs" },
  { id: "albums", label: "Albums" },
  { id: "artists", label: "Artists" },
];

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
  const [activeTab, setActiveTab] = useState("all");
  const user = useAuthStore((state) => state.user);

  const topResult = useMemo(() => {
    if (activeTab !== "all") {
      return null;
    }
    if (songs.length) {
      return {
        type: "Song",
        title: songs[0].title,
        subtitle: songs[0].artist_name,
        image: songs[0].cover_url,
      };
    }
    if (artists.length) {
      return {
        type: "Artist",
        title: artists[0].artist_name,
        subtitle: "Nghệ sĩ",
        image: artists[0].cover_url,
        isArtist: true,
      };
    }
    if (albums.length) {
      return {
        type: "Album",
        title: albums[0].title,
        subtitle: albums[0].artist_name,
        image: albums[0].cover_url,
      };
    }
    return null;
  }, [activeTab, albums, artists, songs]);

  const hasResultsForTab = useMemo(() => {
    if (activeTab === "songs") {
      return songs.length > 0;
    }
    if (activeTab === "artists") {
      return artists.length > 0;
    }
    if (activeTab === "albums") {
      return albums.length > 0;
    }
    return songs.length > 0 || artists.length > 0 || albums.length > 0;
  }, [activeTab, albums.length, artists.length, songs.length]);

  useEffect(() => {
    setActiveTab("all");
  }, [keyword]);

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
    <div className="min-h-screen space-y-6 overflow-x-hidden bg-[#121212] px-3 py-5 pb-12 sm:space-y-8 sm:px-8 sm:py-6">
      <div className="flex flex-col gap-4">
        <div className="space-y-2">
          <p className="text-[11px] uppercase tracking-[0.2em] text-white/50 sm:tracking-[0.25em]">
            Kết quả tìm kiếm
          </p>
          <h1 className="text-2xl font-semibold text-white sm:text-3xl">
            {keyword ? `“${keyword}”` : "Nhập từ khóa để tìm kiếm"}
          </h1>
          <p className="hidden text-sm text-white/60 sm:block">
            {loading
              ? "Đang tải dữ liệu..."
              : "Khám phá bài hát, nghệ sĩ và album phù hợp nhất."}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {SEARCH_TABS.map((tab) => {
            const isActive = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                  isActive
                    ? "bg-white text-black"
                    : "bg-[#2a2a2a] text-white/80 hover:bg-[#333]"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {!!keyword && !loading && !hasResultsForTab && (
        <div className="rounded-2xl border border-white/5 bg-[#181818] p-6 text-white/70">
          Không tìm thấy kết quả phù hợp.
        </div>
      )}

      {!!keyword && (songs.length || artists.length || albums.length) && (
        <>
          {activeTab === "all" && (
            <div className="grid w-full max-w-full gap-6 lg:grid-cols-[1.05fr_1.95fr]">
              <div className="hidden lg:block">
                <h2 className="mb-3 text-lg font-semibold text-white">
                  Top result
                </h2>
                <div className="rounded-2xl border border-white/5 bg-[#181818] p-5 transition hover:bg-[#202020]">
                  {topResult ? (
                    <div className="space-y-4">
                      {topResult.image ? (
                        <OptimizedImage
                          src={resolveAssetUrl(topResult.image)}
                          alt={topResult.title}
                          className={`h-28 w-28 object-cover ${
                            topResult.isArtist ? "rounded-full" : "rounded-lg"
                          }`}
                        />
                      ) : (
                        <div
                          className={`flex h-28 w-28 items-center justify-center bg-[#2a2a2a] text-xs text-white/60 ${
                            topResult.isArtist ? "rounded-full" : "rounded-lg"
                          }`}
                        >
                          No image
                        </div>
                      )}
                      <div>
                        <h3 className="text-xl font-semibold text-white">
                          {topResult.title}
                        </h3>
                        <div className="mt-2 flex items-center gap-2 text-xs text-white/60">
                          <span className="rounded-full bg-[#2a2a2a] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70">
                            {topResult.type}
                          </span>
                          <span className="truncate">{topResult.subtitle}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-white/60">
                      Chưa có kết quả để hiển thị.
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h2 className="mb-3 text-lg font-semibold text-white">Songs</h2>
               <div className="w-full max-w-[100%] overflow-x-hidden rounded-2xl border border-white/5 bg-[#181818] p-2 sm:p-3">
                  {songs.length ? (
                    <div className="w-full min-w-0 space-y-1">
                      {songs.slice(0, 5).map((song) => (
                        <SongRow key={song.id} song={song} queue={songs} />
                      ))}
                    </div>
                  ) : (
                    <div className="px-3 py-4 text-sm text-white/60">
                      Chưa có bài hát phù hợp.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "songs" && (
            <div>
              <h2 className="mb-3 text-lg font-semibold text-white">Songs</h2>
              <div className="w-full max-w-full overflow-hidden rounded-2xl border border-white/5 bg-[#181818] p-3">
                {songs.length ? (
                  <div className="space-y-1">
                    {songs.map((song) => (
                      <SongRow key={song.id} song={song} queue={songs} />
                    ))}
                  </div>
                ) : (
                  <div className="px-3 py-4 text-sm text-white/60">
                    Chưa có bài hát phù hợp.
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {!!artists.length && (activeTab === "all" || activeTab === "artists") && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Artists</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
            {artists.map((artist) => (
              <ArtistAlbumCard
                key={artist.artist_id}
                artist={artist}
                variant="library"
              />
            ))}
          </div>
        </div>
      )}

      {!!albums.length && (activeTab === "all" || activeTab === "albums") && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Albums</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
            {albums.map((album) => (
              <AlbumCard key={album.id} album={album} variant="library" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
