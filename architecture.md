# AeroDeck Architecture & System Design

## 1. System Overview

**AeroDeck** is an enterprise-grade agentic framework and Model Context Protocol (MCP) ecosystem designed specifically for **Google Antigravity** (Antigravity 2.0, Antigravity IDE, and Antigravity CLI).

AeroDeck bridges software engineering discipline into autonomous AI agent workflows:
* **Adaptive Execution Gate**: Automatically switches between lightweight Fast-Track execution (micro-spec + Criteria-Driven Refinement RED-GREEN-REFACTOR) and full Multi-Stage Review Pipelines (brainstorming $\rightarrow$ planning $\rightarrow$ worker/reviewer subagents).
* **Multi-Provider Model Router**: Dynamic LLM routing across OpenAI, Anthropic, Google Gemini, DeepSeek, MiniMax, Moonshot/Kimi, Groq, and Ollama, with Hermes catalog integration, multi-candidate fallback cascades, persistent sessions, and reasoning effort controls.
* **Full-Stack MCP Automation**: Standardized tools for Playwright browser automation, Google Drive/Docs knowledge extraction, and LLM task delegation.
* **Desktop & Cloud Bridges**: Windows Desktop Outlook search via PowerShell MAPI COM, zero-dependency RFC 6455 WebSocket brainstorming server, and a secure Telegram mobile bot daemon for remote supervision and interactive command approvals.
* **Zero-Pollution Logging**: Strict stdio stream protection across all MCP servers ensuring JSON-RPC on `stdout` is never corrupted by debug or error output.

---

## 2. Directory & Component Layout

```
AeroDeck/
├── AGENTS.md / agents.md       # Agent behavioral guidelines & harness links
├── CLAUDE.md                   # Contributor guidelines, anti-slop rules, harness acceptance criteria
├── GEMINI.md                   # Gemini/Antigravity plugin context mappings
├── package.json                # Project root scripts and test targets
├── plugin.json                 # Antigravity plugin manifest
├── gemini-extension.json       # Gemini extension manifest
├── install.ps1 / uninstall.ps1 # Automated Windows PowerShell installer & uninstaller
├── update.ps1                  # PowerShell plugin updater
│
├── skills/                     # 24 Specialized Agentic Skills
│   ├── using-aerodeck/         # Core bootstrap and Adaptive Execution Gate
│   ├── brainstorming/          # Intent exploration and structured specs (with server.cjs)
│   ├── criteria-driven-refinement/ # RED-GREEN-REFACTOR delivery loop
│   ├── writing-plans/          # Bite-sized task decomposition
│   ├── subagent-driven-task-pipeline/ # Worker + Reviewer subagent dispatching
│   ├── background-task-scheduling/    # Antigravity 2.0 native schedule/cron
│   ├── resilient-model-fallback/      # Recovery for offline MCP servers
│   ├── web-navigation-workflow/       # Playwright browser automation workflows
│   ├── google-drive/ (or docs)        # Cloud knowledge synthesis
│   ├── outlook-mail-research/         # Local Outlook mailbox mining
│   └── ...                            # Research, synthesis, drafting, data processing
│
├── mcp-servers/                # Model Context Protocol Servers
│   ├── model-router/           # Dynamic LLM routing, sessions & fallback cascades
│   ├── browser-automation/     # Playwright Chromium navigation & DOM interaction
│   └── google-drive/           # Google Drive v3 search, doc read, and download
│
├── scripts/                    # Automation, Testing & Setup
│   ├── setup/                  # Interactive onboarding wizard (CLI)
│   ├── test-runner.js          # Unified multi-language test runner
│   ├── outlook-search.ps1      # PowerShell MAPI COM mailbox search
│   └── bump-version.sh         # Semver bump automation
│
├── telegram-bridge/            # Remote Telegram Bot Daemon (Python)
│   ├── bridge.py               # Async bot with whitelist auth & inline approval buttons
│   └── requirements.txt        # python-telegram-bot & dependencies
│
├── tests/                      # Automated Test Suites
│   ├── brainstorm-server/      # RFC 6455 WebSocket framing & server tests
│   ├── test_telegram_bridge.py # Telegram bot security & command unit tests
│   └── antigravity/            # Harness integration tests
│
└── docs/                       # Comprehensive Specifications & Execution Plans
    ├── aerodeck/specs/         # 22 Design Specifications
    ├── aerodeck/plans/         # 23 Implementation Plans
    └── testing.md              # Testing guidelines & methodology
```

---

## 3. Component Relationships & Data Flow

```
                      ┌─────────────────────────────────┐
                      │     User Request / Terminal     │
                      └────────────────┬────────────────┘
                                       │
                                       ▼
                      ┌─────────────────────────────────┐
                      │    using-aerodeck Bootstrap     │
                      └────────────────┬────────────────┘
                                       │
                         Task Complexity Evaluation
                                      / \
                       Single-step   /   \   Multi-step / Complex
                                    /     \
                                   ▼       ▼
       ┌───────────────────────────────┐   ┌───────────────────────────────┐
       │     ADAPTIVE FAST-TRACK       │   │    DEEP REVIEW PIPELINE       │
       │  criteria-driven-refinement   │   │  1. brainstorming             │
       │  (RED-GREEN-REFACTOR)         │   │  2. writing-plans             │
       │                               │   │  3. subagent-pipeline         │
       │                               │   │  4. requesting-task-review    │
       └───────────────┬───────────────┘   └───────────────┬───────────────┘
                       │                                   │
                       └─────────────────┬─────────────────┘
                                         │
                                         ▼
                       ┌───────────────────────────────────┐
                       │   verification-before-delivery    │
                       │   (Empirical Command / State)     │
                       └─────────────────┬─────────────────┘
                                         │
                                         ▼
                       ┌───────────────────────────────────┐
                       │        MCP Server Ecosystem       │
                       │                                   │
                       │ ┌───────────────┐ ┌─────────────┐ │
                       │ │ model-router  │ │ playwright  │ │
                       │ └───────┬───────┘ └─────────────┘ │
                       │         │                         │
                       │ ┌───────▼───────┐ ┌─────────────┐ │
                       │ │ Google Drive  │ │ Telegram /  │ │
                       │ │  Workspace    │ │   Outlook   │ │
                       │ └───────────────┘ └─────────────┘ │
                       └───────────────────────────────────┘
```

### 3.1 Model Router Architecture & Fallback Cascade
The Model Router (`mcp-servers/model-router/`):
1. Receives `route_task` tool request with parameters: `prompt`, `modelTier` (`fast` | `smart` | `reasoning` | `default`), `modelName`, `sessionId`, `reasoningEffort`.
2. Inspects `config.json` and the **Hermes Model Catalog** snapshot.
3. Builds an ordered candidate list: Primary model $\rightarrow$ configured fallback models.
4. Executes request using Vercel AI SDK (`@ai-sdk/openai`, `@ai-sdk/anthropic`, `@ai-sdk/google`).
5. If primary model encounters an HTTP 429 / 5xx error, automatically falls back to secondary candidates without disrupting the calling agent.
6. Persists multi-turn conversation history in `sessions.json` atomically when `sessionId` is provided.
7. Logs diagnostic telemetry to `model-router.log` and `stderr` without polluting `stdout`.

### 3.2 Stdio Stream Isolation Pattern
All MCP servers must strictly conform to JSON-RPC over `stdio`:
* `stdout` is exclusively reserved for valid JSON-RPC frames.
* `setupStdioProtection()` overrides `console.log`, `console.info`, `console.debug`, and `console.warn` to redirect all messages to `console.error` (`stderr`) and an append-only log file.
* This guarantees that client parsers in Antigravity or Claude never encounter malformed JSON packets.

### 3.3 Zero-Dependency Brainstorm Server
Located in `skills/brainstorming/scripts/server.cjs`:
* Uses native Node.js `http` and `crypto` modules with zero external `node_modules`.
* Implements RFC 6455 WebSocket handshake (`computeAcceptKey`) and frame encoding/decoding (`encodeFrame`, `decodeFrame`) supporting text, close, ping, and pong frames.
* Serves a live interactive web dashboard and terminal interface for visual review during the brainstorming phase.

### 3.4 Telegram Supervision & Command Approval Daemon
Located in `telegram-bridge/bridge.py`:
* Asynchronous bot using `python-telegram-bot`.
* Enforces strict user authentication via `ALLOWED_USER_IDS` whitelist decorator (`@restricted`).
* For dangerous terminal actions or long-running jobs, sends interactive inline keyboard buttons (`Approve` / `Reject`).
* Handles file uploads and downloads with path sanitization preventing directory traversal attacks.

### 3.5 Dual-Scope Installation Architecture (Global vs Workspace)
AeroDeck supports both machine-wide deployment and isolated project deployments:
* **Global Scope**: Installed to `~/.gemini/config/plugins/aerodeck` with servers registered in `~/.gemini/config/mcp_config.json`. Available to all Antigravity projects.
* **Workspace Scope**: Installed to `<project-root>/.agents/plugins/aerodeck` with servers registered in `.agents/plugins/aerodeck/mcp_config.json`. The installer auto-detects workspace context and dynamically binds executable paths to the project directory without modifying user-level global configuration.
* **Tooling Support**: Both `install.ps1`, `uninstall.ps1`, `scripts/setup/register-unix.js`, and the interactive CLI setup wizard (`scripts/setup/src/index.ts`) provide native `-Scope Global|Workspace` support.

---

## 4. Testing & Verification Architecture

AeroDeck implements a multi-tier testing strategy executed via `node scripts/test-runner.js`:

| Tier | Component | Framework | Target Files |
| :--- | :--- | :--- | :--- |
| **Tier 1** | Browser Automation | Jest + ts-jest | `mcp-servers/browser-automation/tests/` |
| **Tier 2** | Model Router | Jest + ts-jest (ESM) | `mcp-servers/model-router/tests/` |
| **Tier 3** | Google Drive MCP | Jest + ts-jest (ESM) | `mcp-servers/google-drive/tests/` |
| **Tier 4** | Setup Wizard & Catalog | Jest + ts-jest | `scripts/setup/tests/` |
| **Tier 5** | WS RFC 6455 Protocol | Pure Node.js assert | `tests/brainstorm-server/ws-protocol.test.js` |
| **Tier 6** | Telegram Bridge & Security | Python `unittest` | `tests/test_telegram_bridge.py` |

---

## 5. Development Principles & Guardrails

1. **Anti-Rationalization**: Agents must not skip verification, guess fixes, or assume tests pass without running them.
2. **Criteria-Driven Refinement (TDD)**: Every code modification follows the RED-GREEN-REFACTOR discipline.
3. **Isolated Workspaces**: Changes should be isolated in distinct branches or worktrees where appropriate.
4. **Documentation Sync**: Any changes to files, components, or architecture must be immediately reflected in `architecture.md`, `README.md`, and `agents.md`.
