import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import SearchBox from "./SearchBox";
import UserMenu from "./UserMenu";

export default function Header() {
  return (
    <header className="h-16 flex items-center px-6
                       bg-[#170f23] border-b border-white/10">
      {/* Back / Forward */}
      <div className="flex items-center gap-2">
        <button
          className="w-8 h-8 flex items-center justify-center
                     rounded-full hover:bg-white/10"
        >
          <FiChevronLeft />
        </button>
        <button
          className="w-8 h-8 flex items-center justify-center
                     rounded-full hover:bg-white/10"
        >
          <FiChevronRight />
        </button>
      </div>

      {/* Search */}
      <div className="ml-6 flex-1">
        <SearchBox />
      </div>

      {/* User */}
      <div className="ml-auto">
        <UserMenu />
      </div>
    </header>
  );
}
