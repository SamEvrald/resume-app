// frontend/src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // This will be your Tailwind CSS input file
import App from './App';
// Removed: import reportWebVitals from './reportWebVitals'; // No longer needed as per structure

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Removed: reportWebVitals(); // No longer needed
