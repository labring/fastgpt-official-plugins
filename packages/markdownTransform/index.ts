import { exportTool } from "@fastgpt-plugin/helpers/tools/helper";
import config from "./config";
import { FormatSchema, InputSchema, OutputSchema } from "./src/schemas";
import { tool as toolCb } from "./src/tool";

export default exportTool({
  toolCb,
  InputSchema: InputSchema.extend({ format: FormatSchema }),
  OutputSchema,
  config,
});
