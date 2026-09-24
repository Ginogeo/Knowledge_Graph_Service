import express, { type ErrorRequestHandler } from "express";
import { authRouter } from "./routes/auth";
import { requireInternalKey } from "./middleware/requireInternalKey";
import { logger } from "./utils/logger";

const app = express();

app.use(express.json());
app.use((request, response, next) => {
  const started = Date.now();
  response.on("finish", () => logger.info("HTTP request", { method: request.method, path: request.path, statusCode: response.statusCode, durationMs: Date.now() - started }));
  next();
});
app.use(requireInternalKey);
app.use(authRouter);

const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  logger.error("Unhandled auth error", { error });
  response.status(500).json({
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "An unexpected error occurred."
    }
  });
};

app.use(errorHandler);

export { app };
