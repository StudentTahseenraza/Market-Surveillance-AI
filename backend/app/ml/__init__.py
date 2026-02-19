# backend/app/ml/__init__.py
import pandas as pd
import numpy as np

class MarketSurveillanceEngine:
    """Minimal working ML engine for anomaly detection"""
    
    def __init__(self):
        print("🧠 ML Engine Initialized")
    
    def analyze(self, df):
        """Simple but effective anomaly detection"""
        df = df.copy()
        
        # Calculate returns
        df['returns'] = df['close'].pct_change()
        
        # Calculate moving averages
        df['volume_ma'] = df['volume'].rolling(5).mean()
        df['volume_ratio'] = df['volume'] / df['volume_ma']
        
        # Z-scores
        df['price_zscore'] = (df['close'] - df['close'].mean()) / df['close'].std()
        df['volume_zscore'] = (df['volume'] - df['volume'].mean()) / df['volume'].std()
        
        # Detect anomalies
        df['price_anomaly_z'] = np.abs(df['price_zscore']) > 2.5
        df['volume_anomaly_z'] = np.abs(df['volume_zscore']) > 2.5
        
        # Risk score (0-100)
        df['risk_score'] = (
            (df['price_anomaly_z'].astype(int) * 40) +
            (df['volume_anomaly_z'].astype(int) * 40) +
            (df['volume_ratio'].clip(0, 2) * 10)
        ).clip(0, 100)
        
        # Risk level
        conditions = [
            df['risk_score'] < 30,
            df['risk_score'].between(30, 70),
            df['risk_score'] > 70
        ]
        choices = ['Low', 'Medium', 'High']
        df['risk_level'] = np.select(conditions, choices, default='Low')
        
        # Anomaly type
        df['is_anomaly'] = df['price_anomaly_z'] | df['volume_anomaly_z']
        df['anomaly_type'] = df.apply(
            lambda row: 'Price' if row['price_anomaly_z'] else 
                       ('Volume' if row['volume_anomaly_z'] else 'Normal'),
            axis=1
        )
        
        # ML score (mock)
        df['ml_score_if'] = -np.abs(df['price_zscore']) / 10
        
        return df