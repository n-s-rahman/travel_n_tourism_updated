import React, { useState, useEffect } from 'react';
import api from '../services/api';
import AdminLayout from '../components/AdminLayout';

const AdminBookingsPage = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    
    // For traveler modal
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/bookings?search=${search}&status=${statusFilter}`);
            setBookings(res.data);
            setLoading(false);
        } catch (err) {
            setError("Failed to fetch bookings.");
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, [statusFilter]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        fetchBookings();
    };

    const handleStatusUpdate = async (id, newStatus) => {
        setIsUpdating(true);
        try {
            await api.put(`/bookings/${id}`, { status: newStatus });
            setBookings(bookings.map(b => b._id === id ? { ...b, status: newStatus } : b));
            if (selectedBooking?._id === id) {
                setSelectedBooking({ ...selectedBooking, status: newStatus });
            }
            setIsUpdating(false);
        } catch (err) {
            alert("Failed to update status");
            setIsUpdating(false);
        }
    };

    return (
        <AdminLayout>
            <div className="container mx-auto p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                    <div>
                        <h1 className="text-4xl font-extrabold text-gray-900">Booking Management</h1>
                        <p className="text-gray-500 mt-2">Search and manage customer travelers and status</p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                        <form onSubmit={handleSearchSubmit} className="relative flex-1 sm:w-80">
                            <input 
                                type="text" 
                                placeholder="Search by ID, User, or Package..." 
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
                            />
                            <span className="absolute left-3 top-3.5 text-gray-400">🔍</span>
                        </form>
                        
                        <select 
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white shadow-sm font-semibold text-gray-700"
                        >
                            <option value="">All Status</option>
                            <option value="Pending">Pending</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Cancelled">Cancelled</option>
                            <option value="Completed">Completed</option>
                        </select>
                    </div>
                </div>

                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase">Customer</th>
                                    <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase">Package</th>
                                    <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase">Amount</th>
                                    <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase">Status</th>
                                    <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase">Travelers</th>
                                    <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {loading ? (
                                    <tr><td colSpan="6" className="px-6 py-20 text-center">Loading...</td></tr>
                                ) : (
                                    bookings.map((booking) => (
                                        <tr key={booking._id} className="hover:bg-indigo-50/20 transition-colors">
                                            <td className="px-6 py-6">
                                                <div className="font-bold text-gray-800">{booking.user?.name || 'Unknown'}</div>
                                                <div className="text-xs text-gray-400">#{booking._id.slice(-6).toUpperCase()}</div>
                                            </td>
                                            <td className="px-6 py-6 font-semibold text-gray-700">{booking.package?.name}</td>
                                            <td className="px-6 py-6 font-bold text-indigo-600">${booking.totalPrice?.toLocaleString()}</td>
                                            <td className="px-6 py-6">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                                                    booking.status === 'Confirmed' ? 'bg-green-100 text-green-700' :
                                                    booking.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                                                    booking.status === 'Cancelled' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                                                }`}>
                                                    {booking.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-6">
                                                <button 
                                                    onClick={() => setSelectedBooking(booking)}
                                                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 underline"
                                                >
                                                    {booking.numberOfPeople} Details
                                                </button>
                                            </td>
                                            <td className="px-6 py-6 text-center">
                                                <select 
                                                    onChange={(e) => handleStatusUpdate(booking._id, e.target.value)}
                                                    value={booking.status}
                                                    className="text-xs border rounded p-1"
                                                >
                                                    <option value="Pending">Pending</option>
                                                    <option value="Confirmed">Confirmed</option>
                                                    <option value="Cancelled">Cancelled</option>
                                                    <option value="Completed">Completed</option>
                                                </select>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Traveler Details Modal */}
                {selectedBooking && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800">Traveler Details</h2>
                                    <p className="text-gray-500">Booking #{selectedBooking._id}</p>
                                </div>
                                <button onClick={() => setSelectedBooking(null)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
                            </div>
                            
                            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                                {selectedBooking.travelers?.map((t, i) => (
                                    <div key={i} className="p-4 bg-gray-50 rounded-2xl grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] font-bold text-gray-400 uppercase">First Name</label>
                                            <p className="font-bold text-gray-800">{t.firstName || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-gray-400 uppercase">Last Name</label>
                                            <p className="font-bold text-gray-800">{t.lastName || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-gray-400 uppercase">Passport</label>
                                            <p className="font-bold text-gray-800">{t.passportNumber || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-gray-400 uppercase">DOB</label>
                                            <p className="font-bold text-gray-800">{t.dob ? new Date(t.dob).toLocaleDateString() : 'N/A'}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="mt-8 pt-6 border-t border-gray-100 flex justify-between items-center">
                                <div>
                                    <span className="text-xs font-bold text-gray-400 uppercase">Room Type</span>
                                    <p className="font-bold text-indigo-600">{selectedBooking.roomType}</p>
                                </div>
                                <button 
                                    onClick={() => setSelectedBooking(null)}
                                    className="bg-gray-800 text-white px-8 py-3 rounded-2xl font-bold hover:bg-black transition-all"
                                >
                                    Close Window
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                <div className="h-20"></div>
            </div>
        </AdminLayout>
    );
};

export default AdminBookingsPage;
