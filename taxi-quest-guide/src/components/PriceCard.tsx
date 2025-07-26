import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, DollarSign, TrendingUp } from "lucide-react";

interface PriceCardProps {
  route: string;
  pickup: string;
  landmark: string;
  walkingTime: string;
  price: number;
  isPopular?: boolean;
  discount?: number;
}

export default function PriceCard({
  route,
  pickup,
  landmark,
  walkingTime,
  price,
  isPopular = false,
  discount,
}: PriceCardProps) {
  const discountedPrice = discount ? price - (price * discount) / 100 : price;

  return (
    <Card
      className={`p-6 hover:shadow-lg transition-all duration-300 animate-fade-in relative ${
        isPopular
          ? "ring-2 ring-primary/20 bg-gradient-to-br from-primary/5 to-transparent"
          : ""
      }`}
    >
      {isPopular && (
        <Badge className="absolute -top-2 -right-2 bg-primary text-primary-foreground">
          <TrendingUp className="w-3 h-3 mr-1" />
          Popular
        </Badge>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-semibold text-primary">{route}</h4>
          <div className="text-right">
            {discount ? (
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-bold text-green-600">
                    {discountedPrice} Birr
                  </span>
                  <Badge variant="destructive" className="text-xs">
                    -{discount}%
                  </Badge>
                </div>
                <span className="text-sm text-muted-foreground line-through">
                  {price} Birr
                </span>
              </div>
            ) : (
              <div className="flex items-center text-lg font-bold text-green-600">
                <DollarSign className="w-4 h-4 mr-1" />
                {price} Birr
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-start space-x-2">
            <MapPin className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <p className="font-medium text-foreground">{pickup}</p>
              <p className="text-sm text-muted-foreground">{landmark}</p>
            </div>
          </div>

          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="w-4 h-4 mr-1" />
            {walkingTime}
          </div>
        </div>

        <div className="pt-2 border-t border-border/50">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Estimated fare:</span>
            <span className="font-semibold text-foreground">
              {discount ? `${discountedPrice} Birr` : `${price} Birr`}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
