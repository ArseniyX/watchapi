"use client"

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
            "Up to 5 endpoints",
            "Hourly health checks",
            "Email alerts",
            "7-day history",
        ],
        cta: "Start Free",
        popular: false,
    },
    {
        name: "Team",
        price: "$39",
        description: "For development teams",
        features: [
            "Unlimited endpoints",
            "Every-minute checks",
            "Email & webhook alerts",
            "30-day history",
            "Team workspaces",
            "Priority support",
        ],
        cta: "Start Free Trial",
        popular: true,
    },
    {
        name: "Business",
        price: "$99",
        description: "For production teams",
        features: [
            "Everything in Team",
            "Custom check intervals",
            "Advanced analytics",
            "90-day history",
            "SLA monitoring",
            "Phone support",
        ],
        cta: "Start Free Trial",
        popular: false,
    },
];

export function Pricing() {
    return (
        <section id="pricing" className="py-20 sm:py-32">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-2xl text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
                        Simple, transparent pricing
                    </h2>
                    <p className="mt-6 text-lg leading-8 text-muted-foreground text-pretty">
                        Start free. Upgrade when you need more. All paid plans include a 14-day free trial.
                    </p>
                </div>
                <div className="mx-auto mt-16 max-w-5xl">
                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                        {plans.map((plan, index) => (
                            <Card
                                key={plan.name}
                                className={`relative transition-all duration-300 hover:scale-105 ${
                                    plan.popular ? "ring-2 ring-primary shadow-xl" : ""
                                }`}
                                style={{
                                    animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`
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
                                    <CardTitle className="text-2xl mb-2">
                                        {plan.name}
                                    </CardTitle>
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
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <ul className="space-y-4">
                                        {plan.features.map((feature) => (
                                            <li
                                                key={feature}
                                                className="flex items-start space-x-3"
                                            >
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
                                            variant={
                                                plan.popular
                                                    ? "default"
                                                    : "outline"
                                            }
                                        >
                                            {plan.cta}
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
