// backend/routes/currency.route.js

const express = require('express');
const router = express.Router();

// FIX: Controller-er nam onujayi import path change kora holo
const currencyController = require('../controllers/currencyController'); // <--- Ager shomosshya solution

router.get('/rates', currencyController.getExchangeRates);

module.exports = router;