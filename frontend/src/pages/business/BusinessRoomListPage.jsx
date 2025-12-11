import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { businessRoomApi } from "../../api/businessRoomApi";
import { extractApiArray, extractErrorMessage } from "../../utils/apiUtils";
import { logger } from "../../utils/logger";

const BusinessRoomListPage = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await businessRoomApi.getRooms();
      const roomsData = extractApiArray(response, "rooms");
      setRooms(roomsData);
    } catch (error) {
      const errorMessage = extractErrorMessage(error, "객실 목록을 불러오는데 실패했습니다.");
      logger.error("Failed to fetch rooms:", errorMessage, error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "KRW",
    }).format(amount);
  };

  if (loading) {
    return <div>로딩 중...</div>;
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>객실 관리</h1>
          <p>호텔 객실 정보를 관리합니다</p>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={() => navigate("/business/rooms/create")}
        >
          새 객실 추가
        </button>
      </div>

      <div className="card">
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
                  <td>{room.quantity}개</td>
                  <td>
                    <span
                      className={`status-badge ${
                        room.available ? "confirmed" : "cancelled"
                      }`}
                    >
                      {room.available ? "판매중" : "판매중지"}
                    </span>
                  </td>
                  <td>
                    <Link 
                      to={`/business/rooms/${room.id}/edit`}
                      className="btn btn-outline"
                    >
                      수정
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BusinessRoomListPage;
