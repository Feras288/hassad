export function getBetterAuthSecret(
  env: NodeJS.ProcessEnv = process.env
): string {
  const secret = env.BETTER_AUTH_SECRET;
  if (!secret || secret.trim().length === 0) {
    if (env.NODE_ENV === "production") {
      throw new Error(
        "FATAL: BETTER_AUTH_SECRET environment variable is required in production mode."
      );
    }
    // Only for local non-production development/tests
    return "dev-secret-key-only-for-local-testing-32chars";
  }
  return secret.trim();
}

/** Fails fast at startup instead of surfacing a confusing error on first use in production. */
function requireInProduction(
  name: string,
  value: string | undefined,
  env: NodeJS.ProcessEnv = process.env
): string {
  if (!value || value.trim().length === 0) {
    if (env.NODE_ENV === "production") {
      throw new Error(
        `FATAL: ${name} environment variable is required in production mode.`
      );
    }
    return "";
  }
  return value.trim();
}

const VALID_NODE_ENVS = ["development", "test", "production"] as const;

/** Catches typos like NODE_ENV=prod/staging that would otherwise silently disable prod-only checks. */
export function validateNodeEnv(env: NodeJS.ProcessEnv = process.env): void {
  const value = env.NODE_ENV;
  if (
    value !== undefined &&
    !VALID_NODE_ENVS.includes(value as (typeof VALID_NODE_ENVS)[number])
  ) {
    throw new Error(
      `FATAL: NODE_ENV must be one of ${VALID_NODE_ENVS.join(", ")} (got "${value}").`
    );
  }
}

/** Google sign-in must be configured as a full pair, never partially. */
export function validateGoogleOAuthPair(
  env: NodeJS.ProcessEnv = process.env
): void {
  const hasId = Boolean(env.GOOGLE_CLIENT_ID?.trim());
  const hasSecret = Boolean(env.GOOGLE_CLIENT_SECRET?.trim());
  if (hasId !== hasSecret) {
    throw new Error(
      "FATAL: GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must both be set, or both left unset."
    );
  }
}

const LOCALHOST_URL_RE = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/|$)/i;

/** In production this must point at the real deployed origin, never the local dev fallback. */
export function getBetterAuthUrl(env: NodeJS.ProcessEnv = process.env): string {
  const explicit = (env.BETTER_AUTH_URL ?? env.VITE_APP_URL ?? "").trim();
  if (env.NODE_ENV === "production") {
    if (!explicit) {
      throw new Error(
        "FATAL: BETTER_AUTH_URL (or VITE_APP_URL) environment variable is required in production mode."
      );
    }
    if (LOCALHOST_URL_RE.test(explicit)) {
      throw new Error(
        "FATAL: BETTER_AUTH_URL must not point to localhost in production mode."
      );
    }
    return explicit;
  }
  return explicit || "http://localhost:3000";
}

validateNodeEnv();
validateGoogleOAuthPair();

export const ENV = {
  databaseUrl: requireInProduction("DATABASE_URL", process.env.DATABASE_URL),
  betterAuthSecret: getBetterAuthSecret(),
  betterAuthUrl: getBetterAuthUrl(),
  initialAdminEmail:
    requireInProduction(
      "INITIAL_ADMIN_EMAIL",
      process.env.INITIAL_ADMIN_EMAIL
    ).toLowerCase() || "dealb2b@gmail.com",
  googleClientId: process.env.GOOGLE_CLIENT_ID ?? "",
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
  // Storage/S3 has no separate feature flag in this codebase — admin/content/produce image
  // uploads depend on it unconditionally, so it's required whenever NODE_ENV=production.
  awsRegion: requireInProduction("AWS_REGION", process.env.AWS_REGION),
  awsS3Bucket: requireInProduction("AWS_S3_BUCKET", process.env.AWS_S3_BUCKET),
  trustProxy: process.env.TRUST_PROXY,
  isProduction: process.env.NODE_ENV === "production",
};
