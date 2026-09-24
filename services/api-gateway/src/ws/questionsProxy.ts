import type { IncomingMessage, Server } from "node:http";
import type { Socket } from "node:net";
import { createProxyMiddleware } from "http-proxy-middleware";
import { env } from "../config/env";
import { verifyAccessToken } from "../middleware/verifyJwt";
import { checkWebsocketRateLimit } from "../middleware/rateLimit";
import { logger } from "../utils/logger";

const proxy = createProxyMiddleware({
  target: env.RAG_SERVICE_URL,
  ws: true,
  changeOrigin: true,
  pathRewrite: { "^/ws/questions": "/ws/questions" },
  on: {
    proxyReqWs: (proxyReq, request) => {
      const user = (request as IncomingMessage & { user?: { id: string; email: string; role: "user" | "admin" } }).user;
      if (!user) {
        return;
      }
      proxyReq.setHeader("X-User-Id", user.id);
      proxyReq.setHeader("X-User-Email", user.email);
      proxyReq.setHeader("X-User-Role", user.role);
      proxyReq.setHeader("X-Internal-Key", env.INTERNAL_SERVICE_KEY);
    },
    error: (error, _request, socket) => {
      logger.error("WebSocket proxy failed", { error });
      socket.end();
    }
  }
});

export const handleQuestionsUpgrade = (server: Server): void => {
  server.on("upgrade", (request: IncomingMessage, socket: Socket, head: Buffer) => {
    const requestUrl = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);
    if (requestUrl.pathname !== "/ws/questions") {
      return;
    }

    const user = verifyAccessToken(requestUrl.searchParams.get("token"));
    if (!user) {
      logger.warn("Rejected WebSocket with invalid token");
      socket.write("HTTP/1.1 401 Unauthorized\r\nConnection: close\r\n\r\n");
      socket.destroy();
      return;
    }

    if (!checkWebsocketRateLimit(user.id)) {
      logger.warn("Rejected WebSocket rate limit", { userId: user.id });
      const body = JSON.stringify({
        error: {
          code: "RATE_LIMIT_EXCEEDED",
          message: "Too many requests. Please try again later."
        }
      });
      socket.write(`HTTP/1.1 429 Too Many Requests\r\nContent-Type: application/json\r\nContent-Length: ${Buffer.byteLength(body)}\r\nConnection: close\r\n\r\n${body}`);
      socket.destroy();
      return;
    }

    (request as IncomingMessage & { user?: typeof user }).user = user;
    proxy.upgrade(request, socket, head);
  });
};
