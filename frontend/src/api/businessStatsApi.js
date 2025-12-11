import axiosClient from "./axiosClient";

export const businessStatsApi = {
  getDashboardStats: async () => {
    return axiosClient.get("/business/stats/dashboard");
  },

  getStatistics: async (params) => {
    return axiosClient.get("/business/stats", { params });
  },

  getRevenueStats: async (period) => {
    return axiosClient.get("/business/stats/revenue", { params: { period } });
  },

  getBookingStats: async (period) => {
    return axiosClient.get("/business/stats/bookings", { params: { period } });
  },

  getOccupancyStats: async (period) => {
    return axiosClient.get("/business/stats/occupancy", { params: { period } });
  },
};

export default businessStatsApi;
