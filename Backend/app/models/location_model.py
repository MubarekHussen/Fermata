from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Boolean, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db import Base
import uuid
import enum

class LocationType(enum.Enum):
    """Location type enumeration"""
    ORIGIN = "origin"
    DESTINATION = "destination"
    WAYPOINT = "waypoint"
    TAXI_STAND = "taxi_stand"
    LANDMARK = "landmark"

class Location(Base):
    """Location model for storing location information"""
    __tablename__ = "locations"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    
    # Coordinates
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    
    # Location metadata
    location_type = Column(Enum(LocationType), nullable=False, default=LocationType.LANDMARK)
    is_active = Column(Boolean, default=True, index=True)
    is_popular = Column(Boolean, default=False, index=True)
    
    # Address information
    address = Column(Text, nullable=True)
    city = Column(String(100), nullable=True)
    district = Column(String(100), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    origin_routes = relationship("Route", foreign_keys="Route.origin_lat", backref="origin_location")
    destination_routes = relationship("Route", foreign_keys="Route.destination_lat", backref="destination_location")
    
    def __repr__(self):
        return f"<Location(id='{self.id}', name='{self.name}', type='{self.location_type.value}')>"
    
    def to_dict(self):
        """Convert model to dictionary"""
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "lat": self.lat,
            "lng": self.lng,
            "location_type": self.location_type.value,
            "is_active": self.is_active,
            "is_popular": self.is_popular,
            "address": self.address,
            "city": self.city,
            "district": self.district,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }

class LocationHistory(Base):
    """Model for storing location search/usage history"""
    __tablename__ = "location_history"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    location_id = Column(String, nullable=False, index=True)
    
    # Usage metadata
    search_count = Column(Integer, default=0)
    last_searched = Column(DateTime(timezone=True), server_default=func.now())
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    def __repr__(self):
        return f"<LocationHistory(id='{self.id}', location_id='{self.location_id}')>"
    
    def to_dict(self):
        """Convert model to dictionary"""
        return {
            "id": self.id,
            "location_id": self.location_id,
            "search_count": self.search_count,
            "last_searched": self.last_searched.isoformat() if self.last_searched else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        } 