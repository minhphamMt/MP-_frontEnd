import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { FiEdit2, FiRefreshCw, FiSearch, FiX } from "react-icons/fi";
import {
  listAdminSongs,
  listGenres,
  updateAdminSong,
  listUsers,
} from "../../api/admin.api";
import { getAlbums } from "../../api/album.api";
import { resolveAssetUrl } from "../../utils/asset";

const STATUS_OPTIONS = [
  { value: "", label: "Tất cả" },
  { value: "pending", label: "Chờ duyệt" },
  { value: "approved", label: "Đã duyệt" },
  { value: "rejected", label: "Từ chối" },
];

const normalizeGenreValue = (genres) => {
  if (!genres) return [];
  if (Array.isArray(genres)) return genres.filter(Boolean);
  if (typeof genres === "string") {
    return genres.split(",").map((item) => item.trim()).filter(Boolean);
  }
  return [];
};

const getSongCover = (song) =>
  song?.cover_url ||
  song?.cover ||
  song?.thumbnail ||
  song?.image ||
  song?.album_cover;

export default function AdminSongManagement() {
  const location = useLocation();
  const [songs, setSongs] = useState([]);
  const [genres, setGenres] = useState([]);
  const [artists, setArtists] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [editingSong, setEditingSong] = useState(null);
  const [autoOpenedId, setAutoOpenedId] = useState(null);
  const [editPayload, setEditPayload] = useState({
    title: "",
    artist_id: "",
    album_id: "",
    status: "",
    release_date: "",
    genres: [],
  });

  const loadGenres = async () => {
    try {
      const res = await listGenres({ page: 1, limit: 200 });
      const payload = res?.data?.data ?? res?.data ?? [];
      const list = Array.isArray(payload)
        ? payload
        : payload.items || payload.genres || [];
      setGenres(list);
    } catch (error) {
      console.error("Load genres failed", error);
      setGenres([]);
    }
  };

  const loadSongs = async () => {
    try {
      setLoading(true);
      const res = await listAdminSongs({
        page: 1,
        limit: 100,
        ...(keyword.trim() ? { keyword: keyword.trim(), q: keyword.trim() } : {}),
        ...(statusFilter ? { status: statusFilter } : {}),
      });
      const payload = res?.data?.data ?? res?.data ?? [];
      const list = Array.isArray(payload)
        ? payload
        : payload.items || payload.songs || [];
      setSongs(list);
      setErrorMessage("");
    } catch (error) {
      console.error("Load admin songs failed", error);
      setErrorMessage("Không thể tải danh sách bài hát.");
      setSongs([]);
    } finally {
      setLoading(false);
    }
  };

  const loadArtists = async () => {
    try {
      const res = await listUsers({ role: "ARTIST", limit: 200 });
      const payload = res?.data?.data ?? res?.data ?? [];
      const list = Array.isArray(payload)
        ? payload
        : payload.items || payload.users || [];
      setArtists(list);
    } catch (error) {
      console.error("Load artists failed", error);
      setArtists([]);
    }
  };

  const loadAlbums = async () => {
    try {
      const res = await getAlbums({ page: 1, limit: 200 });
      const payload = res?.data?.data ?? res?.data ?? [];
      const list = Array.isArray(payload)
        ? payload
        : payload.items || payload.albums || [];
      setAlbums(list);
    } catch (error) {
      console.error("Load albums failed", error);
      setAlbums([]);
    }
  };

  useEffect(() => {
    loadGenres();
    loadArtists();
    loadAlbums();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setKeyword(params.get("keyword") || "");
  }, [location.search]);

  useEffect(() => {
    loadSongs();
  }, [keyword, statusFilter]);

  const handleEdit = (song) => {
    setEditingSong(song);
    setEditPayload({
      title: song?.title || "",
      artist_id: song?.artist_id ? `${song.artist_id}` : "",
      album_id: song?.album_id ? `${song.album_id}` : "",
      status: song?.status || "",
      release_date: song?.release_date
        ? new Date(song.release_date).toISOString().slice(0, 10)
        : "",
      genres: normalizeGenreValue(song?.genres),
    });
  };

  const handleToggleGenre = (name) => {
    setEditPayload((prev) => {
      const exists = prev.genres.includes(name);
      return {
        ...prev,
        genres: exists
          ? prev.genres.filter((genre) => genre !== name)
          : [...prev.genres, name],
      };
    });
  };

  const handleUpdate = async () => {
    if (!editingSong) return;
    try {
      await updateAdminSong(editingSong.id, {
        title: editPayload.title || undefined,
        artist_id: editPayload.artist_id || null,
        album_id: editPayload.album_id || null,
        status: editPayload.status || undefined,
        release_date: editPayload.release_date || null,
        genres: editPayload.genres,
      });
      setEditingSong(null);
      await loadSongs();
    } catch (error) {
      console.error("Update song failed", error);
      alert("Không thể cập nhật bài hát.");
    }
  };

  const filteredSongs = useMemo(() => songs, [songs]);
  const artistOptions = useMemo(() => {
    const mapped = artists.map((artist) => ({
      id: `${artist.id}`,
      label: `${artist.id} - ${
        artist.display_name || artist.name || artist.email || "Nghệ sĩ"
      }`,
    }));
    if (
      editPayload.artist_id &&
      !mapped.some((item) => item.id === editPayload.artist_id)
    ) {
      mapped.unshift({
        id: editPayload.artist_id,
        label: `${editPayload.artist_id} - Nghệ sĩ hiện tại`,
      });
    }
    return mapped;
  }, [artists, editPayload.artist_id]);

  const albumOptions = useMemo(() => {
    const mapped = albums.map((album) => ({
      id: `${album.id}`,
      label: `${album.id} - ${album.title || "Album"}${
        album.artist?.name || album.artist_name
          ? ` · ${album.artist?.name || album.artist_name}`
          : ""
      }`,
    }));
    if (
      editPayload.album_id &&
      !mapped.some((item) => item.id === editPayload.album_id)
    ) {
      mapped.unshift({
        id: editPayload.album_id,
        label: `${editPayload.album_id} - Album hiện tại`,
      });
    }
    return mapped;
  }, [albums, editPayload.album_id]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const targetId = params.get("targetId") || params.get("id");
    if (!targetId || targetId === autoOpenedId) return;
    const match = songs.find(
      (song) => `${song.id}` === `${targetId}` || `${song._id}` === `${targetId}`
    );
    if (match) {
      handleEdit(match);
      setAutoOpenedId(`${targetId}`);
    }
  }, [autoOpenedId, location.search, songs]);

  return (
    <div className="min-h-screen space-y-6 bg-[#121212] px-4 py-6 sm:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.35em] text-white/50">
            Quản trị
          </p>
          <h1 className="text-3xl font-extrabold text-white">
            Quản lý bài hát
          </h1>
        </div>
        <button
          onClick={loadSongs}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white/80 transition hover:border-white/30 hover:bg-white/10"
        >
          <FiRefreshCw /> Làm mới
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_0.4fr]">
        <div className="rounded-3xl border border-white/10 bg-[#181818] p-4 shadow-[0_25px_80px_rgba(0,0,0,0.45)]">
          <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80">
            <FiSearch className="text-white/50" />
            <input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="Tìm theo tên bài hát, nghệ sĩ, album..."
              className="w-full bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none"
            />
          </div>
        </div>
        <div className="rounded-3xl border border-white/10 bg-[#181818] p-4 shadow-[0_25px_80px_rgba(0,0,0,0.45)]">
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value} className="text-black">
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {errorMessage && (
        <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          {errorMessage}
        </div>
      )}

      <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#181818] shadow-[0_25px_80px_rgba(0,0,0,0.45)]">
        <div className="grid grid-cols-[1.4fr_0.8fr_0.6fr_0.7fr] border-b border-white/10 px-4 py-3 text-[11px] uppercase tracking-[0.3em] text-white/50">
          <span>Bài hát</span>
          <span>Nghệ sĩ</span>
          <span>Thể loại</span>
          <span className="text-right">Hành động</span>
        </div>
        <div className="divide-y divide-white/5">
          {loading && (
            <div className="px-4 py-6 text-sm text-white/60">
              Đang tải dữ liệu...
            </div>
          )}
          {!loading && filteredSongs.length === 0 && (
            <div className="px-4 py-6 text-sm text-white/60">
              Không có bài hát phù hợp.
            </div>
          )}
          {!loading &&
            filteredSongs.map((song) => (
              <div
                key={song.id}
                className="grid grid-cols-[1.4fr_0.8fr_0.6fr_0.7fr] items-center gap-2 px-4 py-3 text-sm text-white/80"
              >
                 <div className="flex items-center gap-3">
                  {getSongCover(song) ? (
                    <img
                      src={resolveAssetUrl(getSongCover(song))}
                      alt={song.title}
                      className="h-12 w-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/10 text-[10px] text-white/60">
                      No image
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-white">{song.title}</p>
                    <p className="text-xs text-white/50">
                      {song.album_title || "Single"}
                    </p>
                  </div>
                </div>
                <span>{song.artist_name || "-"}</span>
                <span className="text-xs text-white/60">
                  {normalizeGenreValue(song.genres).join(", ") || "-"}
                </span>
                <div className="flex justify-end">
                  <button
                    onClick={() => handleEdit(song)}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs text-white/80 transition hover:border-white/30 hover:bg-white/10"
                  >
                    <FiEdit2 /> Chỉnh sửa
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>

      {editingSong && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 bg-[#181818] p-4 text-white shadow-[0_30px_90px_rgba(0,0,0,0.6)] sm:p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Chỉnh sửa bài hát</h2>
              <button
                onClick={() => setEditingSong(null)}
                className="rounded-full border border-white/10 bg-white/5 p-2 text-white/70 transition hover:bg-white/10"
              >
                <FiX />
              </button>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="block text-sm text-white/70">
                Tên bài hát
                <input
                  value={editPayload.title}
                  onChange={(event) =>
                    setEditPayload((prev) => ({
                      ...prev,
                      title: event.target.value,
                    }))
                  }
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus:border-emerald-400/60 focus:outline-none"
                />
              </label>
              <label className="block text-sm text-white/70">
                Trạng thái
                <select
                  value={editPayload.status}
                  onChange={(event) =>
                    setEditPayload((prev) => ({
                      ...prev,
                      status: event.target.value,
                    }))
                  }
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white"
                >
                  <option value="" className="text-black">
                    Không đổi
                  </option>
                  <option value="pending" className="text-black">
                    pending
                  </option>
                  <option value="approved" className="text-black">
                    approved
                  </option>
                  <option value="rejected" className="text-black">
                    rejected
                  </option>
                </select>
              </label>
              {/* <label className="block text-sm text-white/70">
                Artist ID
                <select
                  value={editPayload.artist_id}
                  onChange={(event) =>
                    setEditPayload((prev) => ({
                      ...prev,
                      artist_id: event.target.value,
                    }))
                  }
                   className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white"
                >
                  <option value="" className="text-black">
                    Chọn nghệ sĩ
                  </option>
                  {artistOptions.map((artist) => (
                    <option key={artist.id} value={artist.id} className="text-black">
                      {artist.label}
                    </option>
                  ))}
                </select>
              </label> */}
              {/* <label className="block text-sm text-white/70">
                Album ID
                 <select
                  value={editPayload.album_id}
                  onChange={(event) =>
                    setEditPayload((prev) => ({
                      ...prev,
                      album_id: event.target.value,
                    }))
                  }
                 className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white"
                >
                  <option value="" className="text-black">
                    Chọn album
                  </option>
                  {albumOptions.map((album) => (
                    <option key={album.id} value={album.id} className="text-black">
                      {album.label}
                    </option>
                  ))}
                </select>
              </label> */}
              <label className="block text-sm text-white/70">
                Ngày phát hành
                <input
                  type="date"
                  value={editPayload.release_date}
                  onChange={(event) =>
                    setEditPayload((prev) => ({
                      ...prev,
                      release_date: event.target.value,
                    }))
                  }
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus:border-emerald-400/60 focus:outline-none"
                />
              </label>
            </div>

            <div className="mt-6">
              <p className="text-sm text-white/70">Thể loại</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {genres.map((genre) => {
                  const isActive = editPayload.genres.includes(genre.name);
                  return (
                    <button
                      key={genre.id}
                      type="button"
                      onClick={() => handleToggleGenre(genre.name)}
                      className={`rounded-full border px-4 py-1 text-xs transition ${
                        isActive
                          ? "border-emerald-400/60 bg-emerald-400/20 text-emerald-100"
                          : "border-white/10 bg-white/5 text-white/70 hover:border-white/30"
                      }`}
                    >
                      {genre.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setEditingSong(null)}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 transition hover:bg-white/10"
              >
                Huỷ
              </button>
              <button
                onClick={handleUpdate}
                className="rounded-full bg-emerald-400 px-5 py-2 text-sm font-semibold text-black shadow-lg shadow-emerald-400/30 transition hover:bg-emerald-300"
              >
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}