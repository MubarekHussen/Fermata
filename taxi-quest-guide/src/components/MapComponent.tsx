import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation, Layers, Locate, Clock } from "lucide-react";

interface MapComponentProps {
  searchResult?: {
    route: string;
    pickup: string;
    landmark: string;
    walkingTime: string;
    coordinates: { lat: number; lng: number };
    price: number; // Price in Ethiopian Birr
  };
}

const MapComponent: React.FC<MapComponentProps> = ({ searchResult }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken] = useState("pk.eyJ1IjoiZGF2ZWdlcmltIiwiYSI6ImNtZGszdnhoMjBveWYybHNibjl0cmV2aWcifQ.t3AtZSrPJ30aWBeyUupMQw");
  const [isTokenEntered, setIsTokenEntered] = useState(true);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null
  );

  // Mock data for taxi hubs in Addis Ababa
  const taxiHubs = [
    {
      name: "Lafto Tera Station",
      coordinates: [38.789, 9.0123],
      routes: ["Lafto → Mexico", "Lafto → Piassa"],
      landmark: "Near Sheger Park",
    },
    {
      name: "Bole Medhanialem",
      coordinates: [38.7892, 9.0125],
      routes: ["Bole → Piassa", "Bole → Merkato"],
      landmark: "Opposite ECA Building",
    },
    {
      name: "Mexico Square",
      coordinates: [38.758, 9.032],
      routes: ["Mexico → Lafto", "Mexico → CMC"],
      landmark: "Near Mexico Square",
    },
    {
      name: "Piassa Station",
      coordinates: [38.7614, 9.0342],
      routes: ["Piassa → Bole", "Piassa → Merkato"],
      landmark: "Central Piassa Area",
    },
  ];

  // Initialize map automatically since we have the token
  useEffect(() => {
    if (isTokenEntered && mapboxToken) {
      initializeMap();
    }
  }, [isTokenEntered, mapboxToken]);

  const initializeMap = () => {
    if (!mapContainer.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [38.7578, 9.032], // Addis Ababa center
      zoom: 12,
      pitch: 45,
      bearing: 0,
    });

    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
      }),
      "top-right"
    );

    map.current.on("load", () => {
      addTaxiHubs();
      if (searchResult) {
        highlightRoute();
      }
      getUserLocation();
    });
  };

  const addTaxiHubs = () => {
    if (!map.current) return;

    // Add source for taxi hubs
    map.current.addSource("taxi-hubs", {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: taxiHubs.map((hub) => ({
          type: "Feature",
          properties: {
            name: hub.name,
            routes: hub.routes.join(", "),
            landmark: hub.landmark,
          },
          geometry: {
            type: "Point",
            coordinates: hub.coordinates,
          },
        })),
      },
    });

    // Add taxi hub layer
    map.current.addLayer({
      id: "taxi-hubs",
      type: "circle",
      source: "taxi-hubs",
      paint: {
        "circle-radius": 12,
        "circle-color": "#00B894",
        "circle-stroke-width": 3,
        "circle-stroke-color": "#ffffff",
        "circle-opacity": 0.9,
      },
    });

    // Add taxi hub labels
    map.current.addLayer({
      id: "taxi-hub-labels",
      type: "symbol",
      source: "taxi-hubs",
      layout: {
        "text-field": ["get", "name"],
        "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
        "text-offset": [0, 2],
        "text-anchor": "top",
        "text-size": 12,
      },
      paint: {
        "text-color": "#2d3748",
        "text-halo-color": "#ffffff",
        "text-halo-width": 2,
      },
    });

    // Add popup on click
    map.current.on("click", "taxi-hubs", (e) => {
      const feature = e.features![0];
      const coordinates = (feature.geometry as any).coordinates.slice();
      const properties = feature.properties;

      new mapboxgl.Popup()
        .setLngLat(coordinates as [number, number])
        .setHTML(
          `
          <div class="p-3">
            <h3 class="font-bold text-lg text-gray-800">${properties.name}</h3>
            <p class="text-sm text-gray-600 mt-1">${properties.landmark}</p>
            <p class="text-sm font-medium text-teal-600 mt-2">Routes: ${properties.routes}</p>
          </div>
        `
        )
        .addTo(map.current!);
    });

    map.current.on("mouseenter", "taxi-hubs", () => {
      map.current!.getCanvas().style.cursor = "pointer";
    });

    map.current.on("mouseleave", "taxi-hubs", () => {
      map.current!.getCanvas().style.cursor = "";
    });
  };

  const highlightRoute = () => {
    if (!map.current || !searchResult) return;

    // Add pickup point marker
    const pickupMarker = new mapboxgl.Marker({
      color: "#00B894",
      scale: 1.2,
    })
      .setLngLat([searchResult.coordinates.lng, searchResult.coordinates.lat])
      .setPopup(
        new mapboxgl.Popup().setHTML(`
          <div class="p-3">
            <h3 class="font-bold text-lg text-gray-800">${searchResult.pickup}</h3>
            <p class="text-sm text-gray-600">${searchResult.landmark}</p>
            <p class="text-sm font-medium text-teal-600">${searchResult.route}</p>
            <p class="text-sm font-bold text-green-600 mt-2">${searchResult.price} Birr</p>
          </div>
        `)
      )
      .addTo(map.current);

    // Fly to the pickup point
    map.current.flyTo({
      center: [searchResult.coordinates.lng, searchResult.coordinates.lat],
      zoom: 15,
      essential: true,
    });
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([longitude, latitude]);

          if (map.current) {
            // Add user location marker
            new mapboxgl.Marker({
              color: "#FDCB6E",
              scale: 1,
            })
              .setLngLat([longitude, latitude])
              .setPopup(
                new mapboxgl.Popup().setHTML(`
                  <div class="p-3">
                    <h3 class="font-bold text-lg text-gray-800">Your Location</h3>
                    <p class="text-sm text-gray-600">You are here</p>
                  </div>
                `)
              )
              .addTo(map.current);
          }
        },
        (error) => {
          console.log("Error getting location:", error);
        }
      );
    }
  };

  useEffect(() => {
    return () => {
      map.current?.remove();
    };
  }, []);

    // Loading state while map initializes
  if (!isTokenEntered) {
    return (
      <Card className="p-8 bg-gradient-to-br from-fermata-teal/5 to-fermata-yellow/5 border-border/50">
        <div className="text-center space-y-6">
          <div className="animate-float">
            <MapPin className="w-16 h-16 text-primary mx-auto mb-4" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-foreground mb-2">
              Loading Interactive Map
            </h3>
            <p className="text-muted-foreground mb-6">
              Initializing the map with taxi hubs and routes...
            </p>
          </div>
          
          <div className="max-w-md mx-auto">
            <div className="animate-pulse">
              <div className="h-4 bg-muted rounded mb-2"></div>
              <div className="h-4 bg-muted rounded mb-2"></div>
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="p-4 bg-card/80 backdrop-blur-sm border-border/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center">
            <Layers className="w-5 h-5 mr-2 text-primary" />
            Live Taxi Hub Map
          </h3>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={getUserLocation}>
              <Locate className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div
          className="relative rounded-lg overflow-hidden"
          style={{ height: "500px" }}
        >
          <div ref={mapContainer} className="absolute inset-0" />

          {/* Legend */}
          <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur-sm rounded-lg p-3 border border-border/50">
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-primary rounded-full"></div>
                <span className="text-foreground">Taxi Hubs</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-secondary rounded-full"></div>
                <span className="text-foreground">Your Location</span>
              </div>
              {searchResult && (
                <div className="flex items-center space-x-2">
                  <Navigation className="w-3 h-3 text-primary" />
                  <span className="text-foreground">Selected Route</span>
                </div>
              )}
            </div>
          </div>

          {/* Route Info Overlay */}
          {searchResult && (
            <div className="absolute top-4 right-4 bg-card/90 backdrop-blur-sm rounded-lg p-4 border border-border/50 animate-slide-in-right max-w-xs">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  <span className="font-semibold text-foreground">
                    {searchResult.route}
                  </span>
                </div>
                <div className="space-y-1 text-sm">
                  <p className="text-foreground font-medium">
                    {searchResult.pickup}
                  </p>
                  <p className="text-muted-foreground">
                    {searchResult.landmark}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1 text-primary">
                      <Clock className="w-3 h-3" />
                      <span>{searchResult.walkingTime}</span>
                    </div>
                    <div className="flex items-center text-sm font-bold text-green-600 bg-green-50 px-2 py-1 rounded">
                      {searchResult.price} Birr
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default MapComponent;
