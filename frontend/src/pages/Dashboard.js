import React, { useEffect, useState } from 'react';
import { Package, Layers, AlertCircle, Clock } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import { getProductName } from '../utils/productNames';

// Avg shelf life across 10 products (7+2+3+5+6+5+2+3+14+4 / 10 = 5.1 days)
const AVG_SHELF_LIFE = 5.1;
const TOTAL_PRODUCTS = 10;
const CATEGORIES_COUNT = 6;

const weeklyTrend = [
    { name: 'Mon', demand: 118 },
    { name: 'Tue', demand: 145 },
    { name: 'Wed', demand: 172 },
    { name: 'Thu', demand: 138 },
    { name: 'Fri', demand: 205 },
    { name: 'Sat', demand: 248 },
    { name: 'Sun', demand: 227 },
];

const Dashboard = () => {
    const [highRiskCount, setHighRiskCount] = useState('—');
    const [highRiskItems, setHighRiskItems] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:5000/predict/route')
            .then(res => {
                const routes = res.data.optimized_routes || [];
                setHighRiskCount(routes.length);
                setHighRiskItems(routes.slice(0, 3)); // show top 3 in alerts
            })
            .catch(() => {
                setHighRiskCount('—');
                setHighRiskItems([]);
            });
    }, []);

    // Color badge based on risk score
    const riskColor = (score) => score >= 60 ? '#ef4444' : score >= 40 ? '#f59e0b' : '#22c55e';

    return (
        <div className="dashboard-page">
            <header className="page-header">
                <h2>Market Overview</h2>
                <p>Real-time analytics and waste optimization metrics.</p>
            </header>

            <div className="stats-grid">
                {/* Stat 1: Total Products */}
                <div className="stat-card">
                    <div className="stat-card-header">
                        <span className="stat-label">Total Products</span>
                        <Package size={20} className="logo-icon" />
                    </div>
                    <div className="stat-value">{TOTAL_PRODUCTS}</div>
                </div>

                {/* Stat 2: Categories Tracked */}
                <div className="stat-card">
                    <div className="stat-card-header">
                        <span className="stat-label">Categories Tracked</span>
                        <Layers size={20} className="logo-icon" />
                    </div>
                    <div className="stat-value">{CATEGORIES_COUNT}</div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                        Vegetable · Dairy · Meat · Fruit · Bakery · Beverage
                    </div>
                </div>

                {/* Stat 3: High Spoilage Risk Items (live) */}
                <div className="stat-card">
                    <div className="stat-card-header">
                        <span className="stat-label">High Spoilage Risk Items</span>
                        <AlertCircle size={20} style={{ color: '#ef4444' }} />
                    </div>
                    <div className="stat-value">{highRiskCount}</div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                        Products flagged for NGO dispatch today
                    </div>
                </div>

                {/* Stat 4: Avg Shelf Life */}
                <div className="stat-card">
                    <div className="stat-card-header">
                        <span className="stat-label">Avg. Shelf Life</span>
                        <Clock size={20} className="logo-icon" />
                    </div>
                    <div className="stat-value">{AVG_SHELF_LIFE} <span style={{ fontSize: '1rem', fontWeight: 500 }}>days</span></div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                        Across all 10 monitored products
                    </div>
                </div>
            </div>

            <div className="content-grid">
                {/* Weekly Demand Trend Chart */}
                <div className="panel">
                    <div className="panel-title">
                        <Layers size={20} className="logo-icon" />
                        Weekly Demand Trend
                    </div>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <LineChart data={weeklyTrend}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                                    itemStyle={{ color: '#2ecc71', fontWeight: 600 }}
                                    formatter={(v) => [`${v} units`, 'Demand']}
                                />
                                <Line type="monotone" dataKey="demand" stroke="#2ecc71" strokeWidth={3} dot={{ fill: '#2ecc71', r: 4 }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Live Spoilage Alerts */}
                <div className="panel">
                    <div className="panel-title">
                        <AlertCircle size={20} style={{ color: '#ef4444' }} />
                        Live Spoilage Alerts
                    </div>
                    <div className="alerts-list">
                        {highRiskItems.length > 0 ? (
                            highRiskItems.map(item => (
                                <div key={item.product_id} className="alert-item"
                                    style={{ padding: '0.75rem 0', borderBottom: '1px solid #f1f5f9' }}>
                                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                                        {item.product_id} — {getProductName(item.product_id)}
                                    </div>
                                    <div style={{ color: riskColor(item.risk_score), fontSize: '0.75rem', marginTop: '2px' }}>
                                        Risk: {item.risk_score}% • Flagged for NGO dispatch
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div style={{ color: '#94a3b8', fontSize: '0.875rem', padding: '1rem 0' }}>
                                {highRiskCount === '—' ? 'Loading alerts...' : '✅ No high-risk items today!'}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
