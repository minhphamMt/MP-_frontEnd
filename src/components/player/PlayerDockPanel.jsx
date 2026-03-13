import { useEffect } from "react";
import { FiAlignLeft, FiColumns } from "react-icons/fi";
import usePlayerStore from "../../store/player.store";
import PlayerDetailLyrics from "./PlayerDetailLyrics";
import PlayerDetailQueue from "./PlayerDetailQueue";

const TABS = [
  {
    id: "queue",
    label: "Danh sách phát",
    description: "Những bài đang phát, vừa đi qua và các bài nối tiếp ngay sau đó.",
    icon: FiColumns,
  },
  {
    id: "lyrics",
    label: "Lời bài hát",
    description: "Theo dõi từng câu hát và chạm để tua nhanh tới đúng đoạn muốn nghe lại.",
    icon: FiAlignLeft,
  },
];

export default function PlayerDockPanel() {
  const {
    currentSong,
    queue,
    currentIndex,
    currentTime,
    playAt,
    seek,
    dockPanelOpen,
    dockPanelTab,
    closeDockPanel,
    setDockPanelTab,
  } = usePlayerStore();

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

  if (!currentSong) return null;

  const queueCount = Array.isArray(queue) ? queue.length : 0;

  return (
    <aside
      className={`hidden shrink-0 overflow-hidden border-l border-white/10 bg-[#040404] text-white shadow-[-24px_0_60px_rgba(0,0,0,0.32)] transition-[width] duration-[380ms] ease-[cubic-bezier(0.22,1,0.36,1)] lg:block ${
        dockPanelOpen ? "w-[300px] xl:w-[336px] 2xl:w-[360px]" : "w-0"
      }`}
      aria-hidden={!dockPanelOpen}
    >
      <div
        className={`flex h-full w-[300px] flex-col overflow-hidden transition-[transform,opacity] duration-[380ms] ease-[cubic-bezier(0.22,1,0.36,1)] xl:w-[336px] 2xl:w-[360px] ${
          dockPanelOpen ? "translate-x-0 opacity-100" : "pointer-events-none translate-x-[108%] opacity-0"
        }`}
      >
        <div className="border-b border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.015))] px-3 pb-3 pt-4">
          <div className="grid grid-cols-2 gap-2 rounded-[22px] border border-white/8 bg-white/[0.03] p-1.5">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = dockPanelTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setDockPanelTab(tab.id)}
                  className={`flex items-center gap-2 rounded-[18px] px-3 py-2.5 text-left transition ${
                    isActive
                      ? "bg-[linear-gradient(135deg,rgba(29,185,84,0.18),rgba(255,255,255,0.08))] text-white shadow-[0_10px_24px_rgba(29,185,84,0.14)]"
                      : "text-white/60 md:hover:bg-white/[0.05] md:hover:text-white"
                  }`}
                >
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-2xl border transition ${
                      isActive
                        ? "border-[#1db954]/50 bg-[#1db954]/18 text-[#9ff0bc]"
                        : "border-white/10 bg-white/[0.04] text-white/70"
                    }`}
                      >
                        <Icon size={16} />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold">{tab.label}</span>
                        <span className="mt-0.5 block truncate text-[11px] text-white/45">
                          {tab.id === "queue" ? `${queueCount} bài hiện có` : "Xem lời bài hát"}
                        </span>
                      </span>
                    </button>
                  );
                })}
          </div>
        </div>

        <div className="min-h-0 flex-1 px-3 py-3">
          {dockPanelTab === "queue" ? (
            <PlayerDetailQueue queue={queue} currentIndex={currentIndex} playAt={playAt} />
          ) : (
            <PlayerDetailLyrics
              currentSong={currentSong}
              displayedTime={currentTime}
              onSeek={seek}
              isActive={dockPanelOpen && dockPanelTab === "lyrics"}
            />
          )}
        </div>
      </div>
    </aside>
  );
}
