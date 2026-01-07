import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getLikedSongs } from "../api/like.api";
import { getSongById } from "../api/song.api";
import LikedSongsSection from "../components/playlists/LikedSongsSection";
import usePlayerStore, { normalizeSongId } from "../store/player.store";
import { fetchPlayableSong, filterPlayableSongs, toPlayableSong } from "../utils/song";

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
  const {
    playSong,
    pause,
    resume,
    currentSong,
    isPlaying,
    likedSongIds,
    toggleLike,
  } = usePlayerStore();

  const likedQueue = useMemo(() => likedSongs || [], [likedSongs]);

  const loadLikedSongsList = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getLikedSongs();
      const payload = getData(res);
      const songs = extractSongsFromResponse(payload);
      const playable = filterPlayableSongs(songs.map((song) => toPlayableSong(song)));
      setLikedSongs(playable);
    } catch (err) {
      console.error("Load liked songs failed", err);
      setLikedSongs([]);
    } finally {
      setLoading(false);
    }
  }, []);

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
    <div className="min-h-screen space-y-8 bg-gradient-to-b from-[#0b1d3a] via-[#0c2144] to-[#08162e] px-4 py-6 sm:px-8">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl shadow-[0_20px_80px_rgba(0,0,0,0.45)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.35em] text-white/50">
              Thư viện
            </p>
            <h1 className="text-3xl font-extrabold text-white">
              Bài hát đã thích
            </h1>
            <p className="text-sm text-white/60">
              {likedSongs.length} bài hát được lưu
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/playlists")}
            className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white/80 transition hover:border-white/40 hover:text-white"
          >
            ← Quay lại thư viện
          </button>
        </div>
      </div>

      <section>
        {loading ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-white/60 backdrop-blur">
            Đang tải bài hát đã thích...
          </div>
        ) : (
          <LikedSongsSection
            songs={likedSongs}
            currentSong={currentSong}
            isPlaying={isPlaying}
            likedSongIds={likedSongIds}
            onPlay={(song) => handlePlaySong(song, likedQueue)}
            onToggleLike={toggleLike}
          />
        )}
      </section>
    </div>
  );
}