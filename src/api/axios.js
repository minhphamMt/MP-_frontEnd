import axios from "axios";
import useAuthStore from "../store/auth.store";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

const createAuthStateChangedError = () =>
  new axios.CanceledError("Auth state changed");

const setApiDefaultAuthorization = (token) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    return;
  }

  delete api.defaults.headers.common.Authorization;
};

const getAuthStateSignature = () => {
  const { user, role, authContext, accessToken, refreshToken, isAuthenticated } =
    useAuthStore.getState();
  const identity = user?.id ?? user?._id ?? user?.email ?? "anonymous";

  return [
    identity,
    role || "USER",
    authContext || "default",
    accessToken || "",
    refreshToken || "",
    isAuthenticated ? "1" : "0",
  ].join("|");
};

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((request) =>
    error ? request.reject(error) : request.resolve(token)
  );
  failedQueue = [];
};

export const syncApiAuthRuntime = ({
  accessToken = null,
  resetPending = false,
} = {}) => {
  setApiDefaultAuthorization(accessToken);

  if (!resetPending) return;

  isRefreshing = false;
  processQueue(createAuthStateChangedError(), null);
};

api.interceptors.request.use(
  (config) => {
    config.headers = config.headers || {};

    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      delete config.headers.Authorization;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (!error.response || !originalRequest) {
      return Promise.reject(error);
    }

    const status = error.response.status;
    if (status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    const authStateSignature = getAuthStateSignature();

    if (originalRequest.url?.includes("/auth/refresh")) {
      useAuthStore.getState().logout();
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        if (!token) {
          throw createAuthStateChangedError();
        }

        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = useAuthStore.getState().refreshToken;
      if (!refreshToken) {
        useAuthStore.getState().logout();
        processQueue(new Error("Missing refresh token"), null);
        return Promise.reject(error);
      }

      const refreshResponse = await api.post("/auth/refresh", { refreshToken });

      if (authStateSignature !== getAuthStateSignature()) {
        const canceledError = createAuthStateChangedError();
        processQueue(canceledError, null);
        return Promise.reject(canceledError);
      }

      const newToken =
        refreshResponse.data?.accessToken ||
        refreshResponse.data?.data?.accessToken ||
        null;
      const newRefreshToken =
        refreshResponse.data?.refreshToken ||
        refreshResponse.data?.data?.refreshToken ||
        refreshToken;

      if (!newToken) {
        useAuthStore.getState().logout();
        processQueue(new Error("Refresh did not return accessToken"), null);
        return Promise.reject(error);
      }

      useAuthStore.getState().setTokens({
        accessToken: newToken,
        refreshToken: newRefreshToken,
      });
      setApiDefaultAuthorization(newToken);
      processQueue(null, newToken);

      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      if (authStateSignature !== getAuthStateSignature()) {
        const canceledError = createAuthStateChangedError();
        processQueue(canceledError, null);
        return Promise.reject(canceledError);
      }

      processQueue(refreshError, null);
      useAuthStore.getState().logout();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
