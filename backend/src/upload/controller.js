const uploadService = require("./service");
const { successResponse, errorResponse } = require("../common/response");

// Presign URL 생성
const generatePresignUrl = async (req, res) => {
  try {
    const { filename, contentType, fileSize } = req.body;

    if (!filename || !contentType) {
      return res.status(400).json(errorResponse('filename/contentType은 필수입니다.', 400));
    }

    // 파일 크기가 제공된 경우 숫자로 변환
    const parsedFileSize = fileSize !== undefined ? parseInt(fileSize, 10) : null;
    if (parsedFileSize !== null && (isNaN(parsedFileSize) || parsedFileSize < 0)) {
      return res.status(400).json(errorResponse('fileSize는 유효한 숫자여야 합니다.', 400));
    }

    const result = await uploadService.generatePresignUrl(filename, contentType, parsedFileSize);
    return res.status(200).json(successResponse(result, "SUCCESS", 200));
  } catch (error) {
    // 검증 에러는 400으로, 기타 에러는 500으로 처리
    const statusCode = error.message.includes('허용되지 않은') || 
                       error.message.includes('일치하지 않습니다') || 
                       error.message.includes('파일 크기') 
                       ? 400 : 500;
    return res.status(statusCode).json(errorResponse(error.message || "presign 생성 실패", statusCode));
  }
};

// Ping
const ping = async (req, res) => {
  return res.status(200).json(successResponse({ ok: true }, "SUCCESS", 200));
};

module.exports = {
  generatePresignUrl,
  ping
};

