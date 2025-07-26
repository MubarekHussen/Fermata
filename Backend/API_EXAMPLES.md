# Fermata Taxi API - User-Friendly Endpoints

## Overview
The Fermata Taxi API now supports user-friendly place name inputs instead of requiring coordinates. Users can simply enter place names like "Mexico", "Ayertena", "Bole Airport" and the system will automatically resolve them to coordinates.

## New User-Friendly Endpoints

### 1. Calculate Route by Place Names
**Endpoint:** `POST /api/route/calculate`

**Request:**
```json
{
  "origin": "Mexico",
  "destination": "Ayertena",
  "include_instructions": true
}
```

**Response:**
```json
{
  "success": true,
  "distance": 8500.0,
  "time": 900.0,
  "coordinates": [[8.989022, 38.79036], [9.03045, 38.76530]],
  "message": "OK",
  "instructions": ["Turn left at Mexico Square", "Continue straight for 2km"],
  "origin_location": {
    "name": "Mexico",
    "lat": 8.989022,
    "lng": 38.79036
  },
  "destination_location": {
    "name": "Ayertena",
    "lat": 9.03045,
    "lng": 38.76530
  }
}
```

### 2. Complete Route Planning
**Endpoint:** `POST /api/route/plan`

**Request:**
```json
{
  "origin": "Bole Airport",
  "destination": "Merkato",
  "include_instructions": false
}
```

**Response:**
```json
{
  "route": {
    "distance": 9800.0,
    "time": 1080.0,
    "coordinates": [[8.9806, 38.7578], [9.0123, 38.7567]],
    "message": "OK",
    "instructions": null
  },
  "fare": {
    "total_fare": 145.0,
    "currency": "ETB",
    "breakdown": {
      "base_fare": 25.0,
      "distance_fare": 117.6,
      "time_fare": 9.0,
      "distance_km": 9.8,
      "time_minutes": 18.0
    }
  },
  "nearby_taxis": [
    {
      "id": "taxi_123",
      "current_lat": 8.9808,
      "current_lng": 38.7580,
      "status": "available"
    }
  ],
  "origin": {
    "name": "Bole Airport",
    "lat": 8.9806,
    "lng": 38.7578
  },
  "destination": {
    "name": "Merkato",
    "lat": 9.0123,
    "lng": 38.7567
  }
}
```

### 3. Search Locations
**Endpoint:** `GET /api/locations/search?query=mexico&limit=5`

**Response:**
```json
{
  "success": true,
  "locations": [
    {
      "name": "Mexico",
      "lat": 8.989022,
      "lng": 38.79036
    }
  ],
  "message": "Found 1 locations matching 'mexico'"
}
```

### 4. Resolve Place Name to Coordinates
**Endpoint:** `GET /api/locations/resolve/ayertena`

**Response:**
```json
{
  "name": "Ayertena",
  "lat": 9.03045,
  "lng": 38.76530
}
```

## Supported Place Names

The system recognizes these common Ethiopian locations:

- **Mexico** - Mexico area
- **Ayertena** - Ayertena area
- **Bole** / **Bole Airport** - Bole Airport area
- **Kazanchis** - Kazanchis area
- **Megenagna** - Megenagna area
- **Torhailoch** - Torhailoch area
- **Merkato** - Merkato area
- **Addis Ababa University** / **AAU** - University area
- **Kirkos** - Kirkos area
- **Arada** - Arada area
- **Piazza** - Piazza area
- **Entoto** - Entoto area
- **Saris** - Saris area
- **Summit** - Summit area
- **Kolfe** - Kolfe area
- **Gerji** - Gerji area
- **CMES** - CMES area
- **Edna Mall** - Edna Mall
- **Unity University** - Unity University
- **Ethiopian Airlines** - Ethiopian Airlines
- **Addis Ababa** / **Addis** - General Addis Ababa area

## Features

### 1. Fuzzy Matching
The system can handle typos and partial matches:
- "mexico" → "Mexico"
- "bole air" → "Bole Airport"
- "aau" → "Addis Ababa University"

### 2. Database Integration
- Searches both predefined locations and database-stored locations
- Supports custom locations added to the database
- Handles location types (landmarks, taxi stands, etc.)

### 3. Error Handling
- Clear error messages when locations are not found
- Suggestions to search for available locations
- Graceful fallbacks

## React Frontend Integration

```javascript
// Example React component
const calculateRoute = async (origin, destination) => {
  try {
    const response = await fetch('/api/route/calculate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        origin: origin,
        destination: destination,
        include_instructions: true
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('Route calculated:', data);
      // Display route on map
      // Show pricing information
      // Display nearby taxis
    } else {
      console.error('Route calculation failed:', data.message);
    }
  } catch (error) {
    console.error('Error:', error);
  }
};

// Usage
calculateRoute('Mexico', 'Ayertena');
```

## Migration from Old API

If you were using the old coordinate-based API:

**Old (coordinates):**
```json
{
  "origin": [8.989022, 38.79036],
  "destination": [9.03045, 38.76530]
}
```

**New (place names):**
```json
{
  "origin": "Mexico",
  "destination": "Ayertena"
}
```

The new API is much more user-friendly and doesn't require users to know exact coordinates! 