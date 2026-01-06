const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './.env' });
const User = require('./models/User');
const Package = require('./models/Package');
const ActivityLog = require('./models/ActivityLog');

const seedLogs = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB");

        const admin = await User.findOne({ role: /admin/i });
        const pkg = await Package.findOne();

        if (admin && pkg) {
            const logs = [
                {
                    user: admin._id,
                    action: 'Package Created',
                    targetType: 'Package',
                    targetId: pkg._id,
                    details: JSON.stringify({ name: pkg.name }),
                    createdAt: new Date(new Date().setDate(new Date().getDate() - 2))
                },
                {
                    user: admin._id,
                    action: 'Package Price Changed',
                    targetType: 'Package',
                    targetId: pkg._id,
                    details: JSON.stringify({ oldPrice: 1000, newPrice: pkg.price, name: pkg.name }),
                    createdAt: new Date(new Date().setDate(new Date().getDate() - 1))
                }
            ];

            await ActivityLog.insertMany(logs);
            console.log("Activity logs seeded successfully");
        } else {
            console.log("Admin or Package not found. Seed packages first.");
        }

        await mongoose.connection.close();
    } catch (err) {
        console.error(err);
    }
};

seedLogs();
