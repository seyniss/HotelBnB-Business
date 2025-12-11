import { createContext, useState, useEffect } from "react";
import businessAuthApi from "../api/businessAuthApi";
import { extractApiData } from "../utils/apiUtils";
import { logger } from "../utils/logger";

export const BusinessAuthContext = createContext(null);

export const BusinessAuthProvider = ({ children }) => {
  const [businessInfo, setBusinessInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem("businessToken");
      if (token) {
        const response = await businessAuthApi.getMyInfo();
        const businessInfo = extractApiData(response);
        setBusinessInfo(businessInfo);
      }
    } catch (error) {
      localStorage.removeItem("businessToken");
      logger.error("인증 확인 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    const response = await businessAuthApi.login(credentials);
    const data = extractApiData(response);
    const token = data?.token || response?.token;
    const business = data?.business || response?.business;
    
    if (token) {
      localStorage.setItem("businessToken", token);
    }
    if (business) {
      setBusinessInfo(business);
    }
    
    logger.log("로그인 응답:", response);
    
    // 호텔 정보 확인을 위해 반환값에 hasHotel 플래그 추가
    const hasHotel = await checkHotelExists();
    return { hasHotel };
  };
  
  const checkHotelExists = async () => {
    try {
      const { businessHotelApi } = await import("../api/businessHotelApi");
      const hotelData = await businessHotelApi.getMyHotel();
      const hotel = extractApiData(hotelData);
      return !!(hotel && hotel.id); // 호텔이 존재하는지 확인
    } catch (error) {
      // 호텔이 없거나 에러가 발생한 경우 (404 등)
      if (error.response?.status === 404) {
        return false;
      }
      logger.log("호텔 정보 확인 실패:", error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await businessAuthApi.logout();
    } finally {
      localStorage.removeItem("businessToken");
      setBusinessInfo(null);
    }
  };

  const signup = async (userData) => {
    const response = await businessAuthApi.signup(userData);
    const data = extractApiData(response);
    const token = data?.token || response?.token;
    const business = data?.business || response?.business;
    
    if (token) {
      localStorage.setItem("businessToken", token);
    }
    if (business) {
      setBusinessInfo(business);
    }
    
    logger.log("회원가입 응답:", response);
    
    // 신규 가입자는 호텔이 없으므로 false 반환
    return { hasHotel: false };
  };

  const kakaoLogin = async (kakaoToken) => {
    const response = await businessAuthApi.kakaoLogin(kakaoToken);
    const data = extractApiData(response);
    
    // 추가 정보가 필요한 경우
    if (data.needsAdditionalInfo) {
      return {
        needsAdditionalInfo: true,
        tempUserId: data.tempUserId,
      };
    }
    
    // 바로 로그인 가능한 경우
    const token = data.token;
    if (token) {
      localStorage.setItem("businessToken", token);
    }
    if (data.business) {
      setBusinessInfo(data.business);
    }
    return {
      needsAdditionalInfo: false,
    };
  };

  return (
    <BusinessAuthContext.Provider
      value={{ businessInfo, loading, login, logout, signup, checkAuth, kakaoLogin }}
    >
      {children}
    </BusinessAuthContext.Provider>
  );
};

export default BusinessAuthContext;
