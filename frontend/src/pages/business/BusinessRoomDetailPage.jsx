import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { businessRoomApi } from "../../api/businessRoomApi";
import BusinessRoomForm from "../../components/business/rooms/BusinessRoomForm";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/common/ErrorMessage";
import AlertModal from "../../components/common/AlertModal";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import ImageViewer from "../../components/common/ImageViewer";
import { extractApiData, extractErrorMessage } from "../../utils/apiUtils";

const BusinessRoomDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [alertModal, setAlertModal] = useState({ isOpen: false, message: "", type: "info" });
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false });
  const [imageViewer, setImageViewer] = useState({ isOpen: false, index: 0 });

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

  // 이미지 배열 가져오기
  const getRoomImages = () => {
    if (!room) return [];
    if (room.images && Array.isArray(room.images) && room.images.length > 0) {
      return room.images;
    }
    if (room.roomImage) {
      return [room.roomImage];
    }
    return [];
  };

  const roomImages = getRoomImages();

  const handleImageClick = (index) => {
    setImageViewer({ isOpen: true, index });
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

      {/* 이미지 갤러리 */}
      {roomImages.length > 0 && (
        <div className="card">
          <h2 style={{ marginBottom: "1rem", fontSize: "1.25rem", fontWeight: "600" }}>
            객실 사진
          </h2>
          <div className="room-image-gallery">
            {roomImages.map((image, index) => {
              // S3 key를 full URL로 변환하는 헬퍼 함수
              const getImageUrl = (key) => {
                if (!key) return "";
                if (key.startsWith("http://") || key.startsWith("https://")) {
                  return key;
                }
                return key;
              };

              return (
                <div
                  key={index}
                  className="room-image-thumbnail"
                  onClick={() => handleImageClick(index)}
                >
                  <img
                    src={getImageUrl(image)}
                    alt={`객실 사진 ${index + 1}`}
                    onError={(e) => {
                      e.target.src =
                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect fill='%23e2e8f0' width='200' height='200'/%3E%3Ctext fill='%2394a3b8' font-family='sans-serif' font-size='14' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3E이미지 없음%3C/text%3E%3C/svg%3E";
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

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

      <ImageViewer
        isOpen={imageViewer.isOpen}
        images={roomImages}
        initialIndex={imageViewer.index}
        onClose={() => setImageViewer({ isOpen: false, index: 0 })}
      />
    </div>
  );
};

export default BusinessRoomDetailPage;

