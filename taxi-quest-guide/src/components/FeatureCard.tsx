import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export default function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <Card className="p-6 bg-card/70 backdrop-blur-sm border-border/50 hover:bg-card/90 transition-all duration-300 group">
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="p-3 rounded-full bg-gradient-to-r from-fermata-teal/10 to-fermata-teal-light/10 group-hover:from-fermata-teal/20 group-hover:to-fermata-teal-light/20 transition-all duration-300">
          <Icon className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <p className="text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </Card>
  );
}