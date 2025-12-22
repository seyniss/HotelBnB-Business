import { useState, useRef } from "react";
import { businessUploadApi } from "../../../api/businessUploadApi";
import AlertModal from "../../common/AlertModal";
import { extractApiData, extractErrorMessage } from "../../../utils/apiUtils";

const ImageUploader = ({ images = [], onChange, disabled = false }) => {
  const [uploading, setUploading] = useState(false);
  const [alertModal, setAlertModal] = useState({ isOpen: false, message: "", type: "info" });
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // 이미지 파일만 허용
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));
    if (imageFiles.length !== files.length) {
      setAlertModal({
        isOpen: true,
        message: "이미지 파일만 업로드할 수 있습니다.",
        type: "warning",
      });
      return;
    }

    // 파일 크기 제한 (10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    const oversizedFiles = imageFiles.filter((file) => file.size > maxSize);
    if (oversizedFiles.length > 0) {
      setAlertModal({
        isOpen: true,
        message: "파일 크기는 10MB를 초과할 수 없습니다.",
        type: "warning",
      });
      return;
    }

    setUploading(true);

    try {
      const uploadedUrls = [];

      for (const file of imageFiles) {
        try {
          // 1. Presigned URL 생성 (파일 크기도 전달하여 서버 측 검증)
          const presignResponse = await businessUploadApi.generatePresignUrl(
            file.name,
            file.type,
            file.size
          );
          const presignData = extractApiData(presignResponse);
          const { url: presignedUrl, key } = presignData;

          // 2. S3에 직접 업로드
          const uploadResponse = await fetch(presignedUrl, {
            method: "PUT",
            body: file,
            headers: {
              "Content-Type": file.type,
            },
          });

          if (!uploadResponse.ok) {
            throw new Error(`S3 업로드 실패: ${uploadResponse.statusText}`);
          }

          // 3. S3 key를 URL로 변환 (백엔드에서 full URL로 변환하지만, 여기서는 key만 저장)
          uploadedUrls.push(key);
        } catch (error) {
          console.error("이미지 업로드 실패:", error);
          setAlertModal({
            isOpen: true,
            message: `이미지 업로드 실패: ${file.name}`,
            type: "error",
          });
        }
      }

      // 4. 업로드된 이미지 URL들을 기존 이미지 배열에 추가
      if (uploadedUrls.length > 0 && onChange) {
        onChange([...images, ...uploadedUrls]);
      }

      if (uploadedUrls.length > 0) {
        setAlertModal({
          isOpen: true,
          message: `${uploadedUrls.length}개의 이미지가 업로드되었습니다.`,
          type: "success",
        });
      }
    } catch (error) {
      const errorMessage = extractErrorMessage(error, "이미지 업로드에 실패했습니다.");
      setAlertModal({
        isOpen: true,
        message: errorMessage,
        type: "error",
      });
    } finally {
      setUploading(false);
      // 파일 입력 초기화
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveImage = (index) => {
    if (disabled) return;
    const newImages = images.filter((_, i) => i !== index);
    if (onChange) {
      onChange(newImages);
    }
  };

  // S3 key를 full URL로 변환하는 헬퍼 함수
  const getImageUrl = (key) => {
    if (!key) return "";
    // 이미 full URL인 경우 그대로 반환
    if (key.startsWith("http://") || key.startsWith("https://")) {
      return key;
    }
    // S3 key인 경우, 백엔드에서 반환된 full URL을 사용하거나 직접 구성
    // 백엔드에서 이미 full URL로 변환하여 반환하므로, 여기서는 그대로 사용
    return key;
  };

  return (
    <div className="image-uploader">
      <div className="form-group">
        <label>객실 사진</label>
        <div className="image-uploader-controls">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            disabled={disabled || uploading}
            style={{ display: "none" }}
          />
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || uploading}
          >
            {uploading ? "업로드 중..." : "이미지 추가"}
          </button>
          {images.length > 0 && (
            <span className="image-count">{images.length}개의 이미지</span>
          )}
        </div>
      </div>

      {images.length > 0 && (
        <div className="image-preview-grid">
          {images.map((image, index) => (
            <div key={index} className="image-preview-item">
              <img
                src={getImageUrl(image)}
                alt={`객실 사진 ${index + 1}`}
                onError={(e) => {
                  // 이미지 로드 실패 시 placeholder 표시
                  e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect fill='%23e2e8f0' width='200' height='200'/%3E%3Ctext fill='%2394a3b8' font-family='sans-serif' font-size='14' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3E이미지 없음%3C/text%3E%3C/svg%3E";
                }}
              />
              {!disabled && (
                <button
                  type="button"
                  className="image-remove-btn"
                  onClick={() => handleRemoveImage(index)}
                  aria-label="이미지 삭제"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <AlertModal
        isOpen={alertModal.isOpen}
        message={alertModal.message}
        type={alertModal.type}
        onClose={() => setAlertModal({ isOpen: false, message: "", type: "info" })}
      />
    </div>
  );
};

export default ImageUploader;

