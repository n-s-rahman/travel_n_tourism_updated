import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext'; 

// --- Configuration ---
// Make sure this port matches your server.js (which we set to 5000!)
const API_URL = 'http://localhost:5000/api/bookings'; 

const MyBookingsScreen = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user } = useAuth();
    const authToken = user?.token;

    // =========================================================
    // 1. Function to Fetch All Bookings (GET /api/bookings/my)
    // =========================================================
    const fetchBookings = async () => {
        if (!authToken) {
            setError('Please log in to view your bookings.');
            setLoading(false);
            return;
        }

        try {
            const response = await axios.get(`${API_URL}/my`, {
                headers: {
                    Authorization: `Bearer ${authToken}` 
                }
            });
            setBookings(response.data);
            setError('');
        } catch (err) {
            console.error("Failed to fetch bookings:", err);
            setError('Error fetching bookings. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, [authToken]);


    // =========================================================
    // 2. Function to Handle Cancellation (PATCH /api/bookings/:id/cancel)
    // =========================================================
    const handleCancel = async (bookingId) => {
        if (!window.confirm("Are you sure you want to cancel this booking? This action is final.")) {
            return;
        }

        try {
            // Send the PATCH request to your backend endpoint
            const res = await axios.patch(`${API_URL}/${bookingId}/cancel`, {}, {
                headers: {
                    Authorization: `Bearer ${authToken}` 
                }
            });
            
            // --- CRITICAL: Update the local state (bookings array) ---
            // We map over the array and update the status of the cancelled booking
            setBookings(prevBookings => 
                prevBookings.map(booking => 
                    booking._id === bookingId ? { ...booking, status: 'Cancelled', refundAmount: res.data.booking.refundAmount } : booking
                )
            );

        } catch (err) {
            console.error("Cancellation error:", err.response ? err.response.data : err.message);
            const errorMessage = err.response?.data?.message || 'Cancellation failed. Check server logs.';
            alert(`Cancellation failed: ${errorMessage}`);
        }
    };


    if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>Loading your bookings...</div>;
    if (error) return <div style={{ color: 'red', textAlign: 'center', padding: '50px' }}>{error}</div>;
    if (bookings.length === 0) return <div style={{ textAlign: 'center', padding: '50px' }}>You have no active bookings yet.</div>;

    // =========================================================
    // 3. Rendering the Booking List with Conditional Logic
    // =========================================================
    return (
        <div style={{ maxWidth: '900px', margin: 'auto', padding: '20px' }}>
            <h2>Your Trip Bookings ({bookings.length})</h2>
            <div className="bookings-list">
                {bookings.map((booking) => (
                    <div 
                        key={booking._id} 
                        style={{ border: '1px solid #ddd', padding: '15px', marginBottom: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}
                    >
                        <h3>Package: {booking.package ? booking.package.name : 'Unknown Package'}</h3>
                        <p><strong>Trip Date:</strong> {new Date(booking.tripDate).toLocaleDateString()}</p>
                        <p><strong>Total Price:</strong> ${booking.totalPrice ? booking.totalPrice.toFixed(2) : 'N/A'}</p>
                        
                        {/* --- Status and Cancel Logic (The part you asked about) --- */}
                        
                        {/* 1. Show Status */}
                        <p>
                            <strong>Current Status: </strong>
                            <span style={{ 
                                color: 
                                    booking.status === 'Cancelled' ? 'red' : 
                                    booking.status === 'Confirmed' ? 'green' : 'orange', 
                                fontWeight: 'bold' 
                            }}>
                                {booking.status}
                            </span>
                        </p>

                        {/* 2. Show Refund if Cancelled */}
                        {booking.status === 'Cancelled' && booking.refundAmount && (
                            <p style={{ color: 'red', fontWeight: 'bold' }}>
                                Refund Initiated: ${booking.refundAmount.toFixed(2)}
                            </p>
                        )}

                        {/* 3. Show CANCEL Button (If status is Pending or Confirmed) */}
                        {(booking.status === 'Pending' || booking.status === 'Confirmed') && (
                            <button 
                                onClick={() => handleCancel(booking._id)}
                                style={{ padding: '8px 15px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '10px' }}
                            >
                                Cancel Booking
                            </button>
                        )}
                        
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MyBookingsScreen;