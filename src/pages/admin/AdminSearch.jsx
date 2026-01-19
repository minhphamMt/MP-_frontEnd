import { useState } from "react";
import { FiSearch } from "react-icons/fi";
import { searchAdmin } from "../../api/admin.api";

export default function AdminSearch() {
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSearch = async () => {
    if (!keyword.trim()) return;
    try {
      setLoading(true);
      const res = await searchAdmin({ q: keyword.trim(), page: 1, limit: 20 });
      const payload = res?.data?.data ?? res?.data ?? [];
      const list = Array.isArray(payload)
        ? payload
        : payload.items || payload.results || [];
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
              if (event.key === "Enter") handleSearch();
            }}
            placeholder="Nhập từ khoá tìm kiếm..."
            className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-white/40 focus:border-emerald-400/60 focus:outline-none"
          />
          <button
            onClick={handleSearch}
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
        {!loading && results.length === 0 && (
          <p>Chưa có kết quả. Hãy nhập từ khoá để bắt đầu.</p>
        )}
        {!loading && results.length > 0 && (
          <div className="space-y-3">
            {results.map((item, index) => (
              <div
                key={item.id || item._id || index}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
              >
                <p className="font-semibold text-white">
                  {item.name || item.title || item.email || "Kết quả"}
                </p>
                {item.type && (
                  <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">
                    {item.type}
                  </p>
                )}
                <p className="text-xs text-white/50">
                  {item.description || item.alias || item.id || item._id}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}