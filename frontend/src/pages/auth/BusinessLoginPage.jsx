import { useState, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BusinessAuthContext } from "../../context/BusinessAuthContext";

const BusinessLoginPage = () => {
  const { login, kakaoLogin } = useContext(BusinessAuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // 카카오 SDK 초기화
  useEffect(() => {
    if (window.Kakao && !window.Kakao.isInitialized()) {
      const kakaoAppKey = import.meta.env.VITE_KAKAO_APP_KEY || "your_kakao_app_key";
      window.Kakao.init(kakaoAppKey);
    }
  }, []);

  const handleKakaoLogin = async () => {
    if (!window.Kakao) {
      setError("카카오 SDK를 불러올 수 없습니다.");
      return;
    }

    try {
      setError("");
      setLoading(true);

      // 카카오 로그인 실행
      window.Kakao.Auth.login({
        success: async (authObj) => {
          try {
            const result = await kakaoLogin(authObj.access_token);
            
            if (result.needsAdditionalInfo) {
              // 추가 정보 입력 페이지로 이동
              navigate(`/business/kakao/complete?tempUserId=${result.tempUserId}`);
            } else {
              // 바로 대시보드로 이동
              navigate("/business/dashboard");
            }
          } catch (err) {
            const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || "카카오 로그인에 실패했습니다.";
            setError(errorMessage);
            setLoading(false);
          }
        },
        fail: (err) => {
          setError("카카오 로그인에 실패했습니다.");
          setLoading(false);
        },
      });
    } catch (err) {
      setError("카카오 로그인 중 오류가 발생했습니다.");
      setLoading(false);
    }
  };

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
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-split-page">
      <div className="auth-split-form">
        <div className="auth-form-container">
          <h1>Login</h1>
          <p className="auth-subtitle">사업자 로그인</p>

          {error && <div className="auth-error">{error}</div>}

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

          <div className="auth-divider">
            <span>또는</span>
          </div>

          <div className="social-login">
            <button 
              type="button" 
              className="social-btn" 
              onClick={handleKakaoLogin}
              disabled={loading}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 0 1-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l.892-3.678c-2.88-1.46-4.785-3.99-4.785-6.866C1.5 6.665 6.201 3 12 3z"/>
              </svg>
            </button>
            <button type="button" className="social-btn" disabled>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            </button>
            <button type="button" className="social-btn" disabled>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </button>
            <button type="button" className="social-btn" disabled>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
            </button>
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
