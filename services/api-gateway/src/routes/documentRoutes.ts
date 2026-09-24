import { Router } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { env } from "../config/env";
import { attachIdentityHeaders } from "../middleware/attachIdentityHeaders";
import { documentRateLimit } from "../middleware/rateLimit";
import { handleProxyError } from "../middleware/proxyError";
import { verifyJwt } from "../middleware/verifyJwt";

const router = Router();
const documentProxy = createProxyMiddleware({
  target: env.RAG_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: (path) => {
    const [pathname, query] = path.split("?", 2);
    return `/documents${pathname === "/" ? "" : pathname}${query ? `?${query}` : ""}`;
  },
  on: {
    error: handleProxyError
  }
});

router.use(verifyJwt, attachIdentityHeaders);
router.post("/", documentRateLimit, documentProxy);
router.get("/", documentProxy);
router.get("/:id/status", documentProxy);

export { router as documentRoutes };
