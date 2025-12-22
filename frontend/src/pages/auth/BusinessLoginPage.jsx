import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BusinessAuthContext } from "../../context/BusinessAuthContext";

const BusinessLoginPage = () => {
  const { login } = useContext(BusinessAuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await login(formData);
      // 호텔 정보가 있으면 대시보드로, 없으면 호텔 설정 페이지로
      if (result?.hasHotel) {
        navigate("/business/dashboard");
      } else {
        navigate("/business/settings");
      }
    } catch (err) {
      const errorMessage = 
        err.response?.data?.message || 
        err.response?.data?.error || 
        err.message || 
        "로그인에 실패했습니다.";
      
      // 에러를 명시적으로 설정하고, 로딩 상태를 먼저 해제
      setLoading(false);
      setError(errorMessage);
    }
  };

  return (
    <div className="auth-split-page">
      <div className="auth-split-form">
        <div className="auth-form-container">
          <h1>Login</h1>
          <p className="auth-subtitle">사업자 로그인</p>
          
          <div className="test-account-info" style={{
            background: 'rgba(127, 216, 190, 0.08)',
            border: '1px solid rgba(127, 216, 190, 0.2)',
            borderRadius: '6px',
            padding: '8px 12px',
            marginBottom: '16px',
            fontSize: '0.75rem'
          }}>
            <div style={{ fontWeight: 500, color: '#7FD8BE', marginBottom: '4px', fontSize: '0.75rem' }}>
              테스트 계정
            </div>
            <div style={{ color: '#64748b', lineHeight: '1.5', fontSize: '0.75rem' }}>
              <div>이메일: <strong style={{ color: '#0f172a' }}>biz@business.com</strong></div>
              <div>비밀번호: <strong style={{ color: '#0f172a' }}>biz1234</strong></div>
            </div>
          </div>

          {error && error.trim() !== "" && (
            <div 
              className="auth-error" 
              style={{ 
                display: 'block', 
                visibility: 'visible',
                opacity: 1,
                minHeight: '40px'
              }}
              role="alert"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
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
                placeholder="enter your password..."
                required
              />
            </div>

            <div className="form-group-inline">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>자동 로그인</span>
              </label>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full"
              disabled={loading}
            >
              {loading ? "로그인 중..." : "로그인"}
            </button>
          </form>

          <div className="auth-links">
            <Link to="/business/forgot-password">비밀번호 찾기</Link>
            <span style={{ margin: "0 0.5rem" }}>|</span>
            <Link to="/business/signup">회원가입</Link>
          </div>
        </div>
      </div>

      <div className="auth-split-image">
        <img
          src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1760&q=80"
          alt="Hotel"
        />
      </div>
    </div>
  );
};

export default BusinessLoginPage;
