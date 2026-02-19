# backend/app/api/__init__.py
from .auth import router as auth_router
from .stocks import router as stocks_router
from .reports import router as reports_router
from .websocket import router as websocket_router

__all__ = ['auth_router', 'stocks_router', 'reports_router', 'websocket_router']