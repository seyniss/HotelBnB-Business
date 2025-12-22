import axios from "axios";
import { logger } from "../utils/logger";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 
           (import.meta.env.PROD ? "/api" : "http://localhost:3000/api"),
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// 요청 인터셉터
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("businessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // 개발 모드에서 요청 데이터 로깅
    const fullUrl = `${config.baseURL}${config.url}`;
    console.log(`[API Request] ${config.method?.toUpperCase()} ${fullUrl}`, config.data || '');
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
    // 404 에러 상세 로깅
    if (error.response?.status === 404) {
      const requestUrl = error.config ? `${error.config.baseURL}${error.config.url}` : 'unknown';
      console.error(`[404 Error] 요청 URL: ${requestUrl}`);
      console.error(`[404 Error] 응답 데이터:`, error.response?.data);
    }
    
    // 401 에러 처리 - 로그인/회원가입 관련 API는 리다이렉트하지 않음
    if (error.response?.status === 401) {
      const requestUrl = error.config?.url || '';
      const isAuthEndpoint = requestUrl.includes('/auth/login') || 
                            requestUrl.includes('/auth/signup') || 
                            requestUrl.includes('/auth/forgot-password');
      
      // 로그인/회원가입 관련 엔드포인트가 아니고, 현재 경로가 로그인 페이지가 아닐 때만 리다이렉트
      if (!isAuthEndpoint && !window.location.pathname.includes('/login')) {
        localStorage.removeItem("businessToken");
        window.location.href = "/business/login";
      } else {
        // 로그인/회원가입 관련 엔드포인트이거나 이미 로그인 페이지에 있으면 토큰만 제거
        localStorage.removeItem("businessToken");
      }
    }
    
    // 에러 객체를 그대로 전달하여 상세 정보를 유지
    return Promise.reject(error);
  }
);

export default axiosClient;
