import type { RequestHandler } from "express";
import { env } from "../config/env";

export const requireInternalKey: RequestHandler = (request, response, next) => {
  if (request.header("X-Internal-Key") !== env.INTERNAL_SERVICE_KEY) {
    response.status(401).json({
      error: {
        code: "FORBIDDEN_DIRECT_ACCESS",
        message: "Direct access is not allowed."
      }
    });
    return;
  }

  next();
};
