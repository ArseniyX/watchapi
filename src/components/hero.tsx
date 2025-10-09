"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Activity } from "lucide-react";
import Image from "next/image";

export function Hero() {
  return (
    <section className="relative py-20 sm:py-32 overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.primary.100),white)] dark:bg-[radial-gradient(45rem_50rem_at_top,theme(colors.primary.950),theme(colors.background))] opacity-20 animate-in fade-in duration-1000" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl text-center">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm animate-in fade-in slide-in-from-top-4 duration-700">
            <Activity className="h-3.5 w-3.5 text-primary animate-pulse" />
            <span className="text-primary font-medium">
              Real-time API Monitoring
            </span>
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl text-balance animate-in fade-in slide-in-from-top-6 duration-700 delay-100">
            Simple API Monitoring for Development Teams
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground text-pretty max-w-2xl mx-auto animate-in fade-in slide-in-from-top-8 duration-700 delay-200">
            Monitor your APIs 24/7. Get instant alerts when things break. Track
            uptime and performance. No complexity, no enterprise pricing.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6 animate-in fade-in zoom-in-50 duration-700 delay-300">
            <Link href="/signup">
              <Button
                size="lg"
                className="px-8 group"
                data-umami-event="cta-start-free"
              >
                Start Monitoring Free
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="#pricing">
              <Button
                variant="outline"
                size="lg"
                className="px-8"
                data-umami-event="cta-view-pricing"
              >
                View Pricing
              </Button>
            </Link>
          </div>

          {/* Hero Image with 3D Effect */}
          <div className="mt-16 relative">
            <div
              className="relative mx-auto max-w-6xl"
              style={{ perspective: "2000px" }}
            >
              {/* Floating background blobs for depth */}
              <div
                className="absolute -top-12 -left-12 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
                style={{ transform: "translateZ(-100px)" }}
              />
              <div
                className="absolute -bottom-12 -right-12 w-96 h-96 bg-primary/5 rounded-full blur-3xl"
                style={{ transform: "translateZ(-100px)" }}
              />

              {/* Main image container with 3D transform */}
              <div
                className="relative"
                style={{
                  transform:
                    "perspective(2000px) rotateY(8deg) rotateX(6deg) scale(1.05)",
                  transformStyle: "preserve-3d",
                }}
              >
                {/* Shadow/depth layer - positioned behind */}
                <div
                  className="absolute inset-0 bg-gradient-to-b from-primary/10 via-primary/5 to-transparent rounded-2xl blur-3xl opacity-70"
                  style={{
                    transform: "translateZ(-80px) scale(0.9)",
                    transformStyle: "preserve-3d",
                  }}
                />

                {/* Secondary shadow for more depth */}
                <div
                  className="absolute inset-0 bg-primary/5 rounded-2xl blur-2xl"
                  style={{
                    transform: "translateZ(-40px) scale(0.95)",
                    transformStyle: "preserve-3d",
                  }}
                />

                {/* Image with border and glow */}
                <div
                  className="relative rounded-2xl border border-border/50 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm p-3 shadow-2xl"
                  style={{
                    transform: "translateZ(20px)",
                    transformStyle: "preserve-3d",
                    backfaceVisibility: "hidden",
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

                    {/* Floating Stats Tooltips */}
                    {/* Top Right - Uptime */}
                    <div
                      className="absolute top-8 right-8 bg-white dark:bg-zinc-900 backdrop-blur-md border-2 border-green-500/30 dark:border-green-500/50 rounded-xl p-4 shadow-[0_8px_30px_rgb(0,0,0,0.3)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.6)] ring-1 ring-green-500/10"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/20 ring-2 ring-green-500/40">
                          <svg
                            className="h-5 w-5 text-green-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-foreground">
                            99.9%
                          </div>
                          <div className="text-xs text-muted-foreground font-medium">
                            Uptime
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Left - Response Time */}
                    <div
                      className="absolute bottom-8 left-8 bg-white dark:bg-zinc-900 backdrop-blur-md border-2 border-blue-500/30 dark:border-blue-500/50 rounded-xl p-4 shadow-[0_8px_30px_rgb(0,0,0,0.3)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.6)] ring-1 ring-blue-500/10"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/20 ring-2 ring-blue-500/40">
                          <svg
                            className="h-5 w-5 text-blue-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 10V3L4 14h7v7l9-11h-7z"
                            />
                          </svg>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-foreground">
                            &lt;50ms
                          </div>
                          <div className="text-xs text-muted-foreground font-medium">
                            Response
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Right - 24/7 Monitoring */}
                    <div
                      className="absolute bottom-8 right-8 bg-white dark:bg-zinc-900 backdrop-blur-md border-2 border-primary/30 dark:border-primary/50 rounded-xl p-4 shadow-[0_8px_30px_rgb(0,0,0,0.3)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.6)] ring-1 ring-primary/10"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20 ring-2 ring-primary/40">
                          <Activity className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-foreground">
                            24/7
                          </div>
                          <div className="text-xs text-muted-foreground font-medium">
                            Monitoring
                          </div>
                        </div>
                      </div>
                    </div>
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
