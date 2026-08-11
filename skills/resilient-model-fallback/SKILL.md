---
name: resilient-model-fallback
description: Use when an external MCP server (such as model-router or browser-automation) is offline, unconfigured, or failing, to ensure graceful fallback execution
---

# Resilient Model & Tool Fallback Execution

This skill provides fallback procedures when auxiliary MCP servers (such as `model-router`, `browser-automation`, or `google-drive`) fail, return rate-limit errors, or are unconfigured.

## Resilient Fallback Rules

### 1. `model-router` (`route_task`) Fallbacks
When `route_task` returns an error string (e.g. `"Error routing task: ..."`), or if the server connection fails:

1. **Do NOT crash or halt subagent execution.**
2. **Fallback to Direct Host Execution**: Perform the generation subtask directly using your native context and capabilities.
3. **Token Conservation Prompting**: When executing fallback generations natively, use concise, focused prompts to avoid unnecessary token usage.
4. **Log Notice**: Inform the user or log in `task.md`:
   > *Notice: Model Router offline/rate-limited. Executing subtask natively via primary agent.*

### 2. `browser-automation` Fallbacks
When Playwright browser automation fails or elements are unresponsive:

1. **Fallback to HTTP Extraction**: Use `read_url_content` or `search_web` to retrieve text content directly.
2. **Fallback to Terminal Tools**: Use `curl` or `python` requests scripts via `run_command` if raw HTTP API access is required.

### 3. `google-drive` Fallbacks
When Google Drive MCP tools return authentication errors (missing tokens):

1. Prompt the user to run `npm run setup:google` to refresh OAuth consent tokens.
2. Alternatively, ask the user to provide local document paths or uploads.
