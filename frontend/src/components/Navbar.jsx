import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWallet } from '../context/WalletContext';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { balance } = useWallet();
  const navigate = useNavigate();

  // Helper function to check for Agent or Admin role
  const isAgentOrAdmin = user && (user.role === 'admin' || user.role === 'agent' || user.role === 'Admin' || user.role === 'Agent');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            to="/"
            className="text-2xl font-bold text-purple-600 hover:text-purple-700 transition duration-200"
          >
            ✈️ Ariba Travel
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-6">
            <Link
              to="/"
              className="text-gray-700 hover:text-purple-600 font-medium transition duration-200"
            >
              Home
            </Link>

            {/* Packages Link */}
            <Link
              to="/packages"
              className="text-gray-700 hover:text-purple-600 font-medium transition duration-200"
            >
              Packages
            </Link>

            {isAuthenticated ? (
              <>
                {/* Agent/Admin Dashboard Link */}
                {isAgentOrAdmin && (
                  <Link
                    to="/admin/dashboard"
                    title="Manage Packages"
                    className="text-gray-700 hover:text-blue-600 font-medium transition duration-200"
                  >
                    Admin Dashboard
                  </Link>
                )}

                {/* Agent/Admin Create Package Link */}
                {isAgentOrAdmin && (
                  <Link
                    to="/admin/packages/new"
                    title="Create New Package"
                    className="text-gray-700 hover:text-green-600 p-2 rounded-full font-semibold transition duration-200"
                  >
                    + Create Package
                  </Link>
                )}
                
                {/* Wallet Balance (NEW) */}
                <Link 
                  to="/wallet"
                  className="flex items-center bg-purple-50 px-3 py-1 rounded-full border border-purple-100 hidden md:flex hover:bg-purple-100 transition duration-200"
                >
                  <span className="text-xs font-semibold text-purple-700 mr-1 uppercase tracking-wider">Wallet:</span>
                  <span className="text-sm font-bold text-purple-600">${balance.toFixed(2)}</span>
                </Link>

                {/* MY BOOKINGS LINK */}
                <Link
                  to="/mybookings"
                  title="My Bookings"
                  className="text-gray-700 hover:text-purple-600 p-2 rounded-full transition duration-200"
                >
                  <span className="text-xl">📅</span>
                </Link>

                <Link
                  to="/dashboard"
                  className="text-gray-700 hover:text-purple-600 font-medium transition duration-200"
                >
                  Dashboard
                </Link>

                <span className="text-gray-600 font-medium hidden sm:inline">
                  👤 {user?.name}
                </span>

                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-lg transition duration-200 transform hover:scale-105"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-purple-600 font-medium transition duration-200"
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-2 rounded-lg transition duration-200 transform hover:scale-105"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;