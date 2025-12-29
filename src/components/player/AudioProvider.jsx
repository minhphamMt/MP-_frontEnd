import { useEffect, useRef } from "react";
import usePlayerStore from "../../store/player.store";
import api from "../../api/axios";

export default function AudioProvider() {
  const audioRef = useRef(null);

  const {
    currentSong,
    isPlaying,
    currentTime,
    setDuration,
    setCurrentTime,
    playNext,
  } = usePlayerStore();

  /* =========================
   * LOAD & PLAY NEW SONG
   ========================= */
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong?.audio_url) return;

    audio.src = currentSong.audio_url;
    audio.play().catch(() => {});

    // analytics / play count
    if (currentSong?.id) {
      api.post(`/songs/${currentSong.id}/play`).catch(() => {});
    }
  }, [currentSong]);

  /* =========================
   * PLAY / PAUSE CONTROL
   ========================= */
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  /* =========================
   * SEEK FROM PLAYER BAR
   ========================= */
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // tránh loop seek liên tục
    if (Math.abs(audio.currentTime - currentTime) > 0.5) {
      audio.currentTime = currentTime;
    }
  }, [currentTime]);

  return (
    <audio
      ref={audioRef}
      preload="metadata"
      playsInline
      crossOrigin="anonymous"
      className="hidden"
      onLoadedMetadata={(e) => {
        setDuration(e.target.duration || 0);
      }}
      onTimeUpdate={(e) => {
        setCurrentTime(e.target.currentTime);
      }}
      onEnded={playNext}
    />
  );
}
