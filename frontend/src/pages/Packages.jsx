import { useState, useEffect, useCallback } from "react"; // useCallback add kora holo
import { Link, useLocation } from "react-router-dom"; // useLocation add kora holo
import Navbar from "../components/Navbar"; // Navbar / AdminLayout import korte hobe
import { packageAPI } from "../services/packageAPI"; // Path adjust kora holo
import { useCurrency } from "../context/CurrencyContext";
import { useAuth } from "../context/AuthContext"; // 🟢 1. NEW: useAuth import kora holo
import AdminLayout from "../components/AdminLayout"; // 🟢 NEW: AdminLayout-er jonno (jodi Admin view hoy)
import PackageMap from "../components/PackageMap"; // 🟢 NEW: PackageMap for location preview
import PackageCard from "../components/PackageCard"; // 🟢 Refactored PackageCard

// Packages component
const Packages = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { selectedCurrency, convertPrice, getCurrencySymbol } = useCurrency();
  const { isAgent } = useAuth(); // 🟢 Auth Context theke user role newa holo
  const location = useLocation(); // Current path check korar jonno

  // Eita check korbe je page-ti '/admin/packages' route theke asche ki na
  const isAdminView =
    location.pathname.startsWith("/admin/packages") && isAgent; // Filter states

  const [filters, setFilters] = useState({
    search: "",
    destination: "",
    type: "",
    minPrice: "",
    maxPrice: "",
    sort: "createdAt", // 🟢 NEW: Admin view hole deactivated packages o fetch korar jonno filter
    includeDeactivated: isAdminView ? true : false,
  });

  const [destinations, setDestinations] = useState([]);
  const [types, setTypes] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
  }); // Fetch filter options (Jeta public o private du-jon-i use korbe)

  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const [destData, typeData] = await Promise.all([
          packageAPI.getDestinations(),
          packageAPI.getPackageTypes(),
        ]);
        setDestinations(destData);
        setTypes(typeData);
      } catch (err) {
        console.error("Error fetching filter options:", err);
      }
    };
    fetchFilterOptions();
  }, []);

  const fetchPackages = useCallback(async (currentFilters) => {
    setLoading(true);
    setError("");
    try {
      const data = await packageAPI.getPackages(currentFilters);
      setPackages(data.packages);
      setPagination({
        page: data.page,
        pages: data.pages,
        total: data.total,
      });
    } catch (err) {
      setError(
        "Failed to load packages or exchange rates. Please ensure the backend is running and the API key is valid."
      );
      console.error("Error fetching packages:", err);
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array // Fetch packages effect

  useEffect(() => {
    // Reset page to 1 whenever filters change
    const updatedFilters = { ...filters, page: 1 };
    fetchPackages(updatedFilters);
  }, [filters, fetchPackages]);

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchPackages(filters);
  };

  const resetFilters = () => {
    setFilters({
      search: "",
      destination: "",
      type: "",
      minPrice: "",
      maxPrice: "",
      sort: "createdAt",
      includeDeactivated: isAdminView ? true : false, // Admin view-er jonno fix kora holo
    });
  };

  // 🟢 NEW: Deactivate/Management Function
  const handleDeactivate = async (packageId, packageName) => {
    if (
      window.confirm(
        `Are you sure you want to DEACTIVATE package: ${packageName}? This action can be undone by updating the package.`
      )
    ) {
      try {
        await packageAPI.deactivatePackage(packageId);
        alert(`Package "${packageName}" successfully deactivated!`);
        // Successful deactivate hole list update kora
        fetchPackages(filters);
      } catch (err) {
        setError(
          `Error deactivating package: ${err.message || "Server error"}`
        );
      }
    }
  };

  // Base Component (Shudhu UI logic)
  const PackageListComponent = (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          {isAdminView ? "🗺️ Package Management" : "Explore Travel Packages"}
        </h1>
        {isAdminView && (
          <Link
            to="/admin/packages/new"
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition font-semibold"
          >
            + Create New Package
          </Link>
        )}
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search Input */}
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search packages..."
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
            />

            {/* Destination Filter */}
            <select
              name="destination"
              value={filters.destination}
              onChange={handleFilterChange}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
            >
              <option value="">All Destinations</option>
              {destinations.map((dest) => (
                <option key={dest} value={dest}>
                  {dest}
                </option>
              ))}
            </select>

            {/* Type Filter */}
            <select
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
            >
              <option value="">All Types</option>
              {types.map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>

            {/* Sort */}
            <select
              name="sort"
              value={filters.sort}
              onChange={handleFilterChange}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
            >
              <option value="createdAt">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>

          {/* Price Range */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <input
              type="number"
              name="minPrice"
              value={filters.minPrice}
              onChange={handleFilterChange}
              placeholder={`Min Price (${selectedCurrency})`}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
            />
            <input
              type="number"
              name="maxPrice"
              value={filters.maxPrice}
              onChange={handleFilterChange}
              placeholder={`Max Price (${selectedCurrency})`}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
            />
            <button
              type="button"
              onClick={resetFilters}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition duration-200"
            >
              Reset Filters
            </button>
          </div>
        </form>
      </div>

      {/* Results Summary */}
      <div className="mb-6 flex justify-between items-center">
        <p className="text-gray-600">
          {isAdminView ? "Total" : "Found"}{" "}
          <span className="font-semibold">{pagination.total}</span> packages
        </p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-20">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Packages Grid */}
      {!loading && !error && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map((pkg) => (
              <PackageCard
                key={pkg._id}
                pkg={pkg}
                convertedPrice={convertPrice(pkg.price).toFixed(2)}
                currencySymbol={getCurrencySymbol(selectedCurrency)}
                isAdminView={isAdminView} // 🟢 Pass the management flag
                handleDeactivate={handleDeactivate} // 🟢 Pass the action handler
              />
            ))}
          </div>

          {/* No Results */}
          {packages.length === 0 && (
            <div className="text-center py-20">
              <p className="text-2xl text-gray-600 mb-4">
                😕 No packages found
              </p>
              <p className="text-gray-500 mb-6">Try adjusting your filters</p>
              <button
                onClick={resetFilters}
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-3 rounded-lg transition duration-200"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </>
      )}
    </div>
  ); // End of PackageListComponent

  // Decide which layout to use
  if (isAdminView) {
    return <AdminLayout>{PackageListComponent}</AdminLayout>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      {PackageListComponent}
    </div>
  );
};

export default Packages;


