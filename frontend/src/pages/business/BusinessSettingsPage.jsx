import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { businessHotelApi } from "../../api/businessHotelApi";
import BusinessHotelSettingsForm from "../../components/business/settings/BusinessHotelSettingsForm";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/common/ErrorMessage";
import AlertModal from "../../components/common/AlertModal";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { extractApiData, extractErrorMessage } from "../../utils/apiUtils";
import { logger } from "../../utils/logger";

const BusinessSettingsPage = () => {
  const navigate = useNavigate();
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [alertModal, setAlertModal] = useState({ isOpen: false, message: "", type: "info" });
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchHotel();
  }, []);

  const fetchHotel = async () => {
    try {
      setLoading(true);
      const response = await businessHotelApi.getMyHotel();
      const hotelData = extractApiData(response);
      // 배열인 경우 첫 번째 호텔 사용 (백엔드가 배열로 반환할 수 있음)
      const hotel = Array.isArray(hotelData) ? hotelData[0] : hotelData;
      setHotel(hotel);
    } catch (err) {
      // 호텔이 없는 경우 (404)는 에러로 처리하지 않음
      if (err.response?.status === 404) {
        setHotel(null);
      } else {
        const errorMessage = extractErrorMessage(err, "호텔 정보를 불러오는데 실패했습니다.");
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data) => {
    try {
      // 백엔드 API 명세에 맞게 필드명 변환
      // amenities 배열을 개별 boolean 필드로 변환
      const amenitiesMap = {
        bbqGrill: false,
        netflix: false,
        swimmingPool: false,
        parking: false,
        wifi: false,
        kitchen: false,
        pc: false,
        tv: false,
        ac: false,
      };
      
      // 선택된 amenities를 boolean 필드로 변환
      if (Array.isArray(data.amenities)) {
        data.amenities.forEach(amenity => {
          // 프론트엔드 amenity 값을 백엔드 필드명으로 매핑
          const mapping = {
            spa: 'swimmingPool', // spa는 swimmingPool로 매핑
            wifi: 'wifi',
            parking: 'parking',
            halfBath: 'ac', // halfBath는 ac로 매핑 (또는 적절한 필드로)
            mirrorRoom: 'tv', // mirrorRoom은 tv로 매핑 (또는 적절한 필드로)
            twinBed: 'ac', // twinBed는 ac로 매핑 (또는 적절한 필드로)
            karaoke: 'tv', // karaoke는 tv로 매핑
            couplePc: 'pc',
            gamingPc: 'pc',
          };
          
          const backendField = mapping[amenity];
          if (backendField) {
            amenitiesMap[backendField] = true;
          }
        });
      }
      
      // categoryId 확인 및 처리
      // 백엔드에서 categoryId가 없을 때 기본 카테고리를 자동으로 조회하도록 수정했으므로
      // 프론트엔드에서는 categoryId가 없어도 백엔드로 전송 가능
      let categoryId = hotel?.categoryId || hotel?.category?.id;
      
      // 호텔 기본 정보 (amenities 제외)
      // 백엔드 명세서: categoryId (ObjectId) 필수, 하지만 백엔드가 category 문자열도 지원할 수 있음
      const hotelData = {
        lodgingName: data.lodgingName || hotel?.lodgingName || "", // 필수
        description: data.description || "", // 필수
        address: data.address || "", // 필수
        phoneNumber: data.phoneNumber || hotel?.phoneNumber || "", // 필수
        email: data.email || hotel?.email || "",
        policies: data.policies || hotel?.policies || "",
        country: hotel?.country || "South Korea", // 필수, 기본값 설정
        categoryId: categoryId, // 백엔드 명세서: ObjectId 필수
        category: hotel?.category || "호텔", // 호환성을 위한 fallback (백엔드가 지원하는 경우)
        rating: hotel?.rating || 5, // 필수, 기본값 설정
        images: hotel?.images && hotel.images.length > 0 && hotel.images[0] !== "" ? hotel.images : [""], // 필수, 최소 1개
        city: hotel?.city || "",
      };
      
      logger.log("호텔 업데이트 요청 데이터:", hotelData);
      
      let lodgingId;
      
      // 호텔이 없으면 생성, 있으면 업데이트
      if (!hotel || !hotel._id) {
        // 신규 호텔 생성 (amenities 제외)
        const createResponse = await businessHotelApi.createHotel(hotelData);
        const createdHotel = extractApiData(createResponse);
        lodgingId = createdHotel._id || createdHotel.id;
        logger.log("호텔 생성 완료, lodgingId:", lodgingId);
      } else {
        // 기존 호텔 업데이트
        lodgingId = hotel._id || hotel.id;
        await businessHotelApi.updateHotel(lodgingId, hotelData);
        logger.log("호텔 업데이트 완료");
      }
      
      // amenities는 별도로 생성/업데이트
      if (lodgingId) {
        try {
          await businessHotelApi.createAmenities(lodgingId, amenitiesMap);
          logger.log("편의시설 생성/업데이트 완료");
        } catch (amenityErr) {
          // amenities 생성 실패는 경고만 표시 (호텔은 이미 생성됨)
          logger.warn("편의시설 저장 실패:", amenityErr);
        }
      }
      
      // 성공 시에만 알림 표시 및 데이터 새로고침
      setAlertModal({ isOpen: true, message: "호텔 정보가 저장되었습니다.", type: "success" });
      fetchHotel();
    } catch (err) {
      logger.error("호텔 업데이트 에러:", err.response?.data || err);
      
      // 백엔드 에러를 필드별 에러로 변환
      const errorData = err.response?.data;
      const errorMessage = errorData?.message || err.message || "저장에 실패했습니다.";
      
      // 400 에러인 경우 전송한 데이터를 다시 검증하여 어떤 필드가 문제인지 파악
      if (err.response?.status === 400) {
        const fieldErrors = {};
        
        // 전송한 데이터 검증
        const lowerMessage = errorMessage.toLowerCase();
        const isValidationError = lowerMessage.includes("필수") || 
                                  lowerMessage.includes("입력") ||
                                  lowerMessage.includes("required") ||
                                  lowerMessage.includes("누락");
        
        if (isValidationError) {
          // 백엔드가 어떤 필드가 누락되었는지 구체적으로 알려주지 않으므로
          // 전송한 데이터를 다시 검증
          // 폼에서 입력한 데이터 검증
          if (!data.lodgingName || data.lodgingName.trim() === "") {
            fieldErrors.lodgingName = "호텔명을 입력해주세요.";
          }
          if (!data.description || data.description.trim() === "") {
            fieldErrors.description = "호텔 소개를 입력해주세요.";
          }
          if (!data.address || data.address.trim() === "") {
            fieldErrors.address = "주소를 검색해주세요.";
          }
          if (!data.phoneNumber || data.phoneNumber.trim() === "") {
            fieldErrors.phoneNumber = "연락처를 입력해주세요.";
          }
          
          // 백엔드 필수 필드도 검증 (categoryId는 백엔드에서 자동 처리)
          // categoryId는 백엔드에서 기본 카테고리를 자동으로 조회하므로 프론트엔드에서 검증하지 않음
          
          // 백엔드 에러 메시지에서도 필드명 추출 시도
          if (lowerMessage.includes("lodgingname") || lowerMessage.includes("호텔명") || lowerMessage.includes("숙소명") || lowerMessage.includes("이름")) {
            fieldErrors.lodgingName = "호텔명을 입력해주세요.";
          }
          if (lowerMessage.includes("description") || lowerMessage.includes("소개") || lowerMessage.includes("설명")) {
            fieldErrors.description = "호텔 소개를 입력해주세요.";
          }
          if (lowerMessage.includes("address") || lowerMessage.includes("주소")) {
            fieldErrors.address = "주소를 검색해주세요.";
          }
          if (lowerMessage.includes("phonenumber") || lowerMessage.includes("연락처") || lowerMessage.includes("전화번호")) {
            fieldErrors.phoneNumber = "연락처를 입력해주세요.";
          }
          if (lowerMessage.includes("categoryid") || lowerMessage.includes("카테고리")) {
            // categoryId는 숨겨진 필드이므로 다른 필드에 표시하지 않음
            // 대신 일반적인 메시지로 처리
          }
          if (lowerMessage.includes("images") || lowerMessage.includes("이미지")) {
            // images는 숨겨진 필드이므로 다른 필드에 표시하지 않음
          }
          
          // 필드별 에러가 있으면 폼에 표시
          if (Object.keys(fieldErrors).length > 0) {
            console.log("필드별 에러 설정:", fieldErrors);
            setFormErrors(fieldErrors);
            return; // 팝업 표시하지 않고 필드 에러만 표시
          } else {
            // 필드별 에러가 없어도 400 에러면 폼 데이터를 다시 검증
            // 폼 데이터는 모두 채워져 있지만 백엔드에서 에러가 발생한 경우
            // (예: categoryId 같은 숨겨진 필드가 없는 경우)
            console.log("필드별 에러가 없지만 400 에러 발생. 폼 데이터:", data);
            console.log("에러 메시지:", errorMessage);
            console.log("hotel 데이터:", hotel);
            
            // 폼 데이터는 모두 채워져 있지만 백엔드 에러가 발생한 경우
            // 첫 번째 필수 필드에 일반적인 에러 메시지 표시하지 않음
            // (백엔드에서 기본 카테고리를 처리하도록 수정했으므로 이 경우는 발생하지 않아야 함)
          }
        }
      }
      
      // 필드별 에러가 없거나 다른 에러인 경우
      const lowerMessage = errorMessage.toLowerCase();
      const isValidationError = lowerMessage.includes("필수") || 
                                lowerMessage.includes("입력") ||
                                lowerMessage.includes("required") ||
                                lowerMessage.includes("누락") ||
                                err.response?.status === 400;
      
      // 검증 에러(400)는 팝업으로 표시하지 않음 - 필드 아래에만 표시
      if (!isValidationError) {
        // 검증 에러가 아닌 경우에만 팝업 표시
        setAlertModal({ isOpen: true, message: errorMessage, type: "error" });
      }
      
      // 에러 발생 시 호텔 정보 새로고침하지 않음 (입력한 내용 유지)
    }
  };

  const handleDeleteHotel = async () => {
    if (!hotel || !hotel._id) return;
    
    try {
      const hotelId = hotel._id || hotel.id;
      await businessHotelApi.deleteHotel(hotelId);
      setAlertModal({ 
        isOpen: true, 
        message: "숙소가 삭제되었습니다.", 
        type: "success" 
      });
      setDeleteConfirm({ isOpen: false });
      setHotel(null);
      // 삭제 후 대시보드로 이동
      setTimeout(() => {
        navigate("/business/dashboard");
      }, 1500);
    } catch (err) {
      const errorMessage = extractErrorMessage(err, "숙소 삭제에 실패했습니다.");
      setAlertModal({ isOpen: true, message: errorMessage, type: "error" });
      setDeleteConfirm({ isOpen: false });
    }
  };

  if (loading) return <Loader fullScreen />;
  if (error) return <ErrorMessage message={error} onRetry={fetchHotel} />;

  return (
    <div className="business-settings-page">
      <div className="page-header">
        <h1>호텔 설정</h1>
        {hotel && hotel._id && (
          <button 
            className="btn btn-danger" 
            onClick={() => setDeleteConfirm({ isOpen: true })}
          >
            숙소 삭제
          </button>
        )}
      </div>

      <div className="card">
        <BusinessHotelSettingsForm 
          hotel={hotel} 
          onSubmit={handleSubmit}
          externalErrors={formErrors}
          onErrorsChange={setFormErrors}
        />
      </div>

      <AlertModal
        isOpen={alertModal.isOpen}
        message={alertModal.message}
        type={alertModal.type}
        onClose={() => setAlertModal({ isOpen: false, message: "", type: "info" })}
      />

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="숙소 삭제"
        message="정말로 이 숙소를 삭제하시겠습니까? 예약이 있는 경우 삭제할 수 없습니다."
        onConfirm={handleDeleteHotel}
        onCancel={() => setDeleteConfirm({ isOpen: false })}
      />
    </div>
  );
};

export default BusinessSettingsPage;
