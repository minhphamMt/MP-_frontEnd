import { Navigate, Outlet } from "react-router-dom";
import useAuthStore from "../store/auth.store";

export default function ProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, role, loading } = useAuthStore();

  // Tránh redirect sớm khi đang load user
  if (loading) return <div style={{ padding: 16 }}>Loading...</div>;

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/403" replace />;
  }

  return <Outlet />;
}
