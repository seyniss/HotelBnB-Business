/**
 * API 응답 구조 처리 유틸리티
 * 백엔드 응답 구조: { data: {...}, message, resultCode }
 * axiosClient 인터셉터가 response.data를 반환하므로 실제로는 { data: {...}, message, resultCode } 형태
 */

/**
 * API 응답에서 데이터 추출
 * @param {*} response - API 응답 객체
 * @param {string} dataPath - 데이터 경로 (예: 'rooms', 'bookings')
 * @returns {*} 추출된 데이터
 */
export const extractApiData = (response, dataPath = null) => {
  if (!response) return null;
  
  // dataPath가 지정된 경우 (예: 'rooms', 'bookings')
  if (dataPath) {
    return response?.data?.[dataPath] || response?.[dataPath] || null;
  }
  
  // dataPath가 없는 경우 전체 data 객체 반환
  return response?.data || response || null;
};

/**
 * API 응답에서 배열 데이터 추출 (안전하게)
 * @param {*} response - API 응답 객체
 * @param {string} dataPath - 데이터 경로 (예: 'rooms', 'bookings')
 * @returns {Array} 추출된 배열 데이터 (기본값: [])
 */
export const extractApiArray = (response, dataPath = null) => {
  const data = extractApiData(response, dataPath);
  return Array.isArray(data) ? data : [];
};

/**
 * API 에러에서 사용자 친화적인 메시지 추출
 * @param {Error} error - 에러 객체
 * @param {string} defaultMessage - 기본 에러 메시지
 * @returns {string} 에러 메시지
 */
export const extractErrorMessage = (error, defaultMessage = "요청 처리 중 오류가 발생했습니다.") => {
  if (!error) return defaultMessage;
  
  // axios 에러 응답
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  
  // 일반 에러 메시지
  if (error.message) {
    return error.message;
  }
  
  return defaultMessage;
};

/**
 * 페이지네이션 정보 추출
 * @param {*} response - API 응답 객체
 * @returns {Object} 페이지네이션 정보
 */
export const extractPagination = (response) => {
  const data = response?.data || response || {};
  return {
    totalPages: data.totalPages || 1,
    currentPage: data.currentPage || 1,
    total: data.total || 0,
  };
};

