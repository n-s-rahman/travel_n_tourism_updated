import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Context Providers
import { AuthProvider } from './context/AuthContext'; 
import { CurrencyProvider } from './context/CurrencyContext'; 
import { WalletProvider } from './context/WalletContext'; 

// Components and Utilities
import ProtectedRoute from './components/ProtectedRoute';

// ====================================================================
// Page Components
// ====================================================================

// Public Pages
import Home from './pages/Home';
import Packages from './pages/Packages'; // DUAL USE: Public List & Admin List
import PackageDetail from './pages/PackageDetail';
import Login from './pages/Login';
import Register from './pages/Register';

// Private Pages (User)
import Dashboard from './pages/Dashboard'; 
import MyBookings from './pages/MyBookings'; 
import Wishlist from './pages/Wishlist';
import NotificationCenter from './pages/NotificationCenter';
import WalletPage from './pages/WalletPage';

// 🟢 2. IMPORT ADMIN/AGENT PAGES
import AdminDashboard from './pages/AdminDashboard'; 
import AgentDashboardScreen from './pages/AgentDashboardScreen'; 
 
import CreatePackagePage from './pages/CreatePackagePage'; 
import EditPackagePage from './pages/EditPackagePage'; 
import InventoryPage from './pages/InventoryPage'; 
import AdminBookingsPage from './pages/AdminBookingsPage'; 
import SalesReportPage from './pages/SalesReportPage'; 
import AgentManagementPage from './pages/AgentManagementPage'; 
import ActivityLogPage from './pages/ActivityLogPage'; 

function App() {
  return (
    <CurrencyProvider> 
      <AuthProvider> 
        <WalletProvider>
          <Router>
            <Routes>
  
              {/* ==================================================================== */}
              {/* 1. PUBLIC ROUTES */}
              {/* ==================================================================== */}
              <Route path="/" element={<Home />} />
              <Route path="/packages" element={<Packages />} />
              <Route path="/packages/:id" element={<PackageDetail />} /> 
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* ==================================================================== */}
              {/* 2. PROTECTED USER ROUTES */}
              <Route element={<ProtectedRoute requiredRole="user" />}>
                <Route path="/dashboard" element={<Dashboard />} /> 
                <Route path="/mybookings" element={<MyBookings />} />
                <Route path="/wishlist" element={<Wishlist />} />
                <Route path="/notifications" element={<NotificationCenter />} />
                <Route path="/wallet" element={<WalletPage />} />
              </Route>
  
              {/* ==================================================================== */}
              {/* 3. PROTECTED ADMIN/AGENT ROUTES */}
              {/* 'admin' and 'agent' dujon-er jonno access allowed */}
              <Route element={<ProtectedRoute requiredRole="agent" />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} /> 
                
                {/* Package List (Using the main Packages component with isAdmin prop) */}
                <Route path="/admin/packages" element={<Packages isAdmin={true} />} />
                
                <Route path="/admin/packages/new" element={<CreatePackagePage />} />
                <Route path="/admin/packages/:id/edit" element={<EditPackagePage />} />
                <Route path="/admin/inventory" element={<InventoryPage />} />
                <Route path="/admin/bookings" element={<AdminBookingsPage />} />
                <Route path="/admin/reports" element={<SalesReportPage />} />
                <Route path="/admin/users" element={<AgentManagementPage />} />
                <Route path="/admin/logs" element={<ActivityLogPage />} />
              </Route>
              
            </Routes>
          </Router>
        </WalletProvider>
      </AuthProvider>
    </CurrencyProvider>
  );
}

export default App;