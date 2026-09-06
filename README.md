# AeroDeck for Antigravity 2.0, Antigravity IDE & Antigravity CLI

[![Release](https://img.shields.io/badge/version-7.0.0-blue.svg)](package.json)
[![Platform](https://img.shields.io/badge/platform-Antigravity%202.0%20%7C%20IDE%20%7C%20CLI-orange.svg)](gemini-extension.json)
[![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-green.svg)](package.json)
[![License](https://img.shields.io/badge/license-MIT-lightgrey.svg)](LICENSE)
[![Tests](https://img.shields.io/badge/tests-100%25%20passing-brightgreen.svg)](scripts/test-runner.js)

**AeroDeck** is an enterprise-grade, general-purpose agentic framework and Model Context Protocol (MCP) tool ecosystem engineered specifically for **Google Antigravity** (Antigravity 2.0, Antigravity IDE, and Antigravity CLI).

AeroDeck translates rigorous software engineering discipline—isolated workspaces, Criteria-Driven Refinement (TDD), peer-reviewed subagent pipelines, anti-rationalization guardrails, resilient multi-provider LLM routing, and automated desktop/cloud bridges—into domain-agnostic operational capabilities for autonomous AI agents.

---

## Key Capabilities & Innovations (AeroDeck 7.0)

* ⚡ **Adaptive Execution Gate**: Intelligently switches between lightweight **Fast-Track** execution (micro-spec + RED-GREEN-REFACTOR via `criteria-driven-refinement` for single-step edits) and full **Multi-Stage Review Pipelines** for complex initiatives—eliminating token waste and ceremony on simple tasks.
* 🔀 **Resilient Multi-Provider Model Router**: Dynamic LLM task delegation via the **Hermes Model Catalog** (`fast` $\rightarrow$ MiniMax, `smart` $\rightarrow$ DeepSeek, `reasoning` $\rightarrow$ DeepSeek/o1). Features multi-candidate fallback cascades, dynamic reasoning effort controls (`reasoningEffort`), persistent conversation threads, and live diagnostic tools (`get_router_status`).
* 🛡️ **Ironclad Anti-Rationalization Guardrails**: Rigid behavioral constraints in `using-aerodeck` and `brainstorming` that prevent agent shortcuts, speculative fixes, unverified assumptions, or premature completion claims.
* ⏰ **Antigravity 2.0 Native Background Scheduling**: First-class support for native Antigravity 2.0 `schedule` primitives (one-shot reactive wakeup timers with `TimerCondition` and persistent recurring cron daemons with `IsDaemon`).
* 🌐 **Full-Stack MCP Automation Ecosystem**: Out-of-the-box Model Context Protocol servers for Browser Automation (Playwright), Google Workspace (Drive & Docs), and Multi-Model Routing.
* 🔒 **Unified Structured Logging & Stdio Stream Protection**: Strict isolation of JSON-RPC communication channels across all MCP servers to prevent protocol corruption, paired with configurable dual-output logging (stderr + local log files) and level filtering (`*_LOG_LEVEL`).
* 📱 **Telegram Mobile Supervision**: Secure remote bot daemon for mobile status tracking, file uploads, and interactive inline terminal command approvals (`Approve` / `Reject`).
* 🧪 **5-Tier Quality Assurance Pyramid**: Comprehensive automated test coverage including MCP server unit tests, WebSocket RFC 6455 protocol framing, server lifecycles, and security guardrails.

---

## 1. Prerequisites & Component Necessity Matrix

Before installing AeroDeck, ensure your environment meets the minimum prerequisites:

### Prerequisites
* **Node.js**: Version 18.0.0 or higher
* **Git**: Installed and available in your system `PATH`
* **Python 3** *(Optional)*: Required for `data-processing`, `transcript-processing`, and `telegram-bridge`.
* **ffmpeg** *(Optional)*: Required for audio/video transcript extraction workflows.
* **Windows Desktop Outlook** *(Optional)*: Required only for `outlook-mail-research` MAPI queries on Windows.

### Component Necessity Matrix

| Component | Necessity | Purpose | Primary Dependencies |
| :--- | :--- | :--- | :--- |
| **AeroDeck Plugin Core** | **Mandatory** | Workflow skills, behavioral rules, and platform tool mappings (`plugin.json`, `skills/`) | Antigravity 2.0 / IDE / CLI |
| **MCP Server Registration** | **Mandatory** | Registers tool bridges in global `mcp_config.json` via setup wizard or PowerShell scripts | Node.js ≥ 18 |
| **Model Router Server** | **Recommended** | Dynamic multi-provider LLM task routing (`route_task`) with Hermes Catalog support | Provider API Key(s) (OpenAI, Anthropic, DeepSeek, MiniMax, etc.) |
| **Browser Automation** | **Optional** | Headless / visible browser automation and web content extraction | Node.js & Playwright binaries |
| **Google Drive / Workspace** | **Optional** | Search, read, and download Google Drive docs and binary assets | GCP OAuth Client ID & Secret |
| **Telegram Bridge** | **Optional** | Remote bot supervision & mobile terminal command approval daemon | Python 3 & Telegram Bot Token |
| **Outlook Research** | **Optional** | Querying local Windows Outlook mailboxes via native MAPI COM | Windows OS & Desktop Outlook |

---

## 2. Architecture & Execution Lifecycle

AeroDeck standardizes agent execution into an adaptive, verified pipeline:

```
                          [ Incoming User Request ]
                                      │
                                      ▼
                        [ using-aerodeck Bootstrap ]
                                      │
                         Is task lightweight / 1-step?
                                     / \
                           YES      /   \      NO
                                   /     \
                                  ▼       ▼
    ┌─────────────────────────────────┐   ┌─────────────────────────────────┐
    │       ADAPTIVE FAST-TRACK       │   │       DEEP REVIEW PIPELINE      │
    │  criteria-driven-refinement     │   │                                 │
    │  1. 2-sentence micro-spec       │   │  1. brainstorming               │
    │  2. User approval               │   │     Explore intent, spec design │
    │  3. RED-GREEN-REFACTOR cycle    │   │  2. writing-plans               │
    │                                 │   │     Bite-sized task plan        │
    │                                 │   │  3. subagent-driven-pipeline    │
    │                                 │   │     Worker + Reviewer agents    │
    │                                 │   │  4. completing-a-task-pipeline  │
    └────────────────┬────────────────┘   └────────────────┬────────────────┘
                     │                                     │
                     └──────────────────┬──────────────────┘
                                        ▼
                         [ verification-before-delivery ]
                         Empirical Command / Visual / State Checks
                                        │
                                        ▼
                              [ Completed Delivery ]
```

---

## 3. Installation Guide

AeroDeck can be installed either globally (accessible across all Antigravity projects) or locally at the workspace level.

### macOS / Linux

* **Global Installation** (Recommended):
  ```bash
  git clone https://github.com/eeftychiou/AeroDeck ~/.gemini/config/plugins/aerodeck
  ```

* **Workspace Installation** (Project-level):
  ```bash
  git clone https://github.com/eeftychiou/AeroDeck .agents/plugins/aerodeck
  ```

* **Updating AeroDeck**:
  ```bash
  cd ~/.gemini/config/plugins/aerodeck && git pull
  ```

---

### Windows (PowerShell)

* **Global Installation** (Recommended):
  ```powershell
  git clone https://github.com/eeftychiou/AeroDeck "$env:USERPROFILE\.gemini\config\plugins\aerodeck"
  ```

* **Workspace Installation** (Project-level):
  ```powershell
  git clone https://github.com/eeftychiou/AeroDeck .agents\plugins\aerodeck
  ```

* **Automated PowerShell Installer / Updater**:
  ```powershell
  # Run automated registration and setup
  .\install.ps1

  # Update plugin files
  .\update.ps1

  # Uninstall and clean up mcp_config.json
  .\uninstall.ps1
  ```

* **Troubleshooting Existing Folders**:
  If `git clone` reports `destination path already exists`, either remove the old folder or pull updates:
  ```powershell
  Remove-Item -Recurse -Force "$env:USERPROFILE\.gemini\config\plugins\aerodeck"
  git clone https://github.com/eeftychiou/AeroDeck "$env:USERPROFILE\.gemini\config\plugins\aerodeck"
  ```

---

### Windows (WSL)

If running inside WSL or connecting Windows Antigravity IDE to a WSL workspace:

* **Global Plugin** (Windows host environment):
  ```bash
  git clone https://github.com/eeftychiou/AeroDeck /mnt/c/Users/$USER/.gemini/config/plugins/aerodeck
  ```

* **Workspace Plugin** (Inside WSL project directory):
  ```bash
  git clone https://github.com/eeftychiou/AeroDeck /path/to/wsl/project/.agents/plugins/aerodeck
  ```

---

## 4. Interactive Setup & Onboarding Wizard

AeroDeck includes an automated setup wizard that installs dependencies, builds all TypeScript MCP servers, configures AI model keys, sets up Google OAuth, and registers bridges in your global `mcp_config.json`:

```bash
# Run full setup wizard (Build Servers + Models + Google Workspace + MCP Registration)
npm run setup
```

### Modular Reconfiguration Commands

Reconfigure specific subsystems at any time without re-running full onboarding:

```bash
# Reconfigure AI Model Providers & Model Tiers (Hermes Catalog)
npm run setup:models

# Reconfigure Google Workspace & Drive OAuth Credentials
npm run setup:google
```

---

## 5. Model Router & Hermes Catalog Deep Dive

AeroDeck's Model Router ([`mcp-servers/model-router`](mcp-servers/model-router/)) decouples high-level agent reasoning from specific LLM vendors. It integrates directly with the **Hermes Model Catalog** (`https://nousresearch.github.io/hermes-agent/docs/api/model-catalog.json`), featuring an automatic local snapshot fallback if offline.

### Supported Providers
* **OpenAI** (`gpt-4o`, `gpt-4o-mini`, `o1`, `o3-mini`)
* **Anthropic** (`claude-3-7-sonnet`, `claude-3-5-haiku`)
* **DeepSeek** (`deepseek-v4-flash`, `deepseek-chat`, `deepseek-reasoner`)
* **Google Gemini** (`gemini-2.5-pro`, `gemini-2.5-flash`)
* **MiniMax** (`minimax-M3`, `abab6.5s-chat`)
* **Moonshot AI & Kimi Coding** (`moonshot-v1-8k`, `kimi-k1.5-preview`)
* **OpenRouter** (Aggregated access to leading open & closed models)
* **Groq**, **Together AI**, and **Ollama (Local)**

### Routing Tiers & Automatic Fallback Cascades
Models are grouped into logical performance tiers:
* **`fast`**: Low-latency, cost-effective tasks (e.g. MiniMax text-01 / gpt-4o-mini)
* **`smart`**: Complex reasoning, code generation, and multi-document analysis (e.g. DeepSeek v4 flash / Claude 3.5 Sonnet)
* **`reasoning`**: Deep multi-step analytical and architectural verification (e.g. DeepSeek Reasoner / o1 / o3-mini)
* **`default`**: Configurable system default model

> [!TIP]
> **Automatic Failover**: If the primary model encounters an HTTP 429 rate limit or 500 error, the router automatically attempts the configured fallback candidates in sequence with zero subagent interruption.

### Advanced Model Router Features
1. **Dynamic Reasoning Effort**: Pass `reasoningEffort: "low" | "medium" | "high" | "max"` to configure thinking budget tokens for DeepSeek thinking mode or OpenAI o-series models.
2. **Persistent Conversation Sessions**: Use `session_id` to maintain multi-turn memory threads across independent tool calls, backed by atomic file writes in `sessions.json`.
3. **Explicit Metadata Headers**: Every generation returns transparent diagnostic metadata:
   ```text
   [Model Router Metadata: Provider=deepseek | Model=deepseek-v4-flash | Tier=smart | Duration=1420ms]
   ```
4. **Diagnostic Status Tool**: Call `get_router_status` anytime to inspect active tiers, configured API keys, and default profiles.

---

## 6. Google Workspace & Drive Integration

To connect corporate or personal Google Drive accounts:

1. Run the dedicated setup script:
   ```bash
   npm run setup:google
   ```
2. Choose to paste your Google Cloud **Client ID** & **Client Secret** OR provide the file path to a downloaded GCP `credentials.json` file.
3. The wizard spins up a local callback server at `http://localhost:3000/oauth2callback` and automatically opens your browser for consent.
4. Complete consent in the browser. Refresh tokens are saved to `mcp-servers/google-drive/token.json`.

For detailed Google Cloud Console OAuth setup instructions and Workspace domain policies, see [mcp-servers/google-drive/README.md](mcp-servers/google-drive/README.md).

---

## 7. Exposed MCP Tools Reference

AeroDeck registers 3 dedicated MCP servers providing 10 specialized tools:

| Server | Tool Name | Description | Key Arguments |
| :--- | :--- | :--- | :--- |
| **`model-router`** | `route_task` | Route prompt to a tier or provider with fallback cascades | `prompt`, `modelTier`, `modelName`, `session_id`, `reasoningEffort` |
| **`model-router`** | `get_router_status` | Return active tiers, configured provider keys, and routing health | *(None)* |
| **`model-router`** | `clear_session` | Clear conversation history for a given session ID | `session_id` |
| **`browser-automation`** | `navigate` | Navigate Chromium browser to a specified URL | `url` |
| **`browser-automation`** | `get_content` | Retrieve full HTML content of the active web page | *(None)* |
| **`browser-automation`** | `click_element` | Click an element matching a CSS selector | `selector` |
| **`browser-automation`** | `fill_element` | Populate an input field matching a CSS selector | `selector`, `value` |
| **`google-drive`** | `search_drive_files` | Search Google Drive files by name and full-text content | `query` |
| **`google-drive`** | `read_google_doc` | Read plain text content of a Google Doc or text file | `fileId` |
| **`google-drive`** | `download_drive_file`| Download a binary file (PDF, image, sheet) to local disk | `fileId`, `outputPath` |

---

## 8. Skills Library (24 Specialized Skills)

AeroDeck includes 24 composable skills organized across 5 operational tiers:

### 1. Core Workflow Engine
* **[using-aerodeck](skills/using-aerodeck/SKILL.md)** - Bootstrap loader, skill rules engine, and Adaptive Complexity Gate.
* **[brainstorming](skills/brainstorming/SKILL.md)** - Explores user intent and presents structured specs before any execution begins.
* **[using-isolated-workspaces](skills/using-isolated-workspaces/SKILL.md)** - Ensures clean execution environments and baseline verification.
* **[writing-plans](skills/writing-plans/SKILL.md)** - Decomposes work into verified, bite-sized tasks with clear checkpoints.
* **[subagent-driven-task-pipeline](skills/subagent-driven-task-pipeline/SKILL.md)** - Orchestrates isolated worker and reviewer subagents.
* **[executing-plans](skills/executing-plans/SKILL.md)** - Batch task execution with human-in-the-loop review checkpoints.
* **[completing-a-task-pipeline](skills/completing-a-task-pipeline/SKILL.md)** - Final verification, deliverable packaging, and branch integration.
* **[background-task-scheduling](skills/background-task-scheduling/SKILL.md)** - Native Antigravity 2.0 schedule & cron monitoring (`schedule`).
* **[resilient-model-fallback](skills/resilient-model-fallback/SKILL.md)** - Graceful recovery procedures for offline MCP servers and model router failures.

### 2. QA & Delivery Refinement
* **[criteria-driven-refinement](skills/criteria-driven-refinement/SKILL.md)** - Strict RED-GREEN-REFACTOR delivery cycle.
* **[requesting-task-review](skills/requesting-task-review/SKILL.md)** - Multi-stage pre-delivery review with issue severity grading.
* **[receiving-task-review](skills/receiving-task-review/SKILL.md)** - Rigorous technical verification of incoming review feedback.
* **[verification-before-delivery](skills/verification-before-delivery/SKILL.md)** - Empirical validation (Command, Visual, Folder State) before completion claims.

### 3. Systematic Problem Solving
* **[systematic-problem-solving](skills/systematic-problem-solving/SKILL.md)** - 4-phase root-cause investigation before proposing fixes.
* **[dispatching-parallel-tasks](skills/dispatching-parallel-tasks/SKILL.md)** - Concurrent dispatch of non-interfering subtasks.

### 4. Operations & Automation
* **[systematic-research](skills/systematic-research/SKILL.md)** - Multi-query harvesting, source verification, and confidence scoring.
* **[document-drafting](skills/document-drafting/SKILL.md)** - Audience-tailored professional communication and reporting.
* **[document-synthesis](skills/document-synthesis/SKILL.md)** - Cross-references local documents, Google Drive files, and web findings.
* **[data-processing](skills/data-processing/SKILL.md)** - Programmatic cleaning, validation, and statistics on tabular datasets.
* **[transcript-processing](skills/transcript-processing/SKILL.md)** - Meeting transcript cleanup, action item extraction, and decision logging.
* **[email-management-workflow](skills/email-management-workflow/SKILL.md)** - Automated inbox searching and executive response drafting.
* **[outlook-mail-research](skills/outlook-mail-research/SKILL.md)** - Windows Outlook MAPI querying and attachment extraction.
* **[web-navigation-workflow](skills/web-navigation-workflow/SKILL.md)** - Playwright browser automation workflows.

### 5. Skill Meta
* **[writing-skills](skills/writing-skills/SKILL.md)** - Guide for creating, evaluating, and stress-testing custom AeroDeck skills.

---

## 9. Generalized Real-World Agentic Use Cases

Derived from real-world empirical session transcripts, AeroDeck excels in complex operational scenarios:

### Use Case 1: High-Stakes Public Sector Application & Statutory Audit
* **Challenge**: Auditing extensive multi-stage personnel applications against statutory scoring rubrics under strict character constraints.
* **AeroDeck Solution**: Uses `systematic-research` and `criteria-driven-refinement` to cross-reference application narratives against statutory rubrics. Runs automated scripts to enforce character bounds with zero deviation.

### Use Case 2: Ministerial & Diplomatic Executive Briefing Synthesis
* **Challenge**: Synthesizing dozens of policy papers, treaty drafts, and news feeds into a crisp 1-page Bottom Line Up Front (BLUF) briefing.
* **AeroDeck Solution**: Dispatches parallel worker subagents via `document-synthesis` and `document-drafting`, followed by reviewer subagents enforcing tone, factual accuracy, and policy consistency.

### Use Case 3: Local Desktop Outlook Mailbox Mining & Executive Drafting
* **Challenge**: Researching historical client email correspondence and agreements stored across fragmented local Windows Outlook archives.
* **AeroDeck Solution**: Combines `outlook-mail-research` via PowerShell MAPI COM with `model-router` to index threads, extract attachments, and draft executive responses without cloud data leaks.

### Use Case 4: Cloud Workspace Knowledge Ingestion (Google Drive & Docs)
* **Challenge**: Extracting knowledge from corporate Google Drive documents and synthesizing them into a structured local knowledge base.
* **AeroDeck Solution**: Employs the `google-drive` MCP server (`search_drive_files`, `read_google_doc`) to harvest documentation, process schemas, and build searchable local markdown repositories.

### Use Case 5: Subagent-Driven Multi-Stage Quality Review Pipelines
* **Challenge**: Implementing large-scale features where single-agent reasoning overlooks subtle regressions or boundary conditions.
* **AeroDeck Solution**: Uses `subagent-driven-task-pipeline` to dispatch isolated worker agents in branched workspaces, followed by specialized reviewer agents (Security, Logic, Accessibility) verifying code before merge.

### Use Case 6: Remote Autonomous Operation & Mobile Approvals via Telegram
* **Challenge**: Supervising long-running overnight agent tasks from a mobile device without sacrificing security.
* **AeroDeck Solution**: The `telegram-bridge` daemon streams status updates to your private Telegram chat and halts before destructive terminal actions, awaiting your mobile tap on inline `Approve` / `Reject` buttons.

---

## 10. Unified Logging Architecture & Telemetry

AeroDeck implements a zero-pollution logging architecture across all MCP servers and bridges:

* **Stdio Protection**: Standard output (`stdout`) is strictly reserved for JSON-RPC messages. All internal debug logs and errors are routed to `stderr` and rotating file logs.
* **Log Levels**: Control verbosity via environment variables (`DEBUG` = 0, `INFO` = 1, `WARN` = 2, `ERROR` = 3):
  * `MODEL_ROUTER_LOG_LEVEL`: Logs routing decisions, session events, fallback triggers (`mcp-servers/model-router/model-router.log`).
  * `BROWSER_AUTOMATION_LOG_LEVEL`: Logs navigation, CSS selector targets, payload sizes (`mcp-servers/browser-automation/browser-automation.log`).
  * `GOOGLE_DRIVE_LOG_LEVEL`: Logs API queries, file reads, download paths (`mcp-servers/google-drive/google-drive.log`).
  * `TELEGRAM_BRIDGE_LOG_LEVEL`: Logs bot commands, whitelist auth attempts, telemetry (`telegram-bridge/telegram-bridge.log`).

---

## 11. Testing & Quality Assurance Pyramid

AeroDeck enforces comprehensive quality gates across its entire codebase:

```bash
# Run all unit test suites across all MCP servers and setup scripts
npm test

# Run offline unit test suites explicitly
npm run test:unit

# Run live integration test suites (requires active API credentials)
npm run test:live
```

### Test Suite Breakdown

* **Browser Automation Unit Tests**: Validates Playwright browser lifecycle, element interaction handlers, and Stdio logger guards.
* **Model Router Unit & Fallback Tests**: Verifies tier mapping, multi-candidate fallback cascades, dynamic reasoning effort, session persistence, and router status reporting.
* **Google Drive Handlers & Mocks**: Tests OAuth2 authentication initialization, file searches, doc reading, and binary downloads.
* **Setup Wizard & Catalog Tests**: Tests Hermes catalog schema normalization, provider navigation, and configuration generators.
* **RFC 6455 WebSocket Framing Tests**: 31 unit tests validating byte-level masking, handshake negotiation, frame boundaries (65,535 and 65,536 bytes), and close payloads.
* **Telegram Bridge Security Audit**: 21 unit tests covering user whitelist authorization guards, path traversal protections, and callback queries.

---

## 12. Documentation Index & Guidelines

For architectural specifications, execution plans, and contributor guidelines:

* **[Documentation Index](docs/README.md)**: Catalog of 22 design specifications and 23 implementation plans.
* **[Testing Guidelines](docs/testing.md)**: In-depth guide to writing and running AeroDeck tests.
* **[Contributor Guidelines](CLAUDE.md)**: Quality standards, PR templates, and evaluation requirements for contributing to AeroDeck.

---

## 13. License

AeroDeck is licensed under the [MIT License](LICENSE).
