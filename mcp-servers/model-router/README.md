# Model Router MCP Server

A Multi-Model Routing MCP (Model Context Protocol) server built with Node.js and TypeScript.

## Overview

The Model Router MCP server routes tasks dynamically to external LLM providers and specialized model tiers (such as Kimi/Moonshot AI and MiniMax). Built using standard Node.js, TypeScript, and the Vercel AI SDK (`ai`, `@ai-sdk/openai`, `@ai-sdk/anthropic`, `@ai-sdk/google`), it automatically loads credentials from `.env` and proxies text generation prompts to the appropriate backend.

## Environment & API Key Setup

Create or update the `.env` file in `mcp-servers/model-router/.env` with your API credentials:

```ini
# Primary API Keys for Direct External Providers
KIMI_API_KEY="sk-kimi-your-api-key"
MINIMAX_API_KEY="sk-cp-your-api-key"

# Additional Provider Keys (Optional)
OPENAI_API_KEY="your-openai-api-key"
ANTHROPIC_API_KEY="your-anthropic-api-key"
GOOGLE_GENERATIVE_AI_API_KEY="your-google-api-key"
```

## Build & Test Instructions

1. Install dependencies:
   ```bash
   npm install
   ```

2. Compile TypeScript:
   ```bash
   npm run build
   ```

3. Run tests:
   ```bash
   npm test
   ```

## Exposed MCP Tools

### `route_task`

Routes a prompt to a designated model tier or external LLM service provider.

- **Input Schema**:
  ```json
  {
    "type": "object",
    "properties": {
      "prompt": {
        "type": "string",
        "description": "The user input or task instructions to process"
      },
      "modelTier": {
        "type": "string",
        "description": "Target model performance tier: 'fast' (MiniMax text-01), 'smart' (Moonshot v1-auto), or default ('moonshot-v1-8k')"
      },
      "task_type": {
        "type": "string",
        "description": "Optional classification of task category (e.g., 'coding', 'reasoning', 'translation')"
      },
      "model": {
        "type": "string",
        "description": "Optional explicit model name override"
      },
      "parameters": {
        "type": "object",
        "description": "Optional execution parameters such as temperature, top_p, or max_tokens"
      }
    },
    "required": ["prompt"]
  }
  ```

- **Supported Tiers & Routing**:
  - **`fast`**: Routes to MiniMax (`minimax-text-01`) for rapid text generation and lightweight tasks.
  - **`smart`**: Routes to Kimi / Moonshot (`moonshot-v1-auto`) for complex reasoning and context understanding.
  - **Default**: Falls back to Kimi / Moonshot (`moonshot-v1-8k`).

- **Example Usage**:
  ```json
  {
    "prompt": "Summarize the key differences between REST and GraphQL APIs.",
    "modelTier": "smart"
  }
  ```
