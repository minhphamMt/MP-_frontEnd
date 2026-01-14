import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiChevronRight, FiLogOut, FiUser } from "react-icons/fi";
import useAuthStore from "../../store/auth.store";

export default function UserMenu() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const displayName = user?.display_name || user?.email || "User";
  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

  const resolveAvatarUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `${API_BASE_URL}${url}`;
  };

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
    navigate("/me");
  };

  const handleLogout = () => {
    setIsOpen(false);
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Avatar */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/10 text-sm font-semibold text-white/80 transition hover:border-white/30 hover:bg-white/20"
        aria-label="Mở hồ sơ cá nhân"
        title={displayName}
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        {user?.avatar_url ? (
          <img
            src={resolveAvatarUrl(user.avatar_url)}
            alt={displayName}
            className="h-full w-full object-cover"
          />
        ) : (
          <span>{displayName.charAt(0).toUpperCase()}</span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-48 overflow-hidden rounded-2xl border border-white/10 bg-[#2b2433] text-sm text-white shadow-lg"
          role="menu"
        >
          <button
            type="button"
            onClick={handleNavigateProfile}
            className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-white/10"
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
            className="flex w-full items-center gap-3 px-4 py-3 text-left text-red-200 transition hover:bg-white/10"
            role="menuitem"
          >
            <FiLogOut className="text-red-200" />
            Đăng xuất
          </button>
        </div>
      )}
    </div>
  );
}