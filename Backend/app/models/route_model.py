from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db import Base
import uuid

class Route(Base):
    """Route model for storing route information"""
    __tablename__ = "routes"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    
    # Origin coordinates
    origin_lat = Column(Float, nullable=False)
    origin_lng = Column(Float, nullable=False)
    origin_name = Column(String(255), nullable=False)
    
    # Destination coordinates
    destination_lat = Column(Float, nullable=False)
    destination_lng = Column(Float, nullable=False)
    destination_name = Column(String(255), nullable=False)
    
    # Route metadata
    estimated_time = Column(Integer, nullable=True)  # minutes
    estimated_distance = Column(Float, nullable=True)  # kilometers
    is_popular = Column(Boolean, default=False, index=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    route_calculations = relationship("RouteCalculation", back_populates="route", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Route(id='{self.id}', name='{self.name}')>"
    
    def to_dict(self):
        """Convert model to dictionary"""
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "origin": {
                "lat": self.origin_lat,
                "lng": self.origin_lng,
                "name": self.origin_name
            },
            "destination": {
                "lat": self.destination_lat,
                "lng": self.destination_lng,
                "name": self.destination_name
            },
            "estimated_time": self.estimated_time,
            "estimated_distance": self.estimated_distance,
            "is_popular": self.is_popular,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }

class RouteCalculation(Base):
    """Model for storing calculated route data"""
    __tablename__ = "route_calculations"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    route_id = Column(String, ForeignKey("routes.id"), nullable=False)
    
    # Calculated route data
    distance = Column(Float, nullable=False)  # meters
    time = Column(Float, nullable=False)  # seconds
    coordinates = Column(Text, nullable=True)  # JSON string of coordinates
    instructions = Column(Text, nullable=True)  # JSON string of instructions
    
    # API response metadata
    gebeta_response = Column(Text, nullable=True)  # Full API response
    success = Column(Boolean, default=True)
    error_message = Column(Text, nullable=True)
    
    # Timestamps
    calculated_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    route = relationship("Route", back_populates="route_calculations")
    
    def __repr__(self):
        return f"<RouteCalculation(id='{self.id}', route_id='{self.route_id}')>"
    
    def to_dict(self):
        """Convert model to dictionary"""
        return {
            "id": self.id,
            "route_id": self.route_id,
            "distance": self.distance,
            "time": self.time,
            "coordinates": self.coordinates,
            "instructions": self.instructions,
            "success": self.success,
            "error_message": self.error_message,
            "calculated_at": self.calculated_at.isoformat() if self.calculated_at else None
        } 