import type { ToolContextType } from "@fastgpt-plugin/helpers/tools/schemas/req";
import type { Input, Output } from "./schemas";

type CreatePPTResponse = {
  id: string;
  images_url: {
    url: string;
    time: number;
  }[];
  note_status: number;
  introduce: string;
  ppt_title: string;
  page_count: number;
  progress: number;
  status: number;
  first_image_up_at: string;
  created_at: string;
  updated_at: string;
  state_description: string;
  process_url: string;
  preview_url: string;
};

const CHATPPT_BASE_URL = "https://saas.api.yoo-ai.com";

export async function handler(
  input: Input,
  _ctx: ToolContextType,
): Promise<Output> {
  const { apiKey, text, color } = input;
  const token = `Bearer ${apiKey}`;

  const createRes = await fetch(`${CHATPPT_BASE_URL}/apps/ppt-create`, {
    method: "POST",
    headers: {
      Authorization: token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text, color }),
  });
  if (!createRes.ok) {
    return Promise.reject(`Failed to create PPT: ${createRes.statusText}`);
  }
  const createPPTRes = (await createRes.json()) as { data: { id: string } };

  const id = createPPTRes?.data?.id;
  if (!id || typeof id !== "string") {
    return Promise.reject("Failed to create PPT: empty id");
  }

  const getRes = await fetch(
    `${CHATPPT_BASE_URL}/apps/ppt-result?id=${encodeURIComponent(id)}`,
    {
      method: "GET",
      headers: {
        Authorization: token,
      },
    },
  );
  if (!getRes.ok) {
    return Promise.reject(`Failed to fetch PPT result: ${getRes.statusText}`);
  }
  const getPPTUrlRes = (await getRes.json()) as { data: CreatePPTResponse };

  const preview_url = getPPTUrlRes?.data?.preview_url;
  if (!preview_url || typeof preview_url !== "string") {
    return Promise.reject("Failed to fetch PPT preview url");
  }

  return {
    preview_url,
  };
}
