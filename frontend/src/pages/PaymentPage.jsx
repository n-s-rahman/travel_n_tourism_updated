import React, { useState } from 'react';
import axios from 'axios';

// Backend server URL dhori nicchi: http://localhost:5000
const API_URL = 'http://localhost:5000/api/payments'; 

const PaymentPage = () => {
    // 🛑 Eita shob somoy dynamic booking data hobe (Jemon: props / context theke ashbe)
    const [bookingDetails, setBookingDetails] = useState({
        bookingId: 'MOCK-12345', // Jeta database theke ashe
        amount: 2500,
        packageName: 'Maldives Paradise Escape'
    });
    
    // User input
    const [customerInfo, setCustomerInfo] = useState({
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '01XXXXXXXXX'
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // 🎯 Step 1: Backend-ke call kora
    const handlePaymentInitiation = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await axios.post(`${API_URL}/initiate`, {
                bookingId: bookingDetails.bookingId,
                amount: bookingDetails.amount,
                customerInfo: customerInfo
            });
            
            const { redirectUrl, transactionId, message } = response.data;

            if (redirectUrl) {
                // 🎯 Step 2: User-ke Payment Gateway-te Redirect kora
                console.log(`Redirecting to: ${redirectUrl}`);
                window.location.href = redirectUrl; 
            } else {
                setError(message || "Payment initiation failed to return a redirect URL.");
            }

        } catch (err) {
            console.error("Initiation Error:", err.response ? err.response.data : err.message);
            setError("Failed to initiate payment. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: 'auto' }}>
            <h2>💰 Confirm Payment for Booking</h2>
            
            {/* Booking Summary */}
            <div style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '20px' }}>
                <h3>{bookingDetails.packageName}</h3>
                <p><strong>Booking ID:</strong> {bookingDetails.bookingId}</p>
                <p style={{ fontSize: '1.2em', fontWeight: 'bold' }}>
                    Total Amount: BDT {bookingDetails.amount}
                </p>
            </div>

            {/* Customer Form (Input field will be here) */}
            <div>
                <h4>Customer Details (Needed for Gateway)</h4>
                {/* Simplified input for the mockup */}
                <p>Name: {customerInfo.name}</p>
                <p>Email: {customerInfo.email}</p>
            </div>
            
            {error && <p style={{ color: 'red' }}>{error}</p>}

            <button 
                onClick={handlePaymentInitiation}
                disabled={loading}
                style={{ 
                    padding: '10px 20px', 
                    fontSize: '1.1em', 
                    backgroundColor: loading ? '#aaa' : 'green', 
                    color: 'white',
                    cursor: loading ? 'not-allowed' : 'pointer'
                }}
            >
                {loading ? 'Processing...' : 'Proceed to Pay BDT 2500'}
            </button>

            <p style={{ marginTop: '15px', fontSize: '0.9em' }}>
                *You will be redirected to the secure payment gateway (SSL Commerz Mockup).
            </p>
        </div>
    );
};

export default PaymentPage;