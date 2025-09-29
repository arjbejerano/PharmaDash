import React, { useState, useEffect } from 'react';
import ForecastChart from './ForecastChart';
import './App.css'; 

const API_BASE_URL = 'https://pharma-supply-chain-dashboard.onrender.com/api';

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
      } catch (e) {
        console.error("Could not fetch inventory:", e);
        setError("Failed to connect to the backend server. Is Flask running?");
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, []); 

  // --- Conditional Rendering for Loading/Error States ---
  if (loading) return <div className="loading">Loading Inventory Data...</div>;
  if (error) return <div className="error">{error}</div>;

  // --- Filtering Logic (Applied before rendering) ---
  const filteredInventory = inventoryData
    .filter(drug => showOnlyAlerts ? drug.alert : true) // Filter by Alert state
    .filter(drug => locationFilter === 'All' ? true : drug.location === locationFilter); // Filter by Location

  // Extract unique locations for the dropdown
  const uniqueLocations = ['All', ...new Set(inventoryData.map(d => d.location))];

  return (
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
            <label htmlFor="drug-select">Select Drug for Forecast:</label>
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

        {/* Pass the selected ID to the chart component */}
        {selectedDrugId && <ForecastChart drugId={selectedDrugId} />}
      </section>
      {/* ---------------------------------------------------- */}

    </div>
  );
}

export default App;
