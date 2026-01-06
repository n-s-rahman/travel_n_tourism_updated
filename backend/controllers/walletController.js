const User = require("../models/User");
const WalletTransaction = require("../models/WalletTransaction");

// @desc    Get wallet balance and transaction history
// @route   GET /api/wallet
// @access  Private
const getWalletDetails = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Fetch fresh user data for balance
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Fetch transaction history
        const transactions = await WalletTransaction.find({ user: userId }).sort({ createdAt: -1 });

        res.status(200).json({
            balance: user.walletBalance || 0,
            transactions: transactions
        });
    } catch (error) {
        console.error("Get Wallet Details Error:", error);
        res.status(500).json({ message: "Server error fetching wallet details" });
    }
};

module.exports = {
    getWalletDetails
};
