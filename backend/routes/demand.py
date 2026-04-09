"""
routes/demand.py
----------------
Blueprint for the Demand Forecasting endpoint.
POST /predict/demand
"""

import datetime
from flask import Blueprint, request, jsonify
from models_loader import get_demand_model, demand_models_cache

demand_bp = Blueprint('demand', __name__)


@demand_bp.route('/predict/demand', methods=['POST'])
def predict_demand():
    data = request.json
    # Normalize to uppercase to handle p001, P001, etc.
    product_id = data.get('product_id', 'P001').upper()

    model = get_demand_model(product_id)
    if model is None:
        return jsonify({
            "error": f"Model for {product_id} not found. Available: {list(demand_models_cache.keys())}"
        }), 404

    try:
        # Prophet prediction — dates remapped to start from today
        future           = model.make_future_dataframe(periods=7)
        forecast         = model.predict(future)
        predicted_values = forecast.tail(7)['yhat'].tolist()

        today   = datetime.date.today()
        results = [
            {
                "date":  (today + datetime.timedelta(days=i)).strftime('%Y-%m-%d'),
                "value": max(0, round(yhat))
            }
            for i, yhat in enumerate(predicted_values)
        ]

        return jsonify({
            "product_id":   product_id,
            "forecast":     results,
            "total_demand": sum(r['value'] for r in results)
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 400
