import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import PackageCard from "../components/PackageCard";
import { userAPI } from "../services/userAPI";
import { useCurrency } from "../context/CurrencyContext";

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { selectedCurrency, convertPrice, getCurrencySymbol } = useCurrency();

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    setLoading(true);
    try {
      const data = await userAPI.getWishlist();
      setWishlist(data);
    } catch (err) {
      setError("Failed to load wishlist");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (packageId, packageName) => {
      // Optimistic update or wait?
      // userAPI.removeFromWishlist returns the updated list.
    try {
      if(window.confirm(`Remove ${packageName} from wishlist?`)) {
          const updatedList = await userAPI.removeFromWishlist(packageId);
          setWishlist(updatedList);
      }
    } catch (err) {
      alert("Failed to remove item");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">My Wishlist ❤️</h1>

        {loading && (
          <div className="flex justify-center py-20">
            <div className="animate-spin h-10 w-10 border-4 border-purple-600 rounded-full border-t-transparent"></div>
          </div>
        )}

        {error && <div className="text-red-600 mb-4">{error}</div>}

        {!loading && wishlist.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            <p className="text-xl mb-4">Your wishlist is empty.</p>
            <p>Go explore packages and save your favorites!</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlist.map((pkg) => (
            <div key={pkg._id} className="relative">
                <PackageCard
                pkg={pkg}
                convertedPrice={convertPrice(pkg.price).toFixed(2)}
                currencySymbol={getCurrencySymbol(selectedCurrency)}
                isAdminView={false}
                />
                {/* Remove Button Overlay */}
                <button
                    onClick={() => handleRemove(pkg._id, pkg.name)}
                    className="absolute top-4 right-4 bg-white/90 p-2 rounded-full shadow-md text-red-500 hover:text-red-700 hover:bg-white transition"
                    title="Remove from Wishlist"
                >
                    ❌
                </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Wishlist;
