import { useState } from "react";
import { Link } from "react-router-dom";

const BusinessForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // TODO: API 연동
      // await businessAuthApi.forgotPassword(email);
      setSubmitted(true);
    } catch (err) {
      setError(err.message || "요청에 실패했습니다.");
    }
  };

  if (submitted) {
    return (
      <div className="login-page">
        <div className="login-container">
          <h2>이메일 전송 완료</h2>
          <div className="success-message">
            <p>비밀번호 재설정 링크가 이메일로 전송되었습니다.</p>
            <p>이메일을 확인해주세요.</p>
          </div>
          <Link to="/business/login" className="btn btn-primary" style={{ width: "100%" }}>
            로그인으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <h2>비밀번호 찾기</h2>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>이메일</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="가입한 이메일을 입력하세요"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary">
            재설정 링크 전송
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "1rem" }}>
          <Link to="/business/login">로그인으로 돌아가기</Link>
        </div>
      </div>
    </div>
  );
};

export default BusinessForgotPasswordPage;
