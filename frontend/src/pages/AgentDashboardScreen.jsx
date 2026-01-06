// --- frontend/src/pages/AgentDashboardScreen.jsx ---
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // <--- CORRECTED PATH HERE

const API_URL = '/api/packages'; 

const AgentDashboardScreen = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const authToken = localStorage.getItem('token'); 

    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [statusMessage, setStatusMessage] = useState(null);

    const config = {
        headers: {
            Authorization: `Bearer ${authToken}`,
        },
    };

    // --- Fetch Packages Created by Agent ---
    // NOTE: Filtering for ALL packages (not just those created by user)
    const fetchAgentPackages = async () => {
        setLoading(true);
        setError(null);
        try {
            // Fetch ALL packages
            const res = await axios.get(API_URL, config); 
            
            // 🛑 CRITICAL FIX: Filtering line removed to show ALL packages to the user
            const myPackages = res.data.packages; // <--- ALL packages shown!
            
            setPackages(myPackages);
            setLoading(false);
        } catch (err) {
            setLoading(false);
            setError(err.response?.data?.message || 'Failed to load packages. Check network and authorization.');
        }
    };

    useEffect(() => {
        // Only fetch if user object is available
        if (user && user.id) {
            fetchAgentPackages();
        }
    }, [user, authToken]);

    // --- Handler for Deactivating/Deleting a Package ---
    const handleDelete = async (packageId) => {
        if (!window.confirm("Are you sure you want to delete this package?")) {
            return;
        }

        setStatusMessage(null);
        try {
            await axios.delete(`${API_URL}/${packageId}`, config);
            
            setStatusMessage("Package successfully deleted!");
            fetchAgentPackages(); 
        } catch (err) {
            setStatusMessage(null);
            setError(err.response?.data?.message || 'Failed to delete package.');
            console.error(err);
        }
    };

    if (loading) {
        return <div className="container mt-5 text-center">Loading your packages...</div>;
    }

    if (error) {
        return <div className="container mt-5 alert alert-danger text-center">Error: {error}</div>;
    }
    
    // 🟢 Access Control: Blocks only if user is NOT logged in.
    if (!user || !user.role) { 
        return <div className="container mt-5 alert alert-warning text-center">Please log in to view this content.</div>;
    }


    return (
        <div className="container mt-5">
            <h2 className="text-3xl font-bold mb-4">
                {/* Title adjusted for the 'user' role */}
                {user.role === 'user' ? 'Available Packages' : `${user.role} Dashboard: Your Created Packages`}
            </h2>

            {statusMessage && <div className="alert alert-success mb-4">{statusMessage}</div>}
            
            {/* 🟢 'Create New Package' link shudhu Admin/Agent-er jonno. */}
            {(user.role === 'Admin' || user.role === 'Agent') && (
                <div className="flex justify-end mb-4">
                    <Link to="/admin/create-package" className="btn btn-primary">
                        + Create New Package
                    </Link>
                </div>
            )}

            {packages.length === 0 ? (
                <div className="alert alert-info">
                    {user.role === 'user' ? 'No packages are available right now.' : 'You haven\'t created any packages yet.'}
                </div>
            ) : (
                <div className="table-responsive">
                    <table className="table table-striped table-hover">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Destination</th>
                                <th>Price</th>
                                <th>Duration</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {packages.map(pkg => (
                                <tr key={pkg._id}>
                                    <td>{pkg.name}</td>
                                    <td>{pkg.destination}</td>
                                    <td>${pkg.price.toLocaleString()}</td>
                                    <td>{pkg.duration} days</td>
                                    <td>
                                        <span className={`badge ${pkg.available ? 'bg-success' : 'bg-danger'}`}>
                                            {pkg.available ? 'Available' : 'Deactivated'}
                                        </span>
                                    </td>
                                    <td>
                                        {/* 🟢 Action buttons shudhu Admin/Agent-er jonno. */}
                                        {(user.role === 'Admin' || user.role === 'Agent') && (
                                            <>
                                                {/* EDIT Button */}
                                                <Link 
                                                    to={`/admin/edit-package/${pkg._id}`} 
                                                    className="btn btn-sm btn-warning me-2"
                                                >
                                                    Edit
                                                </Link>
                                                
                                                {/* DEACTIVATE/DELETE Button */}
                                                <button 
                                                    onClick={() => handleDelete(pkg._id)}
                                                    className="btn btn-sm btn-danger"
                                                    disabled={loading} 
                                                >
                                                    Delete
                                                </button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AgentDashboardScreen;