import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { FiRefreshCw, FiTrash2 } from "react-icons/fi";
import { deleteAlbum, getAlbums } from "../../api/album.api";

export default function AdminAlbums() {
  const location = useLocation();
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const loadAlbums = async () => {
    try {
      setLoading(true);
      const res = await getAlbums({ page: 1, limit: 50 });
      const payload = res?.data?.data ?? res?.data ?? [];
      const list = Array.isArray(payload)
        ? payload
        : payload.items || payload.albums || [];
      setAlbums(list);
      setErrorMessage("");
    } catch (error) {
      console.error("Load albums failed", error);
      setErrorMessage("Không thể tải danh sách album.");
      setAlbums([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlbums();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setKeyword(params.get("keyword") || "");
  }, [location.search]);

  const filteredAlbums = useMemo(() => {
    const normalized = keyword.trim().toLowerCase();
    if (!normalized) return albums;
    return albums.filter((album) =>
      [album.title, album.artist_name, album.artist?.name, `${album.id}`]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(normalized))
    );
  }, [albums, keyword]);

  const handleDelete = async (album) => {
    const confirmed = window.confirm(
      `Bạn chắc chắn muốn xoá album "${album?.title || "này"}"?`
    );
    if (!confirmed) return;
    try {
      await deleteAlbum(album.id);
      await loadAlbums();
    } catch (error) {
      console.error("Delete album failed", error);
      alert("Không thể xoá album.");
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
            Quản lý album
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="Tìm theo tên album hoặc nghệ sĩ..."
            className="w-full rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white/80 transition placeholder:text-white/40 focus:border-white/30 focus:outline-none sm:w-64"
          />
          <button
            onClick={loadAlbums}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white/80 transition hover:border-white/30 hover:bg-white/10"
          >
            <FiRefreshCw /> Làm mới
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          {errorMessage}
        </div>
      )}

      <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#181818] shadow-[0_25px_80px_rgba(0,0,0,0.45)]">
        <div className="grid grid-cols-[1.4fr_1fr_0.6fr] border-b border-white/10 px-4 py-3 text-[11px] uppercase tracking-[0.3em] text-white/50">
          <span>Album</span>
          <span>Nghệ sĩ</span>
          <span className="text-right">Hành động</span>
        </div>
        <div className="divide-y divide-white/5">
          {loading && (
            <div className="px-4 py-6 text-sm text-white/60">
              Đang tải dữ liệu...
            </div>
          )}
          {!loading && filteredAlbums.length === 0 && (
            <div className="px-4 py-6 text-sm text-white/60">
              Không có album phù hợp.
            </div>
          )}
          {!loading &&
            filteredAlbums.map((album) => (
              <div
                key={album.id}
                className="grid grid-cols-[1.4fr_1fr_0.6fr] items-center gap-2 px-4 py-3 text-sm text-white/80"
              >
                <div>
                  <p className="font-semibold text-white">
                    {album.title || "Album"}
                  </p>
                  <p className="text-xs text-white/50">
                    ID: {album.id || "-"}
                  </p>
                </div>
                <span>{album.artist_name || album.artist?.name || "-"}</span>
                <div className="flex justify-end">
                  <button
                    onClick={() => handleDelete(album)}
                    className="inline-flex items-center gap-1 rounded-full border border-rose-400/40 bg-rose-500/10 px-3 py-1 text-xs text-rose-200 transition hover:bg-rose-500/20"
                  >
                    <FiTrash2 /> Xoá
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}