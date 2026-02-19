import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.neighbors import LocalOutlierFactor
from sklearn.cluster import DBSCAN
from sklearn.preprocessing import StandardScaler
from typing import Dict, Tuple
import joblib
import os

class AnomalyDetector:
    """AI-powered anomaly detection engine"""
    
    def __init__(self, contamination=0.1):
        self.contamination = contamination
        self.isolation_forest = IsolationForest(
            contamination=contamination,
            random_state=42,
            n_estimators=100,
            max_samples='auto'
        )
        self.lof = LocalOutlierFactor(
            contamination=contamination,
            n_neighbors=20
        )
        self.dbscan = DBSCAN(eps=0.5, min_samples=5)
        self.scaler = StandardScaler()
        self.is_fitted = False
    
    def prepare_features(self, df: pd.DataFrame) -> np.ndarray:
        """Prepare features for ML models"""
        feature_columns = [
            'returns', 'volume_ratio', 'volatility_5',
            'price_zscore', 'volume_zscore', 'returns_zscore',
            'price_to_sma20', 'macd'
        ]
        
        # Select and fill NaN values
        features = df[feature_columns].copy()
        features = features.fillna(0)
        
        # Replace infinite values
        features = features.replace([np.inf, -np.inf], 0)
        
        return features.values
    
    def detect_isolation_forest(self, df: pd.DataFrame) -> Tuple[np.ndarray, np.ndarray]:
        """Detect anomalies using Isolation Forest"""
        features = self.prepare_features(df)
        features_scaled = self.scaler.fit_transform(features)
        
        predictions = self.isolation_forest.fit_predict(features_scaled)
        scores = self.isolation_forest.score_samples(features_scaled)
        
        # Convert to binary: -1 = anomaly, 1 = normal
        anomalies = predictions == -1
        
        return anomalies, scores
    
    def detect_statistical(self, df: pd.DataFrame, 
                          price_threshold: float = 3.0,
                          volume_threshold: float = 2.0) -> pd.DataFrame:
        """Statistical anomaly detection using Z-score and IQR"""
        
        # Z-score based anomalies
        df['price_anomaly_z'] = np.abs(df['price_zscore']) > price_threshold
        df['volume_anomaly_z'] = np.abs(df['volume_zscore']) > volume_threshold
        
        # IQR based anomalies
        Q1_price = df['close'].quantile(0.25)
        Q3_price = df['close'].quantile(0.75)
        IQR_price = Q3_price - Q1_price
        df['price_anomaly_iqr'] = (df['close'] < (Q1_price - 1.5 * IQR_price)) | \
                                   (df['close'] > (Q3_price + 1.5 * IQR_price))
        
        Q1_volume = df['volume'].quantile(0.25)
        Q3_volume = df['volume'].quantile(0.75)
        IQR_volume = Q3_volume - Q1_volume
        df['volume_anomaly_iqr'] = (df['volume'] < (Q1_volume - 1.5 * IQR_volume)) | \
                                    (df['volume'] > (Q3_volume + 1.5 * IQR_volume))
        
        # Moving average deviation
        df['price_ma_ratio'] = df['close'] / df['sma_20']
        df['price_anomaly_ma'] = (df['price_ma_ratio'] > 1.1) | (df['price_ma_ratio'] < 0.9)
        
        df['volume_ma_ratio'] = df['volume'] / df['volume_ma_20']
        df['volume_anomaly_ma'] = df['volume_ma_ratio'] > 2.0
        
        return df
    
    def detect_all(self, df: pd.DataFrame) -> pd.DataFrame:
        """Run all detection algorithms"""
        # Statistical detection
        df = self.detect_statistical(df)
        
        # ML detection
        features = self.prepare_features(df)
        features_scaled = self.scaler.fit_transform(features)
        
        # Isolation Forest
        if len(features_scaled) > 10:  # Need enough samples
            iso_predictions = self.isolation_forest.fit_predict(features_scaled)
            df['ml_anomaly_if'] = iso_predictions == -1
            df['ml_score_if'] = self.isolation_forest.score_samples(features_scaled)
            
            # LOF (unsupervised)
            lof = LocalOutlierFactor(contamination=self.contamination)
            lof_predictions = lof.fit_predict(features_scaled)
            df['ml_anomaly_lof'] = lof_predictions == -1
            df['ml_score_lof'] = -lof.negative_outlier_factor_
        else:
            df['ml_anomaly_if'] = False
            df['ml_score_if'] = 0
            df['ml_anomaly_lof'] = False
            df['ml_score_lof'] = 0
        
        # Combine detections
        df['is_anomaly'] = (
            df['price_anomaly_z'] | 
            df['volume_anomaly_z'] | 
            df['ml_anomaly_if']
        )
        
        self.is_fitted = True
        return df
    
    def save_model(self, path: str):
        """Save trained model"""
        if self.is_fitted:
            joblib.dump(self.isolation_forest, f"{path}/isolation_forest.pkl")
            joblib.dump(self.scaler, f"{path}/scaler.pkl")
    
    def load_model(self, path: str):
        """Load trained model"""
        if os.path.exists(f"{path}/isolation_forest.pkl"):
            self.isolation_forest = joblib.load(f"{path}/isolation_forest.pkl")
            self.scaler = joblib.load(f"{path}/scaler.pkl")
            self.is_fitted = True