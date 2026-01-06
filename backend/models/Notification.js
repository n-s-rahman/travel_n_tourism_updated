const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String, // Can store HTML content if we want to show the full email
      required: true,
    },
    type: {
      type: String,
      enum: ["INFO", "BOOKING_CONFIRMED", "PAYMENT_SUCCESS", "CANCELLATION"],
      default: "INFO",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    emailPreviewUrl: {
      type: String, // Ethereal Email Preview Link
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Notification", NotificationSchema);
