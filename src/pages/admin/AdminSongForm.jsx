import { useEffect, useMemo, useState } from "react";
import { FiChevronLeft, FiTrash2 } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import { listAdminSongs, listGenres, updateAdminSong } from "../../api/admin.api";
import { deleteSong, getSongById } from "../../api/song.api";
import { resolveAssetUrl } from "../../utils/asset";
import OptimizedImage from "../../components/common/OptimizedImage";
import { confirmAdminAction } from "../../utils/adminDialog";
import { getArtistLabel } from "../../utils/artist";

const normalizeGenreValue = (genres) => {
  if (!genres) return [];
  if (Array.isArray(genres)) {
    return genres
      .map((genre) => (typeof genre === "string" ? genre : genre?.name))
      .filter(Boolean);
  }
  if (typeof genres === "string") {
    return genres
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
};

const getSongCover = (song) =>
  song?.cover_url ||
  song?.cover ||
  song?.thumbnail ||
  song?.image ||
  song?.album_cover;

const STATUS_OPTIONS = [
  { value: "", label: "Không đổi" },
  { value: "pending", label: "pending" },
  { value: "approved", label: "approved" },
  { value: "rejected", label: "rejected" },
];

const getStatusLabel = (status) => {
  switch (status) {
    case "approved":
      return "Đã duyệt";
    case "pending":
      return "Chờ duyệt";
    case "rejected":
      return "Từ chối";
    default:
      return "Chưa cập nhật";
  }
};

export default function AdminSongForm() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [song, setSong] = useState(null);
  const [genres, setGenres] = useState([]);
  const [coverFile, setCoverFile] = useState(null);
  const [showAllGenres, setShowAllGenres] = useState(false);
  const [formValues, setFormValues] = useState({
    title: "",
    artist_id: "",
    album_id: "",
    status: "",
    release_date: "",
    genres: [],
    cover_url: "",
  });

  const loadGenres = async () => {
    try {
      const res = await listGenres({ page: 1, limit: 200 });
      const payload = res?.data?.data ?? res?.data ?? [];
      const list = Array.isArray(payload)
        ? payload
        : payload.items || payload.genres || [];
      setGenres(list);
    } catch (error) {
      console.error("Load genres failed", error);
      setGenres([]);
    }
  };

  const loadSong = async () => {
    if (!id) {
      setErrorMessage("Không tìm thấy bài hát.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await getSongById(id);
      const payload = res?.data?.data ?? res?.data ?? null;
      const detail = payload?.song || payload;

      if (!detail) {
        throw new Error("Song detail is empty");
      }

      setSong(detail);
      setFormValues({
        title: detail?.title || "",
        artist_id: detail?.artist_id ? `${detail.artist_id}` : "",
        album_id: detail?.album_id ? `${detail.album_id}` : "",
        status: detail?.status || "",
        release_date: detail?.release_date
          ? new Date(detail.release_date).toISOString().slice(0, 10)
          : "",
        genres: normalizeGenreValue(detail?.genres),
        cover_url: getSongCover(detail) || "",
      });
      setErrorMessage("");
    } catch (error) {
      try {
        const fallbackRes = await listAdminSongs({
          page: 1,
          limit: 100,
          keyword: id,
          q: id,
        });
        const payload = fallbackRes?.data?.data ?? fallbackRes?.data ?? [];
        const list = Array.isArray(payload)
          ? payload
          : payload.items || payload.songs || [];
        const detail = list.find((item) => `${item.id}` === `${id}`);

        if (!detail) {
          setErrorMessage("Không thể tải thông tin bài hát.");
          setSong(null);
          return;
        }

        setSong(detail);
        setFormValues({
          title: detail?.title || "",
          artist_id: detail?.artist_id ? `${detail.artist_id}` : "",
          album_id: detail?.album_id ? `${detail.album_id}` : "",
          status: detail?.status || "",
          release_date: detail?.release_date
            ? new Date(detail.release_date).toISOString().slice(0, 10)
            : "",
          genres: normalizeGenreValue(detail?.genres),
          cover_url: getSongCover(detail) || "",
        });
        setErrorMessage("");
      } catch (fallbackError) {
        console.error("Load song failed", fallbackError);
        setErrorMessage("Không thể tải thông tin bài hát.");
        setSong(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGenres();
    loadSong();
  }, [id]);

  const coverPreview = useMemo(() => {
    if (coverFile) {
      return URL.createObjectURL(coverFile);
    }
    if (formValues.cover_url) {
      return resolveAssetUrl(formValues.cover_url);
    }
    if (song && getSongCover(song)) {
      return resolveAssetUrl(getSongCover(song));
    }
    return null;
  }, [coverFile, formValues.cover_url, song]);

  useEffect(() => {
    if (!coverFile || !coverPreview) return undefined;
    return () => URL.revokeObjectURL(coverPreview);
  }, [coverFile, coverPreview]);

  const { visibleGenres, canToggleGenres } = useMemo(() => {
    const maxVisibleGenres = 8;
    if (showAllGenres) {
      return { visibleGenres: genres, canToggleGenres: genres.length > maxVisibleGenres };
    }
    const activeSet = new Set(formValues.genres);
    const activeGenres = genres.filter((genre) => activeSet.has(genre.name));
    const inactiveGenres = genres.filter((genre) => !activeSet.has(genre.name));
    return {
      visibleGenres: [...activeGenres, ...inactiveGenres].slice(0, maxVisibleGenres),
      canToggleGenres: genres.length > maxVisibleGenres,
    };
  }, [formValues.genres, genres, showAllGenres]);

  const handleToggleGenre = (name) => {
    setFormValues((prev) => {
      const exists = prev.genres.includes(name);
      return {
        ...prev,
        genres: exists ? prev.genres.filter((genre) => genre !== name) : [...prev.genres, name],
      };
    });
  };

  const handleSubmit = async () => {
    if (!id || !song) return;
    if (!formValues.title.trim()) {
      setErrorMessage("Vui lòng nhập tên bài hát.");
      return;
    }

    try {
      setSaving(true);
      setErrorMessage("");

      let payload = {
        title: formValues.title || undefined,
        artist_id: formValues.artist_id || null,
        album_id: formValues.album_id || null,
        status: formValues.status || undefined,
        release_date: formValues.release_date || null,
        genres: formValues.genres,
        cover_url: formValues.cover_url || null,
      };

      if (coverFile) {
        const formData = new FormData();
        formData.append("cover", coverFile);
        Object.entries(payload).forEach(([key, value]) => {
          if (value === null || value === undefined || value === "") return;
          if (Array.isArray(value)) {
            value.filter(Boolean).forEach((item) => {
              formData.append(key, item);
            });
            return;
          }
          formData.append(key, value);
        });
        payload = formData;
      }

      await updateAdminSong(id, payload);
      navigate("/admin/songs", {
        replace: true,
        state: { toast: { title: "Thành công", message: "Đã cập nhật bài hát." } },
      });
    } catch (error) {
      console.error("Update song failed", error);
      setErrorMessage("Không thể cập nhật bài hát.");
    } finally {
      setSaving(false);
    }
  };

  const handleSoftDelete = async () => {
    if (!id || !song) return;
    const confirmed = await confirmAdminAction({
      title: "Xóa mềm bài hát",
      message: `Bạn có chắc muốn xóa mềm bài hát "${song.title}"?`,
      confirmText: "Xóa mềm",
      cancelText: "Hủy",
      tone: "danger",
    });
    if (!confirmed) return;

    try {
      await deleteSong(id);
      navigate("/admin/songs", {
        replace: true,
        state: { toast: { title: "Thành công", message: "Đã xóa mềm bài hát." } },
      });
    } catch (error) {
      console.error("Soft delete song failed", error);
      setErrorMessage("Không thể xóa mềm bài hát.");
    }
  };

  return (
    <div className="admin-page-shell admin-list-page min-h-screen space-y-6 px-4 py-6 sm:px-8">
      <button
        onClick={() => navigate("/admin/songs")}
        className="admin-button admin-button-ghost"
      >
        <FiChevronLeft /> Quay lại danh sách
      </button>

      <div className="admin-detail-shell">
        <div className="admin-detail-header">
          <div className="admin-detail-heading">
            <p className="admin-list-kicker">Quản trị</p>
            <h1 className="admin-list-title">Chỉnh sửa bài hát</h1>
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
                  <p className="admin-detail-panel-title">Ảnh bìa và thông tin nhanh</p>
                  <div className="mt-4 flex flex-col gap-4">
                    {coverPreview ? (
                      <div className="admin-detail-media is-square">
                        <OptimizedImage
                          src={coverPreview}
                          alt={formValues.title || "Song cover"}
                          className="h-full w-full bg-black/40 object-cover"
                        />
                      </div>
                    ) : (
                      <div className="admin-detail-placeholder">
                        Chưa có ảnh bài hát
                      </div>
                    )}
                    <div className="admin-detail-meta-grid">
                      <div className="admin-detail-meta-card">
                        <p className="admin-detail-meta-label">Bài hát</p>
                        <p className="admin-detail-meta-value">{song?.title || "Chưa cập nhật"}</p>
                      </div>
                      <div className="admin-detail-meta-card">
                        <p className="admin-detail-meta-label">Album</p>
                        <p className="admin-detail-meta-value">
                          {song?.album_title || "Single"}
                        </p>
                      </div>
                      <div className="admin-detail-meta-card">
                        <p className="admin-detail-meta-label">Nghệ sĩ</p>
                        <p className="admin-detail-meta-value">
                          {getArtistLabel(song, song?.artist_name || "") || "-"}
                        </p>
                      </div>
                      <div className="admin-detail-meta-card">
                        <p className="admin-detail-meta-label">Trạng thái</p>
                        <p className="admin-detail-meta-value">{getStatusLabel(song?.status)}</p>
                      </div>
                    </div>
                    <label className="admin-detail-label is-full">
                      Cover URL
                      <input
                        value={formValues.cover_url}
                        onChange={(event) =>
                          setFormValues((prev) => ({
                            ...prev,
                            cover_url: event.target.value,
                          }))
                        }
                        placeholder="Cover URL (nếu không upload)"
                        className="admin-field"
                      />
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(event) => setCoverFile(event.target.files?.[0] || null)}
                      className="admin-upload-field"
                    />
                  </div>
                </div>

                <div className="admin-detail-panel">
                  <p className="admin-detail-panel-title">Thông tin chỉnh sửa</p>
                  <div className="mt-4 admin-detail-form-grid">
                  <label className="admin-detail-label is-full">
                    Tên bài hát
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
                    Trạng thái
                    <select
                      value={formValues.status}
                      onChange={(event) =>
                        setFormValues((prev) => ({
                          ...prev,
                          status: event.target.value,
                        }))
                      }
                      className="admin-select-field"
                    >
                      {STATUS_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
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
                  </div>

                  <div className="mt-5">
                    <p className="admin-detail-panel-title">Thể loại</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {visibleGenres.map((genre) => {
                        const isActive = formValues.genres.includes(genre.name);
                        return (
                          <button
                            key={genre.id}
                            type="button"
                            onClick={() => handleToggleGenre(genre.name)}
                            className={`admin-toggle-chip ${isActive ? "is-active" : ""}`}
                          >
                            {genre.name}
                          </button>
                        );
                      })}
                    </div>
                    {canToggleGenres && (
                      <div className="mt-3">
                        <button
                          type="button"
                          onClick={() => setShowAllGenres((prev) => !prev)}
                          className="admin-button admin-button-ghost"
                        >
                          {showAllGenres ? "Thu gọn" : "Xem thêm"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
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
            onClick={() => navigate("/admin/songs")}
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

