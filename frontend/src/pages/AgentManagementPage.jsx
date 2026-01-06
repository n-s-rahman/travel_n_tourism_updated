import React, { useState, useEffect } from 'react';
import api from '../services/api';
import AdminLayout from '../components/AdminLayout';
import { useAuth } from '../context/AuthContext';

const AgentManagementPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user: currentUser } = useAuth();

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/users');
            // Filter to show only agents and admins (or all if preferred, but usually management is for staf)
            // The requirement says "manage agent accounts and assign specific roles"
            setUsers(res.data);
            setLoading(false);
        } catch (err) {
            setError("Failed to fetch users.");
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleRoleChange = async (userId, newRole) => {
        try {
            await api.put(`/admin/users/${userId}/role`, { role: newRole });
            setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
        } catch (err) {
            alert(err.response?.data?.message || "Failed to update role");
        }
    };

    return (
        <AdminLayout>
            <div className="container mx-auto p-6">
                <div className="mb-10">
                    <h1 className="text-4xl font-extrabold text-gray-900">User & Agent Management</h1>
                    <p className="text-gray-500 mt-2">Manage account roles and account permissions</p>
                </div>

                {error && <div className="bg-red-50 text-red-700 p-4 mb-6 rounded-xl border border-red-100 italic">⚠️ {error}</div>}

                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">User Info</th>
                                    <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Current Role</th>
                                    <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Assign Role</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {loading ? (
                                    <tr><td colSpan="4" className="px-6 py-20 text-center text-gray-400">Loading users...</td></tr>
                                ) : (
                                    users.map((u) => (
                                        <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-6">
                                                <div className="font-bold text-gray-800">{u.name}</div>
                                                <div className="text-[10px] text-gray-400 font-mono">{u._id}</div>
                                            </td>
                                            <td className="px-6 py-6 text-gray-600 font-medium">{u.email}</td>
                                            <td className="px-6 py-6">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                                                    u.role?.toLowerCase() === 'admin' ? 'bg-purple-100 text-purple-700' :
                                                    u.role?.toLowerCase() === 'agent' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                                                }`}>
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-6 text-center">
                                                <div className="flex justify-center gap-2">
                                                    <select 
                                                        disabled={u._id === currentUser?._id || u._id === currentUser?.id}
                                                        onChange={(e) => handleRoleChange(u._id, e.target.value)}
                                                        value={u.role}
                                                        className="text-xs border rounded-lg px-2 py-1 outline-none bg-white font-semibold text-gray-700 hover:border-indigo-400 transition-colors"
                                                    >
                                                        <option value="user">User</option>
                                                        <option value="Agent">Agent</option>
                                                        <option value="admin">Admin</option>
                                                    </select>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
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

export default AgentManagementPage;
