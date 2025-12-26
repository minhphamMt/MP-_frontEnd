import {
  MdAlbum,
  MdExplore,
  MdHistory,
  MdLibraryMusic,
  MdPlaylistPlay,
} from "react-icons/md";
import { FaChartLine } from "react-icons/fa";
import { BsMusicNoteList } from "react-icons/bs";
import SidebarItem from "./SidebarItem";
import SidebarSection from "./SidebarSection";

export default function Sidebar() {
  return (
    <aside className="relative w-64 bg-gradient-to-b from-[#1c132d] via-[#130f27] to-[#0b1424] text-white shadow-[0_24px_80px_rgba(0,0,0,0.55)]">
      <div className="absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.16),transparent_45%)]" aria-hidden />
      <div className="absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_80%_10%,rgba(167,139,250,0.16),transparent_45%)]" aria-hidden />
      <div className="relative h-16 flex items-center px-5 text-xl font-extrabold tracking-tight">
        <span className="bg-gradient-to-r from-cyan-300 to-violet-400 bg-clip-text text-transparent">MINHPHAM</span>
      </div>

      <div className="relative flex-1 overflow-y-auto px-3 pb-6 pt-2 scrollbar-muted">
        <SidebarSection>
          <SidebarItem to="/" icon={MdExplore} label="Khám phá" />
          <SidebarItem to="/zing-chart" icon={FaChartLine} label="#zingchart" />
          <SidebarItem
            to="/new-release"
            icon={BsMusicNoteList}
            label="BXH nhạc mới"
          />
          <SidebarItem to="/top-100" icon={MdLibraryMusic} label="Top 100" />
        </SidebarSection>

        <SidebarSection title="Thư viện">
          <SidebarItem to="/history" icon={MdHistory} label="Nghe gần đây" />
          <SidebarItem to="/playlists" icon={MdPlaylistPlay} label="Playlist" />
          <SidebarItem to="/albums" icon={MdAlbum} label="Album" />
        </SidebarSection>
      </div>
    </aside>
  );
}