import { exportTool } from "@fastgpt-plugin/helpers/tools/helper";
import config from "./config";
import { InputType, OutputType } from "./src/schemas";
import { handler } from "./src/tool";

export default exportTool({
  handler,
  InputType,
  OutputType,
  config,
});
