import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, TrendingUp, AlertTriangle, Leaf, Navigation } from 'lucide-react';

const Sidebar = () => {
    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <Leaf className="logo-icon" size={32} />
                <h1>FOODSENSE</h1>
            </div>
            <nav className="sidebar-nav">
                <NavLink to="/" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                    <LayoutDashboard size={20} />
                    <span>Dashboard</span>
                </NavLink>
                <NavLink to="/demand" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                    <TrendingUp size={20} />
                    <span>Demand Forecasting</span>
                </NavLink>
                <NavLink to="/spoilage" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                    <AlertTriangle size={20} />
                    <span>Spoilage Risk</span>
                </NavLink>
                <NavLink to="/routes" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                    <Navigation size={20} />
                    <span>Route Optimization</span>
                </NavLink>
            </nav>
            <div className="sidebar-footer">
                <p>v1.0.0</p>
            </div>
        </div>
    );
};

export default Sidebar;
