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
import OptimizedImage from "../../components/common/OptimizedImage";

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
    <div className="admin-page-shell admin-list-page min-h-screen space-y-6 px-4 py-6 sm:px-8">
      <button
        onClick={() => navigate("/admin/artists")}
        className="admin-button admin-button-ghost"
      >
        <FiChevronLeft /> Quay lại danh sách
      </button>

      <div className="admin-detail-shell">
        <div className="admin-detail-header">
          <div className="admin-detail-heading">
            <p className="admin-list-kicker">Quản trị</p>
            <h1 className="admin-list-title">
              {isEdit ? "Chỉnh sửa nghệ sĩ" : "Tạo nghệ sĩ mới"}
            </h1>
            <p className="admin-list-summary">
              Một biểu mẫu gọn, đồng bộ với admin mới, tập trung vào nhận diện nghệ sĩ
              và phần mô tả quan trọng.
            </p>
          </div>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="admin-button admin-button-primary"
          >
            {saving ? "Đang lưu..." : isEdit ? "Lưu cập nhật" : "Tạo nghệ sĩ"}
          </button>
        </div>

        {errorMessage && (
          <div className="admin-alert rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-xs text-rose-100 sm:text-sm">
            {errorMessage}
          </div>
        )}

        {loading ? (
          <div className="admin-loading-state admin-detail-panel">Đang tải dữ liệu...</div>
        ) : (
          <div className="admin-detail-grid is-two-column">
            <div className="admin-detail-panel">
              <p className="admin-detail-panel-title">
                {isEdit ? "Thông tin hiện tại" : "Ảnh đại diện"}
              </p>
              <p className="admin-detail-panel-note">
                Ưu tiên một avatar rõ nét và kiểm tra nhanh các thông tin nhận diện
                chính trước khi lưu.
              </p>
              <div className="mt-4 flex flex-col gap-4">
                {avatarPreview ? (
                  <div className="admin-detail-media is-square">
                    <OptimizedImage
                      src={avatarPreview}
                      alt={formValues.name || "Artist avatar"}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="admin-detail-placeholder">
                    Chưa có ảnh đại diện
                  </div>
                )}
                <label className="admin-button admin-button-ghost cursor-pointer">
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

                <div className="admin-detail-meta-grid">
                  <div className="admin-detail-meta-card">
                    <p className="admin-detail-meta-label">Tên nghệ sĩ</p>
                    <p className="admin-detail-meta-value">
                      {artist?.name || formValues.name || "Chưa cập nhật"}
                    </p>
                  </div>
                  <div className="admin-detail-meta-card">
                    <p className="admin-detail-meta-label">Alias</p>
                    <p className="admin-detail-meta-value">
                      {artist?.alias || formValues.alias || "-"}
                    </p>
                  </div>
                  <div className="admin-detail-meta-card">
                    <p className="admin-detail-meta-label">Zing ID</p>
                    <p className="admin-detail-meta-value">
                      {artist?.zing_artist_id || "-"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="admin-detail-panel">
              <p className="admin-detail-panel-title">
                {isEdit ? "Cập nhật nghệ sĩ" : "Thông tin nghệ sĩ"}
              </p>
              <p className="admin-detail-panel-note">
                Giữ form ngắn, rõ và chỉ hiển thị những trường thật sự cần thiết cho
                việc quản trị.
              </p>
              <div className="mt-4 admin-detail-form-grid">
                <input
                  value={formValues.name}
                  onChange={handleChange("name")}
                  placeholder="Tên nghệ sĩ"
                  className="admin-field"
                />
                <input
                  value={formValues.alias}
                  onChange={handleChange("alias")}
                  placeholder="Alias"
                  className="admin-field"
                />
                <input
                  value={formValues.realname}
                  onChange={handleChange("realname")}
                  placeholder="Tên thật"
                  className="admin-field"
                />
                <input
                  value={formValues.national}
                  onChange={handleChange("national")}
                  placeholder="Quốc gia"
                  className="admin-field"
                />
                <input
                  type="date"
                  value={formValues.birthday}
                  onChange={handleChange("birthday")}
                  className="admin-field"
                />
                <input
                  value={formValues.avatar_url}
                  onChange={handleChange("avatar_url")}
                  placeholder="Avatar URL (nếu không upload)"
                  className="admin-field sm:col-span-2"
                />
                <input
                  value={formValues.cover_url}
                  onChange={handleChange("cover_url")}
                  placeholder="Cover URL"
                  className="admin-field sm:col-span-2"
                />
                <input
                  value={formValues.short_bio}
                  onChange={handleChange("short_bio")}
                  placeholder="Tiểu sử ngắn"
                  className="admin-field sm:col-span-2"
                />
                <textarea
                  value={formValues.bio}
                  onChange={handleChange("bio")}
                  placeholder="Tiểu sử chi tiết"
                  className="admin-field admin-detail-textarea sm:col-span-2"
                />
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleSubmit}
                  disabled={saving}
                  className="admin-button admin-button-primary"
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
