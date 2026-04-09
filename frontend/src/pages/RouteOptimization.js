import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Package, CheckCircle, Download, X, Truck } from 'lucide-react';
import axios from 'axios';
import { exportToCSV } from '../utils/exportCSV';
import { getProductName } from '../utils/productNames';

// Realistic units per product
const PRODUCT_UNITS = {
    P001: 'kg',      // Fresh Tomatoes
    P002: 'kg',      // Spinach Bunch
    P003: 'kg',      // Broccoli
    P004: 'litres',  // Full Cream Milk
    P005: 'kg',      // Carrots
    P006: 'kg',      // Bananas
    P007: 'loaves',  // Whole Wheat Bread
    P008: 'kg',      // Chicken Breast
    P009: 'litres',  // Orange Juice
    P010: 'kg',      // Greek Yogurt
};

const getUnit = (productId) => PRODUCT_UNITS[productId?.toUpperCase()] || 'units';

const RouteOptimization = () => {
    const [routes, setRoutes] = useState([]);
    const [loading, setLoading] = useState(true);
    // dispatches: { productId: [{ ngoId, ngoName, qty, unit }] }
    const [dispatches, setDispatches] = useState({});
    // remaining: { productId: remainingQty }
    const [remaining, setRemaining] = useState({});
    const [modal, setModal] = useState(null);

    useEffect(() => {
        fetchRoutes();
    }, []);

    const fetchRoutes = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:5000/predict/route');
            const routes = response.data.optimized_routes;
            setRoutes(routes);
            // Initialise remaining qty per product
            const initRemaining = {};
            routes.forEach(item => { initRemaining[item.product_id] = item.quantity; });
            setRemaining(initRemaining);
        } catch (error) {
            console.error('Error fetching routes:', error);
        } finally {
            setLoading(false);
        }
    };

    // Opens the dispatch slider panel
    const openDispatch = (item, ngo) => {
        const rem = remaining[item.product_id] ?? item.quantity;
        setModal({
            productId: item.product_id,
            ngoId: ngo.ngo_id,
            ngoName: ngo.ngo_name,
            maxQty: rem,
            unit: getUnit(item.product_id),
            sliderVal: rem, // default to all remaining
        });
    };

    // Confirms dispatch and deducts from remaining
    const confirmDispatch = () => {
        if (!modal) return;
        const { productId, ngoId, ngoName, sliderVal, unit } = modal;

        // Add to dispatch list for this product
        setDispatches(prev => ({
            ...prev,
            [productId]: [...(prev[productId] || []), { ngoId, ngoName, qty: sliderVal, unit }]
        }));

        // Deduct from remaining
        setRemaining(prev => ({
            ...prev,
            [productId]: (prev[productId] ?? 0) - sliderVal
        }));

        setModal(null);
    };

    if (loading) return <div className="loading">Calculating optimized routes...</div>;

    return (
        <div className="route-page">
            <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2>Route Optimization</h2>
                    <p>Prioritizing food donations based on spoilage risk and proximity.</p>
                </div>
                {routes.length > 0 && (
                    <button
                        onClick={() => exportToCSV(
                            routes.flatMap(item =>
                                item.recommended_ngos.map(ngo => ({
                                    'Product ID': item.product_id,
                                    'Product Name': getProductName(item.product_id),
                                    'Risk Score (%)': item.risk_score,
                                    [`Quantity (${getUnit(item.product_id)})`]: item.quantity,
                                    'NGO Name': ngo.ngo_name,
                                    'Distance (km)': ngo.distance_km,
                                    'Match Score (%)': ngo.suitability_score,
                                    'Address': ngo.address
                                }))
                            ),
                            'route_optimization_report.csv'
                        )}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#2ecc71', color: '#fff', border: 'none', padding: '0.6rem 1.4rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem', whiteSpace: 'nowrap' }}
                    >
                        <Download size={16} /> Export Report
                    </button>
                )}
            </header>

            <div className="routes-container">
                {routes.length === 0 ? (
                    <div className="empty-state">
                        <CheckCircle size={48} color="#2ecc71" />
                        <h3>No High Risk Items</h3>
                        <p>All stock is currently well within its shelf life.</p>
                    </div>
                ) : (
                    routes.map((item) => {
                        const unit = getUnit(item.product_id);
                        const productDispatches = dispatches[item.product_id] || [];
                        const rem = remaining[item.product_id] ?? item.quantity;

                        return (
                            <div key={item.product_id} className="route-card panel">
                                <div className="route-card-main">
                                    <div className="item-info">
                                        <div className="item-header">
                                            <Package size={24} className="logo-icon" />
                                            <div>
                                                <h3 style={{ margin: 0 }}>{getProductName(item.product_id)}</h3>
                                                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{item.product_id}</span>
                                            </div>
                                        </div>
                                        <div className="risk-badge" style={{
                                            backgroundColor: item.risk_score > 70 ? '#fee2e2' : '#fef3c7',
                                            color: item.risk_score > 70 ? '#ef4444' : '#d97706'
                                        }}>
                                            Risk: {item.risk_score}%
                                        </div>

                                        {/* Quantity with proper real-world unit */}
                                        <div className="quantity">
                                            Total Stock: <strong>{item.quantity} {unit}</strong>
                                        </div>

                                        {/* Per-NGO dispatch log */}
                                        {(dispatches[item.product_id] || []).map((d, i) => (
                                            <div key={i} style={{ marginTop: '0.5rem', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '8px', padding: '0.5rem 0.75rem', fontSize: '0.78rem', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <Truck size={12} />
                                                <span><strong>{d.qty} {d.unit}</strong> → {d.ngoName}</span>
                                            </div>
                                        ))}

                                        {/* Remaining qty badge */}
                                        <div style={{ marginTop: '0.5rem', fontSize: '0.78rem', color: rem > 0 ? '#f59e0b' : '#94a3b8', fontWeight: 600 }}>
                                            {rem > 0
                                                ? `⚠ ${rem} ${unit} still available`
                                                : `✅ All ${item.quantity} ${unit} dispatched`}
                                        </div>
                                    </div>

                                    <div className="destination-list">
                                        <h4>Recommended Destinations</h4>
                                        {item.recommended_ngos.map((ngo) => {
                                            const alreadyDispatched = productDispatches.some(d => d.ngoId === ngo.ngo_id);
                                            const isModalOpen = modal?.productId === item.product_id && modal?.ngoId === ngo.ngo_id;
                                            const noRemaining = rem <= 0;

                                            return (
                                                <div key={ngo.ngo_id}>
                                                    <div className={`ngo-option ${alreadyDispatched ? 'selected' : ''}`}>
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
                                                            onClick={() => isModalOpen ? setModal(null) : openDispatch(item, ngo)}
                                                            disabled={alreadyDispatched || noRemaining}
                                                            style={{ background: alreadyDispatched ? '#94a3b8' : noRemaining ? '#94a3b8' : isModalOpen ? '#f59e0b' : '#2ecc71' }}
                                                        >
                                                            {alreadyDispatched ? 'Dispatched ✓' : noRemaining ? 'Stock Full' : isModalOpen ? 'Cancel' : 'Dispatch Now'}
                                                            {!alreadyDispatched && !noRemaining && !isModalOpen && <Navigation size={16} />}
                                                            {isModalOpen && <X size={16} />}
                                                        </button>
                                                    </div>

                                                    {/* Inline Dispatch Slider Panel */}
                                                    {isModalOpen && (
                                                        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', marginBottom: '0.75rem', marginTop: '-0.25rem' }}>
                                                            <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '1rem', color: '#1e293b' }}>
                                                                Select quantity to dispatch to <span style={{ color: '#2ecc71' }}>{ngo.ngo_name}</span>
                                                            </div>

                                                            {/* Slider */}
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                                                <span style={{ fontSize: '0.75rem', color: '#94a3b8', minWidth: '20px' }}>1</span>
                                                                <input
                                                                    type="range"
                                                                    min={1}
                                                                    max={modal.maxQty}
                                                                    value={modal.sliderVal}
                                                                    onChange={(e) => setModal(prev => ({ ...prev, sliderVal: Number(e.target.value) }))}
                                                                    style={{ flex: 1, accentColor: '#2ecc71', height: '6px', cursor: 'pointer' }}
                                                                />
                                                                <span style={{ fontSize: '0.75rem', color: '#94a3b8', minWidth: '30px' }}>{modal.maxQty}</span>
                                                            </div>

                                                            {/* Live quantity display */}
                                                            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                                                                <span style={{ fontSize: '2rem', fontWeight: 700, color: '#1e293b' }}>{modal.sliderVal}</span>
                                                                <span style={{ fontSize: '1rem', color: '#64748b', marginLeft: '6px' }}>{unit}</span>
                                                                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                                                                    {modal.maxQty - modal.sliderVal} {unit} will remain undispatched
                                                                </div>
                                                            </div>

                                                            {/* Confirm button */}
                                                            <button
                                                                onClick={confirmDispatch}
                                                                style={{ width: '100%', background: '#2ecc71', color: '#fff', border: 'none', padding: '0.75rem', borderRadius: '8px', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                                            >
                                                                <Truck size={16} /> Confirm Dispatch of {modal.sliderVal} {unit}
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <style>{`
                .routes-container { display: flex; flex-direction: column; gap: 1.5rem; }
                .route-card { padding: 1.5rem; }
                .route-card-main { display: grid; grid-template-columns: 1fr 1.5fr; gap: 2rem; }
                .item-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem; }
                .item-header h3 { margin: 0; }
                .risk-badge { display: inline-block; padding: 0.25rem 0.75rem; border-radius: 999px; font-weight: 600; margin-bottom: 1rem; }
                .destination-list h4 { margin-top: 0; margin-bottom: 1rem; color: #64748b; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.05em; }
                .ngo-option { display: flex; justify-content: space-between; align-items: center; padding: 1rem; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 0.75rem; transition: all 0.2s; }
                .ngo-option:hover { border-color: #2ecc71; background: #f0fdf4; }
                .ngo-option.selected { border-color: #2ecc71; background: #f0fdf4; }
                .ngo-name-row { display: flex; align-items: center; gap: 0.5rem; color: #1e293b; margin-bottom: 0.25rem; }
                .ngo-meta { font-size: 0.8rem; color: #64748b; margin-bottom: 0.5rem; }
                .ngo-address { font-size: 0.8rem; color: #94a3b8; margin: 0; }
                .dispatch-btn { display: flex; align-items: center; gap: 0.5rem; color: white; border: none; padding: 0.6rem 1.2rem; border-radius: 8px; font-weight: 600; cursor: pointer; transition: opacity 0.2s; white-space: nowrap; }
                .dispatch-btn:hover { opacity: 0.85; }
                .dispatch-btn:disabled { background: #94a3b8 !important; cursor: not-allowed; }
                @media (max-width: 768px) { .route-card-main { grid-template-columns: 1fr; } }
            `}</style>
        </div>
    );
};

export default RouteOptimization;
