import { z } from "zod";
import {
  booleanSchema,
  formatMongoError,
  intSchema,
  MongoCollectionInputSchema,
  MongoOutputType,
  parsePipelineJson,
  toSerializable,
  withMongo,
} from "../../../client";

export const InputType = MongoCollectionInputSchema.extend({
  pipeline: z.string().min(1, "pipeline is required"),
  limit: intSchema(100, 1000),
  allowDiskUse: booleanSchema(false),
});

export const OutputType = MongoOutputType;

export async function tool(
  input: z.infer<typeof InputType>,
): Promise<z.infer<typeof OutputType>> {
  try {
    const pipeline = parsePipelineJson(input.pipeline);

    const result = await withMongo(input, async (db) => {
      return await db
        .collection(input.collection)
        .aggregate(pipeline, {
          allowDiskUse: input.allowDiskUse,
        })
        .limit(input.limit)
        .toArray();
    });

    return {
      result: toSerializable(result),
    };
  } catch (error) {
    return Promise.reject(
      new Error(`MongoDB aggregate error: ${formatMongoError(error)}`),
    );
  }
}
