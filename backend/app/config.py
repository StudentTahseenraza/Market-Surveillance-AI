# backend/app/config.py
from pydantic_settings import BaseSettings
from dotenv import load_dotenv
import os

load_dotenv()

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://market_user:market_pass123@localhost/market_surveillance")
    
    # JWT
    SECRET_KEY: str = os.getenv("SECRET_KEY", "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # App
    PROJECT_NAME: str = "Market Surveillance AI"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # ML Settings
    ANOMALY_CONTAMINATION: float = 0.1
    ZSCORE_THRESHOLD: float = 2.5
    VOLUME_SPIKE_THRESHOLD: float = 2.0

settings = Settings()