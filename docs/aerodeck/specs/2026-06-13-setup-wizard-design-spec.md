# Design Specification: Interactive Setup Wizard

**Date:** 2026-06-13  
**Status:** Approved  
**Topic:** Interactive Setup Wizard for AeroDeck Setup  

## Triggering Conditions
* **Command:** `npm run setup`
* **Goal:** Guide new users through a cross-platform interactive CLI wizard to configure environment dependencies, API keys, Google Drive OAuth tokens, and register MCP servers in `mcp_config.json`.

## Wizard Architecture & Files
* **Path:** `scripts/setup/`
* **Dependencies:** `prompts` (interactive prompting), `chalk` (colored output), `dotenv` (env parsing), `googleapis` (Drive testing).
* **Files to create/modify:**
  * `package.json` (at project root): Add `"setup": "npm --prefix scripts/setup install && npm --prefix scripts/setup run start"` script.
  * `scripts/setup/package.json`: Private dependencies and build scripts.
  * `scripts/setup/tsconfig.json`: TypeScript configuration.
  * `scripts/setup/src/index.ts`: Flow control and UI logic.
  * `scripts/setup/src/validators.ts`: Active API validation (Kimi, Minimax, Google Drive API testing).

## Step-by-Step Flow

### Step 1: Environment Check
- Check Node.js and Git installations.
- Alert user if requirements are missing.

### Step 2: Model Router Configuration & Testing
- Prompt user for `KIMI_API_KEY` and `MINIMAX_API_KEY` using hidden password masking.
- **Active Validation:** Send a lightweight text generation request using the provided keys to their respective endpoints:
  - Moonshot API: `https://api.moonshot.cn/v1/chat/completions`
  - Minimax API: `https://api.minimax.chat/v1/text/chat`
- If verified: Write them to `mcp-servers/model-router/.env`.
- If failed: Alert user and prompt to re-enter or skip.

### Step 3: Google Drive OAuth Setup & Testing
- Ask if the user wants to configure Google Drive.
- If yes:
  - Prompt for `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.
  - Save credentials in `mcp-servers/google-drive/.env`.
  - Spawns the OAuth browser consent loop to obtain the access/refresh tokens and writes them to `mcp-servers/google-drive/token.json`.
  - **Active Validation:** Test credentials by listing files in their drive.

### Step 4: Register MCP Servers
- Execute the global registration script to configure `browser-automation`, `model-router`, and `google-drive` in `mcp_config.json`.

### Step 5: Summary
- Print status of all servers with clear green/red status checks.
