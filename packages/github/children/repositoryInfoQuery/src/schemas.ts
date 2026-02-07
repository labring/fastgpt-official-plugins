import { z } from "zod";

export const InputSchema = z.object({
  owner: z.string(),
  repo: z.string(),
  token: z.string().optional(),
});
export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  info: z.object({
    full_name: z.string(),
    description: z.string().nullable(),
    stargazers_count: z.number(),
    forks_count: z.number(),
    open_issues_count: z.number(),
    language: z.string().nullable(),
    html_url: z.string(),
    topics: z.array(z.string()).optional(),
    created_at: z.string(),
    updated_at: z.string(),
    pushed_at: z.string(),
  }),
  readme: z.string().nullable(),
  license: z
    .object({
      key: z.string(),
      name: z.string(),
      spdx_id: z.string(),
      url: z.string().nullable(),
    })
    .nullable(),
});
export type Output = z.infer<typeof OutputSchema>;
