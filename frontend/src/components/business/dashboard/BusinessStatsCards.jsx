const BusinessStatsCards = ({ stats }) => {
  if (!stats) return null;

  // 백엔드 응답 구조에 맞게 데이터 추출
  // stats.data가 있으면 data를 사용, 없으면 stats를 직접 사용
  const statsData = stats?.data || stats;
  const hotel = statsData?.hotel || statsData || {};

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("ko-KR").format(amount || 0);
  };

  const formatChange = (change) => {
    if (change === undefined || change === null) return null;
    const isPositive = change >= 0;
    const sign = isPositive ? '+' : '';
    return `${sign}${change}%`;
  };

  const formatChangeRooms = (change) => {
    if (change === undefined || change === null) return null;
    const isPositive = change >= 0;
    const sign = isPositive ? '+' : '';
    return `${sign}${change}`;
  };

  return (
    <div className="stats-cards">
      <div className="stat-card">
        <div className="stat-card-header">
          <p className="stat-label">총 예약</p>
          <span className="stat-icon icon-calendar">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </span>
        </div>
        <p className="stat-value">{hotel.totalBookings || 0}</p>
      </div>

      <div className="stat-card">
        <div className="stat-card-header">
          <p className="stat-label">총 매출</p>
          <span className="stat-icon icon-money">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
          </span>
        </div>
        <p className="stat-value">{formatCurrency(hotel.totalRevenue || 0)}원</p>
      </div>

      <div className="stat-card">
        <div className="stat-card-header">
          <p className="stat-label">총 객실</p>
          <span className="stat-icon icon-hotel">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
          </span>
        </div>
        <p className="stat-value">{hotel.totalRooms || 0}</p>
      </div>

      <div className="stat-card">
        <div className="stat-card-header">
          <p className="stat-label">총 리뷰</p>
          <span className="stat-icon icon-review">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
          </span>
        </div>
        <p className="stat-value">{hotel.totalReviews || 0}</p>
      </div>
    </div>
  );
};

export default BusinessStatsCards;
