import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiMusic, FiSave } from "react-icons/fi";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { getAlbums } from "../../api/album.api";
import { createSong, getArtistSongs, getSongById, updateSong } from "../../api/song.api";
import { formatDuration } from "../../utils/song";
import { getMyArtistProfile } from "../../api/artist.api";
import { storage } from "../../utils/firebase";
import { resolveAssetUrl } from "../../utils/asset";
import OptimizedImage from "../../components/common/OptimizedImage";

const emptyForm = {
  title: "",
  album_id: "",
  duration: null,
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

  const extractDurationFromFile = useCallback(async (file) => {
    if (!file) return null;
    return new Promise((resolve, reject) => {
      const fileUrl = URL.createObjectURL(file);
      const audio = document.createElement("audio");
      audio.preload = "metadata";
      audio.onloadedmetadata = () => {
        const value = Number.isFinite(audio.duration) ? Math.round(audio.duration) : null;
        URL.revokeObjectURL(fileUrl);
        resolve(value);
      };
      audio.onerror = () => {
        URL.revokeObjectURL(fileUrl);
        reject(new Error("Không thể đọc thời lượng audio."));
      };
      audio.src = fileUrl;
    });
  }, []);

  const uploadFileToFirebase = useCallback(async (file, folder) => {
    if (!file) return null;
    const safeName = file.name.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9.-]/g, "");
    const fileName = `${Date.now()}-${crypto.randomUUID()}-${safeName}`;
    const fileRef = ref(storage, `${folder}/${fileName}`);
    await uploadBytes(fileRef, file, { contentType: file.type });
    return getDownloadURL(fileRef);
  }, []);

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
        song = Array.isArray(list)
          ? list.find((item) => String(item?.id) === String(id))
          : null;
      }

      if (!song) {
        throw new Error("Song not found");
      }

      setFormValues({
        title: song?.title || song?.name || "",
        album_id: song?.album_id ?? song?.album?.id ?? "",
        duration: song?.duration ?? null,
        cover_url: song?.cover_url ?? song?.cover ?? "",
        audio_path: song?.audio_path || song?.audio_url || song?.audio || song?.source || "",
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

  const handleAudioFileChange = async (event) => {
    const file = event.target.files?.[0] || null;
    setAudioFile(file);
    if (!file) return;

    try {
      const duration = await extractDurationFromFile(file);
      setFormValues((prev) => ({ ...prev, duration }));
    } catch (err) {
      console.error("Extract duration failed", err);
      setError("Không thể đọc thời lượng từ file audio. Hãy thử file MP3 khác.");
    }
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
      setUploading(Boolean(audioFile || coverFile));

      const uploadedAudioUrl = audioFile
        ? await uploadFileToFirebase(audioFile, "uploads/music")
        : null;
      const uploadedCoverUrl = coverFile
        ? await uploadFileToFirebase(coverFile, "uploads/covers")
        : null;

      const payload = {
        title: formValues.title.trim(),
        album_id: formValues.album_id || null,
        duration: formValues.duration ? Number(formValues.duration) : null,
        cover_url: uploadedCoverUrl || formValues.cover_url || null,
        audio_path: uploadedAudioUrl || formValues.audio_path || null,
      };

      if (isEdit) {
        await updateSong(id, payload);
      } else {
        await createSong(payload);
      }

      navigate("/artist/songs");
    } catch (err) {
      console.error("Save song failed", err);
      setError("Lưu bài hát thất bại. Hãy thử lại.");
    } finally {
      setUploading(false);
      setLoading(false);
    }
  };

  const coverPreview = useMemo(() => {
    if (coverFile) {
      return URL.createObjectURL(coverFile);
    }
    return formValues.cover_url ? resolveAssetUrl(formValues.cover_url) : "";
  }, [coverFile, formValues.cover_url]);

  const selectedAlbum = useMemo(
    () => albums.find((album) => String(album.id) === String(formValues.album_id)),
    [albums, formValues.album_id],
  );

  useEffect(() => {
    if (!coverFile || !coverPreview) return;
    return () => URL.revokeObjectURL(coverPreview);
  }, [coverFile, coverPreview]);

  return (
    <div className="artist-list-page">
      <section className="artist-detail-shell">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="artist-label">Song Editor</p>
            <h1 className="mt-2 text-3xl font-black text-white">
              {isEdit ? "Chỉnh sửa bài hát" : "Tạo bài hát mới"}
            </h1>
          </div>
          <button
            type="button"
            onClick={() => navigate("/artist/songs")}
            className="artist-btn-secondary inline-flex items-center gap-2 px-4 py-2 text-sm"
          >
            <FiArrowLeft />
            Quay lại danh sách
          </button>
        </div>
      </section>

      <form onSubmit={handleSubmit} className="artist-detail-grid is-two-column">
        <div className="space-y-6">
          <section className="artist-detail-panel">
            <p className="artist-detail-panel-title">Thông tin bài hát</p>
            <div className="mt-5 space-y-4">
              <label className="artist-detail-label is-full">
                Tên bài hát <span className="text-rose-300">*</span>
                <input
                  name="title"
                  value={formValues.title}
                  onChange={handleChange}
                  placeholder="Ví dụ: Hành trình mới"
                  className="artist-input mt-2"
                  required
                />
              </label>

              <label className="artist-detail-label is-full">
                Album
                <select
                  name="album_id"
                  value={formValues.album_id}
                  onChange={handleChange}
                  className="artist-select ui-select mt-2"
                >
                  <option value="">Chọn album (tùy chọn)</option>
                  {albums.map((album) => (
                    <option key={album.id} value={album.id}>
                      {album.title}
                    </option>
                  ))}
                </select>
              </label>

              <div className="artist-preview-meta-card">
                <strong>Thời lượng bài hát</strong>
                <span>
                  {formValues.duration
                    ? formatDuration(formValues.duration)
                    : "Sẽ tự động tính sau khi chọn file audio"}
                </span>
              </div>
            </div>
          </section>

          <section className="artist-detail-panel">
            <p className="artist-detail-panel-title">Ảnh bìa</p>
            <div className="artist-upload-cluster mt-5">
              <label className="artist-detail-label is-full">
                Ảnh bìa (URL)
                <input
                  name="cover_url"
                  value={formValues.cover_url}
                  onChange={handleChange}
                  placeholder="https://..."
                  className="artist-input mt-2"
                />
              </label>

              <div className="artist-file-dropzone">
                <div className="artist-file-name">
                  <strong>{coverFile ? "Ảnh mới đã chọn" : "Tải ảnh bìa từ máy"}</strong>
                      <span>{coverFile?.name || "PNG/JPG"}</span>
                    </div>
                <label className="artist-file-trigger" htmlFor="artist-song-cover-upload">
                  {coverFile ? "Đổi ảnh" : "Chọn ảnh"}
                </label>
                <input
                  id="artist-song-cover-upload"
                  type="file"
                  accept="image/*"
                  onChange={(event) => setCoverFile(event.target.files?.[0] || null)}
                  className="artist-file-input"
                />
              </div>
            </div>
          </section>

          <section className="artist-detail-panel">
            <p className="artist-detail-panel-title">Audio</p>
            <div className="artist-upload-cluster mt-5">
              <label className="artist-detail-label is-full">
                Audio URL
                <input
                  name="audio_path"
                  value={formValues.audio_path}
                  onChange={handleChange}
                  placeholder="https://storage.googleapis.com/..."
                  className="artist-input mt-2"
                />
              </label>

              <div className="artist-file-dropzone">
                <div className="artist-file-name">
                  <strong>{audioFile ? "Audio mới đã chọn" : "Tải file nhạc lên Firebase"}</strong>
                      <span>{audioFile?.name || "MP3/WAV"}</span>
                    </div>
                <label className="artist-file-trigger" htmlFor="artist-song-audio-upload">
                  {audioFile ? "Đổi file" : "Chọn file"}
                </label>
                <input
                  id="artist-song-audio-upload"
                  type="file"
                  accept="audio/*"
                  onChange={handleAudioFileChange}
                  className="artist-file-input"
                />
              </div>
            </div>
          </section>
        </div>

        <div className="artist-preview-stack lg:sticky lg:top-4">
          <section className="artist-detail-panel">
            <p className="artist-detail-panel-title">Xem trước</p>
            <div className="artist-preview-stage is-cover mt-5">
              {coverPreview && (
                <>
                  <div
                    className="artist-preview-backdrop"
                    style={{ backgroundImage: `url(${coverPreview})` }}
                  />
                  <div className="artist-preview-overlay" />
                </>
              )}
              {coverPreview ? (
                <div className="artist-preview-canvas">
                  <OptimizedImage src={coverPreview} alt="Ảnh bìa bài hát" className="h-full w-full" />
                </div>
              ) : (
                <div className="artist-preview-empty">
                  <FiMusic className="text-4xl text-white/45" />
                  <div className="artist-preview-caption">
                    <strong>Chưa có ảnh bìa</strong>
                    <span>Thêm ảnh bìa</span>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-5 space-y-4">
              <div className="artist-preview-caption">
                <strong>{formValues.title || "Tên bài hát"}</strong>
                <span>
                  {formValues.duration
                    ? `Thời lượng: ${formatDuration(formValues.duration)}`
                    : "Chưa có thời lượng"}
                </span>
              </div>

              <div className="artist-preview-meta-grid">
                <div className="artist-preview-meta-card">
                  <strong>Album</strong>
                  <span>{selectedAlbum?.title || "Phát hành đơn lẻ"}</span>
                </div>
                <div className="artist-preview-meta-card">
                  <strong>Audio</strong>
                  <span>{audioFile ? "File audio mới từ máy" : formValues.audio_path ? "Đã có audio URL" : "Chưa có nguồn audio"}</span>
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
              disabled={loading || uploading}
              className="artist-btn-primary inline-flex w-full items-center justify-center gap-2 px-5 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-70"
            >
              <FiSave />
              {loading || uploading ? "Đang lưu..." : isEdit ? "Lưu thay đổi" : "Tạo bài hát"}
            </button>
          </section>
        </div>
      </form>
    </div>
  );
}
