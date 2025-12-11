import { Link } from "react-router-dom";
import Select from "react-select";
import StatusBadge from "../../common/StatusBadge";

const STATUS_OPTIONS = [
  { value: "confirmed", label: "확정" },
  { value: "pending", label: "대기" },
  { value: "completed", label: "완료" },
  { value: "cancelled", label: "취소" },
];

const selectStyles = {
  control: (provided, state) => ({
    ...provided,
    minHeight: "36px",
    borderRadius: 9999,
    borderColor: state.isFocused ? "#7FD8BE" : "rgba(15, 23, 42, 0.15)",
    boxShadow: "none",
    paddingLeft: 4,
    paddingRight: 4,
    "&:hover": {
      borderColor: "#7FD8BE",
    },
  }),
  valueContainer: (provided) => ({
    ...provided,
    padding: "0 8px",
  }),
  singleValue: (provided) => ({
    ...provided,
    color: "#0f172a",
    fontWeight: 500,
  }),
  placeholder: (provided) => ({
    ...provided,
    color: "rgba(15, 23, 42, 0.5)",
  }),
  option: (provided, state) => ({
    ...provided,
    fontSize: "14px",
    fontWeight: 500,
    color: state.isSelected ? "#ffffff" : "#0f172a",
    backgroundColor: state.isSelected
      ? "#7FD8BE"
      : state.isFocused
        ? "rgba(127, 216, 190, 0.08)"
        : "#ffffff",
    cursor: "pointer",
  }),
  menu: (provided) => ({
    ...provided,
    borderRadius: 16,
    overflow: "hidden",
    boxShadow:
      "0 20px 45px rgba(15, 23, 42, 0.18), 0 10px 18px rgba(15, 23, 42, 0.08)",
  }),
  menuList: (provided) => ({
    ...provided,
    padding: 0,
  }),
  indicatorSeparator: () => ({
    display: "none",
  }),
  dropdownIndicator: (provided) => ({
    ...provided,
    color: "#0f172a",
    paddingRight: 8,
  }),
};

const BusinessBookingTable = ({ bookings, onStatusChange }) => {
  const formatCurrency = (amount) =>
    `${new Intl.NumberFormat("ko-KR").format(amount)}원`;

  return (
    <div className="table-wrapper booking-table">
      <table>
        <thead>
          <tr>
            <th>예약번호</th>
            <th>호텔명</th>
            <th>고객명</th>
            <th>체크인</th>
            <th>체크아웃</th>
            <th>금액</th>
            <th>상태</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking) => (
            <tr key={booking.id}>
              <td>
                <Link to={`/business/bookings/${booking.id}`} className="link-primary">
                  {booking.id}
                </Link>
              </td>
              <td>{booking.hotelName || "-"}</td>
              <td>{booking.guestName}</td>
              <td>{booking.checkIn}</td>
              <td>{booking.checkOut}</td>
              <td>{formatCurrency(booking.amount)}</td>
              <td>
                <StatusBadge status={booking.status} type="booking" />
              </td>
              <td>
                <div className="booking-actions">
                  <Select
                    className="booking-status-select"
                    classNamePrefix="booking-status-select"
                    isSearchable={false}
                    options={STATUS_OPTIONS}
                    value={STATUS_OPTIONS.find(
                      (option) => option.value === booking.status
                    )}
                    onChange={(option) => onStatusChange(booking.id, option.value)}
                    styles={selectStyles}
                  />
                  <button
                    type="button"
                    className="btn btn-sm btn-danger"
                    onClick={() => onStatusChange(booking.id, "cancelled")}
                  >
                    취소
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BusinessBookingTable;
