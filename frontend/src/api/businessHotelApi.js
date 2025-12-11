import axiosClient from "./axiosClient";

export const businessHotelApi = {
  getMyHotel: async () => {
    return axiosClient.get("/business/hotel");
  },

  getHotelById: async (id) => {
    return axiosClient.get(`/business/hotel/${id}`);
  },

  createHotel: async (data) => {
    return axiosClient.post("/business/hotel", data);
  },

  updateHotel: async (id, data) => {
    // ID가 제공되면 /business/hotel/:id 사용, 없으면 /business/hotel 사용 (생성)
    if (id) {
      return axiosClient.put(`/business/hotel/${id}`, data);
    }
    return axiosClient.put("/business/hotel", data);
  },

  deleteHotel: async (id) => {
    return axiosClient.delete(`/business/hotel/${id}`);
  },

  updateHotelImages: async (images) => {
    return axiosClient.put("/business/hotel/images", { images });
  },

  getHotelStats: async () => {
    // 백엔드의 /business/stats/dashboard 엔드포인트 사용
    return axiosClient.get("/business/stats/dashboard");
  },

  createAmenities: async (lodgingId, amenities) => {
    return axiosClient.post("/business/amenities", {
      lodging_id: lodgingId,
      ...amenities,
    });
  },

  getAmenityByLodging: async (lodgingId) => {
    return axiosClient.get(`/business/amenities/lodging/${lodgingId}`);
  },

  updateAmenities: async (amenityId, amenities) => {
    return axiosClient.put(`/business/amenities/${amenityId}`, amenities);
  },
};

export default businessHotelApi;
