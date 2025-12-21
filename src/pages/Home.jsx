import { useEffect, useRef, useState } from "react";

import { getRecommendations } from "../api/recommendation.api";
import { getSongById } from "../api/song.api";
import { getAlbums } from "../api/album.api";
import { getArtistCollections } from "../api/artist.api";

import Section from "../components/section/Section";
import AlbumCard from "../components/album/AlbumCard";
import ArtistAlbumCard from "../components/album/ArtistAlbumCard";
import SongCard from "../components/song/SongCard";

export default function Home() {
  const [artistAlbums, setArtistAlbums] = useState([]);
  const [newAlbums, setNewAlbums] = useState([]);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;
    loadHome();
  }, []);

  async function loadHome() {
    try {
      setLoading(true);

      /* ======================
       * 1️⃣ ALBUM NGHỆ SĨ (VIRTUAL)
       * ====================== */
      const artistRes = await getArtistCollections({ limit: 8 });
      setArtistAlbums(artistRes?.data?.data || []);

      /* ======================
       * 2️⃣ ALBUM MỚI PHÁT HÀNH
       * ====================== */
      const albumRes = await getAlbums({
        limit: 8,
        sort: "release_date",
        order: "desc",
      });
      setNewAlbums(albumRes?.data?.data || []);

      /* ======================
       * 3️⃣ GỢI Ý BÀI HÁT
       * ====================== */
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

  if (loading) {
    return (
      <div className="p-4 text-sm text-white/60">
        Đang tải trang chủ...
      </div>
    );
  }

  return (
    <div className="space-y-10">
        {/* ===== GỢI Ý BÀI HÁT ===== */}
      <Section
        title="Gợi Ý Bài Hát"
        action={
          <button
            onClick={loadHome}
            className="text-xs px-3 py-1 rounded bg-green-500"
          >
            Làm mới
          </button>
        }
      >
        <div className="grid grid-cols-3 gap-4">
          {songs.map((song) => (
            <SongCard
              key={song.id}
              song={song}
              queue={songs}
            />
          ))}
        </div>
      </Section>
      {/* ===== ALBUM NGHỆ SĨ ===== */}
      <Section title="Album Nghệ Sĩ">
        <div className="flex gap-4 overflow-x-auto">
          {artistAlbums.map((artist) => (
            <ArtistAlbumCard
              key={artist.artist_id}
              artist={artist}
            />
          ))}
        </div>
      </Section>

      {/* ===== ALBUM MỚI PHÁT HÀNH ===== */}
      <Section title="Album mới phát hành">
        <div className="flex gap-4 overflow-x-auto">
          {newAlbums.map((album) => (
            <AlbumCard key={album.id} album={album} />
          ))}
        </div>
      </Section>

    
    </div>
  );
}
