import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, GitBranch, Users, DollarSign, Zap, Shield } from "lucide-react"

const features = [
  {
    icon: Activity,
    title: "Real-time Monitoring",
    description:
      "Monitor your APIs 24/7 with instant alerts when issues arise. Get detailed insights into response times, error rates, and uptime.",
  },
  {
    icon: GitBranch,
    title: "CI/CD Integration",
    description:
      "Seamlessly integrate with your existing CI/CD pipeline. Run automated tests and monitor deployments with zero configuration.",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description:
      "Share API collections, collaborate on tests, and keep your entire team in sync with shared workspaces and real-time updates.",
  },
  {
    icon: DollarSign,
    title: "Affordable Pricing",
    description:
      "Start free and scale as you grow. Our transparent pricing is designed for small teams without enterprise complexity.",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Built for speed with global monitoring nodes. Get results in milliseconds, not seconds.",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Bank-level security with SOC 2 compliance, encrypted data, and secure API key management.",
  },
]

export function Features() {
  return (
    <section id="features" className="py-20 sm:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
            Everything you need to monitor your APIs
          </h2>
          <p className="mt-6 text-lg leading-8 text-muted-foreground text-pretty">
            From real-time monitoring to team collaboration, we've got all the tools your team needs to keep your APIs
            running smoothly.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-7xl">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title} className="relative overflow-hidden">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <feature.icon className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
