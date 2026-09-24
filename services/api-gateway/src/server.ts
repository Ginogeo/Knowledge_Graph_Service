import { createServer } from "node:http";
import { app } from "./app";
import { env } from "./config/env";
import { handleQuestionsUpgrade } from "./ws/questionsProxy";
import { logger } from "./utils/logger";

const server = createServer(app);
handleQuestionsUpgrade(server);
server.listen(env.PORT, () => {
  logger.info("API Gateway listening", { port: env.PORT });
});

process.on("unhandledRejection", (error) => logger.error("Unhandled promise rejection", { error }));
process.on("uncaughtException", (error) => { logger.error("Uncaught exception", { error }); process.exit(1); });
