const User = require("../models/User");
const Package = require("../models/Package");

// Get User Wishlist
const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("wishlist");
    res.status(200).json(user.wishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add to Wishlist
const addToWishlist = async (req, res) => {
  const { packageId } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (user.wishlist.includes(packageId)) {
      return res.status(400).json({ message: "Package already in wishlist" });
    }
    user.wishlist.push(packageId);
    await user.save();
    
    // Return the updated wishlist (populated)
    const updatedUser = await User.findById(req.user.id).populate("wishlist");
    res.status(200).json(updatedUser.wishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Remove from Wishlist
const removeFromWishlist = async (req, res) => {
  const { packageId } = req.body;
  try {
    const user = await User.findById(req.user.id);
    user.wishlist = user.wishlist.filter(
      (id) => id.toString() !== packageId
    );
    await user.save();

    // Return the updated wishlist
    const updatedUser = await User.findById(req.user.id).populate("wishlist");
    res.status(200).json(updatedUser.wishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
};
