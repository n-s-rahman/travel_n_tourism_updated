import api from "./api";

export const userAPI = {
  // Get User Wishlist
  getWishlist: async () => {
    const response = await api.get("/wishlist");
    return response.data;
  },

  // Add to Wishlist
  addToWishlist: async (packageId) => {
    const response = await api.post("/wishlist/add", { packageId });
    return response.data;
  },

  // Remove from Wishlist
  removeFromWishlist: async (packageId) => {
    const response = await api.post("/wishlist/remove", { packageId });
    return response.data;
  },
};
