# backend/app/utils/pdf_generator.py
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, landscape
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
import pandas as pd
import io
from datetime import datetime

class PDFReportGenerator:
    """Generate PDF reports for market surveillance"""
    
    def generate_report(self, stock_symbol: str, df: pd.DataFrame, 
                        analysis_summary: dict, anomalies: list):
        """Generate comprehensive PDF report"""
        
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=landscape(letter))
        styles = getSampleStyleSheet()
        story = []
        
        # Title
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            spaceAfter=30,
            textColor=colors.HexColor('#1e3c72')
        )
        title = Paragraph(f"Market Surveillance Report: {stock_symbol}", title_style)
        story.append(title)
        
        # Date
        date_style = ParagraphStyle(
            'DateStyle',
            parent=styles['Normal'],
            fontSize=12,
            textColor=colors.gray
        )
        date_text = Paragraph(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}", date_style)
        story.append(date_text)
        story.append(Spacer(1, 0.3 * inch))
        
        # Summary Section
        summary_title = Paragraph("Risk Analysis Summary", styles['Heading2'])
        story.append(summary_title)
        story.append(Spacer(1, 0.1 * inch))
        
        # Summary table
        summary_data = [
            ['Metric', 'Value'],
            ['Total Days Analyzed', str(analysis_summary['total_days'])],
            ['High Risk Days', str(analysis_summary['high_risk_days'])],
            ['Medium Risk Days', str(analysis_summary['medium_risk_days'])],
            ['Low Risk Days', str(analysis_summary['low_risk_days'])],
            ['Average Risk Score', f"{analysis_summary['avg_risk_score']:.2f}"],
            ['Maximum Risk Score', f"{analysis_summary['max_risk_score']:.2f}"],
            ['Price Anomalies', str(analysis_summary['price_anomalies'])],
            ['Volume Anomalies', str(analysis_summary['volume_anomalies'])],
            ['ML Pattern Anomalies', str(analysis_summary['ml_anomalies'])]
        ]
        
        summary_table = Table(summary_data, colWidths=[2*inch, 1.5*inch])
        summary_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1e3c72')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#f8f9fc')),
            ('TEXTCOLOR', (0, 1), (-1, -1), colors.HexColor('#2c3e50')),
            ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#cbd5e0'))
        ]))
        
        story.append(summary_table)
        story.append(Spacer(1, 0.3 * inch))
        
        # Anomalies Section
        if anomalies:
            anomalies_title = Paragraph("Detected Anomalies", styles['Heading2'])
            story.append(anomalies_title)
            story.append(Spacer(1, 0.1 * inch))
            
            anomaly_data = [['Date', 'Type', 'Risk Score', 'Risk Level']]
            for a in anomalies[:20]:
                anomaly_data.append([
                    a['date'],
                    a['anomaly_type'],
                    f"{a['risk_score']:.1f}",
                    a['risk_level']
                ])
            
            anomaly_table = Table(anomaly_data, colWidths=[1.2*inch, 1.5*inch, 1*inch, 1*inch])
            anomaly_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#dc3545')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#fff5f5')),
                ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#feb2b2'))
            ]))
            
            story.append(anomaly_table)
        
        # Recommendations
        story.append(Spacer(1, 0.3 * inch))
        recommendations_title = Paragraph("Regulatory Recommendations", styles['Heading2'])
        story.append(recommendations_title)
        story.append(Spacer(1, 0.1 * inch))
        
        recommendations = []
        if analysis_summary['high_risk_days'] > 0:
            recommendations.append(f"• HIGH ALERT: {analysis_summary['high_risk_days']} high-risk days detected - immediate investigation required")
        if analysis_summary['price_anomalies'] > 3:
            recommendations.append(f"• Price manipulation suspected - {analysis_summary['price_anomalies']} price anomalies detected")
        if analysis_summary['volume_anomalies'] > 3:
            recommendations.append(f"• Unusual trading volume - {analysis_summary['volume_anomalies']} volume spikes detected")
        
        if not recommendations:
            recommendations.append("• No immediate regulatory action required")
        
        for rec in recommendations:
            rec_para = Paragraph(rec, styles['Normal'])
            story.append(rec_para)
            story.append(Spacer(1, 0.05 * inch))
        
        # Footer
        story.append(Spacer(1, 0.5 * inch))
        footer_text = "This report is generated automatically by Market Surveillance AI. For official use only."
        footer = Paragraph(footer_text, ParagraphStyle('Footer', parent=styles['Normal'], fontSize=8, textColor=colors.gray))
        story.append(footer)
        
        doc.build(story)
        buffer.seek(0)
        return buffer