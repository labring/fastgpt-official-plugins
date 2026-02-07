import type { ToolContextType } from "@fastgpt-plugin/helpers/tools/schemas/req";
import { ErrorCodeMap } from "../../../constants";
import type { Input, Output } from "./schemas";

const MINIMAX_BASE_URL = "https://api.minimaxi.com/v1";

export async function handler(
  {
    apiKey,
    text,
    model,
    voice_id,
    speed,
    vol,
    pitch,
    emotion,
    english_normalization,
  }: Input,
  _ctx: ToolContextType,
): Promise<Output> {
  const headers = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };

  const response = await fetch(`${MINIMAX_BASE_URL}/t2a_v2`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model,
      text,
      stream: false,
      language_boost: "auto",
      voice_setting: {
        voice_id,
        speed,
        vol,
        pitch,
        ...(emotion && { emotion }),
        english_normalization,
      },
    }),
  });

  const syncData = await response.json();

  if (syncData.base_resp.status_code !== 0) {
    return Promise.reject(
      ErrorCodeMap[syncData.base_resp.status_code as keyof typeof ErrorCodeMap],
    );
  }

  // convert hex audio data to buffer
  const hexAudioData = syncData.data.audio;
  const audioBuffer = Buffer.from(hexAudioData, "hex");
  if (audioBuffer.length === 0) {
    return Promise.reject("Failed to convert audio data");
  }

  const { accessUrl: audioUrl } = await _ctx.emitter.uploadFile({
    buffer: audioBuffer,
    defaultFilename: "minimax_tts.mp3",
  });
  if (!audioUrl) {
    return Promise.reject("Failed to upload audio file");
  }

  return { audioUrl };
}
