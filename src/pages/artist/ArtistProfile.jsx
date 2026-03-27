import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiSave, FiUser } from "react-icons/fi";
import useAuthStore from "../../store/auth.store";
import { getMyArtistProfile, updateArtist, uploadArtistAvatar } from "../../api/artist.api";
import { ArtistProfileLoading } from "../../components/artist/ArtistLoadingState";
import { resolveAssetUrl } from "../../utils/asset";
import OptimizedImage from "../../components/common/OptimizedImage";

const emptyForm = {
  name: "",
  alias: "",
  realname: "",
  birthday: "",
  national: "",
  avatar_url: "",
  short_bio: "",
  bio: "",
};

export default function ArtistProfile() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);

  const [artistId, setArtistId] = useState(null);
  const [formValues, setFormValues] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const loadArtist = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getMyArtistProfile();
      const artist = res?.data?.data ?? res?.data ?? null;
      setArtistId(artist?.id ?? null);

      setFormValues({
        name: artist?.name || "",
        alias: artist?.alias || "",
        realname: artist?.realname || "",
        birthday: artist?.birthday ? artist.birthday.split("T")[0] : "",
        national: artist?.national || "",
        avatar_url: artist?.avatar_url || artist?.cover_url || "",
        short_bio: artist?.short_bio || "",
        bio: artist?.bio || "",
      });
    } catch (err) {
      console.error("Load artist profile failed", err);
      setError("Không thể tải thông tin nghệ sĩ.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadArtist();
  }, [loadArtist]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!formValues.name.trim()) {
      setError("Vui lòng nhập tên nghệ sĩ.");
      return;
    }

    if (!artistId) {
      setError("Không tìm thấy thông tin nghệ sĩ.");
      return;
    }

    try {
      setSaving(true);
      const normalizedAvatar = formValues.avatar_url || null;
      const payload = {
        name: formValues.name.trim(),
        alias: formValues.alias || null,
        realname: formValues.realname || null,
        birthday: formValues.birthday || null,
        national: formValues.national || null,
        avatar_url: normalizedAvatar,
        cover_url: normalizedAvatar,
        short_bio: formValues.short_bio || null,
        bio: formValues.bio || null,
      };

      const res = await updateArtist(artistId, payload);
      const updated = res?.data?.data ?? res?.data ?? payload;

      if (user) {
        updateUser({
          ...user,
          artist: {
            ...(user.artist || {}),
            ...updated,
          },
        });
      }
    } catch (err) {
      console.error("Update artist profile failed", err);
      setError("Cập nhật hồ sơ thất bại. Hãy thử lại.");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Vui lòng chọn tệp hình ảnh hợp lệ.");
      return;
    }

    try {
      setUploadingAvatar(true);
      const formData = new FormData();
      formData.append("avatar", file);

      const res = await uploadArtistAvatar(formData);
      const payload = res?.data?.data ?? res?.data ?? {};
      const avatarUrl = payload.avatar_url;
      const updatedArtist = payload.artist;

      if (avatarUrl) {
        setFormValues((prev) => ({
          ...prev,
          avatar_url: avatarUrl,
        }));
      }

      if (updatedArtist && user) {
        updateUser({
          ...user,
          artist: {
            ...(user.artist || {}),
            ...updatedArtist,
            cover_url: updatedArtist.cover_url || avatarUrl || updatedArtist.avatar_url,
          },
        });
      }
    } catch (err) {
      console.error("Upload artist avatar failed", err);
      setError("Tải avatar thất bại. Hãy thử lại.");
    } finally {
      setUploadingAvatar(false);
      event.target.value = "";
    }
  };

  const avatarPreview = useMemo(
    () => resolveAssetUrl(formValues.avatar_url || ""),
    [formValues.avatar_url],
  );
  const heroBackdropUrl = avatarPreview;

  if (loading) {
    return <ArtistProfileLoading />;
  }

  return (
    <div className="artist-list-page">
      <section className="artist-detail-shell">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="artist-label">Profile</p>
            <h1 className="mt-2 text-3xl font-black text-white">Hồ sơ nghệ sĩ</h1>
          </div>
          <button
            type="button"
            onClick={() => navigate("/artist/dashboard")}
            className="artist-btn-secondary inline-flex items-center gap-2 px-4 py-2 text-sm"
          >
            <FiArrowLeft />
            Quay lại tổng quan
          </button>
        </div>
      </section>

      <form onSubmit={handleSubmit} className="artist-detail-grid is-two-column">
        <div className="space-y-6">
          <section className="artist-detail-panel">
            <p className="artist-detail-panel-title">Thông tin chung</p>
            <div className="artist-detail-form-grid mt-5">
              <label className="artist-detail-label is-full">
                Tên nghệ sĩ <span className="text-rose-300">*</span>
                <input
                  name="name"
                  value={formValues.name}
                  onChange={handleChange}
                  placeholder="Ví dụ: Minh Phạm"
                  className="artist-input mt-2"
                  required
                />
              </label>

              <label className="artist-detail-label">
                Nghệ danh
                <input
                  name="alias"
                  value={formValues.alias}
                  onChange={handleChange}
                  placeholder="Alias"
                  className="artist-input mt-2"
                />
              </label>

              <label className="artist-detail-label">
                Tên thật
                <input
                  name="realname"
                  value={formValues.realname}
                  onChange={handleChange}
                  placeholder="Họ và tên"
                  className="artist-input mt-2"
                />
              </label>

              <label className="artist-detail-label">
                Ngày sinh
                <input
                  type="date"
                  name="birthday"
                  value={formValues.birthday}
                  onChange={handleChange}
                  className="artist-input mt-2"
                />
              </label>

              <label className="artist-detail-label">
                Quốc gia
                <input
                  name="national"
                  value={formValues.national}
                  onChange={handleChange}
                  placeholder="Việt Nam"
                  className="artist-input mt-2"
                />
              </label>
            </div>
          </section>

          <section className="artist-detail-panel">
            <p className="artist-detail-panel-title">Avatar và giới thiệu</p>
            <div className="artist-upload-cluster mt-5">
              <label className="artist-detail-label is-full">
                Avatar (URL)
                <input
                  name="avatar_url"
                  value={formValues.avatar_url}
                  onChange={handleChange}
                  placeholder="https://..."
                  className="artist-input mt-2"
                />
              </label>

              <div className="artist-file-dropzone">
                <div className="artist-file-name">
                  <strong>{uploadingAvatar ? "Đang tải avatar..." : "Tải avatar từ máy"}</strong>
                  <span>
                    {uploadingAvatar
                      ? "Đang cập nhật"
                      : "PNG/JPG"}
                  </span>
                </div>
                <label className="artist-file-trigger" htmlFor="artist-profile-avatar-upload">
                  {uploadingAvatar ? "Đang tải..." : "Chọn avatar"}
                </label>
                <input
                  id="artist-profile-avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  disabled={uploadingAvatar}
                  className="artist-file-input"
                />
              </div>

              <label className="artist-detail-label is-full">
                Mô tả ngắn
                <textarea
                  name="short_bio"
                  value={formValues.short_bio}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Giới thiệu ngắn gọn..."
                  className="artist-textarea mt-2"
                />
              </label>

              <label className="artist-detail-label is-full">
                Tiểu sử
                <textarea
                  name="bio"
                  value={formValues.bio}
                  onChange={handleChange}
                  rows={6}
                  placeholder="Chia sẻ câu chuyện về bạn..."
                  className="artist-textarea mt-2"
                />
              </label>
            </div>
          </section>
        </div>

        <div className="artist-preview-stack lg:sticky lg:top-4">
          <section className="artist-detail-panel">
            <p className="artist-detail-panel-title">Xem trước công khai</p>
            <div className="artist-profile-hero mt-5">
              {heroBackdropUrl ? (
                <div
                  className="artist-profile-hero-backdrop"
                  style={{ backgroundImage: `url(${heroBackdropUrl})` }}
                />
              ) : null}
              <div className="artist-profile-hero-overlay" />

              <div className="artist-profile-hero-content">
                <div className="artist-profile-hero-media">
                  {avatarPreview ? (
                    <OptimizedImage
                      src={avatarPreview}
                      alt="Avatar nghệ sĩ"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="artist-profile-hero-placeholder">
                      <FiUser className="text-5xl text-white/45" />
                    </div>
                  )}
                </div>

                <div className="artist-profile-hero-copy">
                  <p className="artist-profile-hero-kicker">Hồ sơ công khai</p>
                  <h3 className="artist-profile-hero-title">
                    {formValues.name || "Tên nghệ sĩ"}
                  </h3>
                  <p className="artist-profile-hero-text">
                    {formValues.short_bio || "Chưa có mô tả ngắn để hiển thị."}
                  </p>

                  <div className="artist-preview-meta-grid">
                    <div className="artist-preview-meta-card">
                      <strong>Nghệ danh</strong>
                      <span>{formValues.alias || "Chưa cập nhật"}</span>
                    </div>
                    <div className="artist-preview-meta-card">
                      <strong>Tên thật</strong>
                      <span>{formValues.realname || "Chưa cập nhật"}</span>
                    </div>
                    <div className="artist-preview-meta-card">
                      <strong>Quốc gia</strong>
                      <span>{formValues.national || "Chưa cập nhật"}</span>
                    </div>
                    <div className="artist-preview-meta-card">
                      <strong>Nội dung</strong>
                      <span>{formValues.bio ? "Đã có tiểu sử chi tiết" : "Chưa có tiểu sử"}</span>
                    </div>
                  </div>
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
              disabled={saving}
              className="artist-btn-primary inline-flex w-full items-center justify-center gap-2 px-5 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-70"
            >
              <FiSave />
              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </section>
        </div>
      </form>
    </div>
  );
}
