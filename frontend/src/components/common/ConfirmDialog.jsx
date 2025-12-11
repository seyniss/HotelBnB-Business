import { useEffect } from "react";

const ConfirmDialog = ({ isOpen, title, message, onConfirm, onCancel }) => {
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
      onCancel();
    }
  };

  return (
    <div className="custom-modal-overlay" onClick={handleOverlayClick}>
      <div className="custom-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="custom-modal-icon-wrapper">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" fill="#f59e0b" />
            <path
              d="M12 8v4M12 16h.01"
              stroke="#ffffff"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h3 className="custom-modal-title">{title || "확인"}</h3>
        <p className="custom-modal-message">{message}</p>
        <div className="custom-modal-actions">
          <button 
            className="custom-modal-button custom-modal-button-outline" 
            onClick={onCancel}
          >
            취소
          </button>
          <button 
            className="custom-modal-button" 
            onClick={onConfirm}
            style={{ backgroundColor: "#7FD8BE" }}
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
