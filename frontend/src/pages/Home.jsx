import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in">
            Explore the World with Ariba Travel
          </h1>
          <p className="text-xl md:text-2xl mb-10 text-purple-100">
            Discover amazing destinations and create unforgettable memories
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-white text-purple-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transform hover:scale-105 transition duration-200 shadow-lg"
            >
              Get Started
            </Link>
            <Link
              to="/login"
              className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white hover:text-purple-600 transform hover:scale-105 transition duration-200"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-4xl font-bold text-center mb-16 text-gray-900">
          Why Choose Ariba Travel?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Feature 1 */}
          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition duration-300">
            <div className="text-5xl mb-4">🌍</div>
            <h3 className="text-xl font-bold mb-3 text-gray-900">
              Global Destinations
            </h3>
            <p className="text-gray-600">
              Access to thousands of destinations worldwide
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition duration-300">
            <div className="text-5xl mb-4">💰</div>
            <h3 className="text-xl font-bold mb-3 text-gray-900">
              Best Prices
            </h3>
            <p className="text-gray-600">
              Competitive pricing on all travel packages
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition duration-300">
            <div className="text-5xl mb-4">🎯</div>
            <h3 className="text-xl font-bold mb-3 text-gray-900">
              Easy Booking
            </h3>
            <p className="text-gray-600">
              Simple and secure booking process
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition duration-300">
            <div className="text-5xl mb-4">⭐</div>
            <h3 className="text-xl font-bold mb-3 text-gray-900">
              24/7 Support
            </h3>
            <p className="text-gray-600">
              Round-the-clock customer support
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-purple-600 text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl mb-8 text-purple-100">
            Join thousands of travelers who trust Ariba Travel
          </p>
          <Link
            to="/register"
            className="inline-block bg-white text-purple-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transform hover:scale-105 transition duration-200 shadow-lg"
          >
            Sign Up Now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
