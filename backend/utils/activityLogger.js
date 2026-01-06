const ActivityLog = require('../models/ActivityLog');

/**
 * Logs an administrative activity
 * @param {string} userId - ID of the user performing the action
 * @param {string} action - Description of the action (e.g., 'Update Package Price')
 * @param {string} targetType - Type of resource being affected
 * @param {string} targetId - ID of the resource being affected
 * @param {object|string} details - Additional details about the action
 */
const logActivity = async (userId, action, targetType, targetId = null, details = '') => {
    try {
        const detailString = typeof details === 'object' ? JSON.stringify(details) : details;
        await ActivityLog.create({
            user: userId,
            action,
            targetType,
            targetId,
            details: detailString
        });
    } catch (error) {
        console.error("Failed to log activity:", error);
    }
};

module.exports = { logActivity };
