import { Routes, Route, Navigate } from "react-router-dom";
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
import Top50Genres from "../pages/Top50Genres";
import Top50GenreDetail from "../pages/Top50GenreDetail";
import Playlists from "../pages/Playlists";
import PlaylistDetail from "../pages/PlaylistDetail";
import Albums from "../pages/Albums";
import SongDetail from "../pages/SongDetail";
import FollowedArtists from "../pages/FollowedArtists";
import LikedAlbums from "../pages/LikedAlbums";
import LibraryPlaylists from "../pages/LibraryPlaylists";
import LikedSongs from "../pages/LikedSongs";
import Search from "../pages/Search";
import Profile from "../pages/Profile";
import ArtistDashboard from "../pages/artist/ArtistDashboard";
import ArtistAlbums from "../pages/artist/ArtistAlbums";
import ArtistAlbumForm from "../pages/artist/ArtistAlbumForm";
import ArtistSongs from "../pages/artist/ArtistSongs";
import ArtistSongForm from "../pages/artist/ArtistSongForm";
import ArtistProfile from "../pages/artist/ArtistProfile";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminSongManagement from "../pages/admin/AdminSongManagement";
import AdminUsers from "../pages/admin/AdminUsers";
import AdminSongs from "../pages/admin/AdminSongs";
import AdminGenres from "../pages/admin/AdminGenres";
import AdminAlbums from "../pages/admin/AdminAlbums";

export default function AppRoutes() {
  return (
    <Routes>
      {/* ===== PUBLIC ===== */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Login initialMode="register" />} />
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
          <Route path="/top-50" element={<Top50Genres />} />
          <Route path="/top-50/:id" element={<Top50GenreDetail />} />
          <Route path="/top-100" element={<Navigate to="/top-50" replace />} />
          <Route path="/playlists" element={<Playlists />} />
          <Route path="/playlists/:id" element={<PlaylistDetail />} />
            <Route
            path="/library/followed-artists"
            element={<FollowedArtists />}
          />
          <Route path="/library/liked-albums" element={<LikedAlbums />} />
          <Route path="/library/liked-songs" element={<LikedSongs />} />
          <Route path="/library/playlists" element={<LibraryPlaylists />} />
          <Route path="/albums" element={<Albums />} />
          <Route path="/history" element={<History />} />
          <Route path="/search" element={<Search />} />
          <Route path="/song/:id" element={<SongDetail />} />
          <Route path="/me" element={<Profile />} />
          {/* 🔴 PUBLIC CONTENT */}
          <Route path="/artist/:id" element={<ArtistDetail />} />
          <Route path="/album/:id" element={<AlbumDetail />} />
        </Route>
      </Route>

      {/* ===== ARTIST ROLE ===== */}
       <Route element={<ProtectedRoute allowedRoles={["ARTIST", "ADMIN"]} />}>
        <Route element={<MainLayout />}>
          <Route
            path="/artist"
            element={<Navigate to="/artist/dashboard" replace />}
          />
          <Route path="/artist/dashboard" element={<ArtistDashboard />} />
          <Route path="/artist/profile" element={<ArtistProfile />} />
          <Route path="/artist/albums" element={<ArtistAlbums />} />
          <Route path="/artist/albums/new" element={<ArtistAlbumForm />} />
          <Route path="/artist/albums/:id/edit" element={<ArtistAlbumForm />} />
          <Route path="/artist/songs" element={<ArtistSongs />} />
          <Route path="/artist/songs/new" element={<ArtistSongForm />} />
          <Route path="/artist/songs/:id/edit" element={<ArtistSongForm />} />
        </Route>
      </Route>
      

      {/* ===== ADMIN ===== */}
      <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
         <Route element={<MainLayout />}>
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/songs" element={<AdminSongManagement />} />
          <Route path="/admin/songs/review" element={<AdminSongs />} />
          <Route path="/admin/albums" element={<AdminAlbums />} />
          <Route path="/admin/albums" element={<AdminAlbums />} />
          <Route path="/admin/genres" element={<AdminGenres />} />
        </Route>
      </Route>

      {/* ===== FALLBACK ===== */}
      <Route path="*" element={<Forbidden />} />
    </Routes>
  );
}