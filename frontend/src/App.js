import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import DemandForecast from './pages/DemandForecast';
import SpoilagePrediction from './pages/SpoilagePrediction';
import RouteOptimization from './pages/RouteOptimization';
import './styles/App.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/demand" element={<DemandForecast />} />
            <Route path="/spoilage" element={<SpoilagePrediction />} />
            <Route path="/routes" element={<RouteOptimization />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
