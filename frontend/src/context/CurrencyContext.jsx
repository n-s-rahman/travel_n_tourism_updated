// frontend/src/context/CurrencyContext.js (FINAL & FIXED)

import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Backend Currency API URL set to port 5000
const CURRENCY_API_URL = 'http://localhost:5000/api/currency/rates'; 

const CurrencyContext = createContext();

export const useCurrency = () => {
  return useContext(CurrencyContext);
};

// 🟢 FIX: getCurrencySymbol function define kora holo
const getCurrencySymbol = (code) => {
    const currencySymbols = { USD: '$', EUR: '€', GBP: '£', BDT: '৳', INR: '₹', CAD: 'C$', AUD: 'A$', JPY: '¥' };
    return currencySymbols[code] || code;
};

export const CurrencyProvider = ({ children }) => {
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [exchangeRates, setExchangeRates] = useState({ USD: 1 });
  const [loadingRates, setLoadingRates] = useState(true);
  const [rateError, setRateError] = useState(null);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const response = await axios.get(CURRENCY_API_URL);
        
        if (response.data && response.data.rates) {
            const rates = response.data.rates;
            setExchangeRates(rates);
            
            const savedCurrency = localStorage.getItem('selectedCurrency') || 'USD';
            if (rates[savedCurrency]) {
                setSelectedCurrency(savedCurrency);
            }
        }
      } catch (error) {
        console.error("Failed to fetch exchange rates:", error);
        setRateError("Could not load exchange rates. Prices shown in USD.");
      } finally {
        setLoadingRates(false);
      }
    };
    fetchRates();
  }, []);

  const changeCurrency = (currencyCode) => {
    setSelectedCurrency(currencyCode);
    localStorage.setItem('selectedCurrency', currencyCode);
  };

  const convertPrice = (priceUSD) => {
    const rate = exchangeRates[selectedCurrency] || 1;
    return priceUSD * rate;
  };
  
  const formatPrice = (priceUSD) => {
    const convertedPrice = convertPrice(priceUSD);
    const symbol = getCurrencySymbol(selectedCurrency);
    
    return `${symbol} ${convertedPrice.toFixed(2)}`;
  };


  const value = {
    selectedCurrency,
    exchangeRates,
    loadingRates,
    rateError,
    changeCurrency,
    convertPrice,
    formatPrice, 
    // 🟢 FIX: getCurrencySymbol ekhon shothikbhabe export kora holo
    getCurrencySymbol, 
    availableCurrencies: Object.keys(exchangeRates),
  };

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
};