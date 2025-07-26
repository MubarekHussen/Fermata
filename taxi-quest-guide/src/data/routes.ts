export interface RouteData {
  id: string;
  route: string;
  pickup: string;
  landmark: string;
  walkingTime: string;
  coordinates: { lat: number; lng: number };
  price: number; // Price in Ethiopian Birr
  isPopular?: boolean;
  discount?: number;
  description?: string;
  estimatedDuration?: string;
}

export const routeData: RouteData[] = [
  {
    id: "lafto-mexico",
    route: "Lafto → Mexico",
    pickup: "Lafto Tera Station",
    landmark: "Near Sheger Park",
    walkingTime: "2 min walk",
    coordinates: { lat: 9.0123, lng: 38.789 },
    price: 10, // 10 Birr as requested
    isPopular: true,
    description:
      "Popular route connecting Lafto residential area to Mexico Square",
    estimatedDuration: "15-20 min",
  },
  {
    id: "bole-piassa",
    route: "Bole → Piassa",
    pickup: "Bole Medhanialem",
    landmark: "Opposite ECA Building",
    walkingTime: "3 min walk",
    coordinates: { lat: 9.0125, lng: 38.7892 },
    price: 15,
    description: "Direct route from Bole airport area to central Piassa",
    estimatedDuration: "20-25 min",
  },
  {
    id: "mexico-lafto",
    route: "Mexico → Lafto",
    pickup: "Mexico Square",
    landmark: "Near Mexico Square",
    walkingTime: "1 min walk",
    coordinates: { lat: 38.758, lng: 9.032 },
    price: 10,
    description: "Return route from Mexico Square to Lafto area",
    estimatedDuration: "15-20 min",
  },
  {
    id: "piassa-bole",
    route: "Piassa → Bole",
    pickup: "Piassa Station",
    landmark: "Central Piassa Area",
    walkingTime: "2 min walk",
    coordinates: { lat: 38.7614, lng: 9.0342 },
    price: 15,
    description: "Route from central Piassa to Bole airport area",
    estimatedDuration: "20-25 min",
  },
  {
    id: "bole-merkato",
    route: "Bole → Merkato",
    pickup: "Bole Medhanialem",
    landmark: "Opposite ECA Building",
    walkingTime: "3 min walk",
    coordinates: { lat: 9.0125, lng: 38.7892 },
    price: 20,
    description: "Route to the largest open-air market in Africa",
    estimatedDuration: "25-30 min",
  },
  {
    id: "piassa-merkato",
    route: "Piassa → Merkato",
    pickup: "Piassa Station",
    landmark: "Central Piassa Area",
    walkingTime: "2 min walk",
    coordinates: { lat: 38.7614, lng: 9.0342 },
    price: 12,
    description: "Direct route from Piassa to Merkato market",
    estimatedDuration: "15-20 min",
  },
  {
    id: "merkato-piassa",
    route: "Merkato → Piassa",
    pickup: "Merkato Station",
    landmark: "Near Merkato Market",
    walkingTime: "1 min walk",
    coordinates: { lat: 38.745, lng: 9.02 },
    price: 12,
    description: "Return route from Merkato to central Piassa",
    estimatedDuration: "15-20 min",
  },
  {
    id: "lafto-piassa",
    route: "Lafto → Piassa",
    pickup: "Lafto Tera Station",
    landmark: "Near Sheger Park",
    walkingTime: "2 min walk",
    coordinates: { lat: 9.0123, lng: 38.789 },
    price: 18,
    description: "Route from Lafto to central Piassa",
    estimatedDuration: "25-30 min",
  },
  {
    id: "ledata-mexico",
    route: "Ledata → Mexico",
    pickup: "Ledata Station",
    landmark: "Near Ledata Market",
    walkingTime: "3 min walk",
    coordinates: { lat: 9.015, lng: 38.785 },
    price: 12,
    description: "Route from Ledata residential area to Mexico Square",
    estimatedDuration: "18-22 min",
  },
  {
    id: "ledata-piassa",
    route: "Ledata → Piassa",
    pickup: "Ledata Station",
    landmark: "Near Ledata Market",
    walkingTime: "3 min walk",
    coordinates: { lat: 9.015, lng: 38.785 },
    price: 16,
    description: "Route from Ledata to central Piassa",
    estimatedDuration: "22-28 min",
  },
  {
    id: "ledata-bole",
    route: "Ledata → Bole",
    pickup: "Ledata Station",
    landmark: "Near Ledata Market",
    walkingTime: "3 min walk",
    coordinates: { lat: 9.015, lng: 38.785 },
    price: 18,
    description: "Route from Ledata to Bole airport area",
    estimatedDuration: "25-30 min",
  },
  {
    id: "mexico-ledata",
    route: "Mexico → Ledata",
    pickup: "Mexico Square",
    landmark: "Near Mexico Square",
    walkingTime: "1 min walk",
    coordinates: { lat: 38.758, lng: 9.032 },
    price: 12,
    description: "Return route from Mexico Square to Ledata",
    estimatedDuration: "18-22 min",
  },
  {
    id: "bole-ledata",
    route: "Bole → Ledata",
    pickup: "Bole Medhanialem",
    landmark: "Opposite ECA Building",
    walkingTime: "3 min walk",
    coordinates: { lat: 9.0125, lng: 38.7892 },
    price: 18,
    description: "Route from Bole to Ledata residential area",
    estimatedDuration: "25-30 min",
  },
  {
    id: "piassa-ledata",
    route: "Piassa → Ledata",
    pickup: "Piassa Station",
    landmark: "Central Piassa Area",
    walkingTime: "2 min walk",
    coordinates: { lat: 38.7614, lng: 9.0342 },
    price: 16,
    description: "Route from central Piassa to Ledata",
    estimatedDuration: "22-28 min",
  },
  {
    id: "merkato-ledata",
    route: "Merkato → Ledata",
    pickup: "Merkato Station",
    landmark: "Near Merkato Market",
    walkingTime: "1 min walk",
    coordinates: { lat: 38.745, lng: 9.02 },
    price: 14,
    description: "Route from Merkato to Ledata residential area",
    estimatedDuration: "20-25 min",
  },
  {
    id: "ledata-merkato",
    route: "Ledata → Merkato",
    pickup: "Ledata Station",
    landmark: "Near Ledata Market",
    walkingTime: "3 min walk",
    coordinates: { lat: 9.015, lng: 38.785 },
    price: 14,
    description: "Route from Ledata to Merkato market",
    estimatedDuration: "20-25 min",
  },
];

// Helper functions
export const getRouteById = (id: string): RouteData | undefined => {
  return routeData.find((route) => route.id === id);
};

export const getRoutesByLocation = (location: string): RouteData[] => {
  const lowerLocation = location.toLowerCase();
  return routeData.filter(
    (route) =>
      route.route.toLowerCase().includes(lowerLocation) ||
      route.pickup.toLowerCase().includes(lowerLocation)
  );
};

export const getPopularRoutes = (): RouteData[] => {
  return routeData.filter((route) => route.isPopular);
};

export const getRoutesByPriceRange = (
  minPrice: number,
  maxPrice: number
): RouteData[] => {
  return routeData.filter(
    (route) => route.price >= minPrice && route.price <= maxPrice
  );
};

export const getAveragePrice = (): number => {
  const total = routeData.reduce((sum, route) => sum + route.price, 0);
  return Math.round(total / routeData.length);
};

export const getPriceStats = () => {
  const prices = routeData.map((route) => route.price);
  return {
    min: Math.min(...prices),
    max: Math.max(...prices),
    average: getAveragePrice(),
    total: routeData.length,
  };
};
