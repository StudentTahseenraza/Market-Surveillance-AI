# backend/app/api/reports.py
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from sqlalchemy.orm import Session
import pandas as pd
from datetime import datetime

from ..database import get_db
from ..models.stock import StockData, Anomaly
from ..models.audit import AuditLog
from .auth import get_current_active_user, require_role
from ..utils.pdf_generator import PDFReportGenerator
from ..ml import MarketSurveillanceEngine

router = APIRouter(prefix="/reports", tags=["Reports"])
pdf_generator = PDFReportGenerator()
surveillance_engine = MarketSurveillanceEngine()

@router.get("/generate/{symbol}")
async def generate_report(
    symbol: str,
    db: Session = Depends(get_db),
    current_user = Depends(require_role("analyst"))
):
    """Generate PDF report for a stock"""
    
    # Get stock data
    stock_data = db.query(StockData).filter(
        StockData.symbol == symbol
    ).order_by(StockData.date).all()
    
    if not stock_data:
        raise HTTPException(status_code=404, detail="No data found")
    
    # Get anomalies
    anomalies = db.query(Anomaly).join(
        StockData
    ).filter(
        StockData.symbol == symbol
    ).order_by(Anomaly.date.desc()).all()
    
    # Convert to DataFrame
    df = pd.DataFrame([{
        'date': s.date,
        'open': s.open,
        'high': s.high,
        'low': s.low,
        'close': s.close,
        'volume': s.volume
    } for s in stock_data])
    
    # Run analysis
    df_result = surveillance_engine.analyze(df)
    
    # Prepare analysis summary
    summary = {
        'total_days': len(df_result),
        'high_risk_days': len(df_result[df_result['risk_level'] == 'High']),
        'medium_risk_days': len(df_result[df_result['risk_level'] == 'Medium']),
        'low_risk_days': len(df_result[df_result['risk_level'] == 'Low']),
        'avg_risk_score': float(df_result['risk_score'].mean()),
        'max_risk_score': float(df_result['risk_score'].max()),
        'price_anomalies': int(df_result['price_anomaly_z'].sum()),
        'volume_anomalies': int(df_result['volume_anomaly_z'].sum()),
        'ml_anomalies': 0
    }
    
    # Prepare anomalies list
    anomalies_list = [{
        'date': a.date.strftime('%Y-%m-%d'),
        'anomaly_type': a.anomaly_type,
        'risk_score': a.risk_score,
        'risk_level': a.risk_level,
        'zscore_price': a.zscore_price,
        'zscore_volume': a.zscore_volume
    } for a in anomalies[:20]]
    
    # Generate PDF
    try:
        pdf_buffer = pdf_generator.generate_report(
            stock_symbol=symbol,
            df=df_result,
            analysis_summary=summary,
            anomalies=anomalies_list
        )
        
        # Audit log
        audit = AuditLog(
            user_id=current_user.id,
            username=current_user.username,
            action="EXPORT_REPORT",
            stock_symbol=symbol,
            details=f"Generated PDF report",
            ip_address="127.0.0.1"
        )
        db.add(audit)
        db.commit()
        
        return Response(
            content=pdf_buffer.getvalue(),
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename=market_surveillance_{symbol}_{datetime.now().strftime('%Y%m%d')}.pdf"
            }
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate PDF: {str(e)}")

@router.get("/audit-logs")
def get_audit_logs(
    db: Session = Depends(get_db),
    current_user = Depends(require_role("admin"))
):
    """Get audit logs (admin only)"""
    
    logs = db.query(AuditLog).order_by(
        AuditLog.timestamp.desc()
    ).limit(100).all()
    
    return logs