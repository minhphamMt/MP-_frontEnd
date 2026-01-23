import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { FiRefreshCw, FiSearch, FiX } from "react-icons/fi";
import {
  deleteAlbum,
  getAlbumById,
  getAlbums,
  updateAlbum,
} from "../../api/album.api";
import ArtistAlbumTile from "../../components/artist/ArtistAlbumTile";
import { resolveAssetUrl } from "../../utils/asset";

const formatDateInput = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

export default function AdminAlbums() {
  const location = useLocation();
  const [albums, setAlbums] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [editingAlbum, setEditingAlbum] = useState(null);
  const [autoOpenedId, setAutoOpenedId] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [editPayload, setEditPayload] = useState({
    title: "",
    release_date: "",
    cover_url: "",
  });

  const loadAlbums = async () => {
    try {
      setLoading(true);
      const trimmedKeyword = keyword.trim();
      const res = await getAlbums({
        page: 1,
        limit: 100,
        sort: "release_date",
        ...(trimmedKeyword ? { keyword: trimmedKeyword, q: trimmedKeyword } : {}),
      });
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
  }, [keyword]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setKeyword(params.get("keyword") || "");
  }, [location.search]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const targetId = params.get("targetId") || params.get("id");
    if (!targetId || targetId === autoOpenedId) return;
    const match = albums.find(
      (album) => `${album.id}` === `${targetId}` || `${album._id}` === `${targetId}`
    );
    if (match) {
      handleEdit(match);
      setAutoOpenedId(`${targetId}`);
    }
  }, [albums, autoOpenedId, location.search]);
  
  const filteredAlbums = useMemo(() => {
    const normalized = keyword.trim().toLowerCase();
    if (!normalized) return albums;
    return albums.filter((album) =>
      [album.title, album.artist_name]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(normalized))
    );
  }, [albums, keyword]);

  const handleView = async (albumId) => {
    try {
      const res = await getAlbumById(albumId);
      const album = res?.data?.data ?? res?.data ?? null;
      setSelectedAlbum(album);
    } catch (error) {
      console.error("Load album detail failed", error);
      alert("Không thể tải chi tiết album.");
    }
  };

   const handleEdit = async (album) => {
    try {
      const res = await getAlbumById(album.id);
      const detail = res?.data?.data ?? res?.data ?? album;
      setEditingAlbum(detail);
      setEditPayload({
        title: detail?.title || "",
        release_date: formatDateInput(detail?.release_date),
        cover_url: detail?.cover_url || detail?.cover || "",
      });
      setCoverFile(null);
    } catch (error) {
      console.error("Load album detail failed", error);
      setEditingAlbum(album);
      setEditPayload({
        title: album?.title || "",
        release_date: formatDateInput(album?.release_date),
        cover_url: album?.cover_url || album?.cover || "",
      });
      setCoverFile(null);
    }
  };

  const handleUpdate = async () => {
    if (!editingAlbum) return;
    try {
      let payload = {
        title: editPayload.title || undefined,
        release_date: editPayload.release_date || null,
      cover_url: editPayload.cover_url || null,
      };

      if (coverFile) {
        const formData = new FormData();
        formData.append("cover", coverFile);
        Object.entries(payload).forEach(([key, value]) => {
          if (value !== null && value !== undefined && value !== "") {
            formData.append(key, value);
          }
        });
        payload = formData;
      }

      await updateAlbum(editingAlbum.id, payload);
      setEditingAlbum(null);
      setCoverFile(null);
      await loadAlbums();
    } catch (error) {
      console.error("Update album failed", error);
      alert("Không thể cập nhật album.");
    }
  };

  const coverPreview = useMemo(() => {
    if (coverFile) {
      return URL.createObjectURL(coverFile);
    }
    if (editPayload.cover_url) {
      return resolveAssetUrl(editPayload.cover_url);
    }
    if (editingAlbum?.cover_url || editingAlbum?.cover) {
      return resolveAssetUrl(editingAlbum?.cover_url || editingAlbum?.cover);
    }
    return null;
  }, [coverFile, editPayload.cover_url, editingAlbum]);

  useEffect(() => {
    if (!coverFile || !coverPreview) return undefined;
    return () => URL.revokeObjectURL(coverPreview);
  }, [coverFile, coverPreview]);

  const handleDelete = async (albumId) => {
    const confirmed = window.confirm(
      "Bạn có chắc muốn xoá mềm album này? Album sẽ nằm trong thùng rác."
    );
    if (!confirmed) return;
    try {
      await deleteAlbum(albumId);
      await loadAlbums();
    } catch (error) {
      console.error("Delete album failed", error);
      alert("Không thể xoá mềm album.");
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
        <button
          onClick={loadAlbums}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white/80 transition hover:border-white/30 hover:bg-white/10"
        >
          <FiRefreshCw /> Làm mới
        </button>
      </div>

      <div className="rounded-3xl border border-white/10 bg-[#181818] p-4 shadow-[0_25px_80px_rgba(0,0,0,0.45)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex flex-1 items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80">
            <FiSearch className="text-white/50" />
            <input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="Tìm theo tên album hoặc nghệ sĩ..."
              className="w-full bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          {errorMessage}
        </div>
      )}

      {loading && (
        <div className="rounded-2xl border border-white/10 bg-[#181818] px-4 py-6 text-sm text-white/60">
          Đang tải dữ liệu...
        </div>
      )}

      {!loading && filteredAlbums.length === 0 && (
        <div className="rounded-2xl border border-white/10 bg-[#181818] px-4 py-6 text-sm text-white/60">
          Không có album phù hợp.
        </div>
      )}

      {!loading && filteredAlbums.length > 0 && (
        <div className="grid gap-5 lg:grid-cols-3">
          {filteredAlbums.map((album) => (
            <ArtistAlbumTile
              key={album.id}
              album={album}
              onView={() => handleView(album.id)}
              onEdit={() => handleEdit(album)}
              onDelete={() => handleDelete(album.id)}
            />
          ))}
        </div>
      )}

      {selectedAlbum && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-[#181818] p-6 text-white shadow-[0_30px_90px_rgba(0,0,0,0.6)]">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Chi tiết album</h2>
              <button
                onClick={() => setSelectedAlbum(null)}
                className="rounded-full border border-white/10 bg-white/5 p-2 text-white/70 transition hover:bg-white/10"
              >
                <FiX />
              </button>
            </div>
            <div className="mt-4 space-y-3 text-sm text-white/70">
              <p>
                <span className="text-white/60">Tên album:</span>{" "}
                <span className="text-white">{selectedAlbum.title}</span>
              </p>
              <p>
                <span className="text-white/60">Nghệ sĩ:</span>{" "}
                <span className="text-white">
                  {selectedAlbum.artist?.name || selectedAlbum.artist_name || "-"}
                </span>
              </p>
              <p>
                <span className="text-white/60">Ngày phát hành:</span>{" "}
                <span className="text-white">
                  {selectedAlbum.release_date || "Chưa cập nhật"}
                </span>
              </p>
              {selectedAlbum.songs?.length > 0 && (
                <div>
                  <p className="text-white/60">Danh sách bài hát:</p>
                  <ul className="mt-2 space-y-1 text-white/80">
                    {selectedAlbum.songs.map((song) => (
                      <li key={song.id}>• {song.title}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {editingAlbum && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
           <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 bg-[#181818] p-4 text-white shadow-[0_30px_90px_rgba(0,0,0,0.6)] sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.35em] text-white/50">
                  Quản lý album
                </p>
                <h2 className="mt-2 text-xl font-semibold">Chỉnh sửa album</h2>
              </div>
              <button
                onClick={() => setEditingAlbum(null)}
                className="rounded-full border border-white/10 bg-white/5 p-2 text-white/70 transition hover:bg-white/10"
              >
                <FiX />
              </button>
            </div>

           <div className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <p className="text-sm font-semibold text-white">Thông tin chi tiết</p>
                <div className="mt-4 flex flex-col gap-4">
                  {coverPreview ? (
                    <img
                      src={coverPreview}
                      alt={editPayload.title || "Album cover"}
                      className="h-56 w-full rounded-2xl bg-black/40 object-contain shadow-lg"
                    />
                  ) : (
                    <div className="flex h-56 items-center justify-center rounded-2xl bg-white/10 text-sm text-white/60">
                      Chưa có ảnh bìa
                    </div>
                  )}
                  <div className="space-y-2 text-sm text-white/70">
                    <p>
                      <span className="text-white/60">Tên album:</span>{" "}
                      <span className="text-white">
                        {editingAlbum.title || "Chưa đặt tên"}
                      </span>
                    </p>
                    <p>
                      <span className="text-white/60">Nghệ sĩ:</span>{" "}
                      <span className="text-white">
                        {editingAlbum.artist?.name ||
                          editingAlbum.artist_name ||
                          "-"}
                      </span>
                    </p>
                    <p>
                      <span className="text-white/60">Ngày phát hành:</span>{" "}
                      <span className="text-white">
                        {editingAlbum.release_date || "Chưa cập nhật"}
                      </span>
                    </p>
                    {editingAlbum.songs?.length > 0 && (
                      <div>
                        <p className="text-white/60">Danh sách bài hát:</p>
                        <ul className="mt-2 space-y-1 text-white/80">
                          {editingAlbum.songs.map((song) => (
                            <li key={song.id}>• {song.title}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <p className="text-sm font-semibold text-white">Cập nhật album</p>
                <div className="mt-4 space-y-4">
                  <label className="block text-sm text-white/70">
                    Tên album
                    <input
                      value={editPayload.title}
                      onChange={(event) =>
                        setEditPayload((prev) => ({
                          ...prev,
                          title: event.target.value,
                        }))
                      }
                      className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-2 text-sm text-white focus:border-emerald-400/60 focus:outline-none"
                    />
                  </label>
                  <label className="block text-sm text-white/70">
                    Ngày phát hành
                    <input
                      type="date"
                      value={editPayload.release_date}
                      onChange={(event) =>
                        setEditPayload((prev) => ({
                          ...prev,
                          release_date: event.target.value,
                        }))
                      }
                      className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-2 text-sm text-white focus:border-emerald-400/60 focus:outline-none"
                    />
                  </label>
                  <label className="block text-sm text-white/70">
                    Ảnh bìa (URL)
                    <input
                      value={editPayload.cover_url}
                      onChange={(event) =>
                        setEditPayload((prev) => ({
                          ...prev,
                          cover_url: event.target.value,
                        }))
                      }
                      placeholder="https://..."
                      className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-2 text-sm text-white placeholder:text-white/40 focus:border-emerald-400/60 focus:outline-none"
                    />
                  </label>
                  <div>
                    <label className="text-xs text-white/50">
                      Hoặc tải ảnh bìa (PNG/JPG)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(event) =>
                        setCoverFile(event.target.files?.[0] || null)
                      }
                      className="mt-2 w-full rounded-2xl border border-dashed border-white/10 bg-black/20 px-4 py-3 text-xs text-white/70 file:mr-4 file:rounded-full file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-white/80 hover:border-white/20"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setEditingAlbum(null)}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 transition hover:bg-white/10"
              >
                Huỷ
              </button>
              <button
                onClick={handleUpdate}
                className="rounded-full bg-emerald-400 px-5 py-2 text-sm font-semibold text-black shadow-lg shadow-emerald-400/30 transition hover:bg-emerald-300"
              >
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}