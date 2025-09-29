import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

// Register Chart.js components required for the Line chart
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// IMPORTANT: Use your actual live Render API URL here
const API_BASE_URL = 'https://pharma-supply-chain-dashboard.onrender.com/api';

// --- ForecastChart Component Logic (Moved Inline) ---

const ForecastChart = ({ API_BASE_URL, selectedDrugId }) => {
    const [chartData, setChartData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [drugName, setDrugName] = useState('Loading...');

    useEffect(() => {
        if (!selectedDrugId || !API_BASE_URL) {
            setChartData(null);
            return;
        }

        setLoading(true);
        setError(null);
        setChartData(null);

        const fetchForecast = async () => {
            try {
                // Construct the full forecast URL 
                const url = `${API_BASE_URL.replace('/api', '')}/api/forecast/${selectedDrugId}`;
                const response = await fetch(url);
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                
                if (data.error) {
                    throw new Error(data.error);
                }

                // Extract dates and predicted sales for the chart
                const dates = data.forecast.map(item => item.date);
                const sales = data.forecast.map(item => item.predicted_sales);

                setDrugName(data.drug_name);
                setChartData({
                    labels: dates,
                    datasets: [
                        {
                            label: 'Predicted Daily Demand (Units)',
                            data: sales,
                            borderColor: 'rgba(59, 130, 246, 1)', // Tailwind blue-500
                            backgroundColor: 'rgba(59, 130, 246, 0.2)',
                            tension: 0.2,
                            fill: true,
                        },
                    ],
                });
            } catch (e) {
                console.error("Forecast fetch failed:", e);
                setError(`Could not load forecast data. (${e.message})`);
                setDrugName('Error Loading');
            } finally {
                setLoading(false);
            }
        };

        fetchForecast();
    }, [selectedDrugId, API_BASE_URL]);

    // Chart options for aesthetics
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    color: '#4b5563', // gray-600
                    font: { size: 14, family: 'Inter, sans-serif' }
                }
            },
            title: {
                display: true,
                text: `${drugName} - 7-Day Demand Forecast`,
                color: '#1f2937', // gray-800
                font: { size: 18, weight: 'bold', family: 'Inter, sans-serif' }
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                title: { display: true, text: 'Predicted Units (yhat)', color: '#6b7280' },
                grid: { color: '#e5e7eb' },
                ticks: { color: '#374151' }
            },
            x: {
                title: { display: true, text: 'Date', color: '#6b7280' },
                ticks: { color: '#374151' }
            }
        }
    };

    if (loading) {
        return (
            <div className="text-center p-6 text-gray-500">
                <p>Running Prophet model...</p>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mt-4"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center p-6 bg-red-100 text-red-700 rounded-lg border border-red-300">
                <p className="font-bold">Forecast Error</p>
                <p className="text-sm">{error}</p>
            </div>
        );
    }

    if (!chartData) {
        return (
            <div className="text-center p-6 text-gray-500 border border-gray-200 rounded-lg">
                <p>Select an inventory item to view the 7-day demand forecast.</p>
            </div>
        );
    }

    return (
        <div className="h-full w-full p-4">
            <div style={{ height: '350px' }}>
                <Line options={options} data={chartData} />
            </div>
        </div>
    );
};

// --- End of ForecastChart Logic ---


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
  if (loading) return <div className="text-xl text-center p-12 text-gray-500 bg-gray-50 rounded-lg shadow-inner m-8">Loading Inventory Data...</div>;
  if (error) return <div className="text-xl text-center p-12 text-red-700 bg-red-100 border border-red-400 rounded-lg shadow-md m-8">{error}</div>;

  // --- Filtering Logic (Applied before rendering) ---
  const filteredInventory = inventoryData
    .filter(drug => showOnlyAlerts ? drug.alert : true) // Filter by Alert state
    .filter(drug => locationFilter === 'All' ? true : drug.location === locationFilter); // Filter by Location

  // Extract unique locations for the dropdown
  const uniqueLocations = ['All', ...new Set(inventoryData.map(d => d.location))];

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8 font-inter antialiased">
      {/* Tailwind Script MUST be included in the HTML/JSX output */}
      <script src="https://cdn.tailwindcss.com"></script>
      
      <div className="max-w-6xl mx-auto bg-white shadow-xl rounded-2xl overflow-hidden">
        
        <header className="p-6 bg-indigo-600 text-white shadow-lg">
          <h1 className="text-3xl font-extrabold">Pharma Supply Chain Digital Dashboard</h1>
          <p className="text-indigo-200 mt-1 text-sm">Leveraging Prophet AI for Forecasting and SQL for Real-Time Inventory Tracking</p>
        </header>

        {/* ---------------------------------------------------- */}
        {/* INVENTORY STATUS & AUTOMATION SECTION */}
        <section className="p-6 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2 text-indigo-800">Inventory Status & Automated Alerts</h2>

          {/* Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mb-6 bg-indigo-50 p-4 rounded-xl shadow-inner border border-indigo-200">
            <button
              className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 text-sm shadow-md 
                ${showOnlyAlerts 
                  ? 'bg-red-600 text-white hover:bg-red-700' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              onClick={() => setShowOnlyAlerts(!showOnlyAlerts)}
            >
              {showOnlyAlerts ? 'Showing Alerts Only (Click to Show All)' : 'Show Only Urgent Reorders'}
            </button>
            
            <select 
              className="px-4 py-2 border border-indigo-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-sm text-gray-700"
              value={locationFilter} 
              onChange={(e) => setLocationFilter(e.target.value)}
            >
              {uniqueLocations.map(loc => (
                <option key={loc} value={loc} className="text-gray-900">Filter by: {loc}</option>
              ))}
            </select>

            {/* Display the filtered data count */}
            <p className="item-count text-indigo-800 ml-auto font-medium text-sm">
              Showing <strong className="text-indigo-900">{filteredInventory.length}</strong> of <strong className="text-indigo-900">{inventoryData.length}</strong> Items
            </p>
          </div>

          {/* Inventory Table */}
          <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-indigo-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider">Drug Name</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider">Stock Level</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider">Reorder Point</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredInventory.map(drug => (
                  <tr 
                    key={drug.id} 
                    className={`cursor-pointer transition-all duration-150 hover:bg-yellow-50 
                        ${drug.alert ? 'bg-red-50 hover:bg-red-100' : ''} 
                        ${selectedDrugId === drug.id ? 'bg-indigo-100 font-semibold shadow-inner' : ''}`}
                    onClick={() => setSelectedDrugId(drug.id)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{drug.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{drug.stock.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{drug.reorder_point.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{drug.location}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${drug.alert ? 'bg-red-200 text-red-900' : 'bg-green-100 text-green-800'}`}>
                        {drug.alert ? 'URGENT REORDER' : 'OK'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ---------------------------------------------------- */}
        {/* DEMAND FORECASTING & ANALYTICS SECTION */}
        <section className="p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2 text-indigo-800">Demand Forecast (Prophet Analytics)</h2>
          
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center mb-6">
              <label htmlFor="drug-select" className="font-medium text-gray-700 whitespace-nowrap">Select Drug for Forecast:</label>
              <select
                  id="drug-select"
                  className="px-4 py-2 border border-indigo-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition-colors w-full md:w-auto text-gray-700"
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

          {/* Forecast Chart Rendering - Passing API_BASE_URL and selectedDrugId */}
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
  );
}

export default App;
