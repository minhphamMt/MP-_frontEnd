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
import {
  createArtist,
  deleteArtist,
  getArtists,
  updateArtist,
} from "../../api/artist.api";
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

export default function AdminArtists() {
  const [artists, setArtists] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [creatingPayload, setCreatingPayload] = useState({
    ...emptyArtistPayload,
  });
  const [createAvatarFile, setCreateAvatarFile] = useState(null);
  const [editingArtist, setEditingArtist] = useState(null);
  const [editPayload, setEditPayload] = useState({ ...emptyArtistPayload });
  const [editAvatarFile, setEditAvatarFile] = useState(null);

  const loadArtists = async () => {
    try {
      setLoading(true);
      const res = await getArtists({ page: 1, limit: 100 });
      const payload = res?.data?.data ?? res?.data ?? [];
      const list = Array.isArray(payload)
        ? payload
        : payload.items || payload.artists || [];
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
    loadArtists();
  }, []);

  const filteredArtists = useMemo(() => {
    const normalized = keyword.trim().toLowerCase();
    if (!normalized) return artists;
    return artists.filter((artist) =>
      [
        artist.name,
        artist.alias,
        artist.realname,
        artist.zing_artist_id,
        `${artist.id}`,
        `${artist.user_id || ""}`,
      ]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(normalized))
    );
  }, [artists, keyword]);

  const resetCreateForm = () => {
    setCreatingPayload({ ...emptyArtistPayload });
    setCreateAvatarFile(null);
  };

  const handleCreate = async () => {
    if (!creatingPayload.name.trim()) {
      alert("Vui lòng nhập tên nghệ sĩ.");
      return;
    }
    try {
      const payload = buildArtistPayload(creatingPayload, createAvatarFile);
      await createArtist(payload);
      resetCreateForm();
      await loadArtists();
    } catch (error) {
      console.error("Create artist failed", error);
      alert("Không thể tạo nghệ sĩ.");
    }
  };

  const handleEdit = (artist) => {
    setEditingArtist(artist);
    setEditPayload({
      name: artist.name || "",
      alias: artist.alias || "",
      realname: artist.realname || "",
      national: artist.national || "",
      birthday: formatDateInput(artist.birthday),
      short_bio: artist.short_bio || "",
      bio: artist.bio || "",
      avatar_url: artist.avatar_url || "",
      cover_url: artist.cover_url || "",
      user_id: artist.user_id ? `${artist.user_id}` : "",
    });
    setEditAvatarFile(null);
  };

  const handleUpdate = async () => {
    if (!editingArtist) return;
    try {
      const payload = buildArtistPayload(editPayload, editAvatarFile);
      await updateArtist(editingArtist.id, payload);
      setEditingArtist(null);
      setEditAvatarFile(null);
      await loadArtists();
    } catch (error) {
      console.error("Update artist failed", error);
      alert("Không thể cập nhật nghệ sĩ.");
    }
  };

  const handleDelete = async (artist) => {
    const confirmed = window.confirm(
      `Bạn có chắc muốn xoá nghệ sĩ "${artist.name}"?`
    );
    if (!confirmed) return;
    try {
      await deleteArtist(artist.id);
      await loadArtists();
    } catch (error) {
      console.error("Delete artist failed", error);
      alert("Không thể xoá nghệ sĩ.");
    }
  };

  const createAvatarPreview = useMemo(() => {
    if (createAvatarFile) {
      return URL.createObjectURL(createAvatarFile);
    }
    if (creatingPayload.avatar_url) {
      return resolveAssetUrl(creatingPayload.avatar_url);
    }
    return null;
  }, [createAvatarFile, creatingPayload.avatar_url]);

  const editAvatarPreview = useMemo(() => {
    if (editAvatarFile) {
      return URL.createObjectURL(editAvatarFile);
    }
    if (editPayload.avatar_url) {
      return resolveAssetUrl(editPayload.avatar_url);
    }
    if (editingArtist?.avatar_url) {
      return resolveAssetUrl(editingArtist.avatar_url);
    }
    return null;
  }, [editAvatarFile, editPayload.avatar_url, editingArtist]);

  useEffect(() => {
    if (!createAvatarFile || !createAvatarPreview) return undefined;
    return () => URL.revokeObjectURL(createAvatarPreview);
  }, [createAvatarFile, createAvatarPreview]);

  useEffect(() => {
    if (!editAvatarFile || !editAvatarPreview) return undefined;
    return () => URL.revokeObjectURL(editAvatarPreview);
  }, [editAvatarFile, editAvatarPreview]);

  return (
    <div className="min-h-screen space-y-6 bg-[#121212] px-4 py-6 sm:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.35em] text-white/50">
            Quản trị
          </p>
          <h1 className="text-3xl font-extrabold text-white">
            Quản lý nghệ sĩ
          </h1>
        </div>
        <button
          onClick={loadArtists}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white/80 transition hover:border-white/30 hover:bg-white/10"
        >
          <FiRefreshCw /> Làm mới
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        <div className="rounded-3xl border border-white/10 bg-[#181818] p-4 shadow-[0_25px_80px_rgba(0,0,0,0.45)]">
          <input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="Tìm kiếm nghệ sĩ theo tên, alias, mã..."
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-white/40 focus:border-emerald-400/60 focus:outline-none"
          />
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#181818] p-4 shadow-[0_25px_80px_rgba(0,0,0,0.45)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-white">Thêm nghệ sĩ</p>
              <p className="text-xs text-white/50">
                Thêm mới hồ sơ nghệ sĩ cho hệ thống.
              </p>
            </div>
            <button
              onClick={resetCreateForm}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70 transition hover:bg-white/10"
            >
              <FiX />
            </button>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-[0.6fr_1.4fr]">
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
              {createAvatarPreview ? (
                <img
                  src={createAvatarPreview}
                  alt={creatingPayload.name || "Artist avatar"}
                  className="h-28 w-28 rounded-full object-cover shadow-lg"
                />
              ) : (
                <div className="flex h-28 w-28 items-center justify-center rounded-full bg-white/10 text-white/60">
                  <FiUser size={32} />
                </div>
              )}
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70 transition hover:bg-white/10">
                <FiCamera /> Chọn avatar
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0] || null;
                    setCreateAvatarFile(file);
                  }}
                />
              </label>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <input
                value={creatingPayload.name}
                onChange={(event) =>
                  setCreatingPayload((prev) => ({
                    ...prev,
                    name: event.target.value,
                  }))
                }
                placeholder="Tên nghệ sĩ"
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-white/40 focus:border-emerald-400/60 focus:outline-none"
              />
              <input
                value={creatingPayload.alias}
                onChange={(event) =>
                  setCreatingPayload((prev) => ({
                    ...prev,
                    alias: event.target.value,
                  }))
                }
                placeholder="Alias"
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-white/40 focus:border-emerald-400/60 focus:outline-none"
              />
              <input
                value={creatingPayload.realname}
                onChange={(event) =>
                  setCreatingPayload((prev) => ({
                    ...prev,
                    realname: event.target.value,
                  }))
                }
                placeholder="Tên thật"
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-white/40 focus:border-emerald-400/60 focus:outline-none"
              />
              <input
                value={creatingPayload.national}
                onChange={(event) =>
                  setCreatingPayload((prev) => ({
                    ...prev,
                    national: event.target.value,
                  }))
                }
                placeholder="Quốc gia"
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-white/40 focus:border-emerald-400/60 focus:outline-none"
              />
              <input
                type="date"
                value={creatingPayload.birthday}
                onChange={(event) =>
                  setCreatingPayload((prev) => ({
                    ...prev,
                    birthday: event.target.value,
                  }))
                }
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 focus:border-emerald-400/60 focus:outline-none"
              />
              <input
                value={creatingPayload.user_id}
                onChange={(event) =>
                  setCreatingPayload((prev) => ({
                    ...prev,
                    user_id: event.target.value,
                  }))
                }
                placeholder="User ID liên kết (tuỳ chọn)"
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-white/40 focus:border-emerald-400/60 focus:outline-none"
              />
              <input
                value={creatingPayload.avatar_url}
                onChange={(event) =>
                  setCreatingPayload((prev) => ({
                    ...prev,
                    avatar_url: event.target.value,
                  }))
                }
                placeholder="Avatar URL (nếu không upload)"
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-white/40 focus:border-emerald-400/60 focus:outline-none sm:col-span-2"
              />
              <input
                value={creatingPayload.cover_url}
                onChange={(event) =>
                  setCreatingPayload((prev) => ({
                    ...prev,
                    cover_url: event.target.value,
                  }))
                }
                placeholder="Cover URL"
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-white/40 focus:border-emerald-400/60 focus:outline-none sm:col-span-2"
              />
            </div>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <input
              value={creatingPayload.short_bio}
              onChange={(event) =>
                setCreatingPayload((prev) => ({
                  ...prev,
                  short_bio: event.target.value,
                }))
              }
              placeholder="Tiểu sử ngắn"
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-white/40 focus:border-emerald-400/60 focus:outline-none"
            />
            <button
              onClick={handleCreate}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-400 px-4 py-2 text-xs font-semibold text-black shadow-lg shadow-emerald-400/30 transition hover:bg-emerald-300"
            >
              <FiPlus /> Tạo nghệ sĩ
            </button>
            <textarea
              value={creatingPayload.bio}
              onChange={(event) =>
                setCreatingPayload((prev) => ({
                  ...prev,
                  bio: event.target.value,
                }))
              }
              placeholder="Tiểu sử chi tiết"
              className="min-h-[120px] rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-white/40 focus:border-emerald-400/60 focus:outline-none sm:col-span-2"
            />
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          {errorMessage}
        </div>
      )}

      <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#181818] shadow-[0_25px_80px_rgba(0,0,0,0.45)]">
        <div className="grid grid-cols-[1.4fr_0.8fr_0.6fr] border-b border-white/10 px-4 py-3 text-[11px] uppercase tracking-[0.3em] text-white/50">
          <span>Nghệ sĩ</span>
          <span>Thông tin</span>
          <span className="text-right">Hành động</span>
        </div>
        <div className="divide-y divide-white/5">
          {loading && (
            <div className="px-4 py-6 text-sm text-white/60">
              Đang tải dữ liệu...
            </div>
          )}
          {!loading && filteredArtists.length === 0 && (
            <div className="px-4 py-6 text-sm text-white/60">
              Không có nghệ sĩ phù hợp.
            </div>
          )}
          {!loading &&
            filteredArtists.map((artist) => (
              <div
                key={artist.id}
                className="grid grid-cols-[1.4fr_0.8fr_0.6fr] gap-4 px-4 py-4 text-sm text-white/80"
              >
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 overflow-hidden rounded-full bg-white/10">
                    {artist.avatar_url ? (
                      <img
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
                <div className="text-xs text-white/60">
                  <p>Mã: {artist.zing_artist_id || "-"}</p>
                  <p>User ID: {artist.user_id || "-"}</p>
                  <p>Quốc gia: {artist.national || "-"}</p>
                </div>
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleEdit(artist)}
                    className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70 transition hover:bg-white/10"
                  >
                    <FiEdit2 /> Sửa
                  </button>
                  <button
                    onClick={() => handleDelete(artist)}
                    className="inline-flex items-center gap-1 rounded-full border border-rose-400/40 bg-rose-500/10 px-3 py-1 text-xs text-rose-200 transition hover:bg-rose-500/20"
                  >
                    <FiTrash2 /> Xoá
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>

      {editingArtist && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 bg-[#181818] p-4 text-white shadow-[0_30px_90px_rgba(0,0,0,0.6)] sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.35em] text-white/50">
                  Quản lý nghệ sĩ
                </p>
                <h2 className="mt-2 text-xl font-semibold">Chỉnh sửa nghệ sĩ</h2>
              </div>
              <button
                onClick={() => setEditingArtist(null)}
                className="rounded-full border border-white/10 bg-white/5 p-2 text-white/70 transition hover:bg-white/10"
              >
                <FiX />
              </button>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <p className="text-sm font-semibold text-white">Thông tin hiện tại</p>
                <div className="mt-4 flex flex-col gap-4">
                  {editAvatarPreview ? (
                    <img
                      src={editAvatarPreview}
                      alt={editPayload.name || "Artist avatar"}
                      className="h-56 w-full rounded-2xl object-cover shadow-lg"
                    />
                  ) : (
                    <div className="flex h-56 items-center justify-center rounded-2xl bg-white/10 text-sm text-white/60">
                      Chưa có ảnh đại diện
                    </div>
                  )}
                  <div className="space-y-2 text-sm text-white/70">
                    <p>
                      <span className="text-white/60">Tên nghệ sĩ:</span>{" "}
                      <span className="text-white">
                        {editingArtist.name || "Chưa cập nhật"}
                      </span>
                    </p>
                    <p>
                      <span className="text-white/60">Alias:</span>{" "}
                      <span className="text-white">
                        {editingArtist.alias || "-"}
                      </span>
                    </p>
                    <p>
                      <span className="text-white/60">Zing ID:</span>{" "}
                      <span className="text-white">
                        {editingArtist.zing_artist_id || "-"}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <p className="text-sm font-semibold text-white">Cập nhật nghệ sĩ</p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70 transition hover:bg-white/10 sm:col-span-2">
                    <FiCamera /> Tải avatar mới
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(event) => {
                        const file = event.target.files?.[0] || null;
                        setEditAvatarFile(file);
                      }}
                    />
                  </label>
                  <input
                    value={editPayload.name}
                    onChange={(event) =>
                      setEditPayload((prev) => ({
                        ...prev,
                        name: event.target.value,
                      }))
                    }
                    placeholder="Tên nghệ sĩ"
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-white/40 focus:border-emerald-400/60 focus:outline-none"
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
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-white/40 focus:border-emerald-400/60 focus:outline-none"
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
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-white/40 focus:border-emerald-400/60 focus:outline-none"
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
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-white/40 focus:border-emerald-400/60 focus:outline-none"
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
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 focus:border-emerald-400/60 focus:outline-none"
                  />
                  <input
                    value={editPayload.user_id}
                    onChange={(event) =>
                      setEditPayload((prev) => ({
                        ...prev,
                        user_id: event.target.value,
                      }))
                    }
                    placeholder="User ID liên kết"
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-white/40 focus:border-emerald-400/60 focus:outline-none"
                  />
                  <input
                    value={editPayload.avatar_url}
                    onChange={(event) =>
                      setEditPayload((prev) => ({
                        ...prev,
                        avatar_url: event.target.value,
                      }))
                    }
                    placeholder="Avatar URL"
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-white/40 focus:border-emerald-400/60 focus:outline-none sm:col-span-2"
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
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-white/40 focus:border-emerald-400/60 focus:outline-none sm:col-span-2"
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
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-white/40 focus:border-emerald-400/60 focus:outline-none sm:col-span-2"
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
                    className="min-h-[140px] rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-white/40 focus:border-emerald-400/60 focus:outline-none sm:col-span-2"
                  />
                </div>
                <div className="mt-4 flex flex-wrap justify-end gap-2">
                  <button
                    onClick={() => setEditingArtist(null)}
                    className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/70 transition hover:bg-white/10"
                  >
                    Huỷ
                  </button>
                  <button
                    onClick={handleUpdate}
                    className="rounded-full bg-emerald-400 px-4 py-2 text-xs font-semibold text-black shadow-lg shadow-emerald-400/30 transition hover:bg-emerald-300"
                  >
                    Lưu cập nhật
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}