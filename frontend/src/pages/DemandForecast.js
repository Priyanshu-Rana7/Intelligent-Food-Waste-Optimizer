import React, { useState } from 'react';
import axios from 'axios';
import { Search, TrendingUp, Loader2, Info, Download } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { exportToCSV } from '../utils/exportCSV';
import { getProductName, resolveProductInput, ALL_PRODUCTS } from '../utils/productNames';

const DemandForecast = () => {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
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
            const response = await axios.post('http://localhost:5000/predict/demand', { product_id: productId });
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
        <div className="demand-forecast-page">
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '3rem' }}>
                <form onSubmit={handlePredict} style={{ display: 'flex', gap: '10px', width: '100%', maxWidth: '600px' }}>
                    <div style={{ flex: 1, position: 'relative' }}>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Search by name or ID (e.g. Milk, Bread, P007)"
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
                    <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '0 2rem' }} disabled={loading}>
                        {loading ? <Loader2 className="animate-spin" size={20} /> : 'Predict'}
                    </button>
                </form>
            </div>

            <header className="page-header" style={{ textAlign: 'center', marginBottom: '4rem' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>How Demand Prediction Works</h2>
                <p style={{ maxWidth: '800px', margin: '0 auto', fontSize: '0.95rem', lineHeight: '1.6' }}>
                    Here you can predict the <strong>total demand</strong> for a selected product over the next 7 days using machine learning models trained on sales history. Use the search bar above to enter a product ID, and you can view both the predicted total and the day-by-day forecast in the chart.
                </p>
            </header>

            {error && (
                <div className="alert alert-danger" style={{ maxWidth: '600px', margin: '0 auto 2rem' }}>
                    {error}
                </div>
            )}

            {data && (
                <div className="content-grid" style={{ gridTemplateColumns: '300px 1fr', alignItems: 'start' }}>
                    <div className="stat-card" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center' }}>
                        <div className="stat-label" style={{ fontSize: '1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            Demand Forecast <Info size={16} style={{ color: '#3b82f6' }} />
                        </div>
                        <div style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', marginBottom: '1rem' }}>
                            {getProductName(data.product_id)}
                            <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginLeft: '6px' }}>({data.product_id})</span>
                        </div>
                        <div className="stat-value" style={{ fontSize: '3.5rem', color: '#1e293b' }}>
                            {data.total_demand}
                        </div>
                        <div className="stat-label" style={{ marginTop: '1rem' }}>
                            Predicted for next 7 days
                        </div>
                        <button
                            onClick={() => exportToCSV(
                                data.forecast.map(r => ({ Product: data.product_id, Name: getProductName(data.product_id), Date: r.date, 'Predicted Units': r.value })),
                                `demand_forecast_${data.product_id}.csv`
                            )}
                            style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center', background: '#3b82f6', color: '#fff', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}
                        >
                            <Download size={16} /> Export CSV
                        </button>
                    </div>

                    <div className="panel" style={{ padding: '2rem' }}>
                        <div style={{ textAlign: 'center', marginBottom: '1.5rem', fontWeight: 600, color: '#64748b' }}>
                            7-Day Demand Forecast Chart <Info size={14} />
                        </div>
                        <div style={{ width: '100%', height: 350 }}>
                            <ResponsiveContainer>
                                <AreaChart data={data.forecast}>
                                    <defs>
                                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                                    <Tooltip
                                        contentStyle={{ background: '#fff', border: 'none', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="value"
                                        stroke="#3b82f6"
                                        strokeWidth={2}
                                        fillOpacity={1}
                                        fill="url(#colorValue)"
                                        dot={{ fill: '#3b82f6', r: 4, strokeWidth: 2, stroke: '#fff' }}
                                        activeDot={{ r: 6, strokeWidth: 0 }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: '#94a3b8' }}>
                            Hover over any point to view the predicted units for that date.
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DemandForecast;
