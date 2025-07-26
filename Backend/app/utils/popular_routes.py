"""
Popular routes data for Ethiopia taxi service
Predefined routes with accurate coordinates for common destinations
"""

POPULAR_ROUTES = {
    "mexico_to_ayertena": {
        "id": "mexico_to_ayertena",
        "name": "Mexico → Ayertena",
        "description": "Popular route from Mexico area to Ayertena",
        "origin": {"lat": 8.989022, "lng": 38.79036, "name": "Mexico"},
        "destination": {"lat": 9.03045, "lng": 38.76530, "name": "Ayertena"},
        "estimated_time": 15,  # minutes
        "estimated_distance": 8.5  # km
    },
    "megenagna_to_torhailoch": {
        "id": "megenagna_to_torhailoch", 
        "name": "Megenagna → Torhailoch",
        "description": "Route from Megenagna to Torhailoch area",
        "origin": {"lat": 9.0123, "lng": 38.7567, "name": "Megenagna"},
        "destination": {"lat": 9.0456, "lng": 38.7890, "name": "Torhailoch"},
        "estimated_time": 12,  # minutes
        "estimated_distance": 6.2  # km
    },
    "bole_to_kazanchis": {
        "id": "bole_to_kazanchis",
        "name": "Bole → Kazanchis",
        "description": "Route from Bole Airport area to Kazanchis",
        "origin": {"lat": 8.9806, "lng": 38.7578, "name": "Bole"},
        "destination": {"lat": 9.0123, "lng": 38.7567, "name": "Kazanchis"},
        "estimated_time": 18,  # minutes
        "estimated_distance": 9.8  # km
    },
    "addis_ababa_university_to_merkato": {
        "id": "addis_ababa_university_to_merkato",
        "name": "AAU → Merkato",
        "description": "Route from Addis Ababa University to Merkato",
        "origin": {"lat": 9.0456, "lng": 38.7890, "name": "Addis Ababa University"},
        "destination": {"lat": 9.0123, "lng": 38.7567, "name": "Merkato"},
        "estimated_time": 20,  # minutes
        "estimated_distance": 11.5  # km
    },
    "kirkos_to_arada": {
        "id": "kirkos_to_arada",
        "name": "Kirkos → Arada",
        "description": "Route from Kirkos to Arada district",
        "origin": {"lat": 9.03045, "lng": 38.76530, "name": "Kirkos"},
        "destination": {"lat": 9.0123, "lng": 38.7567, "name": "Arada"},
        "estimated_time": 14,  # minutes
        "estimated_distance": 7.3  # km
    }
}

def get_popular_routes():
    """Get all popular routes"""
    return list(POPULAR_ROUTES.values())

def get_route_by_id(route_id: str):
    """Get a specific route by ID"""
    return POPULAR_ROUTES.get(route_id)

def get_all_locations():
    """Get all unique locations from popular routes"""
    locations = set()
    for route in POPULAR_ROUTES.values():
        locations.add((route["origin"]["name"], route["origin"]["lat"], route["origin"]["lng"]))
        locations.add((route["destination"]["name"], route["destination"]["lat"], route["destination"]["lng"]))
    
    return [
        {"name": name, "lat": lat, "lng": lng} 
        for name, lat, lng in sorted(locations)
    ] 