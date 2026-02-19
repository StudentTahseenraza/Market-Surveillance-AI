# backend/app/utils/csv_parser.py
import pandas as pd
import numpy as np
from datetime import datetime
from typing import Optional, Tuple
import logging

logger = logging.getLogger(__name__)

class CSVParser:
    """Parse and validate CSV files for stock data"""
    
    REQUIRED_COLUMNS = ['date', 'open', 'high', 'low', 'close', 'volume']
    
    @staticmethod
    def validate_and_parse(df: pd.DataFrame, symbol: Optional[str] = None) -> pd.DataFrame:
        """
        Validate CSV data and convert to proper format
        """
        
        # Make a copy to avoid warnings
        df = df.copy()
        
        # Convert column names to lowercase and strip
        df.columns = [str(col).lower().strip() for col in df.columns]
        
        logger.info(f"Columns found: {list(df.columns)}")
        
        # Check required columns
        missing_cols = [col for col in CSVParser.REQUIRED_COLUMNS if col not in df.columns]
        if missing_cols:
            # Try alternative column names
            column_mapping = {
                'date': ['date', 'datetime', 'timestamp', 'time'],
                'open': ['open', 'opening', 'open_price'],
                'high': ['high', 'high_price', 'max'],
                'low': ['low', 'low_price', 'min'],
                'close': ['close', 'closing', 'close_price', 'price'],
                'volume': ['volume', 'vol', 'trading_volume', 'quantity']
            }
            
            for req_col in missing_cols[:]:  # Iterate over copy
                alternatives = column_mapping.get(req_col, [])
                for alt in alternatives:
                    if alt in df.columns:
                        df[req_col] = df[alt]
                        missing_cols.remove(req_col)
                        break
        
        if missing_cols:
            raise ValueError(f"Missing required columns: {missing_cols}")
        
        # Parse date column
        try:
            df['date'] = pd.to_datetime(df['date']).dt.date
        except Exception as e:
            raise ValueError(f"Error parsing date column: {e}")
        
        # Convert numeric columns
        numeric_cols = ['open', 'high', 'low', 'close', 'volume']
        for col in numeric_cols:
            df[col] = pd.to_numeric(df[col], errors='coerce')
        
        # Remove rows with NaN values
        df = df.dropna(subset=numeric_cols)
        
        if len(df) == 0:
            raise ValueError("No valid data rows after cleaning")
        
        # Add symbol if provided
        if symbol:
            df['symbol'] = symbol.upper()
        elif 'symbol' not in df.columns:
            df['symbol'] = 'UNKNOWN'
        else:
            df['symbol'] = df['symbol'].astype(str).str.upper()
        
        # Sort by date
        df = df.sort_values('date')
        
        # Reset index
        df = df.reset_index(drop=True)
        
        logger.info(f"Successfully parsed {len(df)} records for {df['symbol'].iloc[0]}")
        
        return df
    
    @staticmethod
    def validate_stock_data(df: pd.DataFrame) -> Tuple[bool, str]:
        """
        Validate stock data quality
        """
        
        if len(df) == 0:
            return False, "No data found"
        
        # Check for negative values
        numeric_cols = ['open', 'high', 'low', 'close', 'volume']
        for col in numeric_cols:
            if (df[col] < 0).any():
                return False, f"Negative values found in {col}"
        
        # Check price consistency
        if (df['high'] < df['low']).any():
            return False, "High price lower than low price"
        
        if (df['high'] < df['close']).any():
            return False, "High price lower than close price"
        
        if (df['low'] > df['close']).any():
            return False, "Low price higher than close price"
        
        # Check for duplicates
        if df.duplicated(subset=['date']).any():
            return False, "Duplicate dates found"
        
        return True, "Valid data"