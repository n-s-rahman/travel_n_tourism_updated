const mongoose = require("mongoose");

// 🛑 FIX: Changed required: true to required: false for firstName and lastName 🛑
// This allows the server to accept the booking even if the frontend doesn't supply 
// the names for the 2nd, 3rd, etc., travelers yet.
const TravelerSchema = new mongoose.Schema({
    firstName: { type: String, required: false }, // <-- Changed to false
    lastName: { type: String, required: false }, // <-- Changed to false
    dob: { type: Date, required: false }, // Date of Birth
    passportNumber: { type: String, required: false },
});

const BookingSchema = new mongoose.Schema(
  {
    package: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Package",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tripDate: {
      type: Date,
      required: true, 
    },
    numberOfPeople: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
    },
    // New fields for options and traveler details
    travelers: { // Array to hold details of all travelers
        type: [TravelerSchema], 
        required: true,
    },
    roomType: {
        type: String,
        enum: ['Single', 'Double', 'Suite', 'N/A'], // Example options
        default: 'N/A',
    },
    insurance: {
        type: Boolean,
        default: false,
    },
    // End of new fields

    totalPrice: {
        type: Number,
        required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Cancelled", "Completed"],
      default: "Pending",
    },
    // Added fields for cancellation/refund tracking
    refundAmount: {
      type: Number,
      default: 0,
    },
    cancellationDate: {
      type: Date,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// Check if model exists before compiling
module.exports = mongoose.models.Booking || mongoose.model("Booking", BookingSchema);