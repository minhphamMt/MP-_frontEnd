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
    <div className="admin-page-shell admin-list-page min-h-screen space-y-6 px-4 py-6 sm:px-8">
      <button
        onClick={() => navigate("/admin/albums")}
        className="admin-button admin-button-ghost"
      >
        <FiChevronLeft /> Quay lại danh sách
      </button>

      <div className="admin-detail-shell">
        <div className="admin-detail-header">
          <div className="admin-detail-heading">
            <p className="admin-list-kicker">Quản trị</p>
            <h1 className="admin-list-title">Chỉnh sửa album</h1>
            <p className="admin-list-summary">
              Tập trung vào bìa album, ngày phát hành và danh sách bài hát liên quan
              trong một giao diện gọn, phẳng và dễ quét.
            </p>
          </div>
          <button
            onClick={handleSubmit}
            disabled={saving || loading}
            className="admin-button admin-button-primary"
          >
            {saving ? "Đang lưu..." : "Lưu cập nhật"}
          </button>
        </div>

        {errorMessage && (
          <div className="admin-alert rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-xs text-rose-100 sm:text-sm">
            {errorMessage}
          </div>
        )}

        <div className="flex min-h-0 flex-1 flex-col">
          {loading ? (
            <div className="admin-loading-state admin-detail-panel">Đang tải dữ liệu...</div>
          ) : (
            <div className="space-y-4">
              <div className="admin-detail-grid is-two-column">
                <div className="admin-detail-panel">
                  <p className="admin-detail-panel-title">Tổng quan album</p>
                  <p className="admin-detail-panel-note">
                    Xem nhanh cover, nghệ sĩ và ngày phát hành trước khi cập nhật dữ
                    liệu.
                  </p>
                  <div className="mt-4 flex flex-col gap-4">
                    {coverPreview ? (
                      <div className="admin-detail-media is-square">
                        <OptimizedImage
                          src={coverPreview}
                          alt={formValues.title || "Album cover"}
                          className="h-full w-full bg-black/40 object-cover"
                        />
                      </div>
                    ) : (
                      <div className="admin-detail-placeholder">
                        Chưa có ảnh bìa
                      </div>
                    )}
                    <div className="admin-detail-meta-grid">
                      <div className="admin-detail-meta-card">
                        <p className="admin-detail-meta-label">Tên album</p>
                        <p className="admin-detail-meta-value">{album?.title || "Chưa đặt tên"}</p>
                      </div>
                      <div className="admin-detail-meta-card">
                        <p className="admin-detail-meta-label">Nghệ sĩ</p>
                        <p className="admin-detail-meta-value">
                          {getArtistLabel(album, album?.artist?.name || album?.artist_name || "") || "-"}
                        </p>
                      </div>
                      <div className="admin-detail-meta-card">
                        <p className="admin-detail-meta-label">Phát hành</p>
                        <p className="admin-detail-meta-value">{formatDateDisplay(album?.release_date)}</p>
                      </div>
                      <div className="admin-detail-meta-card">
                        <p className="admin-detail-meta-label">Số bài hát</p>
                        <p className="admin-detail-meta-value">{album?.songs?.length || 0}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="admin-detail-panel">
                  <p className="admin-detail-panel-title">Cập nhật album</p>
                  <p className="admin-detail-panel-note">
                    Chỉnh các trường chính và ưu tiên giữ cấu trúc dữ liệu sạch, dễ tra
                    cứu.
                  </p>
                  <div className="mt-4 space-y-4">
                    <label className="admin-detail-label">
                      Tên album
                      <input
                        value={formValues.title}
                        onChange={(event) =>
                          setFormValues((prev) => ({
                            ...prev,
                            title: event.target.value,
                          }))
                        }
                        className="admin-field"
                      />
                    </label>
                    <label className="admin-detail-label">
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
                        className="admin-field"
                      />
                    </label>
                    <label className="admin-detail-label">
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
                        className="admin-field"
                      />
                    </label>
                    <div>
                      <label className="admin-detail-label">Hoặc tải ảnh bìa (PNG/JPG)</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(event) => setCoverFile(event.target.files?.[0] || null)}
                        className="mt-2 admin-upload-field"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {album?.songs?.length > 0 && (
                <div className="admin-detail-panel">
                  <p className="admin-detail-panel-title">Danh sách bài hát</p>
                  <p className="admin-detail-panel-note">
                    Các bài hát đang thuộc album này để bạn kiểm tra nhanh trước khi
                    chỉnh sửa.
                  </p>
                  <div className="mt-4 admin-detail-list">
                    {album.songs.map((song) => (
                      <div key={song.id} className="admin-detail-list-card">
                        <div className="admin-detail-list-thumb">
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

        <div className="admin-detail-actions">
          <button
            onClick={handleSoftDelete}
            disabled={loading || saving}
            className="admin-button admin-button-danger"
          >
            <FiTrash2 /> Xóa mềm
          </button>
          <button
            onClick={() => navigate("/admin/albums")}
            className="admin-button admin-button-ghost"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving || loading}
            className="admin-button admin-button-primary"
          >
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </div>
    </div>
  );
}

