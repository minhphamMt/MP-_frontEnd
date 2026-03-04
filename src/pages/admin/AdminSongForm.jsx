import { useEffect, useMemo, useState } from "react";
import { FiChevronLeft, FiTrash2 } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import { listAdminSongs, listGenres, updateAdminSong } from "../../api/admin.api";
import { deleteSong, getSongById } from "../../api/song.api";
import { resolveAssetUrl } from "../../utils/asset";
import OptimizedImage from "../../components/common/OptimizedImage";
import { confirmAdminAction } from "../../utils/adminDialog";

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
    <div className="admin-page-shell min-h-screen space-y-6 px-4 py-6 sm:px-8">
      <button
        onClick={() => navigate("/admin/songs")}
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
              Chỉnh sửa bài hát
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
                  <p className="text-xs font-semibold text-white sm:text-sm">Ảnh đại diện</p>
                  <div className="mt-4 flex flex-col gap-4">
                    {coverPreview ? (
                      <OptimizedImage
                        src={coverPreview}
                        alt={formValues.title || "Song cover"}
                        className="h-56 w-full rounded-2xl bg-black/40 object-contain shadow-lg"
                      />
                    ) : (
                      <div className="flex h-56 items-center justify-center rounded-2xl bg-white/10 text-xs text-white/60 sm:text-sm">
                        Chưa có ảnh bài hát
                      </div>
                    )}
                    <input
                      value={formValues.cover_url}
                      onChange={(event) =>
                        setFormValues((prev) => ({
                          ...prev,
                          cover_url: event.target.value,
                        }))
                      }
                      placeholder="Cover URL (nếu không upload)"
                      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs text-white placeholder:text-white/40 focus:border-emerald-400/60 focus:outline-none sm:text-sm"
                    />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(event) => setCoverFile(event.target.files?.[0] || null)}
                      className="rounded-2xl border border-dashed border-white/10 bg-black/20 px-4 py-3 text-xs text-white/70 file:mr-4 file:rounded-full file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-white/80 md:hover:border-white/20"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block text-xs text-white/70 sm:col-span-2 sm:text-sm">
                    Tên bài hát
                    <input
                      value={formValues.title}
                      onChange={(event) =>
                        setFormValues((prev) => ({
                          ...prev,
                          title: event.target.value,
                        }))
                      }
                      className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs text-white focus:border-emerald-400/60 focus:outline-none sm:text-sm"
                    />
                  </label>

                  <label className="block text-xs text-white/70 sm:text-sm">
                    Trạng thái
                    <select
                      value={formValues.status}
                      onChange={(event) =>
                        setFormValues((prev) => ({
                          ...prev,
                          status: event.target.value,
                        }))
                      }
                      className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs text-white sm:text-sm"
                    >
                      {STATUS_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value} className="text-black">
                          {option.label}
                        </option>
                      ))}
                    </select>
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
                      className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs text-white focus:border-emerald-400/60 focus:outline-none sm:text-sm"
                    />
                  </label>
                </div>
              </div>

              <div className="mt-6">
                <p className="text-xs text-white/70 sm:text-sm">Thể loại</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {visibleGenres.map((genre) => {
                    const isActive = formValues.genres.includes(genre.name);
                    return (
                      <button
                        key={genre.id}
                        type="button"
                        onClick={() => handleToggleGenre(genre.name)}
                        className={`rounded-full border px-4 py-1 text-xs transition ${
                          isActive
                            ? "border-emerald-400/60 bg-emerald-400/20 text-emerald-100"
                            : "border-white/10 bg-white/5 text-white/70 md:hover:border-white/30"
                        }`}
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
                      className="text-xs font-semibold text-white/70 transition md:hover:text-white sm:text-sm"
                    >
                      {showAllGenres ? "Thu gọn" : "Xem thêm"}
                    </button>
                  </div>
                )}
              </div>
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
            onClick={() => navigate("/admin/songs")}
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

