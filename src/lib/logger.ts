import winston from "winston";

const { combine, timestamp, printf, colorize, errors } = winston.format;

// Custom log format
const logFormat = printf(
  ({ level, message, timestamp, stack, ...metadata }) => {
    let log = `${timestamp} [${level}]: ${message}`;

    // Add stack trace for errors
    if (stack) {
      log += `\n${stack}`;
    }

    // Add metadata if present (single-line JSON for log aggregators)
    if (Object.keys(metadata).length > 0) {
      log += ` ${JSON.stringify(metadata)}`;
    }

    return log;
  },
);

// Create Winston logger instance
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: combine(
    errors({ stack: true }), // Capture stack traces
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    logFormat,
  ),
  transports: [
    // Console transport for all environments
    new winston.transports.Console({
      format: combine(
        colorize(), // Colorize console output
        timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        logFormat,
      ),
    }),
  ],
});

// Note: File transports removed for production compatibility.
// In containerized/serverless environments, console output is captured by logging systems.
// If you need file logging, ensure the deployment environment has write permissions
// or configure a writable directory like /tmp/logs

// Helper functions for structured logging
export const logError = (
  message: string,
  error: unknown,
  metadata?: Record<string, unknown>,
) => {
  logger.error(message, {
    error:
      error instanceof Error
        ? {
            message: error.message,
            stack: error.stack,
            name: error.name,
          }
        : error,
    ...metadata,
  });
};

export const logInfo = (
  message: string,
  metadata?: Record<string, unknown>,
) => {
  logger.info(message, metadata);
};

export const logWarn = (
  message: string,
  metadata?: Record<string, unknown>,
) => {
  logger.warn(message, metadata);
};

export const logDebug = (
  message: string,
  metadata?: Record<string, unknown>,
) => {
  logger.debug(message, metadata);
};

// Log request/response for monitoring
export const logRequest = (
  method: string,
  url: string,
  userId?: string,
  metadata?: Record<string, unknown>,
) => {
  logger.info(`${method} ${url}`, {
    userId,
    type: "request",
    ...metadata,
  });
};

export const logResponse = (
  method: string,
  url: string,
  statusCode: number,
  duration: number,
  metadata?: Record<string, unknown>,
) => {
  logger.info(`${method} ${url} - ${statusCode}`, {
    statusCode,
    duration,
    type: "response",
    ...metadata,
  });
};
