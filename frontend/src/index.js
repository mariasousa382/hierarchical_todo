/**
 * React Application Entry Point
 * 
 * This is the first JavaScript file that runs when the app loads.
 * It connects the React application to the HTML DOM.
 * 
 * What happens here:
 * 1. Import React and ReactDOM libraries
 * 2. Import global CSS styles (applied to entire app)
 * 3. Import the root App component (contains all other components)
 * 4. Find the <div id="root"> in public/index.html
 * 5. Render the React app inside that div
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';  // Global styles applied to entire application
import App from './App';  // Root component containing all routing and pages

// Get the root div from public/index.html where React will inject the app
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render the entire React application
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
