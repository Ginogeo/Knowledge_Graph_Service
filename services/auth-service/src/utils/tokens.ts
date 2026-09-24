import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { RefreshToken } from "../models/RefreshToken";

type AccessTokenClaims = {
  sub: string;
  email: string;
  role: "user" | "admin";
};

export const signAccessToken = (claims: AccessTokenClaims): string =>
  jwt.sign(claims, env.JWT_SECRET, { algorithm: "HS256", expiresIn: env.ACCESS_TOKEN_TTL_SECONDS });

export const createRefreshToken = async (userId: string): Promise<string> => {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + env.REFRESH_TOKEN_TTL_SECONDS * 1000);

  await RefreshToken.create({
    userId,
    tokenHash: hashRefreshToken(rawToken),
    expiresAt,
    revoked: false
  });

  return rawToken;
};

export const hashRefreshToken = (token: string): string =>
  crypto.createHash("sha256").update(token).digest("hex");
