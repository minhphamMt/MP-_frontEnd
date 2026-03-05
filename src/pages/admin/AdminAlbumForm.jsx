import { useEffect, useMemo, useState } from "react";
import { FiChevronLeft, FiTrash2 } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import { deleteAlbum, getAlbumById, updateAlbum } from "../../api/album.api";
import { resolveAssetUrl } from "../../utils/asset";
import { formatDateDisplay } from "../../utils/date";
import OptimizedImage from "../../components/common/OptimizedImage";
import { confirmAdminAction } from "../../utils/adminDialog";
import { getArtistLabel } from "../../utils/artist";

const formatDateInput = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

const getSongCover = (song) =>
  song?.cover_url || song?.cover || song?.thumbnail || song?.image;

export default function AdminAlbumForm() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [album, setAlbum] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [formValues, setFormValues] = useState({
    title: "",
    release_date: "",
    cover_url: "",
  });

  const loadAlbum = async () => {
    if (!id) {
      setErrorMessage("Không tìm thấy album.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await getAlbumById(id);
      const detail = res?.data?.data ?? res?.data ?? null;
      if (!detail) {
        setErrorMessage("Không tìm thấy album.");
        setAlbum(null);
        return;
      }

      setAlbum(detail);
      setFormValues({
        title: detail?.title || "",
        release_date: formatDateInput(detail?.release_date),
        cover_url: detail?.cover_url || detail?.cover || "",
      });
      setErrorMessage("");
    } catch (error) {
      console.error("Load album failed", error);
      setErrorMessage("Không thể tải thông tin album.");
      setAlbum(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlbum();
  }, [id]);

  const coverPreview = useMemo(() => {
    if (coverFile) {
      return URL.createObjectURL(coverFile);
    }
    if (formValues.cover_url) {
      return resolveAssetUrl(formValues.cover_url);
    }
    if (album?.cover_url || album?.cover) {
      return resolveAssetUrl(album?.cover_url || album?.cover);
    }
    return null;
  }, [coverFile, formValues.cover_url, album]);

  useEffect(() => {
    if (!coverFile || !coverPreview) return undefined;
    return () => URL.revokeObjectURL(coverPreview);
  }, [coverFile, coverPreview]);

  const handleSubmit = async () => {
    if (!id || !album) return;
    if (!formValues.title.trim()) {
      setErrorMessage("Vui lòng nhập tên album.");
      return;
    }

    try {
      setSaving(true);
      setErrorMessage("");

      let payload = {
        title: formValues.title || undefined,
        release_date: formValues.release_date || null,
        cover_url: formValues.cover_url || null,
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

      await updateAlbum(id, payload);
      navigate("/admin/albums", {
        replace: true,
        state: { toast: { title: "Thành công", message: "Đã cập nhật album." } },
      });
    } catch (error) {
      console.error("Update album failed", error);
      setErrorMessage("Không thể cập nhật album.");
    } finally {
      setSaving(false);
    }
  };

  const handleSoftDelete = async () => {
    if (!id || !album) return;
    const confirmed = await confirmAdminAction({
      title: "Xóa mềm album",
      message: `Bạn có chắc muốn xóa mềm album "${album.title || id}"?`,
      confirmText: "Xóa mềm",
      cancelText: "Hủy",
      tone: "danger",
    });
    if (!confirmed) return;
    try {
      await deleteAlbum(id);
      navigate("/admin/albums", {
        replace: true,
        state: { toast: { title: "Thành công", message: "Đã xóa mềm album." } },
      });
    } catch (error) {
      console.error("Delete album failed", error);
      setErrorMessage("Không thể xóa mềm album.");
    }
  };

  return (
    <div className="admin-page-shell min-h-screen space-y-6 px-4 py-6 sm:px-8">
      <button
        onClick={() => navigate("/admin/albums")}
        className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white/80 transition md:hover:border-white/30 md:hover:bg-white/10"
      >
        <FiChevronLeft /> Quay lại danh sách
      </button>

      <div className="flex min-h-0 flex-1 flex-col admin-glass rounded-3xl border border-white/10 bg-[#181818] p-5 text-xs shadow-[0_25px_80px_rgba(0,0,0,0.45)] sm:p-6 sm:text-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.35em] text-white/50">
              Quản trị
            </p>
            <h1 className="text-base font-semibold text-white sm:text-2xl">
              Chỉnh sửa album
            </h1>
          </div>
          <button
            onClick={handleSubmit}
            disabled={saving || loading}
            className="inline-flex items-center justify-center rounded-full bg-emerald-400 px-4 py-2 text-xs font-semibold text-black shadow-lg shadow-emerald-400/30 transition md:hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {saving ? "Đang lưu..." : "Lưu cập nhật"}
          </button>
        </div>

        {errorMessage && (
          <div className="mt-4 admin-alert rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-xs text-rose-100 sm:text-sm">
            {errorMessage}
          </div>
        )}

        <div className="mt-6 flex min-h-0 flex-1 flex-col">
          {loading ? (
            <div className="text-xs text-white/60 sm:text-sm">Đang tải dữ liệu...</div>
          ) : (
            <div className="h-full overflow-y-auto pr-1">
              <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <p className="text-xs font-semibold text-white sm:text-sm">Thông tin chi tiết</p>
                  <div className="mt-4 flex flex-col gap-4">
                    {coverPreview ? (
                      <OptimizedImage
                        src={coverPreview}
                        alt={formValues.title || "Album cover"}
                        className="h-56 w-full rounded-2xl bg-black/40 object-contain shadow-lg"
                      />
                    ) : (
                      <div className="flex h-56 items-center justify-center rounded-2xl bg-white/10 text-xs text-white/60 sm:text-sm">
                        Chưa có ảnh bìa
                      </div>
                    )}
                    <div className="space-y-2 text-xs text-white/70 sm:text-sm">
                      <p>
                        <span className="text-white/60">Tên album:</span>{" "}
                        <span className="text-white">{album?.title || "Chưa đặt tên"}</span>
                      </p>
                      <p>
                        <span className="text-white/60">Nghệ sĩ:</span>{" "}
                        <span className="text-white">
                          {getArtistLabel(album, album?.artist?.name || album?.artist_name || "") || "-"}
                        </span>
                      </p>
                      <p>
                        <span className="text-white/60">Ngày phát hành:</span>{" "}
                        <span className="text-white">{formatDateDisplay(album?.release_date)}</span>
                      </p>
                      {album?.songs?.length > 0 && (
                        <div>
                          <p className="text-white/60">Danh sách bài hát:</p>
                          <ul className="mt-2 space-y-1 text-white/80">
                            {album.songs.map((song) => (
                              <li key={song.id}>- {song.title}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <p className="text-xs font-semibold text-white sm:text-sm">Cập nhật album</p>
                  <div className="mt-4 space-y-4">
                    <label className="block text-xs text-white/70 sm:text-sm">
                      Tên album
                      <input
                        value={formValues.title}
                        onChange={(event) =>
                          setFormValues((prev) => ({
                            ...prev,
                            title: event.target.value,
                          }))
                        }
                        className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-2 text-xs text-white focus:border-emerald-400/60 focus:outline-none sm:text-sm"
                      />
                    </label>
                    <label className="block text-xs text-white/70 sm:text-sm">
                      Ngày phát hành
                      <input
                        type="date"
                        value={formValues.release_date}
                        onChange={(event) =>
                          setFormValues((prev) => ({
                            ...prev,
                            release_date: event.target.value,
                          }))
                        }
                        className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-2 text-xs text-white focus:border-emerald-400/60 focus:outline-none sm:text-sm"
                      />
                    </label>
                    <label className="block text-xs text-white/70 sm:text-sm">
                      Ảnh bìa (URL)
                      <input
                        value={formValues.cover_url}
                        onChange={(event) =>
                          setFormValues((prev) => ({
                            ...prev,
                            cover_url: event.target.value,
                          }))
                        }
                        placeholder="https://..."
                        className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-2 text-xs text-white placeholder:text-white/40 focus:border-emerald-400/60 focus:outline-none sm:text-sm"
                      />
                    </label>
                    <div>
                      <label className="text-xs text-white/50">Hoặc tải ảnh bìa (PNG/JPG)</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(event) => setCoverFile(event.target.files?.[0] || null)}
                        className="mt-2 w-full rounded-2xl border border-dashed border-white/10 bg-black/20 px-4 py-3 text-xs text-white/70 file:mr-4 file:rounded-full file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-white/80 md:hover:border-white/20"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {album?.songs?.length > 0 && (
                <div className="mt-6">
                  <p className="text-xs font-semibold text-white sm:text-sm">Danh sách bài hát</p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {album.songs.map((song) => (
                      <div
                        key={song.id}
                        className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 text-xs text-white/80 sm:text-sm"
                      >
                        <div className="h-12 w-12 overflow-hidden rounded-xl bg-black/40">
                          {getSongCover(song) || album.cover_url ? (
                            <OptimizedImage
                              src={resolveAssetUrl(
                                getSongCover(song) || album.cover_url || album.cover
                              )}
                              alt={song.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[10px] text-white/50">
                              No image
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-white">{song.title}</p>
                          <p className="truncate text-xs text-white/50">
                            {getArtistLabel(song, album.artist?.name || album.artist_name || "") || "-"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-white/10 pt-4">
          <button
            onClick={handleSoftDelete}
            disabled={loading || saving}
            className="inline-flex items-center gap-2 rounded-full border border-rose-400/40 bg-rose-500/10 px-4 py-2 text-xs text-rose-200 transition md:hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-70 sm:text-sm"
          >
            <FiTrash2 /> Xóa mềm
          </button>
          <button
            onClick={() => navigate("/admin/albums")}
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/80 transition md:hover:bg-white/10 sm:text-sm"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving || loading}
            className="rounded-full bg-emerald-400 px-5 py-2 text-xs font-semibold text-black shadow-lg shadow-emerald-400/30 transition md:hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-70 sm:text-sm"
          >
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </div>
    </div>
  );
}

