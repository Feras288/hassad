import { describe, expect, it } from "vitest";
import { isPublicStorageKey, storagePut } from "./storage";

describe("isPublicStorageKey", () => {
  it("allows every prefix actually used by storagePut() call sites", () => {
    expect(isPublicStorageKey("admin/assets/abc123.png")).toBe(true);
    expect(isPublicStorageKey("content/article-covers/abc123.jpg")).toBe(true);
    expect(isPublicStorageKey("content/article-inline/abc123.webp")).toBe(true);
    expect(isPublicStorageKey("produce/listings/user1/abc123.png")).toBe(true);
    expect(isPublicStorageKey("produce/certificates/user1/abc123.pdf")).toBe(
      true
    );
  });

  it("rejects unknown prefixes so arbitrary S3 keys can't be requested", () => {
    expect(isPublicStorageKey("secret/keys/abc123.png")).toBe(false);
    expect(isPublicStorageKey("private/user-documents/abc.pdf")).toBe(false);
    expect(isPublicStorageKey("")).toBe(false);
  });

  it("rejects path traversal segments even under an allowed prefix", () => {
    expect(isPublicStorageKey("admin/assets/../../secret.png")).toBe(false);
    expect(isPublicStorageKey("../admin/assets/x.png")).toBe(false);
  });

  it("tolerates a leading slash for otherwise-allowed keys", () => {
    expect(isPublicStorageKey("/admin/assets/abc123.png")).toBe(true);
  });
});

describe("storagePut path traversal guard", () => {
  it("rejects keys containing '..' segments before any network call", async () => {
    await expect(
      storagePut("../../etc/passwd", Buffer.from("x"))
    ).rejects.toThrow(/path traversal/);
  });
});
