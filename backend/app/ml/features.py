import pandas as pd
import numpy as np
from typing import Tuple, List

class FeatureEngine:
    """Extract features from stock data for ML models"""
    
    @staticmethod
    def calculate_returns(df: pd.DataFrame) -> pd.DataFrame:
        """Calculate daily returns and log returns"""
        df['returns'] = df['close'].pct_change()
        df['log_returns'] = np.log(df['close'] / df['close'].shift(1))
        df['returns_ma_5'] = df['returns'].rolling(5).mean()
        df['returns_ma_20'] = df['returns'].rolling(20).mean()
        return df
    
    @staticmethod
    def calculate_volume_features(df: pd.DataFrame) -> pd.DataFrame:
        """Calculate volume-based features"""
        df['volume_ma_5'] = df['volume'].rolling(5).mean()
        df['volume_ma_20'] = df['volume'].rolling(20).mean()
        df['volume_ratio'] = df['volume'] / df['volume_ma_20']
        df['volume_change'] = df['volume'].pct_change()
        return df
    
    @staticmethod
    def calculate_volatility(df: pd.DataFrame) -> pd.DataFrame:
        """Calculate volatility features"""
        df['daily_range'] = (df['high'] - df['low']) / df['close']
        df['volatility_5'] = df['returns'].rolling(5).std()
        df['volatility_20'] = df['returns'].rolling(20).std()
        df['volatility_ratio'] = df['volatility_5'] / df['volatility_20']
        return df
    
    @staticmethod
    def calculate_price_features(df: pd.DataFrame) -> pd.DataFrame:
        """Calculate price-based features"""
        # Moving averages
        df['sma_20'] = df['close'].rolling(20).mean()
        df['sma_50'] = df['close'].rolling(50).mean()
        df['ema_12'] = df['close'].ewm(span=12, adjust=False).mean()
        df['ema_26'] = df['close'].ewm(span=26, adjust=False).mean()
        
        # Price position relative to moving averages
        df['price_to_sma20'] = df['close'] / df['sma_20']
        df['price_to_sma50'] = df['close'] / df['sma_50']
        
        # MACD
        df['macd'] = df['ema_12'] - df['ema_26']
        df['macd_signal'] = df['macd'].ewm(span=9, adjust=False).mean()
        
        return df
    
    @staticmethod
    def calculate_z_scores(df: pd.DataFrame) -> pd.DataFrame:
        """Calculate Z-scores for anomaly detection"""
        # Z-score for price
        df['price_zscore'] = (df['close'] - df['close'].rolling(20).mean()) / df['close'].rolling(20).std()
        
        # Z-score for volume
        df['volume_zscore'] = (df['volume'] - df['volume'].rolling(20).mean()) / df['volume'].rolling(20).std()
        
        # Z-score for returns
        df['returns_zscore'] = (df['returns'] - df['returns'].rolling(20).mean()) / df['returns'].rolling(20).std()
        
        return df
    
    def extract_all_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Extract all features"""
        df = df.copy()
        df = self.calculate_returns(df)
        df = self.calculate_volume_features(df)
        df = self.calculate_volatility(df)
        df = self.calculate_price_features(df)
        df = self.calculate_z_scores(df)
        return df