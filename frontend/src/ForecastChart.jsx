import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
// Chart.js requires specific component imports for use with react-chartjs-2
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register necessary Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const API_BASE_URL = 'http://127.0.0.1:5000/api';

// Component accepts the currently selected drug ID from the parent (App.jsx)
function ForecastChart({ drugId }) {
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!drugId) return; // Don't run if no drug is selected

    setLoading(true);
    const fetchForecast = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/forecast/${drugId}`);
        if (!response.ok) {
          throw new Error(`HTTP status: ${response.status}`);
        }
        const data = await response.json();
        setForecastData(data.forecast);
      } catch (e) {
        console.error("Could not fetch forecast:", e);
        setForecastData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchForecast();
  }, [drugId]); // Reruns whenever the selected drugId changes

  if (loading) return <p>Loading forecast...</p>;
  if (!forecastData || forecastData.length === 0) return <p>No forecast data available.</p>;

  // Prepare data for Chart.js
  const data = {
    labels: forecastData.map(d => d.date),
    datasets: [
      {
        label: `Predicted Demand (Units)`,
        data: forecastData.map(d => d.predicted_sales),
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.1, // Smooths the line
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: '7-Day Demand Forecast (Prophet Model)' },
    },
    scales: {
      y: { beginAtZero: true, title: { display: true, text: 'Units' } },
    },
  };

  return (
    <div style={{ maxWidth: '800px', margin: '20px auto' }}>
      <Line data={data} options={options} />
    </div>
  );
}

export default ForecastChart;