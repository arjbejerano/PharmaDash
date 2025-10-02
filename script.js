const API_BASE_URL = 'http://127.0.0.1:5000/api';

// --- A. INVENTORY STATUS (AUTOMATION) ---

async function fetchInventory() {
    try {
        const response = await fetch(`${API_BASE_URL}/inventory`);
        const data = await response.json();
        renderInventoryTable(data);
    } catch (error) {
        console.error('Error fetching inventory:', error);
    }
}

function renderInventoryTable(inventoryData) {
    const tbody = document.getElementById('inventory-body');
    tbody.innerHTML = ''; // Clear existing rows

    inventoryData.forEach(drug => {
        const row = tbody.insertRow();
        
        // Automation highlight: visually show the alert status
        row.className = drug.alert ? 'alert-low-stock' : 'status-ok'; 

        row.insertCell().textContent = drug.name;
        row.insertCell().textContent = drug.stock.toLocaleString();
        row.insertCell().textContent = drug.reorder_point.toLocaleString();
        row.insertCell().textContent = drug.location;
        
        // Digitalization/Automation output
        const statusCell = row.insertCell();
        statusCell.textContent = drug.alert ? 'URGENT REORDER' : 'OK';
        statusCell.className = drug.alert ? 'alert-text' : 'ok-text';
    });
}

// --- B. DEMAND FORECASTING (ANALYTICS) ---

let forecastChart;

// Populate the drug selector and set up the change listener
function setupDrugSelector(inventoryData) {
    const selector = document.getElementById('drug-selector');
    inventoryData.forEach(drug => {
        const option = document.createElement('option');
        option.value = drug.id;
        option.textContent = drug.name;
        selector.appendChild(option);
    });

    selector.addEventListener('change', (e) => {
        fetchDemandForecast(e.target.value);
    });

    // Load forecast for the first drug by default
    if (inventoryData.length > 0) {
        fetchDemandForecast(inventoryData[0].id);
    }
}

async function fetchDemandForecast(drugId) {
    try {
        const response = await fetch(`${API_BASE_URL}/forecast/${drugId}`);
        const data = await response.json();
        renderForecastChart(data.forecast);
    } catch (error) {
        console.error('Error fetching forecast:', error);
    }
}

function renderForecastChart(forecastData) {
    const ctx = document.getElementById('forecastChart').getContext('2d');
    const labels = forecastData.map(d => d.date);
    const data = forecastData.map(d => d.predicted_sales);

    if (forecastChart) {
        forecastChart.destroy(); // Destroy previous chart instance
    }

    forecastChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Predicted Demand (Units)',
                data: data,
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
                fill: true
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// --- C. INITIALIZATION ---

async function init() {
    await fetchInventory(); // Load inventory data first
    // Use the inventory data to set up the drug selector for the forecast section
    const invResponse = await fetch(`${API_BASE_URL}/inventory`);
    const invData = await invResponse.json();
    setupDrugSelector(invData);
}

init();