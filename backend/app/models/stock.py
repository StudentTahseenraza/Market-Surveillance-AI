# backend/app/models/stock.py
from sqlalchemy import Column, Integer, String, Float, DateTime, Date, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from ..database import Base

class StockData(Base):
    __tablename__ = "stock_data"
    
    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String, index=True, nullable=False)
    date = Column(Date, nullable=False)
    open = Column(Float)
    high = Column(Float)
    low = Column(Float)
    close = Column(Float)
    volume = Column(Integer)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    anomalies = relationship("Anomaly", back_populates="stock", cascade="all, delete-orphan")

class Anomaly(Base):
    __tablename__ = "anomalies"
    
    id = Column(Integer, primary_key=True, index=True)
    stock_id = Column(Integer, ForeignKey("stock_data.id", ondelete="CASCADE"))
    date = Column(Date, nullable=False)
    anomaly_type = Column(String)  # price, volume, both
    risk_score = Column(Float)
    risk_level = Column(String)  # Low, Medium, High
    ml_score = Column(Float)  # Isolation Forest score
    zscore_price = Column(Float)
    zscore_volume = Column(Float)
    detected_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    stock = relationship("StockData", back_populates="anomalies")