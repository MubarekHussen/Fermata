from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import logging

from app.config import settings
from app.routes import routes
from app.db import init_db, close_db

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    # Startup
    logger.info("Starting Fermata Taxi API...")
    try:
        await init_db()
        logger.info("Database initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")
        raise
    
    yield
    
    # Shutdown
    logger.info("Shutting down Fermata Taxi API...")
    await close_db()

# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Taxi routing API using Gebeta Directions API with PostgreSQL",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(routes.router, prefix="/api", tags=["routes"])

@app.get("/", tags=["root"])
async def root():
    """Root endpoint"""
    return {
        "message": "Welcome to Fermata Taxi API",
        "version": settings.APP_VERSION,
        "database": "PostgreSQL",
        "docs": "/docs",
        "health": "/api/health"
    }

@app.get("/api", tags=["api"])
async def api_info():
    """API information endpoint"""
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "description": "Taxi routing API using Gebeta Directions API with PostgreSQL",
        "database": "PostgreSQL",
        "endpoints": {
            "health": "/api/health",
            "popular_routes": "/api/routes/popular",
            "calculate_route": "/api/route/calculate",  # User-friendly endpoint
            "plan_route": "/api/route/plan",  # Complete planning with place names
            "search_locations": "/api/locations/search",  # Search locations by name
            "resolve_location": "/api/locations/resolve/{place_name}",  # Resolve place name to coordinates
            "route_directions": "/api/route/directions",  # Advanced coordinate-based endpoint
            "locations": "/api/locations",
            "taxis": "/api/taxis",
            "trips": "/api/trips",
            "pricing": "/api/pricing/calculate"
        },
        "user_friendly_features": {
            "place_name_input": "Users can enter place names like 'Mexico', 'Ayertena' instead of coordinates",
            "location_search": "Search for available locations by name",
            "fuzzy_matching": "System can handle typos and partial matches",
            "comprehensive_planning": "Get route, pricing, and nearby taxis in one request"
        }
    }

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler"""
    logger.error(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": "Internal server error",
            "message": "An unexpected error occurred"
        }
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
        log_level="info"
    )
