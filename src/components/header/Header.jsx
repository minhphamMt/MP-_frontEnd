import { FiChevronLeft, FiChevronRight, FiMenu } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import SearchBox from "./SearchBox";
import UserMenu from "./UserMenu";

export default function Header({ onMenuClick }) {
  const navigate = useNavigate();

  return (
    <header
      className="
        relative z-40 flex h-16 items-center gap-3 sm:gap-4
        border-b border-white/5
        bg-gradient-to-r from-[#1f1530]/90 via-[#1a1230]/80 to-[#0c182f]/80
        px-4 sm:px-6
        backdrop-blur
      "
    >
      {/* background glow */}
      <div
        className="pointer-events-none absolute inset-0
        bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.12),transparent_45%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0
        bg-[radial-gradient(circle_at_80%_0%,rgba(167,139,250,0.12),transparent_40%)]"
        aria-hidden
      />

      {/* LEFT ACTIONS */}
      <div className="relative flex items-center gap-2">
                <button
          onClick={onMenuClick}
          className="
            group flex h-9 w-9 items-center justify-center rounded-full
            border border-white/10
            bg-white/5
            text-white/80
            transition-all duration-200
            hover:border-white/30
            hover:bg-white/10
            hover:text-white
            active:scale-95
            md:hidden
          "
          title="Mở menu"
          aria-label="Mở menu"
        >
          <FiMenu />
        </button>
        <button
          onClick={() => navigate(-1)}
          className="
            group flex h-9 w-9 items-center justify-center rounded-full
            border border-white/10
            bg-white/5
            text-white/80
            transition-all duration-200
            hover:border-white/30
            hover:bg-white/10
            hover:text-white
            active:scale-95
          "
          title="Quay lại"
        >
          <FiChevronLeft className="transition-transform group-hover:-translate-x-0.5" />
        </button>

        <button
          onClick={() => navigate(1)}
          className="
            group flex h-9 w-9 items-center justify-center rounded-full
            border border-white/10
            bg-white/5
            text-white/80
            transition-all duration-200
            hover:border-white/30
            hover:bg-white/10
            hover:text-white
            active:scale-95
          "
          title="Tiến tới"
        >
          <FiChevronRight className="transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>

      {/* SEARCH */}
      <div className="relative ml-2 flex-1 max-w-full sm:ml-4 sm:max-w-xl">
        <SearchBox />
      </div>

      {/* USER */}
      <div className="relative ml-auto">
        <UserMenu />
      </div>
    </header>
  );
}
