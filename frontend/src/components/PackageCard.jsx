import { useState } from "react";
import { Link } from "react-router-dom";
import PackageMap from "./PackageMap";

const PackageCard = ({
  pkg,
  convertedPrice,
  currencySymbol,
  isAdminView,
  handleDeactivate,
}) => {
  const [showMap, setShowMap] = useState(false);

  return (
    <div
      key={pkg._id}
      className={`bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transform hover:-translate-y-2 transition duration-300 ${
        !pkg.available && isAdminView
          ? "border-4 border-red-300 opacity-70"
          : ""
      }`}
    >
      {/* Package Type Badge */}
      <div className="relative">
        <div className="h-48 bg-gray-200 flex items-center justify-center overflow-hidden">
          {pkg.images && pkg.images.length > 0 ? (
            <img 
              src={pkg.images[0]} 
              alt={pkg.name} 
              className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
              onError={(e) => {
                e.target.onerror = null;
                e.target.style.display = 'none';
                e.target.parentNode.classList.add('bg-gradient-to-br', 'from-purple-400', 'to-indigo-600');
                // Show emoji fallback
                const span = document.createElement('span');
                span.className = 'text-6xl';
                span.innerText = pkg.type === "adventure" ? "🏔️" :
                                 pkg.type === "luxury" ? "💎" :
                                 pkg.type === "relaxation" ? "🏖️" :
                                 pkg.type === "cultural" ? "🏛️" :
                                 pkg.type === "honeymoon" ? "💑" :
                                 "👨‍👩‍👧‍👦";
                e.target.parentNode.appendChild(span);
              }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-400 to-indigo-600 flex items-center justify-center">
              <span className="text-6xl">
                {pkg.type === "adventure" && "🏔️"}
                {pkg.type === "luxury" && "💎"}
                {pkg.type === "relaxation" && "🏖️"}
                {pkg.type === "cultural" && "🏛️"}
                {pkg.type === "honeymoon" && "💑"}
                {pkg.type === "family" && "👨‍👩‍👧‍👦"}
              </span>
            </div>
          )}
        </div>
        <span className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full text-sm font-semibold text-purple-600 capitalize">
          {pkg.type}
        </span>
        {/* Admin Status Tag */}
        {isAdminView && !pkg.available && (
          <span className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
            DEACTIVATED
          </span>
        )}
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{pkg.name}</h3>
        <p className="text-gray-600 mb-2 flex items-center">
          📍 {pkg.destination}
        </p>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {pkg.description}
        </p>
        {/* Details */}
        <div className="flex items-center justify-between mb-4 text-sm text-gray-600">
          <span>⏱️ {pkg.duration} days</span>
          <span className="flex items-center">
            ⭐ {pkg.rating} ({pkg.reviewsCount})
          </span>
        </div>
        {/* Mini Map Toggle Button */}
        {!isAdminView && (
          <button
            onClick={() => setShowMap(!showMap)}
            className="w-full mb-4 text-sm text-purple-600 hover:text-purple-700 font-medium border border-purple-300 py-2 rounded-lg transition"
          >
            {showMap ? "🗺️ Hide Map" : "🗺️ View Locations"}
          </button>
        )}
        {/* Mini Map Display */}
        {showMap && !isAdminView && (
          <div className="mb-4">
            <div className="h-40 rounded-lg overflow-hidden shadow-md">
              <PackageMap packageData={pkg} onlyDestination={true} />
            </div>
          </div>
        )}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-3xl font-bold text-purple-600">
              {currencySymbol}
              {convertedPrice}
            </span>
            <span className="text-gray-500 text-sm">/person</span>
          </div>
          {isAdminView ? (
            <div className="flex space-x-2">
              <Link
                to={`/admin/packages/${pkg._id}/edit`}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-lg transition duration-200 text-sm"
              >
                Edit
              </Link>
              {/* Deactivate button (Only if available) */}
              {pkg.available && (
                <button
                  onClick={() => handleDeactivate(pkg._id, pkg.name)}
                  className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-lg transition duration-200 text-sm"
                >
                  Deactivate
                </button>
              )}
              {!pkg.available && (
                <button
                  disabled
                  className="bg-gray-400 text-white font-semibold px-4 py-2 rounded-lg text-sm cursor-not-allowed"
                >
                  Deactivated
                </button>
              )}
            </div>
          ) : (
            // Public View Button
            <Link
              to={`/packages/${pkg._id}`}
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-2 rounded-lg transition duration-200"
            >
              View Details
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default PackageCard;
