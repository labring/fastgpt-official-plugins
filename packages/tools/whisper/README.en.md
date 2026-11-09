# Whisper Speech-to-Text

FastGPT official OpenAI Whisper speech recognition plugin. Powered by OpenAI Whisper and the latest transcription language models, it rapidly converts audio files into highly accurate text, offering multilingual recognition, automated punctuation, and colloquial transcription across various audio formats and flexible input methods.

---

## Overview and Typical Use Cases

OpenAI Whisper offers powerful multilingual speech recognition capabilities. Trained on a massive volume of weakly supervised audio data, it reliably handles complex background noise, diverse accents, technical terminology, and mixed-language conversations. In addition to the classic `whisper-1` model, this plugin also supports newer speech transcription models built on the GPT-4o architecture, providing robust "hearing" capabilities for FastGPT AI agents.

### Typical Use Cases
- **Voicemail & Customer Service Audio Transcription**: In online customer service, ticketing systems, or call centers, transcribe user voice messages or phone recordings into text in real time, enabling downstream LLMs to perform intent classification, sentiment analysis, and automated ticket routing.
- **Meeting Minutes & Interview Recording Summaries**: Convert lengthy audio from internal business meetings, seminars, media interviews, or user research sessions into transcripts, allowing FastGPT LLM nodes to extract key conclusions, discussion highlights, and action items (TODOs).
- **Multimodal Voice Interaction Input**: Serve as the audio receptor in agent workflows, allowing users to interact directly via voice messages for natural conversational Q&A and interactive operations.
- **Video Dubbing & Subtitle Extraction**: Transcribe speech from short videos, educational tutorials, or podcast episodes into written manuscripts for subtitle generation, content compliance review, or knowledge base ingestion.

---

## Secret and Endpoint Configuration

When configuring this tool in FastGPT Plugin Management, provide the following parameters:

| Configuration Item | Field Name | Type | Required | Default Value | Encrypted (`isSecret`) | Description & Examples |
| :--- | :--- | :--- | :---: | :---: | :---: | :--- |
| **Base URL** | `baseUrl` | string | No | `https://api.openai.com/v1` | No | Official OpenAI API endpoint or an OpenAI-compatible relay/proxy gateway (e.g., OneAPI, NewAPI, or custom reverse proxies).<br>• Official API: `https://api.openai.com/v1`<br>• Custom gateway: `https://api.your-proxy.com/v1`<br>*(Note: The plugin automatically sends requests to `${baseUrl}/audio/transcriptions`)* |
| **API Key** | `apiKey` | string | **Yes** | None | Yes | Credential used to access the OpenAI transcription API (API Key).<br>• Example: `sk-proj-xxxxxxxxxxxx`<br>• The plugin automatically sets the `Authorization: Bearer <apiKey>` header. |

---

## Input Parameters

When invoked in a FastGPT workflow or by an AI agent tool call, the following input parameters are supported:

| Parameter Name | Field Name | Type | Required | Tool Param (`isToolParam`) | Description & Examples |
| :--- | :--- | :--- | :---: | :---: | :--- |
| **Transcription Model** | `model` | enum string | **Yes** | Yes (`true`) | The model identifier used for transcription. Options include:<br>• `whisper-1`: OpenAI's standard general-purpose speech recognition model. Stable, mature, cost-effective, with multilingual transcription support.<br>• `gpt-4o-transcribe`: High-precision speech recognition model based on the GPT-4o series, providing superior context comprehension and technical term accuracy.<br>• `gpt-4o-mini-transcribe`: Lightweight transcription model offering lower latency and cost efficiency, ideal for latency-sensitive applications.<br>• `gpt-4o-transcribe-diarize`: Specialized model supporting speaker diarization, separating different speakers across multi-party meetings and conversations. |
| **Audio File** | `file` | string | **Yes** | Yes (`true`) | The audio file to transcribe. Supports two input methods:<br>1. **Publicly accessible direct URL**: Must start with `http://` or `https://`, e.g., `https://example.com/audio.mp3` or a FastGPT host file storage URL.<br>2. **Base64 Data URL or Raw Base64**: e.g., `data:audio/mp3;base64,SUQzBA...` or a raw Base64-encoded string. |

---

## Output Parameters

### Output Parameter Definitions

| Parameter Name | Field Name | Type | Description & Example |
| :--- | :--- | :--- | :--- |
| **Transcribed Text** | `text` | string | The full plain text transcribed from the audio file. |

### Output JSON Example

```json
{
  "text": "Welcome to FastGPT. Today we will introduce how to convert speech to text using the Whisper model."
}
```

---

## Typical Workflow Orchestration Example

Combining the Whisper plugin with an LLM node in FastGPT makes it straightforward to build an end-to-end "Audio Input -> Text Extraction -> Intelligent Processing" pipeline:

### 1. Workflow Architecture

```
[Audio Input / Uploaded File]
             │
             ▼
[Whisper Speech-to-Text (whisper)]
  ├── model: whisper-1
  └── file:  {{Audio File URL or Base64}}
             │
             ▼ (Outputs text)
[LLM Node (Intent Analysis / Meeting Summary)]
             │
             ▼
[Text Output / Final Response Node]
```

### 2. Orchestration Steps

1. **Audio Ingestion**: Receive audio via user input (voice attachments or uploaded file links) or an upstream custom Webhook.
2. **Whisper Speech-to-Text Node**:
   - Bind the `file` parameter to the upstream audio URL or Base64 variable.
   - Set `model` to `whisper-1` (standard use cases) or `gpt-4o-transcribe` (domain-specific or complex terminology).
3. **LLM Node (Meeting Summary Example)**:
   - Reference the Whisper output variable: `{{text}}`.
   - Set the System Prompt:
     ```markdown
     You are a professional executive meeting assistant. Please review and summarize the following transcribed meeting text:

     [Transcribed Text]:
     {{text}}

     [Requirements]:
     1. Correct minor speech recognition typos or verbal slips while preserving original intent.
     2. Identify core meeting agendas and final decisions.
     3. Compile a distinct list of Action Items, indicating owners and deadlines if mentioned.
     4. Present the output in clean, structured Markdown format.
     ```
4. **Response Node**: Present the structured summary directly to the user or save it to a knowledge base.

---

## Considerations & Best Practices

1. **Supported Audio Formats**
   - Compatible with major audio formats natively accepted by OpenAI Whisper: `mp3`, `mp4`, `mpeg`, `mpga`, `m4a`, `wav`, and `webm`.
   - When passing a Base64 Data URL, make sure the prefix declares an appropriate MIME type (e.g., `data:audio/mp3;base64,...` or `data:audio/wav;base64,...`).

2. **File Size Limit**
   - OpenAI enforces a **25 MB** maximum file size limit per transcription request.
   - For audio files exceeding 25 MB, compress the file upstream (e.g., to 64 kbps MP3/M4A) or split the audio into shorter segments before making batch calls.

3. **Network Connectivity & Direct URL Validity**
   - When providing `file` as a URL, ensure the FastGPT host environment can directly fetch the file over HTTP/HTTPS.
   - Avoid URLs protected by login cookies, temporary expired signatures, or private intranet addresses that cannot be reached by the host.

4. **Relay Gateway & Timeout Configuration**
   - Uploading and transcribing audio takes time (e.g., a 10-minute audio file often requires 10–25 seconds of processing).
   - If using a reverse proxy (such as Nginx) or a third-party relay gateway, ensure that `proxy_read_timeout` or request timeouts are configured to **60 seconds or higher** to prevent premature 504 Gateway Timeout errors.

5. **Payload Selection Recommendation**
   - **Prefer Direct URLs for Large Files**: Base64 encoding inflates file size by approximately 33% and incurs higher memory overhead. For audio files larger than 5 MB, passing a persistent object storage or host direct URL is strongly recommended.