import axios from "axios";
import useAuthStore from "../store/auth.store";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// ========== REQUEST: attach access token ==========
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ========== RESPONSE: refresh token on 401 ==========
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  failedQueue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    // Không có response => lỗi mạng/CORS...
    if (!error.response) return Promise.reject(error);

    const status = error.response.status;

    // Chỉ xử lý 401, và không retry vô hạn
    if (status === 401 && !originalRequest._retry) {
      // Không refresh cho chính endpoint refresh (tránh loop)
      if (originalRequest.url?.includes("/auth/refresh")) {
        useAuthStore.getState().logout();
        return Promise.reject(error);
      }

      // Nếu đang refresh, queue request lại
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Gọi refresh: backend của bạn có thể nhận refreshToken qua cookie
        const refreshRes = await api.post("/auth/refresh");

        // Backend thường trả: { accessToken, ... }
        const newToken =
          refreshRes.data?.accessToken ||
          refreshRes.data?.data?.accessToken ||
          null;

        if (!newToken) {
          useAuthStore.getState().logout();
          processQueue(new Error("Refresh did not return accessToken"), null);
          return Promise.reject(error);
        }

        useAuthStore.getState().setAccessToken(newToken);
        processQueue(null, newToken);

        // Retry request cũ
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);
        useAuthStore.getState().logout();
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
