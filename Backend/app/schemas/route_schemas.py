from pydantic import BaseModel, Field
from typing import List, Tuple, Optional, Dict, Any

class Location(BaseModel):
    """Location model with coordinates and name"""
    lat: float = Field(..., description="Latitude coordinate")
    lng: float = Field(..., description="Longitude coordinate")
    name: str = Field(..., description="Location name")

class RouteRequest(BaseModel):
    """Request model for route calculation"""
    origin: Tuple[float, float] = Field(..., description="Origin coordinates (lat, lng)")
    destination: Tuple[float, float] = Field(..., description="Destination coordinates (lat, lng)")
    waypoints: Optional[List[Tuple[float, float]]] = Field(None, description="Optional waypoints")
    include_instructions: bool = Field(False, description="Include turn-by-turn instructions")

class RouteResponse(BaseModel):
    """Response model for route calculation"""
    success: bool = Field(..., description="Whether the route calculation was successful")
    distance: float = Field(..., description="Total distance in meters")
    time: float = Field(..., description="Estimated travel time in seconds")
    coordinates: List[List[float]] = Field(..., description="Route coordinates")
    message: str = Field(..., description="Response message")
    instructions: Optional[List[str]] = Field(None, description="Turn-by-turn instructions")

class PopularRoute(BaseModel):
    """Model for predefined popular routes"""
    id: str = Field(..., description="Route identifier")
    name: str = Field(..., description="Route name")
    description: str = Field(..., description="Route description")
    origin: Location = Field(..., description="Origin location")
    destination: Location = Field(..., description="Destination location")
    estimated_time: int = Field(..., description="Estimated time in minutes")
    estimated_distance: float = Field(..., description="Estimated distance in km")

class LocationResponse(BaseModel):
    """Response model for location data"""
    name: str = Field(..., description="Location name")
    lat: float = Field(..., description="Latitude")
    lng: float = Field(..., description="Longitude")

class ErrorResponse(BaseModel):
    """Error response model"""
    success: bool = Field(False, description="Always false for errors")
    error: str = Field(..., description="Error message")
    details: Optional[Dict[str, Any]] = Field(None, description="Additional error details")

class HealthResponse(BaseModel):
    """Health check response"""
    status: str = Field(..., description="Service status")
    version: str = Field(..., description="API version")
    timestamp: str = Field(..., description="Current timestamp") 