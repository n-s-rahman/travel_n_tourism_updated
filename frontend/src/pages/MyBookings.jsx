// src/pages/MyBookings.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useWallet } from '../context/WalletContext';

const BOOKING_API_URL = 'http://localhost:5000/api/bookings';

const MyBookings = () => { 
    const { user } = useAuth(); 
    const { refreshWallet } = useWallet();
    const authToken = user?.token; 

    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [statusMessage, setStatusMessage] = useState('');

    useEffect(() => {
        // CONDITIONAL FETCH: Only run if the user is logged in
        if (!authToken) {
            setLoading(false);
            setError("You must be logged in to view your bookings.");
            return;
        }

        const fetchBookings = async () => {
            try {
                const res = await axios.get(`${BOOKING_API_URL}/my`, {
                    headers: { Authorization: `Bearer ${authToken}` },
                });
                setBookings(res.data);
            } catch (err) {
                // Handle 401 and other errors
                const errorMessage = err.response?.data?.message || 'Failed to load your bookings.';
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        };
        fetchBookings();
    }, [authToken]); 


    // ======================================================================
    // 🛑 HANDLER FOR CANCELLATION (NEW LOGIC)
    // ======================================================================
    const handleCancel = async (bookingId) => {
        if (!window.confirm('Are you sure you want to cancel this booking? A refund will be processed according to policy.')) {
            return;
        }

        setStatusMessage(`Cancelling booking ${bookingId}...`);
        setError(null);
        
        try {
            // Send PATCH request to the new cancellation route
            const res = await axios.patch(`${BOOKING_API_URL}/${bookingId}/cancel`, {}, {
                headers: { Authorization: `Bearer ${authToken}` },
            });
            
            // Refresh wallet balance globally
            refreshWallet();
            
            // Update the local state to show the new status and message
            setStatusMessage(res.data.message); // Displays the refund message
            
            // Update the bookings list without reloading the page
            setBookings(prevBookings => prevBookings.map(booking => 
                booking._id === bookingId ? { ...booking, status: 'Cancelled' } : booking
            ));

        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Cancellation failed due to a network error.';
            setError(errorMessage);
            setStatusMessage('');
        }
    };


    // ======================================================================
    // 🛑 RENDER LOGIC
    // ======================================================================
    if (loading) return <div className="p-4">Loading your bookings...</div>;
    // Display the error if no token is found or auth fails
    if (error) return <div className="p-4 text-red-600 font-bold">{error}</div>; 
    if (bookings.length === 0) return <div className="p-4">You have no active bookings.</div>;

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6">🎫 My Booked Trips</h1>
            
            {statusMessage && <div className="p-3 bg-blue-100 text-blue-800 rounded mb-4">{statusMessage}</div>}

            {bookings.map(booking => (
                <div key={booking._id} className="border p-4 mb-4 rounded shadow-sm">
                    {/* The package name comes from the populate in the backend controller */}
                    <p className="font-semibold">Package: {booking.package?.name || 'Package Details Missing'}</p>
                    <p>Trip Date: {new Date(booking.tripDate).toLocaleDateString()}</p>
                    <p>Total Price: **${booking.totalPrice?.toFixed(2) || 'N/A'}**</p>
                    
                    <p>Status: <span className={`font-bold ${booking.status === 'Cancelled' ? 'text-red-500' : 'text-green-600'}`}>{booking.status}</span></p>
                    
                    {/* Cancellation Button Logic */}
                    {booking.status === 'Pending' || booking.status === 'Confirmed' ? (
                        <button 
                            onClick={() => handleCancel(booking._id)}
                            className="mt-3 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition duration-150"
                            disabled={loading} // Prevent double-clicking
                        >
                            Cancel Booking
                        </button>
                    ) : (
                        <p className="text-gray-500 mt-2">Cancellation not available for this status.</p>
                    )}
                </div>
            ))}
        </div>
    );
};

export default MyBookings;