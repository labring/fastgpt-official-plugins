# DALL·E 3 Drawing Tool (Dalle3 Drawing)

FastGPT official DALL·E 3 image generation plugin. Connects to OpenAI's DALL·E 3 large model API to enable highly accurate, creative, and aesthetically striking Text-to-Image generation. Deeply integrated with FastGPT host file storage capabilities to provide permanent image access URLs, eliminating concerns about temporary link expirations.

---

## Overview and Typical Use Cases

DALL·E 3 is one of the industry's premier text-to-image models. It possesses an advanced understanding of nuanced, complex semantic contexts and faithfully translates detailed descriptive prompts into high-quality imagery across a wide range of artistic styles.

### Typical Use Cases
- **Article & Social Media Illustrations**: Automatically produce relevant, high-resolution header images, banner visuals, and contextual illustrations based on article titles, text summaries, or core themes.
- **Visual Design & Concept Art Sketches**: Rapidly convert product ideation, sci-fi scenes, architectural ideas, or game character concepts into tangible visual drafts to inspire designers and creators.
- **Avatars, Wallpapers & Marketing Posters**: Generate stylized assets across diverse aesthetics—from cyberpunk, watercolor, and anime to hyper-realistic photography—for personal avatars, wallpapers, and promotional posters.
- **Interactive Storytelling & Multimodal Content**: Combine LLMs and image generation in FastGPT workflows to build automated children's illustrated storybooks, visual novels, and multimodal reports.

---

## Secret and Endpoint Configuration

When configuring this tool in FastGPT Plugin Management, fill in the following parameters:

| Configuration Item | Field Name | Type | Required | Encrypted (`isSecret`) | Description & Examples |
| :--- | :--- | :--- | :---: | :---: | :--- |
| **Dalle3 API Base URL** | `url` | string | **Yes** | No | Base URL of the OpenAI API or compatible gateway.<br>• Official API: `https://api.openai.com`<br>• Proxy or aggregation gateway (e.g., OneAPI / NewAPI): e.g., `https://api.your-proxy.com`<br>*(Note: Do not append `/v1/images/generations` at the end; the plugin automatically resolves the endpoint path).* |
| **API Credential (Without Bearer)** | `authorization` | string | **Yes** | Yes | API access token or key (API Key).<br>• Example: `sk-proj-xxxxxxxxxxxx`<br>• **Important Note**: Enter the API key directly. **Do not include the `Bearer ` prefix**; the plugin automatically prepends `Bearer ` during request headers construction. |

---

## Input Parameters

When invoked in a FastGPT workflow or by an AI agent tool call, the following input parameter is supported:

| Parameter Name | Field Name | Type | Required | Tool Param (`isToolParam`) | Description & Writing Recommendations |
| :--- | :--- | :--- | :---: | :---: | :--- |
| **Image Prompt** | `prompt` | string | **Yes** | Yes (`true`) | Detailed descriptive prompt for the image to be generated. Detailed prompts covering subject matter, perspective, lighting, color palette, texture, and artistic medium yield the best results. Both English and other languages are supported (English prompts provide the most precise interpretation with DALL·E 3).<br>*(Backward compatibility: Legacy workflows utilizing the field `绘图提示词` remain fully supported).* |

---

## Output Parameters and Persistence Mechanism

### Output Parameters

| Parameter Name | Field Name | Type | Description & Example |
| :--- | :--- | :--- | :--- |
| **Image URL** | `link` | string | The persistent, directly accessible URL of the generated image (e.g., `https://your-fastgpt-domain/api/system/img/xxxx.png` or an object storage CDN URL).<br>*(Backward compatibility: Legacy workflows expecting `图片访问链接` remain fully supported).* |
| **Error Message** | `system_error` | string | Error details returned if the model generation fails or an API call encounters an issue (such as authentication failure, safety filter triggered, timeout, etc.). Empty upon success. |

### Local / Cloud Persistence Mechanism
- **Overcoming Temporary Link Expiration**: Native image URLs returned directly by OpenAI's DALL·E 3 are hosted on temporary Azure storage and **expire within 1 to 2 hours**.
- **Automated Persistent Upload**: This plugin declares the `file-upload:allow` permission. Upon successful generation, the plugin downloads the image binary stream and uploads it to FastGPT's local file system or configured object storage (such as MinIO, AWS S3, or Aliyun OSS) via `ctx.invoke.uploadFile`. It then returns a permanently accessible URL.
- **Fallback Compatibility**: In offline, decoupled, or local development test environments where host upload capabilities are unavailable, the plugin automatically falls back to returning the image as a Base64 Data URL, guaranteeing uninterrupted execution.

---

## Typical Workflow Orchestration and Prompt Tips

### 1. Typical Workflow Orchestration Example
To build an AI creative drawing agent in FastGPT, the following node architecture is recommended:

```
[User Input] 
   └──> [LLM Node (Prompt Expansion & Polish)] 
           └──> [Dalle3 Drawing Tool Node (dalle3)] 
                   └──> [Text Output / Final Response Node]
```

1. **User Input**: The user provides a brief concept (e.g., "Draw a cyberpunk mechanical cat").
2. **LLM Node (Prompt Enhancer)**: Receives the brief idea and enriches it into a vivid, descriptive, English DALL·E 3 prompt detailing composition, lighting, style, and textures.
3. **Dalle3 Tool Node**: Binds its `prompt` input parameter to the LLM node's output, generating and persisting the image.
4. **Final Response Node**: Uses Markdown syntax to display the image to the user:
   ```markdown
   Here is your generated artwork:
   ![AI Generated Image]({{link}})
   ```

### 2. Prompt Optimizer System Prompt Example
Injecting the following system prompt into the LLM node will substantially improve image quality and aesthetic cohesion:

```markdown
You are an expert AI art prompt engineer. Your role is to expand the user's brief concept into a vivid, highly detailed English prompt tailored specifically for DALL·E 3.

Adhere to the following prompt principles:
1. Subject & Details: Specify the appearance, posture, attire, and expression of the subject.
2. Perspective & Composition: Define the camera angle and framing (e.g., Wide Angle, Macro Close-up, Cinematic shot, Rule of thirds).
3. Lighting & Palette: Describe the lighting and atmosphere (e.g., Volumetric lighting, Golden hour, Neon glow, Moody color grading).
4. Medium & Style: Specify the artistic medium or rendering engine (e.g., Digital art, Unreal Engine 5 render, Oil on canvas, Photorealistic 8k).
5. Positive Phrasing: DALL·E 3 does not support negative prompts. Describe what SHOULD be in the image rather than using negative words like "no/without".
6. Output only the final English prompt without any preamble or explanation.
```

---

## Troubleshooting & FAQ

### 1. 401 Unauthorized / Invalid API Key
- **Symptom**: `system_error` reports a 401 Authentication Failure or Invalid API Key.
- **Remedy**:
  1. Verify that the `authorization` parameter contains the correct API key.
  2. Ensure you have **not** manually prepended `Bearer ` (e.g., `Bearer sk-xxxx`); the plugin automatically adds the prefix.
  3. Ensure the API key has an active balance and has not been revoked or expired.

### 2. 400 Bad Request / Safety System Violation
- **Symptom**: The prompt is rejected by OpenAI's safety review system (`safety system` / `content policy violation`).
- **Cause**: The prompt may include sensitive terminology related to violence, adult content, political figures, prominent celebrities, or copyrighted trademarks.
- **Remedy**: Rephrase the prompt using neutral descriptions, generic archetypes, or metaphorical language to avoid restricted names and sensitive terms.

### 3. Connection Timeout / 504 Gateway Timeout
- **Symptom**: The tool execution hangs and eventually fails with a network timeout.
- **Cause**: Generating a 1024x1024 image with DALL·E 3 typically takes between 10 and 25 seconds. If a proxy, API gateway, or reverse proxy (e.g., Nginx) has a short timeout setting (e.g., 15 seconds), the connection will be dropped prematurely.
- **Remedy**: Increase the gateway or reverse proxy timeout threshold (60 seconds or higher is recommended) and ensure network stability between your FastGPT instance and OpenAI/proxy endpoints.

### 4. 429 Too Many Requests / Insufficient Quota
- **Symptom**: The request limit has been exceeded or account credit has run out.
- **Remedy**: Check your OpenAI billing dashboard or top up tokens in your relay service account. If encountering concurrency limits, incorporate retry logic into your workflow.
