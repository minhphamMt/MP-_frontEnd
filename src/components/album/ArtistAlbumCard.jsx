import { FiMusic, FiPlay, FiUsers } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import usePlayerStore from "../../store/player.store";
import FollowArtistButton from "../artist/FollowArtistButton";

export default function ArtistAlbumCard({ artist, variant = "grid" }) {
  const navigate = useNavigate();
  const playSong = usePlayerStore((s) => s.playSong);

  const isRail = variant === "rail";
  const isLibrary = variant === "library";
  const songCount =
    artist?.song_count ??
    artist?.track_count ??
    artist?.songs_count ??
    artist?.songs?.length ??
    0;

  const handlePlayArtist = async (e) => {
    e.stopPropagation();

    try {
      const res = await api.get("/songs/art", {
        params: { artist_id: artist.artist_id },
      });

      const payload = res?.data?.data || {};
      const artistData = payload.artist;
      const songList = payload.songs || [];

      if (!songList.length) return;

      const songs = songList.map((s) => ({
        id: s.id,
title: s.title,
        artist_name: artistData?.name || artist.artist_name,
        duration: s.duration,
        cover_url: s.cover_url,
        audio_url: `${import.meta.env.VITE_API_BASE_URL}${s.audio_path}`,
      }));

      playSong(songs[0], songs);
    } catch (err) {
      console.error("Play artist error:", err);
    }
  };

  return (
    <div
      data-card
      onClick={() => navigate(`/artist/${artist.artist_id}`)}
      className={`group relative w-full overflow-hidden transition-all duration-300 active:scale-[0.98] ${
        isLibrary
          ? "rounded-lg border border-transparent bg-[#181818] hover:bg-[#242424]"
          : "rounded-xl border border-white/10 bg-[#181818] hover:bg-[#242424]"
      } ${isRail ? "p-3" : "p-3 sm:p-4"}`}
    >
      {/* COVER */}
       <div
        className={`relative w-full overflow-hidden ${
          isLibrary ? "rounded-full" : "rounded-xl"
        }`}
      >
        <img
          src={artist.cover_url}
          alt={artist.artist_name}
          className={`h-32 w-full object-cover transition-transform duration-500 group-hover:scale-[1.05] ${
            isLibrary ? "rounded-full" : "rounded-xl"
          } ${isRail ? "sm:h-36" : "sm:h-44 lg:h-52"}`}
        />

        {!isLibrary && (
          <div
            className="
              pointer-events-none absolute inset-0
              bg-gradient-to-t from-black/70 via-black/30 to-transparent
              opacity-0 transition duration-300
              group-hover:opacity-100
            "
          />
        )}

        {/* PLAY BUTTON */}
        <button
          onClick={handlePlayArtist}
          className="
            absolute inset-0 flex items-center justify-center
            opacity-0 transition duration-300
            group-hover:opacity-100
          "
        >
          <span
            className={`flex h-11 w-11 items-center justify-center rounded-full
              bg-[#1db954]
              text-lg text-black
              shadow-lg shadow-[#1db954]/40
              transition-transform duration-300 group-hover:scale-110 ${
                isRail ? "h-10 w-10 text-base" : "sm:h-12 sm:w-12 sm:text-xl"
              }`}
          >
            <FiPlay />
          </span>
        </button>
      </div>

      {/* INFO */}
       <div
        className={`relative mt-3 space-y-1 ${
          isRail ? "text-left" : "sm:mt-4"
        }`}
      >
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-white/50">
          <FiUsers className="text-[#1db954]" />
          Nghệ sĩ
        </div>

         <h3 className="truncate text-sm font-semibold text-white sm:text-base">
          {artist.artist_name}
        </h3>

        <div className="flex items-center justify-between gap-2 text-xs text-white/70">
          <div className="flex items-center gap-1">
            <FiMusic className="shrink-0 text-white/60" />
             <span>{songCount} bài hát</span>
          </div>
          {!isLibrary && (
            <FollowArtistButton
              artist={artist}
              size="sm"
              className="!px-2 !py-1 text-[10px]"
            />
          )}
        </div>
      </div>
    </div>
  );
}
