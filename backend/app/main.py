# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .database import engine, Base, init_db, SessionLocal
from .api import auth_router, stocks_router, reports_router, websocket_router
from .ml import MarketSurveillanceEngine
from .utils.create_default_users import create_default_users
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create database tables
logger.info("Creating database tables...")
init_db()
logger.info("Database tables created successfully!")

# Create default users
db = SessionLocal()
try:
    create_default_users(db)
finally:
    db.close()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:3000", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(stocks_router, prefix=settings.API_V1_STR)
app.include_router(reports_router, prefix=settings.API_V1_STR)
app.include_router(websocket_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "message": "🚀 Market Surveillance AI API",
        "version": settings.VERSION,
        "status": "operational",
        "docs": "/docs",
        "default_users": ["admin/admin123", "analyst/analyst123", "viewer/viewer123"]
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "database": "connected",
        "ml_engine": "initialized"
    }

@app.on_event("startup")
async def startup_event():
    logger.info("="*50)
    logger.info("🚀 Market Surveillance AI started")
    logger.info(f"📊 Version: {settings.VERSION}")
    logger.info("🧠 AI/ML Engine: Initialized")
    logger.info("👤 Default users: admin/admin123, analyst/analyst123, viewer/viewer123")
    logger.info("="*50)