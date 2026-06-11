import { z } from "zod";
import {
  formatMongoError,
  intSchema,
  MongoCollectionInputSchema,
  MongoOutputType,
  optionalStringSchema,
  parseDocumentJson,
  parseOptionalDocumentJson,
  toSerializable,
  withMongo,
} from "../../../client";

export const InputType = MongoCollectionInputSchema.extend({
  filter: z.string().default("{}"),
  projection: optionalStringSchema,
  sort: optionalStringSchema,
  limit: intSchema(100, 1000),
  skip: intSchema(0, 1000000),
});

export const OutputType = MongoOutputType;

export async function tool(
  input: z.infer<typeof InputType>,
): Promise<z.infer<typeof OutputType>> {
  try {
    const filter = parseDocumentJson(input.filter, "filter");
    const projection = parseOptionalDocumentJson(
      input.projection,
      "projection",
    );
    const sort = parseOptionalDocumentJson(input.sort, "sort");

    const result = await withMongo(input, async (db) => {
      let cursor = db.collection(input.collection).find(filter);

      if (projection) {
        cursor = cursor.project(projection);
      }
      if (sort) {
        cursor = cursor.sort(sort);
      }

      return await cursor.skip(input.skip).limit(input.limit).toArray();
    });

    return {
      result: toSerializable(result),
    };
  } catch (error) {
    return Promise.reject(
      new Error(`MongoDB find error: ${formatMongoError(error)}`),
    );
  }
}
