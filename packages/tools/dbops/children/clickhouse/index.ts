import { ClickHouseInputSchema, SQLDbOutputSchema } from '../../types';
import { main } from './src';

export const InputType = ClickHouseInputSchema;
export const OutputType = SQLDbOutputSchema;
export const tool = main;
