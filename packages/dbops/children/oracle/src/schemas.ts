import { OracleInputSchema, SQLDbOutputSchema } from "../../../types";

export const InputSchema = OracleInputSchema;
export type Input = import("../../../types").OracleInputType;

export const OutputSchema = SQLDbOutputSchema;
export type Output = import("../../../types").SQLDbOutputType;
