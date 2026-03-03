import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import useAuthStore from "../store/auth.store";

const Login = lazy(() => import("../pages/Login"));
const ArtistAuth = lazy(() => import("../pages/ArtistAuth"));
const VerifyEmail = lazy(() => import("../pages/VerifyEmail"));
const ArtistRequest = lazy(() => import("../pages/ArtistRequest"));
const Forbidden = lazy(() => import("../pages/Forbidden"));
const MainLayout = lazy(() => import("../layouts/MainLayout"));
const Home = lazy(() => import("../pages/Home"));
const AlbumDetail = lazy(() => import("../pages/AlbumDetail"));
const ArtistDetail = lazy(() => import("../pages/ArtistDetail"));
const History = lazy(() => import("../pages/History"));
const ZingChart = lazy(() => import("../pages/ZingChart"));
const RegionChart = lazy(() => import("../pages/RegionChart"));
const NewRelease = lazy(() => import("../pages/NewRelease"));
const Top50Genres = lazy(() => import("../pages/Top50Genres"));
const Top50GenreDetail = lazy(() => import("../pages/Top50GenreDetail"));
const Playlists = lazy(() => import("../pages/Playlists"));
const PlaylistDetail = lazy(() => import("../pages/PlaylistDetail"));
const Albums = lazy(() => import("../pages/Albums"));
const SongDetail = lazy(() => import("../pages/SongDetail"));
const FollowedArtists = lazy(() => import("../pages/FollowedArtists"));
const LikedAlbums = lazy(() => import("../pages/LikedAlbums"));
const LibraryPlaylists = lazy(() => import("../pages/LibraryPlaylists"));
const LikedSongs = lazy(() => import("../pages/LikedSongs"));
const Search = lazy(() => import("../pages/Search"));
const Profile = lazy(() => import("../pages/Profile"));
const ArtistDashboard = lazy(() => import("../pages/artist/ArtistDashboard"));
const ArtistAlbums = lazy(() => import("../pages/artist/ArtistAlbums"));
const ArtistAlbumForm = lazy(() => import("../pages/artist/ArtistAlbumForm"));
const ArtistSongs = lazy(() => import("../pages/artist/ArtistSongs"));
const ArtistSongForm = lazy(() => import("../pages/artist/ArtistSongForm"));
const ArtistProfile = lazy(() => import("../pages/artist/ArtistProfile"));
const AdminDashboard = lazy(() => import("../pages/admin/AdminDashboard"));
const AdminSongManagement = lazy(() => import("../pages/admin/AdminSongManagement"));
const AdminUsers = lazy(() => import("../pages/admin/AdminUsers"));
const AdminSongs = lazy(() => import("../pages/admin/AdminSongs"));
const AdminGenres = lazy(() => import("../pages/admin/AdminGenres"));
const AdminAlbums = lazy(() => import("../pages/admin/AdminAlbums"));
const AdminSearch = lazy(() => import("../pages/admin/AdminSearch"));
const AdminArtistForm = lazy(() => import("../pages/admin/AdminArtistForm"));
const AdminArtistList = lazy(() => import("../pages/admin/AdminArtistList"));
const AdminArtistRequests = lazy(() =>
  import("../pages/admin/AdminArtistRequests")
);
const AdminUserForm = lazy(() => import("../pages/admin/AdminUserForm"));
const Trash = lazy(() => import("../pages/Trash"));

const fallback = (
  <div className="flex min-h-[40vh] items-center justify-center text-white/70">
    Đang tải...
  </div>
);

function HomeEntryRoute() {
  const role = useAuthStore((state) => state.role);
  if (role === "ADMIN") {
    return <Navigate to="/admin/dashboard" replace />;
  }
  if (role === "ARTIST") {
    return <Navigate to="/artist/dashboard" replace />;
  }
  return <Home />;
}

export default function AppRoutes() {
  return (
    <Suspense fallback={fallback}>
      <Routes>
        {/* ===== PUBLIC ===== */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Login initialMode="register" />} />
        <Route path="/artist-auth" element={<ArtistAuth />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/403" element={<Forbidden />} />

        {/* ===== APP LAYOUT (shared) ===== */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomeEntryRoute />} />
          <Route path="/zing-chart" element={<ZingChart />} />
          <Route path="/zing-chart/region/:region" element={<RegionChart />} />
          <Route path="/new-release" element={<NewRelease />} />
          <Route path="/top-50" element={<Top50Genres />} />
          <Route path="/top-50/:id" element={<Top50GenreDetail />} />
          <Route path="/top-100" element={<Navigate to="/top-50" replace />} />
          <Route path="/albums" element={<Albums />} />
          <Route path="/search" element={<Search />} />
          <Route path="/song/:id" element={<SongDetail />} />
          <Route path="/artist/:id" element={<ArtistDetail />} />
          <Route path="/album/:id" element={<AlbumDetail />} />

          {/* ===== AUTHENTICATED USER/ARTIST FEATURES ===== */}
          <Route
            element={<ProtectedRoute allowedRoles={["USER", "ARTIST", "ADMIN"]} />}
          >
            <Route path="/history" element={<History />} />
            <Route path="/me" element={<Profile />} />
            <Route path="/playlists" element={<Playlists />} />
            <Route path="/playlists/:id" element={<PlaylistDetail />} />
            <Route path="/library/followed-artists" element={<FollowedArtists />} />
            <Route path="/library/liked-albums" element={<LikedAlbums />} />
            <Route path="/library/liked-songs" element={<LikedSongs />} />
            <Route path="/library/playlists" element={<LibraryPlaylists />} />
          </Route>

          {/* ===== ARTIST ROLE ===== */}
          <Route element={<ProtectedRoute allowedRoles={["ARTIST", "ADMIN"]} />}>
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
            <Route path="/artist/trash" element={<Trash />} />
          </Route>

          {/* ===== ADMIN ===== */}
          <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
            <Route
              path="/admin"
              element={<Navigate to="/admin/dashboard" replace />}
            />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/users/new" element={<AdminUserForm />} />
            <Route path="/admin/users/:id/edit" element={<AdminUserForm />} />
            <Route path="/admin/artists" element={<AdminArtistList />} />
            <Route path="/admin/artists/new" element={<AdminArtistForm />} />
            <Route path="/admin/artists/:id/edit" element={<AdminArtistForm />} />
            <Route
              path="/admin/artist-requests"
              element={<AdminArtistRequests />}
            />
            <Route path="/admin/search" element={<AdminSearch />} />
            <Route path="/admin/songs" element={<AdminSongManagement />} />
            <Route path="/admin/songs/review" element={<AdminSongs />} />
            <Route path="/admin/albums" element={<AdminAlbums />} />
            <Route path="/admin/albums" element={<AdminAlbums />} />
            <Route path="/admin/genres" element={<AdminGenres />} />
            <Route path="/admin/trash" element={<Trash />} />
          </Route>

        </Route>

        <Route element={<ProtectedRoute allowedRoles={["USER", "ARTIST"]} />}>
          <Route path="/artist-request" element={<ArtistRequest />} />
        </Route>

        {/* ===== FALLBACK ===== */}
        <Route path="*" element={<Forbidden />} />
      </Routes>
    </Suspense>
  );
}
