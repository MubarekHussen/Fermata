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
    
    class Config:
        env_file = ".env"

settings = Settings()
