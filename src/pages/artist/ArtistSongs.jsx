import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiEdit2, FiPlus, FiSearch, FiTrash2 } from "react-icons/fi";
import useAuthStore from "../../store/auth.store";
import { getAlbums } from "../../api/album.api";
import { deleteSong, getArtistSongs } from "../../api/song.api";
import { formatDuration } from "../../utils/song";
import { getMyArtistProfile } from "../../api/artist.api";

export default function ArtistSongs() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const [artistProfile, setArtistProfile] = useState(user?.artist ?? null);
  const artistId = artistProfile?.id ?? user?.artist_id ?? null;

  const [songs, setSongs] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

   useEffect(() => {
    const loadArtistProfile = async () => {
      if (artistProfile?.id || user?.artist_id) return;
      try {
        const res = await getMyArtistProfile();
        const artist = res?.data?.data ?? res?.data ?? null;
        if (artist) {
          setArtistProfile(artist);
          if (user) {
            updateUser({
              ...user,
              artist,
            });
          }
        }
      } catch (error) {
        console.error("Load artist profile failed", error);
      }
    };

    loadArtistProfile();
  }, [artistProfile?.id, updateUser, user, user?.artist_id]);

  const loadAlbums = useCallback(async () => {
    if (!artistId) return;
    try {
      const res = await getAlbums({ artist_id: artistId, limit: 200 });
      const data = res?.data?.data || [];
      setAlbums(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Load artist albums failed", error);
      setAlbums([]);
    }
  }, [artistId]);

  const loadSongs = useCallback(async () => {
    if (!artistId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await getArtistSongs(artistId);
      const payload = res?.data?.data || res?.data || {};
      const list = payload?.songs || payload?.data || payload || [];
      setSongs(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error("Load artist songs failed", error);
      setSongs([]);
    } finally {
      setLoading(false);
    }
  }, [artistId]);

  useEffect(() => {
    loadAlbums();
    loadSongs();
  }, [loadAlbums, loadSongs]);

  const albumMap = useMemo(() => {
    return albums.reduce((acc, album) => {
      acc[album.id] = album;
      return acc;
    }, {});
  }, [albums]);

  const filteredSongs = useMemo(() => {
    const normalized = songs.map((song) => {
      const songId = song.id ?? song.song_id ?? song.songId;
      return {
        ...song,
        id: songId,
        album_title:
          song.album_title ||
          song.album?.title ||
          albumMap[song.album_id]?.title ||
          "Single",
      };
    });

    return normalized.filter((song) => {
      const matchesKeyword = keyword
        ? (song.title || "").toLowerCase().includes(keyword.toLowerCase())
        : true;
      const matchesStatus =
        statusFilter === "all" ? true : song.status === statusFilter;
      return matchesKeyword && matchesStatus;
    });
  }, [albumMap, keyword, songs, statusFilter]);

  const handleDelete = async (songId) => {
    if (!songId) return;
    const confirmed = window.confirm("Bạn chắc chắn muốn xoá bài hát này?");
    if (!confirmed) return;

    try {
      await deleteSong(songId);
      await loadSongs();
    } catch (error) {
      console.error("Delete song failed", error);
    }
  };

  const statusStyles = {
    approved: "border-emerald-400/30 bg-emerald-500/10 text-emerald-200",
    pending: "border-amber-400/30 bg-amber-500/10 text-amber-200",
    draft: "border-slate-400/30 bg-slate-500/10 text-slate-200",
  };

  return (
    <div className="min-h-screen space-y-8 bg-[#121212] px-4 py-6 sm:px-8">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_25px_80px_rgba(0,0,0,0.45)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.35em] text-white/50">
              Nghệ sĩ
            </p>
            <h1 className="mt-2 text-3xl font-extrabold text-white">
              Quản lý bài hát
            </h1>
            <p className="mt-2 text-sm text-white/60">
              Theo dõi bài hát đã phát hành, cập nhật trạng thái và metadata.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/artist/songs/new")}
            className="inline-flex items-center gap-2 rounded-full bg-[#1db954] px-5 py-2 text-sm font-semibold text-black shadow-lg shadow-[#1db954]/40 transition hover:translate-y-[-1px]"
          >
            <FiPlus />
            Tạo bài hát mới
          </button>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <div className="relative w-full max-w-md">
            <FiSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/50" />
            <input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="Tìm theo tên bài hát"
              className="w-full rounded-full border border-white/10 bg-black/30 py-2.5 pl-11 pr-4 text-sm text-white/80 outline-none transition focus:border-white/30 focus:bg-black/40"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-full border border-white/10 bg-black/30 px-4 py-2 text-sm text-white/80 outline-none transition focus:border-white/30 focus:bg-black/40"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="approved">Công khai</option>
            <option value="pending">Chờ duyệt</option>
            <option value="draft">Nháp</option>
          </select>
          <span className="text-sm text-white/50">
            {filteredSongs.length} bài hát
          </span>
        </div>
      </div>

      {loading && (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-white/60">
          Đang tải danh sách bài hát...
        </div>
      )}

      {!loading && !filteredSongs.length && (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-white/60">
          Chưa có bài hát nào. Hãy tạo bài hát đầu tiên của bạn.
        </div>
      )}

      <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-[0_25px_80px_rgba(0,0,0,0.45)]">
        <div className="grid grid-cols-[1.4fr_1fr_0.7fr_0.7fr_0.8fr] gap-4 border-b border-white/10 bg-white/5 px-6 py-4 text-xs uppercase tracking-[0.2em] text-white/50">
          <span>Bài hát</span>
          <span>Album</span>
          <span>Thời lượng</span>
          <span>Trạng thái</span>
          <span>Hành động</span>
        </div>
        <div className="divide-y divide-white/5">
          {filteredSongs.map((song) => (
            <div
              key={`${song.id ?? song.title}-${song.album_id ?? "single"}`}
              className="grid grid-cols-1 gap-3 px-6 py-4 text-sm text-white/80 sm:grid-cols-[1.4fr_1fr_0.7fr_0.7fr_0.8fr]"
            >
              <div>
                <p className="font-semibold text-white">{song.title}</p>
                <p className="text-xs text-white/50">ID #{song.id}</p>
              </div>
              <span className="text-white/70">{song.album_title}</span>
              <span className="text-white/70">
                {song.duration ? formatDuration(song.duration) : "--:--"}
              </span>
              <span
                className={`w-fit rounded-full border px-3 py-1 text-xs ${
                  statusStyles[song.status] ||
                  "border-white/10 bg-white/5 text-white/70"
                }`}
              >
                {song.status || "Chưa xác định"}
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => navigate(`/artist/songs/${song.id}/edit`)}
                  disabled={!song.id}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/70 transition hover:border-white/30 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <FiEdit2 />
                  Sửa
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(song.id)}
                  disabled={!song.id}
                  className="inline-flex items-center gap-2 rounded-full border border-rose-400/40 bg-rose-500/10 px-3 py-1.5 text-xs text-rose-200 transition hover:border-rose-400/70 hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <FiTrash2 />
                  Xoá
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}