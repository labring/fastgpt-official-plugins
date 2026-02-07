import { ClickHouseInputSchema, SQLDbOutputSchema } from "../../../types";

export const InputSchema = ClickHouseInputSchema;
export type Input = import("../../../types").ClickHouseInputType;

export const OutputSchema = SQLDbOutputSchema;
export type Output = import("../../../types").SQLDbOutputType;
