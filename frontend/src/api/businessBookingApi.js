import axiosClient from "./axiosClient";

export const businessBookingApi = {
  getBookings: async (params) => {
    return axiosClient.get("/business/bookings", { params });
  },

  getBookingById: async (id) => {
    return axiosClient.get(`/business/bookings/${id}`);
  },

  updateBookingStatus: async (id, status) => {
    return axiosClient.patch(`/business/bookings/${id}/status`, { status });
  },

  getBookingStats: async () => {
    return axiosClient.get("/business/bookings/stats");
  },
};

export default businessBookingApi;
