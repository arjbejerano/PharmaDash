# Python Flask Backend for Pharma Supply Chain Dashboard
# This server simulates a database connection and Prophet forecasting
# Run this file using: python server.py
from flask import Flask, jsonify
from flask_cors import CORS
import pandas as pd
import random
from datetime import datetime, timedelta

# --- Configuration ---
app = Flask(__name__)
# Enable CORS for the React frontend (usually running on port 3000)
CORS(app) 
PORT = 5000

# --- Simulated In-Memory Database (Replace with SQL in a production setup) ---
INVENTORY_DATA = [
    {
        "id": "drug_001", 
        "name": "AcetaZyme", 
        "stock": 5500, 
        "reorder_point": 6000, 
        "location": "Warehouse A", 
        "alert": True
    },
    {
        "id": "drug_002", 
        "name": "Vitamax C200", 
        "stock": 12000, 
        "reorder_point": 10000, 
        "location": "Warehouse B", 
        "alert": False
    },
    {
        "id": "drug_003", 
        "name": "GentaStat", 
        "stock": 450, 
        "reorder_point": 500, 
        "location": "Warehouse A", 
        "alert": True
    },
    {
        "id": "drug_004", 
        "name": "Xylitol 5mg", 
        "stock": 8500, 
        "reorder_point": 9000, 
        "location": "Distribution Center", 
        "alert": True
    },
    {
        "id": "drug_005", 
        "name": "Zoplicone Plus", 
        "stock": 25000, 
        "reorder_point": 15000, 
        "location": "Warehouse B", 
        "alert": False
    },
    {
        "id": "drug_006", 
        "name": "Bactrofen", 
        "stock": 1500, 
        "reorder_point": 1600, 
        "location": "Warehouse A", 
        "alert": True
    }
]

# --- Helper function to simulate Prophet forecasting (7 days) ---
def generate_forecast(drug_id, base_sales):
    """Simulates a 7-day predicted sales forecast based on a drug's ID."""
    forecast = []
    
    # Simple logic: drugs with odd IDs have slightly lower trend, even IDs higher trend
    trend_factor = 1.05 if int(drug_id.split('_')[-1]) % 2 == 0 else 0.98
    
    start_date = datetime.now().date()
    
    for i in range(1, 8):
        current_date = start_date + timedelta(days=i)
        
        # Calculate daily prediction with random noise and trend
        prediction = int(base_sales * (trend_factor ** i) * random.uniform(0.9, 1.1))
        
        forecast.append({
            "date": current_date.strftime("%Y-%m-%d"),
            "predicted_sales": max(1, prediction) # Ensure sales is at least 1
        })
    return forecast

# --- API Endpoints ---

@app.route('/api/inventory', methods=['GET'])
def get_inventory():
    """Returns the full list of inventory data."""
    print("API hit: /api/inventory")
    return jsonify(INVENTORY_DATA)


@app.route('/api/forecast/<string:drug_id>', methods=['GET'])
def get_forecast(drug_id):
    """Generates a 7-day forecast for the specified drug ID."""
    print(f"API hit: /api/forecast/{drug_id}")
    
    # 1. Find the drug data
    drug = next((d for d in INVENTORY_DATA if d['id'] == drug_id), None)
    
    if not drug:
        return jsonify({"error": "Drug not found"}, 404)
    
    # 2. Determine base sales (using reorder point as a proxy for high demand)
    # The higher the reorder point, the higher the typical demand
    base_sales = drug['reorder_point'] // 50 
    
    # 3. Generate the simulated forecast
    forecast_data = generate_forecast(drug_id, base_sales)
    
    return jsonify({
        "drug_name": drug['name'],
        "id": drug_id,
        "forecast": forecast_data
    })


if __name__ == '__main__':
    print(f"Flask server starting on http://127.0.0.1:{PORT}")
    # Setting debug=True automatically restarts the server on code changes
    app.run(debug=True, port=PORT)
