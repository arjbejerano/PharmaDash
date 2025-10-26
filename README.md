# 💊 Pharma Supply Chain Digital Dashboard

The **Pharma Supply Chain Digital Dashboard** is a full-featured web application built to modernize pharmaceutical inventory management.  
It combines **real-time stock monitoring**, **AI-inspired demand forecasting**, and **automated reorder alerts** — enabling smarter, data-driven supply chain decisions for pharmaceutical distributors, hospitals, and healthcare logistics teams.

---

## 🚀 Core Features Implemented

### 🧾 1. Real-Time Inventory Monitoring
- ✅ Dynamic inventory table with **25 pharmaceutical products**
- ✅ Displays **current stock**, **reorder point**, and **warehouse location**
- ✅ **Automated URGENT REORDER** alerts for low-stock items
- ✅ **Interactive filtering** by alert status and location
- ✅ **Auto-refresh every 30 seconds** for live updates

### 📈 2. Advanced Demand Forecasting
- ✅ **7-day demand forecast visualization** using Chart.js
- ✅ **Prophet-like algorithm simulation** for time-series analysis
- ✅ Includes **confidence intervals** and **historical trend comparison**
- ✅ **Export forecast data as CSV**
- ✅ **On-demand forecast generation** for selected products

### 🧩 3. Dashboard Layout & UX
- ✅ **Two-column responsive layout** (Inventory + Forecast)
- ✅ **Key metrics overview cards** (e.g., alert count, accuracy rate, locations)
- ✅ **Mobile-friendly interface**
- ✅ **Professional styling** optimized for the pharmaceutical industry

---

## 📊 Dashboard Highlights

| Metric | Value |
|--------|--------|
| ⚠️ Products flagged for urgent reorder | **12** |
| 📈 Forecast accuracy (simulated Prophet) | **87%** |
| 🏭 Active locations | **3** (Warehouse A, Distribution Hub B, Warehouse C) |
| 🔄 Auto-refresh interval | Every **30 seconds** |

---

## 🛠️ Technical Implementation

### 🧱 Frontend Architecture
| Layer | Technology |
|-------|-------------|
| Framework | **React (Vite + TypeScript)** |
| Charts | **Chart.js** |
| Styling | **Tailwind CSS + shadcn/ui** |
| Data Simulation | Mock API service simulating backend endpoints |
| Build Tool | Vite for blazing-fast dev and build times |

### 📊 Data & Analytics
- 25 sample products with stock, reorder, and location data  
- Forecasting engine simulating **Prophet algorithm** behavior  
- Confidence interval calculations and simulated seasonality  
- Color-coded alerts for immediate visual feedback  

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the repository
```bash
git clone https://github.com/<your-username>/<your-repo-name>.git
cd <your-repo-name>
