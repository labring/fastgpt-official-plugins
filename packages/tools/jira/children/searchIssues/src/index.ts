import { z } from "zod";
import {
  compactObject,
  jiraApiRequest,
  normalizeJiraIssue,
  parseFieldsInput,
} from "../../../client";

const JiraSearchResponseSchema = z.object({
  issues: z.array(z.unknown()).default([]),
  nextPageToken: z.string().optional(),
  isLast: z.boolean().optional(),
});

export const InputType = z.object({
  siteUrl: z.string().min(1, "Jira site URL is required"),
  email: z.string().min(1, "Jira account email is required"),
  apiToken: z.string().min(1, "Jira API token is required"),
  jql: z.string().min(1, "JQL is required").max(2_000),
  maxResults: z.number().int().min(1).max(50).default(10),
  nextPageToken: z.string().min(1).optional(),
  fields: z.string().optional(),
});

export const OutputType = z.object({
  issues: z.array(
    z.object({
      id: z.string(),
      key: z.string(),
      url: z.string(),
      summary: z.string(),
      status: z.string(),
      issue_type: z.string(),
      project_key: z.string(),
      assignee: z.string(),
      reporter: z.string(),
      priority: z.string(),
      created: z.string(),
      updated: z.string(),
      fields_json: z.string(),
    }),
  ),
  is_last: z.boolean(),
  next_page_token: z.string(),
});

export async function tool(
  input: z.input<typeof InputType>,
): Promise<z.infer<typeof OutputType>> {
  const { siteUrl, email, apiToken, jql, maxResults, nextPageToken, fields } =
    await InputType.parseAsync(input);

  const response = await jiraApiRequest<unknown>(
    { siteUrl, email, apiToken },
    "search/jql",
    {
      method: "POST",
      body: compactObject({
        jql,
        maxResults,
        nextPageToken,
        fields: parseFieldsInput(fields),
      }),
    },
  );
  const parsed = JiraSearchResponseSchema.parse(response);

  return OutputType.parse({
    issues: parsed.issues.map((issue) => normalizeJiraIssue(issue, siteUrl)),
    is_last: parsed.isLast ?? false,
    next_page_token: parsed.nextPageToken ?? "",
  });
}
