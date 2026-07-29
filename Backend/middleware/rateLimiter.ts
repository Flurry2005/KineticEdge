import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import type { Request, Response, NextFunction } from "express";

const userKeyGenerator = (req: Request) => {
  // Authenticated users are limited by account
  if (req.userId) {
    return req.userId;
  }

  // Fallback for unauthenticated requests (IPv4 + IPv6 safe)
  return ipKeyGenerator(req.ip ?? "unknown");
};

export const barcodeLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 30,

  standardHeaders: "draft-8",
  legacyHeaders: false,

  keyGenerator: userKeyGenerator,

  message: {
    message: "Too many barcode requests. Please try again later.",
  },
});

export const addFoodLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 100,

  standardHeaders: "draft-8",
  legacyHeaders: false,

  keyGenerator: userKeyGenerator,

  message: {
    message: "Too many food additions. Please try again later.",
  },
});

export const readLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 200,

  standardHeaders: "draft-8",
  legacyHeaders: false,

  keyGenerator: userKeyGenerator,

  message: {
    message: "Too many requests. Please try again later.",
  },
});

export function attachUserId(req: Request, res: Response, next: NextFunction) {
  if (!res.locals.jwt?.userId) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  req.userId = res.locals.jwt.userId;

  next();
}
