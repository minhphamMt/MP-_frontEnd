import { create } from "zustand";
import { loginApi, registerApi, getMeApi } from "../api/auth.api";

const STORAGE_KEY = "auth-state";

const safeParseJson = (value) => {
  try {
    return JSON.parse(value);
  } catch (error) {
    console.error("Failed to parse auth state", error);
    return null;
  }
};

const loadStoredAuth = () => {
  if (typeof localStorage === "undefined") return {};

  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return {};

  const parsed = safeParseJson(raw);
  if (!parsed) return {};

  const user = parsed.user || null;
  const accessToken = parsed.accessToken || null;
  const role = user?.role || parsed.role || null;

  return {
    user,
    accessToken,
    role,
    isAuthenticated: Boolean(user && accessToken),
  };
};

const persistAuthState = (state) => {
  if (typeof localStorage === "undefined") return;

  try {
    const payload = {
      user: state.user,
      accessToken: state.accessToken,
      role: state.role,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (error) {
    console.error("Failed to persist auth state", error);
  }
};

const clearStoredAuth = () => {
  if (typeof localStorage === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
};

/**
 * Auth store
 * - login / register / loadUser / logout
 * - role-based: USER | ARTIST | ADMIN
 * - accessToken kept in memory
 */
const { user: storedUser, accessToken: storedToken, role: storedRole, isAuthenticated: storedIsAuthenticated } = loadStoredAuth();

const useAuthStore = create((set, get) => ({
  /* =====================
     STATE
     ===================== */
  user: storedUser || null,
  accessToken: storedToken || null,
  role: storedRole || null,
  isAuthenticated: storedIsAuthenticated || false,
  loading: false,

  // 🔴 QUAN TRỌNG: auth đã sẵn sàng hay chưa
  isAuthReady: false,

  /* =====================
     ACTIONS
     ===================== */

  setAccessToken: (token) => {
    const currentState = get();
    const nextState = {
      ...currentState,
      accessToken: token,
    };

    set({ accessToken: token });
    persistAuthState(nextState);
  },

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

      const nextState = {
        user,
        accessToken,
        role: user.role,
        isAuthenticated: true,
        loading: false,
        isAuthReady: true, // ✅ AUTH SẴN SÀNG
      };

      set(nextState);
      persistAuthState(nextState);

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

      const nextState = {
        user,
        accessToken,
        role: user.role,
        isAuthenticated: true,
        loading: false,
        isAuthReady: true, // ✅
      };

      set(nextState);
      persistAuthState(nextState);

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

      const nextState = {
        user,
        role: user.role,
        isAuthenticated: true,
        loading: false,
        isAuthReady: true, // ✅ CHỈ ĐÁNH TRUE KHI ME OK
        accessToken: get().accessToken, // giữ token đang có
      };

      set(nextState);
      persistAuthState(nextState);

      return user;
    } catch (err) {
      console.error("Load user error", err);
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

    clearStoredAuth();
  },
}));

export default useAuthStore;