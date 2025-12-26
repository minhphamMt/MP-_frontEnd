import { useEffect, useRef, useState } from "react";
import { getAlbums } from "../api/album.api";
import { getArtistCollections } from "../api/artist.api";
import { getRecommendations } from "../api/recommendation.api";
import { getSongById } from "../api/song.api";
import AlbumCard from "../components/album/AlbumCard";
import ArtistAlbumCard from "../components/album/ArtistAlbumCard";
import Section from "../components/section/Section";
import SongCard from "../components/song/SongCard";

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

  const scrollByAmount = (ref, direction = 1) => {
    const node = ref.current;
    if (!node) return;

    const amount = node.clientWidth * 0.7;
    node.scrollBy({ left: amount * direction, behavior: "smooth" });
  };

  const startAutoScroll = (ref, timerRef, itemCount) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    if (!ref.current || itemCount < 2) return;

    timerRef.current = setInterval(() => {
      const node = ref.current;
      if (!node) return;

      const maxScroll = node.scrollWidth - node.clientWidth;
      const next = node.scrollLeft + node.clientWidth * 0.6;

      if (next >= maxScroll - 8) {
        node.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        node.scrollBy({ left: node.clientWidth * 0.6, behavior: "smooth" });
      }
    }, 4000);
  };

  const pauseAutoScroll = (timerRef) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    startAutoScroll(artistRailRef, artistTimerRef, artistAlbums.length);

    return () => pauseAutoScroll(artistTimerRef);
  }, [artistAlbums]);

  useEffect(() => {
    startAutoScroll(newAlbumRailRef, newAlbumTimerRef, newAlbums.length);

    return () => pauseAutoScroll(newAlbumTimerRef);
  }, [newAlbums]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-sm text-white/60 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
        Đang tải trang chủ...
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <Section
        title="Gợi Ý Bài Hát"
        subtitle="Cá nhân hóa cho bạn"
        action={
          <button
            onClick={loadHome}
            className="rounded-full bg-gradient-to-r from-cyan-400 to-violet-500 px-4 py-2 text-[13px] font-semibold text-slate-950 shadow-lg shadow-cyan-400/30 transition hover:shadow-cyan-300/50"
          >
            Làm mới
          </button>
        }
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {songs.map((song) => (
            <SongCard key={song.id} song={song} queue={songs} />
          ))}
        </div>
      </Section>

      <Section title="Album Nghệ Sĩ" subtitle="Tuyển tập nổi bật">
        <div className="relative">
          <div
            ref={artistRailRef}
            onMouseEnter={() => pauseAutoScroll(artistTimerRef)}
            onMouseLeave={() => startAutoScroll(artistRailRef, artistTimerRef, artistAlbums.length)}
            className="flex gap-4 overflow-x-auto pb-2 pr-10 scroll-smooth scrollbar-hidden"
          >
            {artistAlbums.map((artist) => (
              <ArtistAlbumCard key={artist.artist_id} artist={artist} />
            ))}
          </div>

          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-1">
            <button
              onClick={() => scrollByAmount(artistRailRef, -1)}
              className="pointer-events-auto hidden h-10 w-10 items-center justify-center rounded-full bg-slate-900/80 text-white/80 shadow-lg shadow-black/40 ring-1 ring-white/10 transition hover:text-white sm:flex"
            >
              ‹
            </button>
          </div>

          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-1">
            <button
              onClick={() => scrollByAmount(artistRailRef, 1)}
              className="pointer-events-auto hidden h-10 w-10 items-center justify-center rounded-full bg-slate-900/80 text-white/80 shadow-lg shadow-black/40 ring-1 ring-white/10 transition hover:text-white sm:flex"
            >
              ›
            </button>
          </div>
        </div>
      </Section>

      <Section title="Album mới phát hành" subtitle="Ra mắt gần đây">
        <div className="relative">
          <div
            ref={newAlbumRailRef}
            onMouseEnter={() => pauseAutoScroll(newAlbumTimerRef)}
            onMouseLeave={() => startAutoScroll(newAlbumRailRef, newAlbumTimerRef, newAlbums.length)}
            className="flex gap-4 overflow-x-auto pb-2 pr-10 scroll-smooth scrollbar-hidden"
          >
            {newAlbums.map((album) => (
              <AlbumCard key={album.id} album={album} />
            ))}
          </div>

          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-1">
            <button
              onClick={() => scrollByAmount(newAlbumRailRef, -1)}
              className="pointer-events-auto hidden h-10 w-10 items-center justify-center rounded-full bg-slate-900/80 text-white/80 shadow-lg shadow-black/40 ring-1 ring-white/10 transition hover:text-white sm:flex"
            >
              ‹
            </button>
          </div>

          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-1">
            <button
              onClick={() => scrollByAmount(newAlbumRailRef, 1)}
              className="pointer-events-auto hidden h-10 w-10 items-center justify-center rounded-full bg-slate-900/80 text-white/80 shadow-lg shadow-black/40 ring-1 ring-white/10 transition hover:text-white sm:flex"
            >
              ›
            </button>
          </div>
        </div>
      </Section>
    </div>
  );
}