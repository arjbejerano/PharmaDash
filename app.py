import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from flask import Flask, jsonify, request
from prophet import Prophet
import logging # Added for better error handling/output
import os # NECESSARY: For reading the port from the environment variable

# SQLAlchemy Imports
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

# Suppress Prophet output during training for cleaner console
logging.getLogger('prophet').setLevel(logging.WARNING)

# --- FLASK AND CORS SETUP ---
app = Flask(__name__)
from flask_cors import CORS
CORS(app)

# ----------------------------------------------------------------
# --- DATABASE SETUP (SQLAlchemy/SQLite) ---

# Connect to a file named 'inventory.db'
ENGINE = create_engine('sqlite:///inventory.db')
Session = sessionmaker(bind=ENGINE)
Base = declarative_base()

# Database Model for Inventory (Includes reorder_point)
class Inventory(Base):
    __tablename__ = 'inventory'
    id = Column(String, primary_key=True)
    name = Column(String)
    stock = Column(Integer)
    reorder_point = Column(Integer)
    location = Column(String)

# Database Model for Sales (used for forecasting)
class Sales(Base):
    __tablename__ = 'sales'
    id = Column(Integer, primary_key=True, autoincrement=True)
    drug_id = Column(String)
    date = Column(String) # Stored as string 'YYYY-MM-DD'
    sales = Column(Integer)

# Create the database and tables
Base.metadata.create_all(ENGINE)

# ----------------------------------------------------------------
# --- DATA INITIALIZATION AND SIMULATION ---

# Simulate 90 days of historical sales data
def generate_sales_data(drug_id, base_sales, days=90):
    start_date = datetime.now() - timedelta(days=days)
    dates = [start_date + timedelta(days=i) for i in range(days)]
    sales = [
        int(base_sales * (1 + np.random.normal(0, 0.1) + (0.5 * np.sin(i / 7))))
        for i in range(days)
    ]
    return dates, sales

# Function to initialize (or re-initialize) data in the database
def initialize_data():
    session = Session()

    # 1. Initial Inventory Data (Note: D002 stock < reorder_point for the alert)
    initial_inventory = [
        Inventory(id='D001', name='Drug-X Pain Reliever', stock=5500, reorder_point=5000, location='Warehouse A'),
        Inventory(id='D002', name='Drug-Y Antiviral', stock=1200, reorder_point=1500, location='Warehouse B'), 
        Inventory(id='D003', name='Drug-Z Vaccine', stock=8900, reorder_point=10000, location='Warehouse A')
    ]
    
    # Only add inventory if the table is empty (prevents duplicates on restart)
    if session.query(Inventory).count() == 0:
        session.add_all(initial_inventory)

    # 2. Generate and Insert Sales Data (Only insert if Sales table is empty)
    if session.query(Sales).count() == 0:
        sales_to_add = []
        for drug_id, base in [('D001', 100), ('D002', 30), ('D003', 150)]:
            dates, sales = generate_sales_data(drug_id, base)
            for date, sales_count in zip(dates, sales):
                sales_to_add.append(Sales(drug_id=drug_id, date=date.strftime('%Y-%m-%d'), sales=sales_count))
        session.add_all(sales_to_add)
    
    session.commit()
    session.close()

initialize_data()

# ----------------------------------------------------------------
# --- FLASK ROUTES (API ENDPOINTS) ---

@app.route('/', methods=['GET'])
def index():
    return "Pharma Supply Chain API Server is Running! Access inventory at /api/inventory"

# --- 3.1 INVENTORY STATUS API (Database Query) ---
@app.route('/api/inventory', methods=['GET'])
def get_inventory_status():
    session = Session()
    # Query all inventory items from the database
    inventory_items = session.query(Inventory).all()
    session.close()
    
    status_list = []
    for item in inventory_items:
        # Automation Logic: Check if current stock is below the reorder point
        alert = item.stock < item.reorder_point
        status_list.append({
            'id': item.id,
            'name': item.name,
            'stock': item.stock,
            'reorder_point': item.reorder_point,
            'location': item.location,
            'alert': alert  # The core automation flag
        })
    return jsonify(status_list)

# --- 3.2 DEMAND FORECASTING API (Prophet Analytics) ---
@app.route('/api/forecast/<drug_id>', methods=['GET'])
def get_demand_forecast(drug_id):
    session = Session()
    
    # 1. Filter and prepare sales data from the Sales table
    sales_records = session.query(Sales).filter_by(drug_id=drug_id).all()
    session.close()

    if not sales_records:
        return jsonify({'error': 'Sales data not found for this drug'}), 404

    # Convert query results to a DataFrame for Prophet
    data = [{'ds': r.date, 'y': r.sales} for r in sales_records]
    drug_sales_df = pd.DataFrame(data)
    
    # Ensure date is datetime
    drug_sales_df['ds'] = pd.to_datetime(drug_sales_df['ds'])
    
    # 2. Train the Prophet Model
    try:
        model = Prophet(daily_seasonality=True, changepoint_prior_scale=0.01) # Added changepoint_prior_scale for better fit
        model.fit(drug_sales_df)

        # 3. Create a future DataFrame for the next 7 days
        future = model.make_future_dataframe(periods=7, include_history=False)

        # 4. Predict the demand
        forecast = model.predict(future)

        # 5. Prepare results for JSON response
        forecast_data = [
            {'date': date.strftime('%Y-%m-%d'), 'predicted_sales': max(0, int(round(sales)))} # Ensure sales is not negative
            for date, sales in zip(forecast['ds'], forecast['yhat'])
        ]

        # Fetch drug name for the response (requires a separate query)
        session = Session()
        drug_item = session.query(Inventory).filter_by(id=drug_id).first()
        session.close()

        return jsonify({
            'drug_id': drug_id,
            'drug_name': drug_item.name if drug_item else drug_id,
            'forecast': forecast_data
        })

    except Exception as e:
        return jsonify({'error': f'Prophet forecasting failed: {str(e)}'}), 500

# --- 3.3 RUN THE FLASK APP ---
if __name__ == '__main__':
    # MANDATORY: Bind to 0.0.0.0 and read port from environment for cloud deployment (e.g., Render)
    # The default port 5000 is used for local testing if the PORT environment variable is missing.
    app.run(host='0.0.0.0', port=os.environ.get('PORT', 5000))
