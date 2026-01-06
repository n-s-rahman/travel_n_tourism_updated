import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Apnar toiri kora Context theke useAuth import kora

// 'requiredRole' prop diye nirdharon kora hobe je ei route-er jonno kon role dorkar
const ProtectedRoute = ({ requiredRole }) => {
    // AuthContext theke guruttopurno data newa
    const { isAuthenticated, loading, isAdmin, isAgent } = useAuth(); 

    // 1. Loading time e kicchhu na dekhiye wait kora
    if (loading) {
        return <div>Loading user information...</div>; // Ba ekta loading spinner
    }

    // 2. User login kora ki na check kora
    if (!isAuthenticated) {
        // Login kora na thakle tader login page-e pathiye dewa
        return <Navigate to="/login" replace />;
    }

    // 3. Role check kora (requiredRole hishebe)
    
    // Jodi requiredRole 'admin' hoy, ebong user isAdmin na hoy:
    if (requiredRole === 'admin' && !isAdmin) {
        // Non-admin user-ke homepage e pathiye dewa
        return <Navigate to="/" replace />; 
    }
    
    // Jodi requiredRole 'agent' hoy, ebong user Agent (ba Admin) na hoy:
    // Note: AuthContext e 'isAgent' check kore je user 'agent' ba 'admin' ki na
    if (requiredRole === 'agent' && !isAgent) {
        // Non-agent/non-admin user-ke homepage e pathiye dewa
        return <Navigate to="/" replace />; 
    }

    // Shob check pass hole, nested components gulo ke render koro
    return <Outlet />; 
};

export default ProtectedRoute;