import { z } from "zod";

export const InputSchema = z
  .object({
    apiKey: z.string().optional(),
    volcengineAccessKey: z.string().optional(),
    volcengineSecretKey: z.string().optional(),
    query: z.string().nonempty().max(100, "Query cannot exceed 100 characters"),
    count: z
      .number()
      .optional()
      .default(10)
      .refine((val) => val >= 1 && val <= 50, {
        message: "count must be between 1 and 50",
      }),
    searchType: z.enum(["web", "web_summary"]).optional().default("web"),
    sites: z.string().optional().default(""),
    time_range: z.string().optional().default(""),
  })
  .refine(
    ({ apiKey, volcengineAccessKey, volcengineSecretKey }) => {
      return apiKey || (volcengineAccessKey && volcengineSecretKey);
    },
    {
      message:
        "Either apiKey or both volcengineAccessKey and volcengineSecretKey must be provided.",
    },
  );
export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  result: z.array(
    z.object({
      Title: z.string(),
      Content: z.string(),
      Url: z.string().nullable().optional(),
      SiteName: z.string().nullable().optional(),
      PublishTime: z.string().nullable().optional(),
      LogoUrl: z.string().nullable().optional(),
      AuthInfoDes: z.string().nullable().optional(),
    }),
  ),
});
export type Output = z.infer<typeof OutputSchema>;
