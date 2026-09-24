import mongoose from "mongoose";
import { app } from "./app";
import { env } from "./config/env";
import { RefreshToken } from "./models/RefreshToken";
import { logger } from "./utils/logger";

const start = async (): Promise<void> => {
  await mongoose.connect(env.MONGODB_URI);
  await RefreshToken.createIndexes();
  app.listen(env.PORT, () => {
    logger.info("Auth Service listening", { port: env.PORT });
  });
};

start().catch((error: unknown) => {
  logger.error("Auth Service startup failed", { error });
  process.exit(1);
});

process.on("unhandledRejection", (error) => logger.error("Unhandled promise rejection", { error }));
process.on("uncaughtException", (error) => { logger.error("Uncaught exception", { error }); process.exit(1); });
