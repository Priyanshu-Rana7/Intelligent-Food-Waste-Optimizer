import React, { useState } from 'react';
import axios from 'axios';
import { Search, AlertTriangle, Loader2, Info, Download } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { exportToCSV } from '../utils/exportCSV';
import { getProductName, resolveProductInput, ALL_PRODUCTS } from '../utils/productNames';

const SpoilagePrediction = () => {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [targetDate, setTargetDate] = useState(new Date().toISOString().split('T')[0]);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleQueryChange = (val) => {
        setQuery(val);
        if (val.length < 1) { setSuggestions([]); return; }
        const lower = val.toLowerCase();
        const filtered = ALL_PRODUCTS.filter(
            p => p.name.toLowerCase().includes(lower) || p.id.toLowerCase().includes(lower)
        );
        setSuggestions(filtered);
    };

    const selectSuggestion = (product) => {
        setQuery(product.name);
        setSuggestions([]);
        submitSearch(product.id);
    };

    const submitSearch = async (productId) => {
        setLoading(true);
        setError(null);
        setData(null);
        try {
            const response = await axios.post('http://localhost:5000/predict/spoilage', {
                product_id: productId,
                date: targetDate
            });
            setData(response.data);
        } catch (err) {
            setError(err.response?.data?.error || 'Product not found. Try P001, P002, etc.');
        } finally {
            setLoading(false);
        }
    };

    const handlePredict = (e) => {
        e.preventDefault();
        const resolved = resolveProductInput(query);
        if (!resolved) {
            setError(`No product found matching "${query}". Try: Milk, Bread, P007, etc.`);
            setData(null);
            return;
        }
        setSuggestions([]);
        submitSearch(resolved);
    };

    return (
        <div className="spoilage-risk-page">
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '3rem' }}>
                <form onSubmit={handlePredict} style={{ display: 'flex', gap: '10px', width: '100%', maxWidth: '800px', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Search by name or ID (e.g. Chicken, Milk, P003)"
                            value={query}
                            onChange={(e) => handleQueryChange(e.target.value)}
                            style={{ width: '100%' }}
                            autoComplete="off"
                        />
                        {suggestions.length > 0 && (
                            <ul style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', zIndex: 100, margin: 0, padding: '4px 0', listStyle: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
                                {suggestions.map(p => (
                                    <li key={p.id} onClick={() => selectSuggestion(p)}
                                        style={{ padding: '0.6rem 1rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                                        onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <span style={{ fontWeight: 600 }}>{p.name}</span>
                                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{p.id}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    <input
                        type="date"
                        className="form-input"
                        value={targetDate}
                        onChange={(e) => setTargetDate(e.target.value)}
                        style={{ flex: 1, minWidth: '200px' }}
                    />
                    <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '0 2rem', background: '#3b82f6' }} disabled={loading}>
                        {loading ? <Loader2 className="animate-spin" size={20} /> : 'Check Spoilage'}
                    </button>
                </form>
            </div>

            <header className="page-header" style={{ textAlign: 'center', marginBottom: '4rem' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>How Spoilage Detection Works</h2>
                <p style={{ maxWidth: '800px', margin: '0 auto', fontSize: '0.95rem', lineHeight: '1.6' }}>
                    Enter a product ID and a tentative date to view its predicted spoilage risk over a 7-day window. The system analyzes historical averages and applies simulated environmental trends to help you prioritize stock management.
                </p>
            </header>

            {error && (
                <div className="alert alert-danger" style={{ maxWidth: '600px', margin: '0 auto 2rem' }}>
                    {error}
                </div>
            )}

            {data && (
                <div className="content-grid" style={{ gridTemplateColumns: 'minmax(250px, 300px) 1fr', alignItems: 'start' }}>
                    <div className="stat-card" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center' }}>
                        <div className="stat-label" style={{ fontSize: '1rem', marginBottom: '0.5rem', fontWeight: 600, color: '#3b82f6' }}>
                            Spoilage Risk Forecast
                        </div>
                        <div style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', marginBottom: '1rem' }}>
                            {getProductName(data.product_id)}
                            <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginLeft: '6px' }}>({data.product_id})</span>
                        </div>
                        <div className="stat-value" style={{ fontSize: '3.5rem', color: '#1e293b' }}>
                            {data.avg_risk}%
                        </div>
                        <div className="stat-label" style={{ marginTop: '1rem' }}>
                            Avg Risk over next 7 days
                        </div>
                        <button
                            onClick={() => exportToCSV(
                                data.forecast.map(r => ({ Product: data.product_id, Name: getProductName(data.product_id), Date: r.date, 'Risk Score (%)': r.risk_score })),
                                `spoilage_risk_${data.product_id}.csv`
                            )}
                            style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center', background: '#ef4444', color: '#fff', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}
                        >
                            <Download size={16} /> Export CSV
                        </button>
                    </div>

                    <div className="panel" style={{ padding: '2rem' }}>
                        <div style={{ textAlign: 'center', marginBottom: '1.5rem', fontWeight: 600, color: '#64748b' }}>
                            7-Day Spoilage Risk Chart
                        </div>
                        <div style={{ width: '100%', height: 350 }}>
                            <ResponsiveContainer>
                                <AreaChart data={data.forecast}>
                                    <defs>
                                        <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} dy={10} />
                                    <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                                    <Tooltip
                                        contentStyle={{ background: '#fff', border: 'none', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                        formatter={(value) => [`${value}%`, 'Risk Score']}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="risk_score"
                                        stroke="#ef4444"
                                        strokeWidth={2}
                                        fillOpacity={1}
                                        fill="url(#colorRisk)"
                                        dot={{ fill: '#ef4444', r: 4, strokeWidth: 2, stroke: '#fff' }}
                                        activeDot={{ r: 6, strokeWidth: 0 }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: '#94a3b8' }}>
                            Hover over any point to see the predicted spoilage risk for that date.
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SpoilagePrediction;
