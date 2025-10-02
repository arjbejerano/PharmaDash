# Pharma Supply Chain Digital Dashboard

The **Pharma Supply Chain Digital Dashboard** is a full-stack web application designed to optimize pharmaceutical inventory by providing **real-time monitoring** and **predictive decision support**.  

Its core mission is to move beyond manual inventory tracking by leveraging **demand forecasting** to help managers:
- Anticipate future stock needs  
- Prevent costly shortages  
- Ensure efficient resource allocation  

The system functions as a **Single-Page Application (SPA)**, ensuring a fast, highly interactive user experience focused on **data clarity and access**.

---

## 🚀 Core Functional Features

### 1. Real-Time Inventory Monitoring
- **Inventory Table**: Displays essential metrics, including:
  - Current **Stock Level**
  - Pre-defined **Reorder Point**
  - Physical **Location** of each pharmaceutical product  

- **Automated Alerts**:  
  Products whose stock levels fall below the reorder point are automatically flagged as **URGENT REORDER**, ensuring managers can immediately prioritize high-risk items.  

- **Interactive Filtering**:  
  Users can filter the inventory list by:
  - **Alert Status** (only items flagged for URGENT REORDER)  
  - **Location** (e.g., *Warehouse A* or *Distribution Hub B*)  

---

### 2. Advanced Demand Forecasting
- **7-Day Forecast**:  
  A dedicated analytics section visualizes predicted demand for any selected drug over the next 7 days.  

- **Prophet Integration**:  
  The backend leverages **Facebook Prophet** for time-series analysis, providing high-confidence demand predictions with confidence intervals.  

This transforms monitoring into **strategic planning**, enabling proactive purchasing and production scheduling.  

---

## 🛠️ Technical Stack and Architecture

The project follows a **decoupled client-server architecture** focused exclusively on **read operations (GET requests)** for maximum stability.  

### Frontend (Client-Side)
- **Technology**: React (JavaScript/JSX)  
- **Visualization**: [Chart.js](https://www.chartjs.org/) for responsive demand forecast charts  
- **Styling & Layout**:  
  - CSS Grid for a **two-column desktop layout** (Inventory Table + Forecast Chart)  
  - Mobile-responsive design  
- **Data Handling**:  
  - React Hooks (`useState`, `useEffect`)  
  - Native `fetch` with **exponential backoff** for robust API calls  

### Backend (Server-Side)
- **Technology**: Python with [Flask](https://flask.palletsprojects.com/)  
- **API Endpoints**:  
  - `/api/inventory` → Current stock data  
  - `/api/forecast/{drug_id}` → Predictive demand data  
- **Data Science**: [Prophet](https://facebook.github.io/prophet/) for time-series forecasting  
- **Data Persistence**: In-memory Python list (`INVENTORY`) simulating a database  
- **Cross-Origin Communication**: [Flask-CORS](https://flask-cors.readthedocs.io/) for secure frontend-backend interaction  

---

## 🌐 Deployment Strategy

The project is structured for **hybrid deployment**:

- **Frontend**:  
  - Deployed to a static hosting service (e.g., **GitHub Pages**)  

- **Backend**:  
  - Deployed as a dynamic web service (e.g., **Render**, or equivalent hosting provider)  

This ensures the **analytical engine** (Flask + Prophet) remains available to power the dashboard.  

---
