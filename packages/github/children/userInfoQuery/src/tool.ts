import type { ToolContextType } from "@fastgpt-plugin/helpers/tools/schemas/req";
import type { Input, Output } from "./schemas";

async function fetchGithub(url: string, token?: string) {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(url, { headers });
  if (!res.ok)
    throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
  return res.json();
}

export async function handler(
  { username, token }: Input,
  _ctx: ToolContextType,
): Promise<Output> {
  const userInfo = await fetchGithub(
    `https://api.github.com/users/${username}`,
    token,
  );
  const repos = await fetchGithub(
    `https://api.github.com/users/${username}/repos?per_page=100`,
    token,
  );
  return {
    userInfo,
    repos: Array.isArray(repos) ? repos : [],
  };
}
