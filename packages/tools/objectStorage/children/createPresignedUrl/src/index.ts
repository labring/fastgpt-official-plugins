import { z } from "zod";
import {
  createObjectStorageClient,
  createPresignedObjectUrl,
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
  expiresIn: z.number().int().positive().optional().default(900),
});

export const OutputType = z.object({
  key: z.string(),
  bucket: z.string(),
  url: z.string(),
  expiresIn: z.number(),
});

export async function tool({
  key,
  expiresIn,
  ...config
}: z.infer<typeof InputType>): Promise<z.infer<typeof OutputType>> {
  try {
    const client = createObjectStorageClient(config);
    return await createPresignedObjectUrl({
      client,
      bucket: config.bucket,
      key,
      expiresIn,
    });
  } catch (error) {
    return Promise.reject(handleObjectStorageError(error));
  }
}
