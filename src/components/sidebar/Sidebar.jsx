import {
  MdExplore,
  MdLibraryMusic,
  MdPlaylistPlay,
  MdAlbum,
   MdHistory,
} from "react-icons/md";
import { FaChartLine } from "react-icons/fa";
import { BsMusicNoteList } from "react-icons/bs";

import SidebarItem from "./SidebarItem";
import SidebarSection from "./SidebarSection";

export default function Sidebar() {
  return (
    <aside className="w-60 bg-[#231b2e] flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-4 text-xl font-bold">
        MINHPHAM
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-2">
        {/* ===== MAIN MENU ===== */}
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

        {/* ===== LIBRARY ===== */}
        <SidebarSection title="Thư viện">
           <SidebarItem
            to="/history"
            icon={MdHistory}
            label="Nghe gần đây"
          />
          <SidebarItem
            to="/playlists"
            icon={MdPlaylistPlay}
            label="Playlist"
          />
          <SidebarItem to="/albums" icon={MdAlbum} label="Album" />
        </SidebarSection>
      </div>
    </aside>
  );
}
