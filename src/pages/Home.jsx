import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getAlbums } from "../api/album.api";
import { getMyHistory } from "../api/history.api";
import { getArtistCollections } from "../api/artist.api";
import {
  getColdStartRecommendations,
  getRecommendations,
} from "../api/recommendation.api";
import { getSongById } from "../api/song.api";
import AlbumCard from "../components/album/AlbumCard";
import ArtistAlbumCard from "../components/album/ArtistAlbumCard";
import Section from "../components/section/Section";
import SongCard from "../components/song/SongCard";
import useAuthStore from "../store/auth.store";
import usePlayerStore, { normalizeSongId } from "../store/player.store";
import { resolveAssetUrl } from "../utils/asset";

export default function Home() {
  const [artistAlbums, setArtistAlbums] = useState([]);
  const [newAlbums, setNewAlbums] = useState([]);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recommendationLoading, setRecommendationLoading] = useState(false);

  const ranRef = useRef(false);
  const recommendationIdsRef = useRef([]);
  const artistRailRef = useRef(null);
  const newAlbumRailRef = useRef(null);
  const artistTimerRef = useRef(null);
  const newAlbumTimerRef = useRef(null);
  const artistResumeRef = useRef(null);
  const newAlbumResumeRef = useRef(null);
  const playSong = usePlayerStore((state) => state.playSong);
  const currentSong = usePlayerStore((state) => state.currentSong);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Chào buổi sáng";
    if (hour < 18) return "Chào buổi chiều";
    return "Chào buổi tối";
  }, []);

  const quickPicks = useMemo(() => songs.slice(0, 6), [songs]);

  const fetchRecommendedSongs = useCallback(async (seedSongId, excludeIds = []) => {
    const recRes = seedSongId
      ? await getRecommendations(seedSongId)
      : await getColdStartRecommendations(30);
    const items = recRes?.data?.data || recRes?.data || [];
    const mappedIds = items
      .map((item) => item?.songId ?? item?.song_id ?? item?.id ?? item)
      .filter(Boolean)
      .map((id) => String(id));

    const shuffledIds = [...new Set(mappedIds)].sort(() => Math.random() - 0.5);
    const excludeSet = new Set((excludeIds || []).map((id) => String(id)));
    const candidateIds = shuffledIds.filter((id) => !excludeSet.has(id));
    const selectedIds = (candidateIds.length ? candidateIds : shuffledIds).slice(0, 9);

    const songResults = await Promise.all(
      selectedIds.map(async (id) => {
        try {
          const res = await getSongById(id);
          const raw = res?.data?.data;
          if (!raw) return null;

          return {
            id: raw.id,
            title: raw.title,
            artist_name: raw.artist_name || raw.artist?.name || "",
            duration: raw.duration,
            cover_url: resolveAssetUrl(raw.cover_url),
            album_id: raw.album?.id || raw.album_id,
            album_title: raw.album?.title || raw.album_title,
            audio_url: `${import.meta.env.VITE_API_BASE_URL}${raw.audio_path}`,
          };
        } catch {
          return null;
        }
      })
    );

    return songResults.filter(Boolean);
  }, []);

  const getLastPlayedSongId = useCallback(async () => {
    if (!isAuthenticated) return null;

    try {
      const historyRes = await getMyHistory({ limit: 1 });
      const payload = historyRes?.data?.data ?? historyRes?.data ?? {};
      const items = Array.isArray(payload)
        ? payload
        : payload?.items ?? historyRes?.data?.items ?? [];
      return normalizeSongId(items?.[0]?.song || items?.[0]);
    } catch (error) {
      console.warn("Load last played song for recommendations failed", error);
      return null;
    }
  }, [isAuthenticated]);

  const getRandomHistorySongId = useCallback(async (limit = 20) => {
    if (!isAuthenticated) return null;

    try {
      const historyRes = await getMyHistory({ limit });
      const payload = historyRes?.data?.data ?? historyRes?.data ?? {};
      const items = Array.isArray(payload)
        ? payload
        : payload?.items ?? historyRes?.data?.items ?? [];
      if (!items.length) return null;
      const randomItem = items[Math.floor(Math.random() * items.length)];
      return normalizeSongId(randomItem?.song || randomItem);
    } catch (error) {
      console.warn("Load random history song for recommendations failed", error);
      return null;
    }
  }, [isAuthenticated]);

  const loadRecommendations = useCallback(
    async (seedSongId, { silent = false, forceFresh = false } = {}) => {
      if (!silent) setRecommendationLoading(true);
      try {
        const recommended = await fetchRecommendedSongs(
          seedSongId,
          forceFresh ? recommendationIdsRef.current : []
        );
        recommendationIdsRef.current = recommended.map((song) => String(song?.id)).filter(Boolean);
        setSongs(recommended);
      } catch (error) {
        console.error("Load recommendations error:", error);
      } finally {
        if (!silent) setRecommendationLoading(false);
      }
    },
    [fetchRecommendedSongs]
  );
  
  /* =======================
     LOAD HOME (GIỮ NGUYÊN)
     ======================= */
  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;
    loadHome();
  }, []);

  async function loadHome() {
    try {
      setLoading(true);

      const [artistRes, albumRes] = await Promise.all([
        getArtistCollections({ limit: 20 }),
        getAlbums({
          limit: 20,
          sort: "release_date",
          order: "desc",
        }),
      ]);
      setArtistAlbums(artistRes?.data?.data || []);
      setNewAlbums(albumRes?.data?.data || []);

      const seedSongId = isAuthenticated
        ? (await getLastPlayedSongId()) || normalizeSongId(currentSong)
        : null;
      await loadRecommendations(seedSongId, { silent: true });
    } catch (err) {
      console.error("Load home error:", err);
    } finally {
      setLoading(false);
    }
  }

  /* =======================
     AUTO SCROLL (GIỮ NGUYÊN)
     ======================= */
  const scrollForwardWithLoop = useCallback((ref, distance) => {
    const node = ref.current;
    if (!node) return;

    const maxScroll = node.scrollWidth - node.clientWidth;
    if (maxScroll <= 0) return;

   const atEnd = Math.abs(node.scrollLeft - maxScroll) < 2;
    if (atEnd) {
      node.scrollTo({ left: 0, behavior: "smooth" });
       return;
    }
      const target = Math.min(node.scrollLeft + distance, maxScroll);
    node.scrollTo({ left: target, behavior: "smooth" });
  }, []);

  const scrollByAmount = (ref, direction = 1) => {
    const node = ref.current;
    if (!node) return;

    const amount = node.clientWidth * 0.7;
  const maxScroll = node.scrollWidth - node.clientWidth;

    if (direction > 0) {
      const target = Math.min(node.scrollLeft + amount, maxScroll);
      node.scrollTo({ left: target, behavior: "smooth" });
    } else {
      const target = Math.max(node.scrollLeft - amount, 0);
      node.scrollTo({ left: target, behavior: "smooth" });
    }
  };

  const clearResumeTimeout = (resumeRef) => {
    if (resumeRef.current) {
      clearTimeout(resumeRef.current);
      resumeRef.current = null;
    }
  };

  const startAutoScroll = useCallback(
    (ref, timerRef, itemCount) => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (!ref.current || itemCount < 2) return;

      const step = () => {
        const node = ref.current;
        if (!node) return;
        scrollForwardWithLoop(ref, node.clientWidth * 0.65);
      };

      timerRef.current = setInterval(step, 3500);
    },
    [scrollForwardWithLoop]
  );

  const pauseAutoScroll = (timerRef) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const pauseAndResumeAutoScroll = (ref, timerRef, resumeRef, itemCount) => {
    pauseAutoScroll(timerRef);
    clearResumeTimeout(resumeRef);

    resumeRef.current = setTimeout(() => {
      startAutoScroll(ref, timerRef, itemCount);
    }, 1200);
  };

  useEffect(() => {
    startAutoScroll(artistRailRef, artistTimerRef, artistAlbums.length);
    return () => {
      pauseAutoScroll(artistTimerRef);
      clearResumeTimeout(artistResumeRef);
    };
  }, [artistAlbums, startAutoScroll]);

  useEffect(() => {
    startAutoScroll(newAlbumRailRef, newAlbumTimerRef, newAlbums.length);
    return () => {
      pauseAutoScroll(newAlbumTimerRef);
      clearResumeTimeout(newAlbumResumeRef);
    };
  }, [newAlbums, startAutoScroll]);

  /* =======================
     LOADING
     ======================= */
  if (loading) {
    return (
        <div className="min-h-screen bg-[#121212] p-6">
        <div className="rounded-3xl border border-[#242424] bg-[#181818] p-8 text-sm text-white/60 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
          Đang tải trang chủ...
        </div>
      </div>
    );
  }

  /* =======================
     UI
     ======================= */
  return (
      <div className="min-h-screen space-y-8 bg-[#121212] px-4 py-6 sm:space-y-14 sm:px-8">
      {/* ===== SONG RECOMMEND ===== */}
      <Section
        title="Dành cho bạn"
        subtitle="Gợi ý bài hát"
        action={
          <button
            onClick={async () => {
              const seedSongId =
                (await getRandomHistorySongId()) ||
                (await getLastPlayedSongId()) ||
                normalizeSongId(currentSong);
              await loadRecommendations(seedSongId, { forceFresh: true });
            }}
            disabled={recommendationLoading}
            className="rounded-full border border-white/10 bg-[#1f1f1f] px-3 py-1.5 text-[12px] font-semibold text-white/80 transition hover:bg-[#2a2a2a] disabled:cursor-not-allowed disabled:opacity-60 sm:px-4 sm:py-2 sm:text-[13px]"
          >
           {recommendationLoading ? "Đang làm mới..." : "Làm mới"}
          </button>
        }
      >
         <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
          {songs.map((song) => (
            <SongCard key={song.id} song={song} queue={songs} />
          ))}
        </div>
      </Section>

      {/* ===== ARTIST ALBUM ===== */}
      <Section title="Album Nghệ Sĩ" subtitle="Tuyển tập nổi bật">
        <div className="relative">
          <div
            ref={artistRailRef}
            onMouseEnter={() => pauseAutoScroll(artistTimerRef)}
            onMouseLeave={() =>
              startAutoScroll(
                artistRailRef,
                artistTimerRef,
                artistAlbums.length
              )
            }
            className="flex gap-4 overflow-x-auto pb-2 pr-10 scroll-smooth scrollbar-hidden"
          >
            {artistAlbums.map((artist) => (
  <div
                key={artist.artist_id}
                className="w-44 shrink-0 sm:w-60 lg:w-64"
              >
                <ArtistAlbumCard artist={artist} />
              </div>
            ))}

          </div>

          {/* CONTROLS */}
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-1">
            <button
              onClick={() => {
                scrollByAmount(artistRailRef, -1);
                pauseAndResumeAutoScroll(
                  artistRailRef,
                  artistTimerRef,
                  artistResumeRef,
                  artistAlbums.length
                );
              }}
              className="pointer-events-auto hidden h-10 w-10 items-center justify-center rounded-full bg-slate-900/80 text-white/80 shadow-lg ring-1 ring-white/10 transition hover:text-white sm:flex"
            >
              ‹
            </button>
          </div>

          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-1">
            <button
              onClick={() => {
                scrollByAmount(artistRailRef, 1);
                pauseAndResumeAutoScroll(
                  artistRailRef,
                  artistTimerRef,
                  artistResumeRef,
                  artistAlbums.length
                );
              }}
              className="pointer-events-auto hidden h-10 w-10 items-center justify-center rounded-full bg-slate-900/80 text-white/80 shadow-lg ring-1 ring-white/10 transition hover:text-white sm:flex"
            >
              ›
            </button>
          </div>
        </div>
      </Section>

      {/* ===== NEW ALBUM ===== */}
      <Section title="Album mới phát hành" subtitle="Ra mắt gần đây">
        <div className="relative">
          <div
            ref={newAlbumRailRef}
            onMouseEnter={() => pauseAutoScroll(newAlbumTimerRef)}
            onMouseLeave={() =>
              startAutoScroll(
                newAlbumRailRef,
                newAlbumTimerRef,
                newAlbums.length
              )
            }
            className="flex gap-4 overflow-x-auto pb-2 pr-10 scroll-smooth scrollbar-hidden"
          >
            {newAlbums.map((album) => (
              <AlbumCard key={album.id} album={album} />
            ))}
          </div>

          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-1">
            <button
              onClick={() => {
                scrollByAmount(newAlbumRailRef, -1);
                pauseAndResumeAutoScroll(
                  newAlbumRailRef,
                  newAlbumTimerRef,
                  newAlbumResumeRef,
                  newAlbums.length
                );
              }}
              className="pointer-events-auto hidden h-10 w-10 items-center justify-center rounded-full bg-slate-900/80 text-white/80 shadow-lg ring-1 ring-white/10 transition hover:text-white sm:flex"
            >
              ‹
            </button>
          </div>

          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-1">
            <button
              onClick={() => {
                scrollByAmount(newAlbumRailRef, 1);
                pauseAndResumeAutoScroll(
                  newAlbumRailRef,
                  newAlbumTimerRef,
                  newAlbumResumeRef,
                  newAlbums.length
                );
              }}
              className="pointer-events-auto hidden h-10 w-10 items-center justify-center rounded-full bg-slate-900/80 text-white/80 shadow-lg ring-1 ring-white/10 transition hover:text-white sm:flex"
            >
              ›
            </button>
          </div>
        </div>
      </Section>
    </div>
  );
}
