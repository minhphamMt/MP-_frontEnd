import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiSave, FiUser } from "react-icons/fi";
import useAuthStore from "../../store/auth.store";
import { getMyArtistProfile, updateArtist } from "../../api/artist.api";

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
      setError("Cập nhật hồ sơ thất bại. Hãy thử lại nhé.");
    } finally {
      setSaving(false);
    }
  };

  const coverPreview = useMemo(
    () => formValues.cover_url || formValues.avatar_url || "",
    [formValues.cover_url, formValues.avatar_url]
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#121212] p-6 text-white/70">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          Đang tải hồ sơ nghệ sĩ...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen space-y-8 bg-[#121212] px-4 py-6 sm:px-8">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_25px_80px_rgba(0,0,0,0.45)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.35em] text-white/50">
              Nghệ sĩ
            </p>
            <h1 className="mt-2 text-3xl font-extrabold text-white">
              Hồ sơ nghệ sĩ
            </h1>
            <p className="mt-2 text-sm text-white/60">
              Cập nhật thông tin công khai để người nghe hiểu rõ về bạn.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/artist/dashboard")}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70 transition hover:border-white/30 hover:bg-white/10"
          >
            <FiArrowLeft />
            Quay lại tổng quan
          </button>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]"
      >
        <div className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_25px_80px_rgba(0,0,0,0.45)]">
            <h2 className="text-lg font-semibold text-white">Thông tin chung</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="text-sm text-white/70">
                  Tên nghệ sĩ <span className="text-rose-300">*</span>
                </label>
                <input
                  name="name"
                  value={formValues.name}
                  onChange={handleChange}
                  placeholder="Ví dụ: Minh Phạm"
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white/80 outline-none transition focus:border-white/30 focus:bg-black/40"
                  required
                />
              </div>

              <div>
                <label className="text-sm text-white/70">Nghệ danh</label>
                <input
                  name="alias"
                  value={formValues.alias}
                  onChange={handleChange}
                  placeholder="Alias"
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white/80 outline-none transition focus:border-white/30 focus:bg-black/40"
                />
              </div>

              <div>
                <label className="text-sm text-white/70">Tên thật</label>
                <input
                  name="realname"
                  value={formValues.realname}
                  onChange={handleChange}
                  placeholder="Họ và tên"
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white/80 outline-none transition focus:border-white/30 focus:bg-black/40"
                />
              </div>

              <div>
                <label className="text-sm text-white/70">Ngày sinh</label>
                <input
                  type="date"
                  name="birthday"
                  value={formValues.birthday}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white/80 outline-none transition focus:border-white/30 focus:bg-black/40"
                />
              </div>

              <div>
                <label className="text-sm text-white/70">Quốc gia</label>
                <input
                  name="national"
                  value={formValues.national}
                  onChange={handleChange}
                  placeholder="Việt Nam"
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white/80 outline-none transition focus:border-white/30 focus:bg-black/40"
                />
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_25px_80px_rgba(0,0,0,0.45)]">
            <h2 className="text-lg font-semibold text-white">
              Hình ảnh & giới thiệu
            </h2>
            <div className="mt-6 space-y-4">
              <div>
                <label className="text-sm text-white/70">Avatar</label>
                <input
                  name="avatar_url"
                  value={formValues.avatar_url}
                  onChange={handleChange}
                  placeholder="https://..."
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

              <div>
                <label className="text-sm text-white/70">
                  Mô tả ngắn
                </label>
                <textarea
                  name="short_bio"
                  value={formValues.short_bio}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Giới thiệu ngắn gọn..."
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white/80 outline-none transition focus:border-white/30 focus:bg-black/40"
                />
              </div>

              <div>
                <label className="text-sm text-white/70">Tiểu sử</label>
                <textarea
                  name="bio"
                  value={formValues.bio}
                  onChange={handleChange}
                  rows={6}
                  placeholder="Chia sẻ câu chuyện về bạn..."
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white/80 outline-none transition focus:border-white/30 focus:bg-black/40"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-[0_25px_80px_rgba(0,0,0,0.45)]">
            <div className="relative h-44 w-full overflow-hidden">
              {coverPreview ? (
                <img
                  src={coverPreview}
                  alt="Cover preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-gradient-to-br from-white/10 to-white/5 text-3xl text-white/50">
                  <FiUser />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            </div>
            <div className="space-y-2 p-5">
              <h3 className="text-lg font-semibold text-white">
                {formValues.name || "Tên nghệ sĩ"}
              </h3>
              <p className="text-sm text-white/60">
                {formValues.short_bio || "Chưa có giới thiệu ngắn."}
              </p>
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
              disabled={saving}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#1db954] px-5 py-3 text-sm font-semibold text-black shadow-lg shadow-[#1db954]/40 transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-70"
            >
              <FiSave />
              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}