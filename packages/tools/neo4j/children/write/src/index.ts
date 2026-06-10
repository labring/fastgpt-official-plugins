import type { z } from "zod";
import {
  BaseNeo4jInputSchema,
  CypherOutputSchema,
  executeCypher,
} from "../../../client";

export const InputType = BaseNeo4jInputSchema;
export const OutputType = CypherOutputSchema;

export async function tool(
  input: z.infer<typeof InputType>,
): Promise<z.infer<typeof OutputType>> {
  return executeCypher(input, "write");
}
