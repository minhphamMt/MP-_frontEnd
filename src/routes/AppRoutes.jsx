import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import Login from "../pages/Login";
import Forbidden from "../pages/Forbidden";

// Pages tạm để test Phase 0 (sau này thay bằng Layout thật)
const UserHome = () => <div style={{ padding: 20 }}>USER HOME (Zing UI sẽ ở đây)</div>;
const ArtistDashboard = () => <div style={{ padding: 20 }}>ARTIST DASHBOARD</div>;
const AdminDashboard = () => <div style={{ padding: 20 }}>ADMIN DASHBOARD</div>;

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/403" element={<Forbidden />} />

      {/* USER: cho phép mọi role vào nghe nhạc (tuỳ bạn) */}
      <Route element={<ProtectedRoute allowedRoles={["USER", "ARTIST", "ADMIN"]} />}>
        <Route path="/" element={<UserHome />} />
      </Route>

      {/* ARTIST */}
      <Route element={<ProtectedRoute allowedRoles={["ARTIST"]} />}>
        <Route path="/artist" element={<ArtistDashboard />} />
      </Route>

      {/* ADMIN */}
      <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
        <Route path="/admin" element={<AdminDashboard />} />
      </Route>

      {/* fallback đơn giản */}
      <Route path="*" element={<Forbidden />} />
    </Routes>
  );
}
