# FastGPT Host Context Information Retrieval Toolset (FastGPT Information Retrieval)

`fastgptInfo` is an official FastGPT host environment and context information retrieval toolset (System Toolset). Without requiring any external API keys or credentials, the plugin securely retrieves the current conversational user's account name, member name, contact info, organizational hierarchy, and group memberships directly from FastGPT's internal runtime context (Host Context). In AI Agent orchestration and complex workflows, this tool often serves as a front-line perception node, providing multi-tenant identification, permission validation, conditional branch routing, and personalized service capabilities.

## Application Scenarios

- **Agent Personalization & Customized Interaction**: Retrieve the current user's account name or member nickname, dynamically injecting user identity into the System Prompt for a warm, tailored conversational experience.
- **Multi-Department / Organization Conditional Routing**: Route workflow paths based on the user's organization path ID or name (`orgs.pathId` / `orgs.name`) via Condition Branch nodes—for instance, automatically directing queries from Sales, R&D, or Finance to their dedicated domain logic and specialized tools.
- **Session Identity Recognition & Audit Logging**: Automatically capture and attach the user's account identifier (`username`), member name (`memberName`), and contact information (`contact`) in conversation logs, ticket submissions, notifications, or external system integrations (e.g., CRM, ERP) for precise auditing and traceability.
- **Tenant / Group-Based Knowledge Base Access Control**: Read group memberships (`groups.name`) or organizational affiliations to enforce enterprise permission policies, restricting access to sensitive knowledge bases, advanced models, or privileged system tools in multi-tenant environments.

## Prerequisites & System Requirements

- **FastGPT Version Requirement**: **FastGPT >= v4.14.7**. This plugin relies on the `ctx.invoke.userInfo` host context invocation interface and the `userInfo:read` system permission declaration provided by FastGPT. Running on older versions of FastGPT will result in execution failures due to missing host interface support.
- **Secret Configuration**: **No external API keys or secrets required**. As a system-level context-aware tool, FastGPT automatically injects data from the current conversation context at runtime, eliminating the need for third-party credential setup.

## Sub-Tools

This toolset provides the following sub-tool:

| Tool ID | Name | Description |
| :--- | :--- | :--- |
| `getUserInfo` | Get User Information | Retrieve the current conversation user's account name, member name, contact info, organization hierarchy, and group memberships. |

---

## Sub-Tool: Get User Information (`getUserInfo`)

### 1. Input Parameters

This tool extracts user information directly from the FastGPT runtime context and **requires no input parameters**.

| Parameter | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| None | - | - | - | No input parameters required |

### 2. Output Results

Upon execution, the tool returns a structured object containing multi-dimensional identity information for the current user:

| Field | Type | Nullable | Description |
| :--- | :--- | :--- | :--- |
| `username` | String | No | The current account username (e.g., registered username, mobile number, or account identifier). |
| `memberName` | String | Yes | The current member display name within the team/organization (may be `null` if not configured). |
| `contact` | String | Yes | Contact details for the current user (such as bound phone number or email; `null` if not configured). |
| `orgs` | Array\<Object\> | No | List of organizations the current account belongs to (supports multi-level hierarchy). |
| `orgs[].pathId` | String | No | Unique path identifier of the organization (e.g., `root/tech-dept/frontend`). |
| `orgs[].name` | String | No | Display name of the organization or department (e.g., `Frontend Team`). |
| `groups` | Array\<Object\> | No | List of groups/role groups associated with the current account. |
| `groups[].name` | String | No | Name of the group (e.g., `Engineering Team`, `Knowledge Base Collaborators`). |

#### JSON Output Example

```json
{
  "username": "zhangsan",
  "memberName": "San Zhang",
  "contact": "13800138000",
  "orgs": [
    {
      "pathId": "root/tech-dept/frontend",
      "name": "Frontend Team"
    }
  ],
  "groups": [
    {
      "name": "Engineering Team"
    },
    {
      "name": "Knowledge Base Collaborators"
    }
  ]
}
```

### 3. Typical Workflow Examples

#### Example 1: Dynamic Prompt Injection for Personalized Interaction

1. Add the **Get User Information (`getUserInfo`)** node to the FastGPT application canvas.
2. Connect the **Workflow Start** node to the **Get User Information** node.
3. Connect the output variables of the **Get User Information** node to the downstream **AI Chat** node.
4. Configure user variable references in the **AI Chat** node's System Prompt:
   ```markdown
   You are a professional enterprise AI assistant.
   Information about the current user interacting with you:
   - Name: {{memberName}} (Account: {{username}})
   - Contact: {{contact}}
   - Department: {{orgs}}
   - Groups: {{groups}}

   Please address the user personally (preferring "{{memberName}}") and provide tailored, professional answers considering their department's business context.
   ```

#### Example 2: Multi-Department Conditional Routing & Access Control

1. When a user initiates a conversation, trigger the **Get User Information (`getUserInfo`)** node first.
2. Connect its output to a **Condition Branch** node (or Code node for array matching).
3. Configure branching rules for `orgs` or `groups`:
   - **Branch A (Finance Department)**: Check if `orgs` contains `name == "Finance"`, routing the flow to a branch with sensitive financial reports and financial approval tools.
   - **Branch B (R&D Department)**: Check if `orgs` contains `name == "R&D"`, routing to internal API documentation and engineering ticket tools.
   - **Default Branch**: Route to the general enterprise Q&A and policy knowledge base accessible to all employees.
4. This effectively prevents standard employees from accessing sensitive knowledge bases or privileged business tools without requiring custom backend code.

### 4. Important Considerations

1. **Unauthenticated Visitors & Public Share Links**:
   - When the application is accessed via **public password-free share links**, **unauthenticated iframe embeds**, or by **anonymous visitors**, no authenticated user credentials exist in the context.
   - In this scenario, `username` may return a temporary guest identifier or empty value, `memberName` and `contact` will be `null`, and `orgs` and `groups` will return empty arrays `[]`.
   - **Best Practice**: In downstream workflow nodes (such as Condition Branch or Code nodes), include defensive null checks (e.g., fallback to a generic greeting like "Guest") to prevent unexpected runtime errors from undefined fields.
2. **FastGPT Version Dependency**:
   - The host system must run **FastGPT v4.14.7 or higher**. In older versions, invoking this tool will fail because the host does not support `ctx.invoke.userInfo`.
3. **Data Security & Permission Scope**:
   - This plugin declares the `userInfo:read` permission in its manifest. It only reads the basic context info of the current requester in the conversation and does not access cross-tenant data or unrelated personal privacy data, strictly adhering to enterprise data isolation standards.
