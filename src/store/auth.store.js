import { create } from "zustand";

const useAuthStore = create(() => ({
  accessToken: null,
  setAccessToken: () => {},
  logout: () => {},
}));

export default useAuthStore;
