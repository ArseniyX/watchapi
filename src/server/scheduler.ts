import * as cron from "node-cron";
import { modules } from "./app";

class MonitoringScheduler {
  private jobs: Map<string, cron.ScheduledTask> = new Map();

  start() {
    // Run active monitoring checks every minute
    const mainJob = cron.schedule("* * * * *", async () => {
      try {
        console.log("Running scheduled monitoring checks...");
        await modules.monitoring.service.runActiveChecks();
      } catch (error) {
        console.error("Scheduled monitoring check failed:", error);
      }
    });

    this.jobs.set("main", mainJob);

    // Clean up old monitoring data every day at midnight
    const cleanupJob = cron.schedule("0 0 * * *", async () => {
      try {
        console.log("Running cleanup job...");
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        await modules.monitoring.repository.deleteOldChecks(thirtyDaysAgo);
        console.log("Cleanup job completed");
      } catch (error) {
        console.error("Cleanup job failed:", error);
      }
    });

    this.jobs.set("cleanup", cleanupJob);

    console.log("Monitoring scheduler started");
  }

  stop() {
    this.jobs.forEach((job) => {
      job.destroy();
    });
    this.jobs.clear();
    console.log("Monitoring scheduler stopped");
  }

  getStatus() {
    return {
      running: this.jobs.size > 0,
      jobs: Array.from(this.jobs.keys()),
    };
  }
}

// Singleton pattern to prevent multiple scheduler instances in dev mode
const SCHEDULER_KEY = Symbol.for("app.scheduler");
const globalSymbols = Object.getOwnPropertySymbols(global);
const hasScheduler = globalSymbols.indexOf(SCHEDULER_KEY) > -1;

let scheduler: MonitoringScheduler;

if (!hasScheduler) {
  scheduler = new MonitoringScheduler();
  (global as any)[SCHEDULER_KEY] = scheduler;
} else {
  scheduler = (global as any)[SCHEDULER_KEY];
}

export { scheduler };

// Auto-start scheduler in production (but not during tests)
if (
  // process.env.ENABLE_CRON === "true" &&
  // !hasScheduler &&
  // process.env.NODE_ENV !== "test" &&
  !process.env.VITEST
) {
  console.log("Starting monitoring scheduler...");
  scheduler.start();
}
