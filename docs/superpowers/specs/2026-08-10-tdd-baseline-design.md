# AeroDeck TDD Baseline & Test Framework Design

## Overview
This document defines the architecture, test suites, mocking strategy, and root orchestration for establishing a robust Test-Driven Development (TDD) baseline across all code components in AeroDeck.

AeroDeck currently contains a mix of TypeScript MCP servers (`browser-automation`, `model-router`, `google-drive`), Python backend services (`telegram-bridge`), Node setup scripts (`scripts/setup`), and shell integration test suites (`tests/antigravity`). This design establishes test coverage for un-tested components, standardizes Jest/Pytest/Bash testing tools, and introduces root test orchestration.

---

## Key Requirements & Design Goals
1. **Zero External Dependency Unit Testing**: All standard `npm test` unit tests must execute 100% offline using mocks (no live API keys required).
2. **Gated Live Integration Testing**: Support optional live testing against Google Drive, OpenRouter/LLM models, and Telegram using local `.env` keys.
3. **Strict Credential Protection**: Prevent sensitive API keys from being checked into git by enforcing `.env*` rules and creating `.env.example` templates.
4. **Unified Root Orchestration**: Provide single commands (`npm test`, `scripts/test-all.ps1`, `scripts/test-all.sh`) to run tests across all subpackages and report consolidated results.
5. **TDD Developer Guidelines**: Establish a TDD practice (Red -> Green -> Refactor) across the repository.

---

## Directory & File Structure Changes

```
AeroDeck/
├── package.json                          # Root test scripts ("test", "test:unit", "test:live")
├── .gitignore                            # Standardized .env* and key exclusions
├── scripts/
│   ├── test-all.ps1                      # Windows PowerShell root test orchestrator
│   └── test-all.sh                       # Unix/Linux bash root test orchestrator
├── mcp-servers/
│   ├── browser-automation/
│   │   └── tests/                        # Jest unit & integration tests
│   ├── model-router/
│   │   ├── .env.example                  # Template for OPENROUTER_API_KEY
│   │   └── tests/                        # Jest unit & live LLM routing tests
│   └── google-drive/
│       ├── .env.example                  # [NEW] Template for Google Drive credentials
│       ├── jest.config.js                # [NEW] Jest configuration for TS
│       └── tests/                        # [NEW] Unit & integration tests for Drive handlers
├── scripts/setup/
│   ├── .env.example                      # [NEW] Setup test config template
│   ├── jest.config.js                    # [NEW] Jest configuration for setup TS
│   └── tests/                            # [NEW] Unit tests for platform registration logic
└── telegram-bridge/
    ├── .env.example                      # Template for Telegram API credentials
    └── tests/
        └── test_telegram_bridge.py       # Pytest unit & live Telegram bot tests
```

---

## Component Test Specifications

### 1. `mcp-servers/google-drive` (New Suite)
- **Framework**: Jest + `ts-jest`
- **Unit Tests (`tests/drive-handlers.test.ts`)**:
  - Mock `@googleapis/drive` client using Jest mocks.
  - Test file search, list, upload, download, and metadata operations.
  - Test error states: missing OAuth token, 401 Unauthorized, 403 Rate Limit, 404 File Not Found.
- **Live Integration Tests (`tests/drive-live.integration.test.ts`)**:
  - Gated by `GOOGLE_DRIVE_CLIENT_ID` / `GOOGLE_DRIVE_REFRESH_TOKEN` in `.env`.
  - Performs live folder list and metadata query if keys are present.

### 2. `mcp-servers/model-router` (Enhanced Suite)
- **Framework**: Jest + `ts-jest`
- **Unit Tests (`tests/router.test.ts`, `tests/fallback.test.ts`)**:
  - Mock LLM HTTP endpoints.
  - Test fallback cascading when primary provider fails, token estimation, cost calculation, and prompt payload transformation.
- **Live Integration Tests (`tests/router-live.integration.test.ts`)**:
  - Gated by `OPENROUTER_API_KEY` (or `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GEMINI_API_KEY`).
  - Sends minimal test prompts to verify live routing endpoints.

### 3. `mcp-servers/browser-automation` (Enhanced Suite)
- **Framework**: Jest + `ts-jest`
- **Unit Tests (`tests/puppeteer.test.ts`)**:
  - Mock Puppeteer browser lifecycle (`puppeteer.launch`, `browser.newPage`, `page.goto`, `page.click`).
  - Test timeout boundaries, screenshot captures, and navigation error recovery.

### 4. `scripts/setup` (New Suite)
- **Framework**: Jest + `ts-jest`
- **Unit Tests (`tests/register.test.ts`)**:
  - Mock Node `fs` and OS environment variables (`HOME`, `APPDATA`, `USERPROFILE`).
  - Verify JSON configuration generation and harness registration paths on Windows, macOS, and Linux.

### 5. `telegram-bridge` (Expanded Suite)
- **Framework**: Pytest + `unittest.mock`
- **Unit Tests (`tests/test_telegram_bridge.py`)**:
  - Mock `telethon` / `python-telegram-bot` async clients.
  - Test command parsing, state machine flow, message chunking, and disconnect reconnect loops.

---

## Credentials Safety & Environment Templates

### `.env` File Exclusions
All `.env` variants are enforced in `.gitignore`:
```
.env
.env.*
!.env.example
token.json
credentials.json
*.key
*.pem
```

### Supported Credentials in Local `.env` Files
1. `mcp-servers/google-drive/.env`:
   - `GOOGLE_DRIVE_CLIENT_ID`
   - `GOOGLE_DRIVE_CLIENT_SECRET`
   - `GOOGLE_DRIVE_REFRESH_TOKEN`
2. `mcp-servers/model-router/.env`:
   - `OPENROUTER_API_KEY`
   - `OPENAI_API_KEY`
   - `ANTHROPIC_API_KEY`
   - `GEMINI_API_KEY`
3. `telegram-bridge/.env`:
   - `TELEGRAM_BOT_TOKEN`
   - `TELEGRAM_API_ID`
   - `TELEGRAM_API_HASH`

---

## Root Test Orchestration

Root `package.json` scripts:
```json
{
  "scripts": {
    "test": "node scripts/test-runner.js --unit",
    "test:unit": "node scripts/test-runner.js --unit",
    "test:live": "node scripts/test-runner.js --live",
    "test:watch": "npm --prefix mcp-servers/google-drive run test:watch"
  }
}
```

Cross-Platform Orchestrator Scripts:
- `scripts/test-all.ps1`: Windows PowerShell runner executing npm test for Node components, `pytest` for `telegram-bridge`, and bash scripts under Windows subsystem / bash if available.
- `scripts/test-all.sh`: POSIX shell runner.

---

## Verification Plan
1. **Offline Verification**: Run `npm test` without any `.env` keys present; verify all unit test suites pass offline in < 10 seconds.
2. **Live Integration Verification**: Place dummy/test keys in `.env` files and verify live test gating executes successfully.
3. **Safety Audit**: Run `git status` to ensure `.env` and credential files are untracked and never staged.
