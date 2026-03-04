import { MdAlbum, MdExplore, MdHistory, MdLibraryMusic, MdPlaylistPlay } from "react-icons/md";
import { FaChartLine } from "react-icons/fa";
import { BsHeartFill, BsMusicNoteList } from "react-icons/bs";
import { FiX } from "react-icons/fi";
import SidebarItem from "./SidebarItem";
import SidebarSection from "./SidebarSection";
import ArtistSidebar from "./ArtistSidebar";
import AdminSidebar from "./AdminSidebar";
import useAuthStore from "../../store/auth.store";

export default function Sidebar({ isOpen, onClose }) {
  const role = useAuthStore((s) => s.role);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isArtist = role === "ARTIST";
  const isAdmin = role === "ADMIN";

  return (
    <>
      <div
        className={`sidebar-overlay-motion fixed inset-0 z-30 bg-black/65 backdrop-blur-[2px] transition-[opacity,backdrop-filter] duration-300 ease-out lg:hidden ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0 backdrop-blur-0"
        }`}
        onClick={onClose}
        aria-hidden
      />

      <aside
        className={`sidebar-motion fixed inset-y-0 left-0 z-40 flex h-full w-[276px] sm:w-[304px] flex-col overflow-hidden border-r border-white/10 bg-[#040404] text-white shadow-[0_26px_80px_rgba(0,0,0,0.6)] will-change-transform transition-transform duration-[380ms] ease-[cubic-bezier(0.22,1,0.36,1)] lg:static lg:translate-x-0 lg:duration-0 ${
          isOpen ? "translate-x-0" : "-translate-x-[108%]"
        }`}
      >
        <div className="relative flex h-[72px] items-center justify-between border-b border-white/10 px-5">
          <div className="flex items-center gap-2.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#1db954] shadow-[0_0_14px_rgba(29,185,84,0.8)]" />
            <span className="text-base font-black tracking-wide text-white/95">Khoaluan Music</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-full border border-white/15 bg-[#1a1a1a] p-2 text-white/80 transition lg:hidden md:hover:border-white/30 md:hover:bg-[#242424] md:hover:text-white"
            aria-label="Đóng menu"
            title="Đóng menu"
          >
            <FiX />
          </button>
        </div>

        <div className="relative flex-1 overflow-y-auto px-3 pb-24 pt-4 scrollbar-muted">
          {isArtist ? (
            <ArtistSidebar />
          ) : isAdmin ? (
            <AdminSidebar />
          ) : (
            <>
              <SidebarSection>
                <SidebarItem to="/" icon={MdExplore} label="Khám phá" />
                <SidebarItem to="/zing-chart" icon={FaChartLine} label="MinhChart" />
                <SidebarItem to="/new-release" icon={BsMusicNoteList} label="Nhạc mới" />
                <SidebarItem to="/top-50" icon={MdLibraryMusic} label="Top 50" />
              </SidebarSection>

              {isAuthenticated && (
                <SidebarSection title="Thư viện">
                  <SidebarItem to="/history" icon={MdHistory} label="Nghe gần đây" />
                  <SidebarItem to="/playlists" icon={MdPlaylistPlay} label="Tổng hợp" />
                  <SidebarItem to="/library/liked-songs" icon={BsHeartFill} label="Bài hát yêu thích" />
                  <SidebarItem to="/library/playlists" icon={MdPlaylistPlay} label="Playlist đã tạo" />
                  <SidebarItem to="/library/liked-albums" icon={MdAlbum} label="Album đã thích" />
                </SidebarSection>
              )}
            </>
          )}
        </div>

      </aside>
    </>
  );
}

