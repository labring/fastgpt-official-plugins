import { SQLDbOutputSchema, SQLServerInputSchema } from "../../../types";

export const InputSchema = SQLServerInputSchema;
export type Input = import("../../../types").SQLServerInputType;

export const OutputSchema = SQLDbOutputSchema;
export type Output = import("../../../types").SQLDbOutputType;
