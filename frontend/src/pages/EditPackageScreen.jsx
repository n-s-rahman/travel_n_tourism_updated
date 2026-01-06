// --- src/pages/EditPackageScreen.jsx ---
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom'; // Import useParams

const API_URL = '/api/packages'; 

// Initial state, used if no package ID is found (shouldn't happen on edit)
const initialFormData = {
    name: '',
    description: '',
    price: '',
    duration: '',
    maxPeople: '',
    destination: '',
    category: '',
    itinerary: [{ day: 1, description: '' }],
    availableDates: [],
};

const EditPackageScreen = () => {
    // Get the package ID from the URL path, e.g., /admin/edit-package/12345
    const { id } = useParams(); 
    
    const [formData, setFormData] = useState(initialFormData);
    const [loading, setLoading] = useState(true); // Start loading true to fetch data
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [fetchError, setFetchError] = useState(null); // Error specifically for initial fetch

    const navigate = useNavigate();
    const authToken = localStorage.getItem('token'); // Use 'token' based on your AuthContext

    // --- 1. FETCH PACKAGE DATA ON MOUNT ---
    useEffect(() => {
        if (!id) {
            setFetchError("No Package ID provided for editing.");
            setLoading(false);
            return;
        }

        const fetchPackage = async () => {
            try {
                const config = {
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                    },
                };
                
                // Fetch the package details using the GET /api/packages/:id endpoint
                const res = await axios.get(`${API_URL}/${id}`, config);
                
                // Set form data with fetched package details
                setFormData({
                    name: res.data.name,
                    description: res.data.description || '',
                    price: res.data.price,
                    duration: res.data.duration,
                    maxPeople: res.data.maxPeople,
                    destination: res.data.destination,
                    category: res.data.category || '',
                    itinerary: res.data.itinerary || [{ day: 1, description: '' }],
                    availableDates: res.data.availableDates || [],
                });
                setLoading(false);
            } catch (err) {
                setLoading(false);
                const errorMessage = err.response?.data?.message || 'Failed to fetch package data. Check ID and user role.';
                setFetchError(errorMessage);
                console.error("Fetch Error:", err);
            }
        };

        fetchPackage();
    }, [id, authToken]); 
    // Dependency array ensures fetch runs when ID or token changes

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    // Handler for Itinerary changes (same as CreateScreen)
    const handleItineraryChange = (index, e) => {
        const newItinerary = formData.itinerary.map((item, i) => {
            if (index === i) {
                // Keep the 'day' property as is, only update 'description'
                return { ...item, description: e.target.value }; 
            }
            return item;
        });
        setFormData({ ...formData, itinerary: newItinerary });
    };

    // Handler to add a new day to the itinerary (same as CreateScreen)
    const handleAddDay = () => {
        const nextDay = formData.itinerary.length + 1;
        setFormData({
            ...formData,
            itinerary: [...formData.itinerary, { day: nextDay, description: '' }],
        });
    };

    // --- 2. SUBMIT HANDLER (Uses PUT instead of POST) ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
            };
            
            // Use axios.put and include the package ID in the URL
            const res = await axios.put(`${API_URL}/${id}`, formData, config);
            
            setSuccess(`Package "${res.data.package.name}" updated successfully!`);
            setLoading(false);

            // Optional: Redirect back to the package list or detail page
            setTimeout(() => navigate(`/packages/${id}`), 2000); 

        } catch (err) {
            setLoading(false);
            const errorMessage = err.response?.data?.message || 'Package update failed. Check role and data.';
            setError(errorMessage);
            console.error(err.response || err);
        }
    };
    
    // --- Render Logic ---
    if (loading) {
        return <div className="container mt-5 text-center">Loading package details...</div>;
    }

    if (fetchError) {
        return <div className="container mt-5 alert alert-warning text-center">Error: {fetchError}</div>;
    }

    return (
        <div className="container mt-5">
            <h2>Edit Travel Package: {formData.name}</h2>
            {success && <div className="alert alert-success">{success}</div>}
            {error && <div className="alert alert-danger">{error}</div>}
            
            <form onSubmit={handleSubmit}>
                {/* --- Basic Details (Same form fields as CreateScreen) --- */}
                <div className="row">
                    <div className="col-md-6 mb-3">
                        <label htmlFor="name" className="form-label">Package Name *</label>
                        <input type="text" className="form-control" id="name" name="name" value={formData.name} onChange={handleChange} required />
                    </div>
                    <div className="col-md-6 mb-3">
                        <label htmlFor="destination" className="form-label">Destination *</label>
                        <input type="text" className="form-control" id="destination" name="destination" value={formData.destination} onChange={handleChange} required />
                    </div>
                </div>

                <div className="mb-3">
                    <label htmlFor="description" className="form-label">Description</label>
                    <textarea className="form-control" id="description" name="description" rows="3" value={formData.description} onChange={handleChange}></textarea>
                </div>

                {/* --- Numeric Details --- */}
                <div className="row">
                    <div className="col-md-3 mb-3">
                        <label htmlFor="price" className="form-label">Price ($) *</label>
                        <input type="number" className="form-control" id="price" name="price" value={formData.price} onChange={handleChange} required min="0" />
                    </div>
                    <div className="col-md-3 mb-3">
                        <label htmlFor="duration" className="form-label">Duration (Days) *</label>
                        <input type="number" className="form-control" id="duration" name="duration" value={formData.duration} onChange={handleChange} required min="1" />
                    </div>
                    <div className="col-md-3 mb-3">
                        <label htmlFor="maxPeople" className="form-label">Max Capacity *</label>
                        <input type="number" className="form-control" id="maxPeople" name="maxPeople" value={formData.maxPeople} onChange={handleChange} required min="1" />
                    </div>
                    <div className="col-md-3 mb-3">
                        <label htmlFor="category" className="form-label">Category (e.g., Adventure, Relax)</label>
                        <input type="text" className="form-control" id="category" name="category" value={formData.category} onChange={handleChange} />
                    </div>
                </div>

                {/* --- Itinerary Section --- */}
                <h4 className="mt-4">Itinerary Details</h4>
                {formData.itinerary.map((item, index) => (
                    <div className="input-group mb-3" key={index}>
                        <span className="input-group-text">Day {item.day}</span>
                        <input 
                            type="text" 
                            className="form-control" 
                            placeholder={`Description for Day ${item.day}`}
                            value={item.description}
                            onChange={(e) => handleItineraryChange(index, e)}
                            required 
                        />
                    </div>
                ))}
                
                <button type="button" className="btn btn-outline-secondary mb-4" onClick={handleAddDay}>
                    + Add Another Day to Itinerary
                </button>
                
                {/* --- Submit Button --- */}
                <div className="d-grid gap-2">
                    <button type="submit" className="btn btn-warning" disabled={loading}>
                        {loading ? 'Updating Package...' : 'Update Package'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditPackageScreen;