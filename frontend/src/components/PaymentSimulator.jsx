// frontend/src/components/PaymentSimulator.jsx

import React, { useState } from 'react';
import { useCurrency } from '../context/CurrencyContext';
import CurrencySelector from './CurrencySelector'; 

const PaymentSimulator = ({ booking, onConfirm, onCancel }) => {
    
    const { formatPrice, selectedCurrency } = useCurrency();
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentError, setPaymentError] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('card'); // 'card', 'bkash', 'nagad', 'upay'

    const handleConfirmClick = async () => {
        setIsProcessing(true);
        setPaymentError(null);
        
        try {
            await onConfirm(); 
        } catch (error) {
            setPaymentError(error.message || 'Payment failed due to a server error.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div style={{ maxWidth: '700px', margin: 'auto', padding: '40px', border: 'none', borderRadius: '15px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', backgroundColor: '#fff' }}>
            <h2 style={{ color: '#6b46c1', marginBottom: '25px', borderBottom: '2px solid #f3f4f6', paddingBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                💳 Secure Payment Gateway
            </h2>
            
            {paymentError && (
                 <div style={{ color: '#721c24', backgroundColor: '#f8d7da', padding: '15px', marginBottom: '20px', borderRadius: '8px', border: '1px solid #f5c6cb' }}>
                    ❌ Payment Failed: {paymentError}
                 </div>
            )}

            <div style={{ marginBottom: '25px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '10px' }}>
                <p style={{ margin: '0 0 5px 0', color: '#666', fontSize: '0.9em' }}>Booking Reference</p>
                <p style={{ margin: 0, fontWeight: 'bold', fontFamily: 'monospace', fontSize: '1.1em' }} >#{booking._id}</p>
            </div>

            {/* Currency Converter Section */}
            <div style={{ marginBottom: '30px' }}>
                <h3 style={{ fontSize: '1.1em', marginBottom: '15px', color: '#4a5568' }}>1. Select Currency</h3>
                <CurrencySelector />
            </div>

            {/* Payment Method Selection */}
            <div style={{ marginBottom: '30px' }}>
                <h3 style={{ fontSize: '1.1em', marginBottom: '15px', color: '#4a5568' }}>2. Select Payment Method</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
                    {['Card', 'Bkash', 'Nagad', 'Upay'].map(method => (
                        <div 
                            key={method}
                            onClick={() => setPaymentMethod(method.toLowerCase())}
                            style={{ 
                                padding: '15px', 
                                border: `2px solid ${paymentMethod === method.toLowerCase() ? '#6b46c1' : '#e2e8f0'}`,
                                borderRadius: '10px',
                                cursor: 'pointer',
                                textAlign: 'center',
                                backgroundColor: paymentMethod === method.toLowerCase() ? '#f3e8ff' : '#fff',
                                transition: 'all 0.2s',
                                fontWeight: 'bold',
                                color: paymentMethod === method.toLowerCase() ? '#6b46c1' : '#4a5568'
                            }}
                        >
                            {method === 'Card' ? '💳 Credit Card' : 
                             method === 'Bkash' ? '🌸 bKash' : 
                             method === 'Nagad' ? '📮 Nagad' : '🔵 Upay'}
                        </div>
                    ))}
                </div>
            </div>

            {/* Total Price Display */}
            <div style={{ backgroundColor: '#2d3748', color: 'white', padding: '25px', borderRadius: '12px', marginBottom: '30px', textAlign: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                <p style={{ margin: 0, fontSize: '0.9em', opacity: 0.8, marginBottom: '5px' }}>Total Amount to Pay</p>
                <p style={{ fontSize: '2em', fontWeight: 'bold', margin: '0 0 5px 0' }}>
                    {formatPrice(booking.totalPrice)}
                </p>
                {selectedCurrency !== 'USD' && (
                    <p style={{ fontSize: '0.85em', opacity: 0.7, margin: 0 }}>
                        (Approx. {booking.totalPrice.toFixed(2)} USD)
                    </p>
                )}
            </div>
            
            {/* Actions */}
            <div style={{ display: 'flex', gap: '15px' }}>
                <button
                    onClick={handleConfirmClick}
                    disabled={isProcessing}
                    style={{ 
                        flex: 2,
                        padding: '16px', 
                        backgroundColor: isProcessing ? '#805ad5' : '#6b46c1', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '8px', 
                        cursor: isProcessing ? 'not-allowed' : 'pointer', 
                        fontSize: '1.1em', 
                        fontWeight: 'bold',
                        boxShadow: '0 4px 6px rgba(107, 70, 193, 0.3)',
                        transition: 'transform 0.1s'
                    }}
                >
                    {isProcessing ? 'Processing Payment...' : `Pay via ${paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1)}`}
                </button>
                
                <button
                    onClick={onCancel}
                    disabled={isProcessing}
                    style={{ 
                        flex: 1,
                        padding: '16px', 
                        backgroundColor: '#fff', 
                        color: '#e53e3e', 
                        border: '2px solid #e53e3e', 
                        borderRadius: '8px', 
                        cursor: 'pointer', 
                        fontSize: '1.1em', 
                        fontWeight: 'bold',
                        transition: 'background-color 0.1s'
                    }}
                >
                    Cancel
                </button>
            </div>
            
            <p style={{ marginTop: '25px', fontSize: '0.85em', color: '#a0aec0', textAlign: 'center' }}>
                🔒 Your transaction is secured with SSL encryption.
            </p>
        </div>
    );
};

export default PaymentSimulator;