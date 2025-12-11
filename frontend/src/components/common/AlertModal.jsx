import { useEffect } from "react";

const AlertModal = ({ isOpen, title, message, onClose, type = "info" }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const getIconColor = () => {
    switch (type) {
      case "success":
        return "#10b981";
      case "error":
        return "#ef4444";
      case "warning":
        return "#f59e0b";
      default:
        return "#7FD8BE";
    }
  };

  const getIconSvg = () => {
    const iconColor = getIconColor();
    switch (type) {
      case "success":
        return (
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" fill={iconColor} />
            <path
              d="M9 12l2 2 4-4"
              stroke="#ffffff"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );
      case "error":
        return (
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" fill={iconColor} />
            <path
              d="M15 9l-6 6M9 9l6 6"
              stroke="#ffffff"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );
      case "warning":
        return (
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" fill={iconColor} />
            <path
              d="M12 8v4M12 16h.01"
              stroke="#ffffff"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );
      default:
        return (
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" fill={iconColor} />
            <path
              d="M12 16v-4M12 8h.01"
              stroke="#ffffff"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );
    }
  };

  const getDefaultTitle = () => {
    switch (type) {
      case "success":
        return "완료되었습니다!";
      case "error":
        return "오류가 발생했습니다";
      case "warning":
        return "경고";
      default:
        return "알림";
    }
  };

  return (
    <div className="custom-modal-overlay" onClick={handleOverlayClick}>
      <div className="custom-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="custom-modal-icon-wrapper">
          {getIconSvg()}
        </div>
        <h3 className="custom-modal-title">{title || getDefaultTitle()}</h3>
        <p className="custom-modal-message">{message}</p>
        <div className="custom-modal-actions">
          <button 
            className="custom-modal-button" 
            onClick={onClose}
            style={{ backgroundColor: getIconColor() }}
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertModal;

