import React, { useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useWallet } from '../context/WalletContext';

const WalletPage = () => {
    const { balance, transactions, refreshWallet, loading } = useWallet();

    useEffect(() => {
        refreshWallet();
    }, [refreshWallet]);

    const getTypeColor = (type) => {
        switch (type) {
            case 'refund': return 'text-green-600 bg-green-50';
            case 'deposit': return 'text-blue-600 bg-blue-50';
            case 'payment': return 'text-red-600 bg-red-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Header Section */}
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl shadow-xl p-8 mb-8 text-white relative overflow-hidden">
                    <div className="relative z-10 text-center">
                        <p className="text-purple-100 text-lg mb-2 opacity-90 uppercase tracking-widest font-semibold">Current Balance</p>
                        <h1 className="text-6xl font-extrabold mb-4 tracking-tight">
                            ${balance.toFixed(2)}
                        </h1>
                        <div className="flex justify-center gap-4 mt-6">
                            <button 
                                onClick={refreshWallet}
                                className="bg-white/20 hover:bg-white/30 text-white px-6 py-2 rounded-full backdrop-blur-md transition font-semibold"
                            >
                                {loading ? 'Refreshing...' : '🔄 Refresh Data'}
                            </button>
                        </div>
                    </div>
                    {/* Decorative Background Circles */}
                    <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-black/10 rounded-full blur-3xl"></div>
                </div>

                {/* Transaction History */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-8 py-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                        <h2 className="text-2xl font-bold text-gray-800">Transaction History</h2>
                        <span className="text-sm text-gray-500 font-medium">Total: {transactions.length} items</span>
                    </div>

                    <div className="divide-y divide-gray-100">
                        {transactions.length === 0 ? (
                            <div className="p-12 text-center">
                                <span className="text-5xl mb-4 block">🏜️</span>
                                <p className="text-gray-500 text-lg">No transactions found in your history.</p>
                            </div>
                        ) : (
                            transactions.map((transaction) => (
                                <div key={transaction._id} className="p-6 hover:bg-gray-50 transition flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl ${getTypeColor(transaction.type)}`}>
                                            {transaction.type === 'refund' ? '+' : '-'}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 text-lg">{transaction.description}</p>
                                            <div className="flex items-center space-x-3 text-sm text-gray-500 mt-1">
                                                <span className="flex items-center">
                                                    📅 {new Date(transaction.date).toLocaleDateString()}
                                                </span>
                                                <span className="flex items-center capitalize px-2 py-0.5 rounded-md border border-gray-200 bg-white">
                                                    {transaction.type}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-2xl font-black ${transaction.type === 'payment' ? 'text-red-600' : 'text-green-600'}`}>
                                            {transaction.type === 'payment' ? '-' : '+'}${transaction.amount.toFixed(2)}
                                        </p>
                                        {transaction.bookingId && (
                                            <p className="text-xs text-purple-500 mt-1 font-semibold uppercase tracking-wider">Booking ID: {transaction.bookingId.substring(0, 8)}...</p>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WalletPage;
