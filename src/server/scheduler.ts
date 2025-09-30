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
                const thirtyDaysAgo = new Date(
                    Date.now() - 30 * 24 * 60 * 60 * 1000
                );
                await modules.monitoring.repository.deleteOldChecks(
                    thirtyDaysAgo
                );
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

export const scheduler = new MonitoringScheduler();

// Auto-start scheduler in production
if (process.env.ENABLE_CRON === "true") {
    scheduler.start();
}
