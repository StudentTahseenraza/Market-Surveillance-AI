# backend/app/api/stocks.py
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Request, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
import pandas as pd
import io
from datetime import datetime, date
import logging

from ..database import get_db
from ..config import settings

# DIRECT MODEL IMPORTS
from ..models.stock import StockData, Anomaly
from ..models.audit import AuditLog

# DIRECT SCHEMA IMPORTS
from ..schemas.stock import StockData as StockDataSchema, Anomaly as AnomalySchema, AnalysisSummary

# IMPORT AUTH DEPENDENCIES
from .auth import get_current_active_user, require_role

# IMPORT ML ENGINE
from ..ml import MarketSurveillanceEngine
from ..utils.csv_parser import CSVParser

router = APIRouter(prefix="/stocks", tags=["Stocks"])
surveillance_engine = MarketSurveillanceEngine()
logger = logging.getLogger(__name__)

@router.post("/upload")
async def upload_stock_data(
    request: Request,
    file: UploadFile = File(...),
    symbol: Optional[str] = Query(None, description="Stock symbol"),
    db: Session = Depends(get_db),
    current_user = Depends(require_role("analyst"))
):
    """Upload CSV file with stock data"""
    
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files allowed")
    
    try:
        # Read CSV
        content = await file.read()
        df = pd.read_csv(io.StringIO(content.decode('utf-8-sig')))
        
        logger.info(f"Received file: {file.filename}, shape: {df.shape}")
        
        # Parse and validate
        parser = CSVParser()
        df = parser.validate_and_parse(df, symbol)
        
        logger.info(f"Parsed data: {len(df)} records for {df['symbol'].iloc[0]}")
        
        # Store in database
        stored_count = 0
        for _, row in df.iterrows():
            # Check if record already exists
            existing = db.query(StockData).filter(
                StockData.symbol == row['symbol'],
                StockData.date == row['date']
            ).first()
            
            if not existing:
                stock_data = StockData(
                    symbol=row['symbol'],
                    date=row['date'],
                    open=float(row['open']),
                    high=float(row['high']),
                    low=float(row['low']),
                    close=float(row['close']),
                    volume=int(row['volume'])
                )
                db.add(stock_data)
                stored_count += 1
        
        if stored_count > 0:
            db.commit()
            logger.info(f"Stored {stored_count} new records")
        
        # Audit log
        audit = AuditLog(
            user_id=current_user.id,
            username=current_user.username,
            action="UPLOAD",
            stock_symbol=df['symbol'].iloc[0],
            details=f"Uploaded {stored_count} records from {file.filename}",
            ip_address=request.client.host if request.client else "unknown"
        )
        db.add(audit)
        db.commit()
        
        return {
            "message": f"Successfully uploaded {stored_count} records",
            "symbol": df['symbol'].iloc[0],
            "records": stored_count
        }
        
    except Exception as e:
        logger.error(f"Upload error: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/data/{symbol}")
def get_stock_data(
    symbol: str,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    limit: Optional[int] = Query(100, description="Number of records to return"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Get stock data for analysis"""
    
    query = db.query(StockData).filter(StockData.symbol == symbol)
    
    if start_date:
        query = query.filter(StockData.date >= datetime.strptime(start_date, '%Y-%m-%d').date())
    if end_date:
        query = query.filter(StockData.date <= datetime.strptime(end_date, '%Y-%m-%d').date())
    
    data = query.order_by(StockData.date.desc()).limit(limit).all()
    
    if not data:
        # Return empty list instead of 404
        return []
    
    # Return in ascending order for charts
    return sorted(data, key=lambda x: x.date)

@router.post("/analyze/{symbol}")
def analyze_stock(
    symbol: str,
    db: Session = Depends(get_db),
    current_user = Depends(require_role("analyst"))
):
    """Run AI analysis on stock data"""
    
    # Get stock data
    stock_data = db.query(StockData).filter(
        StockData.symbol == symbol
    ).order_by(StockData.date).all()
    
    if not stock_data:
        raise HTTPException(status_code=404, detail="No data found for this symbol")
    
    try:
        # Convert to DataFrame
        df = pd.DataFrame([{
            'date': s.date,
            'open': s.open,
            'high': s.high,
            'low': s.low,
            'close': s.close,
            'volume': s.volume
        } for s in stock_data])
        
        # Run AI analysis
        df_result = surveillance_engine.analyze(df)
        
        # Delete old anomalies for this symbol
        db.query(Anomaly).filter(
            Anomaly.stock_id.in_(
                db.query(StockData.id).filter(StockData.symbol == symbol)
            )
        ).delete(synchronize_session=False)
        
        # Store new anomalies
        anomalies_df = df_result[df_result['is_anomaly'] == True]
        
        for _, row in anomalies_df.iterrows():
            stock = db.query(StockData).filter(
                StockData.symbol == symbol,
                StockData.date == row['date']
            ).first()
            
            if stock:
                anomaly = Anomaly(
                    stock_id=stock.id,
                    date=row['date'],
                    anomaly_type=row['anomaly_type'],
                    risk_score=float(row['risk_score']),
                    risk_level=row['risk_level'],
                    ml_score=float(row.get('ml_score_if', 0)),
                    zscore_price=float(row.get('price_zscore', 0)),
                    zscore_volume=float(row.get('volume_zscore', 0))
                )
                db.add(anomaly)
        
        db.commit()
        
        # Audit log
        audit = AuditLog(
            user_id=current_user.id,
            username=current_user.username,
            action="ANALYSIS",
            stock_symbol=symbol,
            risk_score=float(df_result['risk_score'].max()),
            details=f"Analyzed {symbol} - Found {len(anomalies_df)} anomalies",
            ip_address="127.0.0.1"
        )
        db.add(audit)
        db.commit()
        
        # Return summary
        summary = {
            'symbol': symbol,
            'total_records': len(df_result),
            'anomalies_found': len(anomalies_df),
            'high_risk': int(len(df_result[df_result['risk_level'] == 'High'])),
            'medium_risk': int(len(df_result[df_result['risk_level'] == 'Medium'])),
            'low_risk': int(len(df_result[df_result['risk_level'] == 'Low'])),
            'max_risk_score': float(df_result['risk_score'].max()),
            'avg_risk_score': float(df_result['risk_score'].mean())
        }
        
        return summary
        
    except Exception as e:
        logger.error(f"Analysis error: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@router.get("/anomalies/{symbol}")
def get_anomalies(
    symbol: str,
    limit: Optional[int] = Query(50, description="Number of anomalies to return"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Get detected anomalies for a stock"""
    
    anomalies = db.query(Anomaly).join(
        StockData
    ).filter(
        StockData.symbol == symbol
    ).order_by(
        Anomaly.date.desc()
    ).limit(limit).all()
    
    return anomalies

@router.get("/symbols")
def get_symbols(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Get all available stock symbols"""
    
    symbols = db.query(StockData.symbol).distinct().all()
    result = [s[0] for s in symbols if s[0]]
    
    # Add default symbols if none exist
    if not result:
        result = ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ICICIBANK']
    
    return result

@router.get("/stats/{symbol}")
def get_stock_stats(
    symbol: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Get statistical summary for a stock"""
    
    data = db.query(StockData).filter(StockData.symbol == symbol).all()
    
    if not data:
        return {
            'symbol': symbol,
            'avg_price': 0,
            'avg_volume': 0,
            'price_change': 0,
            'volume_change': 0
        }
    
    df = pd.DataFrame([{
        'close': d.close,
        'volume': d.volume,
        'date': d.date
    } for d in data])
    
    return {
        'symbol': symbol,
        'avg_price': float(df['close'].mean()),
        'avg_volume': float(df['volume'].mean()),
        'price_change': float(df['close'].pct_change().mean() * 100),
        'volume_change': float(df['volume'].pct_change().mean() * 100),
        'max_price': float(df['close'].max()),
        'min_price': float(df['close'].min()),
        'total_volume': int(df['volume'].sum())
    }