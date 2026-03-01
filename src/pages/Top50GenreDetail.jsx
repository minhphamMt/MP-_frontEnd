import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { FiChevronLeft } from "react-icons/fi";
import { getTop50ByGenres } from "../api/chart.api";
import SongTable from "../components/song/SongTable";
import { filterPlayableSongs } from "../utils/song";

/* ================= utils ================= */
const findGenreEntry = (payload, genreId) => {
  const list = Array.isArray(payload)
    ? payload
    : payload?.items || payload?.data || [];

  const matched = list.find(
    (item) => String(item?.genre?.id ?? item?.id) === String(genreId)
  );

  if (!matched) return null;

  return {
    genre: matched.genre || matched,
    songs: filterPlayableSongs(matched.songs || []),
  };
};

/* ================= component ================= */
export default function Top50GenreDetail() {
  const { id } = useParams();
  const location = useLocation();

  const [entry, setEntry] = useState(() => {
    if (location.state?.genre && location.state?.songs) {
      return {
        genre: location.state.genre,
        songs: filterPlayableSongs(location.state.songs),
      };
    }
    return null;
  });

  const [loading, setLoading] = useState(!entry);

  const loadDetail = async () => {
    try {
      setLoading(true);
      const res = await getTop50ByGenres();
      const payload = res?.data?.data || res?.data || [];
      setEntry(findGenreEntry(payload, id));
    } catch (error) {
      console.error("Load top 50 genre detail failed", error);
      setEntry(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetail();
  }, [id]);

  const title = entry?.genre?.name || "Top 50";
  const songs = entry?.songs || [];

  const header = useMemo(
    () => (
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/5 bg-[#181818] p-4">
        <div>
          <Link
            to="/top-50"
            className="mb-2 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-white/50 transition md:hover:text-white"
          >
            <FiChevronLeft />
            Quay lại Top 50
          </Link>

          <h1 className="text-2xl font-bold text-white">{title}</h1>
          <p className="mt-1 text-xs text-white/60">
            50 bài hát được nghe nhiều nhất của thể loại này
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#242424] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-white/70">
          Top 50
        </div>
      </div>
    ),
    [title]
  );

  return (
    <div className="min-h-screen bg-[#121212] px-4 py-6 sm:px-8">
      {header}

      <SongTable
        title={title}
        subtitle="Danh sách 50 bài hát hot nhất"
        songs={songs}
        loading={loading}
        onRefresh={loadDetail}
      />
    </div>
  );
}
