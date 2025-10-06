import { NotFoundError } from "../../errors/custom-errors";
import { CliRepository } from "./cli.repository";
import type { GetCollectionForCliInput, SubmitCliReportInput, CliCheckResult } from "./cli.schema";

export class CliService {
  constructor(private cliRepository: CliRepository) {}

  async getCollectionForCli(input: GetCollectionForCliInput, organizationId: string) {
    const collection = await this.cliRepository.getCollectionWithEndpoints(
      input.collectionId,
      organizationId
    );

    if (!collection) {
      throw new NotFoundError("Collection", input.collectionId);
    }

    // Transform to CLI format
    return {
      id: collection.id,
      name: collection.name,
      endpoints: collection.apiEndpoints.map((endpoint) => ({
        id: endpoint.id,
        name: endpoint.name,
        url: endpoint.url,
        method: endpoint.method,
        headers: (typeof endpoint.headers === 'object' && endpoint.headers !== null
          ? endpoint.headers as Record<string, string>
          : undefined),
        body: endpoint.body ?? undefined,
        expectedStatus: endpoint.expectedStatus ?? 200,
        maxResponseTime: endpoint.timeout ?? undefined,
      })),
    };
  }

  async submitCliReport(input: SubmitCliReportInput, userId: string, _organizationId: string) {
    // Convert CLI results to database format
    const dbResults = input.results.map((result) => ({
      endpointId: result.endpointId,
      status: this.mapCliStatusToDbStatus(result.status),
      responseTime: result.responseTime,
      statusCode: result.actualStatus,
      errorMessage: result.error,
    }));

    // Store checks in database
    await this.cliRepository.createCliCheckBatch(
      {
        collectionId: input.collectionId,
        environment: input.environment,
        results: dbResults,
      },
      userId,
    );

    // Detect regressions by comparing with recent checks
    const regressions = await this.detectRegressions(input.results);

    return {
      success: true,
      regressions,
    };
  }

  private mapCliStatusToDbStatus(
    cliStatus: "PASSED" | "FAILED" | "ERROR"
  ): "SUCCESS" | "FAILURE" | "ERROR" {
    if (cliStatus === "PASSED") return "SUCCESS";
    if (cliStatus === "FAILED") return "FAILURE";
    return "ERROR";
  }

  private async detectRegressions(results: CliCheckResult[]): Promise<string[]> {
    const regressions: string[] = [];

    for (const result of results) {
      // Get recent checks for this endpoint
      const recentChecks = await this.cliRepository.getRecentChecksForEndpoint(
        result.endpointId,
        10
      );

      if (recentChecks.length === 0) {
        // No historical data, skip regression detection
        continue;
      }

      // Check if this is a regression
      const previouslyPassing = recentChecks.slice(0, 3).every((check) => check.status === "SUCCESS");

      if (previouslyPassing && result.status !== "PASSED") {
        regressions.push(
          `Endpoint ${result.endpointId}: was passing in last 3 checks, now ${result.status}`
        );
      }

      // Check for performance regression (response time > 2x average)
      if (result.status === "PASSED" && recentChecks.length >= 3) {
        const avgResponseTime =
          recentChecks.slice(0, 5).reduce((sum, check) => sum + check.responseTime, 0) /
          Math.min(5, recentChecks.length);

        if (result.responseTime > avgResponseTime * 2) {
          regressions.push(
            `Endpoint ${result.endpointId}: response time ${result.responseTime}ms is 2x slower than average ${Math.round(avgResponseTime)}ms`
          );
        }
      }
    }

    return regressions;
  }
}
