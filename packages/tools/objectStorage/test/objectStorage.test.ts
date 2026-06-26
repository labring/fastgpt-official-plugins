import { describe, expect, it, vi } from "vitest";
import {
  InputType as createPresignedUrlInputType,
  tool as createPresignedUrlTool,
} from "../children/createPresignedUrl/src";
import {
  InputType as getObjectTextInputType,
  tool as getObjectTextTool,
} from "../children/getObjectText/src";
import {
  InputType as listObjectsInputType,
  tool as listObjectsTool,
} from "../children/listObjects/src";
import {
  InputType as uploadTextObjectInputType,
  tool as uploadTextObjectTool,
} from "../children/uploadTextObject/src";
import {
  assertTextSize,
  createPresignedObjectUrl,
  getObjectText,
  listObjects,
  normalizeExpiresIn,
  normalizeObjectKey,
  type ObjectStorageClient,
  redactObjectStorageSecrets,
  uploadTextObject,
} from "../client";

vi.mock("@aws-sdk/s3-request-presigner", () => ({
  getSignedUrl: vi.fn(
    async () => "https://storage.example.com/file.txt?X-Amz-Signature=mock",
  ),
}));

describe("objectStorage toolset", () => {
  it("exports all tool callbacks", () => {
    expect(typeof listObjectsTool).toBe("function");
    expect(typeof uploadTextObjectTool).toBe("function");
    expect(typeof getObjectTextTool).toBe("function");
    expect(typeof createPresignedUrlTool).toBe("function");
  });

  it("validates child inputs", () => {
    const base = {
      endpoint: "https://s3.example.com",
      region: "us-east-1",
      accessKeyId: "access-key",
      secretAccessKey: "secret-key",
      bucket: "docs",
    };

    expect(listObjectsInputType.safeParse(base).success).toBe(true);
    expect(
      uploadTextObjectInputType.safeParse({
        ...base,
        key: "a.txt",
        text: "hello",
      }).success,
    ).toBe(true);
    expect(
      getObjectTextInputType.safeParse({ ...base, key: "a.txt" }).success,
    ).toBe(true);
    expect(
      createPresignedUrlInputType.safeParse({ ...base, key: "a.txt" }).success,
    ).toBe(true);
  });

  it("normalizes safe object keys", () => {
    expect(normalizeObjectKey(" docs//2026/report.txt ")).toBe(
      "docs/2026/report.txt",
    );
    expect(normalizeObjectKey("docs\\2026\\report.txt")).toBe(
      "docs/2026/report.txt",
    );
  });

  it("rejects unsafe object keys", () => {
    expect(() => normalizeObjectKey("")).toThrow("Object key cannot be empty");
    expect(() => normalizeObjectKey("/etc/passwd")).toThrow(
      "Object key must be relative",
    );
    expect(() => normalizeObjectKey("C:\\Users\\secret.txt")).toThrow(
      "Object key must be relative",
    );
    expect(() => normalizeObjectKey("../secret.txt")).toThrow(
      "Object key cannot contain parent directory segments",
    );
  });

  it("enforces text size limits", () => {
    expect(() => assertTextSize("hello", 5)).not.toThrow();
    expect(() => assertTextSize("hello", 4)).toThrow("Text size exceeds limit");
  });

  it("caps presigned URL expiration", () => {
    expect(normalizeExpiresIn()).toBe(900);
    expect(normalizeExpiresIn(9999999)).toBe(604800);
  });

  it("redacts secrets in errors", () => {
    const message =
      "failed accessKeyId=AKIA_TEST&secretAccessKey=SECRET&X-Amz-Signature=abc&X-Amz-Credential=cred";

    expect(redactObjectStorageSecrets(message)).toBe(
      "failed accessKeyId=[REDACTED]&secretAccessKey=[REDACTED]&X-Amz-Signature=[REDACTED]&X-Amz-Credential=[REDACTED]",
    );
  });

  it("lists objects using a mocked client", async () => {
    const client: ObjectStorageClient = {
      send: vi.fn(async () => ({
        Contents: [
          {
            Key: "docs/a.txt",
            Size: 5,
            LastModified: new Date("2026-01-01T00:00:00.000Z"),
            ETag: "etag",
            StorageClass: "STANDARD",
          },
        ],
        IsTruncated: false,
      })),
    };

    await expect(
      listObjects({ client, bucket: "docs", prefix: "docs", maxKeys: 10 }),
    ).resolves.toEqual({
      objects: [
        {
          key: "docs/a.txt",
          size: 5,
          lastModified: "2026-01-01T00:00:00.000Z",
          eTag: "etag",
          storageClass: "STANDARD",
        },
      ],
      isTruncated: false,
      nextContinuationToken: null,
    });
  });

  it("uploads text using a mocked client", async () => {
    const client: ObjectStorageClient = {
      send: vi.fn(async () => ({
        ETag: "etag",
        VersionId: "v1",
      })),
    };

    await expect(
      uploadTextObject({
        client,
        bucket: "docs",
        key: "a.txt",
        text: "hello",
        maxTextSize: 10,
      }),
    ).resolves.toEqual({
      key: "a.txt",
      bucket: "docs",
      size: 5,
      eTag: "etag",
      versionId: "v1",
    });
  });

  it("downloads text using a mocked client", async () => {
    const client: ObjectStorageClient = {
      send: vi
        .fn()
        .mockResolvedValueOnce({ ContentLength: 5 })
        .mockResolvedValueOnce({
          Body: {
            transformToString: async () => "hello",
          },
          ContentType: "text/plain",
          LastModified: new Date("2026-01-01T00:00:00.000Z"),
          ETag: "etag",
        }),
    };

    await expect(
      getObjectText({
        client,
        bucket: "docs",
        key: "a.txt",
        maxTextSize: 10,
      }),
    ).resolves.toEqual({
      key: "a.txt",
      bucket: "docs",
      text: "hello",
      contentType: "text/plain",
      size: 5,
      lastModified: "2026-01-01T00:00:00.000Z",
      eTag: "etag",
    });
  });

  it("creates a read-only presigned URL", async () => {
    const client = {} as Parameters<
      typeof createPresignedObjectUrl
    >[0]["client"];

    await expect(
      createPresignedObjectUrl({
        client,
        bucket: "docs",
        key: "a.txt",
        expiresIn: 60,
      }),
    ).resolves.toEqual({
      key: "a.txt",
      bucket: "docs",
      url: "https://storage.example.com/file.txt?X-Amz-Signature=mock",
      expiresIn: 60,
    });
  });
});
