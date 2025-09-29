import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const testimonials = [
  {
    content:
      "APIMonitor has completely transformed how we handle API monitoring. The real-time alerts saved us from a major outage last month.",
    author: "Sarah Chen",
    role: "CTO",
    company: "TechFlow",
    avatar: "/professional-woman-diverse.png",
  },
  {
    content:
      "Finally, an API monitoring tool that doesn't break the bank. The team collaboration features are exactly what we needed.",
    author: "Marcus Rodriguez",
    role: "Lead Developer",
    company: "StartupCo",
    avatar: "/professional-man.jpg",
  },
  {
    content: "The CI/CD integration was seamless. We had it up and running in our pipeline within minutes, not hours.",
    author: "Emily Watson",
    role: "DevOps Engineer",
    company: "CloudNative",
    avatar: "/professional-woman-engineer.png",
  },
]

export function Testimonials() {
  return (
    <section className="py-20 sm:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
            Trusted by teams worldwide
          </h2>
          <p className="mt-6 text-lg leading-8 text-muted-foreground text-pretty">
            See what developers and teams are saying about APIMonitor.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-7xl">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="relative">
                <CardContent className="pt-6">
                  <blockquote className="text-lg leading-relaxed text-foreground mb-6">
                    "{testimonial.content}"
                  </blockquote>
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={testimonial.avatar || "/placeholder.svg"} alt={testimonial.author} />
                      <AvatarFallback>
                        {testimonial.author
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold text-foreground">{testimonial.author}</div>
                      <div className="text-sm text-muted-foreground">
                        {testimonial.role} at {testimonial.company}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
