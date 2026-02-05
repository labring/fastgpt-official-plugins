import { exportTool } from "@fastgpt-plugin/helpers/tools/helper";
import config from "./config";
import { InputType, OutputType } from "./src/schemas";
import { tool as toolCb } from "./src/tool";

export default exportTool({
  toolCb,
  InputType,
  OutputType,
  config,
});
