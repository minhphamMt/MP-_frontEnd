import api from "./axios";

export const loginApi = (payload) => api.post("/auth/login", payload);
export const registerApi = (payload) => api.post("/auth/register", payload);
export const artistLoginApi = (payload) => api.post("/auth/artist/login", payload);
export const artistRegisterApi = (payload) => api.post("/auth/artist/register", payload);
export const firebaseLoginApi = (payload) => api.post("/auth/firebase", payload);

// refreshToken có thể nằm trong cookie, nếu backend bạn yêu cầu body refreshToken
// thì sửa thành: api.post("/auth/refresh", { refreshToken })
export const refreshApi = () => api.post("/auth/refresh");

export const getMeApi = () => api.get("/users/me");
