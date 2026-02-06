import { exportTool } from "@fastgpt-plugin/helpers/tools/helper";
import config from "./config";
import { FormatSchema, InputSchema, OutputSchema } from "./src/schemas";
import { handler } from "./src/tool";

export default exportTool({
  handler,
  InputSchema: InputSchema.extend({ format: FormatSchema }),
  OutputSchema,
  config,
});
