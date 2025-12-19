const Room = require("../room/model");
const RoomInventory = require("../roomInventory/model");

// 날짜 UTC 정규화 유틸 함수
const normalizeDateUTC = (date) => {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
};

// 날짜별 객실 잔여 수 조회
const getAvailabilityByDay = async (lodgingId, dateString) => {
  // 1) lodgingId 검증 및 Room 조회
  const rooms = await Room.find({ lodgingId })
    .select('_id roomName name countRoom')
    .lean();

  if (rooms.length === 0) {
    throw new Error("NO_ROOMS_FOUND");
  }

  // 2) date를 UTC 00:00 기준으로 정규화
  const normalizedDate = normalizeDateUTC(dateString);

  // 3) 해당 날짜의 RoomInventory 조회
  const roomIds = rooms.map(r => r._id);
  const inventories = await RoomInventory.find({
    roomId: { $in: roomIds },
    date: normalizedDate
  })
    .select('roomId booked capacity')
    .lean();

  // 4) Inventory를 roomId 기준으로 Map으로 변환 (빠른 조회)
  const inventoryMap = new Map();
  inventories.forEach(inv => {
    inventoryMap.set(inv.roomId.toString(), inv);
  });

  // 5) 각 Room에 대해 capacity, booked, remaining 계산
  const roomsWithAvailability = rooms.map(room => {
    const roomIdStr = room._id.toString();
    const inventory = inventoryMap.get(roomIdStr);
    
    // capacity는 room.countRoom 사용
    const capacity = room.countRoom || 1;
    
    // booked는 Inventory가 있으면 inventory.booked, 없으면 0
    const booked = inventory ? inventory.booked : 0;
    
    // remaining = max(capacity - booked, 0)
    const remaining = Math.max(capacity - booked, 0);

    return {
      roomId: room._id.toString(),
      roomName: room.roomName || room.name || 'Unknown',
      capacity,
      booked,
      remaining
    };
  });

  // 6) remaining 오름차순 정렬 (운영자 편의: 잔여 수가 적은 것부터)
  roomsWithAvailability.sort((a, b) => a.remaining - b.remaining);

  // 7) 응답 형식 구성
  return {
    date: dateString, // YYYY-MM-DD 형식 유지
    lodgingId: lodgingId.toString(),
    rooms: roomsWithAvailability
  };
};

module.exports = {
  getAvailabilityByDay,
  normalizeDateUTC
};

