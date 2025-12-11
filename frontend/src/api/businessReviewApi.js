import axiosClient from "./axiosClient";

export const businessReviewApi = {
  getReviews: async (params) => {
    return axiosClient.get("/business/reviews", { params });
  },

  getReviewById: async (id) => {
    return axiosClient.get(`/business/reviews/${id}`);
  },

  replyToReview: async (id, reply) => {
    return axiosClient.post(`/business/reviews/${id}/reply`, { reply });
  },

  reportReview: async (id, reason) => {
    return axiosClient.post(`/business/reviews/${id}/report`, { reason });
  },

  getReviewStats: async () => {
    return axiosClient.get("/business/reviews/stats");
  },
};

export default businessReviewApi;
