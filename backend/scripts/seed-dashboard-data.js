const mongoose = require("mongoose");
require("dotenv").config();

const BusinessUser = require("../src/auth/model");
const Lodging = require("../src/lodging/model");
const Room = require("../src/room/model");
const Booking = require("../src/booking/model");
const Payment = require("../src/booking/payment");
const PaymentType = require("../src/booking/paymentType");

// MongoDB 연결
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/hotelbnb-business");
    console.log("MongoDB 연결 성공");
  } catch (error) {
    console.error("MongoDB 연결 실패:", error);
    process.exit(1);
  }
};

// 샘플 데이터 생성
const seedDashboardData = async () => {
  try {
    // 사업자 계정 찾기 (biz@business.com)
    const businessUser = await BusinessUser.findOne({ email: "biz@business.com" });
    if (!businessUser) {
      console.error("사업자 계정을 찾을 수 없습니다. biz@business.com으로 로그인해주세요.");
      process.exit(1);
    }

    console.log("사업자 계정 찾음:", businessUser.email);

    // 호텔 찾기
    let lodging = await Lodging.findOne({ businessId: businessUser._id });
    if (!lodging) {
      console.error("호텔 정보를 찾을 수 없습니다. 먼저 호텔을 등록해주세요.");
      process.exit(1);
    }

    console.log("호텔 찾음:", lodging.lodgingName);

    // 기존 객실 확인 또는 생성
    let rooms = await Room.find({ lodgingId: lodging._id });
    if (rooms.length === 0) {
      console.log("객실이 없습니다. 샘플 객실을 생성합니다...");
      rooms = await Room.insertMany([
        {
          lodgingId: lodging._id,
          roomName: "스탠다드 룸",
          name: "스탠다드 룸",
          type: "standard",
          roomSize: "25평",
          capacityMin: 2,
          capacityMax: 4,
          maxGuests: 4,
          checkInTime: "15:00",
          checkOutTime: "11:00",
          price: 80000,
          countRoom: 5,
          quantity: 5,
          status: "active",
          description: "편안한 스탠다드 룸입니다.",
          amenities: ["wifi", "tv", "ac"]
        },
        {
          lodgingId: lodging._id,
          roomName: "디럭스 룸",
          name: "디럭스 룸",
          type: "deluxe",
          roomSize: "35평",
          capacityMin: 2,
          capacityMax: 6,
          maxGuests: 6,
          checkInTime: "15:00",
          checkOutTime: "11:00",
          price: 120000,
          countRoom: 3,
          quantity: 3,
          status: "active",
          description: "넓고 쾌적한 디럭스 룸입니다.",
          amenities: ["wifi", "tv", "ac", "spa"]
        },
        {
          lodgingId: lodging._id,
          roomName: "스위트 룸",
          name: "스위트 룸",
          type: "suite",
          roomSize: "50평",
          capacityMin: 4,
          capacityMax: 8,
          maxGuests: 8,
          checkInTime: "15:00",
          checkOutTime: "11:00",
          price: 200000,
          countRoom: 2,
          quantity: 2,
          status: "active",
          description: "최고급 스위트 룸입니다.",
          amenities: ["wifi", "tv", "ac", "spa", "kitchen"]
        }
      ]);
      console.log(`${rooms.length}개의 객실 생성 완료`);
    } else {
      console.log(`기존 객실 ${rooms.length}개 발견`);
    }

    // 기존 예약 확인
    const existingBookings = await Booking.countDocuments({ businessUserId: businessUser._id });
    if (existingBookings > 0) {
      console.log(`기존 예약 ${existingBookings}개 발견. 추가 예약을 생성합니다...`);
    }

    // 날짜 계산 (최근 6개월)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sixMonthsAgo = new Date(today);
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    // 샘플 예약 데이터 생성 (최근 6개월)
    const bookings = [];
    const payments = [];

    // 각 월별로 예약 생성
    for (let monthOffset = 5; monthOffset >= 0; monthOffset--) {
      const monthDate = new Date(today);
      monthDate.setMonth(monthDate.getMonth() - monthOffset);
      monthDate.setDate(1); // 월 초일

      // 각 월에 3-8개의 예약 생성
      const bookingsPerMonth = Math.floor(Math.random() * 6) + 3;
      
      for (let i = 0; i < bookingsPerMonth; i++) {
        const randomRoom = rooms[Math.floor(Math.random() * rooms.length)];
        const checkinDate = new Date(monthDate);
        checkinDate.setDate(Math.floor(Math.random() * 28) + 1); // 1-28일 사이
        checkinDate.setHours(15, 0, 0, 0);
        
        const duration = Math.floor(Math.random() * 3) + 1; // 1-3박
        const checkoutDate = new Date(checkinDate);
        checkoutDate.setDate(checkoutDate.getDate() + duration);
        checkoutDate.setHours(11, 0, 0, 0);

        // 예약 날짜는 체크인 날짜보다 1-30일 전
        const bookingDate = new Date(checkinDate);
        bookingDate.setDate(bookingDate.getDate() - Math.floor(Math.random() * 30) - 1);

        // 예약 상태 결정 (과거는 completed, 현재는 confirmed/pending)
        let bookingStatus = 'completed';
        if (checkinDate >= today) {
          bookingStatus = Math.random() > 0.3 ? 'confirmed' : 'pending';
        }

        const booking = {
          roomId: randomRoom._id,
          userId: businessUser._id, // 임시로 사업자 ID 사용 (실제로는 일반 사용자 ID여야 함)
          businessUserId: businessUser._id,
          adult: Math.floor(Math.random() * 3) + 1,
          child: Math.floor(Math.random() * 2),
          checkinDate: checkinDate,
          checkoutDate: checkoutDate,
          bookingDate: bookingDate,
          bookingStatus: bookingStatus,
          paymentStatus: bookingStatus === 'completed' || bookingStatus === 'confirmed' ? 'paid' : 'pending',
          duration: duration
        };

        bookings.push(booking);
      }
    }

    // 오늘 예약 추가
    const todayBookingRoom = rooms[Math.floor(Math.random() * rooms.length)];
    const todayCheckin = new Date(today);
    todayCheckin.setHours(15, 0, 0, 0);
    const todayCheckout = new Date(todayCheckin);
    todayCheckout.setDate(todayCheckout.getDate() + 2);
    todayCheckout.setHours(11, 0, 0, 0);

    bookings.push({
      roomId: todayBookingRoom._id,
      userId: businessUser._id,
      businessUserId: businessUser._id,
      adult: 2,
      child: 0,
      checkinDate: todayCheckin,
      checkoutDate: todayCheckout,
      bookingDate: new Date(today.getTime() - 86400000), // 어제 예약
      bookingStatus: 'confirmed',
      paymentStatus: 'paid',
      duration: 2
    });

    // 예약 삽입
    const createdBookings = await Booking.insertMany(bookings);
    console.log(`${createdBookings.length}개의 예약 생성 완료`);

    // PaymentType 조회 또는 생성
    let paymentType = await PaymentType.findOne({ type: "신용카드" });
    if (!paymentType) {
      // 기본 결제 타입 생성
      paymentType = await PaymentType.create({
        type: "신용카드",
        typeCode: 1
      });
      console.log("기본 결제 타입 생성 완료");
    }

    // 결제 데이터 생성
    for (const booking of createdBookings) {
      if (booking.paymentStatus === 'paid') {
        const room = rooms.find(r => r._id.toString() === booking.roomId.toString());
        const totalAmount = room.price * booking.duration;
        const paidAmount = totalAmount; // 전액 결제

        const payment = {
          bookingId: booking._id,
          paymentTypeId: paymentType._id,
          total: totalAmount,
          paid: paidAmount
        };

        payments.push(payment);
      }
    }

    // 결제 데이터 삽입
    if (payments.length > 0) {
      await Payment.insertMany(payments);
      console.log(`${payments.length}개의 결제 데이터 생성 완료`);
    }

    console.log("\n✅ 대시보드 샘플 데이터 생성 완료!");
    console.log(`- 객실: ${rooms.length}개`);
    console.log(`- 예약: ${createdBookings.length}개`);
    console.log(`- 결제: ${payments.length}개`);

  } catch (error) {
    console.error("데이터 생성 중 오류 발생:", error);
    throw error;
  }
};

// 메인 실행
const main = async () => {
  await connectDB();
  await seedDashboardData();
  await mongoose.connection.close();
  console.log("\n데이터베이스 연결 종료");
  process.exit(0);
};

main().catch((error) => {
  console.error("스크립트 실행 실패:", error);
  process.exit(1);
});

