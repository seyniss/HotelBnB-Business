const availabilityService = require("./service");
const { successResponse, errorResponse } = require("../common/response");
const mongoose = require("mongoose");

// 날짜별 객실 잔여 수 조회
const getAvailabilityByDay = async (req, res) => {
  try {
    const { lodgingId, date } = req.query;

    // 필수 파라미터 검증
    if (!lodgingId || !date) {
      return res.status(400).json(
        errorResponse("lodgingId와 date는 필수 파라미터입니다.", 400)
      );
    }

    // lodgingId 형식 검증
    if (!mongoose.Types.ObjectId.isValid(lodgingId)) {
      return res.status(400).json(
        errorResponse("잘못된 lodgingId 형식입니다.", 400)
      );
    }

    // date 형식 검증 (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return res.status(400).json(
        errorResponse("date는 YYYY-MM-DD 형식이어야 합니다.", 400)
      );
    }

    // 날짜 유효성 검증
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return res.status(400).json(
        errorResponse("유효하지 않은 날짜입니다.", 400)
      );
    }

    // 서비스 호출
    const result = await availabilityService.getAvailabilityByDay(lodgingId, date);

    return res.status(200).json(
      successResponse(result, "날짜별 객실 잔여 수 조회 성공", 200)
    );
  } catch (error) {
    console.error("getAvailabilityByDay 실패:", error);

    // 커스텀 에러 처리
    if (error.message === "NO_ROOMS_FOUND") {
      return res.status(404).json(
        errorResponse("해당 숙소에 객실이 없습니다.", 404)
      );
    }

    return res.status(500).json(
      errorResponse("서버 오류", 500, error.message)
    );
  }
};

module.exports = {
  getAvailabilityByDay
};

