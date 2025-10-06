import { z } from "zod";

export const getCollectionForCliSchema = z.object({
  collectionId: z.string(),
});

export const cliCheckResultSchema = z.object({
  endpointId: z.string(),
  status: z.enum(["PASSED", "FAILED", "ERROR"]),
  actualStatus: z.number().optional(),
  responseTime: z.number(),
  error: z.string().optional(),
  timestamp: z.string(),
  assertions: z
    .object({
      statusCode: z.boolean(),
      responseTime: z.boolean().optional(),
      bodyContains: z.boolean().optional(),
      bodySchema: z.boolean().optional(),
    })
    .optional(),
});

export const submitCliReportSchema = z.object({
  collectionId: z.string(),
  environment: z.string(),
  results: z.array(cliCheckResultSchema),
  summary: z.object({
    total: z.number(),
    passed: z.number(),
    failed: z.number(),
    errors: z.number(),
  }),
  timestamp: z.string(),
});

export type GetCollectionForCliInput = z.infer<typeof getCollectionForCliSchema>;
export type CliCheckResult = z.infer<typeof cliCheckResultSchema>;
export type SubmitCliReportInput = z.infer<typeof submitCliReportSchema>;
