const Booking = require("./model");
const BookingItem = require("../bookingItem/model");
const Payment = require("./payment");
const PaymentType = require("./paymentType");
const Room = require("../room/model");
const Lodging = require("../lodging/model");
const BusinessUser = require("../auth/model");
const RoomInventory = require("../roomInventory/model");
const mongoose = require("mongoose");

// 날짜 유틸 함수
const normalizeDateUTC = (date) => {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
};

// checkin <= date < checkout (checkout 제외)
const enumerateDates = (checkinDate, checkoutDate) => {
  const start = normalizeDateUTC(checkinDate);
  const end = normalizeDateUTC(checkoutDate);
  const dates = [];
  for (let d = new Date(start); d < end; d.setUTCDate(d.getUTCDate() + 1)) {
    dates.push(new Date(d));
  }
  return dates;
};

// 재고 확보(개수차감) 함수 (동시성 안전) - quantity 지원
// 트랜잭션 내에서 실행
const reserveInventoryQtyOrThrow = async (roomId, dates, capacity, qty, session) => {
  // 1) inventory upsert (없으면 생성)
  await RoomInventory.bulkWrite(
    dates.map((date) => ({
      updateOne: {
        filter: { roomId, date },
        update: { $setOnInsert: { capacity, booked: 0 } },
        upsert: true,
      },
    })),
    { session }
  );

  // 2) 날짜별 booked += qty (조건: booked <= capacity - qty)
  // -> 이 조건 업데이트가 "원자적"이라 레이스 컨디션에 강함
  for (const date of dates) {
    const updated = await RoomInventory.findOneAndUpdate(
      { roomId, date, booked: { $lte: capacity - qty } },
      { $inc: { booked: qty } },
      { new: true, session }
    );

    if (!updated) {
      throw new Error("ROOM_NOT_AVAILABLE");
    }
  }
};

// 재고 반납 함수 (취소 시) - quantity 지원
// 안전한 재고 반환: booked = max(booked - qty, 0) 보장
// - filter 조건으로 인한 "조용한 실패" 방지
// - booked가 qty보다 작아도 안전하게 처리
// - 음수 방지 (최소값 0 보장)
const releaseInventoryQty = async (roomId, dates, qty, session) => {
  await RoomInventory.bulkWrite(
    dates.map((date) => ({
      updateOne: {
        filter: { roomId, date },
        // Aggregation pipeline update를 사용하여 안전하게 booked 감소
        // booked = max(booked - qty, 0) 보장
        update: [
          {
            $set: {
              booked: {
                $max: [
                  { $subtract: ["$booked", qty] },
                  0
                ]
              }
            }
          }
        ],
      },
    })),
    { session }
  );
};

// 하위 호환성: quantity=1로 호출하는 기존 함수들
const reserveInventoryOrThrow = async (roomId, dates, capacity, session) => {
  return reserveInventoryQtyOrThrow(roomId, dates, capacity, 1, session);
};

const releaseInventory = async (roomId, dates, session) => {
  return releaseInventoryQty(roomId, dates, 1, session);
};

// items 배열 병합 함수 (room_id 중복 합산)
const mergeItems = (items = []) => {
  const map = new Map();
  for (const it of items) {
    const roomId = String(it.room_id || it.roomId);
    const qty = Number(it.quantity || 0);
    if (!roomId || qty <= 0) continue;
    map.set(roomId, (map.get(roomId) || 0) + qty);
  }
  return Array.from(map.entries()).map(([roomId, quantity]) => ({ roomId, quantity }));
};

// 예약 가능 여부 체크 (트랜잭션 내에서 사용) - 레거시 함수 (참고용)
// 날짜별로 사용 중인 객실 수를 계산하여 모든 날짜에서 객실이 사용 가능한지 확인
const checkRoomAvailability = async (roomId, checkinDate, checkoutDate, session) => {
  // 날짜를 정규화 (시간 부분 제거, UTC 기준)
  const normalizeDate = (date) => {
    const d = new Date(date);
    d.setUTCHours(0, 0, 0, 0);
    return d;
  };

  const startDate = normalizeDate(checkinDate);
  const endDate = normalizeDate(checkoutDate);

  // 예약 기간의 각 날짜에 대해 사용 중인 객실 수를 확인
  // 체크아웃 날짜는 포함하지 않음 (체크아웃 당일에는 객실이 비어있음)
  const datesToCheck = [];
  for (let date = new Date(startDate); date < endDate; date.setUTCDate(date.getUTCDate() + 1)) {
    datesToCheck.push(new Date(date));
  }

  // 각 날짜별로 사용 중인 예약 수를 계산
  // 해당 날짜에 사용 중인 예약: checkinDate <= date < checkoutDate
  for (const date of datesToCheck) {
    const nextDate = new Date(date);
    nextDate.setUTCDate(nextDate.getUTCDate() + 1);

    const occupiedCount = await Booking.countDocuments({
      roomId: roomId,
      bookingStatus: { $in: ['pending', 'confirmed'] }, // pending과 confirmed만 카운트
      checkinDate: { $lt: nextDate }, // 체크인이 다음 날 전
      checkoutDate: { $gt: date }     // 체크아웃이 현재 날짜 후
    }).session(session);

    // 각 날짜별 사용 중인 객실 수를 반환 (가장 많이 사용된 날짜의 수)
    // 이 값은 createBooking에서 room.quantity와 비교됨
    if (occupiedCount > 0) {
      // 최대값을 반환하여 가장 많이 사용된 날짜의 객실 수를 알 수 있도록 함
      // 실제 비교는 createBooking에서 각 날짜별로 수행됨
      return occupiedCount;
    }
  }

  return 0; // 모든 날짜에 객실이 사용 가능
};

// 날짜별 가용성 체크 (개선된 버전)
// room 객체를 받아서 각 날짜별로 객실 수량을 확인
const checkRoomAvailabilityByDate = async (roomId, checkinDate, checkoutDate, roomQuantity, session) => {
  // 날짜를 정규화 (시간 부분 제거, UTC 기준)
  const normalizeDate = (date) => {
    const d = new Date(date);
    d.setUTCHours(0, 0, 0, 0);
    return d;
  };

  const startDate = normalizeDate(checkinDate);
  const endDate = normalizeDate(checkoutDate);

  // 예약 기간의 각 날짜에 대해 사용 중인 객실 수를 확인
  // 체크아웃 날짜는 포함하지 않음 (체크아웃 당일에는 객실이 비어있음)
  const datesToCheck = [];
  for (let date = new Date(startDate); date < endDate; date.setUTCDate(date.getUTCDate() + 1)) {
    datesToCheck.push(new Date(date));
  }

  // 각 날짜별로 사용 중인 예약 수를 계산
  for (const date of datesToCheck) {
    // 해당 날짜에 사용 중인 예약 조건:
    // - 체크인 날짜가 해당 날짜 이전 또는 당일 (checkinDate <= date)
    // - 체크아웃 날짜가 해당 날짜 이후 (checkoutDate > date)
    // 즉, checkinDate <= date < checkoutDate
    const occupiedCount = await Booking.countDocuments({
      roomId: roomId,
      bookingStatus: { $in: ['pending', 'confirmed'] },
      checkinDate: { $lte: date },   // 체크인이 해당 날짜 이전 또는 당일
      checkoutDate: { $gt: date }     // 체크아웃이 해당 날짜 후 (체크아웃 당일은 제외)
    }).session(session);

    // 해당 날짜에 사용 가능한 객실이 없으면 false 반환
    if (occupiedCount >= roomQuantity) {
      return false;
    }
  }

  return true; // 모든 날짜에 객실 사용 가능
};

// 예약 생성 (트랜잭션 사용) - 여러 객실 지원
const createBooking = async (bookingData, userId /* 인증된 사용자 */) => {
  const { adult, child, checkin_date, checkout_date, duration, items } = bookingData;
  
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // items 병합 (중복 room_id 합산)
    const mergedItems = mergeItems(items);
    if (mergedItems.length === 0) {
      throw new Error("INVALID_ITEMS");
    }

    // user 검증
    const user = await BusinessUser.findById(userId).session(session);
    if (!user) {
      throw new Error("USER_NOT_FOUND");
    }

    const checkinDate = new Date(checkin_date);
    const checkoutDate = new Date(checkout_date);
    const dates = enumerateDates(checkinDate, checkoutDate);
    
    if (dates.length === 0) {
      throw new Error("INVALID_DATE_RANGE");
    }

    // 1) 필요한 room들을 한번에 조회
    const roomIds = mergedItems.map((x) => x.roomId);
    const rooms = await Room.find({ _id: { $in: roomIds } }).session(session);
    
    if (rooms.length !== roomIds.length) {
      throw new Error("ROOM_NOT_FOUND");
    }

    // 2) lodging/business 검증 + businessUserId 결정
    const lodgingIds = [...new Set(rooms.map((r) => String(r.lodgingId)))];
    const lodgings = await Lodging.find({ _id: { $in: lodgingIds } }).session(session);
    
    if (lodgings.length !== lodgingIds.length) {
      throw new Error("LODGING_NOT_FOUND");
    }

    // 같은 사업자 소속 객실만 한 주문에서 허용
    const businessIds = [...new Set(lodgings.map((l) => String(l.businessId)))];
    if (businessIds.length !== 1) {
      throw new Error("MIXED_BUSINESS_NOT_ALLOWED");
    }
    const businessUserId = businessIds[0];

    // 3) 인원 수 검증 (정책: 주문 전체 기준)
    const totalGuests = (Number(adult) || 0) + (Number(child) || 0);
    // 각 객실의 최소 수용 인원 확인
    const minCapacity = Math.min(...rooms.map(r => r.capacityMin || 1));
    const maxCapacity = Math.max(...rooms.map(r => r.maxGuests || r.capacityMax || 999));
    
    if (totalGuests < minCapacity || totalGuests > maxCapacity) {
      throw new Error("INVALID_GUEST_COUNT");
    }

    // 4) Booking 헤더 생성
    const pendingExpiryMinutes = parseInt(process.env.PENDING_BOOKING_EXPIRY_MINUTES || '30');
    const pendingExpiresAt = new Date(Date.now() + pendingExpiryMinutes * 60 * 1000);
    
    const booking = await Booking.create([{
      userId: userId,
      businessUserId: businessUserId,
      adult: adult || 0,
      child: child || 0,
      checkinDate: checkinDate,
      checkoutDate: checkoutDate,
      duration,
      bookingStatus: 'pending',
      bookingDate: new Date(),
      pendingExpiresAt: pendingExpiresAt
    }], { session });

    const bookingId = booking[0]._id;

    // 5) 재고 확보(차감): item.quantity만큼
    for (const item of mergedItems) {
      const room = rooms.find((r) => String(r._id) === String(item.roomId));
      const capacity = room.countRoom || 1;
      await reserveInventoryQtyOrThrow(room._id, dates, capacity, item.quantity, session);
    }

    // 6) BookingItem 생성
    await BookingItem.insertMany(
      mergedItems.map((it) => ({
        bookingId,
        roomId: it.roomId,
        quantity: it.quantity,
      })),
      { session }
    );

    // 트랜잭션 커밋
    await session.commitTransaction();
    session.endSession();

    // 응답: booking + items
    const savedItems = await BookingItem.find({ bookingId }).lean();
    
    // 추가 데이터 조회 (읽기 전용)
    const [userData, payment] = await Promise.all([
      BusinessUser.findById(userId).lean().catch(() => null),
      Payment.findOne({ bookingId })
        .populate('paymentTypeId')
        .lean()
        .catch(() => null)
    ]);

    return {
      booking: booking[0].toObject(),
      items: savedItems,
      user: userData || null,
      payment: payment || null
    };
  } catch (error) {
    // 트랜잭션 롤백
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

// 예약 목록 조회
const getBookings = async (filters, userId) => {
  const { status, lodgingId, startDate, endDate, search, page = 1, limit = 20 } = filters;

  const query = {};

  // 사업자의 사업 예약만 조회
  const user = await BusinessUser.findById(userId);
  if (!user || user.role !== 'business') {
    throw new Error("BUSINESS_NOT_FOUND");
  }
  query.businessUserId = user._id;

  if (status) {
    query.bookingStatus = status;
  }

  if (lodgingId) {
    // BookingItem을 통해 lodgingId로 필터링
    const rooms = await Room.find({ lodgingId: lodgingId }).select('_id');
    const roomIds = rooms.map(r => r._id);
    if (roomIds.length > 0) {
      const bookingIdsWithRooms = await BookingItem.find({ roomId: { $in: roomIds } }).distinct('bookingId');
      query._id = { $in: bookingIdsWithRooms };
    } else {
      query._id = { $in: [] };
    }
  }

  if (startDate || endDate) {
    query.checkinDate = {};
    if (startDate) {
      query.checkinDate.$gte = new Date(startDate);
    }
    if (endDate) {
      query.checkinDate.$lte = new Date(endDate);
    }
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  const [bookings, total] = await Promise.all([
    Booking.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    Booking.countDocuments(query)
  ]);

  const bookingsWithPayment = await Promise.all(
    bookings.map(async (booking) => {
      try {
        if (!booking.userId || !booking._id) {
          return null;
        }

        const [items, user, payment] = await Promise.all([
          BookingItem.find({ bookingId: booking._id }).lean().catch(() => []),
          BusinessUser.findById(booking.userId).lean().catch(() => null),
          Payment.findOne({ bookingId: booking._id })
            .populate('paymentTypeId')
            .lean()
            .catch(() => null)
        ]);

        // 첫 번째 item의 room 정보로 호텔명 결정 (호환성 유지)
        let hotelName = 'Unknown';
        let roomType = 'Multiple Rooms';
        
        if (items.length > 0) {
          const firstRoomId = items[0].roomId;
          const firstRoom = await Room.findById(firstRoomId).lean().catch(() => null);
          if (firstRoom) {
            roomType = firstRoom.roomName || firstRoom.name || 'Unknown';
            const lodging = await Lodging.findById(firstRoom.lodgingId).lean().catch(() => null);
            hotelName = lodging?.lodgingName || 'Unknown';
          }
        }
        
        // 프론트엔드 요구사항에 맞게 응답 형식 변환
        const formattedBooking = {
          id: booking._id.toString(),
          hotelName: hotelName,
          roomType: items.length > 1 ? `${items.length} rooms` : roomType,
          guestName: user?.name || 'Unknown',
          guestEmail: user?.email || '',
          guestPhone: user?.phoneNumber || '',
          checkIn: booking.checkinDate ? new Date(booking.checkinDate).toISOString().split('T')[0] : '',
          checkOut: booking.checkoutDate ? new Date(booking.checkoutDate).toISOString().split('T')[0] : '',
          guests: (booking.adult || 0) + (booking.child || 0),
          amount: payment?.paid || 0,
          status: booking.bookingStatus || 'pending',
          createdAt: booking.createdAt ? new Date(booking.createdAt).toISOString().split('T')[0] : '',
          items: items // items 배열 추가
        };
        
        return formattedBooking;
      } catch (err) {
        console.error("예약 데이터 처리 중 오류:", booking._id, err);
        return null; // 유효하지 않은 예약은 제외
      }
    })
  );
  
  let validBookings = bookingsWithPayment.filter(item => item !== null);

  // search 필터 적용 (guestName, hotelName, roomType에서 검색)
  if (search) {
    const searchLower = search.toLowerCase();
    validBookings = validBookings.filter(booking => {
      return (
        booking.guestName?.toLowerCase().includes(searchLower) ||
        booking.hotelName?.toLowerCase().includes(searchLower) ||
        booking.roomType?.toLowerCase().includes(searchLower)
      );
    });
  }

  return {
    bookings: validBookings,
    totalPages: Math.ceil(total / parseInt(limit)),
    currentPage: parseInt(page)
  };
};

// 예약 상세 조회
const getBookingById = async (bookingId, userId) => {
  const booking = await Booking.findById(bookingId);

  if (!booking) {
    throw new Error("BOOKING_NOT_FOUND");
  }

  // 사업자의 사업 예약인지 확인
  const user = await BusinessUser.findById(userId);
  if (!user || user.role !== 'business') {
    throw new Error("BUSINESS_NOT_FOUND");
  }
  if (String(booking.businessUserId) !== String(user._id)) {
    throw new Error("UNAUTHORIZED");
  }

  const [items, guestUser, payment] = await Promise.all([
    BookingItem.find({ bookingId: booking._id }).lean(),
    BusinessUser.findById(booking.userId).lean(),
    Payment.findOne({ bookingId: booking._id })
      .populate('paymentTypeId')
      .lean()
  ]);

  // 첫 번째 item의 room 정보로 호텔명 결정 (호환성 유지)
  let hotelName = 'Unknown';
  let roomType = 'Multiple Rooms';
  
  if (items.length > 0) {
    const firstRoomId = items[0].roomId;
    const firstRoom = await Room.findById(firstRoomId).lean();
    if (firstRoom) {
      roomType = firstRoom.roomName || firstRoom.name || 'Unknown';
      const lodging = await Lodging.findById(firstRoom.lodgingId).lean();
      hotelName = lodging?.lodgingName || 'Unknown';
    }
  }

  // 프론트엔드 요구사항에 맞게 응답 형식 변환
  return {
    id: booking._id.toString(),
    hotelName: hotelName,
    roomType: items.length > 1 ? `${items.length} rooms` : roomType,
    guestName: guestUser?.name || 'Unknown',
    guestEmail: guestUser?.email || '',
    guestPhone: guestUser?.phoneNumber || '',
    checkIn: booking.checkinDate ? new Date(booking.checkinDate).toISOString().split('T')[0] : '',
    checkOut: booking.checkoutDate ? new Date(booking.checkoutDate).toISOString().split('T')[0] : '',
    guests: (booking.adult || 0) + (booking.child || 0),
    amount: payment?.paid || 0,
    status: booking.bookingStatus || 'pending',
    createdAt: booking.createdAt ? new Date(booking.createdAt).toISOString().split('T')[0] : '',
    items: items // items 배열 추가
  };
};

// 예약 상태 변경
// Idempotent 보장: 중복 취소 호출에도 재고가 꼬이지 않도록 안전하게 처리
const updateBookingStatus = async (bookingId, status, cancellationReason, userId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await BusinessUser.findById(userId).session(session);
    if (!user || user.role !== 'business') {
      throw new Error("BUSINESS_NOT_FOUND");
    }

    // 조건부 원자적 전환: pending/confirmed일 때만 cancelled로 변경 가능
    // 이미 cancelled면 재고 반환 로직을 실행하지 않음 (idempotent 보장)
    const booking = await Booking.findOne({
      _id: bookingId,
      businessUserId: user._id
    }).session(session);

    if (!booking) {
      throw new Error("BOOKING_NOT_FOUND");
    }

    const prevStatus = booking.bookingStatus;

    // 취소로 바뀔 때만 재고 반납 처리
    // prevStatus가 pending 또는 confirmed이고, status가 cancelled일 때만 실행
    // 이미 cancelled인 경우는 재고 반환하지 않음 (중복 취소 방지)
    if ((prevStatus === 'pending' || prevStatus === 'confirmed') && status === 'cancelled') {
      // 날짜 계산: checkin <= date < checkout (UTC 00:00 기준 정규화)
      // 예약 생성 시 사용한 규칙과 완전히 동일하게 처리
      const dates = enumerateDates(booking.checkinDate, booking.checkoutDate);
      
      // BookingItem 조회: 다중 객실 예약 구조 지원
      const items = await BookingItem.find({ bookingId }).session(session);
      
      if (items.length === 0) {
        // BookingItem이 없으면 재고 반환할 것이 없음
        console.warn(`Booking ${bookingId} has no BookingItems, skipping inventory release`);
      } else {
        // 각 item의 quantity만큼 재고 반납
        // releaseInventoryQty는 안전하게 booked = max(booked - qty, 0) 보장
        for (const item of items) {
          await releaseInventoryQty(item.roomId, dates, item.quantity, session);
        }
      }
    }

    // 상태 변경 업데이트 객체 구성
    const updates = { bookingStatus: status };
    
    // 취소 상태일 때만 취소 사유 저장
    if (status === 'cancelled' && cancellationReason) {
      updates.cancellationReason = cancellationReason;
    } else if (status !== 'cancelled') {
      // 취소 상태가 아니면 취소 사유 초기화
      updates.cancellationReason = null;
    }
    
    // confirmed로 변경되면 pendingExpiresAt 초기화
    if (status === 'confirmed') {
      updates.pendingExpiresAt = null;
    }
    
    // Payment 자동 생성/업데이트 로직 제거
    // 결제는 별도 결제 API에서 처리하므로 여기서는 bookingStatus만 변경

    // 상태 업데이트 실행
    const updated = await Booking.findByIdAndUpdate(
      bookingId,
      { $set: updates },
      { new: true, runValidators: true, session }
    );

    await session.commitTransaction();
    session.endSession();

    const [items, userData, paymentData] = await Promise.all([
      BookingItem.find({ bookingId: updated._id }).lean(),
      BusinessUser.findById(updated.userId).lean(),
      Payment.findOne({ bookingId: updated._id })
        .populate('paymentTypeId')
        .lean()
    ]);

    // 첫 번째 item의 room 정보로 호텔명 결정 (호환성 유지)
    let hotelName = 'Unknown';
    let roomType = 'Multiple Rooms';
    
    if (items.length > 0) {
      const firstRoomId = items[0].roomId;
      const firstRoom = await Room.findById(firstRoomId).lean();
      if (firstRoom) {
        roomType = firstRoom.roomName || firstRoom.name || 'Unknown';
        const lodging = await Lodging.findById(firstRoom.lodgingId).lean();
        hotelName = lodging?.lodgingName || 'Unknown';
      }
    }

    // 프론트엔드 요구사항에 맞게 응답 형식 변환
    return {
      id: updated._id.toString(),
      hotelName: hotelName,
      roomType: items.length > 1 ? `${items.length} rooms` : roomType,
      guestName: userData?.name || 'Unknown',
      guestEmail: userData?.email || '',
      guestPhone: userData?.phoneNumber || '',
      checkIn: updated.checkinDate ? new Date(updated.checkinDate).toISOString().split('T')[0] : '',
      checkOut: updated.checkoutDate ? new Date(updated.checkoutDate).toISOString().split('T')[0] : '',
      guests: (updated.adult || 0) + (updated.child || 0),
      amount: paymentData?.paid || 0,
      status: updated.bookingStatus || 'pending',
      createdAt: updated.createdAt ? new Date(updated.createdAt).toISOString().split('T')[0] : '',
      items: items // items 배열 추가
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

// 만료된 pending 예약 자동 취소 (재고 반납 포함)
const expirePendingBookings = async () => {
  const now = new Date();
  
  // 만료된 pending 예약 조회
  const expiredBookings = await Booking.find({
    bookingStatus: 'pending',
    pendingExpiresAt: { $lte: now }
  }).lean();

  if (expiredBookings.length === 0) {
    return { expiredCount: 0 };
  }

  let expiredCount = 0;
  const errors = [];

  // 각 만료된 예약에 대해 취소 처리
  for (const booking of expiredBookings) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 트랜잭션 내에서 다시 조회하여 상태 확인 (동시성 방지)
      const currentBooking = await Booking.findOne({
        _id: booking._id,
        bookingStatus: 'pending'
      }).session(session);

      if (!currentBooking) {
        // 이미 상태가 변경되었으면 스킵
        await session.abortTransaction();
        session.endSession();
        continue;
      }

      // 재고 반납 (BookingItem의 quantity만큼)
      // 날짜 계산: checkin <= date < checkout (UTC 00:00 기준 정규화)
      const dates = enumerateDates(currentBooking.checkinDate, currentBooking.checkoutDate);
      const items = await BookingItem.find({ bookingId: currentBooking._id }).session(session);
      
      // 각 item의 quantity만큼 재고 반납
      // releaseInventoryQty는 안전하게 booked = max(booked - qty, 0) 보장
      for (const item of items) {
        await releaseInventoryQty(item.roomId, dates, item.quantity, session);
      }

      // 예약 상태를 cancelled로 변경
      await Booking.findByIdAndUpdate(
        currentBooking._id,
        {
          $set: {
            bookingStatus: 'cancelled',
            cancellationReason: 'Pending booking expired'
          }
        },
        { session }
      );

      await session.commitTransaction();
      session.endSession();
      expiredCount++;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      errors.push({ bookingId: booking._id, error: error.message });
      console.error(`Failed to expire booking ${booking._id}:`, error);
    }
  }

  return {
    expiredCount,
    errors: errors.length > 0 ? errors : undefined
  };
};

// 결제 상태 변경
const updatePaymentStatus = async (bookingId, paymentStatus, userId) => {
  const user = await BusinessUser.findById(userId);
  if (!user || user.role !== 'business') {
    throw new Error("BUSINESS_NOT_FOUND");
  }

  const booking = await Booking.findOne({
    _id: bookingId,
    businessUserId: user._id
  });

  if (!booking) {
    throw new Error("BOOKING_NOT_FOUND");
  }

  // Booking 모델의 paymentStatus 업데이트
  const updates = { paymentStatus: paymentStatus };
  
  const paymentDoc = await Payment.findOne({ bookingId: bookingId });
  if (paymentDoc) {
    if (paymentStatus === 'paid') {
      paymentDoc.paid = paymentDoc.total;
    } else if (paymentStatus === 'refunded') {
      paymentDoc.paid = 0;
    }
    await paymentDoc.save();
  }

  const updated = await Booking.findByIdAndUpdate(
    bookingId,
    { $set: updates },
    { new: true, runValidators: true }
  );

    const [items, userData, paymentData] = await Promise.all([
      BookingItem.find({ bookingId: bookingId }).lean(),
      BusinessUser.findById(updated.userId).lean(),
      Payment.findOne({ bookingId: bookingId })
        .populate('paymentTypeId')
        .lean()
    ]);

    // 첫 번째 item의 room 정보로 호텔명 결정 (호환성 유지)
    let hotelName = 'Unknown';
    let roomType = 'Multiple Rooms';
    
    if (items.length > 0) {
      const firstRoomId = items[0].roomId;
      const firstRoom = await Room.findById(firstRoomId).lean();
      if (firstRoom) {
        roomType = firstRoom.roomName || firstRoom.name || 'Unknown';
        const lodging = await Lodging.findById(firstRoom.lodgingId).lean();
        hotelName = lodging?.lodgingName || 'Unknown';
      }
    }

    // 프론트엔드 요구사항에 맞게 응답 형식 변환
    return {
      id: updated._id.toString(),
      hotelName: hotelName,
      roomType: items.length > 1 ? `${items.length} rooms` : roomType,
      guestName: userData?.name || 'Unknown',
      guestEmail: userData?.email || '',
      guestPhone: userData?.phoneNumber || '',
      checkIn: updated.checkinDate ? new Date(updated.checkinDate).toISOString().split('T')[0] : '',
      checkOut: updated.checkoutDate ? new Date(updated.checkoutDate).toISOString().split('T')[0] : '',
      guests: (updated.adult || 0) + (updated.child || 0),
      amount: paymentData?.paid || 0,
      status: updated.bookingStatus || 'pending',
      createdAt: updated.createdAt ? new Date(updated.createdAt).toISOString().split('T')[0] : '',
      items: items // items 배열 추가
    };
};

module.exports = {
  createBooking,
  getBookings,
  getBookingById,
  updateBookingStatus,
  updatePaymentStatus,
  expirePendingBookings
};

