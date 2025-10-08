"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X, ChevronRight } from "lucide-react";

import Link from "next/link";
import { trpc } from "@/lib/trpc";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  link?: string;
}

export function OnboardingChecklist() {
  const [isVisible, setIsVisible] = useState(true);
  const [steps, setSteps] = useState<OnboardingStep[]>([
    {
      id: "create_endpoint",
      title: "Create your first endpoint",
      description: "Add an API endpoint to start monitoring",
      completed: false,
      link: "/app/collections",
    },
    {
      id: "setup_monitor",
      title: "Set up monitoring",
      description: "Configure monitoring checks for your endpoint",
      completed: false,
      link: "/app/monitoring",
    },
    {
      id: "configure_alerts",
      title: "Configure alerts",
      description: "Get notified when something goes wrong",
      completed: false,
      link: "/app/alerts",
    },
    {
      id: "invite_team",
      title: "Invite your team",
      description: "Collaborate with your teammates",
      completed: false,
      link: "/app/team",
    },
  ]);

  // Single query for all onboarding status - much faster!
  const { data: onboardingStatus, isLoading } = trpc.user.getOnboardingStatus.useQuery(
    undefined,
    { refetchOnMount: false, refetchOnWindowFocus: false }
  );

  useEffect(() => {
    if (!onboardingStatus) return;

    setSteps((prevSteps) => {
      const newSteps = [...prevSteps];

      // Check if user has created an endpoint
      if (onboardingStatus.hasEndpoints) {
        const endpointStep = newSteps.find((s) => s.id === "create_endpoint");
        if (endpointStep) endpointStep.completed = true;

        // Monitoring is auto-enabled with endpoints
        const monitorStep = newSteps.find((s) => s.id === "setup_monitor");
        if (monitorStep) monitorStep.completed = true;
      }

      // Check if notification channels are configured
      if (onboardingStatus.hasNotificationChannels) {
        const alertStep = newSteps.find((s) => s.id === "configure_alerts");
        if (alertStep) alertStep.completed = true;
      }

      // Check if team members invited
      if (onboardingStatus.hasTeamMembers) {
        const teamStep = newSteps.find((s) => s.id === "invite_team");
        if (teamStep) teamStep.completed = true;
      }

      return newSteps;
    });
  }, [onboardingStatus]);

  const completedCount = steps.filter((s) => s.completed).length;
  const totalSteps = steps.length;
  const isComplete = completedCount === totalSteps;

  // Hide checklist if dismissed or all complete
  if (!isVisible || isComplete) return null;

  // Don't show until data is loaded
  if (isLoading || !onboardingStatus) {
    return null;
  }

  return (
    <Card className="border-2 border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              Get Started with WatchAPI
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Complete these steps to get the most out of your monitoring
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => setIsVisible(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="mt-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <span className="font-medium">
              {completedCount} of {totalSteps} completed
            </span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-500"
              style={{ width: `${(completedCount / totalSteps) * 100}%` }}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 pb-4">
        {steps.map((step, index) => {
          const content = (
            <>
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full flex-shrink-0 ${
                  step.completed
                    ? "bg-green-600 text-white"
                    : "bg-muted text-muted-foreground group-hover:bg-primary/80 group-hover:text-primary-foreground transition-colors"
                }`}
              >
                {step.completed ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <span className="text-xs font-medium">{index + 1}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-medium ${
                    step.completed
                      ? "line-through text-muted-foreground"
                      : "text-foreground"
                  }`}
                >
                  {step.title}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {step.description}
                </p>
              </div>
              {!step.completed && step.link && (
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
              )}
            </>
          );

          const baseClasses = `flex items-center gap-3 p-3 rounded-lg transition-all ${
            step.completed
              ? "bg-green-500/10 border border-green-500/20"
              : "bg-card hover:bg-muted/50 border border-border cursor-pointer group"
          }`;

          return !step.completed && step.link ? (
            <Link key={step.id} href={step.link} className={baseClasses}>
              {content}
            </Link>
          ) : (
            <div key={step.id} className={baseClasses}>
              {content}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
