import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { businessRoomApi } from "../../api/businessRoomApi";
import BusinessRoomForm from "../../components/business/rooms/BusinessRoomForm";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/common/ErrorMessage";
import AlertModal from "../../components/common/AlertModal";
import { extractApiData, extractErrorMessage } from "../../utils/apiUtils";

const BusinessRoomEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [alertModal, setAlertModal] = useState({ isOpen: false, message: "", type: "info" });

  useEffect(() => {
    fetchRoom();
  }, [id]);

  const fetchRoom = async () => {
    try {
      setLoading(true);
      const response = await businessRoomApi.getRoomById(id);
      const roomData = extractApiData(response);
      setRoom(roomData);
    } catch (err) {
      const errorMessage = extractErrorMessage(err, "객실 정보를 불러오는데 실패했습니다.");
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data) => {
    try {
      await businessRoomApi.updateRoom(id, data);
      setAlertModal({ isOpen: true, message: "객실이 수정되었습니다.", type: "success" });
      setTimeout(() => {
        navigate("/business/rooms");
      }, 1000);
    } catch (err) {
      const errorMessage = extractErrorMessage(err, "객실 수정에 실패했습니다.");
      setAlertModal({ isOpen: true, message: errorMessage, type: "error" });
    }
  };

  const handleCancel = () => {
    navigate("/business/rooms");
  };

  if (loading) return <Loader fullScreen />;
  if (error) return <ErrorMessage message={error} onRetry={fetchRoom} />;

  return (
    <div className="business-room-edit-page">
      <div className="page-header">
        <h1>객실 수정</h1>
      </div>

      <div className="card">
        <BusinessRoomForm room={room} onSubmit={handleSubmit} onCancel={handleCancel} />
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

export default BusinessRoomEditPage;
