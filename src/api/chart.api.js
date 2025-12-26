import api from "./axios";

export const getZingChart = () => api.get("/charts/zing");

export const getNewReleaseChart = () => api.get("/charts/new-release");

export const getTop100Chart = () => api.get("/charts/top-100");