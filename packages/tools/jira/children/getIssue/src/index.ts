import { z } from "zod";
import {
  jiraApiRequest,
  normalizeJiraIssue,
  parseFieldsInput,
  validateIssueKeyOrId,
} from "../../../client";

export const InputType = z.object({
  siteUrl: z.string().min(1, "Jira site URL is required"),
  email: z.string().min(1, "Jira account email is required"),
  apiToken: z.string().min(1, "Jira API token is required"),
  issueKeyOrId: z.string().min(1, "Issue key or ID is required"),
  fields: z.string().optional(),
});

export const OutputType = z.object({
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
});

export async function tool(
  input: z.input<typeof InputType>,
): Promise<z.infer<typeof OutputType>> {
  const { siteUrl, email, apiToken, issueKeyOrId, fields } =
    await InputType.parseAsync(input);
  const issue = validateIssueKeyOrId(issueKeyOrId, "issueKeyOrId");

  const response = await jiraApiRequest<unknown>(
    { siteUrl, email, apiToken },
    `issue/${issue}`,
    {
      query: {
        fields: parseFieldsInput(fields).join(","),
      },
    },
  );

  return OutputType.parse(normalizeJiraIssue(response, siteUrl));
}
