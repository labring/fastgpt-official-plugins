import { z } from "zod";

const supportedDatabaseTypes = z.enum([
  "PostgreSQL",
  "MySQL",
  "Microsoft SQL Server",
]);

export const InputSchema = z
  .object({
    databaseType: supportedDatabaseTypes,
    host: z.string(),
    port: z.union([z.string(), z.number()]),
    databaseName: z.string(),
    user: z.string(),
    password: z.string(),
    sql: z.string(),
  })
  .transform((data) => ({
    ...data,
    port: typeof data.port === "string" ? parseInt(data.port, 10) : data.port,
  }));
export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  result: z.any(),
});
export type Output = z.infer<typeof OutputSchema>;
