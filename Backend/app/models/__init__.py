# Import all models to ensure they're registered with SQLAlchemy
from .route_model import Route, RouteCalculation
from .location_model import Location, LocationHistory, LocationType
from .taxi_model import Taxi, Trip, TaxiStatus, DriverStatus

__all__ = [
    "Route",
    "RouteCalculation", 
    "Location",
    "LocationHistory",
    "LocationType",
    "Taxi",
    "Trip",
    "TaxiStatus",
    "DriverStatus"
]
