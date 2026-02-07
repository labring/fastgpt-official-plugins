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
  { owner, repo, token }: Input,
  _ctx: ToolContextType,
): Promise<Output> {
  // 1. 仓库基本信息
  const info = await fetchGithub(
    `https://api.github.com/repos/${owner}/${repo}`,
    token,
  );
  // 2. README（markdown 原文）
  let readme: string | null = null;
  try {
    const readmeData = await fetchGithub(
      `https://api.github.com/repos/${owner}/${repo}/readme`,
      token,
    );
    if (readmeData?.content) {
      readme = Buffer.from(readmeData.content, "base64").toString("utf-8");
    }
  } catch {
    readme = null;
  }
  // 3. license
  let license = null;
  if (info.license) {
    license = {
      key: info.license.key,
      name: info.license.name,
      spdx_id: info.license.spdx_id,
      url: info.license.url,
    };
  }
  return {
    info: {
      full_name: info.full_name,
      description: info.description,
      stargazers_count: info.stargazers_count,
      forks_count: info.forks_count,
      open_issues_count: info.open_issues_count,
      language: info.language,
      html_url: info.html_url,
      topics: info.topics || [],
      created_at: info.created_at,
      updated_at: info.updated_at,
      pushed_at: info.pushed_at,
    },
    readme,
    license,
  };
}
