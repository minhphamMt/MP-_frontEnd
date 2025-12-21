import { useEffect, useRef, useState } from "react";
import { getRecommendations } from "../api/recommendation.api";
import { getSongById } from "../api/song.api";
import Section from "../components/section/Section";
import SongRow from "../components/song/SongRow";

export default function Home() {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    async function loadHome() {
      try {
        // 1. Lấy danh sách ID gợi ý
        const recRes = await getRecommendations();
        const ids = recRes.data?.data || [];

        if (!ids.length) {
          setSongs([]);
          return;
        }

        // 2. Lấy chi tiết từng bài hát
        const results = await Promise.all(
          ids.map(async (id) => {
            try {
              const res = await getSongById(id);
              const raw = res.data?.data || res.data;

              return {
                id: raw.id,
                title: raw.title,
                artist_name: raw.artist_name || raw.artist?.name || "",
                duration: raw.duration,
                cover_url: raw.cover_url,
                audio_url: `${import.meta.env.VITE_API_BASE_URL}${raw.audio_path}`,
              };
            } catch {
              return null;
            }
          })
        );

        setSongs(results.filter(Boolean));
      } catch (err) {
        console.error("Load home error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadHome();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <Section title="Gợi ý cho bạn">
        {songs.map((song) => (
          <SongRow key={song.id} song={song} queue={songs} />
        ))}
      </Section>
    </div>
  );
}
