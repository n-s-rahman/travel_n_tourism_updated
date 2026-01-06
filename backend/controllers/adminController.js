const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const { logActivity } = require('../utils/activityLogger');

// @desc    Get all users (Admin only)
// @route   GET /api/admin/users
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: "Error fetching users" });
    }
};

// @desc    Update user role (Admin only)
// @route   PUT /api/admin/users/:id/role
const updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const oldRole = user.role;
        
        // Restriction: Only one Master Admin is allowed in the system.
        if (role?.toLowerCase() === 'admin') {
            return res.status(400).json({ message: "System restriction: Only a single Master Admin account is allowed." });
        }

        user.role = role;
        await user.save();

        // Log the role change
        await logActivity(req.user.id, 'User Role Changed', 'User', user._id, {
            targetUserName: user.name,
            oldRole,
            newRole: role
        });

        res.json({ message: "User role updated successfully", user });
    } catch (error) {
        res.status(500).json({ message: "Error updating role" });
    }
};

// @desc    Get all activity logs (Admin only)
// @route   GET /api/admin/logs
const getActivityLogs = async (req, res) => {
    try {
        const logs = await ActivityLog.find({})
            .populate('user', 'name email role')
            .sort({ createdAt: -1 })
            .limit(100); // Limit to last 100 logs
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: "Error fetching activity logs" });
    }
};

module.exports = {
    getAllUsers,
    updateUserRole,
    getActivityLogs
};
