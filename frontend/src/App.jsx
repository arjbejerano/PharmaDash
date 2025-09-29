import React, { useState, useEffect } from 'react';
import ForecastChart from './ForecastChart.jsx';
import './App.css';
const API_BASE_URL = 'https://pharma-supply-chain-dashboard.onrender.com/api';
// const API_BASE_URL = 'http://127.0.0.1:5000/api'; 

function App() {
  // State to hold all inventory data fetched from Flask
  const [inventoryData, setInventoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); 
  
  // State for interactive features (Digitalization)
  const [selectedDrugId, setSelectedDrugId] = useState('');
  const [showOnlyAlerts, setShowOnlyAlerts] = useState(false);
  const [locationFilter, setLocationFilter] = useState('All');

  // Effect hook runs once after the component mounts to fetch data
  useEffect(() => {
    const fetchInventory = async () => {
      // Exponential backoff logic for API call robustness
      const maxRetries = 3;
      let currentRetry = 0;

      while (currentRetry < maxRetries) {
        try {
          const response = await fetch(`${API_BASE_URL}/inventory`);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          setInventoryData(data);
          if (data.length > 0) {
            setSelectedDrugId(data[0].id); // Set first drug as default for chart
          }
          setError(null);
          setLoading(false);
          return; // Exit on success
        } catch (e) {
          currentRetry++;
          if (currentRetry >= maxRetries) {
            console.error("Could not fetch inventory after retries:", e);
            setError("Failed to connect to the backend server after retrying. Is Flask running?");
            setLoading(false);
            return;
          }
          // Wait with exponential backoff before retrying
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, currentRetry))); 
        }
      }
    };

    fetchInventory();
  }, []); 

  // --- Conditional Rendering for Loading/Error States ---
  if (loading) return <div className="text-xl text-center p-12 text-gray-500 bg-gray-50 rounded-lg shadow-inner m-8">Loading Inventory Data...</div>;
  if (error) return <div className="text-xl text-center p-12 text-red-700 bg-red-100 border border-red-400 rounded-lg shadow-md m-8">{error}</div>;

  // --- Filtering Logic (Applied before rendering) ---
  const filteredInventory = inventoryData
    .filter(drug => showOnlyAlerts ? drug.alert : true) // Filter by Alert state
    .filter(drug => locationFilter === 'All' ? true : drug.location === locationFilter); // Filter by Location

  // Extract unique locations for the dropdown
  const uniqueLocations = ['All', ...new Set(inventoryData.map(d => d.location))];

  return (
    <>
      {/* CRITICAL: These elements remain here to ensure global styling and responsiveness are correctly initialized */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <style>
        {`
          body, html, #root {
            background-color: #f9fafb !important; /* Forces bg-gray-50 */
            font-family: 'Inter', sans-serif;
          }
        `}
      </style>
      
      <div className="min-h-screen bg-gray-50 p-4 sm:p-8 font-inter antialiased">
        
        <div className="dashboard-container">
          
          <header className="header">
            <h1>Pharma Supply Chain Digital Dashboard</h1>
            <p>Leveraging Prophet AI for Forecasting and SQL for Real-Time Inventory Tracking</p>
          </header>

          {/* ---------------------------------------------------- */}
          {/* INVENTORY STATUS & AUTOMATION SECTION */}
          <section className="inventory-section">
            <h2>Inventory Status & Automated Alerts</h2>

            {/* Filter Controls for Digitalization */}
            <div className="filter-controls">
              <button
                className={`filter-button ${showOnlyAlerts ? 'active' : ''}`}
                onClick={() => setShowOnlyAlerts(!showOnlyAlerts)}
              >
                {showOnlyAlerts ? 'Showing Alerts Only' : 'Show Only Urgent Reorders'}
              </button>
              
              <select 
                className="location-filter"
                value={locationFilter} 
                onChange={(e) => setLocationFilter(e.target.value)}
              >
                {uniqueLocations.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>

              {/* Display the filtered data count */}
              <p className="item-count">Showing <strong>{filteredInventory.length}</strong> of <strong>{inventoryData.length}</strong> Items</p>
            </div>

            {/* Inventory Table (Uses filteredInventory) */}
            <table>
              <thead>
                <tr>
                  <th>Drug Name</th>
                  <th>Stock Level</th>
                  <th>Reorder Point</th>
                  <th>Location</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.map(drug => (
                  <tr 
                    key={drug.id} 
                    className={drug.alert ? 'alert-low-stock' : 'status-ok'}
                  >
                    <td>{drug.name}</td>
                    <td>{drug.stock.toLocaleString()}</td>
                    <td>{drug.reorder_point.toLocaleString()}</td>
                    <td>{drug.location}</td>
                    <td className={drug.alert ? 'alert-text' : 'ok-text'}>
                      {drug.alert ? 'URGENT REORDER' : 'OK'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
          {/* ---------------------------------------------------- */}
          {/* DEMAND FORECASTING & ANALYTICS SECTION */}
          <section className="forecast-section">
            <h2>7-Day Demand Forecast (Prophet Analytics)</h2>
            
            <div className="forecast-controls">
                <label htmlFor="drug-select" className="forecast-label">Select Drug for Forecast:</label>
                <select
                    id="drug-select"
                    className="drug-selector"
                    value={selectedDrugId}
                    onChange={(e) => setSelectedDrugId(e.target.value)}
                >
                    {inventoryData.map(drug => (
                        <option key={drug.id} value={drug.id}>
                            {drug.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Forecast Chart Rendering - Now imported from separate file */}
            {selectedDrugId && (
                <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100" style={{ minHeight: '400px' }}>
                    <ForecastChart 
                        API_BASE_URL={API_BASE_URL} 
                        selectedDrugId={selectedDrugId} 
                    />
                </div>
            )}
          </section>
          {/* ---------------------------------------------------- */}

        </div>
      </div>
    </>
  );
}

export default App;
