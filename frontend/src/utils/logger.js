/**
 * 로깅 유틸리티
 * 개발 모드에서만 로그를 출력하고, 프로덕션에서는 제거
 */

const isDev = import.meta.env.DEV;

export const logger = {
  log: (...args) => {
    if (isDev) {
      console.log(...args);
    }
  },
  
  error: (...args) => {
    if (isDev) {
      console.error(...args);
    }
    // 프로덕션에서는 에러 추적 서비스로 전송 가능
  },
  
  warn: (...args) => {
    if (isDev) {
      console.warn(...args);
    }
  },
  
  info: (...args) => {
    if (isDev) {
      console.info(...args);
    }
  },
};

