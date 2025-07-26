import httpx
import logging
from typing import List, Tuple, Dict, Any, Optional
from app.config import settings
from app.schemas.route_schemas import RouteResponse, ErrorResponse

logger = logging.getLogger(__name__)

class GebetaService:
    """Service for interacting with Gebeta Directions API"""
    
    def __init__(self):
        self.api_key = settings.GEBETA_API_KEY
        self.base_url = settings.GEBETA_BASE_URL
        self.timeout = 30.0  # 30 seconds timeout
    
    async def get_route(
        self, 
        origin: Tuple[float, float], 
        destination: Tuple[float, float],
        waypoints: Optional[List[Tuple[float, float]]] = None,
        include_instructions: bool = False
    ) -> RouteResponse:
        """
        Get route from Gebeta Directions API
        
        Args:
            origin: Tuple of (lat, lng) for starting point
            destination: Tuple of (lat, lng) for ending point
            waypoints: Optional list of waypoints
            include_instructions: Whether to include turn-by-turn instructions
            
        Returns:
            RouteResponse with route data
        """
        try:
            # Prepare API parameters
            params = {
                "origin": f"{origin[0]},{origin[1]}",
                "destination": f"{destination[0]},{destination[1]}",
                "apiKey": self.api_key,
                "instruction": "1" if include_instructions else "0"
            }
            
            # Add waypoints if provided
            if waypoints:
                waypoints_str = ";".join([f"{lat},{lng}" for lat, lng in waypoints])
                params["waypoints"] = waypoints_str
            
            # Make API request
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(self.base_url, params=params)
                
                if response.status_code == 200:
                    data = response.json()
                    return self._parse_success_response(data)
                else:
                    return self._parse_error_response(response.status_code, response.text)
                    
        except httpx.TimeoutException:
            logger.error("Gebeta API request timed out")
            return RouteResponse(
                success=False,
                distance=0.0,
                time=0.0,
                coordinates=[],
                message="Request timed out",
                instructions=None
            )
        except httpx.RequestError as e:
            logger.error(f"Network error calling Gebeta API: {e}")
            return RouteResponse(
                success=False,
                distance=0.0,
                time=0.0,
                coordinates=[],
                message=f"Network error: {str(e)}",
                instructions=None
            )
        except Exception as e:
            logger.error(f"Unexpected error in Gebeta service: {e}")
            return RouteResponse(
                success=False,
                distance=0.0,
                time=0.0,
                coordinates=[],
                message=f"Unexpected error: {str(e)}",
                instructions=None
            )
    
    def _parse_success_response(self, data: Dict[str, Any]) -> RouteResponse:
        """Parse successful response from Gebeta API"""
        try:
            return RouteResponse(
                success=True,
                distance=data.get("totalDistance", 0.0),
                time=data.get("timetaken", 0.0),
                coordinates=data.get("direction", []),
                message=data.get("msg", "OK"),
                instructions=data.get("instructions", None)
            )
        except Exception as e:
            logger.error(f"Error parsing Gebeta API response: {e}")
            return RouteResponse(
                success=False,
                distance=0.0,
                time=0.0,
                coordinates=[],
                message=f"Error parsing response: {str(e)}",
                instructions=None
            )
    
    def _parse_error_response(self, status_code: int, error_text: str) -> RouteResponse:
        """Parse error response from Gebeta API"""
        error_messages = {
            401: "Authentication failed - check API key",
            404: "No route found between specified locations",
            422: "Invalid input parameters",
            429: "Rate limit exceeded",
            500: "Gebeta API server error"
        }
        
        error_msg = error_messages.get(status_code, f"API error (status {status_code})")
        logger.error(f"Gebeta API error {status_code}: {error_text}")
        
        return RouteResponse(
            success=False,
            distance=0.0,
            time=0.0,
            coordinates=[],
            message=error_msg,
            instructions=None
        )
    
    def validate_coordinates(self, lat: float, lng: float) -> bool:
        """Validate coordinate values"""
        return (
            isinstance(lat, (int, float)) and 
            isinstance(lng, (int, float)) and
            -90 <= lat <= 90 and 
            -180 <= lng <= 180
        )
    
    async def health_check(self) -> bool:
        """Check if Gebeta API is accessible"""
        try:
            # Simple health check with dummy coordinates
            test_origin = (8.989022, 38.79036)  # Mexico coordinates
            test_destination = (9.03045, 38.76530)  # Ayertena coordinates
            
            result = await self.get_route(test_origin, test_destination)
            return result.success
        except Exception as e:
            logger.error(f"Health check failed: {e}")
            return False 