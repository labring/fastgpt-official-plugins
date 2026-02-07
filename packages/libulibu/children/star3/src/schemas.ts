import { z } from "zod";

const SizeEnum = z.enum([
  "512*1024",
  "768*512",
  "768*1024",
  "1024*576",
  "576*1024",
  "1024*1024",
]);

export const InputSchema = z
  .object({
    accessKey: z.string().describe("accessKey"),
    secretKey: z.string().describe("secretKey"),
    prompt: z.string().describe("draw prompt"),
    size: SizeEnum.optional().default("1024*1024").describe("image size"),
  })
  .describe("libulibu star3 drawing parameters");
export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  link: z.string().describe("drawing result image link"),
  msg: z
    .string()
    .optional()
    .describe("error message, returned when task execution fails"),
});
export type Output = z.infer<typeof OutputSchema>;
