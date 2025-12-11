import axiosClient from "./axiosClient";

export const businessHotelApi = {
  getMyHotel: async () => {
    return axiosClient.get("/business/hotel");
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

  updateAmenities: async (amenityId, amenities) => {
    return axiosClient.put(`/business/amenities/${amenityId}`, amenities);
  },
};

export default businessHotelApi;
