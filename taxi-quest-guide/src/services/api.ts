// API service for communicating with the FastAPI backend

const API_BASE_URL = 'http://localhost:8000';

export interface RoutePlanRequest {
  origin: string;
  destination: string;
  waypoints?: string[];
  include_instructions?: boolean;
}

export interface RouteCoordinates {
  lat: number;
  lng: number;
}

export interface RouteInfo {
  distance: number;
  time: number;
  coordinates: RouteCoordinates[];
  message: string;
  instructions: string | null;
}

export interface FareBreakdown {
  base_fare: number;
  distance_fare: number;
  time_fare: number;
  distance_km: number;
  time_minutes: number;
}

export interface PricingInfo {
  base_fare: number;
  per_km_rate: number;
  per_minute_rate: number;
  minimum_fare: number;
  maximum_fare: number;
}

export interface FareInfo {
  total_fare: number;
  currency: string;
  breakdown: FareBreakdown;
  multipliers: {
    night_rate: boolean;
    peak_hour: boolean;
    long_distance_discount: boolean;
  };
  pricing_info: PricingInfo;
}

export interface LocationInfo {
  name: string;
  lat: number;
  lng: number;
}

export interface RoutePlanResponse {
  route: RouteInfo;
  fare: FareInfo;
  nearby_taxis: any[];
  origin: LocationInfo;
  destination: LocationInfo;
}

export interface SearchResult {
  route: string;
  pickup: string;
  landmark: string;
  walkingTime: string;
  coordinates: RouteCoordinates;
  price: number;
  fare?: FareInfo;
  origin?: LocationInfo;
  destination?: LocationInfo;
}

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async planRoute(request: RoutePlanRequest): Promise<RoutePlanResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/route/plan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error planning route:', error);
      throw error;
    }
  }

  async searchLocations(query: string): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/locations/search?q=${encodeURIComponent(query)}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error searching locations:', error);
      throw error;
    }
  }

  async getPopularRoutes(): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/routes/popular`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching popular routes:', error);
      throw error;
    }
  }

  // Convert API response to SearchResult format for compatibility
  convertToSearchResult(apiResponse: RoutePlanResponse): SearchResult {
    const { route, fare, origin, destination } = apiResponse;
    
    return {
      route: `${origin?.name || 'Unknown'} to ${destination?.name || 'Unknown'}`,
      pickup: origin?.name || 'Unknown',
      landmark: destination?.name || 'Unknown',
      walkingTime: `${Math.round(route.time / 60)} min`,
      coordinates: {
        lat: origin?.lat || 0,
        lng: origin?.lng || 0,
      },
      price: fare.total_fare,
      fare: fare,
      origin: origin,
      destination: destination,
    };
  }
}

export const apiService = new ApiService();
export default apiService; 