// --- src/screens/admin/CreatePackageScreen.jsx ---
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; 

const API_URL = '/api/packages'; // Ensure this matches your route prefix

const CreatePackageScreen = () => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        duration: '',
        maxPeople: '',
        destination: '',
        category: '',
        itinerary: [{ day: 1, description: '' }], // Start with Day 1
        availableDates: [], // We'll keep this simple for now
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const navigate = useNavigate();

    // Get token from localStorage (You must be saving it during login)
    const authToken = localStorage.getItem('authToken'); 

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    // Handler for Itinerary changes
    const handleItineraryChange = (index, e) => {
        const newItinerary = formData.itinerary.map((item, i) => {
            if (index === i) {
                return { ...item, description: e.target.value };
            }
            return item;
        });
        setFormData({ ...formData, itinerary: newItinerary });
    };

    // Handler to add a new day to the itinerary
    const handleAddDay = () => {
        const nextDay = formData.itinerary.length + 1;
        setFormData({
            ...formData,
            itinerary: [...formData.itinerary, { day: nextDay, description: '' }],
        });
    };

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

            const res = await axios.post(API_URL, formData, config);
            
            setSuccess(`Package "${res.data.package.name}" created successfully!`);
            setLoading(false);

            // Optional: Clear form or redirect after successful creation
            // setFormData({ ...initial state... }); 
            setTimeout(() => navigate('/admin/packages'), 2000); // Redirect to package list

        } catch (err) {
            setLoading(false);
            const errorMessage = err.response?.data?.message || 'Package creation failed. Check role and data.';
            setError(errorMessage);
            console.error(err);
        }
    };

    return (
        <div className="container mt-5">
            <h2>Create New Travel Package</h2>
            {success && <div className="alert alert-success">{success}</div>}
            {error && <div className="alert alert-danger">{error}</div>}
            
            <form onSubmit={handleSubmit}>
                {/* --- Basic Details --- */}
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
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Creating Package...' : 'Create Package'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreatePackageScreen;