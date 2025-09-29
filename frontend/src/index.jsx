import React from 'react';
import ReactDOM from 'react-dom/client';
// Import the main application component, explicitly adding the .jsx extension for reliable resolution
import App from './App.jsx'; 
// Note: This import assumes App.jsx is in the same directory (frontend/src)

// Get the root element from public/index.html
const rootElement = document.getElementById('root');

// Create the root container and render the App component
if (rootElement) {
    ReactDOM.createRoot(rootElement).render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );
} else {
    // Basic error logging if the root element isn't found
    console.error("Failed to find the root element in index.html with id='root'.");
}
