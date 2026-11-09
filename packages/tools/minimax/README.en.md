# MiniMax Speech Synthesis Tool Set (MiniMax TTS Tool Set)

The MiniMax Speech Synthesis Tool Set is an official FastGPT plugin providing high-fidelity, emotionally expressive text-to-speech (TTS) synthesis. Powered by MiniMax's state-of-the-art voice generation models (including the flagship Speech 2.5 and Speech 02 architectures), it delivers human-level vocal expression, a rich set of natural voices, versatile emotional styles, and fine-grained acoustic control over speed, pitch, and volume.

The plugin features a built-in audio persistence mechanism. Upon synthesis completion, the audio file is automatically uploaded to storage using FastGPT's host file upload capability, producing a permanent, high-availability direct URL (MP3 format) that seamlessly integrates into AI agent workflows, knowledge base Q&A bots, and interactive voice applications.

---

## Typical Application Scenarios

- **Human-like Customer Service Voice Broadcasts**: Deliver lifelike and natural voice responses for AI customer service agents, turning text replies into fluent spoken audio in real time and creating a warm, engaging user experience.
- **Audiobooks and Children's Story Generation**: Switch flexibly between expressive young female, mature intellectual female, youthful male, and executive male voices. Layer emotional styles such as happiness, sorrow, or surprise to craft immersive audio dramas and bedtime stories.
- **Multimodal Video Narration and Courseware Voiceover**: Pair with video generation pipelines, automated presentation slide decks, or online courses to batch-generate clean, standard, and authentic bilingual narrations, dramatically reducing multimedia production cycles.
- **Multi-Emotion Interactive Voice Assistants**: Build highly dynamic two-way voice conversations in AI companion bots, virtual assistants, and game NPCs, dynamically adapting pitch, speed, and emotional tone to match conversational context.

---

## Secret and Credential Configuration

To use this plugin, you must configure an API key (`apiKey`) obtained from the MiniMax Open Platform.

### How to Obtain an API Key

1. Visit the [MiniMax Open Platform](https://api.minimax.chat) (or [MiniMax Global](https://intl.minimaxi.com) for international users) to register and sign in.
2. Navigate to the Developer Console, and click **"Account Management" -> "API Keys"** in the left sidebar (or directly open the API Keys page).
3. Click **"Create New Key"**, and copy your generated API Key string (store it securely and do not share it publicly).
4. Ensure your account has sufficient available balance or a valid payment method configured (new accounts typically receive initial trial credits).

### Configuration in FastGPT

In the FastGPT Plugin Management or Toolset Configuration panel, configure the following field:

| Configuration Item | Field Name | Type | Required | Encrypted (`isSecret`) | Description & Guidelines |
| :--- | :--- | :--- | :---: | :---: | :--- |
| **API Key** | `apiKey` | String (`string`) | **Yes** | Yes (`true`) | MiniMax Open Platform API Key. Automatically passed as a `Bearer Token` in the `Authorization` header on all underlying HTTP requests for identity verification and quota accounting. |

---

## Sub-Tools List

This tool set currently provides the following core sub-tool:

| Sub-Tool ID | Sub-Tool Name | Description |
| :--- | :--- | :--- |
| `tts` | **minmax Text-to-Speech**<br>(MiniMax Text-to-Speech) | MiniMax high-fidelity multi-emotion text-to-speech synthesis. Invokes the MiniMax T2A v2 API with support for multiple foundation models, rich voice profiles, acoustic tuning, and emotional styles, automatically outputting a persistent direct audio URL. |

---

## Sub-Tool: tts (MiniMax Text-to-Speech)

### Input Parameters

When invoked in a FastGPT workflow or via an AI agent tool call, the `tts` sub-tool accepts the following input parameters:

| Parameter Name | Field Name | Type | Required | Default / Recommended | Value Range | Description & Examples |
| :--- | :--- | :--- | :---: | :---: | :--- | :--- |
| **Text** | `text` | string | **Yes** | None | Non-empty string | **Text content to convert to speech**. Recommended under 5,000 characters per single request. For long articles, consider splitting text into chunks in an upstream workflow step. |
| **Model** | `model` | enum string | **Yes** | `speech-2.5-hd-preview` | See options | **MiniMax speech synthesis model version**:<br>• `speech-2.5-hd-preview`: **(Recommended)** MiniMax 2.5 HD model, delivering the highest realism, natural rhythm, and fine-grained emotional nuances.<br>• `speech-2.5-turbo-preview`: MiniMax 2.5 Turbo model, combining high-fidelity audio with ultra-low latency, optimal for real-time conversational agents.<br>• `speech-02-hd`: MiniMax 02 HD model, offering stable cadence and excellent multilingual performance.<br>• `speech-02-turbo`: MiniMax 02 Turbo model, designed for high-throughput and rapid generation.<br>• `speech-01-hd`: Classic MiniMax 01 HD model.<br>• `speech-01-turbo`: Classic MiniMax 01 Turbo model. |
| **Voice** | `voice_id` | enum string | **Yes** | `female-shaonv` | See options | **Voice ID for synthesis**:<br>• `female-shaonv`: **Youthful Female**, sweet, vibrant, and clear; ideal for customer support, voice assistants, and children's stories.<br>• `female-chengshu`: **Mature Female**, intellectual, calm, and polished; ideal for news bulletins, audiobooks, corporate training, and educational content.<br>• `male-qn-qingse`: **Youthful Male**, warm, gentle, and authentic; ideal for everyday companions, campus narration, and casual audio.<br>• `male-qn-jingying`: **Elite Male**, deep, resonant, and professional; ideal for business briefings, financial updates, and official announcements. |
| **Speech Speed** | `speed` | number | **Yes** | `1.0` | `0.5` ~ `2.0` | **Speech playback speed**. Higher values speak faster:<br>• `1.0`: Normal speech speed (recommended default)<br>• `1.2` ~ `1.5`: Rapid news flashes or fast skimming<br>• `0.8` ~ `0.9`: Storytelling, poetry, or slow-paced language teaching. |
| **Volume** | `vol` | number | **Yes** | `1.0` | `0.1` ~ `10.0` | **Speech volume output**. Higher values are louder; default is `1.0`. |
| **Pitch** | `pitch` | number | **Yes** | `0` | `-12` ~ `12` | **Speech pitch adjustment** (in semitones). Higher values raise the pitch; negative values lower the pitch:<br>• `0`: Standard natural pitch<br>• `+1` ~ `+3`: Cheerful, energetic, or more youthful<br>• `-1` ~ `-3`: Deeper, mature, or more formal. |
| **Emotion** | `emotion` | enum string | No | `""` (Neutral) | See options | **Emotional style of the generated speech** (best supported on `speech-2.5` and `speech-02`):<br>• `""` (Empty string): Natural neutral tone<br>• `happy`: Cheerful, joyful, enthusiastic<br>• `sad`: Melancholic, low, sorrowful<br>• `angry`: Stern, agitated, indignant<br>• `fearful`: Anxious, timid, apprehensive<br>• `disgusted`: Repulsed, disaffected<br>• `surprised`: Astonished, unexpected<br>• `calm`: Serene, composed, gentle. |
| **English Normalization** | `english_normalization` | boolean | **Yes** | `true` | `true` / `false` | **English text normalization**. When enabled, improves the pronunciation and fluency of English numbers, abbreviations, metric symbols, and mixed phrases with a minor latency increase. Recommended to set to `true`. |

---

### Output Results

Upon successful speech synthesis, the `tts` sub-tool returns the following output field:

| Field Name | Type | Description & Example |
| :--- | :--- | :--- |
| `audioUrl` | String (`string`) | **Direct persistent URL of the synthesized audio file**. The audio is encoded as standard MP3 and stored via FastGPT's host file upload capability, providing permanent validity and public access. |

#### Output JSON Example

```json
{
  "audioUrl": "https://fastgpt.example.com/api/system/file/view?fileId=66b4d32e92c43801f98d1a2f&filename=minimax_tts.mp3"
}
```

> **Audio Persistence Mechanism**:
>
> The plugin declares `permission: ["file-upload:allow"]` in its manifest. When the MiniMax T2A v2 API returns hex-encoded raw audio data, the plugin automatically decodes it into a binary Buffer and invokes FastGPT's host `uploadFile` method to store the MP3 in object storage. This returns a permanent and publicly accessible direct URL (`audioUrl`). If executed in a standalone test environment outside FastGPT, it automatically falls back to an immediately playable Base64 Data URL.

---

## Typical Workflow Orchestration Example

In a FastGPT workflow, connecting MiniMax TTS with a Large Language Model (LLM) node forms a complete end-to-end pipeline: **User Query -> LLM Response Generation -> MiniMax High-Fidelity Voice Synthesis -> Response Node Audio Playback**:

### 1. Workflow Architecture

```mermaid
flowchart TD
    A[User Query / Voice Input] --> B[AI Chat / LLM Node]
    B -->|Response Text {{LLM.text}}| C[MiniMax Text-to-Speech tts]
    C -->|Persistent Audio URL {{audioUrl}}| D[Response / Text Output Node]
```

### 2. Configuration Steps

1. **Add an AI Chat / LLM Node**:
   - Ingest the user's query or conversation prompt.
   - Set the System Prompt to guide natural, spoken-style output:
     ```markdown
     You are a warm and knowledgeable AI assistant. Please provide concise, engaging, and spoken-friendly replies (within 200 words, avoiding stiff written language) to ensure natural speech output.
     ```

2. **Add the "minmax Text-to-Speech (`tts`)" Node**:
   - Bind the `text` parameter to the LLM node's text output: `{{LLM.text}}`.
   - Select the `model`: `speech-2.5-hd-preview` (for premium naturalness) or `speech-2.5-turbo-preview` (for lower latency).
   - Select the `voice_id`: e.g., `female-shaonv` (sweet assistant) or `male-qn-jingying` (professional advisor).
   - Set `emotion`: choose `happy` for friendly welcomes, `calm` or empty `""` for objective answers.
   - Keep `speed` and `vol` at `1.0`.
   - Keep `pitch` at `0`.
   - Set `english_normalization` to `true`.

3. **Add a Response / Text Output Node**:
   - In the message template, output both the textual answer and an embedded audio player:
     ```markdown
     {{LLM.text}}

     <audio src="{{tts.audioUrl}}" controls></audio>
     ```
   - Or display a clean Markdown audio link:
     ```markdown
     {{LLM.text}}

     [🔊 Click to play voice response]({{tts.audioUrl}})
     ```
   - When users receive the response in the chat interface, they can read the text and immediately listen to the generated speech using the built-in media player.

---

## Important Considerations & FAQ

1. **Single Request Text Length**: MiniMax T2A v2 enforces a maximum text length limit per request (exceeding token limits triggers error code `1039`). We recommend keeping each text input under **5,000 characters**. For long books or comprehensive reports, use FastGPT's text chunking node upstream to synthesize content paragraph by paragraph.
2. **Rate Limits and Concurrency**: The MiniMax Open Platform imposes QPS (queries per second) and concurrent connection limits based on account tiers. Rapid bursts of requests may return error `1002` (rate limit exceeded) or `1041` (connection limit reached). Implement pacing or queued retries in high-volume production environments.
3. **Account Quota & Available Balance**: Calling the speech synthesis API deducts usage credits from your MiniMax account. Ensure your account on the [MiniMax Open Platform](https://api.minimax.chat) maintains an active balance; insufficient funds will return error `1008`.
4. **Content Moderation & Compliance**: MiniMax applies automated real-time safety inspection filters on both input prompts and output audio. Texts that trigger compliance filters will return error `1026` (sensitive input content) or `1027` (sensitive output content) and fail synthesis. Ensure input text complies with applicable laws and policies.
5. **Emotion Parameter Compatibility**: The `emotion` parameter performs best on the `speech-2.5` and `speech-02` series models. Supplying an empty string `""` will synthesize standard neutral speech.

### Common Error Codes Quick Reference

| Error Code | Error Description | Troubleshooting & Solution |
| :---: | :--- | :--- |
| `1000` | Unknown / System Default Error | Temporary server error from MiniMax; please retry after a brief pause. |
| `1001` | Request Timeout | Network latency or long generation time; check connectivity or reduce input text length. |
| `1002` | Rate Limit Exceeded | Request QPS exceeded account quota; throttle requests or request a quota increase. |
| `1004` | Unauthorized / Missing Token / Cookie | Missing or invalid API key; verify that `apiKey` is correctly configured in FastGPT credentials. |
| `1008` | Insufficient Balance | Account credits have been depleted; top up your balance in the MiniMax console. |
| `1026` / `1027` | Sensitive Input / Output Content | Content moderation filter triggered; modify text to avoid sensitive or prohibited keywords. |
| `1039` | Token Limit Exceeded | Text length exceeds the maximum token limit; truncate or chunk the text before synthesis. |
| `1041` | Connection Limit Exceeded | Concurrency exceeded the account limit; optimize batching and concurrency. |
| `2013` | Invalid Parameter | Request parameter error; verify that `speed`, `vol`, and `pitch` fall within valid numeric ranges. |
| `2049` | Invalid API Key | The provided API key does not exist or has been revoked; generate a new key in the console. |

---

## Local Development and Testing

To develop or test this plugin locally, navigate to this directory and run the following commands:

```bash
# Install dependencies
pnpm install

# Run unit tests
pnpm run test

# Build package artifacts
pnpm run build

# Validate FastGPT plugin specifications
npx @fastgpt-plugin/cli check --entry .
```
