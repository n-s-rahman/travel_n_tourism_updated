import { useAuth } from '../context/AuthContext';
import { useWallet } from '../context/WalletContext'; 
import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const { balance } = useWallet();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Welcome to Your Dashboard
          </h1>
          <p className="text-xl text-gray-600">
            Hello, {user?.name}! 👋
          </p>
        </div>
        
        {/* Wallet Balance Card */}
        <div className="max-w-md mx-auto bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl shadow-lg p-6 mb-12 text-white flex justify-between items-center transform hover:scale-105 transition duration-300">
            <div>
                <p className="text-sm opacity-80 mb-1">Total Balance</p>
                <h2 className="text-4xl font-bold">${balance.toFixed(2)}</h2>
            </div>
            <div className="text-5xl">💰</div>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Card 1: My Bookings - NOW A LINK */}
          {/* We wrap the entire card content in a Link for better UX */}
          <Link to="/mybookings" className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transform hover:-translate-y-2 transition duration-300">
            <div className="text-5xl mb-4">🎫</div> {/* Changed emoji for trip/ticket */}
            <h3 className="text-xl font-bold mb-2 text-gray-900">My Bookings</h3>
            <p className="text-gray-600 mb-4">View and manage your upcoming and past trips.</p>
            <div className="w-full text-center bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200">
              View & Cancel Bookings
            </div>
          </Link>

          {/* Card 2: Search Packages - NOW A LINK (Best Practice) */}
          <Link to="/packages" className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transform hover:-translate-y-2 transition duration-300">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-xl font-bold mb-2 text-gray-900">Search Packages</h3>
            <p className="text-gray-600 mb-4">Find your next adventure</p>
            <div className="w-full text-center bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200">
              Browse Packages
            </div>
          </Link>

          {/* Card 3: Profile Settings - NOW A LINK (Assuming /profile route) */}
          <Link to="/profile" className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transform hover:-translate-y-2 transition duration-300">
            <div className="text-5xl mb-4">👤</div>
            <h3 className="text-xl font-bold mb-2 text-gray-900">Profile Settings</h3>
            <p className="text-gray-600 mb-4">Update your information</p>
            <div className="w-full text-center bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200">
              Edit Profile
            </div>
          </Link>

          {/* Card 4: Wishlist */}
          <Link to="/wishlist" className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transform hover:-translate-y-2 transition duration-300">
            <div className="text-5xl mb-4">❤️</div>
            <h3 className="text-xl font-bold mb-2 text-gray-900">My Wishlist</h3>
            <p className="text-gray-600 mb-4">View your saved packages</p>
            <div className="w-full text-center bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200">
              Go to Wishlist
            </div>
          </Link>

          {/* Card 5: Payment Methods - Now Wallet History */}
          <Link to="/wallet" className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transform hover:-translate-y-2 transition duration-300">
            <div className="text-5xl mb-4">💳</div>
            <h3 className="text-xl font-bold mb-2 text-gray-900">Wallet & History</h3>
            <p className="text-gray-600 mb-4">View transaction history</p>
            <div className="w-full text-center bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200">
              View History
            </div>
          </Link>

          {/* Card 6: Notification Center (Mail) */}
          <Link to="/notifications" className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transform hover:-translate-y-2 transition duration-300">
             <div className="text-5xl mb-4">📬</div>
             <h3 className="text-xl font-bold mb-2 text-gray-900">My Mail</h3>
             <p className="text-gray-600 mb-4">View notifications and receipts</p>
             <div className="w-full text-center bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200">
               Check Mail
             </div>
          </Link>
        </div>

        {/* Account Information */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h3 className="text-2xl font-bold mb-6 text-gray-900">
            Account Information
          </h3>

          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <span className="font-semibold text-gray-700">Name:</span>
              <span className="text-gray-900">{user?.name}</span>
            </div>

            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <span className="font-semibold text-gray-700">Email:</span>
              <span className="text-gray-900">{user?.email}</span>
            </div>

            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <span className="font-semibold text-gray-700">Role:</span>
              <span className="inline-block bg-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                {user?.role}
              </span>
            </div>
            
             <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <span className="font-semibold text-gray-700">Wallet Balance:</span>
              <span className="text-green-600 font-bold">${balance.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;