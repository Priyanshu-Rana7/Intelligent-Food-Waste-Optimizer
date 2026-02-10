import pandas as pd
from prophet import Prophet
import joblib
import os

def train_demand_model():
    # Load dataset
    data_path = "d:/Files and Docs/B.Tech/Projects/Intelligent-Food-Waste-Optimizer/daily_aggregated.csv"
    df = pd.read_csv(data_path)
    
    product_ids = df['product_id'].unique()
    model_dir = "d:/Files and Docs/B.Tech/Projects/Intelligent-Food-Waste-Optimizer/backend/models"
    if not os.path.exists(model_dir):
        os.makedirs(model_dir)

    for pid in product_ids:
        print(f"Training demand model for {pid}...")
        df_product = df[df['product_id'] == pid].copy()
        df_product['date'] = pd.to_datetime(df_product['date'], format='%d/%m/%Y')
        
        prophet_df = df_product[['date', 'units_sold']].rename(columns={'date': 'ds', 'units_sold': 'y'})
        
        # Model
        model = Prophet()
        model.fit(prophet_df)
        
        joblib.dump(model, os.path.join(model_dir, f"demand_model_{pid}.pkl"))
        print(f"Demand model for {pid} saved.")

if __name__ == "__main__":
    train_demand_model()
