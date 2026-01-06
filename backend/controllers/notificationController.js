const Notification = require("../models/Notification");

// Get all notifications for user
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id })
                                            .sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark notification as read
const markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);
        if (notification && notification.user.toString() === req.user.id) {
            notification.isRead = true;
            await notification.save();
            res.json(notification);
        } else {
            res.status(404).json({ message: "Notification not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// Internal function to create notification (to be used by other controllers)
const createNotification = async (userId, title, message, type, emailUrl = null) => {
    try {
        await Notification.create({
            user: userId,
            title,
            message,
            type,
            emailPreviewUrl: emailUrl
        });
    } catch (error) {
        console.error("Failed to create in-app notification:", error);
    }
}

module.exports = { getNotifications, markAsRead, createNotification };
