import { TRPCError } from "@trpc/server";

/**
 * Base class for all custom application errors
 * Extends Error to maintain stack traces and instanceof checks
 */
export abstract class AppError extends Error {
    abstract readonly statusCode: number;
    abstract readonly code: string;

    constructor(message: string) {
        super(message);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }

    /**
     * Convert to tRPC error for API responses
     */
    toTRPCError(): TRPCError {
        return new TRPCError({
            code: this.getTRPCCode(),
            message: this.message,
        });
    }

    abstract getTRPCCode(): TRPCError["code"];
}

/**
 * 400 - Bad Request
 * Used for invalid input that passes Zod validation but fails business rules
 */
export class BadRequestError extends AppError {
    readonly statusCode = 400;
    readonly code = "BAD_REQUEST";

    getTRPCCode(): TRPCError["code"] {
        return "BAD_REQUEST";
    }
}

/**
 * 401 - Unauthorized
 * Used for authentication failures (invalid credentials, missing token, etc.)
 */
export class UnauthorizedError extends AppError {
    readonly statusCode = 401;
    readonly code = "UNAUTHORIZED";

    getTRPCCode(): TRPCError["code"] {
        return "UNAUTHORIZED";
    }
}

/**
 * 403 - Forbidden
 * Used for authorization failures (valid user but insufficient permissions)
 */
export class ForbiddenError extends AppError {
    readonly statusCode = 403;
    readonly code = "FORBIDDEN";

    constructor(message = "You don't have permission to access this resource") {
        super(message);
    }

    getTRPCCode(): TRPCError["code"] {
        return "FORBIDDEN";
    }
}

/**
 * 404 - Not Found
 * Used when a requested resource doesn't exist
 */
export class NotFoundError extends AppError {
    readonly statusCode = 404;
    readonly code = "NOT_FOUND";

    constructor(resource: string, identifier?: string) {
        const message = identifier
            ? `${resource} with identifier '${identifier}' not found`
            : `${resource} not found`;
        super(message);
    }

    getTRPCCode(): TRPCError["code"] {
        return "NOT_FOUND";
    }
}

/**
 * 409 - Conflict
 * Used for resource conflicts (duplicate email, concurrent modification, etc.)
 */
export class ConflictError extends AppError {
    readonly statusCode = 409;
    readonly code = "CONFLICT";

    constructor(message: string) {
        super(message);
    }

    getTRPCCode(): TRPCError["code"] {
        return "CONFLICT";
    }
}

/**
 * 429 - Too Many Requests
 * Used for rate limiting and plan limit violations
 */
export class TooManyRequestsError extends AppError {
    readonly statusCode = 429;
    readonly code = "TOO_MANY_REQUESTS";

    constructor(message: string) {
        super(message);
    }

    getTRPCCode(): TRPCError["code"] {
        return "TOO_MANY_REQUESTS";
    }
}

/**
 * 500 - Internal Server Error
 * Used for unexpected errors that shouldn't happen
 */
export class InternalServerError extends AppError {
    readonly statusCode = 500;
    readonly code = "INTERNAL_SERVER_ERROR";

    constructor(message = "An unexpected error occurred") {
        super(message);
    }

    getTRPCCode(): TRPCError["code"] {
        return "INTERNAL_SERVER_ERROR";
    }
}

/**
 * Helper to check if an error is an AppError
 */
export function isAppError(error: unknown): error is AppError {
    return error instanceof AppError;
}

/**
 * Convert any error to a tRPC error
 * - AppError: Use custom error mapping
 * - TRPCError: Return as-is
 * - Other: Wrap in INTERNAL_SERVER_ERROR
 */
export function toTRPCError(error: unknown): TRPCError {
    if (error instanceof TRPCError) {
        return error;
    }

    if (isAppError(error)) {
        return error.toTRPCError();
    }

    // Unknown error - log it and return generic error
    console.error("Unexpected error:", error);
    return new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "An unexpected error occurred",
    });
}
