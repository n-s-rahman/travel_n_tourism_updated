// backend/controllers/currencyController.js (Modified for BDT Base)

const axios = require('axios');
require('dotenv').config(); 

const API_KEY = process.env.EXCHANGE_RATE_API_KEY; 

// Reverted to USD Base as per frontend requirement
const BASE_URL = `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/USD`; 

exports.getExchangeRates = async (req, res) => {
    
    if (!API_KEY) {
        console.error("🔴 CRITICAL: API Key is not set in .env.");
        return res.status(500).json({ message: "API Key missing." });
    }
    
    try {
        const response = await axios.get(BASE_URL);

        if (response.data.result === 'success') {
            console.log('🟢 SUCCESS: Exchange rates retrieved with USD base.');
            
            const { conversion_rates } = response.data;
            
            // Return all relevant rates relative to 1 USD
            const filteredRates = {
                USD: 1, 
                BDT: conversion_rates.BDT,
                EUR: conversion_rates.EUR,
                GBP: conversion_rates.GBP,
                INR: conversion_rates.INR, 
                CAD: conversion_rates.CAD,
                AUD: conversion_rates.AUD,
                JPY: conversion_rates.JPY,
            };

            return res.status(200).json({ 
                base: 'USD',
                rates: filteredRates,
                lastUpdated: response.data.time_last_update_utc
            });

        } else {
            const errorDetails = response.data['error-type'] || 'Unknown API Error';
            console.error('🔴 EXTERNAL API REJECTED:', errorDetails); 
            return res.status(500).json({ message: 'API call rejected.', details: errorDetails });
        }

    } catch (error) {
        console.error('🔴 FATAL ERROR IN CATCH BLOCK:', error.message);
        return res.status(500).json({ message: 'Network or server error.' });
    }
};