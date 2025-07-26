import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Settings(BaseSettings):
    # Gebeta API Configuration
    GEBETA_API_KEY: str = os.getenv("GEBETA_API_KEY", "your-api-key-here")
    GEBETA_BASE_URL: str = "https://mapapi.gebeta.app/api/route/direction/"
    
    # Server Configuration
    APP_NAME: str = "Fermata Taxi API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    
    # CORS Configuration
    ALLOWED_ORIGINS: list = ["*"]  # In production, specify your frontend URL
    
    # Database Configuration - Using SQLite for development
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./fermata_taxi.db")
    
    # JWT Configuration
    SECRET_KEY: str = os.getenv("SECRET_KEY", "qTQnmdyZ93hHghNx1M0xvuFP5Qsw1c3o")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))
    
    class Config:
        env_file = ".env"

settings = Settings()
