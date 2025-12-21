const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require("mongoose");
const { connectDB } = require("../src/config/db");

const BusinessUser = require("../src/auth/model");
const Lodging = require("../src/lodging/model");
const Room = require("../src/room/model");
const Booking = require("../src/booking/model");
const Payment = require("../src/booking/payment");
const PaymentType = require("../src/booking/paymentType");
const Review = require("../src/review/model");

// 테스트 호텔 데이터 생성
const seedTestHotelData = async () => {
  try {
    await connectDB();
    
    console.log("\n=== 테스트 호텔 샘플 데이터 생성 ===\n");
    
    // 사업자 계정 찾기 (biz@business.com)
    const businessUser = await BusinessUser.findOne({ email: "biz@business.com" });
    if (!businessUser) {
      console.error("❌ 사업자 계정을 찾을 수 없습니다. biz@business.com으로 로그인해주세요.");
      process.exit(1);
    }

    console.log("✅ 사업자 계정 찾음:", businessUser.email);

    // 호텔 찾기
    let lodging = await Lodging.findOne({ businessId: businessUser._id });
    if (!lodging) {
      console.error("❌ 호텔 정보를 찾을 수 없습니다. 먼저 호텔을 등록해주세요.");
      process.exit(1);
    }

    console.log("✅ 호텔 찾음:", lodging.lodgingName);
    console.log("   호텔 ID:", lodging._id);

    // 1. 객실 데이터 생성
    console.log("\n📦 1단계: 객실 데이터 생성");
    let rooms = await Room.find({ lodgingId: lodging._id });
    
    if (rooms.length === 0) {
      console.log("   객실이 없습니다. 샘플 객실을 생성합니다...");
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
      console.log(`   ✅ ${rooms.length}개의 객실 생성 완료`);
    } else {
      console.log(`   ✅ 기존 객실 ${rooms.length}개 발견`);
    }

    // 2. 결제 타입 확인
    console.log("\n💳 2단계: 결제 타입 확인");
    let paymentType = await PaymentType.findOne({ type: "신용카드" });
    if (!paymentType) {
      paymentType = await PaymentType.create({
        type: "신용카드",
        typeCode: 1
      });
      console.log("   ✅ 기본 결제 타입 생성 완료");
    } else {
      console.log("   ✅ 결제 타입 확인 완료");
    }

    // 3. 예약 데이터 생성
    console.log("\n📅 3단계: 예약 데이터 생성");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sixMonthsAgo = new Date(today);
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    // 기존 예약 확인
    const existingBookings = await Booking.countDocuments({ businessUserId: businessUser._id });
    if (existingBookings > 0) {
      console.log(`   기존 예약 ${existingBookings}개 발견. 추가 예약을 생성합니다...`);
    }

    const bookings = [];
    const payments = [];

    // 최근 6개월간의 예약 생성
    for (let monthOffset = 5; monthOffset >= 0; monthOffset--) {
      const monthDate = new Date(today);
      monthDate.setMonth(monthDate.getMonth() - monthOffset);
      monthDate.setDate(1);

      // 각 월에 3-8개의 예약 생성
      const bookingsPerMonth = Math.floor(Math.random() * 6) + 3;
      
      for (let i = 0; i < bookingsPerMonth; i++) {
        const randomRoom = rooms[Math.floor(Math.random() * rooms.length)];
        const checkinDate = new Date(monthDate);
        checkinDate.setDate(Math.floor(Math.random() * 28) + 1);
        checkinDate.setHours(15, 0, 0, 0);
        
        const duration = Math.floor(Math.random() * 3) + 1; // 1-3박
        const checkoutDate = new Date(checkinDate);
        checkoutDate.setDate(checkoutDate.getDate() + duration);
        checkoutDate.setHours(11, 0, 0, 0);

        // 예약 날짜는 체크인 날짜보다 1-30일 전
        const bookingDate = new Date(checkinDate);
        bookingDate.setDate(bookingDate.getDate() - Math.floor(Math.random() * 30) - 1);

        // 예약 상태 결정
        let bookingStatus = 'completed';
        if (checkinDate >= today) {
          bookingStatus = Math.random() > 0.3 ? 'confirmed' : 'pending';
        }

        const booking = {
          roomId: randomRoom._id,
          userId: businessUser._id, // 임시로 사업자 ID 사용
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
    console.log(`   ✅ ${createdBookings.length}개의 예약 생성 완료`);

    // 결제 데이터 생성
    for (const booking of createdBookings) {
      if (booking.paymentStatus === 'paid') {
        const room = rooms.find(r => r._id.toString() === booking.roomId.toString());
        const totalAmount = room.price * booking.duration;
        const paidAmount = totalAmount;

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
      console.log(`   ✅ ${payments.length}개의 결제 데이터 생성 완료`);
    }

    // 4. 리뷰 데이터 생성
    console.log("\n⭐ 4단계: 리뷰 데이터 생성");
    const completedBookings = await Booking.find({
      businessUserId: businessUser._id,
      bookingStatus: { $in: ['confirmed', 'completed'] }
    }).limit(20);

    if (completedBookings.length > 0) {
      const reviewContents = [
        { rating: 5, content: "정말 깨끗하고 편안한 숙소였습니다! 직원분들도 친절하시고 위치도 좋아서 다음에도 또 이용하고 싶어요." },
        { rating: 4, content: "전반적으로 만족스러운 숙박이었습니다. 객실이 넓고 깨끗했어요. 다만 조금 시끄러웠던 점이 아쉬웠습니다." },
        { rating: 5, content: "완벽한 숙박 경험이었습니다! 뷰가 정말 좋고 시설도 깔끔했어요. 특히 조식이 맛있었습니다." },
        { rating: 4, content: "가격 대비 만족도가 높은 숙소입니다. 위치도 좋고 접근성이 좋아요. 다음에 또 오고 싶습니다." },
        { rating: 5, content: "친구들과 함께 왔는데 정말 좋았어요! 객실이 넓어서 편안했고, 주변에 맛집도 많아서 좋았습니다." },
        { rating: 3, content: "무난한 숙소였습니다. 깨끗하긴 하지만 시설이 조금 오래된 느낌이 있었어요." },
        { rating: 5, content: "생각보다 훨씬 좋았습니다! 직원분들이 정말 친절하시고 서비스도 훌륭했어요. 강력 추천합니다!" },
        { rating: 4, content: "가족 여행으로 왔는데 아이들도 좋아했어요. 객실이 넓고 깨끗해서 편안하게 지냈습니다." },
        { rating: 5, content: "비즈니스 출장으로 이용했는데 완벽했습니다! 와이파이도 빠르고 조용해서 업무하기 좋았어요." },
        { rating: 4, content: "로맨틱한 여행을 위해 왔는데 분위기가 좋았습니다. 다만 조금 더 로맨틱한 분위기를 원했어요." },
      ];

      const reviews = [];
      const usedBookingIds = new Set();

      for (const booking of completedBookings) {
        const existingReview = await Review.findOne({ bookingId: booking._id });
        if (existingReview || usedBookingIds.has(booking._id.toString())) {
          continue;
        }

        const reviewContent = reviewContents[Math.floor(Math.random() * reviewContents.length)];
        const reviewDate = new Date(booking.checkoutDate);
        reviewDate.setDate(reviewDate.getDate() + Math.floor(Math.random() * 7) + 1);

        const review = {
          lodgingId: lodging._id,
          userId: booking.userId,
          bookingId: booking._id,
          rating: reviewContent.rating,
          content: reviewContent.content,
          images: [],
          status: 'active',
          createdAt: reviewDate,
          updatedAt: reviewDate
        };

        reviews.push(review);
        usedBookingIds.add(booking._id.toString());

        if (reviews.length >= 10) {
          break;
        }
      }

      if (reviews.length > 0) {
        await Review.insertMany(reviews);
        console.log(`   ✅ ${reviews.length}개의 리뷰 생성 완료`);
      } else {
        console.log("   ⚠️  생성할 리뷰가 없습니다.");
      }
    } else {
      console.log("   ⚠️  리뷰를 생성할 예약이 없습니다.");
    }

    // 최종 요약
    console.log("\n" + "=".repeat(50));
    console.log("✅ 테스트 호텔 샘플 데이터 생성 완료!");
    console.log("=".repeat(50));
    console.log(`📦 객실: ${rooms.length}개`);
    console.log(`📅 예약: ${createdBookings.length}개`);
    console.log(`💳 결제: ${payments.length}개`);
    
    const reviewCount = await Review.countDocuments({ lodgingId: lodging._id });
    console.log(`⭐ 리뷰: ${reviewCount}개`);
    
    console.log("\n이제 대시보드에서 데이터를 확인할 수 있습니다! 🎉\n");

  } catch (error) {
    console.error("❌ 데이터 생성 중 오류 발생:", error);
    throw error;
  }
};

// 메인 실행
const main = async () => {
  try {
    await seedTestHotelData();
    await mongoose.connection.close();
    console.log("데이터베이스 연결 종료");
    process.exit(0);
  } catch (error) {
    console.error("스크립트 실행 실패:", error);
    process.exit(1);
  }
};

main();

