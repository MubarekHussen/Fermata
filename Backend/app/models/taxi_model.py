from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Boolean, Enum, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db import Base
import uuid
import enum

class TaxiStatus(enum.Enum):
    """Taxi status enumeration"""
    AVAILABLE = "available"
    BUSY = "busy"
    OFFLINE = "offline"
    MAINTENANCE = "maintenance"

class DriverStatus(enum.Enum):
    """Driver status enumeration"""
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"

class Taxi(Base):
    """Taxi model for storing taxi information"""
    __tablename__ = "taxis"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    plate_number = Column(String(20), nullable=False, unique=True, index=True)
    model = Column(String(100), nullable=True)
    color = Column(String(50), nullable=True)
    year = Column(Integer, nullable=True)
    
    # Current location
    current_lat = Column(Float, nullable=True)
    current_lng = Column(Float, nullable=True)
    last_location_update = Column(DateTime(timezone=True), nullable=True)
    
    # Status
    status = Column(Enum(TaxiStatus), nullable=False, default=TaxiStatus.OFFLINE)
    is_active = Column(Boolean, default=True, index=True)
    
    # Driver information
    driver_id = Column(String, nullable=True, index=True)
    driver_name = Column(String(255), nullable=True)
    driver_phone = Column(String(20), nullable=True)
    driver_status = Column(Enum(DriverStatus), nullable=False, default=DriverStatus.INACTIVE)
    
    # Rating and reviews
    rating = Column(Float, default=0.0)
    total_trips = Column(Integer, default=0)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    trips = relationship("Trip", back_populates="taxi", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Taxi(id='{self.id}', plate='{self.plate_number}', status='{self.status.value}')>"
    
    def to_dict(self):
        """Convert model to dictionary"""
        return {
            "id": self.id,
            "plate_number": self.plate_number,
            "model": self.model,
            "color": self.color,
            "year": self.year,
            "current_location": {
                "lat": self.current_lat,
                "lng": self.current_lng
            },
            "last_location_update": self.last_location_update.isoformat() if self.last_location_update else None,
            "status": self.status.value,
            "is_active": self.is_active,
            "driver": {
                "id": self.driver_id,
                "name": self.driver_name,
                "phone": self.driver_phone,
                "status": self.driver_status.value
            },
            "rating": self.rating,
            "total_trips": self.total_trips,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }

class Trip(Base):
    """Trip model for storing trip information"""
    __tablename__ = "trips"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    taxi_id = Column(String, ForeignKey("taxis.id"), nullable=False)
    
    # Trip details
    origin_lat = Column(Float, nullable=False)
    origin_lng = Column(Float, nullable=False)
    origin_name = Column(String(255), nullable=False)
    
    destination_lat = Column(Float, nullable=False)
    destination_lng = Column(Float, nullable=False)
    destination_name = Column(String(255), nullable=False)
    
    # Trip status
    status = Column(String(50), nullable=False, default="pending")  # pending, active, completed, cancelled
    
    # Trip metrics
    distance = Column(Float, nullable=True)  # meters
    duration = Column(Float, nullable=True)  # seconds
    fare = Column(Float, nullable=True)  # ETB
    
    # Timestamps
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    taxi = relationship("Taxi", back_populates="trips")
    
    def __repr__(self):
        return f"<Trip(id='{self.id}', taxi_id='{self.taxi_id}', status='{self.status}')>"
    
    def to_dict(self):
        """Convert model to dictionary"""
        return {
            "id": self.id,
            "taxi_id": self.taxi_id,
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
            "status": self.status,
            "distance": self.distance,
            "duration": self.duration,
            "fare": self.fare,
            "started_at": self.started_at.isoformat() if self.started_at else None,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        } 