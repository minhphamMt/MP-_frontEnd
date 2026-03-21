import { FiArrowLeft, FiHome } from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";
import StatusPage from "../components/common/StatusPage";
import usePageMetadata from "../hooks/usePageMetadata";
import useAuthStore from "../store/auth.store";
import { getRoleHomeLabel, getRoleHomePath } from "../utils/roleRoute";

export default function Forbidden() {
  const navigate = useNavigate();
  const location = useLocation();
  const role = useAuthStore((state) => state.role);
  const authContext = useAuthStore((state) => state.authContext);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const homePath = getRoleHomePath({ role, authContext });
  const homeLabel = getRoleHomeLabel({ role, authContext, isAuthenticated });
  const blockedPath = location.state?.from?.pathname || location.pathname;

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate(homePath, { replace: true });
  };

  usePageMetadata({
    title: "403 - Không có quyền truy cập",
    description:
      "Trang bạn vừa mở không thuộc khu vực được phép cho vai trò hiện tại trên Khoaluan Music.",
    robots: "noindex, nofollow",
  });

  return (
    <StatusPage
      code="403"
      badge="Access Control"
      title="Bạn không có quyền vào trang này"
      description="Trang bạn vừa mở thuộc khu vực dành cho vai trò khác. Hệ thống đã chặn truy cập để tránh nhầm quyền và giữ trải nghiệm đúng theo từng khu vực quản trị, nghệ sĩ và người nghe."
      primaryAction={{ to: homePath, label: homeLabel, icon: FiHome }}
      secondaryAction={{ label: "Quay lại", icon: FiArrowLeft, onClick: handleBack }}
      insights={[
        "USER chỉ dùng khu vực nghe nhạc, thư viện cá nhân và hồ sơ của mình.",
        "ARTIST chỉ dùng workspace quản lý bài hát, album và hồ sơ nghệ sĩ.",
        "ADMIN chỉ dùng khu vực quản trị hệ thống và kiểm duyệt nội dung.",
      ]}
      panelLabel="Permission"
      panelTitle="Role mismatch was blocked"
      panelDescription="Nếu bạn cần thao tác này, hãy đăng nhập bằng tài khoản đúng quyền hoặc quay về đúng khu vực mà tài khoản hiện tại được phép sử dụng."
      contextLabel="Đường dẫn bị chặn"
      contextValue={blockedPath}
    />
  );
}
