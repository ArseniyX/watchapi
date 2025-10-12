import { router, publicProcedure } from "../../trpc";
import { contactService } from "./contact.service";
import { sendContactMessageSchema } from "./contact.schema";
import { TRPCError } from "@trpc/server";

export const contactRouter = router({
  sendMessage: publicProcedure
    .input(sendContactMessageSchema)
    .mutation(async ({ input }) => {
      const success = await contactService.sendContactMessage({ input });

      if (!success) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to send contact message. Please try again later.",
        });
      }

      return { success: true };
    }),
});
