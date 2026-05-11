import pandas as pd, numpy as np, joblib, os, warnings
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
from prophet import Prophet

DATA_PATH = 'd:/Files and Docs/B.Tech/Projects/Intelligent-Food-Waste-Optimizer/daily_aggregated.csv'
MODEL_DIR = 'd:/Files and Docs/B.Tech/Projects/Intelligent-Food-Waste-Optimizer/backend/models'

df = pd.read_csv(DATA_PATH)
df['date'] = pd.to_datetime(df['date'], dayfirst=True)

print('=' * 55)
print('  MODEL PERFORMANCE EVALUATION')
print('=' * 55)
print()
print('[1] PROPHET DEMAND MODEL METRICS (Per-Product)')
print()
print('{:<10} {:>10} {:>10} {:>10}'.format('Product', 'MAE', 'RMSE', 'MAPE %'))
print('-' * 45)

all_maes, all_rmses, all_mapes = [], [], []
for pid in sorted(df['product_id'].unique()):
    prod = df[df['product_id'] == pid][['date','units_sold']].copy()
    prod.columns = ['ds','y']
    prod = prod.sort_values('ds')
    split = int(len(prod)*0.8)
    train, test = prod.iloc[:split], prod.iloc[split:]
    m = Prophet(seasonality_mode='multiplicative', yearly_seasonality=True, weekly_seasonality=True)
    with warnings.catch_warnings():
        warnings.simplefilter('ignore')
        m.fit(train)
    future = m.make_future_dataframe(periods=len(test))
    fc = m.predict(future)
    preds = fc.tail(len(test))['yhat'].values
    actuals = test['y'].values
    mae  = np.mean(np.abs(actuals - preds))
    rmse = np.sqrt(np.mean((actuals - preds)**2))
    mape = np.mean(np.abs((actuals - preds) / np.maximum(actuals, 1))) * 100
    all_maes.append(mae)
    all_rmses.append(rmse)
    all_mapes.append(mape)
    print('{:<10} {:>10.2f} {:>10.2f} {:>9.2f}%'.format(pid, mae, rmse, mape))

print('-' * 45)
print('{:<10} {:>10.2f} {:>10.2f} {:>9.2f}%'.format('AVERAGE', np.mean(all_maes), np.mean(all_rmses), np.mean(all_mapes)))

print()
print('[2] RANDOM FOREST SPOILAGE CLASSIFIER METRICS')
print()
features = ['temperature', 'humidity', 'rainfall_mm', 'shelf_life_days']
df['spoiled'] = (df['shelf_life_days'] <= 2).astype(int)
X = df[features]
y = df['spoiled']
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
rf = joblib.load(os.path.join(MODEL_DIR, 'spoilage_model.pkl'))
y_pred = rf.predict(X_test)
acc  = accuracy_score(y_test, y_pred) * 100
prec = precision_score(y_test, y_pred, zero_division=0) * 100
rec  = recall_score(y_test, y_pred, zero_division=0) * 100
f1   = f1_score(y_test, y_pred, zero_division=0) * 100
cm   = confusion_matrix(y_test, y_pred)
print('  Accuracy   : {:.2f}%'.format(acc))
print('  Precision  : {:.2f}%'.format(prec))
print('  Recall     : {:.2f}%'.format(rec))
print('  F1 Score   : {:.2f}%'.format(f1))
print()
print('  Confusion Matrix:')
print('             Predicted Safe   Predicted Risk')
print('  Actual Safe     {:>5}           {:>5}'.format(cm[0][0], cm[0][1]))
print('  Actual Risk     {:>5}           {:>5}'.format(cm[1][0], cm[1][1]))
print()
print('  EVALUATION COMPLETE')
