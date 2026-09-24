import { Router } from "express";
import { createProxyMiddleware, fixRequestBody } from "http-proxy-middleware";
import { env } from "../config/env";
import { attachIdentityHeaders } from "../middleware/attachIdentityHeaders";
import { loginRateLimit } from "../middleware/rateLimit";
import { handleProxyError } from "../middleware/proxyError";
import { verifyJwt } from "../middleware/verifyJwt";

const router = Router();
const authProxy = createProxyMiddleware({
  target: env.AUTH_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: { "^/api/v1/auth": "" },
  on: {
    proxyReq: fixRequestBody,
    error: handleProxyError
  }
});

router.post("/register", attachIdentityHeaders, authProxy);
router.post("/login", loginRateLimit, attachIdentityHeaders, authProxy);
router.post("/refresh", attachIdentityHeaders, authProxy);
router.post("/logout", verifyJwt, attachIdentityHeaders, authProxy);

export { router as authRoutes };
