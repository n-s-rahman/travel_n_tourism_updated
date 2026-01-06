// backend/server.js (Updated for Currency Route)

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require('dotenv').config({ path: './.env' });

const connectDB = require("./config/db");

const app = express();
// PORT is already set to 5000 via process.env.PORT
const PORT = process.env.PORT || 5000; 

// Middleware
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5175', 'http://localhost:5176', 'http://localhost:3000', 'http://localhost:5174'], 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    allowedHeaders: 'Content-Type,Authorization', 
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Route Imports ---
const authRoutes = require("./routes/authRoutes");
const packageRoutes = require("./routes/packageRoutes");
const bookingRoutes = require("./routes/bookingRoutes"); 
// 🟢 NEW IMPORT: Currency Route
const currencyRoutes = require("./routes/currency.route"); 
// const { notFound, errorHandler } = require("./middleware/errorMiddleware"); // Keep commented for now
// 🟢 NEW IMPORT: Payment Route
const paymentRoutes = require("./routes/payment.routes");
const wishlistRoutes = require("./routes/wishlistRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
// Welcome route
app.get("/", (req, res) => {
    res.json({
        message: "Welcome to the Travel & Tourism API",
        status: "success",
        endpoints: {
            auth: "/api/auth",
            packages: "/api/packages",
            bookings: "/api/bookings",
            // 🟢 NEW ENDPOINT
            currency: "/api/currency",
            health: "/api/health",
        },
    });
});

// Health check route
app.get("/api/health", (req, res) => {
    const dbStatus =
        mongoose.connection.readyState === 1 ? "Connected" : "Disconnected";
    res.json({
        status: "OK",
        database: dbStatus,
        timestamp: new Date().toISOString(),
    });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/packages", packageRoutes);
app.use('/api/bookings', bookingRoutes); 
// 🟢 NEW MOUNT: Currency Route
app.use('/api/currency', currencyRoutes); 
app.use('/api/payments', paymentRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifications', notificationRoutes);
app.use("/api/wallet", require("./routes/walletRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));

// Error handling middleware (put these AFTER all routes)
// app.use(notFound);
// app.use(errorHandler);

// Start server function
const startServer = async () => {
    try {
        // Connect to MongoDB first
        await connectDB();

        // Then start Express server
        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
            console.log(`📍 API Health: http://localhost:${PORT}/api/health`);
            console.log(`🔐 Auth Routes: http://localhost:${PORT}/api/auth`);
            console.log(`📦 Package Routes: http://localhost:${PORT}/api/packages`);
            console.log(`🎫 Booking Routes: http://localhost:${PORT}/api/bookings`);
            console.log(`💵 Currency Rates: http://localhost:${PORT}/api/currency/rates`);
            console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
        });
    } catch (error) {
        console.error("❌ Failed to start server:", error);
        process.exit(1);
    }
};

// Start the application
startServer();