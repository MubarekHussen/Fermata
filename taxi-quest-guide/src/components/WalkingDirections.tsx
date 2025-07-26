import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Navigation, Clock, ArrowRight, Map } from "lucide-react";

interface WalkingDirectionsProps {
  pickup: string;
  landmark: string;
  walkingTime: string;
  coordinates: { lat: number; lng: number };
  onClose: () => void;
}

interface DirectionStep {
  step: number;
  instruction: string;
  distance?: string;
  time?: string;
}

export default function WalkingDirections({
  pickup,
  landmark,
  walkingTime,
  coordinates,
  onClose,
}: WalkingDirectionsProps) {
  const [currentStep, setCurrentStep] = useState(0);

  // Generate walking directions based on pickup location
  const generateDirections = (): DirectionStep[] => {
    const directions: DirectionStep[] = [];

    if (pickup.toLowerCase().includes("lafto")) {
      directions.push(
        {
          step: 1,
          instruction: "Start from your current location",
          distance: "0m",
          time: "0 min",
        },
        {
          step: 2,
          instruction: "Walk towards Sheger Park",
          distance: "100m",
          time: "1 min",
        },
        {
          step: 3,
          instruction: "Look for the taxi hub near the park entrance",
          distance: "50m",
          time: "1 min",
        },
        {
          step: 4,
          instruction: "You've reached Lafto Tera Station",
          distance: "0m",
          time: "0 min",
        }
      );
    } else if (pickup.toLowerCase().includes("ledata")) {
      directions.push(
        {
          step: 1,
          instruction: "Start from your current location",
          distance: "0m",
          time: "0 min",
        },
        {
          step: 2,
          instruction: "Walk towards Ledata Market",
          distance: "120m",
          time: "2 min",
        },
        {
          step: 3,
          instruction: "Look for the taxi hub near the market entrance",
          distance: "60m",
          time: "1 min",
        },
        {
          step: 4,
          instruction: "You've reached Ledata Station",
          distance: "0m",
          time: "0 min",
        }
      );
    } else if (pickup.toLowerCase().includes("bole")) {
      directions.push(
        {
          step: 1,
          instruction: "Start from your current location",
          distance: "0m",
          time: "0 min",
        },
        {
          step: 2,
          instruction: "Walk towards the ECA Building",
          distance: "150m",
          time: "2 min",
        },
        {
          step: 3,
          instruction: "Cross the road to the opposite side",
          distance: "20m",
          time: "1 min",
        },
        {
          step: 4,
          instruction: "You've reached Bole Medhanialem",
          distance: "0m",
          time: "0 min",
        }
      );
    } else if (pickup.toLowerCase().includes("mexico")) {
      directions.push(
        {
          step: 1,
          instruction: "Start from your current location",
          distance: "0m",
          time: "0 min",
        },
        {
          step: 2,
          instruction: "Walk towards Mexico Square",
          distance: "80m",
          time: "1 min",
        },
        {
          step: 3,
          instruction: "Look for the taxi hub near the square",
          distance: "0m",
          time: "0 min",
        },
        {
          step: 4,
          instruction: "You've reached Mexico Square Station",
          distance: "0m",
          time: "0 min",
        }
      );
    } else if (pickup.toLowerCase().includes("piassa")) {
      directions.push(
        {
          step: 1,
          instruction: "Start from your current location",
          distance: "0m",
          time: "0 min",
        },
        {
          step: 2,
          instruction: "Walk towards central Piassa area",
          distance: "120m",
          time: "2 min",
        },
        {
          step: 3,
          instruction: "Look for the main taxi hub in the center",
          distance: "0m",
          time: "0 min",
        },
        {
          step: 4,
          instruction: "You've reached Piassa Station",
          distance: "0m",
          time: "0 min",
        }
      );
    } else if (pickup.toLowerCase().includes("merkato")) {
      directions.push(
        {
          step: 1,
          instruction: "Start from your current location",
          distance: "0m",
          time: "0 min",
        },
        {
          step: 2,
          instruction: "Walk towards Merkato Market",
          distance: "200m",
          time: "3 min",
        },
        {
          step: 3,
          instruction: "Look for the taxi hub near the market entrance",
          distance: "50m",
          time: "1 min",
        },
        {
          step: 4,
          instruction: "You've reached Merkato Station",
          distance: "0m",
          time: "0 min",
        }
      );
    } else {
      // Default directions
      directions.push(
        {
          step: 1,
          instruction: "Start from your current location",
          distance: "0m",
          time: "0 min",
        },
        {
          step: 2,
          instruction: "Walk towards the main road",
          distance: "100m",
          time: "1 min",
        },
        {
          step: 3,
          instruction: "Look for the taxi hub sign",
          distance: "50m",
          time: "1 min",
        },
        {
          step: 4,
          instruction: `You've reached ${pickup}`,
          distance: "0m",
          time: "0 min",
        }
      );
    }

    return directions;
  };

  const directions = generateDirections();

  const handleNextStep = () => {
    if (currentStep < directions.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const openInMaps = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${coordinates.lat},${coordinates.lng}`;
    window.open(url, "_blank");
  };

  return (
    <Card className="p-6 bg-card/95 backdrop-blur-sm border-border/50 shadow-xl animate-fade-in">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Navigation className="w-6 h-6 text-primary" />
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                Walking Directions
              </h3>
              <p className="text-sm text-muted-foreground">{pickup}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={onClose}>
            ×
          </Button>
        </div>

        {/* Pickup Info */}
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="font-medium text-foreground">{pickup}</span>
          </div>
          <p className="text-sm text-muted-foreground mb-2">{landmark}</p>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1 text-sm text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>{walkingTime}</span>
            </div>
            <Badge variant="secondary" className="text-xs">
              Total Distance: ~
              {directions.reduce(
                (sum, step) => sum + parseInt(step.distance || "0"),
                0
              )}
              m
            </Badge>
          </div>
        </div>

        {/* Current Step */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-foreground">
              Step {currentStep + 1} of {directions.length}
            </h4>
            <Badge variant="outline">
              {directions[currentStep].distance} •{" "}
              {directions[currentStep].time}
            </Badge>
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                {directions[currentStep].step}
              </div>
              <p className="text-foreground font-medium">
                {directions[currentStep].instruction}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePrevStep}
            disabled={currentStep === 0}
            size="sm"
          >
            Previous
          </Button>

          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={openInMaps}
              className="flex items-center space-x-2"
            >
              <Map className="w-4 h-4" />
              <span>Open in Maps</span>
            </Button>
          </div>

          <Button
            onClick={handleNextStep}
            disabled={currentStep === directions.length - 1}
            size="sm"
            className="flex items-center space-x-2"
          >
            <span>Next</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Progress Indicator */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Progress</span>
            <span>
              {Math.round(((currentStep + 1) / directions.length) * 100)}%
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{
                width: `${((currentStep + 1) / directions.length) * 100}%`,
              }}
            ></div>
          </div>
        </div>

        {/* Completion Message */}
        {currentStep === directions.length - 1 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">✓</span>
              </div>
              <span className="font-medium text-green-800">
                You've arrived!
              </span>
            </div>
            <p className="text-sm text-green-700">
              You've reached your taxi pickup point. Look for the taxi hub sign.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
