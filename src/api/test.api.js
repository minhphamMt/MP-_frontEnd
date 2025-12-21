import api from "./axios";

export const testAuth = () => {
  return api.get("/users/me");
};
