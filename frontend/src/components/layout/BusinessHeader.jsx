import { Link, useNavigate, useLocation } from "react-router-dom";
import { useContext } from "react";
import { BusinessAuthContext } from "../../context/BusinessAuthContext";

const BusinessHeader = () => {
  const { businessInfo, logout } = useContext(BusinessAuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate("/business/login");
  };

  const isActive = (path) => {
    return location.pathname === path ? "active" : "";
  };

  return (
    <header className="business-header">
      <div className="container">
        <div className="business-header__inner">
          <Link to="/business/dashboard" className="business-header__logo">
            <h1>Hotelhub Business</h1>
          </Link>

          <nav className="business-header__nav">
            <Link
              to="/business/dashboard"
              className={`business-header__nav-link ${isActive("/business/dashboard")}`}
            >
              대시보드
            </Link>
            <Link
              to="/business/rooms"
              className={`business-header__nav-link ${isActive("/business/rooms")}`}
            >
              객실 관리
            </Link>
            <Link
              to="/business/statistics"
              className={`business-header__nav-link ${isActive("/business/statistics")}`}
            >
              매출 통계
            </Link>
            <Link
              to="/business/reviews"
              className={`business-header__nav-link ${isActive("/business/reviews")}`}
            >
              리뷰 관리
            </Link>
          </nav>

          <div className="business-header__user">
            {businessInfo && (
              <>
                <div className="business-header__user-info">
                  <div className="business-header__user-avatar">
                    {businessInfo.name?.charAt(0) || "B"}
                  </div>
                  <span className="business-header__user-name">
                    {businessInfo.name}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="business-header__logout"
                >
                  로그아웃
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default BusinessHeader;
