import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

// Register Chart.js components required for the Line chart.
// These registrations are required where the chart component is defined.
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

/**
 * Renders the 7-day demand forecast chart for a selected drug ID.
 * It fetches the forecast data from the backend API.
 */
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
            // Exponential backoff logic for API call robustness
            const maxRetries = 3;
            let currentRetry = 0;

            while (currentRetry < maxRetries) {
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
                    setLoading(false);
                    return; // Exit on success
                } catch (e) {
                    currentRetry++;
                    if (currentRetry >= maxRetries) {
                        console.error("Forecast fetch failed after retries:", e);
                        setError(`Could not load forecast data after retrying. (${e.message})`);
                        setDrugName('Error Loading');
                        setLoading(false);
                        return;
                    }
                    // Wait with exponential backoff before retrying
                    await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, currentRetry))); 
                }
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
                    color: '#4b5563', 
                    font: { size: 14, family: 'Inter, sans-serif' }
                }
            },
            title: {
                display: true,
                text: `${drugName} - 7-Day Demand Forecast`,
                color: '#1f2937', 
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

export default ForecastChart;
