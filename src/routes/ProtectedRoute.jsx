import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuthStore from "../store/auth.store";

function RouteLoadingState() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center text-sm font-medium text-white/55">
      Đang tải khu vực...
    </div>
  );
}

export default function ProtectedRoute({ allowedRoles, allowGuests = false }) {
  const location = useLocation();
  const { isAuthenticated, role, loading, isAuthReady, authContext } =
    useAuthStore();

  if (loading || !isAuthReady) {
    return <RouteLoadingState />;
  }

  if (
    isAuthenticated &&
    authContext === "artist_request" &&
    !location.pathname.startsWith("/artist-request")
  ) {
    return <Navigate to="/artist-request" replace state={{ from: location }} />;
  }

  if (!isAuthenticated) {
    return allowGuests ? (
      <Outlet />
    ) : (
      <Navigate to="/login" replace state={{ from: location }} />
    );
  }

  if (
    Array.isArray(allowedRoles) &&
    allowedRoles.length > 0 &&
    !allowedRoles.includes(role)
  ) {
    return <Navigate to="/403" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
