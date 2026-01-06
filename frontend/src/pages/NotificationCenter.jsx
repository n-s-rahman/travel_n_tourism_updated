import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const NotificationCenter = () => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/notifications', {
                headers: { Authorization: `Bearer ${user.token}` },
            });
            setNotifications(res.data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const markAsRead = async (id) => {
        try {
            await axios.patch(`http://localhost:5000/api/notifications/${id}/read`, {}, {
                headers: { Authorization: `Bearer ${user.token}` },
            });
            // Update local state
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
        } catch (error) {
            console.error("Failed to mark read");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-4xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-6 text-gray-800">📬 Notification Center</h1>
                
                {loading ? (
                    <div className="text-center py-10">Loading...</div>
                ) : notifications.length === 0 ? (
                    <div className="text-center py-10 bg-white rounded-xl shadow p-8 text-gray-500">
                        <p className="text-xl">No notifications yet.</p>
                        <p>We'll notify you when you book a trip!</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {notifications.map(notification => (
                            <div 
                                key={notification._id} 
                                onClick={() => markAsRead(notification._id)}
                                className={`p-6 rounded-xl border cursor-pointer transition-all duration-200 ${
                                    notification.isRead 
                                        ? 'bg-white border-gray-200 text-gray-600' 
                                        : 'bg-blue-50 border-blue-200 shadow-md transform hover:-translate-y-1'
                                }`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className={`font-bold text-lg ${notification.isRead ? 'text-gray-800' : 'text-blue-700'}`}>
                                        {notification.type === 'PAYMENT_SUCCESS' && '💳 '}
                                        {notification.type === 'BOOKING_CONFIRMED' && '🎫 '}
                                        {notification.type === 'CANCELLATION' && '❌ '}
                                        {notification.type === 'INFO' && 'ℹ️ '}
                                        {notification.title}
                                    </h3>
                                    <span className="text-sm text-gray-400">
                                        {new Date(notification.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="text-gray-700">{notification.message}</p>
                                {!notification.isRead && (
                                    <div className="mt-3 text-xs font-bold text-blue-600 uppercase tracking-wide">
                                        New Message
                                    </div>
                                )}
                                
                                {notification.emailPreviewUrl && (
                                    <div className="mt-3">
                                        <a 
                                            href={notification.emailPreviewUrl} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            onClick={(e) => e.stopPropagation()} // Prevent triggering markAsRead on parent click
                                            className="inline-flex items-center text-sm font-medium text-purple-600 hover:text-purple-800"
                                        >
                                            <span className="mr-1">📧</span> View Email
                                        </a>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationCenter;
