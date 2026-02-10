import React from 'react';
import { Package, TrendingUp, AlertCircle, ShoppingCart } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
    const data = [
        { name: 'Mon', demand: 120 },
        { name: 'Tue', demand: 150 },
        { name: 'Wed', demand: 180 },
        { name: 'Thu', demand: 140 },
        { name: 'Fri', demand: 210 },
        { name: 'Sat', demand: 250 },
        { name: 'Sun', demand: 230 },
    ];

    return (
        <div className="dashboard-page">
            <header className="page-header">
                <h2>Market Overview</h2>
                <p>Real-time analytics and waste optimization metrics.</p>
            </header>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-card-header">
                        <span className="stat-label">Total Products</span>
                        <Package size={20} className="logo-icon" />
                    </div>
                    <div className="stat-value">5</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-header">
                        <span className="stat-label">Predicted Demand (Avg)</span>
                        <TrendingUp size={20} className="logo-icon" />
                    </div>
                    <div className="stat-value">142 units</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-header">
                        <span className="stat-label">High Spoilage Risk Items</span>
                        <AlertCircle size={20} style={{ color: '#ef4444' }} />
                    </div>
                    <div className="stat-value">1</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-header">
                        <span className="stat-label">Units Sold (Today)</span>
                        <ShoppingCart size={20} className="logo-icon" />
                    </div>
                    <div className="stat-value">185</div>
                </div>
            </div>

            <div className="content-grid">
                <div className="panel">
                    <div className="panel-title">
                        <TrendingUp size={20} className="logo-icon" />
                        Demand Trends
                    </div>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <LineChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                                    itemStyle={{ color: '#2ecc71', fontWeight: 600 }}
                                />
                                <Line type="monotone" dataKey="demand" stroke="#2ecc71" strokeWidth={3} dot={{ fill: '#2ecc71', r: 4 }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="panel">
                    <div className="panel-title">
                        <AlertCircle size={20} style={{ color: '#ef4444' }} />
                        Recent Spoilage Alerts
                    </div>
                    <div className="alerts-list">
                        <div className="alert-item" style={{ padding: '0.75rem 0', borderBottom: '1px solid #f1f5f9' }}>
                            <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>P001 - Fresh Tomatoes</div>
                            <div style={{ color: '#ef4444', fontSize: '0.75rem' }}>Risk: 12% • Shelf life: 2 days remaining</div>
                        </div>
                        <div className="alert-item" style={{ padding: '0.75rem 0', borderBottom: '1px solid #f1f5f9' }}>
                            <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>P005 - Spinach Bundle</div>
                            <div style={{ color: '#f59e0b', fontSize: '0.75rem' }}>Risk: 8% • Temp: 28°C</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
