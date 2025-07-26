const API_BASE_URL = 'http://localhost:8000/api';

export interface RoutePlanRequest {
  origin: string;
  destination: string;
  waypoints?: string[];
  include_instructions?: boolean;
}

export interface RoutePlanResponse {
  route: {
    distance: number;
    time: number;
    coordinates: [number, number][];
    message: string;
    instructions: string[] | null;
  };
  fare: {
    total_fare: number;
    currency: string;
    breakdown: {
      base_fare: number;
      distance_fare: number;
      time_fare: number;
      distance_km: number;
      time_minutes: number;
    };
    multipliers: {
      night_rate: boolean;
      peak_hour: boolean;
      long_distance_discount: boolean;
    };
    pricing_info: {
      base_fare: number;
      per_km_rate: number;
      per_minute_rate: number;
      minimum_fare: number;
      maximum_fare: number;
    };
  };
  nearby_taxis: any[];
  origin: {
    name: string;
    lat: number;
    lng: number;
  };
  destination: {
    name: string;
    lat: number;
    lng: number;
  };
}

export interface LocationSearchResponse {
  name: string;
  lat: number;
  lng: number;
}

class ApiService {
  private async makeRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // Plan route with place names
  async planRoute(request: RoutePlanRequest): Promise<RoutePlanResponse> {
    return this.makeRequest<RoutePlanResponse>('/route/plan', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Search locations by name
  async searchLocations(query: string, limit: number = 10): Promise<LocationSearchResponse[]> {
    return this.makeRequest<LocationSearchResponse[]>(`/locations/search?query=${encodeURIComponent(query)}&limit=${limit}`);
  }

  // Resolve single location
  async resolveLocation(placeName: string): Promise<LocationSearchResponse> {
    return this.makeRequest<LocationSearchResponse>(`/locations/resolve/${encodeURIComponent(placeName)}`);
  }

  // Get popular routes
  async getPopularRoutes(): Promise<any[]> {
    return this.makeRequest<any[]>('/routes/popular');
  }

  // Calculate route by names
  async calculateRoute(request: RoutePlanRequest): Promise<RoutePlanResponse> {
    return this.makeRequest<RoutePlanResponse>('/route/calculate', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }
}

export const apiService = new ApiService(); 