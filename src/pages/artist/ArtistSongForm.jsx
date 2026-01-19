import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiMusic, FiSave } from "react-icons/fi";
import { getAlbums } from "../../api/album.api";
import {
  createSong,
  getArtistSongs,
  getSongById,
  updateSong,
} from "../../api/song.api";
import { formatDuration } from "../../utils/song";
import { getMyArtistProfile } from "../../api/artist.api";

const emptyForm = {
  title: "",
  album_id: "",
  duration: "",
  cover_url: "",
  audio_path: "",
};

export default function ArtistSongForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [artistId, setArtistId] = useState(null);
  const [formValues, setFormValues] = useState(emptyForm);
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [audioFile, setAudioFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  useEffect(() => {
    const loadArtistProfile = async () => {
      try {
        const res = await getMyArtistProfile();
        const artist = res?.data?.data ?? res?.data ?? null;
        setArtistId(artist?.id ?? null);
      } catch (err) {
        console.error("Load artist profile failed", err);
        setArtistId(null);
      }
    };

    loadArtistProfile();
  }, []);

  const loadAlbums = useCallback(async () => {
    if (!artistId) return;
    try {
      const res = await getAlbums({ artist_id: artistId, limit: 200 });
      const data = res?.data?.data || [];
      setAlbums(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Load artist albums failed", err);
      setAlbums([]);
    }
  }, [artistId]);

  const loadSong = useCallback(async () => {
    if (!isEdit) return;
    try {
      setLoading(true);
      let song = null;
      try {
        const res = await getSongById(id);
        song = res?.data?.data ?? res?.data ?? null;
      } catch (err) {
        if (!artistId) throw err;
        const res = await getArtistSongs(artistId);
        const payload = res?.data?.data || res?.data || {};
        const list = payload?.songs || payload?.data || payload || [];
        song =
          Array.isArray(list)
            ? list.find((item) => String(item?.id) === String(id))
            : null;
      }

      if (!song) {
        throw new Error("Song not found");
      }

      setFormValues({
        title: song?.title || song?.name || "",
        album_id: song?.album_id ?? song?.album?.id ?? "",
        duration: song?.duration ?? "",
        cover_url: song?.cover_url ?? song?.cover ?? "",
        audio_path:
          song?.audio_path ||
          song?.audio_url ||
          song?.audio ||
          song?.source ||
          "",
      });
    } catch (err) {
      console.error("Load song failed", err);
      setError("Không thể tải thông tin bài hát.");
    } finally {
      setLoading(false);
    }
  }, [artistId, id, isEdit]);

  useEffect(() => {
    loadAlbums();
    loadSong();
  }, [loadAlbums, loadSong]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!formValues.title.trim()) {
      setError("Vui lòng nhập tên bài hát.");
      return;
    }

    try {
      setLoading(true);
      let payload = {
        title: formValues.title.trim(),
        album_id: formValues.album_id || null,
        duration: formValues.duration ? Number(formValues.duration) : null,
        cover_url: formValues.cover_url || null,
        audio_path: formValues.audio_path || null,
      };

      if (audioFile || coverFile) {
        setUploading(true);
        const formData = new FormData();
        if (audioFile) {
          formData.append("audio", audioFile);
        }
        if (coverFile) {
          formData.append("cover", coverFile);
        }
        Object.entries(payload).forEach(([key, value]) => {
          if (value !== null && value !== undefined && value !== "") {
            formData.append(key, value);
          }
        });
        payload = formData;
      }

      let songId = id;
      if (isEdit) {
        const res = await updateSong(id, payload);
        songId = res?.data?.data?.id ?? res?.data?.id ?? id;
      } else {
        const res = await createSong(payload);
        songId = res?.data?.data?.id ?? res?.data?.id ?? songId;
      }

      navigate("/artist/songs");
    } catch (err) {
      console.error("Save song failed", err);
      setError("Lưu bài hát thất bại. Hãy thử lại nhé.");
    } finally {
      setUploading(false);
      setLoading(false);
    }
  };

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "";
  const resolveAssetUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http") || url.startsWith("blob:")) return url;
    if (url.startsWith("/")) return `${apiBaseUrl}${url}`;
    return url;
  };

  const coverPreview = useMemo(() => {
    if (coverFile) {
      return URL.createObjectURL(coverFile);
    }
    return formValues.cover_url ? resolveAssetUrl(formValues.cover_url) : "";
  }, [coverFile, formValues.cover_url, resolveAssetUrl]);

  useEffect(() => {
    if (!coverFile || !coverPreview) return;
    return () => URL.revokeObjectURL(coverPreview);
  }, [coverFile, coverPreview]);
  return (
    <div className="min-h-screen space-y-8 bg-[#121212] px-4 py-6 sm:px-8">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_25px_80px_rgba(0,0,0,0.45)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.35em] text-white/50">
              Nghệ sĩ
            </p>
            <h1 className="mt-2 text-3xl font-extrabold text-white">
              {isEdit ? "Chỉnh sửa bài hát" : "Tạo bài hát mới"}
            </h1>
            <p className="mt-2 text-sm text-white/60">
              {isEdit
                ? "Cập nhật metadata cho bài hát của bạn."
                : "Thêm bài hát mới vào kho nhạc nghệ sĩ."}
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/artist/songs")}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70 transition hover:border-white/30 hover:bg-white/10"
          >
            <FiArrowLeft />
            Quay lại danh sách
          </button>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]"
      >
        <div className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_25px_80px_rgba(0,0,0,0.45)]">
            <h2 className="text-lg font-semibold text-white">Thông tin cơ bản</h2>
            <div className="mt-6 space-y-4">
              <div>
                <label className="text-sm text-white/70">
                  Tên bài hát <span className="text-rose-300">*</span>
                </label>
                <input
                  name="title"
                  value={formValues.title}
                  onChange={handleChange}
                  placeholder="Ví dụ: Hành trình mới"
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white/80 outline-none transition focus:border-white/30 focus:bg-black/40"
                  required
                />
              </div>

              <div>
                <label className="text-sm text-white/70">Album</label>
                <select
                  name="album_id"
                  value={formValues.album_id}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white/80 outline-none transition focus:border-white/30 focus:bg-black/40"
                >
                  <option value="">Chọn album (tùy chọn)</option>
                  {albums.map((album) => (
                    <option key={album.id} value={album.id}>
                      {album.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm text-white/70">Thời lượng (giây)</label>
                <input
                  name="duration"
                  type="number"
                  min="0"
                  value={formValues.duration}
                  onChange={handleChange}
                  placeholder="Ví dụ: 225"
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white/80 outline-none transition focus:border-white/30 focus:bg-black/40"
                />
                {formValues.duration && (
                  <p className="mt-2 text-xs text-white/50">
                    Hiển thị: {formatDuration(formValues.duration)}
                  </p>
                )}
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
                <div className="mt-3">
                  <label className="text-xs text-white/50">
                    Hoặc tải ảnh bìa (PNG/JPG)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) =>
                      setCoverFile(event.target.files?.[0] || null)
                    }
                    className="mt-2 w-full rounded-2xl border border-dashed border-white/10 bg-black/20 px-4 py-3 text-xs text-white/70 file:mr-4 file:rounded-full file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-white/80 hover:border-white/20"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-white/70">Audio path</label>
                <input
                  name="audio_path"
                  value={formValues.audio_path}
                  onChange={handleChange}
                  placeholder="/uploads/songs/filename.mp3"
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white/80 outline-none transition focus:border-white/30 focus:bg-black/40"
                />
                <div className="mt-3">
                  <label className="text-xs text-white/50">
                    Tải file nhạc lên (MP3/WAV)
                  </label>
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={(event) =>
                      setAudioFile(event.target.files?.[0] || null)
                    }
                    className="mt-2 w-full rounded-2xl border border-dashed border-white/10 bg-black/20 px-4 py-3 text-xs text-white/70 file:mr-4 file:rounded-full file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-white/80 hover:border-white/20"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_25px_80px_rgba(0,0,0,0.45)]">
            <h2 className="text-lg font-semibold text-white">Xem trước</h2>
            <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-[#181818]">
               {coverPreview ? (
                <img
                  src={coverPreview}
                  alt="Ảnh bìa"
                  className="h-56 w-full object-cover"
                />
              ) : (
                <div className="flex h-56 items-center justify-center text-4xl text-white/50">
                  <FiMusic />
                </div>
              )}
              <div className="space-y-2 p-4">
                <h3 className="text-lg font-semibold text-white">
                  {formValues.title || "Tên bài hát"}
                </h3>
                <p className="text-sm text-white/60">
                  {formValues.duration
                    ? `Thời lượng: ${formatDuration(formValues.duration)}`
                    : "Chưa có thời lượng"}
                </p>
                {(formValues.audio_path || audioFile) && (
                  <p className="text-xs text-white/50">
                    {audioFile ? "Đã chọn file audio mới" : "Đã có file audio"}
                  </p>
                )}
              </div>
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
              disabled={loading || uploading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#1db954] px-5 py-3 text-sm font-semibold text-black shadow-lg shadow-[#1db954]/40 transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-70"
            >
              <FiSave />
              {loading || uploading
                ? "Đang lưu..."
                : isEdit
                  ? "Lưu thay đổi"
                  : "Tạo bài hát"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}