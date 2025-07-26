# Frontend-Backend API Integration

This document explains how the React frontend integrates with the FastAPI backend for the Fermata Taxi application.

## Overview

The frontend now supports both real API calls to the FastAPI backend and fallback to mock data when the API is unavailable.

## API Endpoints Used

### 1. Route Planning
- **Endpoint**: `POST /api/route/plan`
- **Purpose**: Get route information, pricing, and nearby taxis
- **Request Body**:
  ```json
  {
    "origin": "bole",
    "destination": "ayertena",
    "waypoints": [],
    "include_instructions": false
  }
  ```
- **Response**: Complete route data including distance, time, coordinates, fare breakdown, and location information

### 2. Location Search
- **Endpoint**: `GET /api/locations/search?q={query}`
- **Purpose**: Search for available locations by name
- **Response**: Array of matching locations

### 3. Popular Routes
- **Endpoint**: `GET /api/routes/popular`
- **Purpose**: Get popular routes
- **Response**: Array of popular route data

## Frontend Integration

### API Service (`src/services/api.ts`)

The `ApiService` class handles all communication with the backend:

```typescript
// Plan a route
const response = await apiService.planRoute({
  origin: "bole",
  destination: "ayertena",
  include_instructions: false
});

// Convert API response to frontend format
const searchResult = apiService.convertToSearchResult(response);
```

### Search Section Component

The `SearchSection` component now includes:

1. **API Toggle**: Checkbox to switch between real API and mock data
2. **Error Handling**: Displays API errors with fallback to mock data
3. **Enhanced Results**: Shows detailed fare breakdown from API response
4. **Real-time Pricing**: Displays actual calculated fares from the backend

### Voice Integration

The voice processing in `Index.tsx` now:

1. **Calls Real API**: Attempts to get route information via API
2. **Fallback Support**: Uses mock data if API fails
3. **Enhanced Responses**: Provides real pricing information in voice responses

## Features

### ✅ Working Features

1. **Real Route Planning**: Uses FastAPI `/api/route/plan` endpoint
2. **Accurate Pricing**: Real fare calculations from backend
3. **Location Resolution**: Converts place names to coordinates
4. **Error Handling**: Graceful fallback to mock data
5. **Voice Integration**: Voice commands work with real API
6. **Detailed Results**: Shows distance, time, and fare breakdown

### 🔧 Configuration

- **API Base URL**: `http://localhost:8000` (configurable in `api.ts`)
- **CORS**: Backend configured to allow frontend requests
- **Error Handling**: Automatic fallback to mock data on API failure

## Usage Examples

### Basic Route Search
```typescript
// User enters: "bole" to "ayertena"
// Frontend calls: POST /api/route/plan
// Response includes: route details, fare calculation, coordinates
```

### Voice Commands
```typescript
// User says: "ከቦሌ ወደ አየርቴና" (from Bole to Ayertena)
// Frontend: Extracts locations and calls API
// Response: Real pricing and route information
```

### Error Handling
```typescript
// If API is down:
// 1. Shows error message
// 2. Falls back to mock data
// 3. Continues to work with sample data
```

## Development

### Running Both Services

1. **Backend** (Terminal 1):
   ```bash
   cd Backend
   uvicorn app.main:app --reload
   ```

2. **Frontend** (Terminal 2):
   ```bash
   cd taxi-quest-guide
   npm run dev
   ```

### Testing API Integration

1. **Enable API**: Check "Use Real API" checkbox in frontend
2. **Test Routes**: Try "Bole to Ayertena" or "Lafto to Mexico"
3. **Verify Data**: Check that real pricing and coordinates are displayed
4. **Test Voice**: Use voice input to test API integration

### Debugging

- **API Errors**: Check browser console for fetch errors
- **CORS Issues**: Ensure backend CORS is properly configured
- **Data Format**: Verify API response matches expected format

## Supported Locations

The frontend supports these locations (both Amharic and English):

- **Bole** (ቦሌ)
- **Lafto** (ላፍቶ)
- **Mexico** (ሜክሲኮ)
- **Piassa** (ፒያሳ)
- **Merkato** (መርካቶ)
- **Ayertena** (አየርቴና)
- **Ledata** (ለደታ)
- **Arat Kilo** (አራት ኪሎ)
- **Sidist Kilo** (ሰድስት ኪሎ)
- **Kazanchis** (ካዛንቺስ)
- **Gashen** (ጋሸን)

## Future Enhancements

1. **Real-time Taxi Tracking**: Integrate with taxi location API
2. **Booking System**: Add ride booking functionality
3. **Payment Integration**: Connect with payment gateways
4. **User Authentication**: Add user accounts and ride history
5. **Push Notifications**: Real-time updates for ride status 