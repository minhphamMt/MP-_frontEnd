import { create } from "zustand";
import { loginApi, registerApi, getMeApi } from "../api/auth.api";

/**
 * Auth store
 * - login / register / loadUser / logout
 * - role-based: USER | ARTIST | ADMIN
 * - accessToken kept in memory
 */
const useAuthStore = create((set, get) => ({
  /* =====================
     STATE
     ===================== */
  user: null,
  accessToken: null,
  role: null,
  isAuthenticated: false,
  loading: false,

  // 🔴 QUAN TRỌNG: auth đã sẵn sàng hay chưa
  isAuthReady: false,

  /* =====================
     ACTIONS
     ===================== */

  setAccessToken: (token) => set({ accessToken: token }),

  /* ===== LOGIN ===== */
  login: async ({ email, password }) => {
    set({ loading: true, isAuthReady: false });
    try {
      const res = await loginApi({ email, password });

      const accessToken = res.data?.accessToken || res.data?.data?.accessToken;
      const user = res.data?.user || res.data?.data?.user;

      if (!accessToken || !user) {
        throw new Error("Login response missing accessToken or user");
      }

      set({
        user,
        accessToken,
        role: user.role,
        isAuthenticated: true,
        loading: false,
        isAuthReady: true, // ✅ AUTH SẴN SÀNG
      });

      return user;
    } catch (err) {
      set({ loading: false, isAuthReady: true });
      throw err;
    }
  },

  /* ===== REGISTER ===== */
  register: async ({ email, password, display_name }) => {
    set({ loading: true, isAuthReady: false });
    try {
      const res = await registerApi({
        email,
        password,
        display_name,
      });

      const accessToken = res.data?.accessToken || res.data?.data?.accessToken;
      const user = res.data?.user || res.data?.data?.user;

      if (!accessToken || !user) {
        throw new Error("Register response missing accessToken or user");
      }

      set({
        user,
        accessToken,
        role: user.role,
        isAuthenticated: true,
        loading: false,
        isAuthReady: true, // ✅
      });

      return user;
    } catch (err) {
      set({ loading: false, isAuthReady: true });
      throw err;
    }
  },

  /* ===== LOAD USER (REFRESH LOGIN) ===== */
  loadUser: async () => {
    set({ loading: true, isAuthReady: false });

    try {
      const res = await getMeApi();

      const user = res.data?.data || res.data;

      if (!user?.role) {
        throw new Error("Invalid /users/me response");
      }

      set({
        user,
        role: user.role,
        isAuthenticated: true,
        loading: false,
        isAuthReady: true, // ✅ CHỈ ĐÁNH TRUE KHI ME OK
      });

      return user;
    } catch (err) {
      get().logout();
      return null;
    }
  },

  /* ===== LOGOUT ===== */
  logout: () => {
    set({
      user: null,
      accessToken: null,
      role: null,
      isAuthenticated: false,
      loading: false,
      isAuthReady: true, // vẫn coi là ready
    });
  },
}));

export default useAuthStore;
