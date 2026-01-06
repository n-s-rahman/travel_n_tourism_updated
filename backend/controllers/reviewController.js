const Review = require("../models/Review");
const Booking = require("../models/Booking");
const Package = require("../models/Package");

// Add a review
const addReview = async (req, res) => {
  const { rating, comment } = req.body;
  const packageId = req.params.packageId;

  try {
    // 1. Check if user has a COMPLETED booking for this package
    //    We check for status: "Completed" (or "Confirmed" if you want to allow reviewing before trip ends, 
    //    but typically reviews are for completed trips. The request said "completed travel packages").
    //    Let's stick to strict "Completed" or maybe just "Confirmed" + tripDate passed? 
    //    For simplicity, let's check if they have a booking that is NOT cancelled. 
    //    Strict requirement: "completed travel packages". So status should be 'Completed'.
    
    const booking = await Booking.findOne({
      user: req.user.id,
      package: packageId,
      status: "Completed", 
    });

    if (!booking) {
      return res.status(400).json({ 
        message: "You can only review packages you have completed." 
      });
    }

    // 2. Check if already reviewed (handled by schema index, but good to check here too)
    const existingReview = await Review.findOne({
      user: req.user.id,
      package: packageId
    });

    if (existingReview) {
      return res.status(400).json({ message: "You have already reviewed this package" });
    }

    // 3. Create Review
    const review = await Review.create({
      user: req.user.id,
      userName: req.user.name,
      package: packageId,
      rating: Number(rating),
      comment,
    });

    // 4. Update Package Rating
    const reviews = await Review.find({ package: packageId });
    const avgRating = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;
    
    const pkg = await Package.findById(packageId);
    pkg.rating = avgRating;
    pkg.reviewsCount = reviews.length;
    await pkg.save();

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get reviews for a package
const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ package: req.params.packageId }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addReview,
  getReviews,
};
