require('dotenv').config();

const express = require("express");
const cors = require("cors");
const cookieParser = require('cookie-parser');
const mongoose = require("mongoose");

// 라우트 - 새로운 구조
const authRoutes = require("./src/auth/route");
const bookingRoutes = require("./src/booking/route");
const lodgingRoutes = require("./src/lodging/route");
const roomRoutes = require("./src/room/route");
const reviewRoutes = require("./src/review/route");
const amenityRoutes = require("./src/amenity/route");
const statsRoutes = require("./src/stats/route");
const availabilityRoutes = require("./src/availability/route");

const app = express();
const PORT = process.env.PORT;

// CORS 설정
const allowedOrigins = process.env.FRONT_ORIGIN 
  ? process.env.FRONT_ORIGIN.split(',').map(origin => origin.trim())
  : ['http://localhost:5173', 'http://localhost:3001', 'http://localhost:5174'];

app.use(cors({
  origin: function (origin, callback) {
    // origin이 없는 경우 (같은 origin에서 요청하거나 모바일 앱 등)
    if (!origin) return callback(null, true);
    
    // 허용된 origin 목록에 있는지 확인
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      // 개발 환경에서는 모든 origin 허용 (선택사항)
      if (process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        callback(new Error('CORS 정책에 의해 차단되었습니다.'));
      }
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

// MongoDB 연결
const { connectDB } = require("./src/config/db");
connectDB();

// 만료된 pending 예약 자동 취소 스케줄러
const bookingService = require("./src/booking/service");
const EXPIRY_CHECK_INTERVAL_MS = 60000; // 1분마다 체크 (환경변수로 설정 가능)

setInterval(async () => {
  try {
    const result = await bookingService.expirePendingBookings();
    if (result.expiredCount > 0) {
      console.log(`[Pending Expiry] ${result.expiredCount} pending bookings expired`);
      if (result.errors && result.errors.length > 0) {
        console.error(`[Pending Expiry] Errors:`, result.errors);
      }
    }
  } catch (error) {
    console.error("[Pending Expiry] Error:", error);
  }
}, parseInt(process.env.PENDING_EXPIRY_CHECK_INTERVAL_MS || EXPIRY_CHECK_INTERVAL_MS));

// 헬스 체크
app.get("/", (_req, res) => res.send("Hotel Booking Business API OK"));

// API 라우트
app.use("/api/business/auth", authRoutes);
app.use("/api/business/hotel", lodgingRoutes);
app.use("/api/business/rooms", roomRoutes);
app.use("/api/business/bookings", bookingRoutes);  
app.use("/api/business/stats", statsRoutes);
app.use("/api/business/amenities", amenityRoutes);
app.use("/api/business/reviews", reviewRoutes);
app.use("/api/business/availability", availabilityRoutes);

// 404 핸들러
app.use((req, res, next) => {
  res.status(404).json({ message: '요청하신 경로를 찾을 수 없습니다.' });
});

// JSON 파싱 에러 핸들러
app.use((err, req, res, next) => {
  // JSON 파싱 에러 처리
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error('JSON 파싱 에러:', err.message);
    return res.status(400).json({ 
      message: '잘못된 JSON 형식입니다.', 
      error: 'JSON 형식이 올바르지 않습니다. 제어 문자(줄바꿈, 탭 등)가 포함되어 있는지 확인해주세요.',
      detail: err.message 
    });
  }
  
  // 기타 에러 처리
  console.error('Unhandled Error:', err);
  const statusCode = err.statusCode || err.status || 500;
  res.status(statusCode).json({ 
    message: '서버 오류', 
    error: err?.message || String(err) 
  });
});

app.listen(PORT, () => {
  console.log(`Business Backend Server running: http://localhost:${PORT}`);
});

