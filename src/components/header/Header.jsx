import { FiChevronLeft, FiChevronRight, FiMenu } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import SearchBox from "./SearchBox";
import UserMenu from "./UserMenu";
import useAuthStore from "../../store/auth.store";

export default function Header({ onMenuClick }) {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const showSearch = user?.role !== "ARTIST" && user?.role !== "ADMIN";

  return (
    <header className="relative z-40 flex h-[72px] items-center gap-3 border-b border-white/10 bg-[#0b0b0b]/95 px-4 backdrop-blur-md sm:gap-4 sm:px-6">
      <div className="relative flex items-center gap-2">
        <button
          onClick={onMenuClick}
          className="group flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-[#1a1a1a] text-white/85 transition-all duration-200 lg:hidden md:hover:border-white/20 md:hover:bg-[#242424] md:hover:text-white active:scale-95"
          title="Mở menu"
          aria-label="Mở menu"
        >
          <FiMenu />
        </button>
        <button
          onClick={() => navigate(-1)}
          className="group hidden h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-[#1a1a1a] text-white/85 transition-all duration-200 sm:flex md:hover:border-white/20 md:hover:bg-[#242424] md:hover:text-white active:scale-95"
          title="Quay lại"
        >
          <FiChevronLeft className="transition-transform md:group-hover:-translate-x-0.5" />
        </button>

        <button
          onClick={() => navigate(1)}
          className="group hidden h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-[#1a1a1a] text-white/85 transition-all duration-200 sm:flex md:hover:border-white/20 md:hover:bg-[#242424] md:hover:text-white active:scale-95"
          title="Tiến tới"
        >
          <FiChevronRight className="transition-transform md:group-hover:translate-x-0.5" />
        </button>
      </div>

      {showSearch && (
        <div className="relative ml-2 max-w-full flex-1 sm:ml-4 sm:max-w-xl">
          <SearchBox />
        </div>
      )}

      <div className="relative ml-auto">
        <UserMenu />
      </div>
    </header>
  );
}

