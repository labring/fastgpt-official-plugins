import { PostgreSQLInputSchema, SQLDbOutputSchema } from '../../types';
import { main } from './src';

export const InputType = PostgreSQLInputSchema;
export const OutputType = SQLDbOutputSchema;
export const tool = main;
