import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(4001),
  MONGODB_URI: z.string().min(1),
  JWT_SECRET: z.string().min(1),
  ACCESS_TOKEN_TTL_SECONDS: z.coerce.number().int().positive().default(900),
  REFRESH_TOKEN_TTL_SECONDS: z.coerce.number().int().positive().default(604800),
  BCRYPT_SALT_ROUNDS: z.coerce.number().int().positive().default(12),
  INTERNAL_SERVICE_KEY: z.string().min(1)
});

export const env = envSchema.parse(process.env);
