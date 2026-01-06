const mongoose = require('mongoose');
const User = require('./models/User');
const Package = require('./models/Package');
const Booking = require('./models/Booking');
const dotenv = require('dotenv');

dotenv.config({ path: './.env' });

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/travel_and_tourism_group_2";

const seedData = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB");

        // Find or create admin
        let admin = await User.findOne({ role: /admin/i });
        if (!admin) {
            admin = await User.create({
                name: 'Admin User',
                email: 'admin@example.com',
                password: 'password123',
                role: 'admin'
            });
        }

        // Find or create a user
        let user = await User.findOne({ role: 'user' });
        if (!user) {
            user = await User.create({
                name: 'Jane Doe',
                email: 'jane@example.com',
                password: 'password123',
                role: 'user',
                walletBalance: 10000
            });
        }

        // Find or create a package
        let pkg = await Package.findOne();
        if (!pkg) {
            pkg = await Package.create({
                name: 'Bali Adventure',
                destination: 'Bali, Indonesia',
                description: 'Tropical getaway',
                price: 1500,
                type: 'adventure',
                duration: 7,
                startDate: new Date(),
                endDate: new Date(new Date().setDate(new Date().getDate() + 30)),
                createdBy: admin._id,
                maxPeople: 20
            });
        }

        let pkg2 = await Package.findOne({ name: 'Parisian Romance' });
        if (!pkg2) {
            pkg2 = await Package.create({
                name: 'Parisian Romance',
                destination: 'Paris, France',
                description: 'City of lights',
                price: 2500,
                type: 'luxury',
                duration: 5,
                startDate: new Date(),
                endDate: new Date(new Date().setDate(new Date().getDate() + 30)),
                createdBy: admin._id,
                maxPeople: 15
            });
        }

        // Create bookings
        const bookings = [
            {
                package: pkg._id,
                user: user._id,
                tripDate: new Date(),
                numberOfPeople: 2,
                totalPrice: 3000,
                status: 'Confirmed',
                createdAt: new Date(new Date().setDate(new Date().getDate() - 5)),
                travelers: [{ firstName: 'Jane', lastName: 'Doe' }, { firstName: 'John', lastName: 'Smith' }]
            },
            {
                package: pkg._id,
                user: user._id,
                tripDate: new Date(),
                numberOfPeople: 1,
                totalPrice: 1500,
                status: 'Confirmed',
                createdAt: new Date(new Date().setDate(new Date().getDate() - 2)),
                travelers: [{ firstName: 'Alice', lastName: 'Brown' }]
            },
            {
                package: pkg2._id,
                user: user._id,
                tripDate: new Date(),
                numberOfPeople: 2,
                totalPrice: 5000,
                status: 'Confirmed',
                createdAt: new Date(new Date().setDate(new Date().getDate() - 10)),
                travelers: [{ firstName: 'Jane', lastName: 'Doe' }, { firstName: 'Bob', lastName: 'White' }]
            },
            {
                package: pkg2._id,
                user: user._id,
                tripDate: new Date(),
                numberOfPeople: 3,
                totalPrice: 7500,
                status: 'Completed',
                createdAt: new Date(new Date().setDate(new Date().getDate() - 15)),
                travelers: [{ firstName: 'X', lastName: 'Y' }, { firstName: 'A', lastName: 'B' }, { firstName: 'C', lastName: 'D' }]
            }
        ];

        await Booking.insertMany(bookings);
        console.log("Seed data inserted successfully");

        await mongoose.connection.close();
    } catch (err) {
        console.error("Error seeding data:", err);
        process.exit(1);
    }
};

seedData();
