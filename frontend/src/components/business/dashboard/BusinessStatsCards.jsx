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
          <span className="stat-icon icon-calendar">📅</span>
        </div>
        <p className="stat-value">{hotel.totalBookings || 0}</p>
      </div>

      <div className="stat-card">
        <div className="stat-card-header">
          <p className="stat-label">총 매출</p>
          <span className="stat-icon icon-money">💰</span>
        </div>
        <p className="stat-value">{formatCurrency(hotel.totalRevenue || 0)}원</p>
      </div>

      <div className="stat-card">
        <div className="stat-card-header">
          <p className="stat-label">총 객실</p>
          <span className="stat-icon icon-hotel">🏨</span>
        </div>
        <p className="stat-value">{hotel.totalRooms || 0}</p>
      </div>

      <div className="stat-card">
        <div className="stat-card-header">
          <p className="stat-label">총 리뷰</p>
          <span className="stat-icon icon-review">⭐</span>
        </div>
        <p className="stat-value">{hotel.totalReviews || 0}</p>
      </div>
    </div>
  );
};

export default BusinessStatsCards;
