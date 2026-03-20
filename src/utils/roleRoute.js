export function getRoleHomePath({ role, authContext } = {}) {
  if (authContext === "artist_request") return "/artist-request";

  if (role === "ADMIN") return "/admin/dashboard";
  if (role === "ARTIST") return "/artist/dashboard";

  return "/";
}

export function getRoleHomeLabel({ role, authContext, isAuthenticated } = {}) {
  if (!isAuthenticated) return "Về trang chủ";
  if (authContext === "artist_request") return "Về yêu cầu nghệ sĩ";
  if (role === "ADMIN") return "Về dashboard admin";
  if (role === "ARTIST") return "Về workspace nghệ sĩ";

  return "Về trang chủ";
}
