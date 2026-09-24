import cors from "cors";
import express from "express";
import helmet from "helmet";
import { env } from "./config/env";
import { errorHandler } from "./middleware/errorHandler";
import { authRoutes } from "./routes/authRoutes";
import { conversationRoutes } from "./routes/conversationRoutes";
import { documentRoutes } from "./routes/documentRoutes";
import { logger } from "./utils/logger";

const app = express();
app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN }));
app.use(express.json());
app.use((request, response, next) => {
	const started = Date.now();
	response.on("finish", () => logger.info("HTTP request", { method: request.method, path: request.path, statusCode: response.statusCode, durationMs: Date.now() - started }));
	next();
});
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/documents", documentRoutes);
app.use("/api/v1/conversations", conversationRoutes);
app.use(errorHandler);

export { app };
