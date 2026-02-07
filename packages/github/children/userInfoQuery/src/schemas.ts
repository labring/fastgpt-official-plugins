import { z } from "zod";

export const InputSchema = z.object({
  username: z.string(),
  token: z.string().optional(),
});
export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  userInfo: z.object({
    login: z.string(),
    id: z.number(),
    avatar_url: z.string(),
    html_url: z.string(),
    name: z.string().nullable(),
    company: z.string().nullable(),
    blog: z.string().nullable(),
    location: z.string().nullable(),
    email: z.string().nullable(),
    bio: z.string().nullable(),
    public_repos: z.number(),
    followers: z.number(),
    following: z.number(),
    created_at: z.string(),
    updated_at: z.string(),
  }),
  repos: z.array(
    z.object({
      name: z.string(),
      full_name: z.string(),
      html_url: z.string(),
      description: z.string().nullable(),
      stargazers_count: z.number(),
      forks_count: z.number(),
      language: z.string().nullable(),
      created_at: z.string(),
      updated_at: z.string(),
      pushed_at: z.string(),
    }),
  ),
});
export type Output = z.infer<typeof OutputSchema>;
