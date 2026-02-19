# backend/app/models/audit.py
from sqlalchemy import Column, Integer, String, DateTime, Float, Text
from sqlalchemy.sql import func
from ..database import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    username = Column(String)
    action = Column(String)  # LOGIN, ANALYSIS, EXPORT, etc.
    stock_symbol = Column(String, nullable=True)
    risk_score = Column(Float, nullable=True)
    details = Column(Text)
    ip_address = Column(String)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())