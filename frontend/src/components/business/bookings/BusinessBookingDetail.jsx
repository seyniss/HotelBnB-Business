import StatusBadge from "../../common/StatusBadge";

const BusinessBookingDetail = ({ booking, onStatusChange }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "KRW",
    }).format(amount);
  };

  if (!booking) return null;

  return (
    <div className="detail-section">
      <div className="detail-row">
        <span className="label">예약번호</span>
        <span className="value">{booking.id}</span>
      </div>
      <div className="detail-row">
        <span className="label">객실</span>
        <span className="value">{booking.roomType}</span>
      </div>
      <div className="detail-row">
        <span className="label">투숙객</span>
        <span className="value">{booking.guestName}</span>
      </div>
      <div className="detail-row">
        <span className="label">연락처</span>
        <span className="value">{booking.guestPhone || "-"}</span>
      </div>
      <div className="detail-row">
        <span className="label">이메일</span>
        <span className="value">{booking.guestEmail || "-"}</span>
      </div>
      <div className="detail-row">
        <span className="label">체크인</span>
        <span className="value">{booking.checkIn}</span>
      </div>
      <div className="detail-row">
        <span className="label">체크아웃</span>
        <span className="value">{booking.checkOut}</span>
      </div>
      <div className="detail-row">
        <span className="label">인원</span>
        <span className="value">{booking.guests}명</span>
      </div>
      <div className="detail-row">
        <span className="label">금액</span>
        <span className="value">{formatCurrency(booking.amount)}</span>
      </div>
      <div className="detail-row">
        <span className="label">상태</span>
        <span className="value">
          <StatusBadge status={booking.status} type="booking" />
        </span>
      </div>
      <div className="detail-row">
        <span className="label">요청사항</span>
        <span className="value">{booking.specialRequests || "-"}</span>
      </div>

      {booking.status === "pending" && (
        <div className="detail-actions">
          <button
            className="btn btn-success"
            onClick={() => onStatusChange(booking.id, "confirmed")}
          >
            예약 확정
          </button>
          <button
            className="btn btn-danger"
            onClick={() => onStatusChange(booking.id, "cancelled")}
          >
            예약 취소
          </button>
        </div>
      )}
    </div>
  );
};

export default BusinessBookingDetail;
