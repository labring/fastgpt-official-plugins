import { z } from "zod";
import {
  extractTextFromAdf,
  jiraApiRequest,
  plainTextToAdf,
  validateIssueKeyOrId,
} from "../../../client";

const JiraCommentResponseSchema = z.object({
  id: z.string().default(""),
  self: z.string().default(""),
  created: z.string().default(""),
  updated: z.string().default(""),
  body: z.unknown().optional(),
});

export const InputType = z.object({
  siteUrl: z.string().min(1, "Jira site URL is required"),
  email: z.string().min(1, "Jira account email is required"),
  apiToken: z.string().min(1, "Jira API token is required"),
  issueKeyOrId: z.string().min(1, "Issue key or ID is required"),
  body: z.string().min(1).max(10_000),
});

export const OutputType = z.object({
  id: z.string(),
  self: z.string(),
  created: z.string(),
  updated: z.string(),
  body_text: z.string(),
});

export async function tool(
  input: z.input<typeof InputType>,
): Promise<z.infer<typeof OutputType>> {
  const { siteUrl, email, apiToken, issueKeyOrId, body } =
    await InputType.parseAsync(input);
  const issue = validateIssueKeyOrId(issueKeyOrId, "issueKeyOrId");

  const response = await jiraApiRequest<unknown>(
    { siteUrl, email, apiToken },
    `issue/${issue}/comment`,
    {
      method: "POST",
      body: {
        body: plainTextToAdf(body),
      },
    },
  );
  const parsed = JiraCommentResponseSchema.parse(response);

  return OutputType.parse({
    id: parsed.id,
    self: parsed.self,
    created: parsed.created,
    updated: parsed.updated,
    body_text: extractTextFromAdf(parsed.body),
  });
}
