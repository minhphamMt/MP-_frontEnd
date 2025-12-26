import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import SearchBox from "./SearchBox";
import UserMenu from "./UserMenu";

export default function Header() {
  return (
    <header className="relative z-10 h-16 items-center border-b border-white/5 bg-gradient-to-r from-[#1f1530]/90 via-[#1a1230]/80 to-[#0c182f]/80 px-6 backdrop-blur md:flex">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.12),transparent_45%)]" aria-hidden />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(167,139,250,0.12),transparent_40%)]" aria-hidden />
      <div className="relative flex items-center gap-2">
        <button className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/80 transition hover:border-white/30 hover:bg-white/10">
          <FiChevronLeft />
        </button>
        <button className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/80 transition hover:border-white/30 hover:bg-white/10">
          <FiChevronRight />
        </button>
      </div>

      <div className="relative ml-6 flex-1">
        <SearchBox />
      </div>

      <div className="relative ml-auto">
        <UserMenu />
      </div>
    </header>
  );
}