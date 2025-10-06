import { router, protectedProcedure } from "../../trpc";
import { CliService } from "./cli.service";
import { CliRepository } from "./cli.repository";
import { getCollectionForCliSchema, submitCliReportSchema } from "./cli.schema";
import { prisma } from "../../database";

const cliRepository = new CliRepository(prisma);
const cliService = new CliService(cliRepository);

export const cliRouter = router({
  getCollection: protectedProcedure
    .input(getCollectionForCliSchema)
    .query(async ({ input, ctx }) => {
      if (!ctx.organizationId) {
        throw new Error("Organization ID is required");
      }
      return cliService.getCollectionForCli(input, ctx.organizationId);
    }),

  submitReport: protectedProcedure
    .input(submitCliReportSchema)
    .mutation(async ({ input, ctx }) => {
      if (!ctx.organizationId) {
        throw new Error("Organization ID is required");
      }
      return cliService.submitCliReport(input, ctx.user.id, ctx.organizationId);
    }),
});
