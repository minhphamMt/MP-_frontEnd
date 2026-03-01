import { useEffect, useState } from "react";
import {
  createGenre,
  deleteGenre,
  listGenres,
  updateGenre,
} from "../../api/admin.api";
import { FiPlus, FiRefreshCw, FiTrash2 } from "react-icons/fi";

export default function AdminGenres() {
  const [genres, setGenres] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [newGenre, setNewGenre] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const loadGenres = async () => {
    try {
      setLoading(true);
      const res = await listGenres({ page: 1, limit: 50, keyword });
      const payload = res?.data?.data ?? res?.data ?? [];
      const list = Array.isArray(payload)
        ? payload
        : payload.items || payload.genres || [];
      setGenres(list);
      setErrorMessage("");
    } catch (error) {
      console.error("Load genres failed", error);
      setErrorMessage("Không thể tải danh sách thể loại.");
      setGenres([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGenres();
  }, []);

  const handleCreate = async () => {
    if (!newGenre.trim()) return;
    try {
      await createGenre({ name: newGenre.trim() });
      setNewGenre("");
      loadGenres();
    } catch (error) {
      console.error("Create genre failed", error);
      alert("Không thể tạo thể loại.");
    }
  };

  const handleRename = async (genre) => {
    const nextName = window.prompt("Cập nhật tên thể loại:", genre.name);
    if (!nextName || nextName.trim() === genre.name) return;
    try {
      await updateGenre(genre.id, { name: nextName.trim() });
      loadGenres();
    } catch (error) {
      console.error("Update genre failed", error);
      alert("Không thể cập nhật thể loại.");
    }
  };

  const handleDelete = async (genre) => {
    const confirmed = window.confirm(
      `Bạn có chắc muốn xoá mềm thể loại "${genre.name}"? Thể loại sẽ nằm trong thùng rác.`
    );
    if (!confirmed) return;
    try {
      await deleteGenre(genre.id);
      loadGenres();
    } catch (error) {
      console.error("Delete genre failed", error);
      alert("Không thể xoá mềm thể loại.");
    }
  };

  return (
    <div className="min-h-screen space-y-6 bg-[#121212] px-4 py-6 sm:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.35em] text-white/50">
            Quản trị
          </p>
          <h1 className="text-3xl font-extrabold text-white">
            Quản lý thể loại
          </h1>
        </div>
        <button
          onClick={loadGenres}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white/80 transition md:hover:border-white/30 md:hover:bg-white/10"
        >
          <FiRefreshCw /> Làm mới
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-white/10 bg-[#181818] p-4 shadow-[0_25px_80px_rgba(0,0,0,0.45)]">
          <input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") loadGenres();
            }}
            placeholder="Tìm kiếm thể loại..."
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-white/40 focus:border-emerald-400/60 focus:outline-none"
          />
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#181818] p-4 shadow-[0_25px_80px_rgba(0,0,0,0.45)]">
          <div className="flex gap-2">
            <input
              value={newGenre}
              onChange={(event) => setNewGenre(event.target.value)}
              placeholder="Thêm thể loại mới..."
              className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-white/40 focus:border-emerald-400/60 focus:outline-none"
            />
            <button
              onClick={handleCreate}
              className="inline-flex items-center gap-2 rounded-full bg-emerald-400 px-4 py-2 text-xs font-semibold text-black shadow-lg shadow-emerald-400/30 transition md:hover:bg-emerald-300"
            >
              <FiPlus /> Thêm
            </button>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          {errorMessage}
        </div>
      )}

      <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#181818] shadow-[0_25px_80px_rgba(0,0,0,0.45)]">
        <div className="grid grid-cols-[1fr_0.4fr] border-b border-white/10 px-4 py-3 text-[11px] uppercase tracking-[0.3em] text-white/50">
          <span>Thể loại</span>
          <span className="text-right">Hành động</span>
        </div>
        <div className="divide-y divide-white/5">
          {loading && (
            <div className="px-4 py-6 text-sm text-white/60">
              Đang tải dữ liệu...
            </div>
          )}
          {!loading && genres.length === 0 && (
            <div className="px-4 py-6 text-sm text-white/60">
              Không có thể loại phù hợp.
            </div>
          )}
          {!loading &&
            genres.map((genre) => (
              <div
                key={genre.id}
                className="flex items-center justify-between px-4 py-3 text-sm text-white/80"
              >
                <span
                  className="cursor-pointer text-white md:hover:text-emerald-300"
                  onClick={() => handleRename(genre)}
                >
                  {genre.name}
                </span>
                <button
                  onClick={() => handleDelete(genre)}
                  className="inline-flex items-center gap-1 rounded-full border border-rose-400/40 bg-rose-500/10 px-3 py-1 text-xs text-rose-200 transition md:hover:bg-rose-500/20"
                >
                  <FiTrash2 /> Xoá mềm
                </button>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}