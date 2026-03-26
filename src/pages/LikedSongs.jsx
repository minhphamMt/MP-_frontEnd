import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getLikedSongs } from "../api/like.api";
import { getSongById } from "../api/song.api";
import FilterToolbar from "../components/common/FilterToolbar";
import { UserSurfaceRowsLoading } from "../components/common/UserLoadingState";
import LikedSongsSection from "../components/playlists/LikedSongsSection";
import usePlayerStore, { normalizeSongId } from "../store/player.store";
import { matchesAnyText } from "../utils/searchText";
import {
  fetchPlayableSong,
  filterPlayableSongs,
  hydrateSongArtists,
  toPlayableSong,
} from "../utils/song";

const getData = (payload) => payload?.data?.data ?? payload?.data ?? payload;

const extractSongsFromResponse = (payload) => {
  const sources = [
    payload?.data,
    payload?.data?.data,
    payload?.data?.songs,
    payload?.data?.data?.songs,
    payload?.songs,
    payload?.likedSongs,
    payload,
  ];
  return sources.find(Array.isArray) || [];
};

export default function LikedSongs() {
  const navigate = useNavigate();
  const [likedSongs, setLikedSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const {
    playSong,
    pause,
    resume,
    currentSong,
    isPlaying,
    setLikedSongIds,
    likedSongIds,
    toggleLike,
  } = usePlayerStore();

  const likedQueue = useMemo(() => likedSongs || [], [likedSongs]);
  const filteredLikedSongs = useMemo(
    () =>
      likedSongs.filter((song) =>
        matchesAnyText(
          [song?.title, song?.artist_name, song?.album_title, song?.album],
          keyword
        )
      ),
    [keyword, likedSongs]
  );

  const loadLikedSongsList = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getLikedSongs();
      const payload = getData(res);
      const songs = extractSongsFromResponse(payload);
      const playable = filterPlayableSongs(songs.map((song) => toPlayableSong(song)));
      setLikedSongIds(playable);
      const hydrated = await hydrateSongArtists(playable, getSongById);
      setLikedSongs(hydrated);
    } catch (err) {
      console.error("Load liked songs failed", err);
      setLikedSongs([]);
    } finally {
      setLoading(false);
    }
  }, [setLikedSongIds]);

  useEffect(() => {
    loadLikedSongsList();
  }, [loadLikedSongsList]);

  const handlePlaySong = async (song, queue = likedQueue) => {
    const prepared = toPlayableSong(song);
    const playable = (await fetchPlayableSong(prepared, getSongById)) || prepared;
    if (!playable?.audio_url) return;

    const normalizedId = normalizeSongId(playable);
    const updatedQueue = (queue || []).map((item) => {
      const itemId = normalizeSongId(item);
      return itemId && itemId === normalizedId
        ? { ...item, ...playable }
        : item;
    });

    if (normalizeSongId(currentSong) === normalizedId) {
      isPlaying ? pause() : resume();
    } else {
      playSong(playable, updatedQueue);
    }
  };

  return (
     <div className="user-page-shell min-h-screen space-y-8 px-4 py-6 sm:px-8">
      <div className="user-surface p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.35em] text-white/50">
              Thư viện
            </p>
            <h1 className="text-2xl font-extrabold text-white sm:text-3xl">
              Bài hát đã thích
            </h1>
            <p className="text-sm text-white/60">
              {likedSongs.length} bài hát được lưu
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/playlists")}
            className="user-btn-secondary px-4 py-2 text-sm font-semibold"
          >
            ← Quay lại thư viện
          </button>
        </div>
      </div>

      <FilterToolbar
        value={keyword}
        onChange={setKeyword}
        placeholder="Tìm bài hát đã thích theo tên, nghệ sĩ hoặc album"
        actions={
          keyword ? (
            <button
              type="button"
              onClick={() => setKeyword("")}
              className="user-btn-secondary px-4 py-2 text-sm font-semibold"
            >
              Xóa lọc
            </button>
          ) : null
        }
        summary={
          keyword
            ? `Có ${filteredLikedSongs.length} bài hát khớp từ khóa hiện tại.`
            : "Tìm nhanh lại những bài hát bạn đã lưu để nghe lại."
        }
      />

      <section>
        {loading ? (
          <UserSurfaceRowsLoading rows={5} />
        ) : (
          <LikedSongsSection
            songs={filteredLikedSongs}
            currentSong={currentSong}
            isPlaying={isPlaying}
            likedSongIds={likedSongIds}
            onPlay={(song) => handlePlaySong(song, filteredLikedSongs)}
            onToggleLike={toggleLike}
          />
        )}
      </section>
    </div>
  );
}
