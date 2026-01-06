import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { packageAPI } from "../services/packageAPI";
import BookingForm from "../components/BookingForm";
// 🟢 NEW IMPORT: Currency Context hook. Assumed path is correct based on your previous info.
import { useCurrency } from "../context/CurrencyContext";
// 🟢 NEW IMPORT: PackageMap component for interactive location display
import PackageMap from "../components/PackageMap";
// 🟢 NEW IMPORT: Wishlist & Reviews APIs
import { userAPI } from "../services/userAPI";
import { reviewAPI } from "../services/reviewAPI";
import { useAuth } from "../context/AuthContext";

const PackageDetail = () => {
  const { id } = useParams(); // Gets package ID from the URL
  const navigate = useNavigate();
  const [packageData, setPackageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Wishlist & Reviews State
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState("");

  const { isAuthenticated, user } = useAuth(); // Need to check if user is logged in

  // 3. Get the authentication token
  const token = localStorage.getItem("token");

  // 🟢 NEW: Get currency conversion functions and selected currency code
  const {
    selectedCurrency,
    convertPrice,
    getCurrencySymbol, // <-- New function to get the symbol
  } = useCurrency();

  useEffect(() => {
    fetchPackageDetails();
    fetchReviews();
    if(isAuthenticated) {
        checkWishlistStatus();
    }
  }, [id, isAuthenticated]);

  const fetchPackageDetails = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await packageAPI.getPackageById(id);
      setPackageData(data);
    } catch (err) {
      setError("Failed to load package details. Please try again.");
      console.error("Error fetching package:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
      try {
          const data = await reviewAPI.getReviews(id);
          setReviews(data);
      } catch (err) {
          console.error("Error fetching reviews", err);
      }
  };

  const checkWishlistStatus = async () => {
      try {
          const wishlist = await userAPI.getWishlist();
          // wishlist is array of objects (populated) or just IDs?
          // Backend userController.js: populate("wishlist")
          // So it is array of objects. We check if any object has _id === id
          const found = wishlist.find(item => item._id === id);
          setIsWishlisted(!!found);
      } catch (err) {
          console.error("Error checking wishlist", err);
      }
  };

  const toggleWishlist = async () => {
      if (!isAuthenticated) {
          alert("Please login to use Wishlist");
          navigate("/login");
          return;
      }
      try {
          if (isWishlisted) {
              await userAPI.removeFromWishlist(id);
              setIsWishlisted(false);
          } else {
              await userAPI.addToWishlist(id);
              setIsWishlisted(true);
          }
      } catch (err) {
          alert("Failed to update wishlist");
      }
  };

  const handleReviewSubmit = async (e) => {
      e.preventDefault();
      setReviewError("");
      setReviewSuccess("");
      try {
          await reviewAPI.addReview(id, newReview);
          setReviewSuccess("Review submitted successfully!");
          setNewReview({ rating: 5, comment: "" });
          fetchReviews(); // Refresh reviews
          // Refresh package details to update rating
          const data = await packageAPI.getPackageById(id);
          setPackageData(data);
      } catch (err) {
          setReviewError(err.response?.data?.message || "Failed to submit review");
      }
  };

  // NOTE: The handleBookNow function has been removed as we are using the BookingForm component directly.

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center py-20">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error || !packageData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <p className="text-2xl text-red-600 mb-4">
            😕 {error || "Package not found"}
          </p>
          <button
            onClick={() => navigate("/packages")}
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-3 rounded-lg transition duration-200"
          >
            Back to Packages
          </button>
        </div>
      </div>
    );
  }

  const pkg = packageData;

  // 🟢 NEW: Calculate converted price and get the symbol
  const convertedPrice = convertPrice(pkg.price);
  const currencySymbol = getCurrencySymbol(selectedCurrency);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate("/packages")}
          className="mb-6 text-purple-600 hover:text-purple-700 font-medium flex items-center"
        >
          ← Back to Packages
        </button>

        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="relative h-96 bg-gray-200">
             {pkg.images && pkg.images.length > 0 ? (
                 <img 
                    src={pkg.images[0]} 
                    alt={pkg.name} 
                    className="w-full h-full object-cover"
                 />
             ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-400 to-indigo-600 flex items-center justify-center">
                    <span className="text-9xl">
                    {pkg.type === "adventure" && "🏔️"}
                    {pkg.type === "luxury" && "💎"}
                    {pkg.type === "relaxation" && "🏖️"}
                    {pkg.type === "cultural" && "🏛️"}
                    {pkg.type === "honeymoon" && "💑"}
                    {pkg.type === "family" && "👨‍👩‍👧‍👦"}
                    </span>
                </div>
             )}
            
            <span className="absolute top-6 right-6 bg-white px-4 py-2 rounded-full text-lg font-semibold text-purple-600 capitalize shadow-md">
              {pkg.type}
            </span>
            {/* Wishlist Button On Header Image */}
            <button 
                onClick={toggleWishlist}
                className="absolute top-6 left-6 bg-white p-3 rounded-full text-2xl shadow-lg hover:scale-110 transition active:scale-95"
                title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
            >
                {isWishlisted ? "❤️" : "🤍"}
            </button>
          </div>
          
            {/* Photo Gallery Thumbnails */}
            {pkg.images && pkg.images.length > 1 && (
                <div className="flex gap-2 p-4 bg-gray-50 overflow-x-auto">
                    {pkg.images.map((img, index) => (
                        <div key={index} className="w-24 h-24 flex-shrink-0 cursor-pointer rounded-lg overflow-hidden border-2 border-transparent hover:border-purple-600 transition">
                            <img 
                                src={img} 
                                alt={`Gallery ${index}`} 
                                className="w-full h-full object-cover"
                                onClick={() => {
                                    // Normally we would have state to switch the main image.
                                    // For now this is valid gallery display logic.
                                    const mainImg = document.querySelector('.relative.h-96 img');
                                    if(mainImg) mainImg.src = img;
                                }}
                            />
                        </div>
                    ))}
                </div>
            )}

          <div className="p-8">
            <div className="flex justify-between items-start">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {pkg.name}
                </h1>
            </div>
            
            <div className="flex items-center gap-6 mb-6 text-gray-600">
              <span className="flex items-center text-lg">
                📍 {pkg.destination}
              </span>
              <span className="flex items-center text-lg">
                ⏱️ {pkg.duration} days
              </span>
              <span className="flex items-center text-lg">
                ⭐ {pkg.rating.toFixed(1)} ({pkg.reviewsCount} reviews)
              </span>
            </div>
            <p className="text-gray-700 text-lg leading-relaxed">
              {pkg.description}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content (Itinerary, Included & Excluded sections remain the same) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Interactive Map Section */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                🗺️ Package Locations
              </h2>
              <p className="text-gray-600 mb-4">
                Explore the destinations and attractions included in your
                itinerary:
              </p>
              <PackageMap packageData={pkg} />
            </div>

            {/* Itinerary */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                📅 Day-by-Day Itinerary
              </h2>
              <div className="space-y-6">
                {/* Ensure pkg.itinerary is an array before mapping */}
                {pkg.itinerary &&
                  pkg.itinerary.map((item) => (
                    <div
                      key={item.day}
                      className="border-l-4 border-purple-600 pl-6 py-2"
                    >
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        Day {item.day}: {item.title}
                      </h3>
                      <p className="text-gray-600">{item.description}</p>
                    </div>
                  ))}
              </div>
            </div>

            {/* Included & Excluded */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* ✅ What's Included (FIXED) */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  ✅ What's Included
                </h3>

                <ul className="space-y-2">
                  {pkg.included &&
                    pkg.included.map((item, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                </ul>
              </div>

              {/* ❌ What's Not Included (FIXED) */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  ❌ What's Not Included
                </h3>

                <ul className="space-y-2">
                  {pkg.excluded &&
                    pkg.excluded.map((item, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-red-500 mr-2">✗</span>
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                </ul>
              </div>
            </div>

            {/* REVIEWS SECTION */}
            <div className="bg-white rounded-xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                 ⭐ Customer Reviews
                </h2>
                
                {/* Review Form */}
                {isAuthenticated && (
                     <div className="mb-8 bg-gray-50 p-6 rounded-lg border border-gray-200">
                     <h3 className="text-lg font-bold mb-4">Write a Review</h3>
                     {reviewSuccess && <div className="text-green-600 mb-2">{reviewSuccess}</div>}
                     {reviewError && <div className="text-red-500 mb-2">{reviewError}</div>}
                     <form onSubmit={handleReviewSubmit}>
                         <div className="mb-4">
                             <label className="block text-gray-700 text-sm font-bold mb-2">Rating</label>
                             <div className="flex gap-4">
                                 {[1, 2, 3, 4, 5].map((star) => (
                                     <label key={star} className="flex items-center cursor-pointer">
                                         <input 
                                             type="radio" 
                                             name="rating" 
                                             value={star}
                                             checked={newReview.rating === star}
                                             onChange={() => setNewReview({...newReview, rating: star})}
                                             className="hidden"
                                         />
                                         <span className={`text-2xl ${newReview.rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
                                     </label>
                                 ))}
                             </div>
                         </div>
                         <div className="mb-4">
                             <label className="block text-gray-700 text-sm font-bold mb-2">Comment</label>
                             <textarea 
                                 className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                                 rows="3"
                                 value={newReview.comment}
                                 onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
                                 required
                             ></textarea>
                         </div>
                         <button 
                             type="submit"
                             className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                         >
                             Submit Review
                         </button>
                     </form>
                 </div>
                )}
                
                {/* Reviews List */}
                <div className="space-y-6">
                    {reviews.length === 0 ? (
                        <p className="text-gray-500 italic">No reviews yet. Be the first to review!</p>
                    ) : (
                        reviews.map((review) => (
                            <div key={review._id} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-bold text-gray-900">{review.userName || "User"}</span>
                                    <span className="text-sm text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center mb-2">
                                    {[...Array(5)].map((_, i) => (
                                        <span key={i} className={`text-lg ${i < review.rating ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
                                    ))}
                                </div>
                                <p className="text-gray-700">{review.comment}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>

          </div>

          {/* Sidebar - Booking Card (Contains Price and BookingForm) */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-4">
              <div className="mb-6">
                <p className="text-gray-600 text-sm mb-2">Price per person</p>
                <p className="text-5xl font-bold text-purple-600 mb-1">
                  {/* 🟢 FIXED: Display Converted Price with Currency Symbol */}
                  {currencySymbol}
                  {convertedPrice}
                </p>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between py-3 border-b border-gray-200">
                  <span className="text-gray-600">Duration</span>
                  <span className="font-semibold">{pkg.duration} days</span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-200">
                  <span className="text-gray-600">Start Date</span>
                  <span className="font-semibold">
                    {new Date(pkg.startDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-200">
                  <span className="text-gray-600">End Date</span>
                  <span className="font-semibold">
                    {new Date(pkg.endDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-200">
                  <span className="text-gray-600">Max Group Size</span>
                  <span className="font-semibold">{pkg.maxPeople} people</span>
                </div>
                <div className="flex justify-between py-3">
                  <span className="text-gray-600">Availability</span>
                  <span
                    className={`font-semibold ${
                      pkg.available ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {pkg.available ? "✓ Available" : "✗ Sold Out"}
                  </span>
                </div>
              </div>

              {/* 🛑 BOOKING FORM INTEGRATION START */}
              {pkg.available ? (
                // Only show the form if the package is available
                <div className="mt-6 border-t pt-6 border-gray-100">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    Book Your Trip
                  </h3>
                  <BookingForm
                    packageId={id}
                    authToken={token} // Pass the token for the API call
                  />
                </div>
              ) : (
                // Show a "Sold Out" button if not available
                <button
                  disabled={true}
                  className="w-full bg-red-500 text-white font-bold py-4 rounded-lg opacity-50 cursor-not-allowed mt-6"
                >
                  Sold Out
                </button>
              )}
              {/* 🛑 BOOKING FORM INTEGRATION END */}

              <p className="text-center text-gray-500 text-sm mt-4">
                🔒 Secure booking with instant confirmation
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackageDetail;
