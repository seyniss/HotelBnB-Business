import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { businessRoomApi } from "../../api/businessRoomApi";
import { businessHotelApi } from "../../api/businessHotelApi";
import BusinessRoomForm from "../../components/business/rooms/BusinessRoomForm";
import AlertModal from "../../components/common/AlertModal";
import { extractApiData, extractErrorMessage } from "../../utils/apiUtils";

const BusinessRoomCreatePage = () => {
  const navigate = useNavigate();
  const [alertModal, setAlertModal] = useState({ isOpen: false, message: "", type: "info" });

  const handleSubmit = async (data) => {
    try {
      // 숙소 정보 조회하여 lodgingId 가져오기
      const hotelResponse = await businessHotelApi.getMyHotel();
      const hotelData = extractApiData(hotelResponse);
      // 배열인 경우 첫 번째 호텔 사용 (백엔드가 배열로 반환할 수 있음)
      const hotel = Array.isArray(hotelData) ? hotelData[0] : hotelData;
      
      if (!hotel || (!hotel._id && !hotel.id)) {
        setAlertModal({ 
          isOpen: true, 
          message: "숙소 정보를 찾을 수 없습니다. 먼저 숙소를 등록해주세요.", 
          type: "error" 
        });
        return;
      }

      // lodgingId 추가
      const lodgingId = hotel._id || hotel.id;
      const roomData = {
        ...data,
        lodgingId: lodgingId
      };

      await businessRoomApi.createRoom(roomData);
      setAlertModal({ isOpen: true, message: "객실이 등록되었습니다.", type: "success" });
      setTimeout(() => {
        navigate("/business/rooms");
      }, 1000);
    } catch (err) {
      const errorMessage = extractErrorMessage(err, "객실 등록에 실패했습니다.");
      setAlertModal({ isOpen: true, message: errorMessage, type: "error" });
    }
  };

  const handleCancel = () => {
    navigate("/business/rooms");
  };

  return (
    <div className="business-room-create-page">
      <div className="page-header">
        <h1>객실 등록</h1>
      </div>

      <div className="card">
        <BusinessRoomForm onSubmit={handleSubmit} onCancel={handleCancel} />
      </div>

      <AlertModal
        isOpen={alertModal.isOpen}
        message={alertModal.message}
        type={alertModal.type}
        onClose={() => setAlertModal({ isOpen: false, message: "", type: "info" })}
      />
    </div>
  );
};

export default BusinessRoomCreatePage;
