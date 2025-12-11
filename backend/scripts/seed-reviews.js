const mongoose = require("mongoose");
require("dotenv").config();

const BusinessUser = require("../src/auth/model");
const Lodging = require("../src/lodging/model");
const Room = require("../src/room/model");
const Booking = require("../src/booking/model");
const Review = require("../src/review/model");

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

// 샘플 리뷰 데이터 생성
const seedReviews = async () => {
  try {
    // 사업자 계정 찾기
    const businessUser = await BusinessUser.findOne({ email: "biz@business.com" });
    if (!businessUser) {
      console.error("사업자 계정을 찾을 수 없습니다. biz@business.com으로 로그인해주세요.");
      process.exit(1);
    }

    console.log("사업자 계정 찾음:", businessUser.email);

    // 호텔 찾기
    const lodging = await Lodging.findOne({ businessId: businessUser._id });
    if (!lodging) {
      console.error("호텔 정보를 찾을 수 없습니다.");
      process.exit(1);
    }

    console.log("호텔 찾음:", lodging.lodgingName);

    // 객실 찾기
    const rooms = await Room.find({ lodgingId: lodging._id });
    if (rooms.length === 0) {
      console.error("객실이 없습니다.");
      process.exit(1);
    }

    console.log(`객실 ${rooms.length}개 발견`);

    // 예약 찾기 (리뷰를 작성할 예약)
    const bookings = await Booking.find({
      businessUserId: businessUser._id,
      bookingStatus: { $in: ['confirmed', 'completed'] }
    }).limit(20);

    if (bookings.length === 0) {
      console.error("예약이 없습니다. 먼저 예약 데이터를 생성해주세요.");
      process.exit(1);
    }

    console.log(`예약 ${bookings.length}개 발견`);

    // 기존 리뷰 확인
    const existingReviews = await Review.countDocuments({ lodgingId: lodging._id });
    if (existingReviews > 0) {
      console.log(`기존 리뷰 ${existingReviews}개 발견. 추가 리뷰를 생성합니다...`);
    }

    // 샘플 리뷰 내용
    const reviewContents = [
      {
        rating: 5,
        content: "정말 깨끗하고 편안한 숙소였습니다! 직원분들도 친절하시고 위치도 좋아서 다음에도 또 이용하고 싶어요.",
      },
      {
        rating: 4,
        content: "전반적으로 만족스러운 숙박이었습니다. 객실이 넓고 깨끗했어요. 다만 조금 시끄러웠던 점이 아쉬웠습니다.",
      },
      {
        rating: 5,
        content: "완벽한 숙박 경험이었습니다! 뷰가 정말 좋고 시설도 깔끔했어요. 특히 조식이 맛있었습니다.",
      },
      {
        rating: 4,
        content: "가격 대비 만족도가 높은 숙소입니다. 위치도 좋고 접근성이 좋아요. 다음에 또 오고 싶습니다.",
      },
      {
        rating: 5,
        content: "친구들과 함께 왔는데 정말 좋았어요! 객실이 넓어서 편안했고, 주변에 맛집도 많아서 좋았습니다.",
      },
      {
        rating: 3,
        content: "무난한 숙소였습니다. 깨끗하긴 하지만 시설이 조금 오래된 느낌이 있었어요.",
      },
      {
        rating: 5,
        content: "생각보다 훨씬 좋았습니다! 직원분들이 정말 친절하시고 서비스도 훌륭했어요. 강력 추천합니다!",
      },
      {
        rating: 4,
        content: "가족 여행으로 왔는데 아이들도 좋아했어요. 객실이 넓고 깨끗해서 편안하게 지냈습니다.",
      },
      {
        rating: 5,
        content: "비즈니스 출장으로 이용했는데 완벽했습니다! 와이파이도 빠르고 조용해서 업무하기 좋았어요.",
      },
      {
        rating: 4,
        content: "로맨틱한 여행을 위해 왔는데 분위기가 좋았습니다. 다만 조금 더 로맨틱한 분위기를 원했어요.",
      },
      {
        rating: 5,
        content: "정말 만족스러운 숙박이었습니다! 모든 것이 완벽했고 직원분들도 친절하셨어요. 다음에 또 올게요!",
      },
      {
        rating: 4,
        content: "깨끗하고 편안한 숙소였습니다. 위치도 좋고 주변에 편의시설도 많아서 좋았어요.",
      },
      {
        rating: 5,
        content: "가격 대비 정말 훌륭한 숙소입니다! 시설도 좋고 서비스도 만족스러웠어요. 강력 추천!",
      },
      {
        rating: 3,
        content: "무난했습니다. 특별히 좋거나 나쁜 점은 없었어요. 가격이 저렴해서 그런지 시설이 조금 아쉬웠습니다.",
      },
      {
        rating: 5,
        content: "완벽한 숙박 경험이었습니다! 모든 것이 기대 이상이었고 직원분들도 정말 친절하셨어요.",
      },
    ];

    // 리뷰 생성 (각 예약당 최대 1개)
    const reviews = [];
    const usedBookingIds = new Set();

    for (const booking of bookings) {
      // 이미 리뷰가 있는 예약은 건너뛰기
      const existingReview = await Review.findOne({ bookingId: booking._id });
      if (existingReview || usedBookingIds.has(booking._id.toString())) {
        continue;
      }

      // 랜덤 리뷰 내용 선택
      const reviewContent = reviewContents[Math.floor(Math.random() * reviewContents.length)];
      
      // 예약의 체크아웃 날짜 이후에 리뷰 작성 (현실적으로)
      const reviewDate = new Date(booking.checkoutDate);
      reviewDate.setDate(reviewDate.getDate() + Math.floor(Math.random() * 7) + 1); // 체크아웃 후 1-7일

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

      // 최대 15개까지만 생성
      if (reviews.length >= 15) {
        break;
      }
    }

    if (reviews.length > 0) {
      await Review.insertMany(reviews);
      console.log(`${reviews.length}개의 리뷰 생성 완료`);
    } else {
      console.log("생성할 리뷰가 없습니다. (모든 예약에 이미 리뷰가 있거나 예약이 없음)");
    }

    console.log("\n✅ 리뷰 샘플 데이터 생성 완료!");

  } catch (error) {
    console.error("데이터 생성 중 오류 발생:", error);
    throw error;
  }
};

// 메인 실행
const main = async () => {
  await connectDB();
  await seedReviews();
  await mongoose.connection.close();
  console.log("\n데이터베이스 연결 종료");
  process.exit(0);
};

main().catch((error) => {
  console.error("스크립트 실행 실패:", error);
  process.exit(1);
});

