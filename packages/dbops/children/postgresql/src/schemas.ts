import { PostgreSQLInputSchema, SQLDbOutputSchema } from "../../../types";

export const InputSchema = PostgreSQLInputSchema;
export type Input = import("../../../types").PostgreSQLInputType;

export const OutputSchema = SQLDbOutputSchema;
export type Output = import("../../../types").SQLDbOutputType;
