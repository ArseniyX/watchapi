"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard } from "lucide-react";
import { trpc } from "@/lib/trpc";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { plans } from "@/lib/plans";
import { DashboardHeader } from "@/components/dashboard-header";

export default function BillingPage() {
  const [comingSoonOpen, setComingSoonOpen] = useState(false);
  const { data: organizations } =
    trpc.organization.getMyOrganizations.useQuery();

  // Get current organization (first one for now)
  const currentOrg = organizations?.[0];
  const currentPlan = currentOrg?.plan || "FREE";

  const handleUpgrade = () => {
    setComingSoonOpen(true);
  };

  return (
    <div className="h-full overflow-auto">
      <div className="container max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <DashboardHeader
          title="Billing & Subscription"
          description="Manage your subscription and billing information"
        >
          <p className="mt-3 text-sm font-medium text-primary">
            🚀 <strong>Beta pricing:</strong> Early adopters get up to 70% off
            and keep these prices for life.
          </p>
        </DashboardHeader>

        {/* Current Plan Overview */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Current Plan</CardTitle>
                <CardDescription>
                  You are currently on the {currentPlan} plan
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-lg px-4 py-1">
                {currentPlan}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <CreditCard className="h-4 w-4" />
              <span className="text-sm">
                {currentPlan === "FREE"
                  ? "No payment method required"
                  : "Next billing date: Coming soon"}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Available Plans */}
        <div>
          <h2 className="text-2xl font-bold mb-8">Available Plans</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => {
              const isCurrent =
                plan.priceId.toUpperCase() === currentPlan.toUpperCase();

              return (
                <Card
                  key={plan.name}
                  className={
                    plan.popular
                      ? "border-primary shadow-lg relative flex flex-col"
                      : isCurrent
                      ? "border-green-500 flex flex-col"
                      : "flex flex-col"
                  }
                >
                  {plan.popular && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                      Most Popular
                    </Badge>
                  )}
                  <CardHeader>
                    <CardTitle>{plan.name}</CardTitle>
                    <div className="mt-4">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      {plan.price !== "Custom" && (
                        <span className="text-muted-foreground">/month</span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-col flex-1">
                    <ul className="space-y-3 flex-1">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <feature.icon className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">
                            {feature.text}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      className="w-full mt-6"
                      variant={isCurrent ? "outline" : "default"}
                      disabled={isCurrent}
                      onClick={handleUpgrade}
                    >
                      {isCurrent
                        ? "Current Plan"
                        : plan.name === "Enterprise"
                        ? "Contact Sales"
                        : "Upgrade"}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Coming Soon Dialog */}
        <Dialog open={comingSoonOpen} onOpenChange={setComingSoonOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Coming Soon</DialogTitle>
              <DialogDescription className="space-y-4 pt-4">
                <p>
                  We're working hard to bring you seamless subscription
                  management and billing features.
                </p>
                <p>
                  In the meantime, if you'd like to upgrade your plan, please
                  contact us at{" "}
                  <a
                    href="mailto:billing@watchapi.dev"
                    className="text-primary hover:underline"
                  >
                    billing@watchapi.dev
                  </a>
                </p>
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => setComingSoonOpen(false)}
              >
                Close
              </Button>
              <Button asChild>
                <a href="mailto:billing@watchapi.dev">Contact Us</a>
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
