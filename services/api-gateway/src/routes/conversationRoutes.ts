import { Router } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { env } from "../config/env";
import { attachIdentityHeaders } from "../middleware/attachIdentityHeaders";
import { handleProxyError } from "../middleware/proxyError";
import { verifyJwt } from "../middleware/verifyJwt";

const router = Router();
const conversationProxy = createProxyMiddleware({
  target: env.RAG_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: (path) => {
    const [pathname, query] = path.split("?", 2);
    return `/conversations${pathname === "/" ? "" : pathname}${query ? `?${query}` : ""}`;
  },
  on: {
    error: handleProxyError
  }
});

router.use(verifyJwt, attachIdentityHeaders);
router.get("/", conversationProxy);
router.get("/:id", conversationProxy);

export { router as conversationRoutes };
