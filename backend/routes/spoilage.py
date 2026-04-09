"""
routes/spoilage.py
------------------
Blueprint for the Spoilage Risk Detection endpoint.
POST /predict/spoilage
"""

import datetime
import pandas as pd
from flask import Blueprint, request, jsonify
from models_loader import calculate_spoilage_metrics, DATA_PATH

spoilage_bp = Blueprint('spoilage', __name__)


@spoilage_bp.route('/predict/spoilage', methods=['POST'])
def predict_spoilage():
    data           = request.json
    product_id     = data.get('product_id', 'P001')
    start_date_str = data.get('date')

    try:
        df = pd.read_csv(DATA_PATH)

        start_date = None
        if start_date_str:
            try:
                start_date = datetime.datetime.strptime(start_date_str, '%Y-%m-%d').date()
            except Exception:
                pass

        metrics = calculate_spoilage_metrics(product_id, df, start_date)
        if metrics is None:
            return jsonify({"error": "Failed to calculate metrics or model missing"}), 404

        return jsonify({
            "product_id": product_id,
            "forecast":   metrics["forecast"],
            "avg_risk":   metrics["avg_risk"]
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 400
