import { Link } from "react-router-dom";
import StatusBadge from "../../common/StatusBadge";

const BusinessRoomTable = ({ rooms, onDelete }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "KRW",
    }).format(amount);
  };

  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>객실명</th>
            <th>타입</th>
            <th>가격</th>
            <th>최대 인원</th>
            <th>수량</th>
            <th>상태</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          {rooms.map((room) => (
            <tr key={room.id}>
              <td>{room.name}</td>
              <td>{room.type}</td>
              <td>{formatCurrency(room.price)}</td>
              <td>{room.maxGuests}명</td>
              <td>{room.quantity}</td>
              <td>
                <StatusBadge status={room.status} type="room" />
              </td>
              <td>
                <Link to={`/business/rooms/${room.id}/edit`} className="btn btn-sm btn-outline">
                  수정
                </Link>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => onDelete(room.id)}
                >
                  삭제
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BusinessRoomTable;
