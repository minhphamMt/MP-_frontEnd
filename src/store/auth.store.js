import { create } from "zustand";
import {
  loginApi,
  registerApi,
  getMeApi,
  firebaseLoginApi,
  artistLoginApi,
  artistRegisterApi,
  verifyEmailApi,
  resendVerificationApi,
  forgotPasswordApi,
  resetPasswordApi,
  logoutApi,
} from "../api/auth.api";
const STORAGE_KEY = "auth-state";

const resetPlayerStore = async () => {
  try {
    const { default: usePlayerStore } = await import("./player.store");
    usePlayerStore.getState().resetForAuthChange();
  } catch (error) {
    console.warn("Failed to reset player store", error);
  }
};

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
  const refreshToken = parsed.refreshToken || null;
  const role = user?.role || parsed.role || null;
  const authContext = parsed.authContext || "default";

  return {
    user,
    accessToken,
    refreshToken,
    role,
    authContext,
    isAuthenticated: Boolean(user && (accessToken || refreshToken)),
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
      refreshToken: state.refreshToken,
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
  refreshToken: storedRefreshToken,
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
  refreshToken: storedRefreshToken || null,
  role: storedRole || null,
  authContext: storedAuthContext || "default",
  isAuthenticated: storedIsAuthenticated || false,
  loading: false,

  // 🔴 QUAN TRỌNG: auth đã sẵn sàng hay chưa
  isAuthReady: false,

  /* =====================
     ACTIONS
     ===================== */

  setTokens: ({ accessToken, refreshToken }) => {
    const currentState = get();
    const nextState = {
      ...currentState,
      accessToken: accessToken ?? currentState.accessToken,
      refreshToken: refreshToken ?? currentState.refreshToken,
      isAuthenticated: Boolean(
        currentState.user &&
          ((accessToken ?? currentState.accessToken) ||
            (refreshToken ?? currentState.refreshToken))
      ),
    };

    set({
      accessToken: nextState.accessToken,
      refreshToken: nextState.refreshToken,
      isAuthenticated: nextState.isAuthenticated,
    });
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
      isAuthenticated: Boolean(user && (currentState.accessToken || currentState.refreshToken)),
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
      const refreshToken = res.data?.refreshToken || res.data?.data?.refreshToken;
      const user = res.data?.user || res.data?.data?.user;

      if (!accessToken || !refreshToken || !user) {
        throw new Error("Login response missing token(s) or user");
      }

      const nextState = {
        user,
        accessToken,
        role: user.role,
        refreshToken,
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
      const refreshToken = res.data?.refreshToken || res.data?.data?.refreshToken;
      const user = res.data?.user || res.data?.data?.user;

      if (!accessToken || !refreshToken || !user) {
        throw new Error("Firebase login response missing token(s) or user");
      }

      const nextState = {
        user,
        accessToken,
        role: user.role,
        refreshToken,
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
      const refreshToken = res.data?.refreshToken || res.data?.data?.refreshToken;
      const user = res.data?.user || res.data?.data?.user;
      const requiresEmailVerification =
        res.data?.requires_email_verification ||
        res.data?.data?.requires_email_verification;

      if (requiresEmailVerification) {
        set({ loading: false, isAuthReady: true });
        return {
          requires_email_verification: true,
          message: res.data?.message || res.data?.data?.message,
        };
      }

      if (!accessToken || !refreshToken || !user) {
        throw new Error("Register response missing token(s) or user");
      }

      const nextState = {
        user,
        accessToken,
        role: user.role,
        refreshToken,
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
        refreshToken: get().refreshToken,
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
      const refreshToken = res.data?.refreshToken || res.data?.data?.refreshToken;
      const user = res.data?.user || res.data?.data?.user;

      if (!accessToken || !refreshToken || !user) {
        throw new Error("Login response missing token(s) or user");
      }

      const nextState = {
        user,
        accessToken,
        role: user.role,
        refreshToken,
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
      const refreshToken = res.data?.refreshToken || res.data?.data?.refreshToken;
      const user = res.data?.user || res.data?.data?.user;
      const requiresEmailVerification =
        res.data?.requires_email_verification ||
        res.data?.data?.requires_email_verification;

      if (requiresEmailVerification) {
        set({ loading: false, isAuthReady: true });
        return {
          requires_email_verification: true,
          message: res.data?.message || res.data?.data?.message,
        };
      }

      if (!accessToken || !refreshToken || !user) {
        throw new Error("Register response missing token(s) or user");
      }

      const nextState = {
        user,
        accessToken,
        role: user.role,
        refreshToken,
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

  verifyEmailRegistration: async ({ email, verification_code, authContext = "default" }) => {
    set({ loading: true, isAuthReady: false });
    try {
      const res = await verifyEmailApi({ email, verification_code });
      const accessToken = res.data?.accessToken || res.data?.data?.accessToken;
      const refreshToken = res.data?.refreshToken || res.data?.data?.refreshToken;
      const user = res.data?.user || res.data?.data?.user;

      if (!accessToken || !refreshToken || !user) {
        throw new Error("Verify email response missing token(s) or user");
      }

      const nextState = {
        user,
        accessToken,
        refreshToken,
        role: user.role,
        authContext,
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

  resendVerification: async ({ email }) => {
    const res = await resendVerificationApi({ email });
    return res.data?.message || res.data?.data?.message;
  },

  forgotPassword: async ({ email }) => {
    const res = await forgotPasswordApi({ email });
    return res.data?.message || res.data?.data?.message;
  },

  resetPassword: async ({ email, verification_code, new_password }) => {
    const res = await resetPasswordApi({
      email,
      verification_code,
      new_password,
    });
    return res.data?.message || res.data?.data?.message;
  },

  /* ===== LOGOUT ===== */
  logout: async () => {
    const refreshToken = get().refreshToken;

    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      role: null,
      authContext: "default",
      isAuthenticated: false,
      loading: false,
      isAuthReady: true,
    });
    clearStoredAuth();
    await resetPlayerStore();

    if (refreshToken) {
      try {
        await logoutApi(refreshToken);
      } catch (error) {
        console.warn("Logout API failed", error);
      }
    }
  },
}));

export default useAuthStore;
