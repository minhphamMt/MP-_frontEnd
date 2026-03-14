import { useEffect, useRef, useState } from "react";
import { FiAlignLeft, FiColumns } from "react-icons/fi";
import usePlayerStore from "../../store/player.store";
import { useShallow } from "zustand/react/shallow";
import PlayerDetailLyrics from "./PlayerDetailLyrics";
import PlayerDetailQueue from "./PlayerDetailQueue";

const TABS = [
  {
    id: "queue",
    label: "Danh sách phát",
    icon: FiColumns,
  },
  {
    id: "lyrics",
    label: "Lời bài hát",
    icon: FiAlignLeft,
  },
];

const DOCK_WIDTH_KEY = "player-dock-width";
const DOCK_DEFAULT_WIDTH = 336;
const DOCK_MIN_WIDTH = 288;
const DOCK_MAX_WIDTH = 440;
const DOCK_CLOSE_THRESHOLD = 228;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const getSavedDockWidth = () => {
  if (typeof window === "undefined") return DOCK_DEFAULT_WIDTH;

  const storedWidth = Number(window.localStorage.getItem(DOCK_WIDTH_KEY));
  if (!Number.isFinite(storedWidth)) return DOCK_DEFAULT_WIDTH;

  return clamp(storedWidth, DOCK_MIN_WIDTH, DOCK_MAX_WIDTH);
};

export default function PlayerDockPanel() {
  const {
    currentSong,
    queue,
    currentIndex,
    playAt,
    seek,
    dockPanelOpen,
    dockPanelTab,
    closeDockPanel,
    setDockPanelTab,
  } = usePlayerStore(
    useShallow((state) => ({
      currentSong: state.currentSong,
      queue: state.queue,
      currentIndex: state.currentIndex,
      playAt: state.playAt,
      seek: state.seek,
      dockPanelOpen: state.dockPanelOpen,
      dockPanelTab: state.dockPanelTab,
      closeDockPanel: state.closeDockPanel,
      setDockPanelTab: state.setDockPanelTab,
    }))
  );
  const [panelWidth, setPanelWidth] = useState(getSavedDockWidth);
  const [isResizing, setIsResizing] = useState(false);
  const panelRef = useRef(null);
  const resizeCleanupRef = useRef(null);

  useEffect(() => {
    if (!dockPanelOpen || typeof window === "undefined") return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        closeDockPanel();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [closeDockPanel, dockPanelOpen]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(DOCK_WIDTH_KEY, String(Math.round(panelWidth)));
  }, [panelWidth]);

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
    if (!dockPanelOpen || typeof window === "undefined" || window.innerWidth < 1024) return;

    event.preventDefault();

    const panel = panelRef.current;
    if (!panel) return;

    const rect = panel.getBoundingClientRect();

    const cleanup = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      resizeCleanupRef.current = null;
      setIsResizing(false);
    };

    const onMouseMove = (moveEvent) => {
      const rawWidth = rect.right - moveEvent.clientX;

      if (rawWidth <= DOCK_CLOSE_THRESHOLD) {
        closeDockPanel();
        cleanup();
        return;
      }

      setPanelWidth(clamp(rawWidth, DOCK_MIN_WIDTH, DOCK_MAX_WIDTH));
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

  if (!currentSong) return null;

  const panelStyle = { width: dockPanelOpen ? `${panelWidth}px` : "0px" };
  const innerPanelStyle = { width: `${panelWidth}px` };

  return (
    <aside
      ref={panelRef}
      style={panelStyle}
      className={`group/dock relative hidden shrink-0 overflow-hidden border-l border-white/10 bg-[#040404] text-white shadow-[-24px_0_60px_rgba(0,0,0,0.32)] transition-[width] duration-[380ms] ease-[cubic-bezier(0.22,1,0.36,1)] lg:block ${
        isResizing ? "transition-none" : ""
      }`}
      aria-hidden={!dockPanelOpen}
    >
      <div
        style={innerPanelStyle}
        className={`flex h-full flex-col overflow-hidden transition-[transform,opacity] duration-[380ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
          dockPanelOpen ? "translate-x-0 opacity-100" : "pointer-events-none translate-x-[108%] opacity-0"
        }`}
      >
        <div className="border-b border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.015))] px-3 py-3">
          <div className="grid grid-cols-2 gap-2 rounded-[20px] border border-white/8 bg-white/[0.03] p-1.5">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = dockPanelTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setDockPanelTab(tab.id)}
                  className={`flex items-center justify-center gap-2 rounded-[16px] px-3 py-3 text-sm font-semibold transition ${
                    isActive
                      ? "bg-[linear-gradient(135deg,rgba(29,185,84,0.16),rgba(255,255,255,0.08))] text-white shadow-[0_10px_24px_rgba(29,185,84,0.14)]"
                      : "text-white/60 md:hover:bg-white/[0.05] md:hover:text-white"
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-2xl border transition ${
                      isActive
                        ? "border-[#1db954]/50 bg-[#1db954]/18 text-[#9ff0bc]"
                        : "border-white/10 bg-white/[0.04] text-white/70"
                    }`}
                  >
                    <Icon size={15} />
                  </span>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-3 py-3">
          {dockPanelTab === "queue" ? (
            <PlayerDetailQueue queue={queue} currentIndex={currentIndex} playAt={playAt} />
          ) : (
            <PlayerDetailLyrics
              currentSong={currentSong}
              onSeek={seek}
              isActive={dockPanelOpen && dockPanelTab === "lyrics"}
            />
          )}
        </div>
      </div>

      <div
        className={`absolute inset-y-0 left-0 z-20 hidden w-4 -translate-x-1/2 cursor-col-resize items-center justify-center lg:flex ${
          dockPanelOpen ? "" : "pointer-events-none"
        }`}
        onMouseDown={startResize}
        aria-hidden
      >
        <span
          className={`h-28 w-px rounded-full transition ${
            isResizing
              ? "bg-[#1db954]/55 opacity-100"
              : "bg-white/16 opacity-0 group-hover/dock:opacity-100 group-focus-within/dock:opacity-100"
          }`}
        />
      </div>
    </aside>
  );
}
