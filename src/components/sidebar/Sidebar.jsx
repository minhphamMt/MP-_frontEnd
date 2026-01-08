import {
  MdAlbum,
  MdExplore,
  MdHistory,
  MdLibraryMusic,
  MdPlaylistPlay,
} from "react-icons/md";
import { FaChartLine } from "react-icons/fa";
import { BsHeartFill, BsMusicNoteList } from "react-icons/bs";
import SidebarItem from "./SidebarItem";
import SidebarSection from "./SidebarSection";

export default function Sidebar() {
  return (
    <aside className="relative z-30 flex h-full w-64 flex-col overflow-hidden bg-gradient-to-b from-[#1f1530] via-[#16112a] to-[#0b1424] text-white shadow-[0_30px_90px_rgba(0,0,0,0.65)]">
      {/* Glow nền trên */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.18),transparent_45%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_80%_10%,rgba(167,139,250,0.18),transparent_45%)]"
        aria-hidden
      />

      {/* Logo / Brand */}
      <div className="relative flex h-16 items-center px-5">
        <div className="flex items-center gap-2">
          <div className="h-9 w-1 rounded-full bg-gradient-to-b from-cyan-300 via-violet-400 to-fuchsia-400 shadow-[0_0_14px_rgba(56,189,248,0.55)]" />
          <span className="text-xl font-extrabold tracking-tight">
            <span className="bg-gradient-to-r from-cyan-300 to-violet-400 bg-clip-text text-transparent">
              MINHPHAM
            </span>
          </span>
        </div>
      </div>

      {/* Menu */}
      <div className="relative flex-1 overflow-y-auto px-3 pb-6 pt-2 scrollbar-muted">
        <SidebarSection>
          <SidebarItem
            to="/"
            icon={MdExplore}
            label="Khám phá"
          />
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
          <SidebarItem
            to="/top-50"
            icon={MdLibraryMusic}
            label="Top 50"
          />
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
          {/* <SidebarItem
            to="/albums"
            icon={MdAlbum}
            label="Album"
          /> */}
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
      </div>

      {/* Fade dưới để ăn nhập PlayerBar */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0e0818] to-transparent"
        aria-hidden
      />
    </aside>
  );
}
