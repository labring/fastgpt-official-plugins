import { z } from "zod";
import {
  formatMongoError,
  MongoCollectionInputSchema,
  MongoOutputType,
  parseDocumentsJson,
  toSerializable,
  withMongo,
} from "../../../client";

export const InputType = MongoCollectionInputSchema.extend({
  documents: z.string().min(1, "documents is required"),
});

export const OutputType = MongoOutputType;

export async function tool(
  input: z.infer<typeof InputType>,
): Promise<z.infer<typeof OutputType>> {
  try {
    const documents = parseDocumentsJson(input.documents);

    const result = await withMongo(input, async (db) => {
      const collection = db.collection(input.collection);

      if (Array.isArray(documents)) {
        const insertResult = await collection.insertMany(documents);
        return {
          insertedCount: insertResult.insertedCount,
          insertedIds: insertResult.insertedIds,
          acknowledged: insertResult.acknowledged,
        };
      }

      const insertResult = await collection.insertOne(documents);
      return {
        insertedCount: 1,
        insertedId: insertResult.insertedId,
        acknowledged: insertResult.acknowledged,
      };
    });

    return {
      result: toSerializable(result),
    };
  } catch (error) {
    return Promise.reject(
      new Error(`MongoDB insert error: ${formatMongoError(error)}`),
    );
  }
}
