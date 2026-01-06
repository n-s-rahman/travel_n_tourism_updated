import React, { useEffect, useState } from 'react';
// Note: Apnar React Router setup-e 'useLocation' use kora thakte hobe
import { useLocation } from 'react-router-dom'; 
import axios from 'axios';

// 🛑 Payment Status Check API
const API_URL = 'http://localhost:5000/api/payments'; 

const PaymentSuccess = () => {
    const location = useLocation();
    const [status, setStatus] = useState('Verifying...');
    const [bookingDetails, setBookingDetails] = useState(null);
    const [error, setError] = useState(null);
    
    // URL Query Parameter theke transactionId neya (e.g., ?transactionId=BOOK-...)
    const query = new URLSearchParams(location.search);
    const transactionId = query.get('transactionId'); 

    useEffect(() => {
        if (!transactionId) {
            setError("Error: No transaction ID found in URL.");
            setStatus('Failed');
            return;
        }

        // 💡 Backend Verification Call
        const verifyPaymentStatus = async () => {
            try {
                // Notun toiri kora route-ke call kora: GET /api/payments/status/:transactionId
                const response = await axios.get(`${API_URL}/status/${transactionId}`); 
                
                // Response body-te (paymentController theke) status pawa
                const { status: bookingStatus, packageName, amount } = response.data;

                if (bookingStatus === 'CONFIRMED') {
                    setStatus('Success');
                    setBookingDetails({ packageName, amount });
                } else {
                    setStatus('Payment Failed'); 
                    setError('Transaction found but status is not confirmed. Please contact support.');
                }

            } catch (err) {
                console.error("Verification Error:", err.response ? err.response.data : err.message);
                setStatus('Verification Failed');
                setError("Could not verify booking status with the server. Booking might not be found.");
            }
        };

        verifyPaymentStatus();
    }, [transactionId]);


    // 💡 UI Display Logic
    const renderContent = () => {
        
        // --- Error/Failure State ---
        if (error || status === 'Payment Failed' || status === 'Verification Failed') {
            return (
                <div style={{ color: 'red', textAlign: 'center' }}>
                    <h2>❌ {status}</h2>
                    <p>{error || 'An unexpected error occurred.'}</p>
                    <p>Please contact support with Reference ID: <strong>{transactionId}</strong></p>
                </div>
            );
        }

        // --- Verifying State ---
        if (status === 'Verifying...') {
            return (
                <div style={{ textAlign: 'center' }}>
                    <h2>Verifying Payment...</h2>
                    <p>Please wait while we confirm your transaction with our records.</p>
                </div>
            );
        }
        
        // --- Success State ---
        return (
            <div style={{ textAlign: 'center', color: '#28a745' }}>
                <h2>✅ Payment Successful!</h2> 
                <h3>Booking Confirmed</h3>
                

                <div style={{ border: '1px solid #ccc', padding: '15px', maxWidth: '400px', margin: '20px auto', backgroundColor: 'white' }}>
                    <p><strong>Package:</strong> {bookingDetails?.packageName || 'Loading...'}</p>
                    <p><strong>Amount Paid:</strong> BDT {bookingDetails?.amount || 'N/A'}</p>
                    <p><strong>Transaction ID:</strong> {transactionId}</p>
                </div>
                
                <p>We have successfully processed your booking. The confirmation email and e-ticket have been sent to your registered email address.</p>
                <button 
                    onClick={() => window.location.href = '/user/dashboard'} 
                    style={{ padding: '10px 20px', marginTop: '20px', backgroundColor: '#007bff', color: 'white', border: 'none', cursor: 'pointer' }}
                >
                    Go to Dashboard
                </button>
            </div>
        );
    };

    return (
        <div style={{ padding: '40px', backgroundColor: '#f9f9f9', minHeight: '80vh' }}>
            {renderContent()}
        </div>
    );
};

export default PaymentSuccess;