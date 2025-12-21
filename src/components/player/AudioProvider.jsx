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

  // Khi đổi bài hát
  useEffect(() => {
    if (!audioRef.current || !currentSong) return;

    audioRef.current.src = currentSong.audio_url;
    audioRef.current.play();

    api.post(`/songs/${currentSong.id}/play`).catch(() => {});
  }, [currentSong]);

  // Play / Pause
  useEffect(() => {
    if (!audioRef.current) return;

    if (isPlaying) audioRef.current.play();
    else audioRef.current.pause();
  }, [isPlaying]);

  // Seek từ PlayerBar
  useEffect(() => {
    if (!audioRef.current) return;

    if (Math.abs(audioRef.current.currentTime - currentTime) > 0.5) {
      audioRef.current.currentTime = currentTime;
    }
  }, [currentTime]);

  return (
    <audio
      ref={audioRef}
      onLoadedMetadata={(e) =>
        setDuration(e.target.duration || 0)
      }
      onTimeUpdate={(e) =>
        setCurrentTime(e.target.currentTime)
      }
      onEnded={playNext}
    />
  );
}
