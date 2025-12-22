import { useState, useEffect } from "react";

const ImageViewer = ({ isOpen, images = [], initialIndex = 0, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      setZoom(1);
      // ESC 키로 닫기
      const handleEscape = (e) => {
        if (e.key === "Escape") {
          onClose();
        }
      };
      document.addEventListener("keydown", handleEscape);
      // 스크롤 방지
      document.body.style.overflow = "hidden";
      return () => {
        document.removeEventListener("keydown", handleEscape);
        document.body.style.overflow = "unset";
      };
    }
  }, [isOpen, initialIndex, onClose]);

  if (!isOpen || images.length === 0) return null;

  const currentImage = images[currentIndex];
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < images.length - 1;

  const handlePrevious = () => {
    if (hasPrevious) {
      setCurrentIndex(currentIndex - 1);
      setZoom(1);
    }
  };

  const handleNext = () => {
    if (hasNext) {
      setCurrentIndex(currentIndex + 1);
      setZoom(1);
    }
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.25, 0.5));
  };

  const handleResetZoom = () => {
    setZoom(1);
  };

  // 키보드 네비게이션
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft" && hasPrevious) {
        handlePrevious();
      } else if (e.key === "ArrowRight" && hasNext) {
        handleNext();
      } else if (e.key === "+" || e.key === "=") {
        handleZoomIn();
      } else if (e.key === "-") {
        handleZoomOut();
      } else if (e.key === "0") {
        handleResetZoom();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentIndex, hasPrevious, hasNext]);

  // S3 key를 full URL로 변환하는 헬퍼 함수
  const getImageUrl = (key) => {
    if (!key) return "";
    // 이미 full URL인 경우 그대로 반환
    if (key.startsWith("http://") || key.startsWith("https://")) {
      return key;
    }
    // S3 key인 경우, 백엔드에서 반환된 full URL을 사용
    return key;
  };

  return (
    <div className="image-viewer-overlay" onClick={onClose}>
      <div className="image-viewer-container" onClick={(e) => e.stopPropagation()}>
        {/* 닫기 버튼 */}
        <button className="image-viewer-close" onClick={onClose} aria-label="닫기">
          ×
        </button>

        {/* 이전 버튼 */}
        {hasPrevious && (
          <button
            className="image-viewer-nav image-viewer-prev"
            onClick={handlePrevious}
            aria-label="이전 이미지"
          >
            ‹
          </button>
        )}

        {/* 이미지 영역 */}
        <div className="image-viewer-content">
          <img
            src={getImageUrl(currentImage)}
            alt={`이미지 ${currentIndex + 1} / ${images.length}`}
            style={{
              transform: `scale(${zoom})`,
              transition: "transform 0.2s ease",
              maxWidth: "100%",
              maxHeight: "100%",
              objectFit: "contain",
            }}
            onError={(e) => {
              e.target.src =
                "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect fill='%23e2e8f0' width='400' height='400'/%3E%3Ctext fill='%2394a3b8' font-family='sans-serif' font-size='18' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3E이미지를 불러올 수 없습니다%3C/text%3E%3C/svg%3E";
            }}
          />
        </div>

        {/* 다음 버튼 */}
        {hasNext && (
          <button
            className="image-viewer-nav image-viewer-next"
            onClick={handleNext}
            aria-label="다음 이미지"
          >
            ›
          </button>
        )}

        {/* 컨트롤 패널 */}
        <div className="image-viewer-controls">
          <div className="image-viewer-info">
            {currentIndex + 1} / {images.length}
          </div>
          <div className="image-viewer-zoom-controls">
            <button onClick={handleZoomOut} aria-label="축소" disabled={zoom <= 0.5}>
              −
            </button>
            <span>{Math.round(zoom * 100)}%</span>
            <button onClick={handleZoomIn} aria-label="확대" disabled={zoom >= 3}>
              +
            </button>
            <button onClick={handleResetZoom} aria-label="원래 크기">
              ⟲
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageViewer;

