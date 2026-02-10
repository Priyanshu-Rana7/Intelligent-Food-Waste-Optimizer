# 🍎 Intelligent Food Waste Optimizer

**Intelligent Food Waste Optimizer: An AI platform reducing retail waste using Prophet for demand forecasting and Random Forest for spoilage detection. It analyzes environmental data to predict decay and features an automated Route Optimization module to map high-risk inventory to NGOs.**

---

## 🌟 Highlights

- **Predictive Analytics**: Forecasts market demand 7 days in advance.
- **Environmental Intelligence**: Predicts spoilage risk using live temperature, humidity, and shelf-life data.
- **Logistics Integration**: Automatically calculates optimized donation routes to the nearest NGOs using the Haversine formula.
- **One-Click Execution**: Integrated startup script for seamless backend and frontend.

---

## 📊 Feature Breakdown

### 🖥️ Dashboard (Centralized Monitoring)
The "Command Center" providing high-level summaries of inventory health. It tracks KPIs such as total products, predicted average demand, and real-time spoilage alerts, giving managers a 360-degree view of operations.

### 📈 Demand Prediction (Inventory Optimization)
Powered by the **Facebook Prophet** model, this module analyzes historical sales patterns to project future needs. By matching supply with predicted demand, businesses can prevent overstocking—the primary cause of retail food waste.

### 🍄 Spoilage Risk Detection (Environmental AI)
Uses a **Random Forest Classifier** to analyze environmental stressors (Temperature, Humidity, Rainfall) alongside product-specific shelf-life. The system generates a 7-day risk progression curve to identify exactly when items cross safety thresholds.

### 🚛 Route Optimization (Actionable Logistics)
Transforms AI insights into action. When stock is flagged as high-risk, the system uses the **Haversine Formula** to find the most efficient donation route to nearby NGOs/Food Banks, ensuring surplus reaches those in need before it spoils.

---

## 🛠️ Tech Stack

- **Frontend**: React.js, Lucide-React, Recharts, Axios
- **Backend**: Flask, Pandas, Scikit-learn, Facebook Prophet, Joblib
- **Data**: CSV-based "Digital Twin" of store inventory and NGO locations

---

## 🚀 Getting Started

### Prerequisites
- Python 3.8+
- Node.js & npm

### Installation & Run
1. **Clone the repository**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/Intelligent-Food-Waste-Optimizer.git
   cd Intelligent-Food-Waste-Optimizer
   ```

2. **Quick Start (Windows)**:
   Double-click the `start.bat` file in the root directory. This will automatically:
   - Start the Flask Backend (Port 5000)
   - Start the React Frontend (Port 3000)

---

## 📂 Project Structure

```text
├── backend/
│   ├── app.py              # Flask server & ML integration
│   ├── models/             # Trained .pkl models
│   └── data/               # NGO and environmental data
├── frontend/
│   ├── src/                # React components & pages
│   └── package.json        # Frontend dependencies
├── ml/
│   ├── train_demand.py     # Training script for Prophet
│   └── train_spoilage.py   # Training script for Random Forest
└── start.bat               # One-click automation script
```

---

## 📄 License
This project is licensed under the MIT License - see the `LICENSE` file for details.
