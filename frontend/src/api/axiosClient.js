import axios from "axios";
import { logger } from "../utils/logger";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // 쿠키를 포함하여 요청 전송
});

// 요청 인터셉터
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("businessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // 개발 모드에서 요청 데이터 로깅
    if (config.data) {
      logger.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, config.data);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터
axiosClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("businessToken");
      window.location.href = "/business/login";
    }
    // 에러 객체를 그대로 전달하여 상세 정보를 유지
    return Promise.reject(error);
  }
);

export default axiosClient;
