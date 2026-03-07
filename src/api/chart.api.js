import api from "./axios";

export const getZingChart = (params) => api.get("/charts/zing", { params });

export const getZingChartSeries = (params) =>
  api.get("/charts/zing/series", { params });

export const getTop5Chart = (params) => api.get("/charts/top5", { params });

export const getNewReleaseChart = (params) =>
  api.get("/charts/new-release", { params });

export const getTop100Chart = () => api.get("/charts/top-100");
export const getTop50ByGenres = () => api.get("/charts/top-50/genres");
export const getRegionCharts = (params) =>
   api.get("/charts/regions", { params });

export const getWeeklyTopSongs = () => api.get("/charts/weekly/top5");

export const getWeeklyTopSeries = () => api.get("/charts/weekly/series");
