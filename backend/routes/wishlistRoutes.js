const express = require('express');
const router = express.Router();
const { getWishlist, addToWishlist, removeFromWishlist } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware'); // Assuming this exists

router.get('/', protect, getWishlist);
router.post('/add', protect, addToWishlist);
router.post('/remove', protect, removeFromWishlist);

module.exports = router;
