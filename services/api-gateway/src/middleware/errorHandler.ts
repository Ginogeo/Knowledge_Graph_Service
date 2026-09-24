import type { ErrorRequestHandler } from "express";
import { logger } from "../utils/logger";

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  logger.error("Unhandled gateway error", { error });
  response.status(500).json({ error: { code: "INTERNAL_SERVER_ERROR", message: "An unexpected error occurred." } });
};
