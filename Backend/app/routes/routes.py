from fastapi import APIRouter, HTTPException, Query, Depends
from typing import List, Optional
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.schemas.route_schemas import (
    RouteRequest, 
    RouteResponse, 
    PopularRoute, 
    LocationResponse,
    HealthResponse,
    ErrorResponse
)
from app.services.gebeta_service import GebetaService
from app.services.pricing_service import PricingService
from app.utils.popular_routes import get_popular_routes, get_route_by_id, get_all_locations
from app.db import get_db
from app.models.route_model import Route
from app.models.location_model import Location
from app.models.taxi_model import Taxi, TaxiStatus

router = APIRouter()
gebeta_service = GebetaService()
pricing_service = PricingService()

@router.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    gebeta_healthy = await gebeta_service.health_check()
    return HealthResponse(
        status="healthy" if gebeta_healthy else "degraded",
        version="1.0.0",
        timestamp=datetime.now().isoformat()
    )

@router.get("/routes/popular", response_model=List[PopularRoute])
async def get_popular_routes_endpoint(db: AsyncSession = Depends(get_db)):
    """Get all predefined popular routes from database"""
    try:
        # Query database for popular routes
        result = await db.execute(
            select(Route).where(Route.is_popular == True)
        )
        routes = result.scalars().all()
        
        if not routes:
            # Fallback to static data if database is empty
            return get_popular_routes()
        
        # Convert to response format
        return [
            PopularRoute(
                id=route.id,
                name=route.name,
                description=route.description,
                origin=LocationResponse(
                    name=route.origin_name,
                    lat=route.origin_lat,
                    lng=route.origin_lng
                ),
                destination=LocationResponse(
                    name=route.destination_name,
                    lat=route.destination_lat,
                    lng=route.destination_lng
                ),
                estimated_time=route.estimated_time,
                estimated_distance=route.estimated_distance
            )
            for route in routes
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching popular routes: {str(e)}")

@router.get("/routes/{route_id}", response_model=PopularRoute)
async def get_route_by_id_endpoint(route_id: str, db: AsyncSession = Depends(get_db)):
    """Get a specific popular route by ID from database"""
    try:
        # Query database for specific route
        result = await db.execute(
            select(Route).where(Route.id == route_id)
        )
        route = result.scalar_one_or_none()
        
        if not route:
            # Fallback to static data
            static_route = get_route_by_id(route_id)
            if not static_route:
                raise HTTPException(status_code=404, detail=f"Route with ID '{route_id}' not found")
            return static_route
        
        # Convert to response format
        return PopularRoute(
            id=route.id,
            name=route.name,
            description=route.description,
            origin=LocationResponse(
                name=route.origin_name,
                lat=route.origin_lat,
                lng=route.origin_lng
            ),
            destination=LocationResponse(
                name=route.destination_name,
                lat=route.destination_lat,
                lng=route.destination_lng
            ),
            estimated_time=route.estimated_time,
            estimated_distance=route.estimated_distance
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching route: {str(e)}")

@router.get("/locations", response_model=List[LocationResponse])
async def get_locations(db: AsyncSession = Depends(get_db)):
    """Get all available locations from database"""
    try:
        # Query database for active locations
        result = await db.execute(
            select(Location).where(Location.is_active == True)
        )
        locations = result.scalars().all()
        
        if not locations:
            # Fallback to static data if database is empty
            return get_all_locations()
        
        # Convert to response format
        return [
            LocationResponse(
                name=location.name,
                lat=location.lat,
                lng=location.lng
            )
            for location in locations
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching locations: {str(e)}")

@router.post("/route/directions", response_model=RouteResponse)
async def calculate_route(request: RouteRequest):
    """Calculate route between two points using Gebeta API"""
    try:
        # Validate coordinates
        origin_lat, origin_lng = request.origin
        dest_lat, dest_lng = request.destination
        
        if not all([
            gebeta_service.validate_coordinates(origin_lat, origin_lng),
            gebeta_service.validate_coordinates(dest_lat, dest_lng)
        ]):
            raise HTTPException(status_code=422, detail="Invalid coordinates provided")
        
        # Get route from Gebeta API
        result = await gebeta_service.get_route(
            origin=request.origin,
            destination=request.destination,
            waypoints=request.waypoints,
            include_instructions=request.include_instructions
        )
        
        if not result.success:
            raise HTTPException(status_code=400, detail=result.message)
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating route: {str(e)}")

@router.get("/route/directions", response_model=RouteResponse)
async def calculate_route_get(
    origin_lat: float = Query(..., description="Origin latitude"),
    origin_lng: float = Query(..., description="Origin longitude"),
    dest_lat: float = Query(..., description="Destination latitude"),
    dest_lng: float = Query(..., description="Destination longitude"),
    include_instructions: bool = Query(False, description="Include turn-by-turn instructions")
):
    """Calculate route using GET parameters (for easier testing)"""
    try:
        # Validate coordinates
        if not all([
            gebeta_service.validate_coordinates(origin_lat, origin_lng),
            gebeta_service.validate_coordinates(dest_lat, dest_lng)
        ]):
            raise HTTPException(status_code=422, detail="Invalid coordinates provided")
        
        # Get route from Gebeta API
        result = await gebeta_service.get_route(
            origin=(origin_lat, origin_lng),
            destination=(dest_lat, dest_lng),
            include_instructions=include_instructions
        )
        
        if not result.success:
            raise HTTPException(status_code=400, detail=result.message)
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating route: {str(e)}")

@router.get("/route/quick/{route_id}", response_model=RouteResponse)
async def calculate_popular_route(route_id: str, db: AsyncSession = Depends(get_db)):
    """Calculate route for a predefined popular route"""
    try:
        # Get the popular route from database
        result = await db.execute(
            select(Route).where(Route.id == route_id)
        )
        route = result.scalar_one_or_none()
        
        if not route:
            # Fallback to static data
            static_route = get_route_by_id(route_id)
            if not static_route:
                raise HTTPException(status_code=404, detail=f"Route with ID '{route_id}' not found")
            
            # Extract coordinates from static route
            origin = (static_route["origin"]["lat"], static_route["origin"]["lng"])
            destination = (static_route["destination"]["lat"], static_route["destination"]["lng"])
        else:
            # Extract coordinates from database route
            origin = (route.origin_lat, route.origin_lng)
            destination = (route.destination_lat, route.destination_lng)
        
        # Calculate route
        result = await gebeta_service.get_route(
            origin=origin,
            destination=destination
        )
        
        if not result.success:
            raise HTTPException(status_code=400, detail=result.message)
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating popular route: {str(e)}")

@router.get("/taxis/nearby", response_model=List[dict])
async def get_nearby_taxis(
    lat: float = Query(..., description="Latitude"),
    lng: float = Query(..., description="Longitude"),
    radius_km: float = Query(5.0, description="Search radius in kilometers"),
    db: AsyncSession = Depends(get_db)
):
    """Get taxis near a specific location"""
    try:
        # Calculate approximate bounding box (simple approach)
        # 1 degree ≈ 111 km
        lat_delta = radius_km / 111.0
        lng_delta = radius_km / (111.0 * abs(lat))
        
        # Query taxis within the bounding box
        result = await db.execute(
            select(Taxi).where(
                Taxi.current_lat.between(lat - lat_delta, lat + lat_delta),
                Taxi.current_lng.between(lng - lng_delta, lng + lng_delta),
                Taxi.status == TaxiStatus.AVAILABLE
            )
        )
        taxis = result.scalars().all()
        
        return [taxi.to_dict() for taxi in taxis]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching nearby taxis: {str(e)}")

@router.get("/route/plan", response_model=dict)
async def plan_route_with_taxis(
    origin_lat: float = Query(..., description="Origin latitude"),
    origin_lng: float = Query(..., description="Origin longitude"),
    dest_lat: float = Query(..., description="Destination latitude"),
    dest_lng: float = Query(..., description="Destination longitude"),
    db: AsyncSession = Depends(get_db)
):
    """Plan route and show nearby taxis at origin"""
    try:
        # 1. Calculate route using Gebeta API
        route_result = await gebeta_service.get_route(
            origin=(origin_lat, origin_lng),
            destination=(dest_lat, dest_lng)
        )
        
        if not route_result.success:
            raise HTTPException(status_code=400, detail=route_result.message)
        
        # 2. Calculate fare
        fare_result = pricing_service.calculate_fare(
            distance_meters=route_result.distance,
            time_seconds=route_result.time
        )
        
        # 3. Get nearby taxis at origin
        lat_delta = 2.0 / 111.0  # 2km radius
        lng_delta = 2.0 / (111.0 * abs(origin_lat))
        
        result = await db.execute(
            select(Taxi).where(
                Taxi.current_lat.between(origin_lat - lat_delta, origin_lat + lat_delta),
                Taxi.current_lng.between(origin_lng - lng_delta, origin_lng + lng_delta),
                Taxi.status == TaxiStatus.AVAILABLE
            )
        )
        nearby_taxis = result.scalars().all()
        
        # 4. Return combined data
        return {
            "route": {
                "distance": route_result.distance,
                "time": route_result.time,
                "coordinates": route_result.coordinates,
                "message": route_result.message
            },
            "fare": fare_result,
            "nearby_taxis": [taxi.to_dict() for taxi in nearby_taxis],
            "origin": {"lat": origin_lat, "lng": origin_lng},
            "destination": {"lat": dest_lat, "lng": dest_lng}
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error planning route: {str(e)}")

@router.get("/pricing/calculate", response_model=dict)
async def calculate_fare(
    distance_meters: float = Query(..., description="Distance in meters"),
    time_seconds: float = Query(..., description="Time in seconds"),
    is_night: bool = Query(False, description="Is night time (8 PM - 6 AM)"),
    is_peak_hour: bool = Query(False, description="Is peak hour (7-9 AM, 5-7 PM)")
):
    """Calculate taxi fare based on distance and time"""
    try:
        fare = pricing_service.calculate_fare(
            distance_meters=distance_meters,
            time_seconds=time_seconds,
            is_night=is_night,
            is_peak_hour=is_peak_hour
        )
        return fare
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating fare: {str(e)}")

@router.get("/pricing/estimate", response_model=dict)
async def estimate_fare_range(
    distance_meters: float = Query(..., description="Distance in meters"),
    time_seconds: float = Query(..., description="Time in seconds")
):
    """Estimate fare range (min/max) for a trip"""
    try:
        fare_range = pricing_service.estimate_fare_range(
            distance_meters=distance_meters,
            time_seconds=time_seconds
        )
        return fare_range
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error estimating fare: {str(e)}")

@router.get("/pricing/info", response_model=dict)
async def get_pricing_info():
    """Get current pricing information"""
    try:
        return pricing_service.get_pricing_info()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting pricing info: {str(e)}") 