import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

import Login from "../pages/Login";
import Forbidden from "../pages/Forbidden";
import MainLayout from "../layouts/MainLayout";

import Home from "../pages/Home";
import AlbumDetail from "../pages/AlbumDetail";
import ArtistDetail from "../pages/ArtistDetail";
import History from "../pages/History";
import ZingChart from "../pages/ZingChart";
import RegionChart from "../pages/RegionChart";
import NewRelease from "../pages/NewRelease";
import Top100 from "../pages/Top100";
import Playlists from "../pages/Playlists";
import Albums from "../pages/Albums";

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
           <Route path="/zing-chart/region/:region" element={<RegionChart />} />
          <Route path="/new-release" element={<NewRelease />} />
          <Route path="/top-100" element={<Top100 />} />
          <Route path="/playlists" element={<Playlists />} />
          <Route path="/albums" element={<Albums />} />
           <Route path="/history" element={<History />} />

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
