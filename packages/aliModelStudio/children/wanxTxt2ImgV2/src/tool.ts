import type { ToolContextType } from "@fastgpt-plugin/helpers/tools/schemas/req";
import type { Input, Output } from "./schemas";

function getErrText(err: any, def = ""): string {
  const msg: string =
    typeof err === "string"
      ? err
      : err?.response?.data?.message ||
        err?.response?.message ||
        err?.message ||
        err?.response?.data?.msg ||
        err?.response?.msg ||
        err?.msg ||
        def;
  return msg;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Task status enumeration
enum TaskStatus {
  PENDING = "PENDING", // Task in queue
  RUNNING = "RUNNING", // Task processing
  SUCCEEDED = "SUCCEEDED", // Task execution successful
  FAILED = "FAILED", // Task execution failed
  CANCELED = "CANCELED", // Task cancellation successful
  UNKNOWN = "UNKNOWN", // Task does not exist or status unknown
}

export async function handler(
  {
    apiKey,
    prompt,
    model = "wanx2.1-t2i-turbo",
    negative_prompt,
    size = "1024*1024",
    n = 1,
    seed,
    prompt_extend = false,
    watermark = false,
  }: Input,
  _ctx: ToolContextType,
): Promise<Output> {
  try {
    // Step 1: Create task and get task ID
    const createTaskResponse = await fetch(
      "https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          "X-DashScope-Async": "enable",
        },
        body: JSON.stringify({
          model,
          input: {
            prompt,
            ...(negative_prompt && { negative_prompt }),
          },
          parameters: {
            size,
            n,
            ...(seed !== undefined && { seed }),
            prompt_extend,
            watermark,
          },
        }),
      },
    );

    const createTaskData = await createTaskResponse.json();
    const taskId = createTaskData?.output?.task_id;
    if (!taskId) {
      return Promise.reject({
        error: "Failed to create task, task ID not obtained",
      });
    }

    // Step 2: Poll for task results
    const maxRetries = 60; // Maximum retry count, about 3 minutes (60 * 3 seconds = 180 seconds)
    let retryCount = 0;

    while (retryCount < maxRetries) {
      await delay(3000); // Wait 3 seconds

      try {
        const queryResponse = await fetch(
          `https://dashscope.aliyuncs.com/api/v1/tasks/${taskId}`,
          {
            headers: {
              Authorization: `Bearer ${apiKey}`,
            },
          },
        );

        const queryData = await queryResponse.json();
        const taskStatus = queryData?.output?.task_status;
        if (taskStatus === TaskStatus.SUCCEEDED) {
          // Task successful, process results
          const results = queryData?.output?.results || [];

          // Print results JSON structure
          const images = [];

          for (const result of results) {
            if (result.url) {
              // Use Alibaba Cloud provided image URL directly, no need to upload to local storage
              images.push(result.url);
            }
          }

          return {
            images,
          };
        } else if (taskStatus === TaskStatus.FAILED) {
          return Promise.reject({
            error: "Image generation task failed",
          });
        } else if (taskStatus === TaskStatus.CANCELED) {
          return Promise.reject({
            error: "Image generation task was canceled",
          });
        }
        // Task still in progress, continue polling
      } catch (queryError) {
        return Promise.reject({
          error: getErrText(queryError, "Failed to query task status"),
        });
      }

      retryCount++;
    }

    // Timeout
    return Promise.reject({
      error: "Image generation timeout, please try again later",
    });
  } catch (error: any) {
    return Promise.reject({
      error: getErrText(error, "Text-to-image request failed"),
    });
  }
}
