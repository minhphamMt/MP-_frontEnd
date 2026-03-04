import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiSave } from "react-icons/fi";
import { createAlbum, getAlbumById, updateAlbum } from "../../api/album.api";
import { resolveAssetUrl } from "../../utils/asset";
import OptimizedImage from "../../components/common/OptimizedImage";

const emptyForm = {
  title: "",
  release_date: "",
  cover_url: "",
  zing_album_id: "",
};

export default function ArtistAlbumForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [formValues, setFormValues] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [coverFile, setCoverFile] = useState(null);

  useEffect(() => {
    if (!isEdit) return;

    const loadAlbum = async () => {
      try {
        setLoading(true);
        const res = await getAlbumById(id);
        const album = res?.data?.data || res?.data;
        setFormValues({
          title: album?.title || "",
          release_date: album?.release_date ? album.release_date.split("T")[0] : "",
          cover_url: album?.cover_url || "",
          zing_album_id: album?.zing_album_id || "",
        });
      } catch (err) {
        console.error("Load album failed", err);
        setError("Không thể tải thông tin album.");
      } finally {
        setLoading(false);
      }
    };

    loadAlbum();
  }, [id, isEdit]);

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
      let payload = {
        title: formValues.title.trim(),
        release_date: formValues.release_date || null,
        cover_url: formValues.cover_url || null,
        zing_album_id: formValues.zing_album_id || null,
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

      if (isEdit) {
        await updateAlbum(id, payload);
      } else {
        await createAlbum(payload);
      }

      navigate("/artist/albums");
    } catch (err) {
      console.error("Save album failed", err);
      setError("Lưu album thất bại. Hãy thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const coverPreview = useMemo(() => {
    if (coverFile) {
      return URL.createObjectURL(coverFile);
    }
    return formValues.cover_url ? resolveAssetUrl(formValues.cover_url) : null;
  }, [coverFile, formValues.cover_url]);

  useEffect(() => {
    if (!coverFile || !coverPreview) return;
    return () => URL.revokeObjectURL(coverPreview);
  }, [coverFile, coverPreview]);

  return (
    <div className="space-y-6">
      <section className="artist-page-shell artist-glass p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="artist-label">Album Editor</p>
            <h1 className="mt-2 text-3xl font-black text-white">
              {isEdit ? "Chỉnh sửa album" : "Tạo album mới"}
            </h1>
            <p className="mt-2 text-sm text-white/65">
              {isEdit
                ? "Cập nhật metadata và hình ảnh bìa album."
                : "Điền thông tin để khởi tạo album mới."}
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/artist/albums")}
            className="artist-btn-secondary inline-flex items-center gap-2 px-4 py-2 text-sm"
          >
            <FiArrowLeft />
            Quay lại danh sách
          </button>
        </div>
      </section>

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1.12fr_0.88fr]">
        <div className="space-y-6">
          <section className="artist-page-shell artist-glass p-6">
            <h2 className="text-lg font-semibold text-white">Thông tin cơ bản</h2>
            <div className="mt-5 space-y-4">
              <div>
                <label className="text-sm text-white/75">
                  Tên album <span className="text-rose-300">*</span>
                </label>
                <input
                  name="title"
                  value={formValues.title}
                  onChange={handleChange}
                  placeholder="Ví dụ: Bầu trời đêm"
                  className="artist-input mt-2"
                  required
                />
              </div>

              <div>
                <label className="text-sm text-white/75">Ngày phát hành</label>
                <input
                  name="release_date"
                  type="date"
                  value={formValues.release_date}
                  onChange={handleChange}
                  className="artist-input mt-2"
                />
              </div>

              <div>
                <label className="text-sm text-white/75">Ảnh bìa (URL)</label>
                <input
                  name="cover_url"
                  value={formValues.cover_url}
                  onChange={handleChange}
                  placeholder="https://..."
                  className="artist-input mt-2"
                />
                <div className="mt-3">
                  <label className="text-xs text-white/55">Hoặc tải ảnh từ máy (PNG/JPG)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) => setCoverFile(event.target.files?.[0] || null)}
                    className="mt-2 block w-full rounded-2xl border border-dashed border-white/15 bg-black/25 px-4 py-3 text-xs text-white/75 file:mr-3 file:rounded-full file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-white"
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="artist-page-shell artist-glass p-6">
            <h2 className="text-lg font-semibold text-white">Thông tin nâng cao</h2>
            <div className="mt-5">
              <label className="text-sm text-white/75">Zing album ID</label>
              <input
                name="zing_album_id"
                value={formValues.zing_album_id}
                onChange={handleChange}
                placeholder="Mã định danh từ nguồn ngoài (nếu có)"
                className="artist-input mt-2"
              />
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="artist-page-shell artist-glass p-6">
            <h2 className="text-lg font-semibold text-white">Xem trước</h2>
            <div className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-[#111]">
              {coverPreview ? (
                <OptimizedImage
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
                <h3 className="text-lg font-semibold text-white">{formValues.title || "Tên album"}</h3>
                <p className="text-sm text-white/65">
                  {formValues.release_date
                    ? `Phát hành: ${formValues.release_date}`
                    : "Chưa có ngày phát hành"}
                </p>
              </div>
            </div>
          </section>

          <section className="artist-page-shell artist-glass p-6">
            {error && (
              <div className="mb-4 rounded-2xl border border-rose-400/40 bg-rose-500/10 p-3 text-sm text-rose-100">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="artist-btn-primary inline-flex w-full items-center justify-center gap-2 px-5 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-70"
            >
              <FiSave />
              {loading ? "Đang lưu..." : isEdit ? "Lưu thay đổi" : "Tạo album"}
            </button>
          </section>
        </div>
      </form>
    </div>
  );
}
