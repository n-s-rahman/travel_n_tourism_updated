import React, { useState, useEffect } from 'react';
import api from '../services/api';
import AdminLayout from '../components/AdminLayout';

const InventoryPage = () => {
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchInventory = async () => {
        setLoading(true);
        try {
            const res = await api.get('/packages/inventory');
            setInventory(res.data);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching inventory:", err);
            setError("Failed to load inventory data.");
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInventory();
    }, []);

    if (loading) {
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
                <div className="mb-10">
                    <h1 className="text-4xl font-extrabold text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                        Capacity & Inventory Monitor
                    </h1>
                    <p className="text-gray-500 mt-2">Track real-time bookings and remaining spots for all packages</p>
                </div>

                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-r-lg shadow-sm">
                        ⚠️ {error}
                    </div>
                )}

                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-400 text-xs uppercase font-bold tracking-wider">
                                <tr>
                                    <th className="px-8 py-5">Package & Destination</th>
                                    <th className="px-8 py-5">Departure Date</th>
                                    <th className="px-8 py-5">Total Capacity</th>
                                    <th className="px-8 py-5">Booked</th>
                                    <th className="px-8 py-5">Remaining</th>
                                    <th className="px-8 py-5">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {inventory.map((item) => {
                                    const occupancyRate = (item.bookedCount / item.maxPeople) * 100;
                                    let statusColor = "text-green-600 bg-green-50";
                                    let progressColor = "bg-green-500";
                                    
                                    if (occupancyRate >= 90) {
                                        statusColor = "text-red-600 bg-red-50";
                                        progressColor = "bg-red-500";
                                    } else if (occupancyRate >= 70) {
                                        statusColor = "text-orange-600 bg-orange-50";
                                        progressColor = "bg-orange-500";
                                    }

                                    return (
                                        <tr key={item._id} className="hover:bg-blue-50/30 transition-colors">
                                            <td className="px-8 py-6">
                                                <div className="font-bold text-gray-800">{item.name}</div>
                                                <div className="text-sm text-gray-500">{item.destination}</div>
                                            </td>
                                            <td className="px-8 py-6 font-medium text-gray-600">
                                                {new Date(item.startDate).toLocaleDateString(undefined, {
                                                    day: 'numeric', month: 'short', year: 'numeric'
                                                })}
                                            </td>
                                            <td className="px-8 py-6 text-gray-800 font-semibold">{item.maxPeople}</td>
                                            <td className="px-8 py-6 text-indigo-600 font-bold">{item.bookedCount}</td>
                                            <td className="px-8 py-6">
                                                <span className={`px-4 py-1.5 rounded-full font-bold text-sm ${statusColor}`}>
                                                    {item.remainingCapacity} spots left
                                                </span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="w-full bg-gray-100 rounded-full h-2.5 max-w-[120px]">
                                                    <div 
                                                        className={`${progressColor} h-2.5 rounded-full`} 
                                                        style={{ width: `${Math.min(100, occupancyRate)}%` }}
                                                    ></div>
                                                </div>
                                                <div className="text-xs text-gray-400 mt-1 font-bold">
                                                    {occupancyRate.toFixed(0)}% FILLED
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    {inventory.length === 0 && !loading && (
                        <div className="p-20 text-center">
                            <div className="text-6xl mb-4">📭</div>
                            <p className="text-xl text-gray-500 font-medium">No active packages found in inventory.</p>
                        </div>
                    )}
                </div>
                <div className="h-20"></div>
            </div>
        </AdminLayout>
    );
};

export default InventoryPage;
