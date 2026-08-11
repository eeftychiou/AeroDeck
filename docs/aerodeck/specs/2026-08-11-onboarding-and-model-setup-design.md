# AeroDeck Onboarding, Installation & Model Setup Overhaul Design Specification

**Date**: 2026-08-11  
**Status**: Approved  

---

## 1. Overview & Goals

The goal of this specification is to overhaul AeroDeck's onboarding experience, core installation instructions, model configuration setup, and Google Workspace integration:

1. **Clear Onboarding & Installation**: Restructure `README.md` to clearly differentiate **Mandatory** setup (core plugin installation & MCP server registration) from **Optional** extensions (Model Router, Google Workspace/Drive, Telegram Bridge, Outlook MAPI).
2. **Hermes Model Catalog Integration**: Replace static/hardcoded Kimi/Minimax prompts in `npm run setup` with dynamic provider and model selection powered by the Hermes Model Catalog (`https://nousresearch.github.io/hermes-agent/docs/api/model-catalog.json`), backed by a bundled offline fallback.
3. **Modular Reconfiguration**: Support granular sub-commands (`npm run setup`, `npm run setup:models`, `npm run setup:google`) allowing users to reconfigure LLM providers, model tiers, or Google OAuth credentials at any time.
4. **Automated Google Workspace & Drive Setup**: Streamline Google Drive setup via GCP `credentials.json` import or manual input, local OAuth callback server authorization, token persistence, and comprehensive domain policy documentation.

---

## 2. Installation & Documentation Restructure (`README.md`)

### Component Necessity Matrix

| Component | Status | Description | Prerequisites / Dependencies |
| :--- | :--- | :--- | :--- |
| **AeroDeck Plugin** | **Mandatory** | Core workflow skills & system prompt hooks (`plugin.json`, `skills/`) | Antigravity 2.0 / Antigravity IDE / Antigravity CLI |
| **MCP Server Registration** | **Mandatory** | Registers tool bridges in `mcp_config.json` via `install.ps1` or `register-unix.js` | Node.js ≥ 18 |
| **Model Router Server** | **Optional** | Multi-provider LLM task routing (`route_task`) | Provider API key(s) (OpenAI, Anthropic, DeepSeek, Minimax, OpenRouter, etc.) |
| **Google Drive / Workspace** | **Optional** | Search, read, and download corporate Drive docs | GCP OAuth Client ID & Secret |
| **Browser Automation** | **Optional** | Headless / visible browser automation (Playwright) | Node.js & Playwright binaries |
| **Telegram Bridge** | **Optional** | Mobile remote control & command approvals | Python 3 & Telegram Bot Token |
| **Outlook Desktop Research** | **Optional** | Querying local Windows Outlook mailboxes via MAPI | Windows OS & Desktop Outlook |

### Section Layout
1. **Overview & Key Capabilities**
2. **Prerequisites & Feature Matrix** (Necessary vs. Optional)
3. **Core Installation (Step-by-Step)**
   - Windows PowerShell (`install.ps1` & Git clone)
   - WSL (Windows Subsystem for Linux)
   - macOS / Linux (`register-unix.js` & Git clone)
   - Global vs. Workspace plugin scoping
4. **Interactive Setup Wizard (`npm run setup`)**
   - Setting up Model Providers via Hermes Catalog
   - Setting up Google Drive / Workspace
   - System environment diagnostics
5. **Modular Reconfiguration Commands**
   - `npm run setup:models`
   - `npm run setup:google`
6. **Detailed Feature & Skill Reference**

---

## 3. Hermes Model Catalog & Model Router Setup Wizard

### 1. Catalog Architecture (`scripts/setup/src/catalog.ts`)
- **Online Catalog Fetch**: Fetches `https://nousresearch.github.io/hermes-agent/docs/api/model-catalog.json` using Node native `fetch` with a 5-second timeout.
- **Offline Fallback**: Shipped with a bundled `scripts/setup/model-catalog.json` containing current catalog snapshot (OpenAI, Anthropic, DeepSeek, Minimax, OpenRouter, Groq, Together, Ollama/Local, Moonshot/Kimi).

### 2. Interactive Wizard Flow (`npm run setup` / `npm run setup:models`)
1. **Provider Selection**: Select one or more LLM providers from the catalog.
2. **API Key Input & Validation**: Prompt for API keys for selected providers.
3. **Tier & Default Model Mapping**:
   - Prompt for `default_model` selection from available catalog models under selected providers.
   - Prompt for `fast` tier model (e.g., `deepseek-v4-flash`, `minimax-M3`, `gpt-4o-mini`, `claude-3-5-haiku`).
   - Prompt for `smart` tier model (e.g., `deepseek-v4-flash`, `claude-3-5-sonnet`, `gpt-4o`).
   - Prompt for `reasoning` tier model (e.g., `deepseek-reasoner`, `o3-mini`, `o1`).
4. **Config & Environment Persistence**:
   - Saves secrets to `mcp-servers/model-router/.env`.
   - Writes structured provider `baseURL`s, default parameters, and tier mappings to `mcp-servers/model-router/config.json`.

### 3. Model Router Engine Upgrade (`mcp-servers/model-router/src/index.ts`)
- Dynamically initializes provider SDKs (`@ai-sdk/openai`, `@ai-sdk/anthropic`, `@ai-sdk/google`, or generic OpenAI-compatible base URLs) according to `config.json`.
- Executes `route_task` with fallback handling across configured tiers and explicit model names.

---

## 4. Google Workspace & Drive Automation (`npm run setup:google`)

### 1. OAuth Setup Flow
- **Input Modes**:
  - **Option A (Interactive)**: Enter `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.
  - **Option B (File Import)**: Enter path to a downloaded GCP `credentials.json` (auto-extracts `client_id` and `client_secret`).
- **OAuth Callback & Token Generation**:
  - Automatically spins up `http://localhost:3000/oauth2callback`.
  - Opens consent URL in default system browser with Google Drive read-only scopes.
  - Receives authorization code, exchanges for refresh token, and saves `token.json` to `mcp-servers/google-drive/token.json`.
  - Writes `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `PORT` to `mcp-servers/google-drive/.env`.

### 2. Google Workspace Documentation & Troubleshooting Guide
- Dedicated section in `mcp-servers/google-drive/README.md` and `README.md` covering:
  - Setting up OAuth consent screen in Google Cloud Console.
  - Adding user email under **Test Users** (for unverified app testing).
  - Admin delegation / Workspace domain access permissions.

---

## 5. Verification & Testing Plan

1. **Automated Unit Tests**: Run `npm test` in `scripts/setup` and `mcp-servers/model-router` to verify catalog parsing, offline fallback, and validator logic.
2. **Offline Fallback Validation**: Disconnect network/mock timeout and verify fallback to local `model-catalog.json`.
3. **Setup Execution Verification**: Execute `npm run setup`, `npm run setup:models`, and `npm run setup:google` to ensure complete execution without error.
4. **Registration Verification**: Verify `install.ps1` and `register-unix.js` register paths accurately in `mcp_config.json`.
