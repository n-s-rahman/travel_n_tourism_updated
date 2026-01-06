import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AdminLayout from '../components/AdminLayout';
import api from '../services/api'; // Import the configured api instance

const AdminDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        inactive: 0
    });

    const fetchPackages = async () => {
        setLoading(true);
        try {
            // Use the api instance which has the correct baseURL and token interceptor
            const res = await api.get('/packages?showAll=true'); 
            const allPackages = res.data.packages || [];
            setPackages(allPackages);
            
            setStats({
                total: allPackages.length,
                active: allPackages.filter(p => p.available).length,
                inactive: allPackages.filter(p => !p.available).length
            });
            setLoading(false);
        } catch (err) {
            console.error("Error fetching packages:", err);
            setLoading(false);
            // If it's an auth error, maybe redirect?
            if (err.response?.status === 401 || err.response?.status === 403) {
                // navigate('/login');
            }
        }
    };

    useEffect(() => {
        // Only fetch if user is loaded and is an admin/agent
        if (user) {
            const role = user.role?.toLowerCase();
            if (role === 'admin' || role === 'agent') {
                fetchPackages();
            } else {
                navigate('/dashboard'); // Low privilege users go to their dashboard
            }
        }
    }, [user, navigate]);

    const handleDeactivate = async (id, currentStatus) => {
        try {
            await api.patch(`/packages/deactivate/${id}`);
            
            // Optimistic update for immediate UI feedback
            setPackages(prevPackages => {
                const updatedPackages = prevPackages.map(pkg => 
                    pkg._id === id ? { ...pkg, available: !pkg.available } : pkg
                );
                
                // Update stats based on the new local state
                setStats({
                    total: updatedPackages.length,
                    active: updatedPackages.filter(p => p.available).length,
                    inactive: updatedPackages.filter(p => !p.available).length
                });
                
                return updatedPackages;
            });
            
            // Background fetch to ensure sync
            // fetchPackages(); // Optional: Commented out to prevent list jumpiness if API behaves oddly
        } catch (err) {
            console.error("Toggle status error:", err);
            alert("Failed to update status");
            fetchPackages(); // Revert on error
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to PERMANENTLY delete this package?")) {
            try {
                await api.delete(`/packages/${id}`);
                fetchPackages();
            } catch (err) {
                console.error("Delete error:", err);
                alert("Failed to delete package");
            }
        }
    };

    if (loading && packages.length === 0) {
        return (
            <AdminLayout>
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="container mx-auto p-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                    <div>
                        <h1 className="text-4xl font-extrabold text-gray-900">Admin Command Center</h1>
                        <p className="text-gray-500 mt-1">Manage your empire and travel offerings</p>
                    </div>
                    <div className="flex gap-4">
                        <Link to="/admin/packages/new" className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg transform hover:-translate-y-1 transition-all">
                            + New Package
                        </Link>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center">
                        <div className="bg-blue-100 p-4 rounded-xl mr-5 text-2xl text-blue-600">🌍</div>
                        <div>
                            <p className="text-sm text-gray-400 font-semibold uppercase">Total Packages</p>
                            <h3 className="text-3xl font-bold text-gray-800">{stats.total}</h3>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center">
                        <div className="bg-green-100 p-4 rounded-xl mr-5 text-2xl text-green-600">✅</div>
                        <div>
                            <p className="text-sm text-gray-400 font-semibold uppercase">Active</p>
                            <h3 className="text-3xl font-bold text-gray-800">{stats.active}</h3>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center">
                        <div className="bg-red-100 p-4 rounded-xl mr-5 text-2xl text-red-600">❌</div>
                        <div>
                            <p className="text-sm text-gray-400 font-semibold uppercase">Deactivated</p>
                            <h3 className="text-3xl font-bold text-gray-800">{stats.inactive}</h3>
                        </div>
                    </div>
                </div>

                {/* Packages Table */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                    <div className="p-6 border-b border-gray-50 bg-gray-50 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-800">Current Inventories</h2>
                        <span className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-bold">LATEST UPDATES</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-400 text-xs uppercase font-bold">
                                <tr>
                                    <th className="px-6 py-4">Package Details</th>
                                    <th className="px-6 py-4">Destination</th>
                                    <th className="px-6 py-4">Price</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {packages.map((pkg) => (
                                    <tr key={pkg._id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="w-12 h-12 rounded-lg bg-gray-200 overflow-hidden mr-4">
                                                    {pkg.images && pkg.images.length > 0 ? (
                                                        <img src={pkg.images[0]} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full bg-indigo-100 flex items-center justify-center text-indigo-500 font-bold">
                                                            IMG
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-800">{pkg.name}</p>
                                                    <p className="text-xs text-gray-400">{pkg.duration} Days • {pkg.type}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 font-medium">{pkg.destination}</td>
                                        <td className="px-6 py-4 font-bold text-gray-800">${pkg.price?.toLocaleString()}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${pkg.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {pkg.available ? 'Active' : 'Hidden'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-center gap-2">
                                                <Link to={`/admin/packages/${pkg._id}/edit`} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition shadow-sm">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                                                </Link>
                                                <button 
                                                    onClick={() => handleDeactivate(pkg._id, pkg.available)} 
                                                    className={`p-2 rounded-lg transition shadow-sm ${pkg.available ? 'bg-orange-50 text-orange-600 hover:bg-orange-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                                                    title={pkg.available ? "Deactivate Package" : "Activate Package"}
                                                >
                                                    {pkg.available ? (
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path></svg>
                                                    ) : (
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                                    )}
                                                </button>
                                                <button onClick={() => handleDelete(pkg._id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition shadow-sm">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {packages.length === 0 && !loading && <div className="p-20 text-center text-gray-400">No packages found. Start by creating one!</div>}
                </div>
                <div className="h-20"></div>
            </div>
        </AdminLayout>
    );
};

export default AdminDashboard;
