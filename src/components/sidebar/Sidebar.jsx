import {
  MdAlbum,
  MdExplore,
  MdHistory,
  MdLibraryMusic,
  MdPlaylistPlay,
} from "react-icons/md";
import { FaChartLine } from "react-icons/fa";
import { BsHeartFill, BsMusicNoteList } from "react-icons/bs";
import { FiUser, FiX } from "react-icons/fi";
import SidebarItem from "./SidebarItem";
import SidebarSection from "./SidebarSection";
import ArtistSidebar from "./ArtistSidebar";
import useAuthStore from "../../store/auth.store";


export default function Sidebar({ isOpen, onClose }) {
  const role = useAuthStore((s) => s.role);
  const isArtist = role === "ARTIST";
  return (
    <>
      <div
        className={`fixed inset-0 z-30 bg-black/60 transition-opacity md:hidden ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
        aria-hidden
      />
      <aside
       className={`fixed inset-y-0 left-0 z-40 flex h-full w-64 flex-col overflow-hidden bg-[#000000] text-white shadow-[0_30px_90px_rgba(0,0,0,0.65)] transition-transform duration-200 md:static md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >

      {/* Logo / Brand */}
      <div className="relative flex h-16 items-center justify-between px-5">
        <div className="flex items-center gap-2">
          <div className="h-9 w-1 rounded-full bg-gradient-to-b from-cyan-300 via-violet-400 to-fuchsia-400 shadow-[0_0_14px_rgba(56,189,248,0.55)]" />
          <span className="text-xl font-extrabold tracking-tight">
            <span className="bg-gradient-to-r from-cyan-300 to-violet-400 bg-clip-text text-transparent">
              MINHPHAM
            </span>
          </span>
        </div>
                <button
          onClick={onClose}
          className="rounded-full border border-white/10 bg-white/5 p-2 text-white/80 transition hover:border-white/30 hover:bg-white/10 hover:text-white md:hidden"
          aria-label="Đóng menu"
          title="Đóng menu"
        >
          <FiX />
        </button>
      </div>

      {/* Menu */}
      <div className="relative flex-1 overflow-y-auto px-3 pb-6 pt-2 scrollbar-muted">
 {isArtist ? (
          <ArtistSidebar />
        ) : (
          <>
            <SidebarSection>
              <SidebarItem to="/" icon={MdExplore} label="Khám phá" />
              <SidebarItem
                to="/zing-chart"
                icon={FaChartLine}
                label="Minhchart"
              />
              <SidebarItem
                to="/new-release"
                icon={BsMusicNoteList}
                label="BXH nhạc mới"
              />
              <SidebarItem to="/top-50" icon={MdLibraryMusic} label="Top 50" />
            </SidebarSection>

            <SidebarSection title="Thư viện">
              <SidebarItem
                to="/history"
                icon={MdHistory}
                label="Nghe gần đây"
              />
              <SidebarItem
                to="/playlists"
                icon={MdPlaylistPlay}
                label="Thư viện"
              />
              <SidebarItem
                to="/library/liked-songs"
                icon={BsHeartFill}
                label="Bài hát yêu thích"
              />
              <SidebarItem
                to="/library/playlists"
                icon={MdPlaylistPlay}
                label="Playlist đã tạo"
              />
              <SidebarItem
                to="/library/liked-albums"
                icon={MdAlbum}
                label="Album đã thích"
              />
            </SidebarSection>
          </>
        )}
      </div>

      {/* Fade dưới để ăn nhập PlayerBar */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#000000] to-transparent"
        aria-hidden
      />
    </aside>
    </>
  );
}
