"""
app.py
------
Main Flask application entry point.
Loads all ML models at startup and registers route blueprints.
"""

import os
from flask import Flask, jsonify
from flask_cors import CORS

from models_loader import (
    load_spoilage_model,
    preload_all_demand_models,
    MODEL_DIR,
    SPOILAGE_MODEL_PATH,
)
from routes.demand         import demand_bp
from routes.spoilage       import spoilage_bp
from routes.route_optimizer import route_bp

# ── App Setup ──────────────────────────────────────────────────────────────────
app = Flask(__name__)
CORS(app, origins="*")

# ── Load Models at Startup ─────────────────────────────────────────────────────
load_spoilage_model()
preload_all_demand_models()

# ── Register Blueprints ────────────────────────────────────────────────────────
app.register_blueprint(demand_bp)
app.register_blueprint(spoilage_bp)
app.register_blueprint(route_bp)

# ── Health Check ───────────────────────────────────────────────────────────────
@app.route('/health', methods=['GET'])
def health():
    demand_models = [f for f in os.listdir(MODEL_DIR) if f.startswith('demand_model_')]
    return jsonify({
        "status":               "healthy",
        "models_available":     bool(demand_models) and os.path.exists(SPOILAGE_MODEL_PATH),
        "demand_models_found":  demand_models
    })


if __name__ == '__main__':
    app.run(debug=True, port=5000)
