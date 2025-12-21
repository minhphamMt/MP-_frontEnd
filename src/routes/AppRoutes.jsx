import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

import Login from "../pages/Login";
import Forbidden from "../pages/Forbidden";
import MainLayout from "../layouts/MainLayout";

import Home from "../pages/Home";
import AlbumDetail from "../pages/AlbumDetail";
import ArtistDetail from "../pages/ArtistDetail";

/* ===== USER PAGES (TẠM) ===== */
const ZingChart = () => <div>#ZINGCHART</div>;
const NewRelease = () => <div>BXH NHẠC MỚI</div>;
const Top100 = () => <div>TOP 100</div>;
const Playlists = () => <div>PLAYLIST</div>;
const Albums = () => <div>ALBUM</div>;

/* ===== DASHBOARD ===== */
const ArtistDashboard = () => (
  <div style={{ padding: 20 }}>ARTIST DASHBOARD</div>
);

const AdminDashboard = () => (
  <div style={{ padding: 20 }}>ADMIN DASHBOARD</div>
);

export default function AppRoutes() {
  return (
    <Routes>
      {/* ===== PUBLIC ===== */}
      <Route path="/login" element={<Login />} />
      <Route path="/403" element={<Forbidden />} />

      {/* ===== USER / APP ===== */}
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

          {/* 🔴 PUBLIC CONTENT */}
          <Route path="/artist/:id" element={<ArtistDetail />} />
          <Route path="/album/:id" element={<AlbumDetail />} />
        </Route>
      </Route>

      {/* ===== ARTIST ROLE ===== */}
      <Route element={<ProtectedRoute allowedRoles={["ARTIST"]} />}>
        <Route path="/artist/dashboard" element={<ArtistDashboard />} />
      </Route>

      {/* ===== ADMIN ===== */}
      <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
        <Route path="/admin" element={<AdminDashboard />} />
      </Route>

      {/* ===== FALLBACK ===== */}
      <Route path="*" element={<Forbidden />} />
    </Routes>
  );
}
