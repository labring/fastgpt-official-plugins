import type { ToolContextType } from "@fastgpt-plugin/helpers/tools/schemas/req";
import type { Input, Output } from "./schemas";

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function handler(
  props: Input,
  _ctx: ToolContextType,
): Promise<Output> {
  const url = "https://api.siliconflow.cn/v1/video";
  const { authorization, ...params } = props;

  const submitBody = Object.fromEntries(
    Object.entries({
      model: params.model,
      prompt: params.prompt,
      image_size: params.image_size,
      negative_prompt: params.negative_prompt,
      seed: params.seed,
      image: params.image,
    }).filter(([, value]) => value !== undefined),
  );

  // 1. Submit generation task
  const submitRes = await fetch(`${url}/submit`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${authorization}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(submitBody),
  });

  const submitData = await submitRes.json();
  if (!submitRes.ok || !submitData.requestId) {
    return Promise.reject(
      `Task submission failed: ${submitData?.message || submitRes.statusText}`,
    );
  }

  // 2. Poll for result
  let statusRes: Response | undefined;
  let statusData: any;
  for (let i = 0; i < 180; i++) {
    await delay(3000);
    statusRes = await fetch(`${url}/status`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authorization}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ requestId: submitData.requestId }),
    });
    statusData = await statusRes.json();
    if (statusData.status === "Succeed" || statusData.status === "Failed") {
      break;
    }
  }

  if (!statusRes || !statusRes.ok) {
    return Promise.reject(
      `Failed to get result: ${statusData?.message || statusRes?.statusText}`,
    );
  }

  return {
    status: statusData.status,
    results: {
      ...statusData.results,
      videos: Array.isArray(statusData.results?.videos)
        ? statusData.results.videos.map((item: any) =>
            typeof item === "string" ? item : item.url,
          )
        : [],
    },
    url: statusData.results?.videos?.[0]?.url,
  };
}
