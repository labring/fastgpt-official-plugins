import { z } from "zod";
import {
  createObjectStorageClient,
  handleObjectStorageError,
  uploadTextObject,
} from "../../../client";

export const InputType = z.object({
  endpoint: z.string().url("endpoint must be a valid URL"),
  region: z.string().min(1, "region is required"),
  accessKeyId: z.string().min(1, "accessKeyId is required"),
  secretAccessKey: z.string().min(1, "secretAccessKey is required"),
  bucket: z.string().min(1, "bucket is required"),
  forcePathStyle: z.boolean().optional().nullable(),
  key: z.string().min(1, "key is required"),
  text: z.string(),
  contentType: z.string().optional().nullable(),
  maxTextSize: z.number().int().positive().optional().default(1048576),
});

export const OutputType = z.object({
  key: z.string(),
  bucket: z.string(),
  size: z.number(),
  eTag: z.string().nullable(),
  versionId: z.string().nullable(),
});

export async function tool({
  key,
  text,
  contentType,
  maxTextSize,
  ...config
}: z.infer<typeof InputType>): Promise<z.infer<typeof OutputType>> {
  try {
    const client = createObjectStorageClient(config);
    return await uploadTextObject({
      client,
      bucket: config.bucket,
      key,
      text,
      contentType,
      maxTextSize,
    });
  } catch (error) {
    return Promise.reject(handleObjectStorageError(error));
  }
}
