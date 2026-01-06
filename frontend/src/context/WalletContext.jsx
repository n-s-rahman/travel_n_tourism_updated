import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const WalletContext = createContext();

export const useWallet = () => {
    const context = useContext(WalletContext);
    if (!context) {
        throw new Error('useWallet must be used within a WalletProvider');
    }
    return context;
};

export const WalletProvider = ({ children }) => {
    const { user } = useAuth();
    const [balance, setBalance] = useState(0);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);

    const refreshWallet = useCallback(async () => {
        if (!user || !user.token) return;
        
        setLoading(true);
        try {
            const res = await axios.get('http://localhost:5000/api/wallet', {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setBalance(res.data.balance);
            setTransactions(res.data.transactions || []);
        } catch (error) {
            console.error("Error fetching wallet data:", error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        refreshWallet();
    }, [refreshWallet]);

    return (
        <WalletContext.Provider value={{ balance, transactions, refreshWallet, loading }}>
            {children}
        </WalletContext.Provider>
    );
};
