import { z } from "zod";
import {
  assertSafeFilter,
  booleanSchema,
  formatMongoError,
  MongoCollectionInputSchema,
  MongoOutputType,
  parseDocumentJson,
  parseUpdateJson,
  toSerializable,
  withMongo,
} from "../../../client";

export const InputType = MongoCollectionInputSchema.extend({
  filter: z.string().min(1, "filter is required"),
  update: z.string().min(1, "update is required"),
  multi: booleanSchema(false),
  upsert: booleanSchema(false),
  allowEmptyFilter: booleanSchema(false),
});

export const OutputType = MongoOutputType;

export async function tool(
  input: z.infer<typeof InputType>,
): Promise<z.infer<typeof OutputType>> {
  try {
    const filter = parseDocumentJson(input.filter, "filter");
    const update = parseUpdateJson(input.update);
    assertSafeFilter(filter, input.allowEmptyFilter, "update");

    const result = await withMongo(input, async (db) => {
      const collection = db.collection(input.collection);
      const updateOptions = {
        upsert: input.upsert,
      };
      const updateResult = input.multi
        ? await collection.updateMany(filter, update, updateOptions)
        : await collection.updateOne(filter, update, updateOptions);

      return {
        acknowledged: updateResult.acknowledged,
        matchedCount: updateResult.matchedCount,
        modifiedCount: updateResult.modifiedCount,
        upsertedCount: updateResult.upsertedCount,
        upsertedId: updateResult.upsertedId,
      };
    });

    return {
      result: toSerializable(result),
    };
  } catch (error) {
    return Promise.reject(
      new Error(`MongoDB update error: ${formatMongoError(error)}`),
    );
  }
}
