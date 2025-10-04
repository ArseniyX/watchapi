"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check } from "lucide-react";
import Link from "next/link";

const plans = [
  {
    name: "Free",
    price: "$0",
    description: "Perfect for small projects",
    features: [
      "Up to 10 endpoints",
      "Up to 3 team members",
      "Hourly health checks",
      "Email alerts",
      "7-day history",
      "API request builder",
    ],
    cta: "Start Free",
    popular: false,
    highlight: null,
  },
  {
    name: "Starter",
    price: "$39",
    description: "For development teams",
    priceNote: "flat rate/month",
    features: [
      "Up to 50 endpoints",
      "Up to 10 team members",
      "Every-minute checks",
      "Email & webhook alerts",
      "30-day history",
      "Team workspaces",
      "Priority support",
    ],
    cta: "Start Free Trial",
    popular: true,
    highlight: null,
  },
  {
    name: "Pro",
    price: "$99",
    description: "For production teams",
    priceNote: "flat rate/month",
    features: [
      "Up to 250 endpoints",
      "Up to 25 team members",
      "30-second check intervals",
      "Advanced analytics",
      "90-day history",
      "SLA monitoring",
      "Phone support",
    ],
    cta: "Start Free Trial",
    popular: false,
    highlight: null,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="py-20 sm:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
            Simple, team-friendly pricing
          </h2>
          <p className="mt-6 text-lg leading-8 text-muted-foreground text-pretty">
            One flat rate for your entire team. No per-user fees. API testing
            and monitoring in one tool.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-5xl">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {plans.map((plan, index) => (
              <Card
                key={plan.name}
                className={`relative transition-all duration-300 hover:scale-105 animate-in fade-in slide-in-from-bottom-8 ${
                  plan.popular ? "ring-2 ring-primary shadow-xl" : ""
                }`}
                style={{
                  animationDelay: `${index * 100}ms`,
                  animationDuration: "700ms",
                  animationFillMode: "both",
                }}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center rounded-full bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground shadow-lg">
                      Most Popular
                    </span>
                  </div>
                )}
                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                  <CardDescription className="mb-4">
                    {plan.description}
                  </CardDescription>
                  <div className="mt-4">
                    <span className="text-5xl font-bold text-foreground">
                      {plan.price}
                    </span>
                    <span className="text-muted-foreground text-lg">
                      {plan.price !== "$0" && "/mo"}
                    </span>
                  </div>
                  {"priceNote" in plan && plan.priceNote && (
                    <p className="text-xs text-muted-foreground mt-2">
                      {plan.priceNote}
                    </p>
                  )}
                  {"highlight" in plan && plan.highlight && (
                    <div className="mt-3 inline-flex items-center rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-600 dark:text-green-400">
                      {plan.highlight}
                    </div>
                  )}
                </CardHeader>
                <CardContent className="space-y-6">
                  <ul className="space-y-4">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start space-x-3">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-foreground">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/signup" className="block">
                    <Button
                      size="lg"
                      className="w-full"
                      variant={plan.popular ? "default" : "outline"}
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Comparison Link */}
          <div className="text-center mt-12">
            <p className="text-muted-foreground text-sm">
              Not sure which plan is right for you?{" "}
              <Link
                href="/compare"
                className="text-primary hover:underline font-medium"
              >
                Compare WatchAPI with other tools →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
