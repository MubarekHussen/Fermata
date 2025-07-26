"""
Pricing service for taxi fare calculation
"""
from typing import Dict, Any
import math

class PricingService:
    """Service for calculating taxi fares"""
    
    def __init__(self):
        # Ethiopian taxi pricing (ETB - Ethiopian Birr)
        self.base_fare = 25.0  # Base fare in ETB
        self.per_km_rate = 12.0  # Rate per kilometer
        self.per_minute_rate = 0.5  # Rate per minute (waiting time)
        self.minimum_fare = 30.0  # Minimum fare
        self.maximum_fare = 500.0  # Maximum fare (for long trips)
        
        # Time-based pricing
        self.night_rate_multiplier = 1.3  # 30% extra for night trips (8 PM - 6 AM)
        self.peak_hour_multiplier = 1.2  # 20% extra for peak hours (7-9 AM, 5-7 PM)
        
        # Distance-based discounts
        self.long_distance_discount = 0.9  # 10% discount for trips > 20km
    
    def calculate_fare(
        self, 
        distance_meters: float, 
        time_seconds: float,
        is_night: bool = False,
        is_peak_hour: bool = False
    ) -> Dict[str, Any]:
        """
        Calculate taxi fare based on distance and time
        
        Args:
            distance_meters: Distance in meters
            time_seconds: Travel time in seconds
            is_night: Whether it's night time (8 PM - 6 AM)
            is_peak_hour: Whether it's peak hour (7-9 AM, 5-7 PM)
            
        Returns:
            Dictionary with fare breakdown
        """
        # Convert to kilometers and minutes
        distance_km = distance_meters / 1000.0
        time_minutes = time_seconds / 60.0
        
        # Calculate base fare
        distance_fare = distance_km * self.per_km_rate
        time_fare = time_minutes * self.per_minute_rate
        base_calculation = self.base_fare + distance_fare + time_fare
        
        # Apply multipliers
        multiplier = 1.0
        if is_night:
            multiplier *= self.night_rate_multiplier
        if is_peak_hour:
            multiplier *= self.peak_hour_multiplier
        
        # Apply long distance discount
        if distance_km > 20:
            base_calculation *= self.long_distance_discount
        
        # Calculate final fare
        final_fare = base_calculation * multiplier
        
        # Apply minimum and maximum limits
        final_fare = max(self.minimum_fare, final_fare)
        final_fare = min(self.maximum_fare, final_fare)
        
        # Round to nearest 5 ETB
        final_fare = round(final_fare / 5.0) * 5.0
        
        return {
            "total_fare": final_fare,
            "currency": "ETB",
            "breakdown": {
                "base_fare": self.base_fare,
                "distance_fare": distance_fare,
                "time_fare": time_fare,
                "distance_km": round(distance_km, 2),
                "time_minutes": round(time_minutes, 1)
            },
            "multipliers": {
                "night_rate": is_night,
                "peak_hour": is_peak_hour,
                "long_distance_discount": distance_km > 20
            },
            "pricing_info": {
                "base_fare": self.base_fare,
                "per_km_rate": self.per_km_rate,
                "per_minute_rate": self.per_minute_rate,
                "minimum_fare": self.minimum_fare,
                "maximum_fare": self.maximum_fare
            }
        }
    
    def estimate_fare_range(
        self, 
        distance_meters: float, 
        time_seconds: float
    ) -> Dict[str, Any]:
        """
        Estimate fare range (min/max) for a trip
        
        Args:
            distance_meters: Distance in meters
            time_seconds: Travel time in seconds
            
        Returns:
            Dictionary with fare range
        """
        # Calculate minimum fare (day time, non-peak)
        min_fare = self.calculate_fare(distance_meters, time_seconds, False, False)
        
        # Calculate maximum fare (night time, peak hour)
        max_fare = self.calculate_fare(distance_meters, time_seconds, True, True)
        
        return {
            "fare_range": {
                "minimum": min_fare["total_fare"],
                "maximum": max_fare["total_fare"],
                "currency": "ETB"
            },
            "estimated_average": (min_fare["total_fare"] + max_fare["total_fare"]) / 2,
            "distance_km": round(distance_meters / 1000.0, 2),
            "time_minutes": round(time_seconds / 60.0, 1)
        }
    
    def get_pricing_info(self) -> Dict[str, Any]:
        """Get current pricing information"""
        return {
            "base_fare": self.base_fare,
            "per_km_rate": self.per_km_rate,
            "per_minute_rate": self.per_minute_rate,
            "minimum_fare": self.minimum_fare,
            "maximum_fare": self.maximum_fare,
            "currency": "ETB",
            "multipliers": {
                "night_rate": self.night_rate_multiplier,
                "peak_hour": self.peak_hour_multiplier
            },
            "discounts": {
                "long_distance": self.long_distance_discount
            }
        } 