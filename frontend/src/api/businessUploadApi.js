import axiosClient from "./axiosClient";

export const businessUploadApi = {
  /**
   * S3 업로드를 위한 presigned URL 생성
   * @param {string} filename - 파일명
   * @param {string} contentType - 파일의 MIME 타입 (예: 'image/jpeg', 'image/png')
   * @param {number} fileSize - 파일 크기 (바이트 단위, 선택적)
   * @returns {Promise<{url: string, key: string}>} presigned URL과 S3 key
   */
  generatePresignUrl: async (filename, contentType, fileSize = null) => {
    return axiosClient.post("/business/upload/presign", {
      filename,
      contentType,
      ...(fileSize !== null && { fileSize }),
    });
  },
};

export default businessUploadApi;

