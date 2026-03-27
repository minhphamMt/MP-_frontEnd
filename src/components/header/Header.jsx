import { FiChevronLeft, FiChevronRight, FiMenu } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import SearchBox from "./SearchBox";
import UserMenu from "./UserMenu";
import useAuthStore from "../../store/auth.store";

export default function Header({ onMenuClick, isArtistWorkspace = false }) {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const showSearch = user?.role !== "ARTIST";
  const headerClassName = isArtistWorkspace
    ? "border-sky-200/[0.1] bg-[#0f182a]/94 shadow-[0_18px_36px_rgba(3,8,18,0.24)]"
    : "border-white/10 bg-[#0b0b0b]/95";
  const navButtonClassName = isArtistWorkspace
    ? "border-sky-200/[0.14] bg-[#182337] text-slate-100/90 md:hover:border-sky-200/[0.28] md:hover:bg-[#22324d] md:hover:text-white"
    : "border-white/10 bg-[#1a1a1a] text-white/85 md:hover:border-white/20 md:hover:bg-[#242424] md:hover:text-white";

  return (
    <header
      className={`relative z-40 flex h-[72px] items-center gap-3 border-b px-4 backdrop-blur-md sm:gap-4 sm:px-6 ${headerClassName}`}
    >
      <div className="relative flex items-center gap-2">
        <button
          type="button"
          onClick={onMenuClick}
          className={`group flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-200 active:scale-95 lg:hidden ${navButtonClassName}`}
          title="Mở menu"
          aria-label="Mở menu"
        >
          <FiMenu />
        </button>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className={`group hidden h-10 w-10 items-center justify-center rounded-full border transition-all duration-200 active:scale-95 sm:flex ${navButtonClassName}`}
          title="Quay lại"
        >
          <FiChevronLeft className="transition-transform md:group-hover:-translate-x-0.5" />
        </button>

        <button
          type="button"
          onClick={() => navigate(1)}
          className={`group hidden h-10 w-10 items-center justify-center rounded-full border transition-all duration-200 active:scale-95 sm:flex ${navButtonClassName}`}
          title="Tiến tới"
        >
          <FiChevronRight className="transition-transform md:group-hover:translate-x-0.5" />
        </button>
      </div>

      {showSearch && (
        <div className="relative ml-2 min-w-0 flex-1 sm:ml-4 lg:max-w-[620px] xl:max-w-[720px]">
          <SearchBox />
        </div>
      )}

      <div className="relative ml-auto">
        <UserMenu isArtistWorkspace={isArtistWorkspace} />
      </div>
    </header>
  );
}

