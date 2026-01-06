import React, { useState, useEffect } from 'react';
import api from '../services/api';
import AdminLayout from '../components/AdminLayout';

const SalesReportPage = () => {
    const [reportData, setReportData] = useState({ dayWise: [], packageWise: [] });
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0], // Last 30 days
        endDate: new Date().toISOString().split('T')[0]
    });

    const fetchReport = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/bookings/reports?startDate=${filters.startDate}&endDate=${filters.endDate}`);
            setReportData(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReport();
    }, []);

    const totals = reportData.dayWise.reduce((acc, curr) => ({
        revenue: acc.revenue + curr.totalSales,
        bookings: acc.bookings + curr.bookingCount,
        travelers: acc.travelers + curr.travelerCount
    }), { revenue: 0, bookings: 0, travelers: 0 });

    return (
        <AdminLayout>
            <div className="container mx-auto p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                    <div>
                        <h1 className="text-4xl font-extrabold text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-600">
                            Sales & Revenue Reports
                        </h1>
                        <p className="text-gray-500 mt-2">Analyze performance and package success over time</p>
                    </div>

                    <div className="bg-white p-4 rounded-2xl shadow-lg border border-gray-100 flex gap-4 items-center">
                        <div className="flex flex-col">
                            <label className="text-[10px] uppercase font-bold text-gray-400 ml-1">From</label>
                            <input 
                                type="date" 
                                value={filters.startDate}
                                onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                                className="border-none outline-none font-semibold text-gray-700 p-1 rounded hover:bg-gray-50 transition"
                            />
                        </div>
                        <div className="h-8 w-[1px] bg-gray-100"></div>
                        <div className="flex flex-col">
                            <label className="text-[10px] uppercase font-bold text-gray-400 ml-1">To</label>
                            <input 
                                type="date" 
                                value={filters.endDate}
                                onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                                className="border-none outline-none font-semibold text-gray-700 p-1 rounded hover:bg-gray-50 transition"
                            />
                        </div>
                        <button 
                            onClick={fetchReport}
                            disabled={loading}
                            className={`bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-xl font-bold shadow-md transition-all ml-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {loading ? 'Generating...' : 'Generate'}
                        </button>
                    </div>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-8 rounded-3xl shadow-xl text-white transform hover:scale-[1.02] transition-transform duration-300">
                        <p className="text-indigo-100 text-sm font-bold uppercase tracking-wider mb-2">Total Revenue</p>
                        <h3 className="text-4xl font-extrabold">${totals.revenue.toLocaleString()}</h3>
                        <div className="mt-4 text-indigo-100 text-xs font-semibold flex items-center">
                            <span className="bg-white/20 px-2 py-1 rounded mr-2">LIVE DATA</span>
                            Based on confirmed bookings
                        </div>
                    </div>
                    
                    <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 flex items-center justify-between group">
                        <div>
                            <p className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-2">Successful Bookings</p>
                            <h3 className="text-4xl font-extrabold text-gray-800">{totals.bookings}</h3>
                        </div>
                        <div className="bg-emerald-50 text-emerald-500 p-4 rounded-2xl text-2xl group-hover:rotate-12 transition-transform">
                            📝
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 flex items-center justify-between group">
                        <div>
                            <p className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-2">Total Travelers</p>
                            <h3 className="text-4xl font-extrabold text-gray-800">{totals.travelers}</h3>
                        </div>
                        <div className="bg-blue-50 text-blue-500 p-4 rounded-2xl text-2xl group-hover:rotate-12 transition-transform">
                            👥
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    {/* Package Performance */}
                    <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                                <span className="mr-3">🏆</span> Package Leaderboard
                            </h2>
                        </div>
                        <div className="space-y-6">
                            {reportData.packageWise.map((pkg, idx) => (
                                <div key={pkg.name} className="relative">
                                    <div className="flex justify-between items-center mb-2">
                                        <div className="flex items-center">
                                            <span className="text-gray-400 text-xs font-bold mr-3 w-4">#{idx + 1}</span>
                                            <span className="font-bold text-gray-700">{pkg.name}</span>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-extrabold text-indigo-600">${pkg.revenue.toLocaleString()}</div>
                                            <div className="text-[10px] text-gray-400 font-bold">{pkg.bookings} BOOKINGS</div>
                                        </div>
                                    </div>
                                    <div className="w-full bg-gray-50 rounded-full h-2 overflow-hidden border border-gray-100">
                                        <div 
                                            className="bg-indigo-500 h-full rounded-full transition-all duration-1000"
                                            style={{ width: `${(pkg.revenue / (reportData.packageWise[0]?.revenue || 1)) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Daily Trends (Table form for precision) */}
                    <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                        <h2 className="text-2xl font-bold text-gray-800 mb-8 flex items-center">
                            <span className="mr-3">📈</span> Daily Performance
                        </h2>
                        <div className="overflow-x-auto max-h-[400px] custom-scrollbar">
                            <table className="w-full text-left">
                                <thead className="sticky top-0 bg-white shadow-sm">
                                    <tr className="border-b border-gray-50">
                                        <th className="py-4 text-xs font-bold text-gray-400 uppercase">Date</th>
                                        <th className="py-4 text-xs font-bold text-gray-400 uppercase text-center">Bookings</th>
                                        <th className="py-4 text-xs font-bold text-gray-400 uppercase text-right">Revenue</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {reportData.dayWise.slice().reverse().map(day => (
                                        <tr key={day._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="py-4 font-semibold text-gray-700">{day._id}</td>
                                            <td className="py-4 text-center font-bold text-gray-500">{day.bookingCount}</td>
                                            <td className="py-4 text-right font-extrabold text-emerald-600">${day.totalSales.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="h-20"></div>
            </div>
            
            <style jsx="true">{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
            `}</style>
        </AdminLayout>
    );
};

export default SalesReportPage;
