const express = require('express');
const router = express.Router();
const { addReview, getReviews } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

router.route('/:packageId').get(getReviews).post(protect, addReview);

module.exports = router;
