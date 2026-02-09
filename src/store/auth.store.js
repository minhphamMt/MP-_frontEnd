import { create } from "zustand";
import {
  loginApi,
  registerApi,
  getMeApi,
  firebaseLoginApi,
  artistLoginApi,
  artistRegisterApi,
} from "../api/auth.api";
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
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
  const authContext = parsed.authContext || "default";

  return {
    user,
    accessToken,
    role,
    authContext,
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
      authContext: state.authContext,
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
const {
  user: storedUser,
  accessToken: storedToken,
  role: storedRole,
  authContext: storedAuthContext,
  isAuthenticated: storedIsAuthenticated,
} = loadStoredAuth();

const useAuthStore = create((set, get) => ({
  /* =====================
     STATE
     ===================== */
  user: storedUser || null,
  accessToken: storedToken || null,
  role: storedRole || null,
  authContext: storedAuthContext || "default",
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
  setAuthContext: (authContext) => {
    const currentState = get();
    const nextState = {
      ...currentState,
      authContext,
    };
    set({ authContext });
    persistAuthState(nextState);
  },
  updateUser: (user) => {
    const currentState = get();
    const nextState = {
      ...currentState,
      user,
      role: user?.role || currentState.role || null,
      isAuthenticated: Boolean(user && currentState.accessToken),
    };

    set(nextState);
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
        authContext: "default",
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

   /* ===== FIREBASE LOGIN ===== */
  firebaseLogin: async ({ idToken }) => {
    set({ loading: true, isAuthReady: false });
    try {
      const res = await firebaseLoginApi({ idToken });

      const accessToken = res.data?.accessToken || res.data?.data?.accessToken;
      const user = res.data?.user || res.data?.data?.user;

      if (!accessToken || !user) {
        throw new Error("Firebase login response missing accessToken or user");
      }

      const nextState = {
        user,
        accessToken,
        role: user.role,
        authContext: "default",
        isAuthenticated: true,
        loading: false,
        isAuthReady: true,
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
        authContext: "default",
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
        authContext: get().authContext || "default",
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

  /* ===== ARTIST LOGIN ===== */
  loginArtist: async ({ email, password }) => {
    set({ loading: true, isAuthReady: false });
    try {
      const res = await artistLoginApi({ email, password });

      const accessToken = res.data?.accessToken || res.data?.data?.accessToken;
      const user = res.data?.user || res.data?.data?.user;

      if (!accessToken || !user) {
        throw new Error("Login response missing accessToken or user");
      }

      const nextState = {
        user,
        accessToken,
        role: user.role,
        authContext: "artist_request",
        isAuthenticated: true,
        loading: false,
        isAuthReady: true,
      };

      set(nextState);
      persistAuthState(nextState);

      return user;
    } catch (err) {
      set({ loading: false, isAuthReady: true });
      throw err;
    }
  },

  /* ===== ARTIST REGISTER ===== */
  registerArtist: async ({ email, password, display_name }) => {
    set({ loading: true, isAuthReady: false });
    try {
      const res = await artistRegisterApi({
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
        authContext: "artist_request",
        isAuthenticated: true,
        loading: false,
        isAuthReady: true,
      };

      set(nextState);
      persistAuthState(nextState);

      return user;
    } catch (err) {
      set({ loading: false, isAuthReady: true });
      throw err;
    }
  },

  /* ===== LOGOUT ===== */
  logout: () => {
    set({
      user: null,
      accessToken: null,
      role: null,
      authContext: "default",
      isAuthenticated: false,
      loading: false,
      isAuthReady: true, // vẫn coi là ready
    });

    clearStoredAuth();
  },
}));

export default useAuthStore;
