import {
  MapPin,
  Wifi,
  Users,
  Navigation,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import SearchSection from "@/components/SearchSection";
import FeatureCard from "@/components/FeatureCard";
import MapComponent from "@/components/MapComponent";
import PriceCard from "@/components/PriceCard";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { routeData, getPopularRoutes, getPriceStats } from "@/data/routes";

interface SearchResult {
  route: string;
  pickup: string;
  landmark: string;
  walkingTime: string;
  coordinates: { lat: number; lng: number };
  price: number; // Price in Ethiopian Birr
}

const Index = () => {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/30 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img
                src="/lovable-uploads/dc52bf1e-82b3-41e6-b732-b9526486b0dc.png"
                alt="Fermata Logo"
                className="h-12 w-auto"
              />
              <div>
                <h1 className="text-xl font-bold text-foreground">FERMATA</h1>
                <p className="text-xs text-muted-foreground">
                  Smart Taxi Hub Finder
                </p>
              </div>
            </div>
            <Button variant="outline" className="hidden md:flex">
              Download App
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-fermata-teal/5 to-fermata-yellow/5"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              Find Your
              <span className="bg-gradient-to-r from-fermata-teal to-fermata-teal-light bg-clip-text text-transparent">
                {" "}
                Perfect{" "}
              </span>
              Taxi Hub
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Never miss your ride again. Fermata helps you find the nearest
              taxi pickup points for shared routes in your city, with offline
              support and real-time directions.
            </p>
          </div>

          <SearchSection onSearchResults={setSearchResults} />
        </div>
      </section>

      {/* Interactive Map Section */}
      {searchResults.length > 0 && (
        <section className="py-20 bg-gradient-to-br from-fermata-teal/5 via-background to-fermata-yellow/5 relative overflow-hidden">
          <div className="absolute inset-0 opacity-50">
            <div
              className="w-full h-full bg-repeat"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23059669' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}
            ></div>
          </div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-12">
              <h3 className="text-3xl lg:text-4xl font-bold text-foreground mb-4 animate-fade-in">
                Your Route on the Map
              </h3>
              <p className="text-lg text-muted-foreground animate-fade-in">
                Explore pickup points and get walking directions to start your
                journey
              </p>
            </div>

            <div className="max-w-6xl mx-auto">
              <div
                className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-8 shadow-2xl animate-scale-in"
                style={{ boxShadow: "var(--shadow-glow)" }}
              >
                <div className="h-[500px] w-full rounded-xl overflow-hidden border border-border/20 shadow-lg">
                  <MapComponent searchResult={searchResults[0]} />
                </div>

                <div className="mt-6 flex flex-wrap gap-4 justify-center">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground bg-muted/50 px-4 py-2 rounded-full">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span>Your Location</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground bg-muted/50 px-4 py-2 rounded-full">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span>Taxi Hub</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground bg-muted/50 px-4 py-2 rounded-full">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span>Route Path</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Pricing Section */}
      <section className="py-20 bg-gradient-to-br from-fermata-teal/5 to-fermata-yellow/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Transparent Pricing
            </h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Know your fare before you travel. All our routes have fixed,
              transparent pricing in Ethiopian Birr.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {routeData.slice(0, 6).map((route) => (
              <PriceCard
                key={route.id}
                route={route.route}
                pickup={route.pickup}
                landmark={route.landmark}
                walkingTime={route.walkingTime}
                price={route.price}
                isPopular={route.isPopular}
                discount={route.discount}
              />
            ))}
          </div>

          <div className="text-center mt-12 space-y-6">
            <div className="inline-flex items-center space-x-2 bg-green-50 text-green-700 px-4 py-2 rounded-full">
              <DollarSign className="w-4 h-4" />
              <span className="text-sm font-medium">
                All prices are fixed and include shared taxi fare
              </span>
            </div>

            {/* Pricing Statistics */}
            <div className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <div className="text-center p-4 bg-card/50 rounded-lg border border-border/50">
                <div className="text-2xl font-bold text-primary">
                  {getPriceStats().min} Birr
                </div>
                <div className="text-sm text-muted-foreground">Lowest Fare</div>
              </div>
              <div className="text-center p-4 bg-card/50 rounded-lg border border-border/50">
                <div className="text-2xl font-bold text-primary">
                  {getPriceStats().max} Birr
                </div>
                <div className="text-sm text-muted-foreground">
                  Highest Fare
                </div>
              </div>
              <div className="text-center p-4 bg-card/50 rounded-lg border border-border/50">
                <div className="text-2xl font-bold text-primary">
                  {getPriceStats().average} Birr
                </div>
                <div className="text-sm text-muted-foreground">
                  Average Fare
                </div>
              </div>
              <div className="text-center p-4 bg-card/50 rounded-lg border border-border/50">
                <div className="text-2xl font-bold text-primary">
                  {getPriceStats().total}
                </div>
                <div className="text-sm text-muted-foreground">
                  Available Routes
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Why Choose Fermata?
            </h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Built specifically for cities with shared taxi systems, Fermata
              bridges the gap between passengers and fixed-route transportation.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={MapPin}
              title="Instant Location Info"
              description="Get precise pickup locations with landmarks and walking directions in seconds."
            />
            <FeatureCard
              icon={Wifi}
              title="Offline Support"
              description="Access hub information even without internet connectivity using cached data."
            />
            <FeatureCard
              icon={Users}
              title="Crowdsourced Updates"
              description="Community-driven data ensures accurate and up-to-date route information."
            />
            <FeatureCard
              icon={Navigation}
              title="Smart Routing"
              description="Find the most efficient routes and reduce waiting time at pickup points."
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              How Fermata Works
            </h3>
            <p className="text-lg text-muted-foreground">
              Simple, fast, and reliable taxi hub discovery
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-r from-fermata-teal to-fermata-teal-light rounded-full flex items-center justify-center mx-auto text-white font-bold text-xl">
                1
              </div>
              <h4 className="text-xl font-semibold text-foreground">
                Enter Your Route
              </h4>
              <p className="text-muted-foreground">
                Simply input your starting location and destination to begin
                your search.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-r from-fermata-yellow to-fermata-yellow-light rounded-full flex items-center justify-center mx-auto text-foreground font-bold text-xl">
                2
              </div>
              <h4 className="text-xl font-semibold text-foreground">
                Get Pickup Info
              </h4>
              <p className="text-muted-foreground">
                Receive detailed information about the nearest taxi hub with
                landmarks and directions.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-r from-fermata-teal-light to-fermata-teal rounded-full flex items-center justify-center mx-auto text-white font-bold text-xl">
                3
              </div>
              <h4 className="text-xl font-semibold text-foreground">
                Navigate & Ride
              </h4>
              <p className="text-muted-foreground">
                Follow walking directions to your pickup point and catch your
                shared taxi.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-fermata-teal to-fermata-teal-light">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Commute?
          </h3>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of commuters who've made their daily travel smoother
            with Fermata.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="secondary"
              size="lg"
              className="bg-white text-fermata-teal hover:bg-white/90"
            >
              Download for Android
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-white/10"
            >
              Download for iOS
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border/50 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <img
                  src="/lovable-uploads/dc52bf1e-82b3-41e6-b732-b9526486b0dc.png"
                  alt="Fermata Logo"
                  className="h-8 w-auto"
                />
                <span className="font-bold text-foreground">FERMATA</span>
              </div>
              <p className="text-muted-foreground text-sm">
                Smart taxi hub finder for cities with shared transportation
                systems.
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    How it Works
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Cities
                  </a>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Help Center
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Contact Us
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Report Issue
                  </a>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    About
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Privacy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Terms
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border/50 mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>
              &copy; 2024 Fermata. All rights reserved. Making urban mobility
              accessible for everyone.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
