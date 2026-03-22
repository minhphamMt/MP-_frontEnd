import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiSave, FiUser } from "react-icons/fi";
import useAuthStore from "../../store/auth.store";
import { getMyArtistProfile, updateArtist, uploadArtistAvatar } from "../../api/artist.api";
import { resolveAssetUrl } from "../../utils/asset";
import OptimizedImage from "../../components/common/OptimizedImage";

const emptyForm = {
  name: "",
  alias: "",
  realname: "",
  birthday: "",
  national: "",
  avatar_url: "",
  cover_url: "",
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
        avatar_url: artist?.avatar_url || "",
        cover_url: artist?.cover_url || "",
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
      const payload = {
        name: formValues.name.trim(),
        alias: formValues.alias || null,
        realname: formValues.realname || null,
        birthday: formValues.birthday || null,
        national: formValues.national || null,
        avatar_url: formValues.avatar_url || null,
        cover_url: formValues.cover_url || null,
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
        setFormValues((prev) => ({ ...prev, avatar_url: avatarUrl }));
      }
      if (updatedArtist && user) {
        updateUser({
          ...user,
          artist: {
            ...(user.artist || {}),
            ...updatedArtist,
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

  const coverPreview = useMemo(() => {
    const preview = formValues.cover_url || formValues.avatar_url || "";
    return resolveAssetUrl(preview);
  }, [formValues.cover_url, formValues.avatar_url]);

  if (loading) {
    return (
      <div className="artist-soft-card p-5 text-sm text-white/70">
        Đang tải hồ sơ nghệ sĩ...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="artist-page-shell artist-glass p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="artist-label">Profile</p>
            <h1 className="mt-2 text-3xl font-black text-white">Hồ sơ nghệ sĩ</h1>
            <p className="mt-2 text-sm text-white/65">
              Cập nhật thông tin công khai giúp người nghe nhận diện thương hiệu của bạn.
            </p>
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

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <section className="artist-page-shell artist-glass p-6">
            <h2 className="text-lg font-semibold text-white">Thông tin chung</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="text-sm text-white/75">
                  Tên nghệ sĩ <span className="text-rose-300">*</span>
                </label>
                <input
                  name="name"
                  value={formValues.name}
                  onChange={handleChange}
                  placeholder="Ví dụ: Minh Phạm"
                  className="artist-input mt-2"
                  required
                />
              </div>

              <div>
                <label className="text-sm text-white/75">Nghệ danh</label>
                <input
                  name="alias"
                  value={formValues.alias}
                  onChange={handleChange}
                  placeholder="Alias"
                  className="artist-input mt-2"
                />
              </div>

              <div>
                <label className="text-sm text-white/75">Tên thật</label>
                <input
                  name="realname"
                  value={formValues.realname}
                  onChange={handleChange}
                  placeholder="Họ và tên"
                  className="artist-input mt-2"
                />
              </div>

              <div>
                <label className="text-sm text-white/75">Ngày sinh</label>
                <input
                  type="date"
                  name="birthday"
                  value={formValues.birthday}
                  onChange={handleChange}
                  className="artist-input mt-2"
                />
              </div>

              <div>
                <label className="text-sm text-white/75">Quốc gia</label>
                <input
                  name="national"
                  value={formValues.national}
                  onChange={handleChange}
                  placeholder="Việt Nam"
                  className="artist-input mt-2"
                />
              </div>
            </div>
          </section>

          <section className="artist-page-shell artist-glass p-6">
            <h2 className="text-lg font-semibold text-white">Hình ảnh và giới thiệu</h2>
            <div className="mt-5 space-y-4">
              <div>
                <label className="text-sm text-white/75">Avatar (URL)</label>
                <input
                  name="avatar_url"
                  value={formValues.avatar_url}
                  onChange={handleChange}
                  placeholder="https://..."
                  className="artist-input mt-2"
                />
                <div className="mt-3">
                  <label className="text-xs text-white/55">Hoặc tải avatar từ máy (PNG/JPG)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    disabled={uploadingAvatar}
                    className="mt-2 block w-full rounded-2xl border border-dashed border-white/15 bg-black/25 px-4 py-3 text-xs text-white/75 file:mr-3 file:rounded-full file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-white disabled:cursor-not-allowed disabled:opacity-70"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-white/75">Mô tả ngắn</label>
                <textarea
                  name="short_bio"
                  value={formValues.short_bio}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Giới thiệu ngắn gọn..."
                  className="artist-textarea mt-2"
                />
              </div>

              <div>
                <label className="text-sm text-white/75">Tiểu sử</label>
                <textarea
                  name="bio"
                  value={formValues.bio}
                  onChange={handleChange}
                  rows={6}
                  placeholder="Chia sẻ câu chuyện về bạn..."
                  className="artist-textarea mt-2"
                />
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="artist-page-shell artist-glass overflow-hidden">
            <div className="relative h-48 w-full overflow-hidden">
              {coverPreview ? (
                <OptimizedImage
                  src={coverPreview}
                  alt="Cover preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-[linear-gradient(135deg,rgba(56,189,248,0.22),rgba(59,130,246,0.14),rgba(5,10,18,0.96))] text-3xl text-white/50">
                  <FiUser />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            </div>
            <div className="space-y-2 p-5">
              <h3 className="text-lg font-semibold text-white">
                {formValues.name || "Tên nghệ sĩ"}
              </h3>
              <p className="text-sm text-white/65">
                {formValues.short_bio || "Chưa có mô tả ngắn."}
              </p>
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
