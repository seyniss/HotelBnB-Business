const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { presignPut } = require('../../src/s3.js');

// 허용된 이미지 MIME 타입
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp'
];

// 허용된 이미지 확장자
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

// MIME 타입과 확장자 매핑
const MIME_TO_EXTENSION = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/jpg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/gif': ['.gif'],
  'image/webp': ['.webp']
};

/**
 * 파일명에서 경로 injection 방지를 위한 정제
 * @param {string} filename - 원본 파일명
 * @returns {string} 정제된 파일명
 */
const sanitizeFilename = (filename) => {
  // 경로 분리자 제거 및 파일명만 추출
  const basename = path.basename(filename);
  // 특수 문자 제거 (알파벳, 숫자, 점, 하이픈, 언더스코어만 허용)
  return basename.replace(/[^a-zA-Z0-9.\-_]/g, '');
};

/**
 * 이미지 타입 검증
 * @param {string} contentType - MIME 타입
 * @param {string} filename - 파일명
 * @throws {Error} 허용되지 않은 타입인 경우
 */
const validateImageType = (contentType, filename) => {
  // MIME 타입 검증
  if (!ALLOWED_IMAGE_TYPES.includes(contentType.toLowerCase())) {
    throw new Error(`허용되지 않은 이미지 타입입니다. 허용 타입: ${ALLOWED_IMAGE_TYPES.join(', ')}`);
  }

  // 확장자 추출 및 검증
  const extension = path.extname(filename).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    throw new Error(`허용되지 않은 파일 확장자입니다. 허용 확장자: ${ALLOWED_EXTENSIONS.join(', ')}`);
  }

  // MIME 타입과 확장자 일치 검증
  const allowedExtensions = MIME_TO_EXTENSION[contentType.toLowerCase()];
  if (!allowedExtensions || !allowedExtensions.includes(extension)) {
    throw new Error(`파일 확장자(${extension})가 MIME 타입(${contentType})과 일치하지 않습니다.`);
  }
};

// Presign URL 생성
const generatePresignUrl = async (filename, contentType, fileSize = null) => {
  // 파일명 정제 (경로 injection 방지)
  const sanitizedFilename = sanitizeFilename(filename);
  
  // 이미지 타입 검증
  validateImageType(contentType, sanitizedFilename);

  // 파일 크기 제한 (10MB)
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  if (fileSize !== null && fileSize > MAX_FILE_SIZE) {
    throw new Error(`파일 크기는 ${MAX_FILE_SIZE / 1024 / 1024}MB를 초과할 수 없습니다.`);
  }

  // S3 키 생성 (경로는 서버에서 강제)
  const key = `hotels/${Date.now()}-${uuidv4()}${path.extname(sanitizedFilename)}`;
  // Presigned URL 만료 시간: 15분 (900초) - 보안 강화
  const url = await presignPut(key, contentType, 900);
  return { url, key };
};

module.exports = {
  generatePresignUrl
};

