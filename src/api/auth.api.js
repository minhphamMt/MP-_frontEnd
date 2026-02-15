import api from "./axios";

export const loginApi = (payload) => api.post("/auth/login", payload);
export const registerApi = (payload) => api.post("/auth/register", payload);
export const artistLoginApi = (payload) => api.post("/auth/artist/login", payload);
export const artistRegisterApi = (payload) => api.post("/auth/artist/register", payload);
export const verifyEmailApi = (payload) => api.post("/auth/verify-email", payload);
export const resendVerificationApi = (payload) =>
  api.post("/auth/resend-verification", payload);
export const firebaseLoginApi = (payload) => api.post("/auth/firebase", payload);
export const forgotPasswordApi = (payload) =>
  api.post("/auth/forgot-password", payload);
export const resetPasswordApi = (payload) =>
  api.post("/auth/reset-password", payload);

export const refreshApi = (refreshToken) =>
  api.post("/auth/refresh", { refreshToken });

export const logoutApi = (refreshToken) =>
  api.post("/auth/logout", { refreshToken });

export const getMeApi = () => api.get("/users/me");
