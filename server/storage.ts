// Direct AWS S3-backed storage helpers.
// Uploads go straight to S3; downloads are served through a short-lived presigned URL.
// Requires AWS_REGION and AWS_S3_BUCKET (credentials via the standard AWS provider chain:
// AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY, or an attached IAM role).

import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

let _s3: S3Client | null = null;

function getS3Client(): S3Client {
  if (!_s3) {
    const region = process.env.AWS_REGION;
    if (!region) {
      throw new Error("Storage config missing: set AWS_REGION");
    }
    _s3 = new S3Client({ region });
  }
  return _s3;
}

function getBucket(): string {
  const bucket = process.env.AWS_S3_BUCKET;
  if (!bucket) {
    throw new Error("Storage config missing: set AWS_S3_BUCKET");
  }
  return bucket;
}

function normalizeKey(relKey: string): string {
  const stripped = relKey.replace(/^\/+/, "");
  if (stripped.split("/").some(segment => segment === "..")) {
    throw new Error(
      "Invalid storage key: path traversal segments are not allowed"
    );
  }
  return stripped;
}

// Every prefix any storagePut() call site in the app actually writes to (all intentionally
// public content: admin/content assets, produce listing photos and quality certificates).
// The /storage/* proxy uses this as an allowlist so it can't be used to fetch arbitrary S3 keys.
export const PUBLIC_STORAGE_PREFIXES = [
  "admin/assets/",
  "content/article-covers/",
  "content/article-inline/",
  "produce/listings/",
  "produce/certificates/",
] as const;

export function isPublicStorageKey(relKey: string): boolean {
  const stripped = relKey.replace(/^\/+/, "");
  if (stripped.split("/").some(segment => segment === "..")) return false;
  return PUBLIC_STORAGE_PREFIXES.some(prefix => stripped.startsWith(prefix));
}

function appendHashSuffix(relKey: string): string {
  const hash = crypto.randomUUID().replace(/-/g, "").slice(0, 8);
  const lastDot = relKey.lastIndexOf(".");
  if (lastDot === -1) return `${relKey}_${hash}`;
  return `${relKey.slice(0, lastDot)}_${hash}${relKey.slice(lastDot)}`;
}

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  const key = appendHashSuffix(normalizeKey(relKey));

  await getS3Client().send(
    new PutObjectCommand({
      Bucket: getBucket(),
      Key: key,
      Body: data,
      ContentType: contentType,
    })
  );

  return { key, url: `/storage/${key}` };
}

export async function storageGet(
  relKey: string
): Promise<{ key: string; url: string }> {
  const key = normalizeKey(relKey);
  return { key, url: `/storage/${key}` };
}

export async function storageGetSignedUrl(relKey: string): Promise<string> {
  const key = normalizeKey(relKey);
  return getSignedUrl(
    getS3Client(),
    new GetObjectCommand({ Bucket: getBucket(), Key: key }),
    { expiresIn: 300 }
  );
}
