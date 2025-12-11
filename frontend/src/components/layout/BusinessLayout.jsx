import { Outlet, Navigate, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { BusinessAuthContext } from "../../context/BusinessAuthContext";
import BusinessSidebar from "./BusinessSidebar";
import "../../styles/index.scss";

const BusinessLayout = () => {
  const { businessInfo, loading, logout } = useContext(BusinessAuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/business/login");
  };

  if (loading) {
    return (
      <div className="business-layout">
        <div className="container" style={{ padding: "2rem", textAlign: "center" }}>
          로딩 중...
        </div>
      </div>
    );
  }

  if (!businessInfo) {
    return <Navigate to="/business/login" replace />;
  }

  return (
    <div className="business-layout-sidebar">
      <BusinessSidebar />
      <div className="business-main">
        <header className="business-topbar">
          <h2>사업자 대시보드</h2>
          <div className="topbar-user">
            <span>{businessInfo?.name || "사업자"}</span>
            <button onClick={handleLogout} className="btn-logout">
              로그아웃
            </button>
          </div>
        </header>
        <main className="business-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default BusinessLayout;
