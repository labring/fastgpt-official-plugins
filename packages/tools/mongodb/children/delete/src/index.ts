import { z } from "zod";
import {
  assertSafeFilter,
  booleanSchema,
  formatMongoError,
  MongoCollectionInputSchema,
  MongoOutputType,
  parseDocumentJson,
  toSerializable,
  withMongo,
} from "../../../client";

export const InputType = MongoCollectionInputSchema.extend({
  filter: z.string().min(1, "filter is required"),
  multi: booleanSchema(false),
  allowEmptyFilter: booleanSchema(false),
});

export const OutputType = MongoOutputType;

export async function tool(
  input: z.infer<typeof InputType>,
): Promise<z.infer<typeof OutputType>> {
  try {
    const filter = parseDocumentJson(input.filter, "filter");
    assertSafeFilter(filter, input.allowEmptyFilter, "delete");

    const result = await withMongo(input, async (db) => {
      const collection = db.collection(input.collection);
      const deleteResult = input.multi
        ? await collection.deleteMany(filter)
        : await collection.deleteOne(filter);

      return {
        acknowledged: deleteResult.acknowledged,
        deletedCount: deleteResult.deletedCount,
      };
    });

    return {
      result: toSerializable(result),
    };
  } catch (error) {
    return Promise.reject(
      new Error(`MongoDB delete error: ${formatMongoError(error)}`),
    );
  }
}
