import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiSave } from "react-icons/fi";
import { createAlbum, getAlbumById, updateAlbum } from "../../api/album.api";
import DateInputField from "../../components/common/DateInputField";
import SourceFileCard from "../../components/common/SourceFileCard";
import { resolveAssetUrl } from "../../utils/asset";
import { formatDateDisplay, normalizeDateInputValue } from "../../utils/date";
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
          release_date: normalizeDateInputValue(album?.release_date),
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
  const releaseDateDisplay = useMemo(
    () => formatDateDisplay(formValues.release_date, "Chưa có ngày phát hành"),
    [formValues.release_date]
  );

  useEffect(() => {
    if (!coverFile || !coverPreview) return;
    return () => URL.revokeObjectURL(coverPreview);
  }, [coverFile, coverPreview]);

  return (
    <div className="artist-list-page">
      <section className="artist-detail-shell">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="artist-label">Album Editor</p>
            <h1 className="mt-2 text-3xl font-black text-white">
              {isEdit ? "Chỉnh sửa album" : "Tạo album mới"}
            </h1>
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

      <form onSubmit={handleSubmit} className="artist-detail-grid is-two-column">
        <div className="space-y-6">
          <section className="artist-detail-panel">
            <p className="artist-detail-panel-title">Thông tin cơ bản</p>
            <div className="mt-5 space-y-4">
              <label className="artist-detail-label is-full">
                Tên album <span className="text-rose-300">*</span>
                <input
                  name="title"
                  value={formValues.title}
                  onChange={handleChange}
                  placeholder="Ví dụ: Bầu trời đêm"
                  className="artist-input mt-2"
                  required
                />
              </label>

              <label className="artist-detail-label is-full">
                Ngày phát hành
                <DateInputField
                  name="release_date"
                  value={formValues.release_date}
                  onChange={(value) =>
                    setFormValues((prev) => ({ ...prev, release_date: value }))
                  }
                  className="artist-input mt-2"
                />
              </label>
            </div>
          </section>

          <section className="artist-detail-panel">
            <p className="artist-detail-panel-title">Artwork</p>
            <div className="artist-upload-cluster mt-5">
              <SourceFileCard
                variant="artist"
                type="image"
                file={coverFile}
                url={formValues.cover_url}
                emptyLabel="Chưa có artwork"
                helperText="PNG/JPG • Chọn artwork để tải lên"
                existingText="PNG/JPG • Đang dùng artwork hiện tại"
                pendingText="PNG/JPG • Ảnh mới sẽ được áp dụng khi lưu"
              />

              <div className="artist-file-dropzone">
                <div className="artist-file-name">
                  <strong>{coverFile ? "Ảnh mới đã chọn" : "Tải artwork từ máy"}</strong>
                      <span>{coverFile?.name || "PNG/JPG"}</span>
                    </div>
                <label className="artist-file-trigger" htmlFor="artist-album-cover-upload">
                  {coverFile ? "Đổi ảnh" : "Chọn ảnh"}
                </label>
                <input
                  id="artist-album-cover-upload"
                  type="file"
                  accept="image/*"
                  onChange={(event) => setCoverFile(event.target.files?.[0] || null)}
                  className="artist-file-input"
                />
              </div>
            </div>
          </section>

          <section className="artist-detail-panel">
            <p className="artist-detail-panel-title">Thông tin nâng cao</p>
            <div className="mt-5">
              <label className="artist-detail-label is-full">
                Zing album ID
                <input
                  name="zing_album_id"
                  value={formValues.zing_album_id}
                  onChange={handleChange}
                  placeholder="Mã định danh từ nguồn ngoài (nếu có)"
                  className="artist-input mt-2"
                />
              </label>
            </div>
          </section>
        </div>

        <div className="artist-preview-stack lg:sticky lg:top-4">
          <section className="artist-detail-panel">
            <p className="artist-detail-panel-title">Xem trước</p>
            <div className="artist-preview-stage is-cover mt-5">
              {coverPreview && (
                <>
                  <div
                    className="artist-preview-backdrop"
                    style={{ backgroundImage: `url(${coverPreview})` }}
                  />
                  <div className="artist-preview-overlay" />
                </>
              )}
              {coverPreview ? (
                <div className="artist-preview-canvas">
                  <OptimizedImage src={coverPreview} alt="Ảnh bìa album" className="h-full w-full" />
                </div>
              ) : (
                <div className="artist-preview-empty">
                  <div className="artist-preview-caption">
                    <strong>Chưa có artwork</strong>
                    <span>Thêm ảnh bìa</span>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-5 space-y-4">
              <div className="artist-preview-caption">
                <strong>{formValues.title || "Tên album"}</strong>
                <span>
                  {formValues.release_date
                    ? `Phát hành: ${releaseDateDisplay}`
                    : "Chưa có ngày phát hành"}
                </span>
              </div>

              <div className="artist-preview-meta-grid">
                <div className="artist-preview-meta-card">
                  <strong>Nguồn ảnh</strong>
                  <span>{coverFile ? "File mới từ máy" : formValues.cover_url ? "File hiện tại" : "Chưa có"}</span>
                </div>
                <div className="artist-preview-meta-card">
                  <strong>Mã ngoài</strong>
                  <span>{formValues.zing_album_id || "Chưa gắn Zing album ID"}</span>
                </div>
              </div>
            </div>
          </section>

          <section className="artist-detail-panel">
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
