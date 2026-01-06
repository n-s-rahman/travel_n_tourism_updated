import api from "./api";

export const packageAPI = {
  // ====================================================================
  // Public Access APIs (GET)
  // ====================================================================

  // Get all packages with filters
  getPackages: async (filters = {}) => {
    const params = new URLSearchParams();

    if (filters.destination) params.append("destination", filters.destination);
    if (filters.type) params.append("type", filters.type);
    if (filters.minPrice) params.append("minPrice", filters.minPrice);
    if (filters.maxPrice) params.append("maxPrice", filters.maxPrice);
    if (filters.startDate) params.append("startDate", filters.startDate);
    if (filters.endDate) params.append("endDate", filters.endDate);
    if (filters.search) params.append("search", filters.search);
    if (filters.sort) params.append("sort", filters.sort);
    if (filters.page) params.append("page", filters.page);
    if (filters.limit) params.append("limit", filters.limit);

    const response = await api.get(`/packages?${params.toString()}`);
    return response.data;
  },

  // Get single package by ID
  getPackageById: async (id) => {
    const response = await api.get(`/packages/${id}`);
    return response.data;
  },

  // Get package types for filter dropdown
  getPackageTypes: async () => {
    const response = await api.get("/packages/types");
    return response.data;
  },

  // Get destinations for filter dropdown
  getDestinations: async () => {
    const response = await api.get("/packages/destinations");
    return response.data;
  },

  // ====================================================================
  // Private Access APIs (Admin/Agent Management)
  // Note: 'api' byabohar korar jonno token automatic add hobe.
  // ====================================================================

  // @route POST /api/packages
  createPackage: async (packageData) => {
    try {
        const response = await api.post("/packages", packageData);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || "Failed to create package";
    }
  },

  // @route PUT /api/packages/:id
  updatePackage: async (packageId, updateData) => {
    try {
        const response = await api.put(`/packages/${packageId}`, updateData);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || "Failed to update package";
    }
  },

  // @route PATCH /api/packages/deactivate/:id 
  deactivatePackage: async (packageId) => {
    try {
        const response = await api.patch(`/packages/deactivate/${packageId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || "Failed to deactivate package";
    }
  },

  // Search images from external API
  searchImages: async (query) => {
    try {
        const response = await api.get(`/packages/image-search?query=${encodeURIComponent(query)}`);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || "Failed to search images";
    }
  },

  // Generate itinerary with Gemini AI
  generateItinerary: async (data) => {
    try {
        const response = await api.post("/packages/generate-itinerary", data);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || "Failed to generate AI itinerary";
    }
  },
};