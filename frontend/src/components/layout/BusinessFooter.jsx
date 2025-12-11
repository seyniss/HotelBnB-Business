import { Link } from "react-router-dom";

const BusinessFooter = () => {
  return (
    <footer className="business-footer">
      <div className="container">
        <div className="business-footer__inner">
          <div className="business-footer__section">
            <h4>Hotelhub Business</h4>
            <p>호텔 사업자를 위한 통합 관리 플랫폼</p>
          </div>

          <div className="business-footer__section">
            <h4>메뉴</h4>
            <Link to="/business/dashboard">대시보드</Link>
            <Link to="/business/settings">호텔 관리</Link>
            <Link to="/business/rooms">객실 관리</Link>
            <Link to="/business/statistics">매출 통계</Link>
          </div>

          <div className="business-footer__section">
            <h4>고객센터</h4>
            <p>support@hotelhub.com</p>
            <p>1588-0000</p>
            <p>평일 09:00 - 18:00</p>
          </div>

          <div className="business-footer__section">
            <h4>소셜</h4>
            <a href="#" target="_blank" rel="noopener noreferrer">Facebook</a>
            <a href="#" target="_blank" rel="noopener noreferrer">Instagram</a>
            <a href="#" target="_blank" rel="noopener noreferrer">Twitter</a>
          </div>
        </div>

        <div className="business-footer__bottom">
          <p>&copy; 2025 Hotelhub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default BusinessFooter;
