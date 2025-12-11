import { useState, useEffect } from "react";
import AlertModal from "../../../components/common/AlertModal";

const MIN_PASSWORD_LENGTH = 6;

const BusinessProfileForm = ({ profile, onSubmit }) => {
  const [alertModal, setAlertModal] = useState({ isOpen: false, message: "", type: "info" });
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (profile) {
      setFormData((prev) => ({
        ...prev,
        name: profile.name || "",
        email: profile.email || "",
        phoneNumber: profile.phoneNumber || "",
      }));
    }
  }, [profile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validatePasswordChange = () => {
    if (!formData.newPassword) {
      return null;
    }

    if (!formData.currentPassword) {
      return "비밀번호를 변경하려면 현재 비밀번호를 입력해주세요.";
    }

    if (formData.newPassword !== formData.confirmPassword) {
      return "새 비밀번호가 일치하지 않습니다.";
    }

    if (formData.newPassword.length < MIN_PASSWORD_LENGTH) {
      return `새 비밀번호는 최소 ${MIN_PASSWORD_LENGTH}자 이상이어야 합니다.`;
    }

    return null;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const validationError = validatePasswordChange();
    if (validationError) {
      setAlertModal({ isOpen: true, message: validationError, type: "warning" });
      return;
    }
    
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="form">
      <h4>기본 정보</h4>

      <div className="form-group">
        <label>이름</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label>이메일</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label>연락처</label>
        <input
          type="tel"
          name="phoneNumber"
          value={formData.phoneNumber}
          onChange={handleChange}
        />
      </div>

      <h4>비밀번호 변경</h4>

      <div className="form-group">
        <label>현재 비밀번호</label>
        <input
          type="password"
          name="currentPassword"
          value={formData.currentPassword}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label>새 비밀번호</label>
        <input
          type="password"
          name="newPassword"
          value={formData.newPassword}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label>새 비밀번호 확인</label>
        <input
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
        />
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary">
          저장
        </button>
      </div>

      <AlertModal
        isOpen={alertModal.isOpen}
        message={alertModal.message}
        type={alertModal.type}
        onClose={() => setAlertModal({ isOpen: false, message: "", type: "info" })}
      />
    </form>
  );
};

export default BusinessProfileForm;
