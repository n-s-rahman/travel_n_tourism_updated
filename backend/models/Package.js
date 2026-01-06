const mongoose = require("mongoose");

const packageSchema = new mongoose.Schema(
  {
    // Basic Information
    name: {
      type: String,
      required: [true, "Package name is required"],
      trim: true,
    },
    destination: {
      type: String,
      required: [true, "Destination is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    images: {
      type: [String], // Array of image URLs
      default: ["https://images.unsplash.com/photo-1469854523086-cc02fe5d8800"], // Default fallback image
    },

    // Pricing
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },

    // Package Type
    type: {
      type: String,
      enum: [
        "adventure",
        "luxury",
        "relaxation",
        "cultural",
        "honeymoon",
        "friend",
        "family",
      ],
      required: [true, "Package type is required"],
      lowercase: true,
    },

    // Duration
    duration: {
      type: Number,
      required: [true, "Duration in days is required"],
      min: [1, "Duration must be at least 1 day"],
    },

    // Dates
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    endDate: {
      type: Date,
      required: [true, "End date is required"],
    },

    // Itinerary (Day-by-day plan)
    itinerary: [
      {
        day: {
          type: Number,
          required: true,
        },
        title: {
          type: String,
          required: true,
        },
        description: {
          type: String,
          required: true,
        },
        image: {
          type: String,
        },
      },
    ],

    // What's Included
    included: [
      {
        type: String,
        trim: true,
      },
    ],

    // What's Not Included
    excluded: [
      {
        type: String,
        trim: true,
      },
    ],

    // Maximum number of people
    maxPeople: {
      type: Number,
      default: 20,
    },

    // Availability
    available: {
      type: Boolean,
      default: true,
    },
    
    // 🚩 CRITICAL: WHO CREATED THIS PACKAGE 
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Assuming your User model is named 'User'
      required: [true, 'The creator (User ID) must be provided'],
      index: true, 
    },

    // Rating
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    
    // Reviews count
    reviewsCount: {
      type: Number,
      default: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual for id
packageSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

// Ensure virtuals are included when converting to JSON
packageSchema.set("toJSON", { virtuals: true });
packageSchema.set("toObject", { virtuals: true });

const Package = mongoose.model("Package", packageSchema);

module.exports = Package;