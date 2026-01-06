const express = require("express");
const router = express.Router();
const {
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
} = require("../controllers/packageController");

// Middleware: 'protect' user login check kore, 'agent' role check kore
const { protect, agent } = require("../middleware/authMiddleware"); 

// ====================================================================
// Public routes (No Auth required)
// ====================================================================

// IMPORTANT: Specific routes MUST come before parameterized routes to avoid confusion.

// GET /api/packages - Shob packages list kora (Public Listing)
router.get("/", getPackages);

// GET /api/packages/types - Shob available package types
router.get("/types", getPackageTypes);

// GET /api/packages/destinations - Shob available destination
router.get("/destinations", getDestinations);

// GET /api/packages/inventory - Capacity Monitoring (Must come before /:id)
router.get("/inventory", protect, agent, getInventory);

// GET /api/packages/image-search - Fetch images from external API
router.get("/image-search", protect, agent, searchImages);

// POST /api/packages/generate-itinerary - AI Itinerary Generation
router.post("/generate-itinerary", protect, agent, generateItinerary);

// GET /api/packages/:id - Ekta specific package details
// Eita shobar sheshe rakha holo
router.get("/:id", getPackageById); 

// ====================================================================
// Protected routes (Agent or Admin required)
// Eigulo public routes theke alada rakha holo (e.g., /admin/ packages byabohar na kore shudhu / packages byabohar kora holo)
// ====================================================================

// @route POST /api/packages
// @access Private/Agent or Admin (Create Package)
router.post("/", protect, agent, createPackage);

// @route PUT /api/packages/:id
// @access Private/Agent or Admin (Update Package)
router.put("/:id", protect, agent, updatePackage);

// @route PATCH /api/packages/deactivate/:id 
// @access Private/Agent or Admin (Deactivate/Soft Delete Package)
// PATCH method use kora shothik karon eita partial modification (available: false) korche
router.patch("/deactivate/:id", protect, agent, deactivatePackage);

// Permanently delete a package from DB (Hard Delete)
// DELETE /api/packages/:id
router.delete("/:id", protect, agent, deletePackage);

module.exports = router;