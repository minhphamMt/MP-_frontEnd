import { FiArrowLeft, FiCompass } from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";
import StatusPage from "../components/common/StatusPage";
import usePageMetadata from "../hooks/usePageMetadata";
import useAuthStore from "../store/auth.store";
import { getRoleHomeLabel, getRoleHomePath } from "../utils/roleRoute";

export default function NotFound() {
  const navigate = useNavigate();
  const location = useLocation();
  const role = useAuthStore((state) => state.role);
  const authContext = useAuthStore((state) => state.authContext);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const homePath = getRoleHomePath({ role, authContext });
  const homeLabel = getRoleHomeLabel({ role, authContext, isAuthenticated });

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate(homePath, { replace: true });
  };

  usePageMetadata({
    title: "404 - Không tìm thấy trang",
    description:
      "Đường dẫn bạn vừa truy cập không tồn tại hoặc đã được thay đổi trên Khoaluan Music.",
    robots: "noindex, nofollow",
  });

  return (
    <StatusPage
      code="404"
      badge="Page Missing"
      title="Trang này không còn ở đây"
      description="Đường dẫn bạn vừa mở có thể đã bị đổi, bị xóa hoặc nhập sai. Bạn có thể quay về khu vực chính của mình và tiếp tục từ đó mà không cần tải lại toàn bộ ứng dụng."
      primaryAction={{ to: homePath, label: homeLabel, icon: FiCompass }}
      secondaryAction={{ label: "Quay lại", icon: FiArrowLeft, onClick: handleBack }}
      insights={[
        "Kiểm tra lại URL nếu bạn vừa dán một đường dẫn thủ công vào trình duyệt.",
        "Nếu nội dung vừa được đổi route, hãy đi từ menu hoặc trang chủ để vào lại đúng nơi.",
        "Các trang hệ thống như admin, artist và user hiện đã được tách quyền truy cập riêng.",
      ]}
      panelLabel="Not Found"
      panelTitle="We could not match this route"
      panelDescription="Không có route nào tương ứng với địa chỉ hiện tại. Hãy quay lại bước trước hoặc đi về khu vực chính để tiếp tục thao tác."
      contextLabel="Đường dẫn hiện tại"
      contextValue={location.pathname}
    />
  );
}
