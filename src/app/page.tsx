import { Hero } from "@/components/hero";
import { Features } from "@/components/features";
import { Pricing } from "@/components/pricing";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "API Monitoring & Uptime Tracking for Development Teams",
  description:
    "Monitor your APIs with real-time uptime tracking, performance analytics, and instant alerts. Affordable alternative to Postman and DataDog for small teams. Start free with 5 endpoints.",
  openGraph: {
    title: "WatchAPI - Lightweight API Monitoring & Uptime Tracking",
    description:
      "Monitor your APIs with real-time uptime tracking, performance analytics, and instant alerts. Affordable alternative to Postman and DataDog for small teams.",
  },
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <Features />
        <Pricing />
      </main>
      <Footer />
    </div>
  );
}
