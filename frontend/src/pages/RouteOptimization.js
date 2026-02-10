import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Package, AlertCircle, ChevronRight, CheckCircle } from 'lucide-react';
import axios from 'axios';

const RouteOptimization = () => {
    const [routes, setRoutes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dispatched, setDispatched] = useState({});

    useEffect(() => {
        fetchRoutes();
    }, []);

    const fetchRoutes = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:5000/predict/route');
            setRoutes(response.data.optimized_routes);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching routes:", error);
            setLoading(false);
        }
    };

    const handleDispatch = (pid, ngoId) => {
        setDispatched(prev => ({ ...prev, [pid]: ngoId }));
    };

    if (loading) return <div className="loading">Calculating optimized routes...</div>;

    return (
        <div className="route-page">
            <header className="page-header">
                <h2>Route Optimization</h2>
                <p>Prioritizing food donations based on spoilage risk and proximity.</p>
            </header>

            <div className="routes-container">
                {routes.length === 0 ? (
                    <div className="empty-state">
                        <CheckCircle size={48} color="#2ecc71" />
                        <h3>No High Risk Items</h3>
                        <p>All stock is currently well within its shelf life.</p>
                    </div>
                ) : (
                    routes.map((item) => (
                        <div key={item.product_id} className="route-card panel">
                            <div className="route-card-main">
                                <div className="item-info">
                                    <div className="item-header">
                                        <Package size={24} className="logo-icon" />
                                        <h3>{item.product_name} ({item.product_id})</h3>
                                    </div>
                                    <div className="risk-badge" style={{
                                        backgroundColor: item.risk_score > 70 ? '#fee2e2' : '#fef3c7',
                                        color: item.risk_score > 70 ? '#ef4444' : '#d97706'
                                    }}>
                                        Risk: {item.risk_score}%
                                    </div>
                                    <div className="quantity">Quantity to Dispatch: <strong>{item.quantity} units</strong></div>
                                </div>

                                <div className="destination-list">
                                    <h4>Recommended Destinations</h4>
                                    {item.recommended_ngos.map((ngo) => (
                                        <div key={ngo.ngo_id} className={`ngo-option ${dispatched[item.product_id] === ngo.ngo_id ? 'selected' : ''}`}>
                                            <div className="ngo-details">
                                                <div className="ngo-name-row">
                                                    <MapPin size={16} />
                                                    <strong>{ngo.ngo_name}</strong>
                                                </div>
                                                <div className="ngo-meta">
                                                    <span>{ngo.distance_km} km away</span>
                                                    <span className="dot">•</span>
                                                    <span className="suitability">Match: {ngo.suitability_score}%</span>
                                                </div>
                                                <p className="ngo-address">{ngo.address}</p>
                                            </div>
                                            <button
                                                className="dispatch-btn"
                                                onClick={() => handleDispatch(item.product_id, ngo.ngo_id)}
                                                disabled={dispatched[item.product_id]}
                                            >
                                                {dispatched[item.product_id] === ngo.ngo_id ? 'Dispatched' : 'Dispatch Now'}
                                                {dispatched[item.product_id] !== ngo.ngo_id && <Navigation size={16} />}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <style>{`
                .routes-container {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }
                .route-card {
                    padding: 1.5rem;
                }
                .route-card-main {
                    display: grid;
                    grid-template-columns: 1fr 1.5fr;
                    gap: 2rem;
                }
                .item-header {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    margin-bottom: 1rem;
                }
                .item-header h3 { margin: 0; }
                .risk-badge {
                    display: inline-block;
                    padding: 0.25rem 0.75rem;
                    border-radius: 999px;
                    font-weight: 600;
                    margin-bottom: 1rem;
                }
                .destination-list h4 {
                    margin-top: 0;
                    margin-bottom: 1rem;
                    color: #64748b;
                    font-size: 0.9rem;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
                .ngo-option {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1rem;
                    border: 1px solid #e2e8f0;
                    border-radius: 12px;
                    margin-bottom: 0.75rem;
                    transition: all 0.2s;
                }
                .ngo-option:hover {
                    border-color: #2ecc71;
                    background: #f0fdf4;
                }
                .ngo-option.selected {
                    border-color: #2ecc71;
                    background: #f0fdf4;
                }
                .ngo-name-row {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    color: #1e293b;
                    margin-bottom: 0.25rem;
                }
                .ngo-meta {
                    font-size: 0.8rem;
                    color: #64748b;
                    margin-bottom: 0.5rem;
                }
                .ngo-address {
                    font-size: 0.8rem;
                    color: #94a3b8;
                    margin: 0;
                }
                .dispatch-btn {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    background: #2ecc71;
                    color: white;
                    border: none;
                    padding: 0.6rem 1.2rem;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: background 0.2s;
                }
                .dispatch-btn:hover {
                    background: #27ae60;
                }
                .dispatch-btn:disabled {
                    background: #94a3b8;
                    cursor: not-allowed;
                }
                @media (max-width: 768px) {
                    .route-card-main { grid-template-columns: 1fr; }
                }
            `}</style>
        </div>
    );
};

export default RouteOptimization;
