import { useEffect, useRef, useState } from "react";
import { FaChartLine } from "react-icons/fa";
import { BsHeartFill, BsMusicNoteList } from "react-icons/bs";
import { FiChevronsLeft, FiChevronsRight, FiX } from "react-icons/fi";
import { MdAlbum, MdExplore, MdHistory, MdLibraryMusic, MdPlaylistPlay } from "react-icons/md";

import useAuthStore from "../../store/auth.store";
import BrandLogo from "../branding/BrandLogo";
import AdminSidebar from "./AdminSidebar";
import ArtistSidebar from "./ArtistSidebar";
import SidebarItem from "./SidebarItem";
import SidebarSection from "./SidebarSection";

const SIDEBAR_COLLAPSE_KEY = "sidebar-collapsed";
const SIDEBAR_WIDTH_KEY = "sidebar-width";
const SIDEBAR_COMPACT_WIDTH = 92;
const SIDEBAR_DEFAULT_WIDTH = 258;
const SIDEBAR_MIN_WIDTH = 224;
const SIDEBAR_MAX_WIDTH = 336;
const SIDEBAR_COLLAPSE_THRESHOLD = 156;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const getSavedSidebarWidth = () => {
  if (typeof window === "undefined") return SIDEBAR_DEFAULT_WIDTH;

  const storedWidth = Number(window.localStorage.getItem(SIDEBAR_WIDTH_KEY));
  if (!Number.isFinite(storedWidth)) return SIDEBAR_DEFAULT_WIDTH;

  return clamp(storedWidth, SIDEBAR_MIN_WIDTH, SIDEBAR_MAX_WIDTH);
};

export default function Sidebar({ isOpen, onClose }) {
  const role = useAuthStore((state) => state.role);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isArtist = role === "ARTIST";
  const isAdmin = role === "ADMIN";
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(SIDEBAR_COLLAPSE_KEY) === "true";
  });
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window === "undefined") return true;
    return window.innerWidth >= 1024;
  });
  const [sidebarWidth, setSidebarWidth] = useState(getSavedSidebarWidth);
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef(null);
  const resizeCleanupRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const media = window.matchMedia("(min-width: 1024px)");
    const syncDesktopState = (event) => {
      setIsDesktop(event.matches);
    };

    syncDesktopState(media);

    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", syncDesktopState);
      return () => media.removeEventListener("change", syncDesktopState);
    }

    media.addListener(syncDesktopState);
    return () => media.removeListener(syncDesktopState);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(SIDEBAR_COLLAPSE_KEY, String(isCollapsed));
  }, [isCollapsed]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(SIDEBAR_WIDTH_KEY, String(Math.round(sidebarWidth)));
  }, [sidebarWidth]);

  useEffect(() => {
    if (!isResizing || typeof document === "undefined") return undefined;

    const previousCursor = document.body.style.cursor;
    const previousUserSelect = document.body.style.userSelect;

    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    return () => {
      document.body.style.cursor = previousCursor;
      document.body.style.userSelect = previousUserSelect;
    };
  }, [isResizing]);

  useEffect(() => {
    if (isDesktop) return undefined;

    resizeCleanupRef.current?.();
    setIsResizing(false);
    return undefined;
  }, [isDesktop]);

  useEffect(
    () => () => {
      resizeCleanupRef.current?.();
    },
    []
  );

  const stopResize = () => {
    resizeCleanupRef.current?.();
  };

  const startResize = (event) => {
    if (!isDesktop || typeof window === "undefined") return;

    event.preventDefault();

    const sidebar = sidebarRef.current;
    if (!sidebar) return;

    const rect = sidebar.getBoundingClientRect();

    const cleanup = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      resizeCleanupRef.current = null;
      setIsResizing(false);
    };

    const onMouseMove = (moveEvent) => {
      const rawWidth = moveEvent.clientX - rect.left;

      if (rawWidth <= SIDEBAR_COLLAPSE_THRESHOLD) {
        setIsCollapsed(true);
        return;
      }

      setIsCollapsed(false);
      setSidebarWidth(clamp(rawWidth, SIDEBAR_MIN_WIDTH, SIDEBAR_MAX_WIDTH));
    };

    const onMouseUp = () => {
      cleanup();
    };

    stopResize();
    setIsResizing(true);
    resizeCleanupRef.current = cleanup;

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  const isCompact = isDesktop && isCollapsed;
  const desktopSidebarStyle = isDesktop
    ? { width: `${isCompact ? SIDEBAR_COMPACT_WIDTH : sidebarWidth}px` }
    : undefined;

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
        ref={sidebarRef}
        style={desktopSidebarStyle}
        className={`sidebar-motion group/sidebar fixed inset-y-0 left-0 z-40 flex h-full w-[276px] sm:w-[304px] flex-col overflow-hidden border-r border-white/10 bg-[#040404] text-white shadow-[0_26px_80px_rgba(0,0,0,0.6)] will-change-transform transition-[width,transform] duration-[380ms] ease-[cubic-bezier(0.22,1,0.36,1)] lg:static lg:overflow-visible lg:translate-x-0 lg:duration-[280ms] ${
          isResizing ? "lg:transition-none" : ""
        } ${isOpen ? "translate-x-0" : "-translate-x-[108%]"}`}
      >
        <div
          className={`relative flex h-[72px] items-center border-b border-white/10 ${
            isCompact ? "justify-center px-3" : "justify-between px-5"
          }`}
        >
          {isCompact ? (
            <div className="flex items-center justify-center" title="Khoaluan Music">
              <BrandLogo compact />
            </div>
          ) : (
            <BrandLogo />
          )}

          <button
            type="button"
            onClick={() => setIsCollapsed((prev) => !prev)}
            className={`absolute right-3 top-1/2 hidden -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-[#151515] p-2 text-white/80 transition lg:flex ${
              isCompact
                ? "opacity-100 md:hover:border-white/30 md:hover:bg-[#202020] md:hover:text-white"
                : "pointer-events-none opacity-0 md:group-hover/sidebar:pointer-events-auto md:group-hover/sidebar:opacity-100 md:group-focus-within/sidebar:pointer-events-auto md:group-focus-within/sidebar:opacity-100 md:hover:border-white/30 md:hover:bg-[#202020] md:hover:text-white"
            }`}
            aria-label={isCompact ? "Mở rộng menu" : "Thu gọn menu"}
            title={isCompact ? "Mở rộng menu" : "Thu gọn menu"}
          >
            {isCompact ? <FiChevronsRight size={15} /> : <FiChevronsLeft size={15} />}
          </button>

          <button
            onClick={onClose}
            className="rounded-full border border-white/15 bg-[#1a1a1a] p-2 text-white/80 transition lg:hidden md:hover:border-white/30 md:hover:bg-[#242424] md:hover:text-white"
            aria-label="Đóng menu"
            title="Đóng menu"
          >
            <FiX />
          </button>
        </div>

        <div
          className={`relative flex-1 overflow-y-auto px-3 pb-24 pt-4 scrollbar-muted ${
            isCompact ? "lg:overflow-x-visible lg:px-2 lg:pt-5" : "lg:overflow-x-visible"
          }`}
        >
          {isArtist ? (
            <ArtistSidebar collapsed={isCompact} />
          ) : isAdmin ? (
            <AdminSidebar collapsed={isCompact} />
          ) : (
            <>
              <SidebarSection collapsed={isCompact}>
                <SidebarItem to="/" icon={MdExplore} label="Khám phá" collapsed={isCompact} />
                <SidebarItem to="/zing-chart" icon={FaChartLine} label="MChart" collapsed={isCompact} />
                <SidebarItem
                  to="/new-release"
                  icon={BsMusicNoteList}
                  label="Nhạc mới"
                  collapsed={isCompact}
                />
                <SidebarItem to="/top-50" icon={MdLibraryMusic} label="Top 50" collapsed={isCompact} />
              </SidebarSection>

              {isAuthenticated ? (
                <SidebarSection title="Tổng hợp" collapsed={isCompact}>
                  <SidebarItem
                    to="/history"
                    icon={MdHistory}
                    label="Nghe gần đây"
                    collapsed={isCompact}
                  />
                  <SidebarItem
                    to="/playlists"
                    icon={MdPlaylistPlay}
                    label="Thư viện"
                    collapsed={isCompact}
                  />
                  <SidebarItem
                    to="/library/liked-songs"
                    icon={BsHeartFill}
                    label="Bài hát yêu thích"
                    collapsed={isCompact}
                  />
                  <SidebarItem
                    to="/library/playlists"
                    icon={MdPlaylistPlay}
                    label="Playlist đã tạo"
                    collapsed={isCompact}
                  />
                  <SidebarItem
                    to="/library/liked-albums"
                    icon={MdAlbum}
                    label="Album đã thích"
                    collapsed={isCompact}
                  />
                </SidebarSection>
              ) : null}
            </>
          )}
        </div>

        <div
          className="absolute inset-y-0 right-0 z-20 hidden w-4 translate-x-1/2 cursor-col-resize items-center justify-center lg:flex"
          onMouseDown={startResize}
          aria-hidden
        >
          <span
            className={`h-28 w-px rounded-full transition ${
              isResizing
                ? "bg-[#1db954]/55 opacity-100"
                : "bg-white/16 opacity-0 group-hover/sidebar:opacity-100 group-focus-within/sidebar:opacity-100"
            }`}
          />
        </div>
      </aside>
    </>
  );
}
