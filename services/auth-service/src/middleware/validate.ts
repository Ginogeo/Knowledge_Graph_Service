import type { RequestHandler } from "express";
import type { ZodType } from "zod";

export const validate = (schema: ZodType): RequestHandler => (request, response, next) => {
  const result = schema.safeParse(request.body);
  if (!result.success) {
    const passwordIssue = result.error.issues.some((issue) => issue.path[0] === "password");
    response.status(400).json({
      error: {
        code: passwordIssue ? "WEAK_PASSWORD" : "VALIDATION_ERROR",
        message: passwordIssue ? "Password must be at least 8 characters and contain a digit." : "Request body is invalid."
      }
    });
    return;
  }

  request.body = result.data;
  next();
};
