import type { RequestHandler } from "express";
import rateLimit, { type Options } from "express-rate-limit";
import { nanoid } from "nanoid";

// Tight limiter on auth endpoints to blunt credential brute-forcing/enumeration.
export const authRateLimiterOptions: Partial<Options> = {
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "محاولات كثيرة جداً، يرجى المحاولة لاحقاً" },
};

// Looser general limiter for the rest of the API.
export const apiRateLimiterOptions: Partial<Options> = {
  windowMs: 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "محاولات كثيرة جداً، يرجى المحاولة لاحقاً" },
};

export function createAuthRateLimiter(): RequestHandler {
  return rateLimit(authRateLimiterOptions);
}

export function createApiRateLimiter(): RequestHandler {
  return rateLimit(apiRateLimiterOptions);
}

export const REQUEST_ID_HEADER = "x-request-id";
const REQUEST_ID_MAX_LENGTH = 64;
const VALID_REQUEST_ID_RE = /^[A-Za-z0-9_-]+$/;

/** A caller-supplied id is only trusted if it's a short, printable token — never logged raw otherwise. */
function sanitizeIncomingRequestId(raw: unknown): string | null {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (typeof value !== "string") return null;
  if (value.length === 0 || value.length > REQUEST_ID_MAX_LENGTH) return null;
  if (!VALID_REQUEST_ID_RE.test(value)) return null;
  return value;
}

/** Propagates a per-request correlation id (from the caller or freshly generated) for log tracing. */
export const requestIdMiddleware: RequestHandler = (req, res, next) => {
  const id =
    sanitizeIncomingRequestId(req.headers[REQUEST_ID_HEADER]) ?? nanoid(12);
  res.setHeader(REQUEST_ID_HEADER, id);
  (req as typeof req & { requestId?: string }).requestId = id;
  next();
};
