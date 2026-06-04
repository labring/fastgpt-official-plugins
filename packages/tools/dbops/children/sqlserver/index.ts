import { SQLServerInputSchema, SQLDbOutputSchema } from '../../types';
import { main } from './src';

export const InputType = SQLServerInputSchema;
export const OutputType = SQLDbOutputSchema;
export const tool = main;
