import rateLimit from "express-rate-limit";
import type { RequestHandler } from "express";

const standardHandler = (_request: unknown, response: { status: (code: number) => { json: (body: unknown) => void } }) => {
  response.status(429).json({ error: { code: "RATE_LIMIT_EXCEEDED", message: "Too many requests. Please try again later." } });
};

export const loginRateLimit = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: true, legacyHeaders: false, handler: standardHandler });
export const documentRateLimit: RequestHandler = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 20,
  keyGenerator: (request) => request.user?.id ?? request.ip ?? "unknown",
  standardHeaders: true,
  legacyHeaders: false,
  handler: standardHandler
});

const websocketAttempts = new Map<string, { count: number; resetAt: number }>();

export const checkWebsocketRateLimit = (key: string): boolean => {
  const now = Date.now();
  const current = websocketAttempts.get(key);

  if (!current || current.resetAt <= now) {
    websocketAttempts.set(key, { count: 1, resetAt: now + 60 * 60 * 1000 });
    return true;
  }

  if (current.count >= 60) {
    return false;
  }

  current.count += 1;
  return true;
};
