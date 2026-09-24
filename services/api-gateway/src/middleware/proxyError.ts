import type { IncomingMessage, ServerResponse } from "node:http";
import type { Socket } from "node:net";
import { logger } from "../utils/logger";

export const handleProxyError = (error: Error, request: IncomingMessage, response: ServerResponse | Socket): void => {
  logger.error("Upstream proxy failed", { error, method: request.method, path: request.url });
  if ("headersSent" in response && !response.headersSent) {
    response.statusCode = 503;
    response.setHeader("Content-Type", "application/json");
    response.end(JSON.stringify({
      error: {
        code: "UPSTREAM_UNAVAILABLE",
        message: "The requested service is unavailable."
      }
    }));
    return;
  }

  response.destroy();
};