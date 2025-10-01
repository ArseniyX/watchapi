"use client"

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Activity } from "lucide-react";

export function Hero() {
    return (
        <section className="relative py-20 sm:py-32 overflow-hidden">
            {/* Animated background gradient */}
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.primary.100),white)] dark:bg-[radial-gradient(45rem_50rem_at_top,theme(colors.primary.950),theme(colors.background))] opacity-20" />

            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-4xl text-center">
                    {/* Badge */}
                    <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm animate-in fade-in slide-in-from-bottom-3 duration-1000">
                        <Activity className="h-3.5 w-3.5 text-primary animate-pulse" />
                        <span className="text-primary font-medium">Real-time API Monitoring</span>
                    </div>

                    <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl text-balance animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-150">
                        Simple API Monitoring for Development Teams
                    </h1>
                    <p className="mt-6 text-lg leading-8 text-muted-foreground text-pretty max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-5 duration-1000 delay-300">
                        Monitor your APIs 24/7. Get instant alerts when things break.
                        Track uptime and performance. No complexity, no enterprise pricing.
                    </p>
                    <div className="mt-10 flex items-center justify-center gap-x-6 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-500">
                        <Link href="/signup">
                            <Button size="lg" className="px-8 group">
                                Start Monitoring Free
                                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Button>
                        </Link>
                        <Link href="#pricing">
                            <Button
                                variant="outline"
                                size="lg"
                                className="px-8"
                            >
                                View Pricing
                            </Button>
                        </Link>
                    </div>

                    {/* Stats */}
                    <div className="mt-16 grid grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-7 duration-1000 delay-700">
                        <div>
                            <div className="text-3xl font-bold text-foreground">99.9%</div>
                            <div className="text-sm text-muted-foreground mt-1">Uptime</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-foreground">&lt;50ms</div>
                            <div className="text-sm text-muted-foreground mt-1">Response Time</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-foreground">24/7</div>
                            <div className="text-sm text-muted-foreground mt-1">Monitoring</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
