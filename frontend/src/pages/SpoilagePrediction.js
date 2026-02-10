import React, { useState } from 'react';
import axios from 'axios';
import { Search, AlertTriangle, Loader2, Info } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const SpoilagePrediction = () => {
    const [productId, setProductId] = useState('');
    const [targetDate, setTargetDate] = useState(new Date().toISOString().split('T')[0]);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handlePredict = async (e) => {
        e.preventDefault();
        if (!productId) return;

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

    return (
        <div className="spoilage-risk-page">
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '3rem' }}>
                <form onSubmit={handlePredict} style={{ display: 'flex', gap: '10px', width: '100%', maxWidth: '800px', flexWrap: 'wrap' }}>
                    <input
                        type="text"
                        className="form-input"
                        placeholder="Enter Product ID (e.g., P005)"
                        value={productId}
                        onChange={(e) => setProductId(e.target.value.toUpperCase())}
                        style={{ flex: 1, minWidth: '200px' }}
                    />
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
                        <div className="stat-label" style={{ fontSize: '1rem', marginBottom: '1.5rem', fontWeight: 600, color: '#3b82f6' }}>
                            Spoilage Risk Forecast
                        </div>
                        <div className="stat-value" style={{ fontSize: '3.5rem', color: '#1e293b' }}>
                            {data.avg_risk}%
                        </div>
                        <div className="stat-label" style={{ marginTop: '1rem' }}>
                            Avg Risk for {data.product_id} over next 7 days
                        </div>
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
