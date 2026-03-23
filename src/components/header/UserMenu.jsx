import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FiChevronRight, FiLogOut, FiUser } from "react-icons/fi";
import useAuthStore from "../../store/auth.store";
import { resolveAssetUrl } from "../../utils/asset";
import { getPreferredAuthPath } from "../../utils/routeContext";
import OptimizedImage from "../common/OptimizedImage";

export default function UserMenu({ isArtistWorkspace = false }) {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const role = useAuthStore((state) => state.role);
  const authContext = useAuthStore((state) => state.authContext);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const displayName = user?.display_name || user?.email || "User";
  const profilePath = "/me";
  const authPath = getPreferredAuthPath({
    pathname: location.pathname,
    search: location.search,
    role,
    authContext,
    fallback: isArtistWorkspace ? "/artist-auth" : "/login",
  });
  const triggerClassName = isArtistWorkspace
    ? "flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-sky-200/[0.14] bg-[#182337] text-sm font-semibold text-slate-100/90 transition md:hover:border-sky-200/[0.3] md:hover:bg-[#22324d]"
    : "flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-white/15 bg-[#1a1a1a] text-sm font-semibold text-white/85 transition md:hover:border-white/30 md:hover:bg-[#242424]";
  const menuClassName = isArtistWorkspace
    ? "absolute right-0 mt-2 w-52 overflow-hidden rounded-2xl border border-sky-200/[0.16] bg-[#101b2d] p-1.5 text-sm text-white shadow-[0_24px_56px_rgba(2,6,18,0.52)] ring-1 ring-inset ring-sky-100/[0.04]"
    : "absolute right-0 mt-2 w-52 overflow-hidden rounded-2xl border border-white/15 bg-[#121212] p-1.5 text-sm text-white shadow-[0_20px_50px_rgba(0,0,0,0.45)]";
  const menuItemClassName = isArtistWorkspace
    ? "flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition md:hover:bg-sky-400/[0.07]"
    : "flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition md:hover:bg-white/[0.08]";

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!menuRef.current || menuRef.current.contains(event.target)) return;
      setIsOpen(false);
    };
    const handleEscape = (event) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const handleNavigateProfile = () => {
    setIsOpen(false);
    navigate(profilePath);
  };

  const handleLogout = () => {
    setIsOpen(false);
    void logout({ preferredAuthPath: authPath });
    navigate(authPath, { replace: true });
  };

  if (!isAuthenticated || !user) {
    return (
      <button
        type="button"
        onClick={() => navigate(authPath)}
        className="user-btn-secondary px-4 py-2 text-sm font-semibold"
      >
        Đăng nhập
      </button>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={triggerClassName}
        aria-label="Mở hồ sơ"
        title={displayName}
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        {user?.avatar_url ? (
          <OptimizedImage
            src={resolveAssetUrl(user.avatar_url)}
            alt={displayName}
            className="h-full w-full object-cover"
          />
        ) : (
          <span>{displayName.charAt(0).toUpperCase()}</span>
        )}
      </button>

      {isOpen && (
        <div
          className={menuClassName}
          role="menu"
        >
          <button
            type="button"
            onClick={handleNavigateProfile}
            className={menuItemClassName}
            role="menuitem"
          >
            <span className="flex items-center gap-2">
              <FiUser className="text-white/70" />
              Trang cá nhân
            </span>
            <FiChevronRight className="text-white/60" />
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-rose-100 transition md:hover:bg-rose-500/18"
            role="menuitem"
          >
            <FiLogOut className="text-rose-200" />
            Đăng xuất
          </button>
        </div>
      )}
    </div>
  );
}
