# AeroDeck Model Router Sessions & Popular Providers Catalog Design Specification

**Date**: 2026-08-11  
**Status**: Approved (Updated with Live `/v1/models` Querying)  

---

## 1. Overview & Goals

This specification details the overhaul of AeroDeck's model catalog and Model Router server engine to support popular AI providers (from `hermes_cli/models.py`), live endpoint querying for newest models, custom endpoint base URLs (for local LLMs / unknown providers), interactive reasoning effort selection, multi-model profile assignment, and session context persistence across model calls.

1. **Popular Provider Catalog**: Port `CANONICAL_PROVIDERS` and `_PROVIDER_MODELS` from `hermes_cli/models.py`, supporting OpenRouter, Nous Portal, OpenAI API, Anthropic, DeepSeek, MiniMax, Kimi / Moonshot, Google AI Studio, Groq, Together AI, Ollama, LM Studio, AWS Bedrock, Azure Foundry, and Custom Endpoints.
2. **Live `/v1/models` Retrieval**: When a provider/endpoint is selected, the setup wizard dynamically queries `${baseURL}/models` to fetch newly launched models directly from the server so newer models are immediately available without manual catalog updates.
3. **Custom Endpoints & URLs**: Support user-defined provider names, base URLs (e.g. `http://localhost:8000/v1`), and custom model IDs.
4. **Interactive Multi-Model Setup Loop**: Allow users to configure multiple models/providers, select reasoning effort (`none`, `low`, `medium`, `high`), and assign them to target profiles (`default`, `fast`, `smart`, `reasoning`).
5. **Session Context Management**: Support `session_id`, `new_session`, and context persistence in `mcp-servers/model-router` via `sessions.json`, retaining conversation history across calls and offering explicit `clear_session` resets.

---

## 2. Popular Provider Catalog & Live Model Querying (`scripts/setup/src/catalog.ts`)

### Canonical Providers Table

| Provider Slug | Display Name | Default Base URL | Environment Key |
| :--- | :--- | :--- | :--- |
| `openrouter` | OpenRouter | `https://openrouter.ai/api/v1` | `OPENROUTER_API_KEY` |
| `nous` | Nous Portal | `https://api.nousresearch.com/v1` | `NOUS_API_KEY` |
| `openai-api` | OpenAI API | `https://api.openai.com/v1` | `OPENAI_API_KEY` |
| `anthropic` | Anthropic | `https://api.anthropic.com/v1` | `ANTHROPIC_API_KEY` |
| `deepseek` | DeepSeek | `https://api.deepseek.com` | `DEEPSEEK_API_KEY` |
| `minimax` | MiniMax | `https://api.minimaxi.chat/v1` | `MINIMAX_API_KEY` |
| `kimi-coding` | Kimi / Moonshot | `https://api.moonshot.cn/v1` | `KIMI_API_KEY` |
| `gemini` | Google AI Studio | `https://generativelanguage.googleapis.com/v1beta` | `GEMINI_API_KEY` |
| `groq` | Groq | `https://api.groq.com/openai/v1` | `GROQ_API_KEY` |
| `together` | Together AI | `https://api.together.xyz/v1` | `TOGETHER_API_KEY` |
| `ollama` | Ollama (Local) | `http://localhost:11434/v1` | `OLLAMA_API_KEY` |
| `lmstudio` | LM Studio (Local) | `http://localhost:1234/v1` | `LMSTUDIO_API_KEY` |
| `custom` | Custom Endpoint | *(User Specified)* | *(User Specified)* |

### Live Endpoint Querying (`fetchLiveModels`)
- **Query**: When a base URL (and optional API key) is entered, the setup wizard performs an HTTP `GET` to `${baseURL}/models` with a 3-second timeout.
- **Parsing**: Parses standard OpenAI-compatible `{ data: [{ id: "..." }] }` responses.
- **Fallback**: If live fetching fails or is offline, falls back seamlessly to the static catalog list and permits manual text input.

---

## 3. Interactive Setup Wizard Flow (`npm run setup:models`)

```
[ Start setup:models ]
         │
         ▼
[ Select Provider or Custom Endpoint ]
         │
         ▼
[ Base URL Confirmation / Override ]
         │
         ▼
[ Fetch Live Models from Base URL (${baseURL}/models) ]
         │ (Falls back to static catalog / manual input if offline)
         ▼
[ Model Selection (Live Fetched List or Catalog ID) ]
         │
         ▼
[ Select Reasoning Effort: none|low|medium|high ]
         │
         ▼
[ Enter API Key (if required) ]
         │
         ▼
[ Assign to Profile: default|fast|smart|reasoning ]
         │
         ▼
[ "Add another model/provider?" ] ──► (Yes) ──► [ Loop back to Select Provider ]
         │ (No)
         ▼
[ Save config.json & .env ]
```

---

## 4. Session & Context Engine (`mcp-servers/model-router`)

### 1. Tool Parameters for `route_task`
- `prompt` (string, required): User prompt / instruction.
- `session_id` (string, optional): Unique ID of conversation session thread.
- `new_session` (boolean, optional): If `true`, clears history for `session_id` before executing.
- `modelTier` (string, optional): Profile name (`default`, `fast`, `smart`, `reasoning`).
- `modelName` (string, optional): Explicit model ID override.
- `reasoningEffort` (string, optional): Override effort (`none`, `low`, `medium`, `high`).

### 2. Dedicated `clear_session` Tool
- Input: `{ "session_id": "string" }`
- Removes session from memory and deletes entry in `sessions.json`.

### 3. Context Persistence & Trimming
- Session state persisted to `mcp-servers/model-router/sessions.json`.
- Conversation history automatically trimmed to system prompt + last 20 messages.

---

## 5. Verification Plan

1. **Setup Catalog & Live Model Querying Tests**: `scripts/setup/tests/catalog.test.ts` & `setup-models.test.ts`.
2. **Model Router Session Tests**: `mcp-servers/model-router/tests/session.test.ts`.
3. **Full System Test Suite**: `npm test`.
