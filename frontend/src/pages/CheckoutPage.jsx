import React, { useState } from 'react';
// 🛑 Eita oboshshoi dorkar
import axios from 'axios'; 

const API_URL = 'http://localhost:5000/api/payments'; 

const CheckoutPage = () => {
    const [selectedMethod, setSelectedMethod] = useState(null);
    const [loading, setLoading] = useState(false); // Loading state
    const [error, setError] = useState(null); 
    
    // Ei data-ti shothik Booking details diye change korte hobe
    const [bookingData, setBookingData] = useState({ 
        bookingId: 'MOCK-B-123', 
        amount: 2500,
        customerInfo: { name: 'User A', email: 'a@example.com', phone: '01XXXXXXXXX' }
    });


    // 🎯 Ekhon ei function-ti apnar backend-ke call korbe ebong redirect korbe
    const handleProceedToGateway = async () => {
        if (!selectedMethod) {
            setError("Please select a payment method.");
            return;
        }

        setLoading(true);
        setError(null);
        console.log(`User selected method: ${selectedMethod}`); // Selected method shudhu tracking-er jonno
        
        try {
            // 1. Backend API Call kora
            // Apnar backend route: POST /api/payments/initiate
            const response = await axios.post(`${API_URL}/initiate`, {
                bookingId: bookingData.bookingId,
                amount: bookingData.amount,
                customerInfo: bookingData.customerInfo
            });
            
            const { redirectUrl } = response.data;

            if (redirectUrl) {
                console.log(`Successfully initiated. Redirecting to: ${redirectUrl}`);
                // 2. User-ke Payment Gateway-te Redirect kora
                window.location.href = redirectUrl; 
            } else {
                setError("Payment initiation failed to return a redirect URL.");
            }

        } catch (err) {
            console.error("Initiation Error:", err.response ? err.response.data : err.message);
            setError(err.response?.data?.message || "Failed to initiate payment. Server error.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: 'auto' }}>
            <h2>🛒 Select Payment Method</h2>
            <p>Total Payable: BDT {bookingData.amount}</p>
            
            {/* ... (bKash, Card, Nagad selection divs baki thakbe) */}
            {/* Eita dummy selection, ashol logic handleProceedToGateway-te ache */}
            
            {error && <p style={{ color: 'red' }}>{error}</p>}

            {/* --- Proceed Button --- */}
            <button 
                onClick={handleProceedToGateway}
                disabled={!selectedMethod || loading} // Loading state add kora holo
                style={{ 
                    padding: '10px 20px', 
                    fontSize: '1.1em', 
                    marginTop: '20px', 
                    backgroundColor: (!selectedMethod || loading) ? '#aaa' : 'green', 
                    color: 'white' 
                }}
            >
                {loading ? 'Processing...' : `Proceed with ${selectedMethod || 'Payment'}`}
            </button>
        </div>
    );
};

export default CheckoutPage;