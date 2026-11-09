# Redis Cache Operations Toolset (Redis Cache)

The Redis Cache Operations Toolset is an official, lightweight, and high-performance distributed caching plugin for FastGPT. By connecting to remote or local Redis databases, it provides FastGPT agents and workflows with high-speed key-value read/write access, Time-To-Live (TTL) lifecycle management, and key deletion capabilities.

The toolset centrally manages the Redis connection configuration and provides three core atomic sub-tools (`get`, `set`, and `del`) to help workflows implement cross-session data persistence, state sharing, and rate limiting.

---

## Typical Application Scenarios

- **Cross-Session Dialogue State and Context Persistence**: Store user state, preferences, multi-step conversation drafts, or intermediate outputs across sessions to avoid repeatedly invoking large models to reconstruct state.
- **Request Rate Limiting and Distributed Locks**: Record timestamps or invocation counters for specific users or IPs using TTL to prevent malicious high-frequency requests, or implement simple mutual exclusion locks with temporary keys.
- **Temporary Dynamic Verification Code and Token Storage**: Store SMS/email verification codes or third-party OAuth access tokens with second-level expiration for automated invalidation and verification.
- **Intermediate Result Sharing Across Multiple Nodes**: In complex workflow orchestrations, pass large text blocks or structured calculation results across parallel branches without congesting model context prompts.

---

## Connection Configuration & Secrets

Before using this toolset, configure the Redis connection URL (`redisUrl`) in FastGPT's Secrets Management or toolset settings. All sub-tools (`get`, `set`, `del`) share this connection setting.

### Secret Configuration

| Field | Type | Required | Secret Masked | Description |
| --- | --- | --- | --- | --- |
| `redisUrl` | String (`string`) | Yes | Yes (`isSecret`) | Unified Redis connection URL supporting standard protocols and authenticated connection strings. |

### `redisUrl` Format Specifications & Breakdown

The connection URL must conform to standard URI schemes. Common formats include:

| Connection Type | URL Format Example | Description |
| --- | --- | --- |
| **Standard Standalone (No Password)** | `redis://127.0.0.1:6379/0` | Default port is `6379`; `/0` specifies logical database `0`. |
| **Classic Password Authentication (No Username)** | `redis://:your_password@127.0.0.1:6379/0` | Note the required colon `:` before the password when no username is used. |
| **Redis 6+ ACL Authentication (Username & Password)** | `redis://default:your_password@127.0.0.1:6379/0` | Used for Redis 6 and later versions configured with ACL users. |
| **TLS/SSL Encrypted Connection** | `rediss://:your_password@your-redis-host.com:6379/0` | Uses `rediss://` (double `s`) for encrypted channels. |
| **Cloud Managed Services (e.g., Upstash)** | `rediss://default:your_password@xxx.upstash.io:6379` | Supports managed instances such as Upstash, AWS ElastiCache, Alibaba Cloud, Tencent Cloud, etc. |

> **Security Note**:
> `redisUrl` is declared with `isSecret: true`. It is encrypted and persisted securely in the FastGPT platform. Sensitive credentials are automatically redacted in the user interface, execution logs, and debugging streams to prevent password leakage.

---

## Sub-Tools List

This toolset includes 3 atomic sub-tools:

- **`get` (Get Cache)**: Retrieve a cached string value from Redis by key and return whether the key exists.
- **`set` (Set Cache)**: Store or update a cached key-value pair, with optional Time-To-Live (TTL) expiration in seconds.
- **`del` (Delete Cache)**: Delete a specified Redis key and its associated value.

---

## Sub-Tool Details & Parameter Specifications

### 1. Get Cache (`get`)

Retrieves the data associated with a specified key from Redis. If the key exists, it returns the string value; if the key does not exist or has expired, it returns `null`.

#### Input Parameters

| Parameter | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `key` | String (`string`) | Yes | None | **Redis cache key to retrieve**. Cannot be empty, e.g., `fastgpt:session:user_123`. |

#### Output Results

| Field | Type | Description |
| --- | --- | --- |
| `value` | Nullable String (`string \| null`) | **Cached value**. Returns the string data if the key exists; returns `null` if the key does not exist or has expired. |
| `exists` | Boolean (`boolean`) | **Whether the key exists**. Returns `true` if the key is present in Redis; returns `false` if it does not exist or has expired. |

#### Example Responses

- **When the key exists:**

```json
{
  "value": "{\"step\": 2, \"draft\": \"Meeting minutes draft\"}",
  "exists": true
}
```

- **When the key does not exist (or has expired):**

```json
{
  "value": null,
  "exists": false
}
```

---

### 2. Set Cache (`set`)

Writes a specified key-value pair to Redis. Supports an optional `ttl` parameter for automatic cache expiration.

#### Input Parameters

| Parameter | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `key` | String (`string`) | Yes | None | **Redis cache key to set**. Cannot be empty. |
| `value` | String (`string`) | Yes | None | **String data to store in Redis**. To store objects or arrays, serialize them into a JSON string first. |
| `ttl` | Integer (`number`) | No | `0` | **Expiration time in seconds**. Non-negative integer; `0` or omitted means the key never expires. |

#### Output Results

| Field | Type | Description |
| --- | --- | --- |
| `success` | Boolean (`boolean`) | **Operation status**. Returns `true` when the key-value pair is successfully written. |

#### Example Response

```json
{
  "success": true
}
```

---

### 3. Delete Cache (`del`)

Explicitly removes a specified key from Redis. Returns `deleted: true` if the key existed and was successfully deleted; returns `deleted: false` if the key did not exist.

#### Input Parameters

| Parameter | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `key` | String (`string`) | Yes | None | **Redis cache key to delete**. Cannot be empty. |

#### Output Results

| Field | Type | Description |
| --- | --- | --- |
| `deleted` | Boolean (`boolean`) | **Whether the key was deleted**. Returns `true` if the key existed and was removed; returns `false` if the key did not exist. |

#### Example Responses

- **When the key was found and deleted:**

```json
{
  "deleted": true
}
```

- **When the key did not exist:**

```json
{
  "deleted": false
}
```

---

## Typical Workflow Examples

### Scenario 1: Multi-Turn Dialogue Context & Session State Persistence

For agent workflows requiring multi-step interactions (such as guided form filling or step-by-step document drafting), use Redis with TTL for state persistence:

1. **Read Previous State**: At the beginning of the workflow, invoke the `get` tool with `key = fastgpt:session:{{chatId}}`.
2. **Conditional Branching**:
   - If `exists == true`: Inject the parsed `value` into the LLM system prompt as conversational history/draft state.
   - If `exists == false`: Route the LLM to start the initial greeting and Step 1 questions.
3. **Save and Update State**: After the LLM finishes the current turn, invoke the `set` tool with `key = fastgpt:session:{{chatId}}` and set `ttl = 86400` (24 hours). The state seamlessly resumes if the user continues within 24 hours, and Redis automatically evicts expired keys to conserve memory.

### Scenario 2: Request Rate Limiting & Verification Code Handling

Protect agent endpoints from abuse or handle one-time token verifications:

1. **Issue Verification Code**: When a user requests a code, generate a 6-digit random code, call `set` with `key = fastgpt:verify:{{phone}}`, `value = {{code}}`, and `ttl = 300` (5 minutes).
2. **Verify & Invalidate**: When the user submits the code, invoke `get` to compare. If valid, immediately call `del` on that `key` to prevent replay attacks; if invalid or expired (`exists == false`), prompt the user to request a new code.

### Scenario 3: Decoupled Intermediate Result Sharing Across Workflow Nodes

Avoid routing massive text payloads through workflow edges across multiple parallel branches:

1. **Write Large Text**: An upstream document retrieval or summarization node writes lengthy intermediate analysis data to `fastgpt:temp:analysis:{{workflowInstanceId}}` using `set`, with a short TTL (e.g., `1800` seconds).
2. **Downstream On-Demand Retrieval**: Downstream chart-generation and key-takeaway nodes read the content as needed via `get`. A final node invokes `del` for cleanup, improving execution performance and stability.

---

## Important Considerations & Best Practices

1. **Environment & Instance Compatibility**:
   - Compatible with Redis 5.0+, Redis 6.x / 7.x (including ACL user permissions).
   - Fully compatible with major cloud-hosted Redis services (e.g., Alibaba Cloud ApsaraDB for Redis, Tencent Cloud CRS, AWS ElastiCache, Upstash, etc.).
2. **Network Connectivity & Whitelisting**:
   - Ensure the host or container running FastGPT can reach the Redis instance's IP/domain and port via TCP.
   - When connecting over the public internet, whitelist the FastGPT egress IP in your cloud firewall/security groups and consider enabling SSL/TLS encryption.
3. **Key Namespace Conventions**:
   - Strongly recommend using colon-delimited hierarchical naming: `fastgpt:<module/feature>:<business_id>`.
   - Recommended patterns:
     - Session state: `fastgpt:session:<chat_id>`
     - Rate limit counter: `fastgpt:ratelimit:<user_id>:<timestamp>`
     - Temporary credentials: `fastgpt:auth:token:<token_id>`
   - Structured naming avoids key collisions when multiple agents share an instance and simplifies grouped browsing in Redis GUIs.
4. **Data Types & Serialization**:
   - The plugin operates on standard Redis String types.
   - To store structured JSON objects or arrays, serialize them into a JSON string prior to storing. Use FastGPT's built-in Code nodes or JSON extractors to parse them when retrieved.
5. **Connection Lifecycle & Error Handling**:
   - Built with robust connection settings (10-second connection timeout, 5-second command execution timeout, and exponential backoff retries).
   - The Redis client connection is always released (`client.quit()`) in the `finally` block to prevent connection pool exhaustion.
   - Common errors like connection refused (`ECONNREFUSED`), timeout (`ETIMEDOUT`), and authentication failure (`NOAUTH`) are intercepted with user-friendly messages.

---

## Local Development and Verification

```bash
# 1. Install dependencies
pnpm install

# 2. Run unit tests
pnpm run test

# 3. Build artifacts
pnpm run build

# 4. Validate plugin specifications
npx @fastgpt-plugin/cli check --entry .
```
