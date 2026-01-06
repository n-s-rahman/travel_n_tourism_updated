import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminLayout = ({ children }) => {
    const { logout, user, isMasterAdmin } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navLinks = [
        { name: 'Dashboard', path: '/admin/dashboard', icon: '📊' },
        { name: 'Inventory', path: '/admin/inventory', icon: '📦' },
        { name: 'Bookings', path: '/admin/bookings', icon: '🔖' },
        { name: 'Reports', path: '/admin/reports', icon: '📈' },
        // Only Master Admin can see these
        ...(isMasterAdmin ? [
            { name: 'Agents', path: '/admin/users', icon: '👥' },
            { name: 'Activity Log', path: '/admin/logs', icon: '📜' }
        ] : []),
        { name: 'Create Package', path: '/admin/packages/new', icon: '✨' },
    ];

    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            {/* Sidebar */}
            <aside className="w-72 bg-gradient-to-b from-indigo-900 to-purple-900 text-white shadow-2xl hidden md:flex flex-col">
                <div className="p-8 border-b border-indigo-800">
                    <h2 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-200">
                        Admin Panel
                    </h2>
                    <p className="text-indigo-300 text-xs mt-1 uppercase font-bold tracking-widest">Admin Control</p>
                </div>
                
                <nav className="mt-8 flex-1 px-4 space-y-2">
                    {navLinks.map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={`flex items-center p-4 rounded-xl transition-all duration-300 group ${
                                location.pathname === link.path 
                                ? 'bg-white bg-opacity-10 text-white shadow-inner' 
                                : 'hover:bg-white hover:bg-opacity-5 text-indigo-100'
                            }`}
                        >
                            <span className="text-xl mr-4 group-hover:scale-125 transition-transform">{link.icon}</span>
                            <span className="font-semibold">{link.name}</span>
                        </Link>
                    ))}
                </nav>

                <div className="p-6 border-t border-indigo-800">
                    <div className="flex items-center gap-4 mb-6 px-2">
                        <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-white shadow-lg">
                            {user?.name?.charAt(0) || 'A'}
                        </div>
                        <div>
                            <p className="text-sm font-bold text-white truncate w-32">{user?.name}</p>
                            <p className="text-xs text-indigo-300">{user?.role}</p>
                        </div>
                    </div>
                    <button 
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 p-3 bg-red-500 hover:bg-red-600 rounded-xl font-bold transition-all shadow-lg hover:shadow-red-500/30"
                    >
                        <span>🚪</span> Logout
                    </button>
                </div>
            </aside>
            
            {/* Main Content Area */}
            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm z-10">
                    <div className="flex items-center">
                        <span className="md:hidden text-2xl mr-4 cursor-pointer">☰</span>
                        <h1 className="text-xl font-bold text-gray-800">
                            {navLinks.find(l => l.path === location.pathname)?.name || 'Admin Panel'}
                        </h1>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="hidden sm:flex flex-col text-right">
                            <span className="text-sm font-bold text-gray-700">System Status</span>
                            <span className="text-xs text-green-500 font-bold flex items-center justify-end">
                                <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                                Operational
                            </span>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xl cursor-not-allowed">
                            🔔
                        </div>
                    </div>
                </header>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    {children}
                    <div className="h-10"></div>
                </div>
            </main>
            
            <style jsx="true">{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e2e8f0;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #cbd5e1;
                }
            `}</style>
        </div>
    );
};

export default AdminLayout;