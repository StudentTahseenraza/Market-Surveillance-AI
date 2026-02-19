# backend/app/api/websocket.py
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from sqlalchemy.orm import Session
import json
import asyncio
from datetime import datetime
from typing import List

from ..database import get_db
from ..models.stock import StockData, Anomaly
from ..ml import MarketSurveillanceEngine

router = APIRouter(prefix="/ws", tags=["WebSocket"])
surveillance_engine = MarketSurveillanceEngine()

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
    
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
    
    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
    
    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)
    
    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except:
                pass

manager = ConnectionManager()

@router.websocket("/realtime/{symbol}")
async def websocket_endpoint(websocket: WebSocket, symbol: str):
    await manager.connect(websocket)
    try:
        while True:
            # Send heartbeat
            await websocket.send_text(json.dumps({
                "type": "HEARTBEAT",
                "timestamp": datetime.now().isoformat()
            }))
            await asyncio.sleep(30)
            
    except WebSocketDisconnect:
        manager.disconnect(websocket)