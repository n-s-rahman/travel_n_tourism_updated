import api from "./api";

export const reviewAPI = {
  // Get Reviews for a package
  getReviews: async (packageId) => {
    const response = await api.get(`/reviews/${packageId}`);
    return response.data;
  },

  // Add Review
  addReview: async (packageId, reviewData) => {
    // reviewData: { rating, comment }
    const response = await api.post(`/reviews/${packageId}`, reviewData);
    return response.data;
  },
};
