import { OracleInputSchema, SQLDbOutputSchema } from '../../types';
import { main } from './src';

export const InputType = OracleInputSchema;
export const OutputType = SQLDbOutputSchema;
export const tool = main;
