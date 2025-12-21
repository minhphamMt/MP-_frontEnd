import { create } from "zustand";
import { loginApi, registerApi, getMeApi } from "../api/auth.api";

/**
 * Auth store (Phase 0)
 * - login/register/logout/loadUser
 * - role-based: USER | ARTIST | ADMIN
 * - accessToken kept in memory (simple + safe enough for khóa luận)
 */
const useAuthStore = create((set, get) => ({
  user: null,
  accessToken: null,
  role: null,
  isAuthenticated: false,
  loading: false,

  setAccessToken: (token) => set({ accessToken: token }),

  login: async ({ email, password }) => {
    set({ loading: true });
    try {
      const res = await loginApi({ email, password });

      // Backend bạn có thể trả thẳng { accessToken, user } hoặc bọc data
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
      });

      return user;
    } catch (err) {
      set({ loading: false });
      throw err;
    }
  },

  register: async ({ email, password, display_name }) => {
    set({ loading: true });
    try {
      const res = await registerApi({ email, password, display_name });

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
      });

      return user;
    } catch (err) {
      set({ loading: false });
      throw err;
    }
  },

  loadUser: async () => {
    // IMPORTANT: không check accessToken ở đây
    // Vì axios có thể refresh dựa vào cookie refreshToken
    set({ loading: true });
    try {
      const res = await getMeApi();

      // Backend có thể trả thẳng user hoặc successResponse { data: user }
      const user = res.data?.data || res.data;

      if (!user?.role) {
        throw new Error("Invalid /users/me response");
      }

      set({
        user,
        role: user.role,
        isAuthenticated: true,
        loading: false,
      });

      return user;
    } catch (err) {
      get().logout();
      return null;
    }
  },

  logout: () => {
    set({
      user: null,
      accessToken: null,
      role: null,
      isAuthenticated: false,
      loading: false,
    });
  },
}));

export default useAuthStore;
