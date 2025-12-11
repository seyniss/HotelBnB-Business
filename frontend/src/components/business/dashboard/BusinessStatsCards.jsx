const BusinessStatsCards = ({ stats }) => {
  if (!stats) return null;

  // 백엔드 응답 구조에 맞게 데이터 추출
  // stats.data가 있으면 data를 사용, 없으면 stats를 직접 사용
  const statsData = stats?.data || stats;
  const hotel = statsData?.hotel || statsData || {};

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("ko-KR").format(amount || 0);
  };

  return (
    <div className="stats-cards">
      <div className="stat-card">
        <div className="stat-card-header">
          <p className="stat-label">오늘 예약</p>
          <span className="stat-icon icon-calendar">📅</span>
        </div>
        <p className="stat-value">{hotel.todayBookings || hotel.today?.bookings || 0}</p>
        <p className="stat-change positive">+12% 전월 대비</p>
      </div>

      <div className="stat-card">
        <div className="stat-card-header">
          <p className="stat-label">총 매출</p>
          <span className="stat-icon icon-money">💰</span>
        </div>
        <p className="stat-value">{formatCurrency(hotel.totalRevenue || hotel.today?.revenue || 0)}원</p>
        <p className="stat-change positive">+8% 전월 대비</p>
      </div>

      <div className="stat-card">
        <div className="stat-card-header">
          <p className="stat-label">활성 객실</p>
          <span className="stat-icon icon-hotel">🏨</span>
        </div>
        <p className="stat-value">{hotel.totalRooms || hotel.activeRooms || 0}</p>
        <p className="stat-change positive">+2 전월 대비</p>
      </div>

      <div className="stat-card">
        <div className="stat-card-header">
          <p className="stat-label">신규 회원</p>
          <span className="stat-icon icon-user">👤</span>
        </div>
        <p className="stat-value">{hotel.newMembers || hotel.newUsers || 0}</p>
        <p className="stat-change positive">+15% 전월 대비</p>
      </div>
    </div>
  );
};

export default BusinessStatsCards;
