const mongoose = require("mongoose");

const bookingItemSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      index: true
    },
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
      index: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    }
  },
  {
    timestamps: true,
    collection: "booking_items"
  }
);

// 한 주문에서 동일 객실은 1개 item만
bookingItemSchema.index({ bookingId: 1, roomId: 1 }, { unique: true });
bookingItemSchema.index({ roomId: 1, createdAt: -1 });

module.exports = mongoose.model("BookingItem", bookingItemSchema);

