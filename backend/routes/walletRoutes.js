const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { getWalletDetails } = require("../controllers/walletController");

router.get("/", protect, getWalletDetails);

module.exports = router;
