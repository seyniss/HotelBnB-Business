import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { businessAuthApi } from "../../api/businessAuthApi";
import { extractErrorMessage } from "../../utils/apiUtils";
import { logger } from "../../utils/logger";

const BusinessSignupPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phoneNumber: "",
    businessName: "",
    businessNumber: "",
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // 비밀번호 확인
    if (formData.password !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    // 비밀번호 길이 체크
    if (formData.password.length < 4) {
      setError("비밀번호는 4자 이상이어야 합니다.");
      return;
    }

    // 사업자 등록번호 형식 체크 (XXX-XX-XXXXX)
    const businessNumberPattern = /^\d{3}-\d{2}-\d{5}$/;
    if (!businessNumberPattern.test(formData.businessNumber)) {
      setError("사업자 등록번호 형식이 올바르지 않습니다. (예: 123-45-67890)");
      return;
    }

    // 핸드폰 번호 형식 체크 (XXX-XXXX-XXXX)
    const phonePattern = /^\d{3}-\d{4}-\d{4}$/;
    if (!phonePattern.test(formData.phoneNumber)) {
      setError("핸드폰 번호 형식이 올바르지 않습니다. (예: 010-1234-5678)");
      return;
    }

    setLoading(true);

    try {
      // 백엔드가 기대하는 필드명으로 변환
      const signupData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phoneNumber: formData.phoneNumber,
        businessName: formData.businessName || "", // 선택사항
        businessNumber: formData.businessNumber,
      };
      
      // 빈 값 체크
      if (!signupData.name || !signupData.email || !signupData.password || !signupData.phoneNumber) {
        setError("모든 필수 항목을 입력해주세요.");
        setLoading(false);
        return;
      }
      
      logger.log("회원가입 요청 데이터:", signupData);
      await businessAuthApi.signup(signupData);
      setShowSuccessModal(true);
    } catch (err) {
      const errorMessage = extractErrorMessage(err, "회원가입에 실패했습니다.");
      setError(errorMessage);
      setLoading(false);
      logger.error("회원가입 에러:", err.response?.data || err);
    }
  };

  const handleSuccessConfirm = () => {
    setShowSuccessModal(false);
    // 신규 가입자는 호텔 정보가 없으므로 호텔 설정 페이지로 이동
    navigate("/business/settings");
  };

  return (
    <div className="auth-split-page">
      <div className="auth-split-form">
        <div className="auth-form-container">
          <h1>Sign Up</h1>
          <p className="auth-subtitle">사업자 회원가입</p>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">이름</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="enter your name..."
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">이메일</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="enter your email..."
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">비밀번호</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="enter your password... (4자 이상)"
                required
                minLength={4}
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">비밀번호 확인</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="confirm your password..."
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="phoneNumber">핸드폰 번호</label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="010-1234-5678"
                required
                pattern="\d{3}-\d{4}-\d{4}"
              />
            </div>

            <div className="form-group">
              <label htmlFor="businessName">사업자명 (선택)</label>
              <input
                type="text"
                id="businessName"
                name="businessName"
                value={formData.businessName}
                onChange={handleChange}
                placeholder="사업자명을 입력하세요..."
              />
            </div>

            <div className="form-group">
              <label htmlFor="businessNumber">사업자 등록번호</label>
              <input
                type="text"
                id="businessNumber"
                name="businessNumber"
                value={formData.businessNumber}
                onChange={handleChange}
                placeholder="123-45-67890"
                required
                pattern="\d{3}-\d{2}-\d{5}"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full"
              disabled={loading}
            >
              {loading ? "가입 중..." : "회원가입"}
            </button>
          </form>

          <div className="auth-links">
            <Link to="/business/login">이미 계정이 있으신가요? 로그인</Link>
          </div>
        </div>
      </div>

      <div className="auth-split-image">
        <img
          src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1760&q=80"
          alt="Hotel"
        />
      </div>

      {/* 성공 모달 */}
      {showSuccessModal && (
        <div className="success-modal-overlay" onClick={handleSuccessConfirm}>
          <div className="success-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="success-modal-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" fill="#10b981" opacity="0.1"/>
                <path
                  d="M9 12l2 2 4-4"
                  stroke="#10b981"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="12" cy="12" r="10" stroke="#10b981" strokeWidth="2"/>
              </svg>
            </div>
            <h2 className="success-modal-title">회원가입이 완료되었습니다!</h2>
            <p className="success-modal-message">
              회원가입이 성공적으로 완료되었습니다.<br />
              로그인 페이지로 이동합니다.
            </p>
            <button
              type="button"
              className="btn btn-primary success-modal-button"
              onClick={handleSuccessConfirm}
            >
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessSignupPage;

