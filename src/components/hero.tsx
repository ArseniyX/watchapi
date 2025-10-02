"use client"

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Activity } from "lucide-react";
import Image from "next/image";

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

                    {/* Hero Image with 3D Effect */}
                    <div className="mt-20 relative animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-1000">
                        <div className="relative mx-auto max-w-5xl" style={{ perspective: '1500px' }}>
                            {/* Floating background blobs for depth */}
                            <div className="absolute -top-12 -left-12 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" style={{ transform: 'translateZ(-100px)' }} />
                            <div className="absolute -bottom-12 -right-12 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ transform: 'translateZ(-100px)', animationDelay: '1s' }} />

                            {/* Main image container with 3D transform */}
                            <div
                                className="relative transition-all duration-700 ease-out will-change-transform"
                                style={{
                                    transform: 'perspective(1500px) rotateY(15deg) rotateX(10deg) scale(0.95)',
                                    transformStyle: 'preserve-3d',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'perspective(3000px) rotateY(0deg) rotateX(0deg) scale(1)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'perspective(1500px) rotateY(15deg) rotateX(10deg) scale(0.95)';
                                }}
                                onMouseMove={(e) => {
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    const x = e.clientX - rect.left;
                                    const y = e.clientY - rect.top;
                                    const centerX = rect.width / 2;
                                    const centerY = rect.height / 2;
                                    const rotateX = ((y - centerY) / centerY) * -5;
                                    const rotateY = ((x - centerX) / centerX) * 5;
                                    e.currentTarget.style.transform = `perspective(3000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1)`;
                                }}
                            >
                                {/* Shadow/depth layer - positioned behind */}
                                <div
                                    className="absolute inset-0 bg-gradient-to-b from-primary/10 via-primary/5 to-transparent rounded-2xl blur-3xl opacity-70"
                                    style={{
                                        transform: 'translateZ(-80px) scale(0.9)',
                                        transformStyle: 'preserve-3d',
                                    }}
                                />

                                {/* Secondary shadow for more depth */}
                                <div
                                    className="absolute inset-0 bg-primary/5 rounded-2xl blur-2xl"
                                    style={{
                                        transform: 'translateZ(-40px) scale(0.95)',
                                        transformStyle: 'preserve-3d',
                                    }}
                                />

                                {/* Image with border and glow */}
                                <div
                                    className="relative rounded-2xl border border-border/50 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm p-3 shadow-2xl"
                                    style={{
                                        transform: 'translateZ(20px)',
                                        transformStyle: 'preserve-3d',
                                        backfaceVisibility: 'hidden',
                                    }}
                                >
                                    <div className="relative overflow-hidden rounded-xl ring-1 ring-primary/20 shadow-inner">
                                        <Image
                                            src="/hero-image.png"
                                            alt="API Monitoring Dashboard"
                                            width={1200}
                                            height={800}
                                            className="w-full h-auto"
                                            priority
                                        />
                                        {/* Gradient overlay for polish */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-background/30 via-transparent to-primary/5 pointer-events-none" />
                                        {/* Subtle light reflection */}
                                        <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
