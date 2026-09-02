import { describe, expect, it, vi } from "vitest";
import type { Request, Response } from "express";
import {
  apiRateLimiterOptions,
  authRateLimiterOptions,
  requestIdMiddleware,
} from "./security";

describe("rate limiter configuration", () => {
  it("applies a strict window/limit to auth endpoints", () => {
    expect(authRateLimiterOptions.windowMs).toBe(15 * 60 * 1000);
    expect(authRateLimiterOptions.limit).toBe(20);
  });

  it("applies a looser window/limit to the general API", () => {
    expect(apiRateLimiterOptions.windowMs).toBe(60 * 1000);
    expect(apiRateLimiterOptions.limit).toBe(300);
  });

  it("keeps the auth limiter's allowed rate stricter than the general API limiter", () => {
    const authRatePerSecond =
      (authRateLimiterOptions.limit as number) /
      ((authRateLimiterOptions.windowMs as number) / 1000);
    const apiRatePerSecond =
      (apiRateLimiterOptions.limit as number) /
      ((apiRateLimiterOptions.windowMs as number) / 1000);
    expect(authRatePerSecond).toBeLessThan(apiRatePerSecond);
  });
});

function createMockRes() {
  const headers: Record<string, string> = {};
  return {
    setHeader: vi.fn((name: string, value: string) => {
      headers[name] = value;
    }),
    headers,
  } as unknown as Response;
}

describe("requestIdMiddleware", () => {
  it("generates a request id when none is provided", () => {
    const req = { headers: {} } as unknown as Request;
    const res = createMockRes();
    const next = vi.fn();

    requestIdMiddleware(req, res, next);

    const generatedId = (req as Request & { requestId?: string }).requestId;
    expect(generatedId).toBeTruthy();
    expect(res.setHeader).toHaveBeenCalledWith("x-request-id", generatedId);
    expect(next).toHaveBeenCalledOnce();
  });

  it("reuses an incoming x-request-id header instead of generating a new one", () => {
    const req = {
      headers: { "x-request-id": "client-supplied-id" },
    } as unknown as Request;
    const res = createMockRes();
    const next = vi.fn();

    requestIdMiddleware(req, res, next);

    expect((req as Request & { requestId?: string }).requestId).toBe(
      "client-supplied-id"
    );
    expect(res.setHeader).toHaveBeenCalledWith(
      "x-request-id",
      "client-supplied-id"
    );
  });

  it("rejects an incoming id longer than 64 characters and generates a fresh one", () => {
    const tooLong = "a".repeat(65);
    const req = { headers: { "x-request-id": tooLong } } as unknown as Request;
    const res = createMockRes();
    const next = vi.fn();

    requestIdMiddleware(req, res, next);

    const id = (req as Request & { requestId?: string }).requestId;
    expect(id).not.toBe(tooLong);
    expect(id?.length).toBeLessThanOrEqual(64);
  });

  it("rejects an incoming id containing characters outside [A-Za-z0-9_-]", () => {
    const malicious = "abc\r\ninjected: header\nlog\x00me";
    const req = {
      headers: { "x-request-id": malicious },
    } as unknown as Request;
    const res = createMockRes();
    const next = vi.fn();

    requestIdMiddleware(req, res, next);

    const id = (req as Request & { requestId?: string }).requestId;
    expect(id).not.toBe(malicious);
    expect(id).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it("accepts an incoming id made only of letters, numbers, dash and underscore", () => {
    const valid = "Trace-ID_123";
    const req = { headers: { "x-request-id": valid } } as unknown as Request;
    const res = createMockRes();
    const next = vi.fn();

    requestIdMiddleware(req, res, next);

    expect((req as Request & { requestId?: string }).requestId).toBe(valid);
  });
});
