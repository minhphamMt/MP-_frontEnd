import { useEffect, useMemo, useState } from "react";
import { getMyHistory } from "../api/history.api";
import usePlayerStore from "../store/player.store";

const formatRelativeTime = (timestamp) => {
  if (!timestamp) return "";
  const listenedDate = new Date(timestamp);
  const diffMs = Date.now() - listenedDate.getTime();

  const minutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return "Vừa nghe";
  if (minutes < 60) return `${minutes} phút trước`;
  if (hours < 24) return `${hours} giờ trước`;
  return `${days} ngày trước`;
};

const normalizeHistoryItem = (item) => {
  const baseSong = item?.song || item;
  const audioPath = baseSong?.audio_path;
  const artistName =
    baseSong?.artist_name || baseSong?.artist?.name || baseSong?.artist;

  return {
    ...baseSong,
    listened_at: item?.listened_at || baseSong?.listened_at,
    artist_name: artistName,
    album_id: baseSong?.album_id || baseSong?.album?.id,
    album_title: baseSong?.album_title || baseSong?.album?.title,
    audio_url:
      baseSong?.audio_url ||
      (audioPath ? `${import.meta.env.VITE_API_BASE_URL}${audioPath}` : null),
  };
};

export default function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const playSong = usePlayerStore((s) => s.playSong);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const res = await getMyHistory();
      const rawList = res?.data?.data || res?.data || [];
      const normalized = rawList.map(normalizeHistoryItem);
      setHistory(normalized);
    } catch (err) {
      console.error("Load listening history error", err);
    } finally {
      setLoading(false);
    }
  };

  const queue = useMemo(
    () => history.map((item) => ({ ...item })),
    [history]
  );

  if (loading) {
    return <div className="text-sm text-white/60">Đang tải lịch sử...</div>;
  }

  if (!history.length) {
    return (
      <div className="space-y-3">
        <h1 className="text-2xl font-bold">Nghe gần đây</h1>
        <div className="text-sm text-white/60">Bạn chưa nghe bài hát nào.</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Nghe gần đây</h1>
        <button
          onClick={loadHistory}
          className="text-xs px-3 py-1 rounded bg-white/10 hover:bg-white/15"
        >
          Làm mới
        </button>
      </div>

      <div className="space-y-2">
        {history.map((item) => (
          <div
            key={`${item.id}-${item.listened_at}`}
            onClick={() => playSong(item, queue)}
            className="flex items-center gap-3 p-2 rounded hover:bg-white/10 cursor-pointer"
          >
            <img
              src={item.cover_url}
              alt=""
              className="w-12 h-12 rounded object-cover"
            />

            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{item.title}</div>
              <div className="text-xs text-white/60 truncate">{item.artist_name}</div>
            </div>

            <div className="text-xs text-white/50 whitespace-nowrap">
              {formatRelativeTime(item.listened_at)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}