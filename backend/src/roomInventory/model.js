const mongoose = require("mongoose");

const roomInventorySchema = new mongoose.Schema(
  {
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
      index: true
    },
    date: {
      type: Date,
      required: true
    }, // UTC 00:00:00
    capacity: {
      type: Number,
      required: true
    },
    booked: {
      type: Number,
      required: true,
      default: 0
    }
  },
  {
    timestamps: true,
    collection: "room_inventories"
  }
);

// 한 객실(roomId)의 특정 날짜(date)는 1개 문서만
roomInventorySchema.index({ roomId: 1, date: 1 }, { unique: true });
roomInventorySchema.index({ date: 1, roomId: 1 });

module.exports = mongoose.model("RoomInventory", roomInventorySchema);

