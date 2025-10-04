import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Activity, Bell, TrendingUp, Clock } from "lucide-react";

const features = [
  {
    icon: Activity,
    title: "API Health Checks",
    description:
      "Automated monitoring checks every minute. Track response times, status codes, and uptime across all your endpoints.",
  },
  {
    icon: Bell,
    title: "Instant Alerts",
    description:
      "Get notified immediately via email or webhook when your APIs go down or respond slowly. Stay ahead of issues.",
  },
  {
    icon: TrendingUp,
    title: "Performance Analytics",
    description:
      "Visualize response times, error rates, and uptime trends. Understand your API performance at a glance.",
  },
  {
    icon: Clock,
    title: "Response Time Tracking",
    description:
      "Monitor how fast your APIs respond. Set thresholds and get alerted when performance degrades.",
  },
];

export function Features() {
  return (
    <section id="features" className="py-20 sm:py-32 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
            Everything you need to keep your APIs healthy
          </h2>
          <p className="mt-6 text-lg leading-8 text-muted-foreground text-pretty">
            Simple, powerful monitoring tools that actually work. No bloat, no
            complexity.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-5xl">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
            {features.map((feature, index) => (
              <Card
                key={feature.title}
                className="relative overflow-hidden border-2 transition-all duration-500 hover:shadow-lg hover:border-primary/50 animate-in fade-in slide-in-from-bottom-4"
                style={{
                  animationDelay: `${index * 100}ms`,
                  animationFillMode: "both",
                }}
              >
                <CardHeader>
                  <div className="flex items-start space-x-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 ring-2 ring-primary/20 transition-transform hover:scale-110">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                      <CardDescription className="text-base leading-relaxed mt-2">
                        {feature.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
