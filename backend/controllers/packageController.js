const Package = require("../models/Package");
const Booking = require("../models/Booking");
const { logActivity } = require("../utils/activityLogger");

// 1. Get all packages
const getPackages = async (req, res) => {
    try {
        const {
            destination, type, minPrice, maxPrice,
            startDate, endDate, search, sort = "createdAt",
            page = 1, limit = 10,
        } = req.query;

        const query = {};
        if (req.query.showAll !== "true" || !req.user || (req.user.role.toLowerCase() !== "admin" && req.user.role.toLowerCase() !== "agent")) {
            query.available = true; // Default: Only show available packages to public
        }

        if (destination) query.destination = { $regex: destination, $options: "i" };
        if (type) query.type = type.toLowerCase();
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }
        if (startDate) query.startDate = { $gte: new Date(startDate) };
        if (endDate) query.endDate = { $lte: new Date(endDate) };

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
                { destination: { $regex: search, $options: "i" } },
            ];
        }

        let sortOption = {};
        switch (sort) {
            case "price-low": sortOption = { price: 1 }; break;
            case "price-high": sortOption = { price: -1 }; break;
            case "rating": sortOption = { rating: -1 }; break;
            case "popular": sortOption = { reviewsCount: -1 }; break;
            default: sortOption = { createdAt: -1 };
        }

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        const packages = await Package.find(query).sort(sortOption).limit(limitNum).skip(skip);
        const total = await Package.countDocuments(query);

        res.json({
            packages,
            page: pageNum,
            pages: Math.ceil(total / limitNum),
            total,
        });
    } catch (error) {
        res.status(500).json({ message: "Server error while fetching packages" });
    }
};

// 2. Get single package
const getPackageById = async (req, res) => {
    try {
        const package = await Package.findById(req.params.id);
        if (!package) return res.status(404).json({ message: "Package not found" });
        res.json(package);
    } catch (error) {
        if (error.kind === "ObjectId") return res.status(404).json({ message: "Package not found" });
        res.status(500).json({ message: "Server error" });
    }
};

// 3. Create Package
const createPackage = async (req, res) => {
    try {
        const { name, price, duration, maxPeople, destination, type, startDate, endDate, included, excluded, itinerary, category } = req.body;

        if (!name || !price || !duration || !maxPeople || !destination) {
            return res.status(400).json({ message: "Please include required fields." });
        }

        const package = await Package.create({
            ...req.body,
            createdBy: req.user.id,
            available: true
        });

        // Log activity
        await logActivity(req.user.id, 'Package Created', 'Package', package._id, { name: package.name });

        res.status(201).json({ message: "Package created successfully!", package });
    } catch (error) {
        console.error("Package Creation Error:", error);
        res.status(400).json({ 
            message: "Validation failed", 
            details: error.errors ? Object.values(error.errors).map(err => err.message).join(', ') : error.message 
        });
    }
};

// 4. Update Package
const updatePackage = async (req, res) => {
    try {
        const packageToUpdate = await Package.findById(req.params.id);
        if (!packageToUpdate) return res.status(404).json({ message: "Package not found" });

        const isCreator = packageToUpdate.createdBy.toString() === req.user.id.toString();
        if (req.user.role !== 'admin' && !isCreator) {
            return res.status(403).json({ message: "Not authorized." });
        }

        // Check if price changed for logging
        const oldPrice = packageToUpdate.price;
        const newPrice = req.body.price;

        const updatedPackage = await Package.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        
        let action = 'Package Updated';
        let details = {};
        if (newPrice && Number(oldPrice) !== Number(newPrice)) {
            action = 'Package Price Changed';
            details = { oldPrice, newPrice, name: updatedPackage.name };
        } else {
            details = { name: updatedPackage.name };
        }

        // Log activity
        await logActivity(req.user.id, action, 'Package', updatedPackage._id, details);

        res.json({ message: "Updated successfully!", package: updatedPackage });
    } catch (error) {
        console.error("Update error:", error);
        res.status(400).json({ 
            message: "Update validation failed", 
            details: error.errors ? Object.values(error.errors).map(err => err.message).join(', ') : error.message 
        });
    }
};

// 5. Deactivate (Soft Delete)
const deactivatePackage = async (req, res) => {
    try {
        const pkg = await Package.findById(req.params.id);
        if (!pkg) return res.status(404).json({ message: "Package not found" });
        
        pkg.available = !pkg.available;
        await pkg.save();
        
        const action = pkg.available ? 'Package Activated' : 'Package Deactivated';
        await logActivity(req.user.id, action, 'Package', pkg._id, { name: pkg.name });

        res.json({ message: `Package ${pkg.available ? 'activated' : 'deactivated'} successfully!`, package: pkg });
    } catch (error) {
        res.status(500).json({ message: "Error updating package status" });
    }
};

const deletePackage = async (req, res) => {
    try {
        const cleanId = req.params.id.trim();
        const pkg = await Package.findById(cleanId);
        if (!pkg) {
            return res.status(404).json({ message: "Package not found" });
        }
        
        const packageName = pkg.name;
        await Package.findByIdAndDelete(cleanId);
        
        await logActivity(req.user.id, 'Package Deleted Permanently', 'Package', cleanId, { name: packageName });

        res.status(200).json({ message: "Package deleted permanently from database" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting package", error: error.message });
    }
};

// 6. services routes
const getPackageTypes = async (req, res) => {
    try {
        const types = await Package.distinct("type");
        res.json(types);
    } catch (error) {
        res.status(500).json({ message: "Error fetching types" });
    }
};

const getDestinations = async (req, res) => {
    try {
        const destinations = await Package.distinct("destination");
        res.json(destinations);
    } catch (error) {
        res.status(500).json({ message: "Error fetching destinations" });
    }
};

// 7. Get Inventory (Capacity Monitoring)
const getInventory = async (req, res) => {
    try {
        const packages = await Package.find({}).select('name destination startDate endDate maxPeople available');
        const inventory = await Promise.all(packages.map(async (pkg) => {
            const bookings = await Booking.find({ 
                package: pkg._id, 
                status: { $in: ["Confirmed", "Pending"] } 
            });
            const bookedCount = bookings.reduce((sum, b) => sum + (b.numberOfPeople || 0), 0);
            return {
                _id: pkg._id,
                name: pkg.name,
                destination: pkg.destination,
                startDate: pkg.startDate,
                endDate: pkg.endDate,
                maxPeople: pkg.maxPeople,
                bookedCount,
                remainingCapacity: Math.max(0, pkg.maxPeople - bookedCount),
                available: pkg.available
            };
        }));
        res.json(inventory);
    } catch (error) {
        res.status(500).json({ message: "Error fetching inventory" });
    }
};

// 8. AI Itinerary Generation
const generateItinerary = async (req, res) => {
    try {
        const { destination, duration, type } = req.body;
        if (!destination || !duration) {
            return res.status(400).json({ message: "Destination and duration are required" });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            // Mock response if no API key
            const mockItinerary = Array.from({ length: duration }, (_, i) => ({
                day: i + 1,
                title: `Exploring ${destination} - Part ${i + 1}`,
                description: `Visit the famous landmarks of ${destination} and enjoy local ${type || 'cultural'} activities.`
            }));
            return res.json(mockItinerary);
        }

        const { GoogleGenerativeAI } = require("@google/generative-ai");
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); 

        const prompt = `Create a detailed travel itinerary for a ${duration}-day ${type || ""} trip to ${destination}. 
        Return ONLY a JSON array of objects, each with "day" (number), "title" (string), "description" (string), and "imageQuery" (a short 2-3 word search query for a photo). 
        Format example: [{"day": 1, "title": "Arrival", "description": "...", "imageQuery": "Kyoto Airport"}]`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        const jsonMatch = text.match(/\[.*\]/s);
        const jsonStr = jsonMatch ? jsonMatch[0] : text;
        const baseItinerary = JSON.parse(jsonStr);

        // Fetch actual images for each day from Pexels
        const axios = require("axios");
        const PEXELS_API_KEY = process.env.PEXELS_API_KEY;

        const itineraryWithImages = await Promise.all(baseItinerary.map(async (item) => {
            let imageUrl = "";
            const searchQuery = item.imageQuery || item.title || destination;
            
            if (PEXELS_API_KEY) {
                try {
                    const imgRes = await axios.get(`https://api.pexels.com/v1/search`, {
                        params: { 
                            query: searchQuery, 
                            per_page: 1,
                            orientation: 'landscape'
                        },
                        headers: { Authorization: PEXELS_API_KEY },
                        timeout: 5000
                    });
                    if (imgRes.data.photos && imgRes.data.photos.length > 0) {
                        imageUrl = imgRes.data.photos[0].src.large2x || imgRes.data.photos[0].src.original;
                    }
                } catch (e) {
                    console.error(`Pexels Itinerary Error (Day ${item.day}):`, e.response?.status === 401 ? "Unauthorized Key" : e.message);
                }
            }

            // Universal fallback if Pexels fails
            if (!imageUrl) {
                const tags = searchQuery.toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ',');
                imageUrl = `https://loremflickr.com/800/600/${encodeURIComponent(tags || 'travel')}?lock=${item.day}`;
            }

            return {
                day: item.day,
                title: item.title,
                description: item.description,
                image: imageUrl
            };
        }));

        res.json(itineraryWithImages);
    } catch (error) {
        console.error("AI Generation Error:", error);
        res.status(500).json({ message: "Failed to generate itinerary with AI" });
    }
};

// 9. Image Search
const searchImages = async (req, res) => {
    const { query } = req.query;
    if (!query) return res.status(400).json({ message: "Query is required" });

    const axios = require("axios");
    const PEXELS_API_KEY = process.env.PEXELS_API_KEY;

    // Helper for fallbacks
    const getFallbacks = (q) => [
        `https://loremflickr.com/800/600/${encodeURIComponent(q)},travel?lock=1`,
        `https://loremflickr.com/800/600/${encodeURIComponent(q)},nature?lock=2`,
        `https://loremflickr.com/800/600/${encodeURIComponent(q)},landmark?lock=3`,
        `https://loremflickr.com/800/600/${encodeURIComponent(q)},city?lock=4`,
        `https://loremflickr.com/800/600/${encodeURIComponent(q)},adventure?lock=5`,
        `https://loremflickr.com/800/600/${encodeURIComponent(q)},vacation?lock=6`,
    ];

    try {
        if (!PEXELS_API_KEY) return res.json(getFallbacks(query));

        const response = await axios.get(`https://api.pexels.com/v1/search`, {
            params: { query, per_page: 12, orientation: 'landscape' },
            headers: { Authorization: PEXELS_API_KEY },
            timeout: 5000
        });

        if (response.data.photos.length === 0) return res.json(getFallbacks(query));
        
        const images = response.data.photos.map(p => p.src.large2x || p.src.original);
        res.json(images);
    } catch (error) {
        console.error("Pexels Search Error:", error.response?.status === 401 ? "Unauthorized API Key" : error.message);
        res.json(getFallbacks(query));
    }
};

module.exports = {
    getPackages,
    getPackageById,
    createPackage,
    updatePackage,
    deactivatePackage,
    deletePackage,
    getPackageTypes,
    getDestinations,
    getInventory,
    generateItinerary,
    searchImages,
};