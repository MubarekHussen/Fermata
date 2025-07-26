# Fermata Taxi API

A FastAPI-based taxi routing service that integrates with Gebeta Directions API and PostgreSQL for data persistence.

## 🚀 Features

- **Route Calculation**: Get optimal routes between any two points in Ethiopia
- **Popular Routes**: Predefined popular taxi routes with database storage
- **Real-time Directions**: Integration with Gebeta Directions API
- **Location Management**: Store and retrieve location data
- **Taxi Management**: Track taxi and driver information
- **Trip Tracking**: Store trip history and metrics
- **Health Monitoring**: API health check endpoint
- **CORS Support**: Ready for frontend integration
- **Database Migrations**: Alembic for schema management

## 📋 Requirements

- Python 3.8+
- PostgreSQL 12+
- Gebeta API Key
- FastAPI & Uvicorn

## 🛠️ Installation

1. **Clone the repository**
```bash
cd Backend
```

2. **Install dependencies**
```bash
pip install -r requirements.txt
```

3. **Set up PostgreSQL**
```bash
# Install PostgreSQL (Ubuntu/Debian)
sudo apt update
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql
CREATE DATABASE fermata_taxi;
CREATE USER fermata_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE fermata_taxi TO fermata_user;
\q
```

4. **Set up environment variables**
Create a `.env` file in the Backend directory:
```env
# Gebeta API Configuration
GEBETA_API_KEY=your-actual-api-key-here

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=fermata_taxi
DB_USER=fermata_user
DB_PASSWORD=your_password

# Server Configuration
DEBUG=true
APP_NAME=Fermata Taxi API
APP_VERSION=1.0.0

# CORS Configuration (for production, specify your frontend URL)
ALLOWED_ORIGINS=["http://localhost:3000", "http://localhost:5173"]
```

5. **Run database migrations**
```bash
# Initialize Alembic (first time only)
alembic init alembic

# Create initial migration
alembic revision --autogenerate -m "Initial migration"

# Apply migrations
alembic upgrade head
```

6. **Run the server**
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## 📊 Database Schema

### Tables Overview

#### **routes**
- `id` (UUID, Primary Key)
- `name` (String, Indexed)
- `description` (Text)
- `origin_lat`, `origin_lng`, `origin_name` (Coordinates & Name)
- `destination_lat`, `destination_lng`, `destination_name` (Coordinates & Name)
- `estimated_time` (Integer, minutes)
- `estimated_distance` (Float, kilometers)
- `is_popular` (Boolean, Indexed)
- `created_at`, `updated_at` (Timestamps)

#### **route_calculations**
- `id` (UUID, Primary Key)
- `route_id` (UUID, Foreign Key to routes)
- `distance` (Float, meters)
- `time` (Float, seconds)
- `coordinates` (Text, JSON string)
- `instructions` (Text, JSON string)
- `gebeta_response` (Text, Full API response)
- `success` (Boolean)
- `error_message` (Text)
- `calculated_at` (Timestamp)

#### **locations**
- `id` (UUID, Primary Key)
- `name` (String, Indexed)
- `description` (Text)
- `lat`, `lng` (Coordinates)
- `location_type` (Enum: origin, destination, waypoint, taxi_stand, landmark)
- `is_active` (Boolean, Indexed)
- `is_popular` (Boolean, Indexed)
- `address`, `city`, `district` (Address info)
- `created_at`, `updated_at` (Timestamps)

#### **location_history**
- `id` (UUID, Primary Key)
- `location_id` (UUID, Indexed)
- `search_count` (Integer)
- `last_searched` (Timestamp)
- `created_at`, `updated_at` (Timestamps)

#### **taxis**
- `id` (UUID, Primary Key)
- `plate_number` (String, Unique, Indexed)
- `model`, `color`, `year` (Vehicle info)
- `current_lat`, `current_lng` (Current location)
- `last_location_update` (Timestamp)
- `status` (Enum: available, busy, offline, maintenance)
- `is_active` (Boolean, Indexed)
- `driver_id`, `driver_name`, `driver_phone` (Driver info)
- `driver_status` (Enum: active, inactive, suspended)
- `rating` (Float)
- `total_trips` (Integer)
- `created_at`, `updated_at` (Timestamps)

#### **trips**
- `id` (UUID, Primary Key)
- `taxi_id` (UUID, Foreign Key to taxis)
- `origin_lat`, `origin_lng`, `origin_name` (Trip origin)
- `destination_lat`, `destination_lng`, `destination_name` (Trip destination)
- `status` (String: pending, active, completed, cancelled)
- `distance` (Float, meters)
- `duration` (Float, seconds)
- `fare` (Float, ETB)
- `started_at`, `completed_at` (Trip timestamps)
- `created_at`, `updated_at` (Timestamps)

## 📚 API Endpoints

### Health Check
- `GET /api/health` - Check API health status

### Popular Routes
- `GET /api/routes/popular` - Get all predefined popular routes
- `GET /api/routes/{route_id}` - Get specific route by ID
- `GET /api/route/quick/{route_id}` - Calculate route for predefined route

### Route Calculation
- `POST /api/route/directions` - Calculate route with JSON body
- `GET /api/route/directions` - Calculate route with query parameters

### Locations
- `GET /api/locations` - Get all available locations
- `POST /api/locations` - Create new location
- `GET /api/locations/{location_id}` - Get specific location

### Taxis
- `GET /api/taxis` - Get all taxis
- `GET /api/taxis/available` - Get available taxis
- `POST /api/taxis` - Create new taxi
- `GET /api/taxis/{taxi_id}` - Get specific taxi
- `PUT /api/taxis/{taxi_id}/location` - Update taxi location

### Trips
- `GET /api/trips` - Get all trips
- `POST /api/trips` - Create new trip
- `GET /api/trips/{trip_id}` - Get specific trip
- `PUT /api/trips/{trip_id}/status` - Update trip status

## 🔧 API Usage Examples

### Get Popular Routes
```bash
curl http://localhost:8000/api/routes/popular
```

### Calculate Route (GET)
```bash
curl "http://localhost:8000/api/route/directions?origin_lat=8.989022&origin_lng=38.79036&dest_lat=9.03045&dest_lng=38.76530"
```

### Calculate Route (POST)
```bash
curl -X POST http://localhost:8000/api/route/directions \
  -H "Content-Type: application/json" \
  -d '{
    "origin": [8.989022, 38.79036],
    "destination": [9.03045, 38.76530],
    "include_instructions": true
  }'
```

### Get Available Taxis
```bash
curl http://localhost:8000/api/taxis/available
```

### Create New Trip
```bash
curl -X POST http://localhost:8000/api/trips \
  -H "Content-Type: application/json" \
  -d '{
    "taxi_id": "taxi-uuid-here",
    "origin": {"lat": 8.989022, "lng": 38.79036, "name": "Mexico"},
    "destination": {"lat": 9.03045, "lng": 38.76530, "name": "Ayertena"}
  }'
```

## 📊 Response Format

### Route Response
```json
{
  "success": true,
  "distance": 8500.0,
  "time": 900.0,
  "coordinates": [[lat, lng], [lat, lng], ...],
  "message": "OK",
  "instructions": ["Turn left", "Turn right", ...]
}
```

### Popular Route
```json
{
  "id": "mexico_to_ayertena",
  "name": "Mexico → Ayertena",
  "description": "Popular route from Mexico area to Ayertena",
  "origin": {"lat": 8.989022, "lng": 38.79036, "name": "Mexico"},
  "destination": {"lat": 9.03045, "lng": 38.76530, "name": "Ayertena"},
  "estimated_time": 15,
  "estimated_distance": 8.5
}
```

### Taxi Response
```json
{
  "id": "taxi-uuid",
  "plate_number": "AA-12345",
  "model": "Toyota Corolla",
  "color": "White",
  "current_location": {"lat": 8.989022, "lng": 38.79036},
  "status": "available",
  "driver": {
    "name": "Abebe Kebede",
    "phone": "+251911234567",
    "status": "active"
  },
  "rating": 4.5,
  "total_trips": 150
}
```

## 🗺️ Predefined Routes

1. **Mexico → Ayertena** (8.5 km, ~15 min)
2. **Megenagna → Torhailoch** (6.2 km, ~12 min)
3. **Bole → Kazanchis** (9.8 km, ~18 min)
4. **AAU → Merkato** (11.5 km, ~20 min)
5. **Kirkos → Arada** (7.3 km, ~14 min)

## 🔍 API Documentation

Once the server is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🚨 Error Handling

The API returns appropriate HTTP status codes:
- `200` - Success
- `400` - Bad request (invalid coordinates, API errors)
- `404` - Route not found
- `422` - Validation error
- `500` - Internal server error

## 🔧 Development

### Database Migrations
```bash
# Create new migration
alembic revision --autogenerate -m "Description of changes"

# Apply migrations
alembic upgrade head

# Rollback migration
alembic downgrade -1

# Check current migration
alembic current
```

### Project Structure
```
Backend/
├── alembic/                    # Database migrations
│   ├── versions/              # Migration files
│   ├── env.py                 # Migration environment
│   └── script.py.mako         # Migration template
├── app/
│   ├── main.py                # FastAPI application
│   ├── config.py              # Configuration settings
│   ├── db.py                  # Database configuration
│   ├── routes/
│   │   └── routes.py          # API endpoints
│   ├── schemas/
│   │   └── route_schemas.py   # Pydantic models
│   ├── services/
│   │   └── gebeta_service.py  # Gebeta API integration
│   ├── models/                # Database models
│   │   ├── route_model.py     # Route & RouteCalculation
│   │   ├── location_model.py  # Location & LocationHistory
│   │   └── taxi_model.py      # Taxi & Trip
│   └── utils/
│       └── popular_routes.py  # Static route data
├── requirements.txt            # Python dependencies
├── alembic.ini               # Alembic configuration
└── README.md                 # This file
```

### Environment Variables
- `GEBETA_API_KEY` - Your Gebeta API key
- `DB_HOST` - PostgreSQL host
- `DB_PORT` - PostgreSQL port
- `DB_NAME` - Database name
- `DB_USER` - Database user
- `DB_PASSWORD` - Database password
- `DEBUG` - Enable debug mode
- `ALLOWED_ORIGINS` - CORS allowed origins

## 🚕 Integration with Frontend

This API is designed to work with React frontend applications. Key features:
- CORS enabled for frontend communication
- JSON responses for easy frontend parsing
- Error handling with meaningful messages
- Health check for monitoring
- Real-time taxi tracking capabilities

## 📝 License

This project is part of the Fermata hackathon project.
