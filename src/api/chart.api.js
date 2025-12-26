import api from "./axios";

export const getZingChart = () => api.get("/charts/zing");

export const getZingChartSeries = (params) =>
  api.get("/charts/zing/series", { params });

export const getNewReleaseChart = () => api.get("/charts/new-release");

export const getTop100Chart = () => api.get("/charts/top-100");