import { MySQLInputSchema, SQLDbOutputSchema } from "../../../types";

export const InputSchema = MySQLInputSchema;
export type Input = import("../../../types").MySQLInputType;

export const OutputSchema = SQLDbOutputSchema;
export type Output = import("../../../types").SQLDbOutputType;
