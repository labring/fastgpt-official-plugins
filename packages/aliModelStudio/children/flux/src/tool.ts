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

// Task status enum
enum TaskStatus {
  PENDING = "PENDING", // Task is queued
  RUNNING = "RUNNING", // Task is processing
  SUCCEEDED = "SUCCEEDED", // Task succeeded
  FAILED = "FAILED", // Task failed
  CANCELED = "CANCELED", // Task was canceled
  UNKNOWN = "UNKNOWN", // Task does not exist or status unknown
}

export async function handler(
  {
    apiKey,
    prompt,
    model = "flux-schnell",
    size = "1024*1024",
    seed,
    steps,
    guidance,
    offload,
    add_sampling_metadata,
  }: Input,
  _ctx: ToolContextType,
): Promise<Output> {
  try {
    // Step 1: Create task and get task ID
    const requestBody = {
      model,
      input: {
        prompt,
      },
      parameters: {
        size,
        ...(seed !== undefined && { seed }),
        ...(steps !== undefined && { steps }),
        ...(guidance !== undefined && { guidance }),
        ...(offload !== undefined && { offload }),
        ...(add_sampling_metadata !== undefined && {
          add_sampling_metadata,
        }),
      },
    };

    const createTaskResponse = await fetch(
      "https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          "X-DashScope-Async": "enable",
        },
        body: JSON.stringify(requestBody),
      },
    );
    const createTaskData = await createTaskResponse.json();
    const taskId = createTaskData?.output?.task_id;
    if (!taskId) {
      return Promise.reject({
        error: "Failed to create task, no task ID received.",
      });
    }

    // Step 2: Poll for task result
    const maxRetries = 60; // Maximum retries, about 3 minutes (60 * 3s = 180s)
    let retryCount = 0;

    while (retryCount < maxRetries) {
      await delay(3000); // Wait for 3 seconds

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
          // Task succeeded, process result
          const results = queryData?.output?.results || [];

          const images = [];

          for (const result of results) {
            if (result.url) {
              // Use the image URL provided by Aliyun directly
              images.push(result.url);
            }
          }

          return {
            images,
          };
        } else if (taskStatus === TaskStatus.FAILED) {
          const errorMessage =
            queryData?.output?.message || "Image generation task failed.";
          return Promise.reject({
            error: errorMessage,
          });
        } else if (taskStatus === TaskStatus.CANCELED) {
          return Promise.reject({
            error: "Image generation task was canceled.",
          });
        }
        // Task is still in progress, continue polling
      } catch (queryError) {
        return Promise.reject({
          error: getErrText(queryError, "Failed to query task status."),
          task_id: taskId,
          task_status: "UNKNOWN",
        });
      }

      retryCount++;
    }

    // Timeout
    return Promise.reject({
      error: "Image generation timed out, please try again later.",
    });
  } catch (error: unknown) {
    return Promise.reject({
      error: getErrText(error, "FLUX text-to-image request failed."),
    });
  }
}
