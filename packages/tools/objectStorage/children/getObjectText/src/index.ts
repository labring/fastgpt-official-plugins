import { z } from "zod";
import {
  createObjectStorageClient,
  getObjectText,
  handleObjectStorageError,
} from "../../../client";

export const InputType = z.object({
  endpoint: z.string().url("endpoint must be a valid URL"),
  region: z.string().min(1, "region is required"),
  accessKeyId: z.string().min(1, "accessKeyId is required"),
  secretAccessKey: z.string().min(1, "secretAccessKey is required"),
  bucket: z.string().min(1, "bucket is required"),
  forcePathStyle: z.boolean().optional().nullable(),
  key: z.string().min(1, "key is required"),
  maxTextSize: z.number().int().positive().optional().default(1048576),
});

export const OutputType = z.object({
  key: z.string(),
  bucket: z.string(),
  text: z.string(),
  contentType: z.string().nullable(),
  size: z.number(),
  lastModified: z.string().nullable(),
  eTag: z.string().nullable(),
});

export async function tool({
  key,
  maxTextSize,
  ...config
}: z.infer<typeof InputType>): Promise<z.infer<typeof OutputType>> {
  try {
    const client = createObjectStorageClient(config);
    return await getObjectText({
      client,
      bucket: config.bucket,
      key,
      maxTextSize,
    });
  } catch (error) {
    return Promise.reject(handleObjectStorageError(error));
  }
}
