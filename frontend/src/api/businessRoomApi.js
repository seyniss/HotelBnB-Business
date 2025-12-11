import axiosClient from "./axiosClient";

export const businessRoomApi = {
  getRooms: async (params) => {
    return axiosClient.get("/business/rooms", { params });
  },

  getRoomById: async (id) => {
    return axiosClient.get(`/business/rooms/${id}`);
  },

  createRoom: async (data) => {
    return axiosClient.post("/business/rooms", data);
  },

  updateRoom: async (id, data) => {
    return axiosClient.put(`/business/rooms/${id}`, data);
  },

  deleteRoom: async (id) => {
    return axiosClient.delete(`/business/rooms/${id}`);
  },

  updateRoomStatus: async (id, status) => {
    return axiosClient.patch(`/business/rooms/${id}/status`, { status });
  },
};

export default businessRoomApi;
