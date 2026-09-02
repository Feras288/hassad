import { describe, expect, it } from "vitest";
import {
  getBetterAuthSecret,
  getBetterAuthUrl,
  validateGoogleOAuthPair,
  validateNodeEnv,
} from "./env";

describe("getBetterAuthSecret", () => {
  it("throws in production when missing", () => {
    expect(() =>
      getBetterAuthSecret({ NODE_ENV: "production" } as NodeJS.ProcessEnv)
    ).toThrow(/BETTER_AUTH_SECRET/);
  });

  it("returns a dev fallback outside production", () => {
    expect(
      getBetterAuthSecret({ NODE_ENV: "development" } as NodeJS.ProcessEnv)
    ).toBe("dev-secret-key-only-for-local-testing-32chars");
  });

  it("returns the trimmed value when set", () => {
    expect(
      getBetterAuthSecret({
        NODE_ENV: "production",
        BETTER_AUTH_SECRET: " abc123 ",
      } as NodeJS.ProcessEnv)
    ).toBe("abc123");
  });
});

describe("validateNodeEnv", () => {
  it("accepts development, test, and production", () => {
    for (const value of ["development", "test", "production"]) {
      expect(() =>
        validateNodeEnv({ NODE_ENV: value } as NodeJS.ProcessEnv)
      ).not.toThrow();
    }
  });

  it("throws on an invalid value", () => {
    expect(() =>
      validateNodeEnv({ NODE_ENV: "staging" } as NodeJS.ProcessEnv)
    ).toThrow(/NODE_ENV/);
  });

  it("allows NODE_ENV to be unset", () => {
    expect(() => validateNodeEnv({} as NodeJS.ProcessEnv)).not.toThrow();
  });
});

describe("validateGoogleOAuthPair", () => {
  it("allows both client id and secret to be unset", () => {
    expect(() =>
      validateGoogleOAuthPair({} as NodeJS.ProcessEnv)
    ).not.toThrow();
  });

  it("allows both to be set", () => {
    expect(() =>
      validateGoogleOAuthPair({
        GOOGLE_CLIENT_ID: "id",
        GOOGLE_CLIENT_SECRET: "secret",
      } as NodeJS.ProcessEnv)
    ).not.toThrow();
  });

  it("throws when only the client id is set", () => {
    expect(() =>
      validateGoogleOAuthPair({ GOOGLE_CLIENT_ID: "id" } as NodeJS.ProcessEnv)
    ).toThrow(/GOOGLE_CLIENT_ID/);
  });

  it("throws when only the client secret is set", () => {
    expect(() =>
      validateGoogleOAuthPair({
        GOOGLE_CLIENT_SECRET: "secret",
      } as NodeJS.ProcessEnv)
    ).toThrow(/GOOGLE_CLIENT_ID/);
  });
});

describe("getBetterAuthUrl", () => {
  it("throws in production when unset", () => {
    expect(() =>
      getBetterAuthUrl({ NODE_ENV: "production" } as NodeJS.ProcessEnv)
    ).toThrow(/BETTER_AUTH_URL/);
  });

  it("throws in production when pointing at localhost", () => {
    expect(() =>
      getBetterAuthUrl({
        NODE_ENV: "production",
        BETTER_AUTH_URL: "http://localhost:3000",
      } as NodeJS.ProcessEnv)
    ).toThrow(/localhost/);
  });

  it("accepts a real origin in production", () => {
    expect(
      getBetterAuthUrl({
        NODE_ENV: "production",
        BETTER_AUTH_URL: "https://example.com",
      } as NodeJS.ProcessEnv)
    ).toBe("https://example.com");
  });

  it("falls back to VITE_APP_URL when BETTER_AUTH_URL is unset", () => {
    expect(
      getBetterAuthUrl({
        NODE_ENV: "production",
        VITE_APP_URL: "https://app.example.com",
      } as NodeJS.ProcessEnv)
    ).toBe("https://app.example.com");
  });

  it("falls back to localhost outside production", () => {
    expect(
      getBetterAuthUrl({ NODE_ENV: "development" } as NodeJS.ProcessEnv)
    ).toBe("http://localhost:3000");
  });
});
