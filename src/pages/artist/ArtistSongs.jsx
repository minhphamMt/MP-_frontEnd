import { useMemo, useState } from "react";
import { FiPlus } from "react-icons/fi";

const demoSongs = [
  {
    id: 1,
    title: "Hành trình mới",
    album: "Đêm rực rỡ",
    duration: "03:45",
    status: "Công khai",
  },
  {
    id: 2,
    title: "Phía sau ánh đèn",
    album: "Lạc giữa phố",
    duration: "04:12",
    status: "Nháp",
  },
  {
    id: 3,
    title: "Mùa thu ở lại",
    album: "Ký ức", 
    duration: "05:02",
    status: "Công khai",
  },
];

export default function ArtistSongs() {
  const [keyword, setKeyword] = useState("");

  const filteredSongs = useMemo(() => {
    if (!keyword) return demoSongs;
    const lower = keyword.toLowerCase();
    return demoSongs.filter((song) =>
      song.title.toLowerCase().includes(lower)
    );
  }, [keyword]);

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
            className="inline-flex items-center gap-2 rounded-full bg-[#1db954] px-5 py-2 text-sm font-semibold text-black shadow-lg shadow-[#1db954]/40 transition hover:translate-y-[-1px]"
          >
            <FiPlus />
            Tạo bài hát mới
          </button>
        </div>

        <div className="mt-6">
          <input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="Tìm theo tên bài hát"
            className="w-full max-w-md rounded-full border border-white/10 bg-black/30 px-4 py-2.5 text-sm text-white/80 outline-none transition focus:border-white/30 focus:bg-black/40"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-[0_25px_80px_rgba(0,0,0,0.45)]">
        <div className="grid grid-cols-[1.4fr_1fr_0.7fr_0.7fr] gap-4 border-b border-white/10 bg-white/5 px-6 py-4 text-xs uppercase tracking-[0.2em] text-white/50">
          <span>Bài hát</span>
          <span>Album</span>
          <span>Thời lượng</span>
          <span>Trạng thái</span>
        </div>
        <div className="divide-y divide-white/5">
          {filteredSongs.map((song) => (
            <div
              key={song.id}
              className="grid grid-cols-1 gap-3 px-6 py-4 text-sm text-white/80 sm:grid-cols-[1.4fr_1fr_0.7fr_0.7fr]"
            >
              <div>
                <p className="font-semibold text-white">{song.title}</p>
                <p className="text-xs text-white/50">ID #{song.id}</p>
              </div>
              <span className="text-white/70">{song.album}</span>
              <span className="text-white/70">{song.duration}</span>
              <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-200">
                {song.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}