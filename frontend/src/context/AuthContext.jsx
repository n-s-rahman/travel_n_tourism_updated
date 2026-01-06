import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api'; // Assuming correct path

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on mount
  useEffect(() => {
    // 🛑 PORIBORTON 🛑: Shudhu 'userInfo' key check kora
    const userInfo = localStorage.getItem('userInfo'); 

    if (userInfo) {
      setUser(JSON.parse(userInfo));
    }
    setLoading(false);
  }, []);

  // Register function
  const register = async (userData) => {
    try {
      const data = await authAPI.register(userData);
      
      // 🛑 PORIBORTON 🛑: Shudhu 'userInfo' save kora
      localStorage.setItem('userInfo', JSON.stringify(data)); 
      
      setUser(data);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed',
      };
    }
  };

  // Login function
  const login = async (credentials) => {
    try {
      const data = await authAPI.login(credentials);
      
      // 🛑 PORIBORTON 🛑: Shudhu 'userInfo' save kora
      localStorage.setItem('userInfo', JSON.stringify(data)); 
      
      setUser(data);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed',
      };
    }
  };

  // Logout function
  const logout = () => {
    // 🛑 PORIBORTON 🛑: Shudhu 'userInfo' remove kora
    localStorage.removeItem('userInfo'); 
    setUser(null);
  };
    
    // Guruttopurno Helper Functions for Authorization
    const userRole = user?.role?.toLowerCase();
    const isAdmin = userRole === 'admin';
    const isAgent = userRole === 'agent' || userRole === 'admin';
    const isMasterAdmin = isAdmin && user?.email === 'admin@example.com';

  const value = {
    user, 
    loading,
    register,
    login,
    logout,
    isAdmin, // Eita Admin check korar jonno use kora hobe
    isAgent, // Eita Agent/Admin check korar jonno use kora hobe
    isMasterAdmin,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};