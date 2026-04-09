"""
models_loader.py
----------------
Shared model loading and spoilage metrics logic.
Used by all route modules (demand, spoilage, route_optimizer).
"""

import os
import datetime
import joblib
import pandas as pd

MODEL_DIR = os.path.join(os.path.dirname(__file__), 'models')
SPOILAGE_MODEL_PATH = os.path.join(MODEL_DIR, 'spoilage_model.pkl')
DATA_PATH = os.path.join(os.path.dirname(__file__), '..', 'daily_aggregated.csv')
DATA_PATH = os.path.normpath(DATA_PATH)

# ── Spoilage Model ─────────────────────────────────────────────────────────────
spoilage_model = None

def load_spoilage_model():
    global spoilage_model
    try:
        if os.path.exists(SPOILAGE_MODEL_PATH):
            spoilage_model = joblib.load(SPOILAGE_MODEL_PATH)
            print("Spoilage model loaded.")
    except Exception as e:
        print(f"Error loading spoilage model: {e}")

# ── Demand Models ──────────────────────────────────────────────────────────────
demand_models_cache = {}

def preload_all_demand_models():
    """Scan models directory and load every demand model file."""
    if not os.path.exists(MODEL_DIR):
        return
    for fname in os.listdir(MODEL_DIR):
        if fname.startswith('demand_model_') and fname.endswith('.pkl'):
            pid = fname.replace('demand_model_', '').replace('.pkl', '').upper()
            path = os.path.join(MODEL_DIR, fname)
            try:
                demand_models_cache[pid] = joblib.load(path)
                print(f"Demand model loaded: {pid}")
            except Exception as e:
                print(f"Error loading demand model {fname}: {e}")

def get_demand_model(product_id):
    """Return cached demand model. product_id is normalized to uppercase."""
    return demand_models_cache.get(product_id.upper())

# ── Shared Spoilage Calculation ────────────────────────────────────────────────
def calculate_spoilage_metrics(product_id, df, start_date=None):
    """
    Returns a 7-day spoilage risk forecast dict for a given product.
    Shared by both the spoilage and route optimization endpoints.
    Risk increases correctly when a future date is selected, because:
    - shelf_life is reduced by the number of days between today and start_date
    - base_risk is increased proportionally to reflect aging of the product
    """
    if spoilage_model is None:
        return None

    prod_data = df[df['product_id'] == product_id]
    if prod_data.empty:
        return None

    avg_temp   = prod_data['temperature'].mean()
    avg_humid  = prod_data['humidity'].mean()
    avg_rain   = prod_data['rainfall_mm'].mean()
    shelf_life = prod_data['shelf_life_days'].iloc[0]

    today = datetime.date.today()
    if start_date is None:
        start_date = today

    # How many days in the future is start_date from today?
    # This is used to simulate shelf-life consumed before the forecast even starts.
    days_offset = max(0, (start_date - today).days)

    results = []
    for i in range(7):
        # Shelf life already consumed = days_offset + i days of the forecast window
        days_consumed     = days_offset + i
        current_shelf_life = max(0, shelf_life - days_consumed)

        # Temperature and humidity trend worsens over the full offset period
        day_temp  = avg_temp  + ((days_offset + i) * 0.3)
        day_humid = avg_humid + ((days_offset + i) * 0.5)

        input_data = [[day_temp, day_humid, avg_rain, current_shelf_life]]
        probs      = spoilage_model.predict_proba(input_data)[0]
        risk_prob  = probs[1] if len(probs) > 1 else 0.0

        # Time factor accounts for full elapsed days, not just the 7-day window
        time_factor = min(0.6, (days_consumed / max(shelf_life, 1)) * 0.6)
        final_risk  = min(1.0, (risk_prob * 0.6) + time_factor + 0.05)

        results.append({
            "date":       (start_date + datetime.timedelta(days=i)).strftime('%Y-%m-%d'),
            "risk_score": round(final_risk * 100, 1)
        })

    avg_risk = round(sum(r['risk_score'] for r in results) / 7, 1)

    return {"forecast": results, "avg_risk": avg_risk}
