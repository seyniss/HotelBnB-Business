import { useState, useEffect } from "react";
import { businessHotelApi } from "../../api/businessHotelApi";
import BusinessHotelSettingsForm from "../../components/business/settings/BusinessHotelSettingsForm";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/common/ErrorMessage";
import AlertModal from "../../components/common/AlertModal";
import { extractApiData, extractErrorMessage } from "../../utils/apiUtils";
import { logger } from "../../utils/logger";

const BusinessSettingsPage = () => {
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [alertModal, setAlertModal] = useState({ isOpen: false, message: "", type: "info" });

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
        // 백엔드 명세서에 따르면 categoryId (ObjectId) 필수이지만,
        // 백엔드가 호환성을 위해 category 문자열도 지원할 수 있음
        categoryId: hotel?.categoryId || hotel?.category?.id || undefined, // 백엔드 명세서: ObjectId 필수
        category: hotel?.category || "호텔", // 호환성을 위한 fallback (백엔드가 지원하는 경우)
        rating: hotel?.rating || 5, // 필수, 기본값 설정
        images: hotel?.images && hotel.images.length > 0 ? hotel.images : [""], // 필수, 최소 1개
        city: hotel?.city || "",
      };
      
      logger.log("호텔 업데이트 요청 데이터:", hotelData);
      
      let lodgingId;
      
      // 호텔이 없으면 생성, 있으면 업데이트
      if (!hotel || !hotel._id) {
        // 신규 호텔 생성 (amenities 제외)
        try {
          const createResponse = await businessHotelApi.createHotel(hotelData);
          const createdHotel = extractApiData(createResponse);
          lodgingId = createdHotel._id || createdHotel.id;
          logger.log("호텔 생성 완료, lodgingId:", lodgingId);
        } catch (createErr) {
          // 좌표 변환 실패 등의 에러 처리
          const errorMsg = extractErrorMessage(createErr);
          if (errorMsg?.includes("좌표 변환 실패") || errorMsg?.includes("KAKAO_MAP_API_KEY")) {
            // 좌표 변환 실패는 경고로 처리하고 계속 진행 시도
            logger.warn("좌표 변환 실패 (백엔드 설정 필요):", errorMsg);
            // 백엔드가 좌표 없이도 호텔 생성을 허용하는지 확인 필요
            // 일단 에러를 다시 throw하여 사용자에게 알림
            throw createErr;
          } else {
            throw createErr;
          }
        }
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
      
      setAlertModal({ isOpen: true, message: "호텔 정보가 저장되었습니다.", type: "success" });
      fetchHotel();
    } catch (err) {
      let errorMessage = extractErrorMessage(err, "저장에 실패했습니다.");
      
      // 좌표 변환 실패 에러인 경우 사용자 친화적인 메시지로 변경
      if (errorMessage.includes("KAKAO_MAP_API_KEY") || errorMessage.includes("좌표 변환 실패")) {
        errorMessage = "호텔 등록 중 좌표 변환에 실패했습니다. 백엔드 관리자에게 카카오 맵 API 키 설정을 요청해주세요. 호텔 정보는 저장되었을 수 있습니다.";
      }
      
      logger.error("호텔 업데이트 에러:", err.response?.data || err);
      setAlertModal({ isOpen: true, message: errorMessage, type: "error" });
      
      // 에러 발생해도 호텔 정보 새로고침 시도 (부분적으로 저장되었을 수 있음)
      try {
        await fetchHotel();
      } catch (fetchErr) {
        logger.error("호텔 정보 새로고침 실패:", fetchErr);
      }
    }
  };

  if (loading) return <Loader fullScreen />;
  if (error) return <ErrorMessage message={error} onRetry={fetchHotel} />;

  return (
    <div className="business-settings-page">
      <div className="page-header">
        <h1>호텔 설정</h1>
      </div>

      <div className="card">
        <BusinessHotelSettingsForm hotel={hotel} onSubmit={handleSubmit} />
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

export default BusinessSettingsPage;
