import {
  MapPin,
  Wifi,
  Users,
  Navigation,
  DollarSign,
  TrendingUp,
  Mic,
  MicOff,
  Volume2,
  Loader2,
} from "lucide-react";
import SearchSection from "@/components/SearchSection";
import FeatureCard from "@/components/FeatureCard";
import MapComponent from "@/components/MapComponent";
import PriceCard from "@/components/PriceCard";
import { Button } from "@/components/ui/button";
import { useState, useRef, useCallback, useEffect } from "react";
import { routeData, getPopularRoutes, getPriceStats } from "@/data/routes";

const API_KEY = 'sk_858912c4-ca99-4c5d-8834-a591a4f3197b_6026af20c412eba021e11e19b1c3d30397120d78736a8e120bc7299ab69bc4d0';
const ADDIS_AI_BASE_URL = 'https://api.addisassistant.com/api/v1';

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
  
  // Voice Assistant State
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [amharicResponse, setAmharicResponse] = useState('');
  const [error, setError] = useState('');
  const [recognizedText, setRecognizedText] = useState('');
  
  // Form fields populated by voice
  const [voiceFrom, setVoiceFrom] = useState('');
  const [voiceTo, setVoiceTo] = useState('');

  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'am-ET';
      
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setRecognizedText(transcript);
        processTextInput(transcript);
      };
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setError(`Speech recognition failed: ${event.error}. Please try again.`);
        setIsRecording(false);
      };
      
      recognition.onend = () => {
        setIsRecording(false);
      };
      
      recognitionRef.current = recognition;
    }
  }, []);

  const startRecording = useCallback(async () => {
    if (!recognitionRef.current) {
      setError('Speech recognition is not available. Please use Chrome or Edge.');
      return;
    }

    try {
      setError('');
      setRecognizedText('');
      setAmharicResponse('');
      
      recognitionRef.current.start();
      setIsRecording(true);
    } catch (err) {
      setError('Failed to start speech recognition. Please try again.');
      console.error('Error starting recognition:', err);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  const processTextInput = async (text: string) => {
    setIsProcessing(true);
    setAmharicResponse('');

    // First, speak back what the user said
    await speakText(`እርስዎ አሉት: ${text}`);

    try {
      // Parse locations from voice input
      const locations = extractLocationsFromText(text);
      
      if (locations.from && locations.to) {
        // Populate the form fields with extracted locations
        setVoiceFrom(locations.from);
        setVoiceTo(locations.to);
        
        // Try to get route information from API
        try {
          const results = await performRouteSearch(locations.from, locations.to);
          if (results.length > 0) {
            const bestResult = results[0];
            const responseText = `የመነሻ ቦታ ${locations.from} እና መድረሻ ቦታ ${locations.to} ተሞልቷል። የጉዞ ዋጋ ${bestResult.price} ${bestResult.fare?.currency || 'Birr'} ነው። እባክዎን "Find Pickup Point" ቁልፍን ይንኩ።`;
            setAmharicResponse(responseText);
            await speakText(responseText);
          } else {
            const responseText = `የመነሻ ቦታ ${locations.from} እና መድረሻ ቦታ ${locations.to} ተሞልቷል። እባክዎን "Find Pickup Point" ቁልፍን ይንኩ።`;
            setAmharicResponse(responseText);
            await speakText(responseText);
          }
        } catch (error) {
          const responseText = `የመነሻ ቦታ ${locations.from} እና መድረሻ ቦታ ${locations.to} ተሞልቷል። እባክዎን "Find Pickup Point" ቁልፍን ይንኩ።`;
          setAmharicResponse(responseText);
          await speakText(responseText);
        }
        
        setIsProcessing(false);
        return;
      } else if (locations.from) {
        // Only found starting location
        setVoiceFrom(locations.from);
        const responseText = `የመነሻ ቦታ ${locations.from} ተሞልቷል። እባክዎን መድረሻ ቦታን ይጥቀሱ።`;
        setAmharicResponse(responseText);
        await speakText(responseText);
        setIsProcessing(false);
        return;
      }

      // If no locations found, ask for clarification
      const instructionText = `እባክዎን የመነሻ እና መድረሻ ቦታን ይጥቀሱ። ለምሳሌ "ከላፍቶ ወደ ሜክሲኮ" ወይም "ከቦሌ ወደ ፒያሳ"።`;
      setAmharicResponse(instructionText);
      await speakText(instructionText);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'የድምፅ ዝግጅት ችግር አለ';
      setError(errorMessage);
      
      const testResponse = `ደህና፣ የ${text} ጥያቄዎ ተሰምቷል። እባክዎን እንደገና ይሞክሩ።`;
      setAmharicResponse(testResponse);
      await speakText(testResponse);
    } finally {
      setIsProcessing(false);
    }
  };

  // Function to extract locations from Amharic text
  const extractLocationsFromText = (text: string) => {
    const lowerText = text.toLowerCase();
    
    // Common Addis Ababa locations in Amharic and English
    const locations = {
      'ላፍቶ': 'lafto',
      'lafto': 'lafto',
      'ሜክሲኮ': 'mexico',
      'mexico': 'mexico',
      'ቦሌ': 'bole',
      'bole': 'bole',
      'ፒያሳ': 'piassa',
      'piassa': 'piassa',
      'መርካቶ': 'merkato',
      'merkato': 'merkato',
      'አራት ኪሎ': 'arat kilo',
      'arat kilo': 'arat kilo',
      'ሰድስት ኪሎ': 'sidist kilo',
      'sidist kilo': 'sidist kilo',
      'ካዛንቺስ': 'kazanchis',
      'kazanchis': 'kazanchis',
      'ጋሸን': 'gashen',
      'gashen': 'gashen',
      'ለደታ': 'ledata',
      'ledata': 'ledata',
      'አየርቴና': 'ayertena',
      'ayertena': 'ayertena',
    };

    let from = '';
    let to = '';
    
    // Look for "ከ...ወደ..." pattern (from...to...)
    const fromToPattern = /ከ([^ወ]+)ወደ(.+)/;
    const match = lowerText.match(fromToPattern);
    
    if (match) {
      const fromText = match[1].trim();
      const toText = match[2].trim();
      
      // Find matching locations
      for (const [amharic, english] of Object.entries(locations)) {
        if (fromText.includes(amharic)) from = english;
        if (toText.includes(amharic)) to = english;
      }
    } else {
      // Look for any two locations mentioned
      const foundLocations = [];
      for (const [amharic, english] of Object.entries(locations)) {
        if (lowerText.includes(amharic)) {
          foundLocations.push(english);
        }
      }
      
      if (foundLocations.length >= 2) {
        from = foundLocations[0];
        to = foundLocations[1];
      } else if (foundLocations.length === 1) {
        // If only one location mentioned, might be asking about routes from there
        from = foundLocations[0];
      }
    }

    return { from, to };
  };

  // Function to search for routes based on locations
  const performRouteSearch = async (from: string, to: string) => {
    try {
      // Try to use the real API first
      const apiResponse = await fetch('http://localhost:8000/api/route/plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          origin: from.trim(),
          destination: to.trim(),
          include_instructions: false,
        }),
      });

      if (apiResponse.ok) {
        const data = await apiResponse.json();
        const searchResult = {
          route: `${data.origin?.name || from} to ${data.destination?.name || to}`,
          pickup: data.origin?.name || from,
          landmark: data.destination?.name || to,
          walkingTime: `${Math.round(data.route.time / 60)} min`,
          coordinates: {
            lat: data.origin?.lat || 0,
            lng: data.origin?.lng || 0,
          },
          price: data.fare.total_fare,
          fare: data.fare,
          origin: data.origin,
          destination: data.destination,
        };
        return [searchResult];
      }
    } catch (error) {
      console.error('API call failed, falling back to mock data:', error);
    }

    // Fallback to mock data
    const fromLower = from.toLowerCase().trim();
    const toLower = to.toLowerCase().trim();

    const exactMatches = routeData.filter((result) => {
      const routeLower = result.route.toLowerCase();
      const hasFrom = routeLower.includes(fromLower);
      const hasTo = routeLower.includes(toLower);
      return hasFrom && hasTo;
    });

    const partialMatches = routeData.filter((result) => {
      const routeLower = result.route.toLowerCase();
      const pickupLower = result.pickup.toLowerCase();
      
      const fromMatches = routeLower.includes(fromLower) || pickupLower.includes(fromLower);
      const toMatches = routeLower.includes(toLower) || pickupLower.includes(toLower);
      
      return fromMatches || toMatches;
    });

    const matchingRoutes = exactMatches.length > 0 ? exactMatches : partialMatches;

    return matchingRoutes.map((route) => ({
      route: route.route,
      pickup: route.pickup,
      landmark: route.landmark,
      walkingTime: route.walkingTime,
      coordinates: route.coordinates,
      price: route.price,
    }));
  };

  const speakText = async (text: string) => {
    try {
      if ('speechSynthesis' in window) {
        setIsPlaying(true);
        
        window.speechSynthesis.cancel();
        await new Promise(resolve => setTimeout(resolve, 100));
        
        let voices = window.speechSynthesis.getVoices();
        if (voices.length === 0) {
          await new Promise(resolve => {
            window.speechSynthesis.onvoiceschanged = () => {
              voices = window.speechSynthesis.getVoices();
              resolve(void 0);
            };
          });
        }
        
        const utterance = new SpeechSynthesisUtterance(text);
        
        let amharicVoice = voices.find(voice => 
          voice.lang.toLowerCase().includes('am-et') || 
          voice.lang.toLowerCase().includes('am_et')
        );
        
        if (!amharicVoice) {
          amharicVoice = voices.find(voice => 
            voice.lang.toLowerCase().startsWith('am') ||
            voice.name.toLowerCase().includes('amharic')
          );
        }
        
        if (amharicVoice) {
          utterance.voice = amharicVoice;
          utterance.lang = amharicVoice.lang;
        } else {
          utterance.lang = 'am-ET';
        }
        
        utterance.rate = 0.7;
        utterance.pitch = 1.1;
        utterance.volume = 1;
        
        utterance.onend = () => setIsPlaying(false);
        utterance.onerror = () => setIsPlaying(false);
        
        window.speechSynthesis.speak(utterance);
      }
    } catch (err) {
      setIsPlaying(false);
      console.warn('Text-to-speech error:', err);
    }
  };

  const handleToggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

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
            
            {/* Inline Voice Assistant */}
            <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-teal-50 rounded-2xl border border-blue-200">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <Mic className="w-6 h-6 text-blue-600" />
                <h3 className="text-xl font-semibold text-blue-900">Ask in Amharic</h3>
              </div>
              <p className="text-blue-700 mb-4">
                ታክሲ ማቆሚያዎችን በአማርኛ በድምፅዎ ይጠይቁ። የአማርኛ ድምፅ ረዳት ለእርስዎ ያገልግላል።
              </p>
              
              {/* Usage Examples */}
              <div className="bg-blue-100 rounded-lg p-4 mb-6">
                <h4 className="text-sm font-semibold text-blue-800 mb-2">ምሳሌዎች (Examples):</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• "ከላፍቶ ወደ ሜክሲኮ" (From Lafto to Mexico)</li>
                  <li>• "ከቦሌ ወደ ፒያሳ" (From Bole to Piassa)</li>
                  <li>• "ከመርካቶ ወደ ቦሌ" (From Merkato to Bole)</li>
                  <li>• "አራት ኪሎ ወደ ካዛንቺስ" (Arat Kilo to Kazanchis)</li>
                </ul>
              </div>
              
              {/* Voice Recording Button */}
              <div className="flex justify-center mb-4">
                <button
                  onClick={handleToggleRecording}
                  disabled={isProcessing}
                  className={`
                    relative w-16 h-16 rounded-full border-2 transition-all duration-200 mx-auto
                    ${isRecording 
                      ? 'bg-red-500 border-red-500 text-white shadow-lg' 
                      : 'bg-blue-600 border-blue-600 text-white hover:bg-blue-700'
                    }
                    ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                  `}
                >
                  {isProcessing ? (
                    <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                  ) : isRecording ? (
                    <MicOff className="w-6 h-6 mx-auto" />
                  ) : (
                    <Mic className="w-6 h-6 mx-auto" />
                  )}
                </button>
              </div>

              {/* Status Text */}
              <div className="h-6 mb-4">
                {isRecording && (
                  <p className="text-sm text-red-600 animate-pulse">
                    Listening... Speak now or tap to stop
                  </p>
                )}
                {isProcessing && (
                  <p className="text-sm text-blue-600">
                    Processing your request...
                  </p>
                )}
                {isPlaying && (
                  <div className="flex items-center justify-center space-x-2 text-green-600">
                    <Volume2 className="w-4 h-4" />
                    <span className="text-sm">Playing response...</span>
                  </div>
                )}
              </div>

              {/* Recognized Text */}
              {recognizedText && (
                <div className="bg-blue-100 border border-blue-300 rounded-lg p-3 text-left mb-4">
                  <div className="flex items-center space-x-2 mb-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm font-medium text-blue-700">What you said:</span>
                  </div>
                  <div className="text-blue-900 text-sm" dir="auto">
                    {recognizedText}
                  </div>
                </div>
              )}

              {/* AI Response */}
              {amharicResponse && (
                <div className="bg-white border border-gray-200 rounded-lg p-4 text-left mb-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-700">AI Response</span>
                  </div>
                  <div className="text-gray-900 text-sm leading-relaxed" dir="auto">
                    {amharicResponse}
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600 text-left mb-4">
                  {error}
                </div>
              )}

              {/* Success Message for Found Routes */}
              {searchResults.length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-left">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium text-green-700">Routes Found!</span>
                  </div>
                  <p className="text-green-800 text-sm">
                    {searchResults.length} taxi route{searchResults.length > 1 ? 's' : ''} found. Check the map below for details.
                  </p>
                </div>
              )}
            </div>
          </div>

          <SearchSection 
            onSearchResults={setSearchResults} 
            initialFrom={voiceFrom}
            initialTo={voiceTo}
          />
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
