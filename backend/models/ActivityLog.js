const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    action: {
        type: String,
        required: true // e.g., 'Package Created', 'Price Updated', 'User Role Changed'
    },
    targetType: {
        type: String,
        required: true // e.g., 'Package', 'User', 'Booking'
    },
    targetId: {
        type: mongoose.Schema.Types.ObjectId,
        required: false
    },
    details: {
        type: String, // json string or just a description
        required: false
    },
    ipAddress: {
        type: String,
        required: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('ActivityLog', activityLogSchema);
