"""
Location service for resolving place names to coordinates
"""
import logging
from typing import List, Tuple, Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from difflib import get_close_matches
import re

from app.models.location_model import Location
from app.utils.popular_routes import get_all_locations
from app.schemas.route_schemas import LocationResponse

logger = logging.getLogger(__name__)

class LocationService:
    """Service for resolving place names to coordinates"""
    
    def __init__(self):
        # Common Ethiopian place names and their coordinates
        self.common_locations = {
            "mexico": {"lat": 8.989022, "lng": 38.79036, "name": "Mexico"},
            "ayertena": {"lat": 9.03045, "lng": 38.76530, "name": "Ayertena"},
            "bole": {"lat": 8.9806, "lng": 38.7578, "name": "Bole"},
            "bole airport": {"lat": 8.9806, "lng": 38.7578, "name": "Bole Airport"},
            "kazanchis": {"lat": 9.0123, "lng": 38.7567, "name": "Kazanchis"},
            "megenagna": {"lat": 9.0123, "lng": 38.7567, "name": "Megenagna"},
            "torhailoch": {"lat": 9.0456, "lng": 38.7890, "name": "Torhailoch"},
            "merkato": {"lat": 9.0123, "lng": 38.7567, "name": "Merkato"},
            "addis ababa university": {"lat": 9.0456, "lng": 38.7890, "name": "Addis Ababa University"},
            "aau": {"lat": 9.0456, "lng": 38.7890, "name": "Addis Ababa University"},
            "kirkos": {"lat": 9.03045, "lng": 38.76530, "name": "Kirkos"},
            "arada": {"lat": 9.0123, "lng": 38.7567, "name": "Arada"},
            "piazza": {"lat": 9.0123, "lng": 38.7567, "name": "Piazza"},
            "entoto": {"lat": 9.0123, "lng": 38.7567, "name": "Entoto"},
            "saris": {"lat": 9.0123, "lng": 38.7567, "name": "Saris"},
            "summit": {"lat": 9.0123, "lng": 38.7567, "name": "Summit"},
            "kolfe": {"lat": 9.0123, "lng": 38.7567, "name": "Kolfe"},
            "gerji": {"lat": 9.0123, "lng": 38.7567, "name": "Gerji"},
            "cmes": {"lat": 9.0123, "lng": 38.7567, "name": "CMES"},
            "edna mall": {"lat": 8.9806, "lng": 38.7578, "name": "Edna Mall"},
            "unity university": {"lat": 9.0123, "lng": 38.7567, "name": "Unity University"},
            "ethiopian airlines": {"lat": 8.9806, "lng": 38.7578, "name": "Ethiopian Airlines"},
            "addis ababa": {"lat": 9.0123, "lng": 38.7567, "name": "Addis Ababa"},
            "addis": {"lat": 9.0123, "lng": 38.7567, "name": "Addis Ababa"}
        }
    
    async def resolve_place_name(
        self, 
        place_name: str, 
        db: AsyncSession
    ) -> Optional[LocationResponse]:
        """
        Resolve a place name to coordinates
        
        Args:
            place_name: The place name to resolve
            db: Database session
            
        Returns:
            LocationResponse with coordinates, or None if not found
        """
        try:
            # Normalize the place name
            normalized_name = self._normalize_place_name(place_name)
            
            # 1. First try exact match in common locations
            if normalized_name in self.common_locations:
                loc = self.common_locations[normalized_name]
                return LocationResponse(
                    name=loc["name"],
                    lat=loc["lat"],
                    lng=loc["lng"]
                )
            
            # 2. Try database lookup
            db_location = await self._find_in_database(normalized_name, db)
            if db_location:
                return LocationResponse(
                    name=db_location.name,
                    lat=db_location.lat,
                    lng=db_location.lng
                )
            
            # 3. Try fuzzy matching with common locations
            fuzzy_match = self._fuzzy_match_location(normalized_name)
            if fuzzy_match:
                loc = self.common_locations[fuzzy_match]
                return LocationResponse(
                    name=loc["name"],
                    lat=loc["lat"],
                    lng=loc["lng"]
                )
            
            # 4. Try fuzzy matching with database locations
            db_fuzzy_match = await self._fuzzy_match_database(normalized_name, db)
            if db_fuzzy_match:
                return LocationResponse(
                    name=db_fuzzy_match.name,
                    lat=db_fuzzy_match.lat,
                    lng=db_fuzzy_match.lng
                )
            
            logger.warning(f"Could not resolve place name: {place_name}")
            return None
            
        except Exception as e:
            logger.error(f"Error resolving place name '{place_name}': {e}")
            return None
    
    async def search_locations(
        self, 
        query: str, 
        db: AsyncSession,
        limit: int = 10
    ) -> List[LocationResponse]:
        """
        Search for locations by name
        
        Args:
            query: Search query
            db: Database session
            limit: Maximum number of results
            
        Returns:
            List of matching locations
        """
        try:
            normalized_query = self._normalize_place_name(query)
            results = []
            
            # 1. Search in common locations
            for key, location in self.common_locations.items():
                if normalized_query in key or normalized_query in location["name"].lower():
                    results.append(LocationResponse(
                        name=location["name"],
                        lat=location["lat"],
                        lng=location["lng"]
                    ))
            
            # 2. Search in database
            db_results = await self._search_database(normalized_query, db, limit)
            results.extend(db_results)
            
            # Remove duplicates and limit results
            unique_results = []
            seen_names = set()
            for result in results:
                if result.name not in seen_names and len(unique_results) < limit:
                    unique_results.append(result)
                    seen_names.add(result.name)
            
            return unique_results
            
        except Exception as e:
            logger.error(f"Error searching locations for '{query}': {e}")
            return []
    
    def _normalize_place_name(self, place_name: str) -> str:
        """Normalize place name for comparison"""
        # Convert to lowercase and remove extra spaces
        normalized = re.sub(r'\s+', ' ', place_name.lower().strip())
        # Remove special characters except spaces
        normalized = re.sub(r'[^\w\s]', '', normalized)
        return normalized
    
    async def _find_in_database(
        self, 
        normalized_name: str, 
        db: AsyncSession
    ) -> Optional[Location]:
        """Find location in database by exact name match"""
        try:
            result = await db.execute(
                select(Location).where(
                    or_(
                        Location.name.ilike(f"%{normalized_name}%"),
                        Location.name.ilike(f"%{normalized_name.replace(' ', '%')}%")
                    ),
                    Location.is_active == True
                )
            )
            return result.scalar_one_or_none()
        except Exception as e:
            logger.error(f"Database lookup error: {e}")
            return None
    
    def _fuzzy_match_location(self, normalized_name: str) -> Optional[str]:
        """Find fuzzy match in common locations"""
        try:
            # Get close matches
            matches = get_close_matches(
                normalized_name, 
                self.common_locations.keys(), 
                n=1, 
                cutoff=0.6
            )
            return matches[0] if matches else None
        except Exception as e:
            logger.error(f"Fuzzy matching error: {e}")
            return None
    
    async def _fuzzy_match_database(
        self, 
        normalized_name: str, 
        db: AsyncSession
    ) -> Optional[Location]:
        """Find fuzzy match in database locations"""
        try:
            # Get all active locations
            result = await db.execute(
                select(Location).where(Location.is_active == True)
            )
            locations = result.scalars().all()
            
            # Create list of location names for fuzzy matching
            location_names = [loc.name.lower() for loc in locations]
            
            # Find close matches
            matches = get_close_matches(
                normalized_name, 
                location_names, 
                n=1, 
                cutoff=0.6
            )
            
            if matches:
                # Find the corresponding location object
                for loc in locations:
                    if loc.name.lower() == matches[0]:
                        return loc
            
            return None
            
        except Exception as e:
            logger.error(f"Database fuzzy matching error: {e}")
            return None
    
    async def _search_database(
        self, 
        query: str, 
        db: AsyncSession, 
        limit: int
    ) -> List[LocationResponse]:
        """Search locations in database"""
        try:
            result = await db.execute(
                select(Location).where(
                    or_(
                        Location.name.ilike(f"%{query}%"),
                        Location.description.ilike(f"%{query}%")
                    ),
                    Location.is_active == True
                ).limit(limit)
            )
            locations = result.scalars().all()
            
            return [
                LocationResponse(
                    name=loc.name,
                    lat=loc.lat,
                    lng=loc.lng
                )
                for loc in locations
            ]
            
        except Exception as e:
            logger.error(f"Database search error: {e}")
            return [] 