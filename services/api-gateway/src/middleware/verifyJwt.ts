import jwt from "jsonwebtoken";
import type { RequestHandler } from "express";
import { env } from "../config/env";

declare global {
  namespace Express {
    interface Request {
      user?: { id: string; email: string; role: "user" | "admin" };
    }
  }
}

export const verifyAccessToken = (token: string | null) => {
  if (!token) return null;
  try {
    const payload = jwt.verify(token, env.JWT_SECRET, { algorithms: ["HS256"] });
    if (typeof payload === "string" || !payload.sub || typeof payload.email !== "string" || (payload.role !== "user" && payload.role !== "admin")) {
      return null;
    }
    return { id: payload.sub, email: payload.email, role: payload.role } as const;
  } catch {
    return null;
  }
};

export const verifyJwt: RequestHandler = (request, response, next) => {
  const authorization = request.header("Authorization");
  if (!authorization?.startsWith("Bearer ")) {
    response.status(401).json({ error: { code: "MISSING_TOKEN", message: "Access token is required." } });
    return;
  }

  try {
    const payload = jwt.verify(authorization.slice(7), env.JWT_SECRET, { algorithms: ["HS256"] });
    if (typeof payload === "string" || !payload.sub || typeof payload.email !== "string" || (payload.role !== "user" && payload.role !== "admin")) {
      throw new Error("Invalid claims");
    }
    request.user = { id: payload.sub, email: payload.email, role: payload.role };
    next();
  } catch (error) {
    const code = error instanceof jwt.TokenExpiredError ? "TOKEN_EXPIRED" : "INVALID_TOKEN";
    response.status(401).json({ error: { code, message: code === "TOKEN_EXPIRED" ? "Access token has expired." : "Access token is invalid." } });
  }
};
