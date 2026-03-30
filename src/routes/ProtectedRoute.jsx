import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuthStore from "../store/auth.store";
import { getAuthRequiredMessage } from "../utils/authPrompt";
import { getPreferredAuthPath } from "../utils/routeContext";

function RouteLoadingState() {
  return null;
}

export default function ProtectedRoute({ allowedRoles, allowGuests = false }) {
  const location = useLocation();
  const {
    isAuthenticated,
    role,
    loading,
    isAuthReady,
    authContext,
    preferredAuthPath,
  } = useAuthStore();
  const authPath = getPreferredAuthPath({
    pathname: location.pathname,
    search: location.search,
    role,
    authContext,
    fallback: preferredAuthPath,
  });

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
      <Navigate
        to={authPath}
        replace
        state={{
          from: location,
          authRequiredMessage: getAuthRequiredMessage(),
        }}
      />
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
