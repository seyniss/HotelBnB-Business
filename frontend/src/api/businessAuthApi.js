import axiosClient from "./axiosClient";

const businessAuthApi = {
  login: async (credentials) => {
    return axiosClient.post("/business/auth/login", credentials);
  },

  logout: async () => {
    return axiosClient.post("/business/auth/logout");
  },

  getMyInfo: async () => {
    return axiosClient.get("/business/auth/me");
  },

  changePassword: async (data) => {
    return axiosClient.put("/business/auth/password", data);
  },

  forgotPassword: async (email) => {
    return axiosClient.post("/business/auth/forgot-password", { email });
  },

  signup: async (data) => {
    return axiosClient.post("/business/auth/signup", data);
  },

  updateProfile: async (data) => {
    return axiosClient.put("/business/auth/profile", data);
  },

  kakaoLogin: async (kakaoToken) => {
    return axiosClient.post("/business/auth/kakao", { access_token: kakaoToken });
  },

  completeKakaoSignup: async (data) => {
    return axiosClient.post("/business/auth/kakao/complete", data);
  },
};

export { businessAuthApi };
export default businessAuthApi;
