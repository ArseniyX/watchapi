import { router, publicProcedure } from "../../trpc";
import { AuthService } from "./auth.service";
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  verifyTokenSchema,
  oauthCallbackSchema,
} from "./auth.schema";

export const createAuthRouter = (authService: AuthService) =>
  router({
    register: publicProcedure
      .input(registerSchema)
      .mutation(async ({ input }) => {
        const result = await authService.register(input);
        return {
          user: {
            id: result.user.id,
            email: result.user.email,
            name: result.user.name,
            role: result.user.role,
          },
          tokens: result.tokens,
        };
      }),

    login: publicProcedure.input(loginSchema).mutation(async ({ input }) => {
      const result = await authService.login(input);
      return {
        user: {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
          role: result.user.role,
        },
        tokens: result.tokens,
      };
    }),

    refreshToken: publicProcedure
      .input(refreshTokenSchema)
      .mutation(async ({ input }) => {
        return authService.refreshToken(input.refreshToken);
      }),

    verifyToken: publicProcedure
      .input(verifyTokenSchema)
      .query(async ({ input }) => {
        const user = await authService.verifyToken(input.token);
        if (!user) {
          return null;
        }
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      }),

    oauthCallback: publicProcedure
      .input(oauthCallbackSchema)
      .mutation(async ({ input }) => {
        const result = await authService.authenticateWithOAuth(
          {
            ...input.profile,
            provider: input.provider,
          },
          input.invitationToken,
        );
        return {
          user: {
            id: result.user.id,
            email: result.user.email,
            name: result.user.name,
            role: result.user.role,
            avatar: result.user.avatar,
          },
          tokens: result.tokens,
          isNewUser: result.isNewUser,
        };
      }),
  });
