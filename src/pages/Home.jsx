import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getAlbums } from "../api/album.api";
import { getArtistCollections } from "../api/artist.api";
import { getRecommendations } from "../api/recommendation.api";
import { getSongById } from "../api/song.api";
import AlbumCard from "../components/album/AlbumCard";
import ArtistAlbumCard from "../components/album/ArtistAlbumCard";
import Section from "../components/section/Section";
import SongCard from "../components/song/SongCard";
import usePlayerStore from "../store/player.store";

export default function Home() {
  const [artistAlbums, setArtistAlbums] = useState([]);
  const [newAlbums, setNewAlbums] = useState([]);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  const ranRef = useRef(false);
  const artistRailRef = useRef(null);
  const newAlbumRailRef = useRef(null);
  const artistTimerRef = useRef(null);
  const newAlbumTimerRef = useRef(null);
  const artistResumeRef = useRef(null);
  const newAlbumResumeRef = useRef(null);
   const playSong = usePlayerStore((state) => state.playSong);
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Chào buổi sáng";
    if (hour < 18) return "Chào buổi chiều";
    return "Chào buổi tối";
  }, []);

  const quickPicks = useMemo(() => songs.slice(0, 6), [songs]);

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

      const artistRes = await getArtistCollections({ limit: 20 });
      setArtistAlbums(artistRes?.data?.data || []);

      const albumRes = await getAlbums({
        limit: 20,
        sort: "release_date",
        order: "desc",
      });
      setNewAlbums(albumRes?.data?.data || []);

      const recRes = await getRecommendations();
      const ids = recRes?.data?.data || [];

      const songResults = await Promise.all(
        ids.slice(0, 9).map(async (id) => {
          try {
            const res = await getSongById(id);
            const raw = res?.data?.data;
            if (!raw) return null;

            return {
              id: raw.id,
              title: raw.title,
              artist_name: raw.artist_name || raw.artist?.name || "",
              duration: raw.duration,
              cover_url: raw.cover_url,
              album_id: raw.album?.id || raw.album_id,
              album_title: raw.album?.title || raw.album_title,
              audio_url: `${import.meta.env.VITE_API_BASE_URL}${raw.audio_path}`,
            };
          } catch {
            return null;
          }
        })
      );

      setSongs(songResults.filter(Boolean));
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
      <div className="rounded-3xl border border-[#242424] bg-gradient-to-b from-[#1f1f1f] via-[#181818] to-[#121212] p-4 shadow-[0_18px_60px_rgba(0,0,0,0.4)] sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-white/50">
              Dành cho bạn
            </p>
            <h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl">
              {greeting}
            </h1>
          </div>
          <button
            onClick={loadHome}
            className="rounded-full border border-white/10 bg-[#1f1f1f] px-4 py-2 text-xs font-semibold text-white/80 transition hover:bg-[#2a2a2a]"
          >
            Làm mới
          </button>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {quickPicks.map((song) => (
            <button
              key={song.id}
              type="button"
              onClick={() => playSong(song, songs)}
              className="group flex items-center gap-3 overflow-hidden rounded-xl border border-[#242424] bg-[#181818] pr-4 text-left transition hover:bg-[#242424]"
            >
              <div className="relative h-16 w-16 shrink-0 overflow-hidden">
                <img
                  src={song.cover_url}
                  alt={song.title}
                  className="h-full w-full object-cover"
                />
                <span className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition group-hover:opacity-100">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1db954] text-black shadow-lg shadow-[#1db954]/40">
                    ▶
                  </span>
                </span>
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-white">
                  {song.title}
                </div>
                <div className="truncate text-xs text-white/60">
                  {song.artist_name}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
      {/* ===== SONG RECOMMEND ===== */}
      <Section
        title="Dành cho bạn"
        subtitle="Gợi ý bài hát"
        action={
          <button
            onClick={loadHome}
            className="rounded-full border border-white/10 bg-[#1f1f1f] px-3 py-1.5 text-[12px] font-semibold text-white/80 transition hover:bg-[#2a2a2a] sm:px-4 sm:py-2 sm:text-[13px]"
          >
            Làm mới
          </button>
        }
      >
        <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-3">
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
