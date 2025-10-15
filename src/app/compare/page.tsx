import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { plans as basePlans } from "@/lib/plans";
import { Check, X } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compare API Testing & Monitoring Tools - WatchAPI vs Alternatives",
  description:
    "Compare WatchAPI with Postman, Insomnia, UptimeRobot, and other API testing and monitoring tools. See pricing, features, and use cases.",
};

export default function ComparePage() {
  const starterPlan = basePlans.find((plan) => plan.name === "Starter");
  const proPlan = basePlans.find((plan) => plan.name === "Pro");

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl mb-6">
              Compare API Testing & Monitoring Tools
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Choosing the right tool for your team? Here's an honest comparison
              of WatchAPI with popular alternatives.
            </p>
          </div>

          {/* Pricing Comparison */}
          <section className="mb-20">
            <h2 className="text-3xl font-bold mb-8">Pricing Comparison</h2>
            <p className="text-muted-foreground mb-8">
              Based on a team of 10 developers (as of 2024)
            </p>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Tool</TableHead>
                    <TableHead>Pricing Model</TableHead>
                    <TableHead>10 Users Cost</TableHead>
                    <TableHead>25 Users Cost</TableHead>
                    <TableHead>Key Features</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow className="bg-primary/5">
                    <TableCell className="font-bold">WatchAPI</TableCell>
                    <TableCell>Flat rate</TableCell>
                    <TableCell className="font-semibold text-green-600 dark:text-green-400">
                      {starterPlan?.price
                        ? `${starterPlan.price}/month`
                        : "See pricing"}
                    </TableCell>
                    <TableCell className="font-semibold text-green-600 dark:text-green-400">
                      {proPlan?.price
                        ? `${proPlan.price}/month`
                        : "See pricing"}
                    </TableCell>
                    <TableCell>Testing + Monitoring</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Postman Basic</TableCell>
                    <TableCell>$19/user/month</TableCell>
                    <TableCell>$190/month</TableCell>
                    <TableCell>$475/month</TableCell>
                    <TableCell>API Testing</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">
                      Postman Professional
                    </TableCell>
                    <TableCell>$39/user/month</TableCell>
                    <TableCell>$390/month</TableCell>
                    <TableCell>$975/month</TableCell>
                    <TableCell>Advanced Collaboration</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">UptimeRobot Pro</TableCell>
                    <TableCell>By monitors</TableCell>
                    <TableCell>$70/month (50 monitors)</TableCell>
                    <TableCell>N/A</TableCell>
                    <TableCell>Monitoring Only</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Insomnia</TableCell>
                    <TableCell>$5/user/month</TableCell>
                    <TableCell>$50/month</TableCell>
                    <TableCell>$125/month</TableCell>
                    <TableCell>API Testing (No Monitoring)</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </section>

          {/* Feature Comparison */}
          <section className="mb-20">
            <h2 className="text-3xl font-bold mb-8">Feature Comparison</h2>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[250px]">Feature</TableHead>
                    <TableHead className="text-center">WatchAPI</TableHead>
                    <TableHead className="text-center">Postman</TableHead>
                    <TableHead className="text-center">UptimeRobot</TableHead>
                    <TableHead className="text-center">Insomnia</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">
                      API Request Builder
                    </TableCell>
                    <TableCell className="text-center">
                      <Check className="inline h-5 w-5 text-green-600" />
                    </TableCell>
                    <TableCell className="text-center">
                      <Check className="inline h-5 w-5 text-green-600" />
                    </TableCell>
                    <TableCell className="text-center">
                      <X className="inline h-5 w-5 text-muted-foreground" />
                    </TableCell>
                    <TableCell className="text-center">
                      <Check className="inline h-5 w-5 text-green-600" />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">
                      Continuous Monitoring
                    </TableCell>
                    <TableCell className="text-center">
                      <Check className="inline h-5 w-5 text-green-600" />
                    </TableCell>
                    <TableCell className="text-center text-xs">
                      Limited (10K/mo)
                    </TableCell>
                    <TableCell className="text-center">
                      <Check className="inline h-5 w-5 text-green-600" />
                    </TableCell>
                    <TableCell className="text-center">
                      <X className="inline h-5 w-5 text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">
                      Real-time Alerts
                    </TableCell>
                    <TableCell className="text-center">
                      <Check className="inline h-5 w-5 text-green-600" />
                    </TableCell>
                    <TableCell className="text-center">
                      <X className="inline h-5 w-5 text-muted-foreground" />
                    </TableCell>
                    <TableCell className="text-center">
                      <Check className="inline h-5 w-5 text-green-600" />
                    </TableCell>
                    <TableCell className="text-center">
                      <X className="inline h-5 w-5 text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">
                      Team Collaboration
                    </TableCell>
                    <TableCell className="text-center">
                      <Check className="inline h-5 w-5 text-green-600" />
                    </TableCell>
                    <TableCell className="text-center">
                      <Check className="inline h-5 w-5 text-green-600" />
                    </TableCell>
                    <TableCell className="text-center">
                      <Check className="inline h-5 w-5 text-green-600" />
                    </TableCell>
                    <TableCell className="text-center">
                      <Check className="inline h-5 w-5 text-green-600" />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">
                      Performance Analytics
                    </TableCell>
                    <TableCell className="text-center">
                      <Check className="inline h-5 w-5 text-green-600" />
                    </TableCell>
                    <TableCell className="text-center">
                      <X className="inline h-5 w-5 text-muted-foreground" />
                    </TableCell>
                    <TableCell className="text-center">
                      <Check className="inline h-5 w-5 text-green-600" />
                    </TableCell>
                    <TableCell className="text-center">
                      <X className="inline h-5 w-5 text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">
                      Uptime Tracking
                    </TableCell>
                    <TableCell className="text-center">
                      <Check className="inline h-5 w-5 text-green-600" />
                    </TableCell>
                    <TableCell className="text-center">
                      <X className="inline h-5 w-5 text-muted-foreground" />
                    </TableCell>
                    <TableCell className="text-center">
                      <Check className="inline h-5 w-5 text-green-600" />
                    </TableCell>
                    <TableCell className="text-center">
                      <X className="inline h-5 w-5 text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Flat Pricing</TableCell>
                    <TableCell className="text-center">
                      <Check className="inline h-5 w-5 text-green-600" />
                    </TableCell>
                    <TableCell className="text-center">
                      <X className="inline h-5 w-5 text-muted-foreground" />
                    </TableCell>
                    <TableCell className="text-center">
                      <Check className="inline h-5 w-5 text-green-600" />
                    </TableCell>
                    <TableCell className="text-center">
                      <X className="inline h-5 w-5 text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </section>

          {/* Use Cases */}
          <section className="mb-20">
            <h2 className="text-3xl font-bold mb-8">Which Tool Is Right For You?</h2>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="border rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">Choose WatchAPI if:</h3>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>
                      You need both API testing and continuous monitoring
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>You want flat pricing without per-user fees</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>
                      You're a small-medium team (3-25 developers)
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>
                      You want to replace 2+ tools (testing + monitoring)
                    </span>
                  </li>
                </ul>
              </div>

              <div className="border rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">Choose Postman if:</h3>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>
                      You need advanced API development features (mocking, code
                      generation)
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>You have a large organization (100+ users)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>You need SSO and enterprise compliance</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>
                      Monitoring is not a primary requirement
                    </span>
                  </li>
                </ul>
              </div>

              <div className="border rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">
                  Choose UptimeRobot if:
                </h3>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>
                      You only need uptime monitoring (no API testing)
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>
                      You're monitoring simple endpoints (no complex APIs)
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>You need a very generous free tier (50 monitors)</span>
                  </li>
                </ul>
              </div>

              <div className="border rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">Choose Insomnia if:</h3>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>
                      You want a simple, lightweight API testing tool
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>You prefer open-source solutions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>
                      You don't need monitoring or team collaboration
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="text-center bg-primary/5 rounded-2xl p-12">
            <h2 className="text-3xl font-bold mb-4">
              Ready to try WatchAPI?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Start with our free plan. No credit card required. Upgrade when you
              need more.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg">Start Free</Button>
              </Link>
              <Link href="/#pricing">
                <Button size="lg" variant="outline">
                  View Pricing
                </Button>
              </Link>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
