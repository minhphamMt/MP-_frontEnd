import { useEffect, useMemo, useState } from "react";
import { FiSearch } from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";
import { searchAdmin } from "../../api/admin.api";

export default function AdminSearch() {
  const location = useLocation();
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  const normalizedResults = useMemo(() => {
    return results
      .map((item) => {
        let type = item.type || item.entity_type || item.entityType || item.kind;

        if (!type && (item.display_name || item.email)) type = "user";
        if (!type && item.role === "ARTIST") type = "artist";
        if (
          !type &&
          item.title &&
          (item.play_count !== undefined ||
            item.audio_url ||
            item.audio_path ||
            item.duration !== undefined ||
            item.album_id ||
            item.album_title ||
            item.weekly_play_count !== undefined)
        )
          type = "song";
        if (
          !type &&
          item.title &&
          (item.release_date ||
            item.zing_album_id ||
            item.artist_name ||
            item.artist_id)
        )
          type = "album";
        if (!type && item.name) type = "artist";

        const normalizedType = (type || "").toLowerCase();
        if (!["artist", "song", "album", "user"].includes(normalizedType)) {
          return null;
        }

        return {
          ...item,
          type: normalizedType,
          displayLabel:
            item.display_name || item.title || item.name || item.email,
          secondaryLabel: item.artist_name || item.email || item.role,
        };
      })
      .filter(Boolean);
  }, [results]);

  const runSearch = async (rawValue) => {
    const trimmed = rawValue.trim();
    if (!trimmed) return;
    try {
      setLoading(true);
      const res = await searchAdmin({
        q: trimmed,
        keyword: trimmed,
        page: 1,
        limit: 50,
      });
      const payload = res?.data?.data ?? res?.data ?? [];
      const itemsSource =
        payload.items || payload.results || payload.data || payload;
      const list = Array.isArray(itemsSource)
        ? itemsSource
        : [
            ...(itemsSource?.songs ?? []),
            ...(itemsSource?.artists ?? []),
            ...(itemsSource?.albums ?? []),
            ...(itemsSource?.users ?? []),
          ];
      setResults(list);
      setErrorMessage("");
    } catch (error) {
      console.error("Search admin failed", error);
      setErrorMessage("Không thể tìm kiếm dữ liệu.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get("q") || params.get("keyword") || "";
    if (!query.trim()) return;
    setKeyword(query);
    runSearch(query);
  }, [location.search]);

  const handleSubmit = () => {
    const trimmed = keyword.trim();
    if (!trimmed) return;
    navigate(`/admin/search?q=${encodeURIComponent(trimmed)}`);
  };

  const handleResultClick = (item) => {
    if (!item) return;
    const label =
      item.display_name || item.displayLabel || item.name || item.title || "";
    const targetId = item.id ?? item._id ?? "";
    if (item.type === "artist") {
      navigate(
        `/admin/users?role=ARTIST&keyword=${encodeURIComponent(label)}${
          targetId ? `&targetId=${targetId}` : ""
        }`
      );
      return;
    }
    if (item.type === "album") {
      navigate(
        `/admin/albums?keyword=${encodeURIComponent(label)}${
          targetId ? `&targetId=${targetId}` : ""
        }`
      );
      return;
    }
    if (item.type === "song") {
      navigate(
        `/admin/songs?keyword=${encodeURIComponent(label)}${
          targetId ? `&targetId=${targetId}` : ""
        }`
      );
      return;
    }
    if (item.type === "user") {
      navigate(
        `/admin/users?keyword=${encodeURIComponent(label)}${
          targetId ? `&targetId=${targetId}` : ""
        }`
      );
    }
  };

  return (
    <div className="min-h-screen space-y-6 bg-[#121212] px-4 py-6 sm:px-8">
      <div>
        <p className="text-[11px] uppercase tracking-[0.35em] text-white/50">
          Quản trị
        </p>
        <h1 className="text-3xl font-extrabold text-white">
          Tìm kiếm quản trị
        </h1>
      </div>

      <div className="rounded-3xl border border-white/10 bg-[#181818] p-4 shadow-[0_25px_80px_rgba(0,0,0,0.45)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") handleSubmit();
            }}
            placeholder="Nhập từ khoá tìm kiếm..."
            className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-white/40 focus:border-emerald-400/60 focus:outline-none"
          />
          <button
            onClick={handleSubmit}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-400 px-5 py-2 text-xs font-semibold text-black shadow-lg shadow-emerald-400/30 transition hover:bg-emerald-300"
          >
            <FiSearch /> Tìm kiếm
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          {errorMessage}
        </div>
      )}

      <div className="rounded-3xl border border-white/10 bg-[#181818] p-6 text-sm text-white/70 shadow-[0_25px_80px_rgba(0,0,0,0.45)]">
        {loading && <p>Đang tìm kiếm...</p>}
        {!loading && normalizedResults.length === 0 && (
          <p>Chưa có kết quả. Hãy nhập từ khoá để bắt đầu.</p>
        )}
        {!loading && normalizedResults.length > 0 && (
          <div className="space-y-3">
            {normalizedResults.map((item, index) => (
              <button
                type="button"
                onClick={() => handleResultClick(item)}
                key={item.id || item._id || index}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left transition hover:border-emerald-400/40 hover:bg-white/10"
              >
                <p className="font-semibold text-white">
                  {item.displayLabel || "Kết quả"}
                </p>
                {item.type && (
                  <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">
                    {item.type}
                  </p>
                )}
                <p className="text-xs text-white/50">
                  {item.secondaryLabel || item.alias || item.id || item._id}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}