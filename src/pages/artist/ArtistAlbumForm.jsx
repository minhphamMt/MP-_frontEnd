import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiSave } from "react-icons/fi";
import useAuthStore from "../../store/auth.store";
import {
  createAlbum,
  getAlbumById,
  updateAlbum,
} from "../../api/album.api";

const emptyForm = {
  title: "",
  release_date: "",
  cover_url: "",
  zing_album_id: "",
  artist_id: "",
};

export default function ArtistAlbumForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const user = useAuthStore((s) => s.user);

  const [formValues, setFormValues] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const artistId = user?.artist?.id ?? user?.artist_id ?? user?.id ?? "";

  useEffect(() => {
    if (!isEdit) {
      setFormValues((prev) => ({ ...prev, artist_id: artistId }));
      return;
    }

    const loadAlbum = async () => {
      try {
        setLoading(true);
        const res = await getAlbumById(id);
        const album = res?.data?.data || res?.data;
        setFormValues({
          title: album?.title || "",
          release_date: album?.release_date
            ? album.release_date.split("T")[0]
            : "",
          cover_url: album?.cover_url || "",
          zing_album_id: album?.zing_album_id || "",
          artist_id: album?.artist_id || artistId,
        });
      } catch (err) {
        console.error("Load album failed", err);
        setError("Không thể tải thông tin album.");
      } finally {
        setLoading(false);
      }
    };

    loadAlbum();
  }, [artistId, id, isEdit]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!formValues.title.trim()) {
      setError("Vui lòng nhập tên album.");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        title: formValues.title,
        release_date: formValues.release_date || null,
        cover_url: formValues.cover_url || null,
        zing_album_id: formValues.zing_album_id || null,
        artist_id: formValues.artist_id || artistId || null,
      };

      if (isEdit) {
        await updateAlbum(id, payload);
      } else {
        await createAlbum(payload);
      }

      navigate("/artist/albums");
    } catch (err) {
      console.error("Save album failed", err);
      setError("Lưu album thất bại. Hãy thử lại nhé.");
    } finally {
      setLoading(false);
    }
  };

  const coverPreview = useMemo(() => {
    if (formValues.cover_url) return formValues.cover_url;
    return null;
  }, [formValues.cover_url]);

  return (
    <div className="min-h-screen space-y-8 bg-[#121212] px-4 py-6 sm:px-8">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_25px_80px_rgba(0,0,0,0.45)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.35em] text-white/50">
              Nghệ sĩ
            </p>
            <h1 className="mt-2 text-3xl font-extrabold text-white">
              {isEdit ? "Chỉnh sửa album" : "Tạo album mới"}
            </h1>
            <p className="mt-2 text-sm text-white/60">
              {isEdit
                ? "Cập nhật thông tin album của bạn."
                : "Điền thông tin để phát hành album mới."}
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/artist/albums")}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70 transition hover:border-white/30 hover:bg-white/10"
          >
            <FiArrowLeft />
            Quay lại danh sách
          </button>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]"
      >
        <div className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_25px_80px_rgba(0,0,0,0.45)]">
            <h2 className="text-lg font-semibold text-white">Thông tin cơ bản</h2>
            <div className="mt-6 space-y-4">
              <div>
                <label className="text-sm text-white/70">
                  Tên album <span className="text-rose-300">*</span>
                </label>
                <input
                  name="title"
                  value={formValues.title}
                  onChange={handleChange}
                  placeholder="Ví dụ: Bầu trời đêm"
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white/80 outline-none transition focus:border-white/30 focus:bg-black/40"
                  required
                />
              </div>

              <div>
                <label className="text-sm text-white/70">Ngày phát hành</label>
                <input
                  name="release_date"
                  type="date"
                  value={formValues.release_date}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white/80 outline-none transition focus:border-white/30 focus:bg-black/40"
                />
              </div>

              <div>
                <label className="text-sm text-white/70">Ảnh bìa</label>
                <input
                  name="cover_url"
                  value={formValues.cover_url}
                  onChange={handleChange}
                  placeholder="https://..."
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white/80 outline-none transition focus:border-white/30 focus:bg-black/40"
                />
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_25px_80px_rgba(0,0,0,0.45)]">
            <h2 className="text-lg font-semibold text-white">Thông tin nâng cao</h2>
            <div className="mt-6 space-y-4">
              <div>
                <label className="text-sm text-white/70">Zing album ID</label>
                <input
                  name="zing_album_id"
                  value={formValues.zing_album_id}
                  onChange={handleChange}
                  placeholder="Zing album id"
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white/80 outline-none transition focus:border-white/30 focus:bg-black/40"
                />
              </div>

              <div>
                <label className="text-sm text-white/70">Artist ID</label>
                <input
                  name="artist_id"
                  value={formValues.artist_id}
                  onChange={handleChange}
                  placeholder="Artist ID"
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white/80 outline-none transition focus:border-white/30 focus:bg-black/40"
                />
                <p className="mt-2 text-xs text-white/40">
                  ID nghệ sĩ sẽ tự động điền theo tài khoản hiện tại.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_25px_80px_rgba(0,0,0,0.45)]">
            <h2 className="text-lg font-semibold text-white">Xem trước</h2>
            <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-[#181818]">
              {coverPreview ? (
                <img
                  src={coverPreview}
                  alt="Ảnh bìa"
                  className="h-56 w-full object-cover"
                />
              ) : (
                <div className="flex h-56 items-center justify-center text-sm text-white/50">
                  Chưa có ảnh bìa
                </div>
              )}
              <div className="space-y-2 p-4">
                <h3 className="text-lg font-semibold text-white">
                  {formValues.title || "Tên album"}
                </h3>
                <p className="text-sm text-white/60">
                  {formValues.release_date
                    ? `Phát hành: ${formValues.release_date}`
                    : "Chưa có ngày phát hành"}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_25px_80px_rgba(0,0,0,0.45)]">
            {error && (
              <div className="mb-4 rounded-2xl border border-rose-400/40 bg-rose-500/10 p-3 text-sm text-rose-200">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#1db954] px-5 py-3 text-sm font-semibold text-black shadow-lg shadow-[#1db954]/40 transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-70"
            >
              <FiSave />
              {loading
                ? "Đang lưu..."
                : isEdit
                  ? "Lưu thay đổi"
                  : "Tạo album"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}