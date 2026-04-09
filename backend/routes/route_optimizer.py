"""
routes/route_optimizer.py
--------------------------
Blueprint for the Route Optimization endpoint.
GET /predict/route
"""

import os
import json
import math
import pandas as pd
from flask import Blueprint, jsonify
from models_loader import calculate_spoilage_metrics, DATA_PATH

route_bp = Blueprint('route_optimizer', __name__)

# Central store / warehouse coordinates (Bengaluru)
STORE_LOCATION = {"lat": 12.9716, "lon": 77.5946}

# Dispatch threshold — products above this avg risk are flagged for donation
DISPATCH_THRESHOLD = 45


def haversine(lat1, lon1, lat2, lon2):
    """Calculate great-circle distance (km) between two GPS coordinates."""
    R    = 6371
    dLat = math.radians(lat2 - lat1)
    dLon = math.radians(lon2 - lon1)
    a    = (math.sin(dLat / 2) ** 2 +
            math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
            math.sin(dLon / 2) ** 2)
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


@route_bp.route('/predict/route', methods=['GET'])
def predict_route():
    try:
        # 1. Load NGO database
        ngo_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'ngos.json')
        with open(os.path.normpath(ngo_path), 'r') as f:
            ngos = json.load(f)

        # 2. Discover products dynamically from dataset
        df       = pd.read_csv(DATA_PATH)
        products = sorted(df['product_id'].unique().tolist())

        high_risk_items = []
        for pid in products:
            metrics = calculate_spoilage_metrics(pid, df)
            if metrics and metrics["avg_risk"] > DISPATCH_THRESHOLD:
                high_risk_items.append({
                    "product_id": pid,
                    "name":       f"Product {pid}",
                    "risk_score": metrics["avg_risk"],
                    "quantity":   50  # Simulated stock quantity
                })

        # 3. Rank NGOs by distance and build results
        results = []
        for item in high_risk_items:
            matches = [
                {
                    "ngo_id":           ngo["id"],
                    "ngo_name":         ngo["name"],
                    "distance_km":      round(haversine(
                                            STORE_LOCATION["lat"], STORE_LOCATION["lon"],
                                            ngo["lat"], ngo["lon"]
                                        ), 2),
                    "address":          ngo["address"],
                    "suitability_score": round(max(0, 100 - (
                                            haversine(STORE_LOCATION["lat"], STORE_LOCATION["lon"],
                                                      ngo["lat"], ngo["lon"]) * 5
                                        )), 1)
                }
                for ngo in ngos
            ]
            matches.sort(key=lambda x: x['distance_km'])

            results.append({
                "product_id":       item["product_id"],
                "product_name":     item["name"],
                "risk_score":       item["risk_score"],
                "quantity":         item["quantity"],
                "recommended_ngos": matches[:2]   # Top 2 nearest NGOs
            })

        return jsonify({
            "store_location":   STORE_LOCATION,
            "optimized_routes": results
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 400
