import { useEffect, useMemo, useState } from "react";
import {
  FiCamera,
  FiEdit2,
  FiPlus,
  FiRefreshCw,
  FiTrash2,
  FiUser,
  FiX,
} from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";
import { deleteArtist, getArtistById, getArtists, updateArtist } from "../../api/artist.api";
import Toast from "../../components/common/Toast";
import { resolveAssetUrl } from "../../utils/asset";
import { formatDateDisplay } from "../../utils/date";
import OptimizedImage from "../../components/common/OptimizedImage";
import { confirmAdminAction } from "../../utils/adminDialog";
import { searchAdmin } from "../../api/admin.api";
import {
  extractAdminSearchItems,
  filterAdminSearchItemsByType,
} from "../../utils/adminSearch";
import useDebouncedValue from "../../hooks/useDebouncedValue";

const formatDateInput = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

export default function AdminArtistList() {
  const navigate = useNavigate();
  const location = useLocation();
  const [artists, setArtists] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [toast, setToast] = useState({ title: "", message: "" });
  const [editingArtist, setEditingArtist] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const debouncedKeyword = useDebouncedValue(keyword.trim(), 320);
  const [editPayload, setEditPayload] = useState({
    name: "",
    alias: "",
    realname: "",
    national: "",
    birthday: "",
    short_bio: "",
    bio: "",
    avatar_url: "",
    cover_url: "",
  });

  const loadArtists = async (searchTerm = "") => {
    try {
      setLoading(true);
      let list = [];

      if (searchTerm) {
        const res = await searchAdmin({
          q: searchTerm,
          keyword: searchTerm,
          page: 1,
          limit: 100,
        });
        const payload = res?.data?.data ?? res?.data ?? [];
        list = filterAdminSearchItemsByType(
          extractAdminSearchItems(payload),
          "artist"
        );
      } else {
        const res = await getArtists({
          page: 1,
          limit: 200,
        });
        const payload = res?.data?.data ?? res?.data ?? [];
        list = Array.isArray(payload)
          ? payload
          : payload.items || payload.artists || [];
      }

      setArtists(list);
      setErrorMessage("");
    } catch (error) {
      console.error("Load artists failed", error);
      setErrorMessage("Không thể tải danh sách nghệ sĩ.");
      setArtists([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArtists(debouncedKeyword);
  }, [debouncedKeyword]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setKeyword(params.get("keyword") || "");
  }, [location.search]);

  useEffect(() => {
    const pendingToast = location.state?.toast;
    if (!pendingToast) return;
    setToast(pendingToast);
    navigate(location.pathname, { replace: true, state: {} });
  }, [location, navigate]);

  const handleDelete = async (artist) => {
    const confirmed = await confirmAdminAction({
      title: "Xóa mềm nghệ sĩ",
      message: `Bạn có chắc muốn xóa mềm nghệ sĩ "${artist.name}"? Nghệ sĩ sẽ nằm trong thùng rác.`,
      confirmText: "Xóa mềm",
      cancelText: "Hủy",
      tone: "danger",
    });
    if (!confirmed) return;
    try {
      await deleteArtist(artist.id);
      await loadArtists(keyword.trim());
      setToast({ title: "Thành công", message: "Đã xoá mềm nghệ sĩ." });
    } catch (error) {
      console.error("Delete artist failed", error);
      setToast({ title: "Lỗi", message: "Không thể xoá mềm nghệ sĩ." });
    }
  };

  const handleEdit = async (artist) => {
    try {
      setSaving(true);
      const res = await getArtistById(artist.id);
      const payload = res?.data?.data ?? res?.data ?? artist;
      setEditingArtist(payload);
      setEditPayload({
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
      setAvatarFile(null);
    } catch (error) {
      console.error("Load artist detail failed", error);
      setToast({ title: "Lỗi", message: "Không thể tải nghệ sĩ." });
    } finally {
      setSaving(false);
    }
  };

  const avatarPreview = useMemo(() => {
    if (avatarFile) {
      return URL.createObjectURL(avatarFile);
    }
    if (editPayload.avatar_url) {
      return resolveAssetUrl(editPayload.avatar_url);
    }
    if (editingArtist?.avatar_url) {
      return resolveAssetUrl(editingArtist.avatar_url);
    }
    return null;
  }, [avatarFile, editPayload.avatar_url, editingArtist]);

  useEffect(() => {
    if (!avatarFile || !avatarPreview) return undefined;
    return () => URL.revokeObjectURL(avatarPreview);
  }, [avatarFile, avatarPreview]);

  const handleUpdate = async () => {
    if (!editingArtist) return;
    if (!editPayload.name.trim()) {
      setToast({ title: "Thiếu dữ liệu", message: "Vui lòng nhập tên nghệ sĩ." });
      return;
    }
    try {
      setSaving(true);
      const normalized = Object.fromEntries(
        Object.entries(editPayload).map(([key, value]) => [
          key,
          value === "" ? undefined : value,
        ])
      );

      let payload = normalized;
      if (avatarFile) {
        const formData = new FormData();
        formData.append("avatar", avatarFile);
        Object.entries(normalized).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            formData.append(key, value);
          }
        });
        payload = formData;
      }

      await updateArtist(editingArtist.id, payload);
      await loadArtists(keyword.trim());
      setEditingArtist(null);
      setAvatarFile(null);
      setToast({ title: "Thành công", message: "Đã cập nhật nghệ sĩ." });
    } catch (error) {
      console.error("Update artist failed", error);
      setToast({ title: "Lỗi", message: "Không thể cập nhật nghệ sĩ." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-page-shell min-h-screen space-y-6 px-4 py-6 sm:px-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.35em] text-white/50">
            Quản trị
          </p>
          <h1 className="text-3xl font-extrabold text-white">
            Quản lý nghệ sĩ
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => loadArtists(keyword.trim())}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white/80 transition md:hover:border-white/30 md:hover:bg-white/10"
          >
            <FiRefreshCw /> Làm mới
          </button>
          <button
            onClick={() => navigate("/admin/artists/new")}
            className="inline-flex items-center gap-2 rounded-full bg-emerald-400 px-4 py-2 text-xs font-semibold text-black shadow-lg shadow-emerald-400/30 transition md:hover:bg-emerald-300"
          >
            <FiPlus /> Thêm nghệ sĩ
          </button>
        </div>
      </div>

      <div className="admin-glass rounded-3xl border border-white/10 bg-[#181818] p-4 shadow-[0_25px_80px_rgba(0,0,0,0.45)]">
        <input
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="Tìm kiếm nghệ sĩ theo tên, alias, mã..."
          className="ui-search-field w-full rounded-2xl px-4 py-2 text-sm text-white focus:border-emerald-400/60 focus:outline-none"
        />
      </div>

      {errorMessage && (
        <div className="admin-alert rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          {errorMessage}
        </div>
      )}

      <div className="overflow-hidden admin-glass rounded-3xl border border-white/10 bg-[#181818] shadow-[0_25px_80px_rgba(0,0,0,0.45)]">
        <div className="grid grid-cols-[1fr_auto] border-b border-white/10 px-4 py-3 text-[11px] uppercase tracking-[0.3em] text-white/50 lg:grid-cols-[1.4fr_0.8fr_0.6fr]">
          <span>Nghệ sĩ</span>
          <span className="hidden lg:block">Thông tin</span>
          <span className="text-right">Hành động</span>
        </div>
        <div className="divide-y divide-white/5">
          {loading && (
            <div className="px-4 py-6 text-sm text-white/60">
              Đang tải dữ liệu...
            </div>
          )}
          {!loading && artists.length === 0 && (
            <div className="px-4 py-6 text-sm text-white/60">
              Không có nghệ sĩ phù hợp.
            </div>
          )}
          {!loading &&
            artists.map((artist) => (
              <div
                key={artist.id}
                className="grid grid-cols-[1fr_auto] gap-4 px-4 py-4 text-sm text-white/80 lg:grid-cols-[1.4fr_0.8fr_0.6fr]"
              >
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 overflow-hidden rounded-full bg-white/10">
                    {artist.avatar_url ? (
                      <OptimizedImage
                        src={resolveAssetUrl(artist.avatar_url)}
                        alt={artist.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-white/50">
                        <FiUser />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-white">{artist.name}</p>
                    <p className="text-xs text-white/50">
                      {artist.alias || artist.realname || "Chưa cập nhật"}
                    </p>
                  </div>
                </div>
                <div className="hidden text-xs text-white/60 lg:block">
                  <p>Mã: {artist.zing_artist_id || "-"}</p>
                  <p>Quốc gia: {artist.national || "-"}</p>
                </div>
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => navigate(`/admin/artists/${artist.id}/edit`)}
                    aria-label="Sửa"
                    className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70 transition md:hover:bg-white/10"
                  >
                    <FiEdit2 />
                    <span className="hidden lg:inline">Sửa</span>
                  </button>
                  <button
                    onClick={() => handleDelete(artist)}
                    aria-label="Xoá mềm"
                    className="inline-flex items-center gap-1 rounded-full border border-rose-400/40 bg-rose-500/10 px-3 py-1 text-xs text-rose-200 transition md:hover:bg-rose-500/20"
                  >
                    <FiTrash2 />
                    <span className="hidden lg:inline">Xoá mềm</span>
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>

      <Toast
        title={toast.title}
        message={toast.message}
        onClose={() => setToast({ title: "", message: "" })}
      />
       {editingArtist && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 px-4 pt-24 pb-10 md:items-center md:py-10 lg:pl-64">
          <div className="flex w-full max-w-4xl max-h-[calc(100vh-6rem)] flex-col overflow-hidden admin-glass rounded-3xl border border-white/10 bg-[#181818] p-4 text-xs text-white shadow-[0_30px_90px_rgba(0,0,0,0.6)] sm:p-6 sm:text-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.35em] text-white/50">
                  Quản lý nghệ sĩ
                </p>
                <h2 className="mt-2 text-base font-semibold sm:text-xl">
                  Chỉnh sửa nghệ sĩ
                </h2>
              </div>
              <button
                onClick={() => setEditingArtist(null)}
                className="rounded-full border border-white/10 bg-white/5 p-2 text-white/70 transition md:hover:bg-white/10"
              >
                <FiX />
              </button>
            </div>

            <div className="mt-6 flex-1 overflow-y-auto pr-1 sm:pr-2">
              <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <p className="text-xs font-semibold text-white sm:text-sm">
                    Ảnh đại diện
                  </p>
                  <div className="mt-4 flex flex-col gap-4">
                    {avatarPreview ? (
                      <OptimizedImage
                        src={avatarPreview}
                        alt={editPayload.name || "Artist avatar"}
                        className="h-56 w-full rounded-2xl object-cover shadow-lg"
                      />
                    ) : (
                      <div className="flex h-56 items-center justify-center rounded-2xl bg-white/10 text-xs text-white/60 sm:text-sm">
                        Chưa có ảnh đại diện
                      </div>
                    )}
                    <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70 transition md:hover:bg-white/10">
                      <FiCamera /> Tải avatar mới
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(event) =>
                          setAvatarFile(event.target.files?.[0] || null)
                        }
                      />
                    </label>
                    <input
                      value={editPayload.avatar_url}
                      onChange={(event) => {
                        setAvatarFile(null);
                        setEditPayload((prev) => ({
                          ...prev,
                          avatar_url: event.target.value,
                        }));
                      }}
                      placeholder="Avatar URL (nếu không upload)"
                      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs text-white placeholder:text-white/40 focus:border-emerald-400/60 focus:outline-none sm:text-sm"
                    />
                    <div className="space-y-2 text-xs text-white/70 sm:text-sm">
                      <p>
                        <span className="text-white/60">Tên nghệ sĩ:</span>{" "}
                        <span className="text-white">
                          {editingArtist.name || "Chưa cập nhật"}
                        </span>
                      </p>
                      <p>
                        <span className="text-white/60">Ngày sinh:</span>{" "}
                        <span className="text-white">
                          {formatDateDisplay(editingArtist.birthday)}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <p className="text-xs font-semibold text-white sm:text-sm">Cập nhật nghệ sĩ</p>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <input
                      value={editPayload.name}
                      onChange={(event) =>
                        setEditPayload((prev) => ({
                          ...prev,
                          name: event.target.value,
                        }))
                      }
                      placeholder="Tên nghệ sĩ"
                      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs text-white placeholder:text-white/40 focus:border-emerald-400/60 focus:outline-none sm:text-sm"
                    />
                    <input
                      value={editPayload.alias}
                      onChange={(event) =>
                        setEditPayload((prev) => ({
                          ...prev,
                          alias: event.target.value,
                        }))
                      }
                      placeholder="Alias"
                      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs text-white placeholder:text-white/40 focus:border-emerald-400/60 focus:outline-none sm:text-sm"
                    />
                    <input
                      value={editPayload.realname}
                      onChange={(event) =>
                        setEditPayload((prev) => ({
                          ...prev,
                          realname: event.target.value,
                        }))
                      }
                      placeholder="Tên thật"
                      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs text-white placeholder:text-white/40 focus:border-emerald-400/60 focus:outline-none sm:text-sm"
                    />
                    <input
                      value={editPayload.national}
                      onChange={(event) =>
                        setEditPayload((prev) => ({
                          ...prev,
                          national: event.target.value,
                        }))
                      }
                      placeholder="Quốc gia"
                      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs text-white placeholder:text-white/40 focus:border-emerald-400/60 focus:outline-none sm:text-sm"
                    />
                    <input
                      type="date"
                      value={editPayload.birthday}
                      onChange={(event) =>
                        setEditPayload((prev) => ({
                          ...prev,
                          birthday: event.target.value,
                        }))
                      }
                      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/80 focus:border-emerald-400/60 focus:outline-none sm:text-sm"
                    />
                    <input
                      value={editPayload.cover_url}
                      onChange={(event) =>
                        setEditPayload((prev) => ({
                          ...prev,
                          cover_url: event.target.value,
                        }))
                      }
                      placeholder="Cover URL"
                      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs text-white placeholder:text-white/40 focus:border-emerald-400/60 focus:outline-none sm:col-span-2 sm:text-sm"
                    />
                    <input
                      value={editPayload.short_bio}
                      onChange={(event) =>
                        setEditPayload((prev) => ({
                          ...prev,
                          short_bio: event.target.value,
                        }))
                      }
                      placeholder="Tiểu sử ngắn"
                      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs text-white placeholder:text-white/40 focus:border-emerald-400/60 focus:outline-none sm:col-span-2 sm:text-sm"
                    />
                    <textarea
                      value={editPayload.bio}
                      onChange={(event) =>
                        setEditPayload((prev) => ({
                          ...prev,
                          bio: event.target.value,
                        }))
                      }
                      placeholder="Tiểu sử chi tiết"
                      className="min-h-[140px] rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs text-white placeholder:text-white/40 focus:border-emerald-400/60 focus:outline-none sm:col-span-2 sm:text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 border-t border-white/10 pt-4">
              <button
                onClick={() => setEditingArtist(null)}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/80 transition md:hover:bg-white/10 sm:text-sm"
              >
                Huỷ
              </button>
              <button
                onClick={handleUpdate}
                disabled={saving}
                className="rounded-full bg-emerald-400 px-5 py-2 text-xs font-semibold text-black shadow-lg shadow-emerald-400/30 transition md:hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-70 sm:text-sm"
              >
                {saving ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

