import { MySQLInputSchema, SQLDbOutputSchema } from "../../types";
import { main } from "./src";

export const InputType = MySQLInputSchema;
export const OutputType = SQLDbOutputSchema;
export const tool = main;
