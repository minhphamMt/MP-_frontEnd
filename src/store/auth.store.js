import { create } from "zustand";
import {
  artistLoginApi,
  artistRegisterApi,
  firebaseLoginApi,
  forgotPasswordApi,
  getMeApi,
  loginApi,
  logoutApi,
  registerApi,
  resendVerificationApi,
  resetPasswordApi,
  verifyEmailApi,
} from "../api/auth.api";
import { getPreferredAuthPath } from "../utils/routeContext";

const STORAGE_KEY = "auth-state";

const resetSessionStores = async () => {
  try {
    const { default: usePlayerStore } = await import("./player.store");
    usePlayerStore.getState().resetForAuthChange();
  } catch (error) {
    console.warn("Failed to reset player store", error);
  }

  try {
    const { default: useAlbumLikeStore } = await import("./album-like.store");
    useAlbumLikeStore.getState().resetForAuthChange?.();
  } catch (error) {
    console.warn("Failed to reset album like store", error);
  }

  try {
    const { default: useArtistFollowStore } = await import(
      "./artist-follow.store"
    );
    useArtistFollowStore.getState().clearFollowedArtists?.();
  } catch (error) {
    console.warn("Failed to reset artist follow store", error);
  }

  try {
    const { default: useRecommendationSessionStore } = await import(
      "./recommendation-session.store"
    );
    useRecommendationSessionStore.getState().resetForAuthChange?.();
  } catch (error) {
    console.warn("Failed to reset recommendation session store", error);
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
  const preferredAuthPath =
    parsed.preferredAuthPath ||
    getPreferredAuthPath({ role, authContext });

  return {
    user,
    accessToken,
    refreshToken,
    role,
    authContext,
    preferredAuthPath,
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
      preferredAuthPath: state.preferredAuthPath,
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

const {
  user: storedUser,
  accessToken: storedToken,
  refreshToken: storedRefreshToken,
  role: storedRole,
  authContext: storedAuthContext,
  preferredAuthPath: storedPreferredAuthPath,
  isAuthenticated: storedIsAuthenticated,
} = loadStoredAuth();

const hasStoredTokens = Boolean(storedToken || storedRefreshToken);

const buildPreferredAuthPath = ({ role = null, authContext = "default" } = {}) =>
  getPreferredAuthPath({ role, authContext });

const syncApiAuthRuntime = ({ accessToken = null, resetPending = false } = {}) => {
  import("../api/axios")
    .then(({ syncApiAuthRuntime: syncRuntime }) => {
      syncRuntime({ accessToken, resetPending });
    })
    .catch((error) => {
      console.warn("Failed to sync api auth runtime", error);
    });
};

const beginAuthRequest = (set, get) => {
  const nextVersion = (get().authRequestVersion || 0) + 1;
  set({
    loading: true,
    isAuthReady: false,
    authRequestVersion: nextVersion,
  });
  return nextVersion;
};

const isAuthRequestCurrent = (get, requestVersion) =>
  (get().authRequestVersion || 0) === requestVersion;

const useAuthStore = create((set, get) => ({
  user: storedUser || null,
  accessToken: storedToken || null,
  refreshToken: storedRefreshToken || null,
  role: storedRole || null,
  authContext: storedAuthContext || "default",
  preferredAuthPath:
    storedPreferredAuthPath ||
    buildPreferredAuthPath({
      role: storedRole || null,
      authContext: storedAuthContext || "default",
    }),
  isAuthenticated: storedIsAuthenticated || false,
  loading: false,
  isAuthReady: !hasStoredTokens,
  authRequestVersion: 0,

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
    syncApiAuthRuntime({ accessToken: nextState.accessToken });
  },

  setAuthContext: (authContext) => {
    const currentState = get();
    const nextState = {
      ...currentState,
      authContext,
      preferredAuthPath: buildPreferredAuthPath({
        role: currentState.role || null,
        authContext,
      }),
    };

    set({
      authContext,
      preferredAuthPath: nextState.preferredAuthPath,
    });
    persistAuthState(nextState);
  },

  updateUser: (user) => {
    const currentState = get();
    const nextRole = user?.role || currentState.role || null;
    const nextState = {
      ...currentState,
      user,
      role: nextRole,
      preferredAuthPath: buildPreferredAuthPath({
        role: nextRole,
        authContext: currentState.authContext || "default",
      }),
      isAuthenticated: Boolean(
        user && (currentState.accessToken || currentState.refreshToken)
      ),
    };

    set(nextState);
    persistAuthState(nextState);
  },

  bootstrapAuth: async () => {
    const { accessToken, refreshToken, isAuthReady } = get();
    if (isAuthReady) return get().user;

    if (!accessToken && !refreshToken) {
      set({ loading: false, isAuthReady: true, isAuthenticated: false });
      return null;
    }

    return get().loadUser();
  },

  login: async ({ email, password }) => {
    const requestVersion = beginAuthRequest(set, get);
    try {
      const res = await loginApi({ email, password });
      const accessToken = res.data?.accessToken || res.data?.data?.accessToken;
      const refreshToken =
        res.data?.refreshToken || res.data?.data?.refreshToken;
      const user = res.data?.user || res.data?.data?.user;

      if (!accessToken || !refreshToken || !user) {
        throw new Error("Login response missing token(s) or user");
      }

      if (!isAuthRequestCurrent(get, requestVersion)) return null;

      const nextState = {
        user,
        accessToken,
        role: user.role,
        refreshToken,
        authContext: "default",
        preferredAuthPath: buildPreferredAuthPath({
          role: user.role,
          authContext: "default",
        }),
        isAuthenticated: true,
        loading: false,
        isAuthReady: true,
      };

      set(nextState);
      persistAuthState(nextState);
      syncApiAuthRuntime({ accessToken });
      return user;
    } catch (error) {
      if (isAuthRequestCurrent(get, requestVersion)) {
        set({ loading: false, isAuthReady: true });
      }
      throw error;
    }
  },

  firebaseLogin: async ({ idToken }) => {
    const requestVersion = beginAuthRequest(set, get);
    try {
      const res = await firebaseLoginApi({ idToken });
      const accessToken = res.data?.accessToken || res.data?.data?.accessToken;
      const refreshToken =
        res.data?.refreshToken || res.data?.data?.refreshToken;
      const user = res.data?.user || res.data?.data?.user;

      if (!accessToken || !refreshToken || !user) {
        throw new Error("Firebase login response missing token(s) or user");
      }

      if (!isAuthRequestCurrent(get, requestVersion)) return null;

      const nextState = {
        user,
        accessToken,
        role: user.role,
        refreshToken,
        authContext: "default",
        preferredAuthPath: buildPreferredAuthPath({
          role: user.role,
          authContext: "default",
        }),
        isAuthenticated: true,
        loading: false,
        isAuthReady: true,
      };

      set(nextState);
      persistAuthState(nextState);
      syncApiAuthRuntime({ accessToken });
      return user;
    } catch (error) {
      if (isAuthRequestCurrent(get, requestVersion)) {
        set({ loading: false, isAuthReady: true });
      }
      throw error;
    }
  },

  register: async ({ email, password, display_name }) => {
    const requestVersion = beginAuthRequest(set, get);
    try {
      const res = await registerApi({
        email,
        password,
        display_name,
      });

      const accessToken = res.data?.accessToken || res.data?.data?.accessToken;
      const refreshToken =
        res.data?.refreshToken || res.data?.data?.refreshToken;
      const user = res.data?.user || res.data?.data?.user;
      const requiresEmailVerification =
        res.data?.requires_email_verification ||
        res.data?.data?.requires_email_verification;

      if (requiresEmailVerification) {
        if (!isAuthRequestCurrent(get, requestVersion)) return null;

        set({ loading: false, isAuthReady: true });
        return {
          requires_email_verification: true,
          message: res.data?.message || res.data?.data?.message,
        };
      }

      if (!accessToken || !refreshToken || !user) {
        throw new Error("Register response missing token(s) or user");
      }

      if (!isAuthRequestCurrent(get, requestVersion)) return null;

      const nextState = {
        user,
        accessToken,
        role: user.role,
        refreshToken,
        authContext: "default",
        preferredAuthPath: buildPreferredAuthPath({
          role: user.role,
          authContext: "default",
        }),
        isAuthenticated: true,
        loading: false,
        isAuthReady: true,
      };

      set(nextState);
      persistAuthState(nextState);
      syncApiAuthRuntime({ accessToken });
      return user;
    } catch (error) {
      if (isAuthRequestCurrent(get, requestVersion)) {
        set({ loading: false, isAuthReady: true });
      }
      throw error;
    }
  },

  loadUser: async () => {
    const { accessToken, refreshToken } = get();
    if (!accessToken && !refreshToken) {
      set({ loading: false, isAuthReady: true, isAuthenticated: false });
      return null;
    }

    const requestVersion = beginAuthRequest(set, get);

    try {
      const res = await getMeApi();
      const user = res.data?.data || res.data;

      if (!user?.role) {
        throw new Error("Invalid /users/me response");
      }

      if (!isAuthRequestCurrent(get, requestVersion)) return null;

      const authContext = get().authContext || "default";
      const nextState = {
        user,
        role: user.role,
        isAuthenticated: true,
        loading: false,
        isAuthReady: true,
        accessToken: get().accessToken,
        refreshToken: get().refreshToken,
        authContext,
        preferredAuthPath: buildPreferredAuthPath({
          role: user.role,
          authContext,
        }),
      };

      set(nextState);
      persistAuthState(nextState);
      syncApiAuthRuntime({ accessToken: nextState.accessToken });
      return user;
    } catch (error) {
      if (!isAuthRequestCurrent(get, requestVersion)) {
        return null;
      }

      console.error("Load user error", error);
      get().logout();
      return null;
    }
  },

  loginArtist: async ({ email, password }) => {
    const requestVersion = beginAuthRequest(set, get);
    try {
      const res = await artistLoginApi({ email, password });
      const accessToken = res.data?.accessToken || res.data?.data?.accessToken;
      const refreshToken =
        res.data?.refreshToken || res.data?.data?.refreshToken;
      const user = res.data?.user || res.data?.data?.user;

      if (!accessToken || !refreshToken || !user) {
        throw new Error("Login response missing token(s) or user");
      }

      if (!isAuthRequestCurrent(get, requestVersion)) return null;

      const nextState = {
        user,
        accessToken,
        role: user.role,
        refreshToken,
        authContext: "artist_request",
        preferredAuthPath: buildPreferredAuthPath({
          role: user.role,
          authContext: "artist_request",
        }),
        isAuthenticated: true,
        loading: false,
        isAuthReady: true,
      };

      set(nextState);
      persistAuthState(nextState);
      syncApiAuthRuntime({ accessToken });
      return user;
    } catch (error) {
      if (isAuthRequestCurrent(get, requestVersion)) {
        set({ loading: false, isAuthReady: true });
      }
      throw error;
    }
  },

  registerArtist: async ({ email, password, display_name }) => {
    const requestVersion = beginAuthRequest(set, get);
    try {
      const res = await artistRegisterApi({
        email,
        password,
        display_name,
      });

      const accessToken = res.data?.accessToken || res.data?.data?.accessToken;
      const refreshToken =
        res.data?.refreshToken || res.data?.data?.refreshToken;
      const user = res.data?.user || res.data?.data?.user;
      const requiresEmailVerification =
        res.data?.requires_email_verification ||
        res.data?.data?.requires_email_verification;

      if (requiresEmailVerification) {
        if (!isAuthRequestCurrent(get, requestVersion)) return null;

        set({ loading: false, isAuthReady: true });
        return {
          requires_email_verification: true,
          message: res.data?.message || res.data?.data?.message,
        };
      }

      if (!accessToken || !refreshToken || !user) {
        throw new Error("Register response missing token(s) or user");
      }

      if (!isAuthRequestCurrent(get, requestVersion)) return null;

      const nextState = {
        user,
        accessToken,
        role: user.role,
        refreshToken,
        authContext: "artist_request",
        preferredAuthPath: buildPreferredAuthPath({
          role: user.role,
          authContext: "artist_request",
        }),
        isAuthenticated: true,
        loading: false,
        isAuthReady: true,
      };

      set(nextState);
      persistAuthState(nextState);
      syncApiAuthRuntime({ accessToken });
      return user;
    } catch (error) {
      if (isAuthRequestCurrent(get, requestVersion)) {
        set({ loading: false, isAuthReady: true });
      }
      throw error;
    }
  },

  verifyEmailRegistration: async ({
    email,
    verification_code,
    authContext = "default",
  }) => {
    const requestVersion = beginAuthRequest(set, get);
    try {
      const res = await verifyEmailApi({ email, verification_code });
      const accessToken = res.data?.accessToken || res.data?.data?.accessToken;
      const refreshToken =
        res.data?.refreshToken || res.data?.data?.refreshToken;
      const user = res.data?.user || res.data?.data?.user;

      if (!accessToken || !refreshToken || !user) {
        throw new Error("Verify email response missing token(s) or user");
      }

      if (!isAuthRequestCurrent(get, requestVersion)) return null;

      const nextState = {
        user,
        accessToken,
        refreshToken,
        role: user.role,
        authContext,
        preferredAuthPath: buildPreferredAuthPath({
          role: user.role,
          authContext,
        }),
        isAuthenticated: true,
        loading: false,
        isAuthReady: true,
      };

      set(nextState);
      persistAuthState(nextState);
      syncApiAuthRuntime({ accessToken });
      return user;
    } catch (error) {
      if (isAuthRequestCurrent(get, requestVersion)) {
        set({ loading: false, isAuthReady: true });
      }
      throw error;
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

  logout: async ({ preferredAuthPath } = {}) => {
    const currentState = get();
    const refreshToken = currentState.refreshToken;
    const nextAuthRequestVersion = (currentState.authRequestVersion || 0) + 1;
    const nextPreferredAuthPath =
      preferredAuthPath ||
      getPreferredAuthPath({
        pathname:
          typeof window !== "undefined" ? window.location.pathname : "/",
        search: typeof window !== "undefined" ? window.location.search : "",
        role: currentState.role,
        authContext: currentState.authContext,
        fallback: currentState.preferredAuthPath,
      });

    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      role: null,
      authContext: "default",
      preferredAuthPath: nextPreferredAuthPath,
      isAuthenticated: false,
      loading: false,
      isAuthReady: true,
      authRequestVersion: nextAuthRequestVersion,
    });

    clearStoredAuth();
    syncApiAuthRuntime({
      accessToken: null,
      resetPending: true,
    });
    await resetSessionStores();

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
