import {
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
  type S3ClientConfig,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const DEFAULT_MAX_TEXT_SIZE = 1024 * 1024;
const DEFAULT_PRESIGNED_EXPIRES_IN = 900;
const MAX_PRESIGNED_EXPIRES_IN = 7 * 24 * 60 * 60;
const SECRET_FIELD_PATTERN =
  /(accessKeyId|secretAccessKey|access_key|secret_key|signature|credential|x-amz-signature)=([^&\s]+)/gi;

export type ObjectStorageConfig = {
  endpoint: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  forcePathStyle?: boolean | null;
};

export type ObjectStorageClient = Pick<S3Client, "send">;

export function createObjectStorageClient({
  endpoint,
  region,
  accessKeyId,
  secretAccessKey,
  forcePathStyle,
}: ObjectStorageConfig): S3Client {
  const config: S3ClientConfig = {
    endpoint,
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
    forcePathStyle: forcePathStyle ?? false,
  };

  return new S3Client(config);
}

export async function listObjects({
  client,
  bucket,
  prefix,
  maxKeys,
}: {
  client: ObjectStorageClient;
  bucket: string;
  prefix?: string | null;
  maxKeys?: number;
}) {
  const normalizedPrefix = prefix ? normalizeObjectKey(prefix) : undefined;
  const response = await client.send(
    new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: normalizedPrefix,
      MaxKeys: maxKeys,
    }),
  );

  return {
    objects: (response.Contents ?? []).map((item) => ({
      key: item.Key ?? "",
      size: item.Size ?? 0,
      lastModified: item.LastModified?.toISOString() ?? null,
      eTag: item.ETag ?? null,
      storageClass: item.StorageClass ?? null,
    })),
    isTruncated: response.IsTruncated ?? false,
    nextContinuationToken: response.NextContinuationToken ?? null,
  };
}

export async function uploadTextObject({
  client,
  bucket,
  key,
  text,
  contentType,
  maxTextSize,
}: {
  client: ObjectStorageClient;
  bucket: string;
  key: string;
  text: string;
  contentType?: string | null;
  maxTextSize?: number | null;
}) {
  const normalizedKey = normalizeObjectKey(key);
  assertTextSize(text, maxTextSize);

  const response = await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: normalizedKey,
      Body: text,
      ContentType: contentType?.trim() || "text/plain; charset=utf-8",
    }),
  );

  return {
    key: normalizedKey,
    bucket,
    size: byteLength(text),
    eTag: response.ETag ?? null,
    versionId: response.VersionId ?? null,
  };
}

export async function getObjectText({
  client,
  bucket,
  key,
  maxTextSize,
}: {
  client: ObjectStorageClient;
  bucket: string;
  key: string;
  maxTextSize?: number | null;
}) {
  const normalizedKey = normalizeObjectKey(key);
  const maxBytes = normalizeMaxTextSize(maxTextSize);
  const head = await client.send(
    new HeadObjectCommand({
      Bucket: bucket,
      Key: normalizedKey,
    }),
  );

  if (head.ContentLength !== undefined && head.ContentLength > maxBytes) {
    throw new Error(`Object text size exceeds limit of ${maxBytes} bytes`);
  }

  const response = await client.send(
    new GetObjectCommand({
      Bucket: bucket,
      Key: normalizedKey,
    }),
  );

  const text = await response.Body?.transformToString();
  assertTextSize(text ?? "", maxBytes);

  return {
    key: normalizedKey,
    bucket,
    text: text ?? "",
    contentType: response.ContentType ?? null,
    size: byteLength(text ?? ""),
    lastModified: response.LastModified?.toISOString() ?? null,
    eTag: response.ETag ?? null,
  };
}

export async function createPresignedObjectUrl({
  client,
  bucket,
  key,
  expiresIn,
}: {
  client: S3Client;
  bucket: string;
  key: string;
  expiresIn?: number | null;
}) {
  const normalizedKey = normalizeObjectKey(key);
  const url = await getSignedUrl(
    client,
    new GetObjectCommand({
      Bucket: bucket,
      Key: normalizedKey,
    }),
    {
      expiresIn: normalizeExpiresIn(expiresIn),
    },
  );

  return {
    key: normalizedKey,
    bucket,
    url,
    expiresIn: normalizeExpiresIn(expiresIn),
  };
}

export function normalizeObjectKey(key: string): string {
  if (typeof key !== "string") {
    throw new Error("Object key is required");
  }

  const normalized = key
    .replaceAll("\\", "/")
    .split("/")
    .map((segment) => segment.trim())
    .filter((segment) => segment.length > 0 && segment !== ".")
    .join("/");

  if (!normalized) {
    throw new Error("Object key cannot be empty");
  }

  if (
    key.startsWith("/") ||
    key.startsWith("\\") ||
    /^[a-zA-Z]:[\\/]/.test(key)
  ) {
    throw new Error("Object key must be relative");
  }

  if (normalized.split("/").some((segment) => segment === "..")) {
    throw new Error("Object key cannot contain parent directory segments");
  }

  return normalized;
}

export function normalizeMaxTextSize(maxTextSize?: number | null): number {
  if (maxTextSize === undefined || maxTextSize === null) {
    return DEFAULT_MAX_TEXT_SIZE;
  }

  if (!Number.isInteger(maxTextSize) || maxTextSize <= 0) {
    throw new Error("maxTextSize must be a positive integer");
  }

  return maxTextSize;
}

export function normalizeExpiresIn(expiresIn?: number | null): number {
  if (expiresIn === undefined || expiresIn === null) {
    return DEFAULT_PRESIGNED_EXPIRES_IN;
  }

  if (!Number.isInteger(expiresIn) || expiresIn <= 0) {
    throw new Error("expiresIn must be a positive integer");
  }

  return Math.min(expiresIn, MAX_PRESIGNED_EXPIRES_IN);
}

export function assertTextSize(
  text: string,
  maxTextSize?: number | null,
): void {
  const maxBytes = normalizeMaxTextSize(maxTextSize);
  const size = byteLength(text);

  if (size > maxBytes) {
    throw new Error(`Text size exceeds limit of ${maxBytes} bytes`);
  }
}

export function handleObjectStorageError(error: unknown): string {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "Unknown object storage error";

  return redactObjectStorageSecrets(message);
}

export function redactObjectStorageSecrets(message: string): string {
  return message
    .replace(SECRET_FIELD_PATTERN, "$1=[REDACTED]")
    .replace(/(AWSAccessKeyId=)([^&\s]+)/gi, "$1[REDACTED]")
    .replace(/(X-Amz-Credential=)([^&\s]+)/gi, "$1[REDACTED]");
}

function byteLength(text: string): number {
  return Buffer.byteLength(text, "utf8");
}
