import { z } from "zod";

const SUPPORTED_FLAGS = /^[gimsuyd]*$/;

export const InputType = z.object({
  text: z.string(),
  pattern: z.string().min(1),
  flags: z.string().optional().default(""),
  group: z.union([z.string(), z.number()]).optional(),
});

export const OutputType = z.object({
  matches: z.array(z.string()),
  firstMatch: z.string().optional(),
  count: z.number(),
  error: z.string().optional(),
});

type RegexExtractInput = z.infer<typeof InputType>;
type RegexExtractOutput = z.infer<typeof OutputType>;

function normalizeFlags(flags: string): string {
  if (!SUPPORTED_FLAGS.test(flags)) {
    throw new Error("flags 仅支持 g、i、m、s、u、y、d");
  }

  const uniqueFlags = new Set(flags.split(""));
  uniqueFlags.add("g");
  return [...uniqueFlags].join("");
}

function pickGroup(
  match: RegExpExecArray,
  group?: string | number,
): string | undefined {
  if (group === undefined || group === "") {
    return match[1] ?? match[0];
  }

  if (typeof group === "number" || /^\d+$/.test(group)) {
    const index = Number(group);
    return match[index];
  }

  return match.groups?.[group];
}

export async function tool({
  text,
  pattern,
  flags,
  group,
}: RegexExtractInput): Promise<RegexExtractOutput> {
  let regex: RegExp;

  try {
    regex = new RegExp(pattern, normalizeFlags(flags));
  } catch (error) {
    return {
      matches: [],
      count: 0,
      error: error instanceof Error ? error.message : String(error),
    };
  }

  const matches: string[] = [];
  let match = regex.exec(text);

  while (match !== null) {
    const value = pickGroup(match, group);
    if (value !== undefined) {
      matches.push(value);
    }

    if (match[0] === "") {
      regex.lastIndex += 1;
    }

    match = regex.exec(text);
  }

  const output: RegexExtractOutput = {
    matches,
    count: matches.length,
  };

  if (matches[0] !== undefined) {
    output.firstMatch = matches[0];
  }

  return output;
}
