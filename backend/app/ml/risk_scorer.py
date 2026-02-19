import pandas as pd
import numpy as np

class RiskScorer:
    """Calculate risk scores based on anomaly detections"""
    
    def __init__(self):
        # Weights for different factors
        self.weights = {
            'price_anomaly': 0.35,
            'volume_anomaly': 0.35,
            'ml_anomaly': 0.20,
            'volatility': 0.10
        }
    
    def calculate_risk_score(self, df: pd.DataFrame) -> pd.DataFrame:
        """Calculate comprehensive risk score"""
        
        # Price anomaly score (0-100)
        price_score = np.where(
            df['price_anomaly_z'] | df['price_anomaly_iqr'] | df['price_anomaly_ma'],
            np.minimum(np.abs(df['price_zscore'].fillna(0)) * 20, 100),
            0
        )
        
        # Volume anomaly score (0-100)
        volume_score = np.where(
            df['volume_anomaly_z'] | df['volume_anomaly_iqr'] | df['volume_anomaly_ma'],
            np.minimum(np.abs(df['volume_zscore'].fillna(0)) * 15, 100),
            0
        )
        
        # ML anomaly score (0-100)
        if 'ml_anomaly_if' in df.columns:
            ml_score = np.where(
                df['ml_anomaly_if'],
                np.minimum(-df['ml_score_if'].fillna(0) * 10, 100),
                0
            )
        else:
            ml_score = 0
        
        # Volatility score (0-100)
        volatility_score = np.minimum(df['volatility_ratio'].fillna(1) * 50, 100)
        
        # Weighted average
        df['risk_score'] = (
            price_score * self.weights['price_anomaly'] +
            volume_score * self.weights['volume_anomaly'] +
            ml_score * self.weights['ml_anomaly'] +
            volatility_score * self.weights['volatility']
        ).clip(0, 100)
        
        # Risk level classification
        conditions = [
            df['risk_score'] < 30,
            df['risk_score'].between(30, 70),
            df['risk_score'] > 70
        ]
        choices = ['Low', 'Medium', 'High']
        df['risk_level'] = np.select(conditions, choices, default='Low')
        
        # Anomaly type classification
        anomaly_types = []
        for idx, row in df.iterrows():
            types = []
            if row.get('price_anomaly_z', False) or row.get('price_anomaly_iqr', False):
                types.append('Price')
            if row.get('volume_anomaly_z', False) or row.get('volume_anomaly_iqr', False):
                types.append('Volume')
            if row.get('ml_anomaly_if', False):
                types.append('ML Pattern')
            anomaly_types.append(', '.join(types) if types else 'Normal')
        
        df['anomaly_type'] = anomaly_types
        
        return df
    
    def get_risk_summary(self, df: pd.DataFrame) -> dict:
        """Generate risk summary statistics"""
        summary = {
            'total_days': len(df),
            'high_risk_days': len(df[df['risk_level'] == 'High']),
            'medium_risk_days': len(df[df['risk_level'] == 'Medium']),
            'low_risk_days': len(df[df['risk_level'] == 'Low']),
            'avg_risk_score': df['risk_score'].mean(),
            'max_risk_score': df['risk_score'].max(),
            'min_risk_score': df['risk_score'].min(),
            'price_anomalies': df['price_anomaly_z'].sum() if 'price_anomaly_z' in df else 0,
            'volume_anomalies': df['volume_anomaly_z'].sum() if 'volume_anomaly_z' in df else 0,
            'ml_anomalies': df['ml_anomaly_if'].sum() if 'ml_anomaly_if' in df else 0
        }
        return summary