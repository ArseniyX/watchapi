import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/server/database";

export default async function handler(
    _req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        // Check database connection
        await prisma.$queryRaw`SELECT 1`;

        return res.status(200).json({
            status: "ok",
            timestamp: new Date().toISOString(),
            database: "connected",
        });
    } catch (error) {
        console.error("Health check failed:", error);
        return res.status(503).json({
            status: "error",
            timestamp: new Date().toISOString(),
            database: "disconnected",
        });
    }
}
