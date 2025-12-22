import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { businessRoomApi } from "../../api/businessRoomApi";
import BusinessRoomForm from "../../components/business/rooms/BusinessRoomForm";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/common/ErrorMessage";
import AlertModal from "../../components/common/AlertModal";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { extractApiData, extractErrorMessage } from "../../utils/apiUtils";

const BusinessRoomDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [alertModal, setAlertModal] = useState({ isOpen: false, message: "", type: "info" });
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false });

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

  const handleCancel = () => {
    navigate("/business/rooms");
  };

  const handleEdit = () => {
    navigate(`/business/rooms/${id}/edit`);
  };

  const handleDeleteRoom = async () => {
    if (!id) return;
    
    try {
      await businessRoomApi.deleteRoom(id);
      setAlertModal({ 
        isOpen: true, 
        message: "객실이 삭제되었습니다.", 
        type: "success" 
      });
      setDeleteConfirm({ isOpen: false });
      // 삭제 후 객실 목록 페이지로 이동
      setTimeout(() => {
        navigate("/business/rooms");
      }, 1500);
    } catch (err) {
      const errorMessage = extractErrorMessage(err, "객실 삭제에 실패했습니다.");
      setAlertModal({ isOpen: true, message: errorMessage, type: "error" });
      setDeleteConfirm({ isOpen: false });
    }
  };

  if (loading) return <Loader fullScreen />;
  if (error) return <ErrorMessage message={error} onRetry={fetchRoom} />;

  return (
    <div className="business-room-detail-page">
      <div className="page-header">
        <h1>객실 상세</h1>
        {room && room.id && (
          <div style={{ display: "flex", gap: "8px" }}>
            <button 
              className="btn btn-primary" 
              onClick={handleEdit}
            >
              수정
            </button>
            <button 
              className="btn btn-danger" 
              onClick={() => setDeleteConfirm({ isOpen: true })}
            >
              객실 삭제
            </button>
          </div>
        )}
      </div>

      <div className="card">
        <BusinessRoomForm room={room} onCancel={handleCancel} readOnly={true} />
      </div>

      <AlertModal
        isOpen={alertModal.isOpen}
        message={alertModal.message}
        type={alertModal.type}
        onClose={() => setAlertModal({ isOpen: false, message: "", type: "info" })}
      />

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="객실 삭제"
        message="정말로 이 객실을 삭제하시겠습니까? 예약이 있는 경우 삭제할 수 없습니다."
        onConfirm={handleDeleteRoom}
        onCancel={() => setDeleteConfirm({ isOpen: false })}
      />
    </div>
  );
};

export default BusinessRoomDetailPage;

