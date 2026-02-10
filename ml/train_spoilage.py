import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
import joblib
import os

def train_spoilage_model():
    # Load dataset
    data_path = "d:/Files and Docs/B.Tech/Projects/Intelligent-Food-Waste-Optimizer/daily_aggregated.csv"
    df = pd.read_csv(data_path)
    
    # Balanced Risk Labeling:
    # High risk (1) if temperature is above 32 AND shelf life is low (< 3 days)
    # OR if temperature is extreme (> 38)
    df['spoilage_risk'] = np.where(
        ((df['temperature'] > 32) & (df['shelf_life_days'] < 3)) | (df['temperature'] > 38), 1, 0
    )
    
    # Features
    features = ['temperature', 'humidity', 'rainfall_mm', 'shelf_life_days']
    X = df[features]
    y = df['spoilage_risk']
    
    # Train test split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Model
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    
    # Save model
    model_dir = "d:/Files and Docs/B.Tech/Projects/Intelligent-Food-Waste-Optimizer/backend/models"
    if not os.path.exists(model_dir):
        os.makedirs(model_dir)
        
    joblib.dump(model, os.path.join(model_dir, "spoilage_model.pkl"))
    print("Spoilage model trained and saved.")

if __name__ == "__main__":
    train_spoilage_model()
