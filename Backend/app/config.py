import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv
from typing import List

# Load environment variables from .env file
load_dotenv()

class Settings(BaseSettings):
    # Gebeta API Configuration
    GEBETA_API_KEY: str
    GEBETA_BASE_URL: str = "https://mapapi.gebeta.app/api/route/direction/"
    
    # Server Configuration
    APP_NAME: str = "Fermata Taxi API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    
    # CORS Configuration
    ALLOWED_ORIGINS: str = "*"  # Comma-separated list

    # Database Configuration
    DATABASE_URL: str = "sqlite+aiosqlite:///./fermata_taxi.db"

    # JWT Configuration
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    class Config:
        env_file = ".env"

    @property
    def allowed_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]

settings = Settings()
