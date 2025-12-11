import { Link } from "react-router-dom";

const BusinessRecentTable = ({ bookings = [] }) => {
  const getStatusText = (status) => {
    const statusMap = {
      confirmed: "확정",
      pending: "대기",
      cancelled: "취소",
      completed: "완료",
      active: "활성",
      inactive: "비활성",
    };
    return statusMap[status] || status;
  };

  const getStatusClass = (status) => {
    const classMap = {
      confirmed: "status-confirmed",
      pending: "status-pending",
      cancelled: "status-cancelled",
      completed: "status-confirmed",
      active: "status-confirmed",
      inactive: "status-cancelled",
    };
    return classMap[status] || "";
  };

  // bookings가 배열이 아닌 경우 처리
  const bookingsList = Array.isArray(bookings) ? bookings : bookings?.data || bookings?.bookings || [];

  return (
    <div className="recent-table">
      <p className="table-subtitle">최근 예약</p>
      <table>
        <thead>
          <tr>
            <th>예약번호</th>
            <th>호텔명</th>
            <th>고객명</th>
            <th>상태</th>
          </tr>
        </thead>
        <tbody>
          {bookingsList.length === 0 ? (
            <tr>
              <td colSpan="4" style={{ textAlign: "center", padding: "2rem", color: "#6b7280" }}>
                최근 예약이 없습니다.
              </td>
            </tr>
          ) : (
            bookingsList.map((booking) => (
              <tr key={booking.id || booking._id}>
                <td>
                  <Link to={`/business/bookings/${booking.id || booking._id}`} className="link-primary">
                    {booking.id || booking._id || booking.bookingNumber || "-"}
                  </Link>
                </td>
                <td>{booking.hotelName || booking.lodgingName || booking.hotel?.lodgingName || "-"}</td>
                <td>{booking.guestName || booking.guest?.name || booking.user?.name || "-"}</td>
                <td>
                  <span className={getStatusClass(booking.status)}>
                    {getStatusText(booking.status)}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default BusinessRecentTable;
