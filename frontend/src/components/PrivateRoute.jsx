// --- frontend/src/components/PrivateRoute.jsx ---
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import React from 'react'; // Ensure React is imported if you use JSX fragments or the Navigate component

// PrivateRoute component now accepts requiredRoles as a prop
const PrivateRoute = ({ children, requiredRoles }) => {
  // We assume useAuth returns: { isAuthenticated: boolean, loading: boolean, user: { role: string, ... } }
  const { isAuthenticated, loading, user } = useAuth(); // 🛑 ASSUMPTION: 'user' is now returned by useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600 text-lg font-medium">Loading...</p>
      </div>
    );
  }
  
  // 1. Authentication Check: Redirect to login if not logged in
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 2. Authorization Check (New Logic)
  // Check if roles are required AND if the user's role is NOT included in the list
  if (requiredRoles && Array.isArray(requiredRoles) && requiredRoles.length > 0) {
    const userRole = user?.role; // Safely access the user's role
    
    // Check if the user's role is NOT in the list of required roles
    if (!userRole || !requiredRoles.includes(userRole)) {
        // Role check failed: Show an unauthorized message (403 Forbidden equivalent)
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
                <h2 className="text-4xl font-bold text-red-600 mb-3">Access Denied (403)</h2>
                <p className="text-lg text-gray-700">You do not have the required permissions to view this page.</p>
                <p className="text-md text-gray-500 mt-1">Your Role: {userRole || 'Guest'}</p>
                <button 
                    className="mt-6 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition"
                    onClick={() => <Navigate to="/" replace />} // Redirect back home
                >
                    Go to Homepage
                </button>
            </div>
        );
    }
  }

  // If both authentication and authorization checks pass, render the child component
  return children;
};

export default PrivateRoute;