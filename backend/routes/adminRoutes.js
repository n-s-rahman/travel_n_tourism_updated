const express = require('express');
const router = express.Router();
const { 
    getAllUsers, 
    updateUserRole, 
    getActivityLogs 
} = require('../controllers/adminController');
const { protect, masterAdmin } = require('../middleware/authMiddleware');

// @route   GET /api/admin/users
router.get('/users', protect, masterAdmin, getAllUsers);

// @route   PUT /api/admin/users/:id/role
router.put('/users/:id/role', protect, masterAdmin, updateUserRole);

// @route   GET /api/admin/logs
router.get('/logs', protect, masterAdmin, getActivityLogs);

module.exports = router;
