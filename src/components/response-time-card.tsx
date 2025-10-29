"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DashboardChart } from "@/components/dashboard-chart";

export function ResponseTimeCard() {
  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Response Time Trends</CardTitle>
        <CardDescription>
          Average response times over the last 24 hours
        </CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        <DashboardChart />
      </CardContent>
    </Card>
  );
}
