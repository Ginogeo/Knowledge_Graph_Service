import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(4000),
  JWT_SECRET: z.string().min(1),
  AUTH_SERVICE_URL: z.string().url(),
  RAG_SERVICE_URL: z.string().url(),
  INTERNAL_SERVICE_KEY: z.string().min(1),
  CORS_ORIGIN: z.string().url()
});

export const env = envSchema.parse(process.env);
