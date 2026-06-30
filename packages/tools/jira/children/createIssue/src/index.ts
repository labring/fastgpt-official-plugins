import { z } from "zod";
import {
  compactObject,
  jiraApiRequest,
  normalizeSiteUrl,
  parseJsonObjectInput,
  plainTextToAdf,
  validateProjectKey,
} from "../../../client";

const JiraCreateIssueResponseSchema = z.object({
  id: z.string().default(""),
  key: z.string().default(""),
  self: z.string().default(""),
});

const RESERVED_FIELDS = new Set([
  "project",
  "issuetype",
  "summary",
  "description",
]);

export const InputType = z.object({
  siteUrl: z.string().min(1, "Jira site URL is required"),
  email: z.string().min(1, "Jira account email is required"),
  apiToken: z.string().min(1, "Jira API token is required"),
  projectKey: z.string().min(1, "Project key is required"),
  issueTypeName: z.string().min(1).max(80).default("Task"),
  summary: z.string().min(1).max(255),
  description: z.string().max(10_000).optional(),
  additionalFieldsJson: z.string().optional(),
});

export const OutputType = z.object({
  id: z.string(),
  key: z.string(),
  self: z.string(),
  url: z.string(),
});

export async function tool(
  input: z.input<typeof InputType>,
): Promise<z.infer<typeof OutputType>> {
  const {
    siteUrl,
    email,
    apiToken,
    projectKey,
    issueTypeName,
    summary,
    description,
    additionalFieldsJson,
  } = await InputType.parseAsync(input);

  const additionalFields =
    parseJsonObjectInput(additionalFieldsJson, "additionalFieldsJson") ?? {};
  rejectReservedFields(additionalFields);

  const fields = compactObject({
    ...additionalFields,
    project: { key: validateProjectKey(projectKey) },
    issuetype: { name: issueTypeName },
    summary,
    description:
      description === undefined || description.trim() === ""
        ? undefined
        : plainTextToAdf(description),
  });

  const response = await jiraApiRequest<unknown>(
    { siteUrl, email, apiToken },
    "issue",
    {
      method: "POST",
      body: { fields },
    },
  );
  const parsed = JiraCreateIssueResponseSchema.parse(response);

  return OutputType.parse({
    id: parsed.id,
    key: parsed.key,
    self: parsed.self,
    url:
      parsed.key === ""
        ? ""
        : `${normalizeSiteUrl(siteUrl)}/browse/${parsed.key}`,
  });
}

function rejectReservedFields(fields: Record<string, unknown>): void {
  for (const field of Object.keys(fields)) {
    if (RESERVED_FIELDS.has(field)) {
      throw new Error(
        `additionalFieldsJson cannot override reserved field: ${field}`,
      );
    }
  }
}
