import { Router } from "express";
import { z } from "zod";
import { RefreshToken } from "../models/RefreshToken";
import { User } from "../models/User";
import { validate } from "../middleware/validate";
import { comparePassword, hashPassword } from "../utils/password";
import { createRefreshToken, hashRefreshToken, signAccessToken } from "../utils/tokens";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).regex(/\d/)
}).strict();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
}).strict();

const refreshSchema = z.object({
  refreshToken: z.string().min(1)
}).strict();

const userResponse = (user: { _id: unknown; email: string; role: "user" | "admin" }) => ({
  id: String(user._id),
  email: user.email,
  role: user.role
});

const issueTokens = async (user: { _id: unknown; email: string; role: "user" | "admin" }) => ({
  accessToken: signAccessToken({ sub: String(user._id), email: user.email, role: user.role }),
  refreshToken: await createRefreshToken(String(user._id)),
  user: userResponse(user)
});

const router = Router();

router.post("/register", validate(registerSchema), async (request, response, next) => {
  try {
    const email = request.body.email.toLowerCase();
    const passwordHash = await hashPassword(request.body.password);
    const user = await User.create({ email, passwordHash, role: "user" });
    response.status(201).json(await issueTokens(user));
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === 11000) {
      response.status(409).json({
        error: {
          code: "EMAIL_TAKEN",
          message: "An account with that email already exists."
        }
      });
      return;
    }
    next(error);
  }
});

router.post("/login", validate(loginSchema), async (request, response, next) => {
  try {
    const user = await User.findOne({ email: request.body.email.toLowerCase() }).select("+passwordHash");
    const validPassword = user ? await comparePassword(request.body.password, user.passwordHash) : false;

    if (!user || !validPassword) {
      response.status(401).json({
        error: {
          code: "INVALID_CREDENTIALS",
          message: "Email or password is incorrect."
        }
      });
      return;
    }

    response.status(200).json(await issueTokens(user));
  } catch (error) {
    next(error);
  }
});

router.post("/refresh", validate(refreshSchema), async (request, response, next) => {
  try {
    const refreshToken = await RefreshToken.findOneAndUpdate(
      {
        tokenHash: hashRefreshToken(request.body.refreshToken),
        revoked: false,
        expiresAt: { $gt: new Date() }
      },
      { $set: { revoked: true } },
      { new: false }
    );

    if (!refreshToken) {
      response.status(401).json({
        error: {
          code: "INVALID_REFRESH_TOKEN",
          message: "Refresh token is invalid or expired."
        }
      });
      return;
    }

    const user = await User.findById(refreshToken.userId);
    if (!user) {
      response.status(401).json({
        error: {
          code: "INVALID_REFRESH_TOKEN",
          message: "Refresh token is invalid or expired."
        }
      });
      return;
    }

    response.status(200).json(await issueTokens(user));
  } catch (error) {
    next(error);
  }
});

router.post("/logout", validate(refreshSchema), async (request, response, next) => {
  try {
    await RefreshToken.updateOne(
      { tokenHash: hashRefreshToken(request.body.refreshToken) },
      { $set: { revoked: true } }
    );
    response.status(204).send();
  } catch (error) {
    next(error);
  }
});

export { router as authRouter };
