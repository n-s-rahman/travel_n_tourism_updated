// frontend/src/components/CurrencySelector.jsx

import React from 'react';
import { useCurrency } from '../context/CurrencyContext';

const CurrencySelector = () => {
  const { 
    selectedCurrency, 
    changeCurrency, 
    loadingRates, 
    availableCurrencies, 
    rateError 
  } = useCurrency();

  if (loadingRates) {
    return <small>Loading currencies...</small>;
  }

  if (rateError) {
    return <small style={{color: 'red'}}>Currency data error. (Showing USD)</small>;
  }
  
  const options = availableCurrencies;

  return (
    <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#f9f9f9', borderRadius: '5px', padding: '5px' }}>
      <label htmlFor="currency-select" style={{ marginRight: '10px', fontSize: '0.9em' }}>
        View in:
      </label>
      <select
        id="currency-select"
        value={selectedCurrency}
        onChange={(e) => changeCurrency(e.target.value)}
        style={{ padding: '5px', borderRadius: '3px', border: '1px solid #ccc' }}
      >
        {options.map(code => (
          <option key={code} value={code}>
            {code}
          </option>
        ))}
      </select>
    </div>
  );
};

export default CurrencySelector;