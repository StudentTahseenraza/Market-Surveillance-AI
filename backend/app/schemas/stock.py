# backend/app/schemas/stock.py
from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional, List

class StockDataBase(BaseModel):
    symbol: str
    date: date
    open: float
    high: float
    low: float
    close: float
    volume: int

class StockDataCreate(StockDataBase):
    pass

class StockData(StockDataBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class AnomalyBase(BaseModel):
    date: date
    anomaly_type: str
    risk_score: float
    risk_level: str
    zscore_price: Optional[float] = None
    zscore_volume: Optional[float] = None

class Anomaly(AnomalyBase):
    id: int
    stock_id: int
    ml_score: Optional[float] = None
    detected_at: datetime
    
    class Config:
        from_attributes = True

class AnomalyResponse(Anomaly):
    symbol: str
    
class AnalysisSummary(BaseModel):
    symbol: str
    total_records: int
    anomalies_found: int
    high_risk: int
    medium_risk: int
    low_risk: int
    max_risk_score: float
    avg_risk_score: float