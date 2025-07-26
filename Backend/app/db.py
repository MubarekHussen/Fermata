import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from app.config import settings
import logging

# Load environment variables from .env file
load_dotenv()

logger = logging.getLogger(__name__)

# Create declarative base
Base = declarative_base()

# Metadata for migrations
from sqlalchemy import MetaData
metadata = MetaData()

# Synchronous engine for Alembic
engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Async engine for FastAPI
async_engine = create_async_engine(
    settings.DATABASE_URL.replace("postgresql+psycopg2://", "postgresql+asyncpg://"),
    echo=settings.DEBUG,
    pool_pre_ping=True,
    pool_recycle=300,
)

# Create async session factory
AsyncSessionLocal = async_sessionmaker(
    async_engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

def get_db_sync():
    """Synchronous database session for Alembic"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

async def get_db() -> AsyncSession:
    """Async database session for FastAPI"""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception as e:
            await session.rollback()
            logger.error(f"Database session error: {e}")
            raise
        finally:
            await session.close()

def init_db_sync():
    """Initialize database tables synchronously"""
    try:
        # Import models to ensure they're registered
        from app.models import route_model, location_model, taxi_model
        
        # Create all tables
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully")
    except Exception as e:
        logger.error(f"Error initializing database: {e}")
        raise

async def init_db():
    """Initialize database tables asynchronously"""
    try:
        async with async_engine.begin() as conn:
            # Import models to ensure they're registered
            from app.models import route_model, location_model, taxi_model
            
            # Create all tables
            await conn.run_sync(Base.metadata.create_all)
            logger.info("Database tables created successfully")
    except Exception as e:
        logger.error(f"Error initializing database: {e}")
        raise

async def close_db():
    """Close database connections"""
    await async_engine.dispose()
    logger.info("Database connections closed")
