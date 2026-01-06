import React, { useState, useEffect } from 'react';
import api from '../services/api';
import AdminLayout from '../components/AdminLayout';

const ActivityLogPage = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/logs');
            setLogs(res.data);
            setLoading(false);
        } catch (err) {
            setError("Failed to fetch activity logs.");
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const parseDetails = (details) => {
        try {
            return JSON.parse(details);
        } catch (e) {
            return details;
        }
    };

    return (
        <AdminLayout>
            <div className="container mx-auto p-6">
                <div className="mb-10">
                    <h1 className="text-4xl font-extrabold text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-orange-600">
                        Agent & Admin Activity Logs
                    </h1>
                    <p className="text-gray-500 mt-2">Audit trail of all administrative actions performed on the platform</p>
                </div>

                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Timestamp</th>
                                    <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Performer</th>
                                    <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Action</th>
                                    <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Target</th>
                                    <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Details</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {loading ? (
                                    <tr><td colSpan="5" className="px-6 py-20 text-center">Loading audit logs...</td></tr>
                                ) : (
                                    logs.map((log) => {
                                        const detailsData = parseDetails(log.details);
                                        return (
                                            <tr key={log._id} className="hover:bg-gray-50 transition-colors text-sm">
                                                <td className="px-6 py-5 text-gray-500 font-mono text-[11px]">
                                                    {new Date(log.createdAt).toLocaleString()}
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="font-bold text-gray-800">{log.user?.name}</div>
                                                    <div className="text-[10px] text-gray-400">{log.user?.role}</div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                                                        log.action.includes('Delete') ? 'bg-red-50 text-red-600' :
                                                        log.action.includes('Create') ? 'bg-green-50 text-green-600' :
                                                        log.action.includes('Price') ? 'bg-amber-50 text-amber-600' : 'bg-gray-50 text-gray-600'
                                                    }`}>
                                                        {log.action}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5 font-semibold text-gray-700">
                                                    {log.targetType}: {log.targetId?.slice(-6).toUpperCase() || 'N/A'}
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="text-[11px] text-gray-500 max-w-xs overflow-hidden text-ellipsis whitespace-nowrap" title={JSON.stringify(detailsData)}>
                                                        {typeof detailsData === 'object' ? 
                                                            Object.entries(detailsData).map(([k, v]) => `${k}: ${v}`).join(', ') : 
                                                            detailsData}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="h-20"></div>
            </div>
        </AdminLayout>
    );
};

export default ActivityLogPage;
