import { z } from "zod";
import {
  createObjectStorageClient,
  handleObjectStorageError,
  listObjects,
} from "../../../client";

export const InputType = z.object({
  endpoint: z.string().url("endpoint must be a valid URL"),
  region: z.string().min(1, "region is required"),
  accessKeyId: z.string().min(1, "accessKeyId is required"),
  secretAccessKey: z.string().min(1, "secretAccessKey is required"),
  bucket: z.string().min(1, "bucket is required"),
  forcePathStyle: z.boolean().optional().nullable(),
  prefix: z.string().optional().nullable(),
  maxKeys: z.number().int().min(1).max(1000).optional().default(100),
});

export const OutputType = z.object({
  objects: z.array(
    z.object({
      key: z.string(),
      size: z.number(),
      lastModified: z.string().nullable(),
      eTag: z.string().nullable(),
      storageClass: z.string().nullable(),
    }),
  ),
  isTruncated: z.boolean(),
  nextContinuationToken: z.string().nullable(),
});

export async function tool({
  prefix,
  maxKeys,
  ...config
}: z.infer<typeof InputType>): Promise<z.infer<typeof OutputType>> {
  try {
    const client = createObjectStorageClient(config);
    return await listObjects({
      client,
      bucket: config.bucket,
      prefix,
      maxKeys,
    });
  } catch (error) {
    return Promise.reject(handleObjectStorageError(error));
  }
}
