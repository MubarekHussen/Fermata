import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { MapPin, Navigation, Clock, Map, DollarSign, Mic } from "lucide-react";
import { routeData, RouteData } from "@/data/routes";
import WalkingDirections from "./WalkingDirections";
import VoiceInput from "./VoiceInput";

interface SearchResult {
  route: string;
  pickup: string;
  landmark: string;
  walkingTime: string;
  coordinates: { lat: number; lng: number };
  price: number; // Price in Ethiopian Birr
}

interface SearchSectionProps {
  onSearchResults: (results: SearchResult[]) => void;
}

export default function SearchSection({ onSearchResults }: SearchSectionProps) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDirections, setShowDirections] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<SearchResult | null>(null);
  const [isListeningFrom, setIsListeningFrom] = useState(false);
  const [isListeningTo, setIsListeningTo] = useState(false);
  const [showVoiceInput, setShowVoiceInput] = useState(false);

  const handleVoiceFrom = (transcript: string) => {
    setFrom(transcript);
  };

  const handleVoiceTo = (transcript: string) => {
    setTo(transcript);
  };

  const handleSearch = async () => {
    if (!from || !to) return;

    setIsSearching(true);
    // Simulate API call
    setTimeout(() => {
      // Real search logic - find exact route matches
      const fromLower = from.toLowerCase().trim();
      const toLower = to.toLowerCase().trim();

      // Find routes that match the exact from->to pattern
      const exactMatches = routeData.filter((result) => {
        const routeLower = result.route.toLowerCase();

        // Check if the route contains both "from" and "to" locations
        const hasFrom = routeLower.includes(fromLower);
        const hasTo = routeLower.includes(toLower);

        // For exact matches, both locations should be in the route
        return hasFrom && hasTo;
      });

      // If no exact matches, try partial matches with better logic
      const partialMatches = routeData.filter((result) => {
        const routeLower = result.route.toLowerCase();
        const pickupLower = result.pickup.toLowerCase();

        // Check if either location matches the route or pickup point
        const fromMatches =
          routeLower.includes(fromLower) || pickupLower.includes(fromLower);
        const toMatches =
          routeLower.includes(toLower) || pickupLower.includes(toLower);

        // Also check for location name variations
        const fromVariations =
          fromLower.includes("ledata") ||
          fromLower.includes("lafto") ||
          fromLower.includes("bole") ||
          fromLower.includes("mexico") ||
          fromLower.includes("piassa") ||
          fromLower.includes("merkato");
        const toVariations =
          toLower.includes("ledata") ||
          toLower.includes("lafto") ||
          toLower.includes("bole") ||
          toLower.includes("mexico") ||
          toLower.includes("piassa") ||
          toLower.includes("merkato");

        return fromMatches || toMatches || (fromVariations && toVariations);
      });

      // Use exact matches if available, otherwise use partial matches
      const matchingRoutes =
        exactMatches.length > 0 ? exactMatches : partialMatches;

      // Convert RouteData to SearchResult format
      const searchResults: SearchResult[] = matchingRoutes.map((route) => ({
        route: route.route,
        pickup: route.pickup,
        landmark: route.landmark,
        walkingTime: route.walkingTime,
        coordinates: route.coordinates,
        price: route.price,
      }));

      // If still no matches, show popular routes as suggestions
      const finalResults =
        searchResults.length > 0
          ? searchResults
          : routeData
              .filter((route) => route.isPopular)
              .slice(0, 3)
              .map((route) => ({
                route: route.route,
                pickup: route.pickup,
                landmark: route.landmark,
                walkingTime: route.walkingTime,
                coordinates: route.coordinates,
                price: route.price,
              }));

      console.log("Search results:", finalResults); // Debug log
      setResults(finalResults);
      onSearchResults(finalResults);
      setIsSearching(false);
    }, 1000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* Search Form */}
      <Card
        className="p-8 bg-card/50 backdrop-blur-sm border-border/50"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <div className="space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Where are you going?
            </h2>
            <p className="text-muted-foreground">
              Find the nearest taxi pickup point for your route
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                From
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="e.g., Lafto, Bole, Mexico"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="pl-10 pr-12 h-12 bg-input border-border"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsListeningFrom(true)}
                  disabled={isListeningFrom || isListeningTo}
                  className="absolute right-1 top-1 h-10 w-10 p-0 hover:bg-muted/50"
                >
                  <Mic className="w-4 h-4 text-muted-foreground" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">To</label>
              <div className="relative">
                <Navigation className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="e.g., Mexico, Piassa, Merkato"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="pl-10 pr-12 h-12 bg-input border-border"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsListeningTo(true)}
                  disabled={isListeningFrom || isListeningTo}
                  className="absolute right-1 top-1 h-10 w-10 p-0 hover:bg-muted/50"
                >
                  <Mic className="w-4 h-4 text-muted-foreground" />
                </Button>
              </div>
            </div>
          </div>

          <Button
            onClick={handleSearch}
            disabled={!from || !to || isSearching}
            variant="hero"
            className="w-full h-12 text-lg font-semibold"
          >
            {isSearching ? "Searching..." : "Find Pickup Point"}
          </Button>

          {/* Available Locations Help */}
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground mb-2">
              Available locations: Ledata, Lafto, Bole, Mexico, Piassa, Merkato
            </p>
            <p className="text-xs text-muted-foreground">
              Try searching for routes like "Ledata to Mexico" or "Lafto to
              Piassa"
            </p>
            <div className="flex items-center justify-center space-x-2 text-xs text-muted-foreground">
              <Mic className="w-3 h-3" />
              <span>Tap the microphone icons to use voice input</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-foreground">
            Available Routes
          </h3>
          <p className="text-sm text-muted-foreground">
            {results.length > 0 &&
            results[0].route.includes(from) &&
            results[0].route.includes(to)
              ? `Found ${results.length} exact route${
                  results.length !== 1 ? "s" : ""
                } for your search`
              : results.length > 0
              ? `Found ${results.length} related route${
                  results.length !== 1 ? "s" : ""
                } (showing best matches)`
              : "No exact matches found, showing popular routes"}
          </p>
          {results.map((result, index) => (
            <Card
              key={index}
              className="p-6 bg-card border-border/50 hover:shadow-lg transition-all duration-300 animate-fade-in"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-semibold text-primary">
                    {result.route}
                  </h4>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="w-4 h-4 mr-1" />
                      {result.walkingTime}
                    </div>
                    <div className="flex items-center text-lg font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full">
                      <DollarSign className="w-4 h-4 mr-1" />
                      {result.price} Birr
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-start space-x-2">
                    <MapPin className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground">
                        {result.pickup}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {result.landmark}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-2"
                  >
                    <Map className="w-4 h-4" />
                    <span>View on Map</span>
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setSelectedRoute(result);
                      setShowDirections(true);
                    }}
                  >
                    Walking Directions
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Voice Input Modal for "From" */}
      {isListeningFrom && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <Card className="p-6 bg-card/95 backdrop-blur-sm border-border/50 shadow-xl">
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Speak Your Starting Location
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Say the name of your starting location
                  </p>
                </div>
                <VoiceInput
                  onTranscript={handleVoiceFrom}
                  placeholder="starting location"
                  isListening={isListeningFrom}
                  onStartListening={() => setIsListeningFrom(true)}
                  onStopListening={() => setIsListeningFrom(false)}
                />
                <div className="flex justify-center">
                  <Button
                    variant="outline"
                    onClick={() => setIsListeningFrom(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Voice Input Modal for "To" */}
      {isListeningTo && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <Card className="p-6 bg-card/95 backdrop-blur-sm border-border/50 shadow-xl">
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Speak Your Destination
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Say the name of your destination
                  </p>
                </div>
                <VoiceInput
                  onTranscript={handleVoiceTo}
                  placeholder="destination"
                  isListening={isListeningTo}
                  onStartListening={() => setIsListeningTo(true)}
                  onStopListening={() => setIsListeningTo(false)}
                />
                <div className="flex justify-center">
                  <Button
                    variant="outline"
                    onClick={() => setIsListeningTo(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Walking Directions Modal */}
      {showDirections && selectedRoute && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <WalkingDirections
              pickup={selectedRoute.pickup}
              landmark={selectedRoute.landmark}
              walkingTime={selectedRoute.walkingTime}
              coordinates={selectedRoute.coordinates}
              onClose={() => {
                setShowDirections(false);
                setSelectedRoute(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
