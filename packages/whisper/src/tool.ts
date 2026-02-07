import type { ToolContextType } from "@fastgpt-plugin/helpers/tools/schemas/req";
import type { Input, Output } from "./schemas";

// convert file input (URL or base64) to File object
async function inputToFile(file: string): Promise<File> {
  if (file.startsWith("http://") || file.startsWith("https://")) {
    const response = await fetch(file);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch audio file: ${response.status} ${response.statusText}`,
      );
    }
    const blob = await response.blob();
    return new File([blob], "audio.m4a", {
      type: blob.type || "audio/m4a",
    });
  }
  // if base64 has "data:" prefix
  if (file.startsWith("data:")) {
    const base64Match = file.match(/^data:audio\/[^;]+;base64,(.+)$/);
    if (!base64Match || !base64Match[1]) {
      throw new Error(
        "Invalid base64 format. Please provide a valid base64 data.",
      );
    }
    const binaryString = atob(base64Match[1]);
    const bytes = Uint8Array.from(binaryString, (c) => c.charCodeAt(0));
    return new File([bytes], "audio.m4a", { type: "audio/m4a" });
  }
  // if base64 is pure base64 string
  if (file.match(/^[A-Za-z0-9+/=]+$/)) {
    const binaryString = atob(file);
    const bytes = Uint8Array.from(binaryString, (c) => c.charCodeAt(0));
    return new File([bytes], "audio.m4a", { type: "audio/m4a" });
  }
  throw new Error("Invalid file format. Please provide a URL or base64 data.");
}

export async function handler(
  { baseUrl, apiKey, file, model }: Input,
  _ctx: ToolContextType,
): Promise<Output> {
  // Convert file input to File object
  const audioFile = await inputToFile(file);
  if (audioFile.size === 0) {
    throw new Error("Audio file is empty");
  }

  const formData = new FormData();
  formData.append("file", audioFile);
  formData.append("model", model);

  const response = await fetch(`${baseUrl}/audio/transcriptions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(
      `Whisper API request failed: ${response.status} ${response.statusText}`,
    );
  }

  const data = await response.json();

  const text = data?.text;
  if (!text) {
    throw new Error("No transcription text found in response");
  }

  return { text };
}
