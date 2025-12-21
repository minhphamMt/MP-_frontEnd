import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

import Login from "../pages/Login";
import Forbidden from "../pages/Forbidden";
import MainLayout from "../layouts/MainLayout";
import Home from "../pages/Home";

/* ===== USER PAGES (tạm, sẽ làm thật sau) ===== */
const ZingChart = () => <div>#ZINGCHART</div>;
const NewRelease = () => <div>BXH NHẠC MỚI</div>;
const Top100 = () => <div>TOP 100</div>;
const Playlists = () => <div>PLAYLIST</div>;
const Albums = () => <div>ALBUM</div>;

/* ===== ARTIST / ADMIN (tạm) ===== */
const ArtistDashboard = () => (
  <div style={{ padding: 20 }}>ARTIST DASHBOARD</div>
);

const AdminDashboard = () => (
  <div style={{ padding: 20 }}>ADMIN DASHBOARD</div>
);

export default function AppRoutes() {
  return (
    <Routes>
      {/* ================= PUBLIC ================= */}
      <Route path="/login" element={<Login />} />
      <Route path="/403" element={<Forbidden />} />

      {/* ================= USER – ZING UI ================= */}
      <Route
        element={
          <ProtectedRoute allowedRoles={["USER", "ARTIST", "ADMIN"]} />
        }
      >
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/zing-chart" element={<ZingChart />} />
          <Route path="/new-release" element={<NewRelease />} />
          <Route path="/top-100" element={<Top100 />} />
          <Route path="/playlists" element={<Playlists />} />
          <Route path="/albums" element={<Albums />} />
        </Route>
      </Route>

      {/* ================= ARTIST ================= */}
      <Route element={<ProtectedRoute allowedRoles={["ARTIST"]} />}>
        <Route path="/artist" element={<ArtistDashboard />} />
      </Route>

      {/* ================= ADMIN ================= */}
      <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
        <Route path="/admin" element={<AdminDashboard />} />
      </Route>

      {/* ================= FALLBACK ================= */}
      <Route path="*" element={<Forbidden />} />
    </Routes>
  );
}
