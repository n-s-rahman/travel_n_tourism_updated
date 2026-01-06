// frontend/src/components/BookingForm.jsx (Styled and Updated)

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext'; 
import { useCurrency } from '../context/CurrencyContext'; 
import CurrencySelector from './CurrencySelector'; 
import PaymentSimulator from './PaymentSimulator'; 

// --- Configuration ---
const API_URL = 'http://localhost:5000/api/bookings'; 
const PACKAGE_API_URL = 'http://localhost:5000/api/packages';
const DUMMY_PACKAGE_ID = '65b45a9e338c2f1f008f1b63'; 

const roomOptions = ['Single', 'Double', 'Suite', 'N/A'];

const BookingForm = ({ packageId = DUMMY_PACKAGE_ID }) => {
    
    // ACCESS THE AUTH TOKEN VIA CONTEXT
    const { user } = useAuth();
    const authToken = user?.token;

    // Currency Hook Use
    const { formatPrice } = useCurrency();

    // --- NEW STATE for Conditional Rendering ---
    const [newBooking, setNewBooking] = useState(null); 
    const [showPaymentGateway, setShowPaymentGateway] = useState(false); 

    // State for form inputs
    const [formData, setFormData] = useState({
        tripDate: '',
        numberOfPeople: 1,
        travelers: [{ firstName: '', lastName: '', dob: '', passportNumber: '' }],
        roomType: 'N/A',
        insurance: false,
    });
    const [packageInfo, setPackageInfo] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(''); 

    // --- Fetch package details ---
    useEffect(() => {
        const fetchPackage = async () => {
            try {
                // Using Port 5000
                const res = await axios.get(`${PACKAGE_API_URL}/${packageId}`); 
                setPackageInfo(res.data);
            } catch (err) {
                setError('Failed to fetch package details. Check if the package ID is correct or if the backend is running on port 5000.');
            }
        };
        fetchPackage();
    }, [packageId]);

    // --- Manage traveler array size ---
    useEffect(() => {
        const numPeople = Number(formData.numberOfPeople);
        setFormData(prev => {
            const currentTravelers = prev.travelers.slice(0, numPeople);
            while (currentTravelers.length < numPeople) {
                currentTravelers.push({ firstName: '', lastName: '', dob: '', passportNumber: '' });
            }
            return { ...prev, travelers: currentTravelers };
        });
    }, [formData.numberOfPeople]);

    // --- Handlers for form fields ---
    const handleMainChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleTravelerChange = (index, e) => {
        const { name, value } = e.target;
        const newTravelers = [...formData.travelers];
        newTravelers[index][name] = value;
        setFormData(prev => ({ ...prev, travelers: newTravelers }));
    };

    // --- Form Submission (Initial Booking) ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!authToken) {
            setError('You must be logged in to submit a booking.');
            return;
        }

        setLoading(true);

        const dataToSend = {
            packageId,
            tripDate: formData.tripDate,
            numberOfPeople: Number(formData.numberOfPeople),
            travelers: formData.travelers,
            roomType: formData.roomType,
            insurance: formData.insurance,
        };

        try {
            // Using Port 5000
            const res = await axios.post(API_URL, dataToSend, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });
            
            setNewBooking(res.data.booking);
            setSuccess(''); 
            
            setFormData({
                tripDate: '',
                numberOfPeople: 1,
                travelers: [{ firstName: '', lastName: '', dob: '', passportNumber: '' }],
                roomType: 'N/A',
                insurance: false,
            });

        } catch (err) {
            console.error('Booking error:', err.response ? err.response.data : err.message);
            const errorMessage = err.response?.data?.message || 'Failed to create booking. Check availability or inputs.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };


    // --- Show the Payment Gateway Component ---
    const handlePayNow = () => {
        if (!authToken || !newBooking?._id) {
            setError('Authentication or Booking ID missing.');
            return;
        }
        setShowPaymentGateway(true); 
        setError(''); 
    };
    
    // --- Handle final payment confirmation from simulator ---
    const handlePaymentConfirmation = async () => {
        if (!authToken || !newBooking?._id) {
            setError('Authentication or Booking ID missing.');
            return;
        }
        
        try {
            // Backend endpoint: POST http://localhost:5000/api/bookings/:id/pay
            const payUrl = `${API_URL}/${newBooking._id}/pay`;
            
            const res = await axios.post(payUrl, {}, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });

            setNewBooking(res.data.booking); 
            setSuccess(res.data.message);
            setShowPaymentGateway(false); 
            alert(`Payment successful! Booking ID ${newBooking._id} is now CONFIRMED! CHECK YOUR EMAIL FOR PROOF!`);

        } catch (err) {
            console.error('Payment Confirmation Error:', err.response ? err.response.data : err.message);
            const errorMessage = err.response?.data?.message || 'Payment failed. Please try again.';
            setError(errorMessage);
            throw new Error(errorMessage); 
        } 
    };


    if (!packageInfo) return <div className="p-10 text-center animate-pulse text-purple-600">Loading package details...</div>;

    
    // --- Date Formatting Logic ---
    const today = new Date().toISOString().split('T')[0];
    
    // Set min date to strictly today or later. If package startDate is in future, use that.
    // If package startDate is in past, default to today.
    let minTripDate = today;
    if (packageInfo.startDate) {
        const pkgStartDate = new Date(packageInfo.startDate).toISOString().split('T')[0];
        if (pkgStartDate > today) {
            minTripDate = pkgStartDate;
        }
    } 

    const maxTripDate = packageInfo.endDate 
        ? new Date(packageInfo.endDate).toISOString().split('T')[0] 
        : ''; 
        
    const displayStartDate = packageInfo.startDate 
        ? new Date(packageInfo.startDate).toLocaleDateString() 
        : 'Not Specified';

    
    // ======================================================================
    // CONDITIONAL RENDER 1: PAYMENT GATEWAY SIMULATOR
    // ======================================================================
    if (newBooking && showPaymentGateway) {
        return (
            <PaymentSimulator 
                booking={newBooking} 
                onConfirm={handlePaymentConfirmation}
                onCancel={() => setShowPaymentGateway(false)} 
            />
        );
    }

    
    // ======================================================================
    // CONDITIONAL RENDER 2: PAYMENT CONFIRMATION SCREEN (WHEN GATEWAY IS CLOSED)
    // ======================================================================
    if (newBooking) {
        const bookingStatus = newBooking.status;
        const isConfirmed = bookingStatus === 'Confirmed';
        
        return (
            <div className={`max-w-xl mx-auto p-8 border-2 ${isConfirmed ? 'border-green-500 bg-green-50' : 'border-blue-500 bg-blue-50'} rounded-xl shadow-lg`}>
                <h2 className={`text-2xl font-bold mb-4 ${isConfirmed ? 'text-green-600' : 'text-blue-600'} text-center`}>
                    {isConfirmed ? '✅ Booking Confirmed!' : '🎉 Booking Request Submitted!'}
                </h2>
                
                {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
                
                <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
                   <CurrencySelector />
                </div>

                <p className="text-xl mb-4 font-medium text-center text-gray-700">
                    Your booking status: <span className="font-bold">{bookingStatus}</span>
                </p>
                
                <p className="text-2xl font-bold mb-8 text-center text-gray-900">
                    Total Amount Due: <span className="text-purple-600">{formatPrice(newBooking.totalPrice)}</span>
                </p>

                {!isConfirmed && (
                    <button
                        onClick={handlePayNow} 
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 flex items-center justify-center gap-2"
                    >
                        <span>💳</span> Go to Payment
                    </button>
                )}
                
                <p className="mt-6 text-gray-500 text-sm text-center">
                    {isConfirmed 
                       ? 'Your trip is secured. A confirmation email has been sent.'
                       : 'This booking is saved. Complete payment to confirm your spot.'
                    }
                </p>
                
                <button 
                    onClick={() => setNewBooking(null)}
                    className="block mx-auto mt-4 text-purple-600 hover:text-purple-800 underline"
                >
                    Book Another Package
                </button>
            </div>
        );
    }
    
    // ======================================================================
    // DEFAULT RENDER: BOOKING FORM 
    // ======================================================================
    return (
        <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-xl">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-4">
                Book Trip: <span className="text-purple-600">{packageInfo.name}</span>
            </h2>
            
            <div className="grid grid-cols-2 gap-4 mb-6 text-sm text-gray-600">
                <p>Price: <span className="font-semibold text-gray-900">{formatPrice(packageInfo.price || 0)}/person</span></p>
                <p>Max Capacity: <span className="font-semibold text-gray-900">{packageInfo.maxPeople} people</span></p>
            </div>

            {/* Display Error Messages */}
            {error && <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Trip Start Date <span className="font-normal text-gray-500">({displayStartDate})</span>
                        </label>
                        <input 
                            type="date" 
                            name="tripDate"
                            value={formData.tripDate}
                            onChange={handleMainChange}
                            required
                            min={minTripDate} 
                            max={maxTripDate} 
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Number of People</label>
                        <input 
                            type="number" 
                            name="numberOfPeople"
                            value={formData.numberOfPeople}
                            onChange={handleMainChange}
                            min="1"
                            max={packageInfo.maxPeople}
                            required
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>
                </div>

                {/* --- Traveler Details Section --- */}
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                    <h3 className="text-lg font-semibold mb-4 text-gray-700">Traveler Details</h3>
                    {formData.travelers.map((traveler, index) => (
                        <div key={index} className="mb-6 last:mb-0 pb-6 border-b border-gray-200 last:border-0">
                            <h4 className="text-sm font-bold text-gray-500 mb-3 uppercase tracking-wide">Traveler {index + 1}</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                                <input 
                                    type="text" 
                                    name="firstName"
                                    value={traveler.firstName}
                                    onChange={(e) => handleTravelerChange(index, e)}
                                    placeholder="First Name"
                                    required
                                    className="px-4 py-2 border rounded focus:ring-1 focus:ring-purple-500 outline-none"
                                />
                                <input 
                                    type="text" 
                                    name="lastName"
                                    value={traveler.lastName}
                                    onChange={(e) => handleTravelerChange(index, e)}
                                    placeholder="Last Name"
                                    required
                                    className="px-4 py-2 border rounded focus:ring-1 focus:ring-purple-500 outline-none"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input 
                                    type="date" 
                                    name="dob"
                                    value={traveler.dob}
                                    onChange={(e) => handleTravelerChange(index, e)}
                                    className="px-4 py-2 border rounded focus:ring-1 focus:ring-purple-500 outline-none text-gray-600"
                                />
                                <input 
                                    type="text" 
                                    name="passportNumber"
                                    value={traveler.passportNumber}
                                    onChange={(e) => handleTravelerChange(index, e)}
                                    placeholder="Passport Number (Optional)"
                                    className="px-4 py-2 border rounded focus:ring-1 focus:ring-purple-500 outline-none"
                                />
                            </div>
                        </div>
                    ))}
                </div>

                {/* --- Options Section --- */}
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-semibold mb-4 text-gray-700">Package Customization</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">Room Type Preference</label>
                            <select
                                name="roomType"
                                value={formData.roomType}
                                onChange={handleMainChange}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                            >
                                {roomOptions.map(option => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-center">
                            <label className="flex items-center space-x-3 cursor-pointer p-3 border rounded-lg hover:bg-gray-50 w-full transition">
                                <input 
                                    type="checkbox" 
                                    name="insurance"
                                    checked={formData.insurance}
                                    onChange={handleMainChange}
                                    className="form-checkbox h-5 w-5 text-purple-600"
                                />
                                <span className="text-gray-700">Add Travel Insurance (10% extra)</span>
                            </label>
                        </div>
                    </div>
                </div>

                <div className="pt-4">
                    <button 
                        type="submit" 
                        disabled={loading || !formData.tripDate || formData.travelers.some(t => !t.firstName) || !authToken} 
                        className={`w-full text-white font-bold py-4 px-6 rounded-lg shadow-lg transform transition hover:-translate-y-1 ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700'}`}
                    >
                        {loading ? 'Processing...' : 'Confirm Booking & Proceed to Payment'} 
                    </button>
                    {!authToken && <p className="text-red-500 text-center mt-3 text-sm">* You must log in to submit a booking.</p>}
                </div>
            </form>
        </div>
    );
};

export default BookingForm;