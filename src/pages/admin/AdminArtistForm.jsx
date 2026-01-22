import { useEffect, useMemo, useState } from "react";
import { FiCamera, FiChevronLeft } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import {
  createArtist,
  getArtistById,
  updateArtist,
} from "../../api/artist.api";
import Toast from "../../components/common/Toast";
import { resolveAssetUrl } from "../../utils/asset";

const emptyArtistPayload = {
  name: "",
  alias: "",
  realname: "",
  national: "",
  birthday: "",
  short_bio: "",
  bio: "",
  avatar_url: "",
  cover_url: "",
  user_id: "",
};

const formatDateInput = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

const buildArtistPayload = (payload, avatarFile) => {
  const normalized = Object.fromEntries(
    Object.entries(payload).map(([key, value]) => [
      key,
      value === "" ? undefined : value,
    ])
  );

  if (!avatarFile) {
    return normalized;
  }

  const formData = new FormData();
  formData.append("avatar", avatarFile);
  Object.entries(normalized).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      formData.append(key, value);
    }
  });
  return formData;
};

export default function AdminArtistForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [formValues, setFormValues] = useState({ ...emptyArtistPayload });
  const [avatarFile, setAvatarFile] = useState(null);
  const [artist, setArtist] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [toast, setToast] = useState({ title: "", message: "" });

  useEffect(() => {
    if (!isEdit) return;
    const loadArtist = async () => {
      try {
        setLoading(true);
        const res = await getArtistById(id);
        const payload = res?.data?.data ?? res?.data ?? null;
        if (!payload) {
          setErrorMessage("Không tìm thấy nghệ sĩ.");
          return;
        }
        setArtist(payload);
        setFormValues({
          name: payload.name || "",
          alias: payload.alias || "",
          realname: payload.realname || "",
          national: payload.national || "",
          birthday: formatDateInput(payload.birthday),
          short_bio: payload.short_bio || "",
          bio: payload.bio || "",
          avatar_url: payload.avatar_url || "",
          cover_url: payload.cover_url || "",
          user_id: payload.user_id ? `${payload.user_id}` : "",
        });
        setErrorMessage("");
      } catch (error) {
        console.error("Load artist failed", error);
        setErrorMessage("Không thể tải thông tin nghệ sĩ.");
      } finally {
        setLoading(false);
      }
    };
    loadArtist();
  }, [id, isEdit]);

  const avatarPreview = useMemo(() => {
    if (avatarFile) {
      return URL.createObjectURL(avatarFile);
    }
    if (formValues.avatar_url) {
      return resolveAssetUrl(formValues.avatar_url);
    }
    if (artist?.avatar_url) {
      return resolveAssetUrl(artist.avatar_url);
    }
    return null;
  }, [avatarFile, formValues.avatar_url, artist]);

  useEffect(() => {
    if (!avatarFile || !avatarPreview) return undefined;
    return () => URL.revokeObjectURL(avatarPreview);
  }, [avatarFile, avatarPreview]);

  const handleChange = (field) => (event) => {
    const { value } = event.target;
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formValues.name.trim()) {
      setErrorMessage("Vui lòng nhập tên nghệ sĩ.");
      return;
    }
    try {
      setSaving(true);
      setErrorMessage("");
      const payload = buildArtistPayload(formValues, avatarFile);
      if (isEdit) {
        await updateArtist(id, payload);
        setToast({ title: "Thành công", message: "Lưu thành công." });
      } else {
        await createArtist(payload);
        navigate("/admin/artists", {
          replace: true,
          state: { toast: { title: "Thành công", message: "Lưu thành công." } },
        });
      }
    } catch (error) {
      console.error("Save artist failed", error);
      setErrorMessage(
        isEdit ? "Không thể cập nhật nghệ sĩ." : "Không thể tạo nghệ sĩ."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen space-y-6 bg-[#121212] px-4 py-6 sm:px-8">
      <button
        onClick={() => navigate("/admin/artists")}
        className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white/80 transition hover:border-white/30 hover:bg-white/10"
      >
        <FiChevronLeft /> Quay lại danh sách
      </button>

      <div className="rounded-3xl border border-white/10 bg-[#181818] p-5 shadow-[0_25px_80px_rgba(0,0,0,0.45)] sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.35em] text-white/50">
              Quản trị
            </p>
            <h1 className="text-2xl font-semibold text-white">
              {isEdit ? "Chỉnh sửa nghệ sĩ" : "Tạo nghệ sĩ mới"}
            </h1>
          </div>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="inline-flex items-center justify-center rounded-full bg-emerald-400 px-4 py-2 text-xs font-semibold text-black shadow-lg shadow-emerald-400/30 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {saving ? "Đang lưu..." : isEdit ? "Lưu cập nhật" : "Tạo nghệ sĩ"}
          </button>
        </div>

        {errorMessage && (
          <div className="mt-4 rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
            {errorMessage}
          </div>
        )}

        {loading ? (
          <div className="mt-6 text-sm text-white/60">Đang tải dữ liệu...</div>
        ) : (
          <div className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm font-semibold text-white">
                {isEdit ? "Thông tin hiện tại" : "Ảnh đại diện"}
              </p>
              <div className="mt-4 flex flex-col gap-4">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt={formValues.name || "Artist avatar"}
                    className="h-56 w-full rounded-2xl object-cover shadow-lg"
                  />
                ) : (
                  <div className="flex h-56 items-center justify-center rounded-2xl bg-white/10 text-sm text-white/60">
                    Chưa có ảnh đại diện
                  </div>
                )}
                <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70 transition hover:bg-white/10">
                  <FiCamera /> {isEdit ? "Tải avatar mới" : "Chọn avatar"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0] || null;
                      setAvatarFile(file);
                    }}
                  />
                </label>
                {isEdit && artist && (
                  <div className="space-y-2 text-sm text-white/70">
                    <p>
                      <span className="text-white/60">Tên nghệ sĩ:</span>{" "}
                      <span className="text-white">
                        {artist.name || "Chưa cập nhật"}
                      </span>
                    </p>
                    <p>
                      <span className="text-white/60">Alias:</span>{" "}
                      <span className="text-white">{artist.alias || "-"}</span>
                    </p>
                    <p>
                      <span className="text-white/60">Zing ID:</span>{" "}
                      <span className="text-white">
                        {artist.zing_artist_id || "-"}
                      </span>
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm font-semibold text-white">
                {isEdit ? "Cập nhật nghệ sĩ" : "Thông tin nghệ sĩ"}
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <input
                  value={formValues.name}
                  onChange={handleChange("name")}
                  placeholder="Tên nghệ sĩ"
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-white/40 focus:border-emerald-400/60 focus:outline-none"
                />
                <input
                  value={formValues.alias}
                  onChange={handleChange("alias")}
                  placeholder="Alias"
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-white/40 focus:border-emerald-400/60 focus:outline-none"
                />
                <input
                  value={formValues.realname}
                  onChange={handleChange("realname")}
                  placeholder="Tên thật"
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-white/40 focus:border-emerald-400/60 focus:outline-none"
                />
                <input
                  value={formValues.national}
                  onChange={handleChange("national")}
                  placeholder="Quốc gia"
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-white/40 focus:border-emerald-400/60 focus:outline-none"
                />
                <input
                  type="date"
                  value={formValues.birthday}
                  onChange={handleChange("birthday")}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 focus:border-emerald-400/60 focus:outline-none"
                />
                <input
                  value={formValues.user_id}
                  onChange={handleChange("user_id")}
                  placeholder="User ID liên kết (tuỳ chọn)"
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-white/40 focus:border-emerald-400/60 focus:outline-none"
                />
                <input
                  value={formValues.avatar_url}
                  onChange={handleChange("avatar_url")}
                  placeholder="Avatar URL (nếu không upload)"
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-white/40 focus:border-emerald-400/60 focus:outline-none sm:col-span-2"
                />
                <input
                  value={formValues.cover_url}
                  onChange={handleChange("cover_url")}
                  placeholder="Cover URL"
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-white/40 focus:border-emerald-400/60 focus:outline-none sm:col-span-2"
                />
                <input
                  value={formValues.short_bio}
                  onChange={handleChange("short_bio")}
                  placeholder="Tiểu sử ngắn"
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-white/40 focus:border-emerald-400/60 focus:outline-none sm:col-span-2"
                />
                <textarea
                  value={formValues.bio}
                  onChange={handleChange("bio")}
                  placeholder="Tiểu sử chi tiết"
                  className="min-h-[140px] rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-white/40 focus:border-emerald-400/60 focus:outline-none sm:col-span-2"
                />
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleSubmit}
                  disabled={saving}
                  className="rounded-full bg-emerald-400 px-4 py-2 text-xs font-semibold text-black shadow-lg shadow-emerald-400/30 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {saving ? "Đang lưu..." : isEdit ? "Lưu cập nhật" : "Tạo nghệ sĩ"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <Toast
        title={toast.title}
        message={toast.message}
        onClose={() => setToast({ title: "", message: "" })}
      />
    </div>
  );
}