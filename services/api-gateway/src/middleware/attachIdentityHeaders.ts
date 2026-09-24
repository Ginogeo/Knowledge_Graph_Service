import type { RequestHandler } from "express";
import { env } from "../config/env";

export const attachIdentityHeaders: RequestHandler = (request, _response, next) => {
  request.headers["x-internal-key"] = env.INTERNAL_SERVICE_KEY;
  if (request.user) {
    request.headers["x-user-id"] = request.user.id;
    request.headers["x-user-email"] = request.user.email;
    request.headers["x-user-role"] = request.user.role;
  }
  next();
};
