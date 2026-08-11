# AeroDeck for Antigravity 2.0, Antigravity IDE and Antigravity CLI

AeroDeck is a complete, ground-up general-purpose framework for agentic workflows. It is built on top of composable skills, system rules, and automated MCP server bridges to ensure your AI agent operates systematically and reliably across tasks.

---

## 1. Prerequisites & Component Matrix

Before installing AeroDeck, review the system requirements and component breakdown:

### Prerequisites
- **Node.js**: Version 18.0.0 or higher
- **Git**: Installed and available in your system PATH
- **Python 3** *(Optional)*: Required only for `data-processing` and `transcript-processing` skills.
- **ffmpeg** *(Optional)*: Required only for video/audio extraction skills.
- **Windows Desktop Outlook** *(Optional)*: Required only for `outlook-mail-research` MAPI queries.

### Component Necessity Matrix

| Component | Necessity | Purpose | Dependencies |
| :--- | :--- | :--- | :--- |
| **AeroDeck Plugin Core** | **Mandatory** | Workflow skills, prompts, and tool mappings (`plugin.json`, `skills/`) | Antigravity 2.0 / IDE / CLI |
| **MCP Server Registration** | **Mandatory** | Registers tool bridges in global `mcp_config.json` via `install.ps1` or `register-unix.js` | Node.js ≥ 18 |
| **Model Router Server** | **Optional** | Multi-provider LLM task routing (`route_task`) with Hermes Catalog support | Provider API Key(s) (OpenAI, Anthropic, DeepSeek, Minimax, etc.) |
| **Google Drive / Workspace** | **Optional** | Search, read, and download corporate Google Drive documents | GCP OAuth Client ID & Secret |
| **Browser Automation** | **Optional** | Headless / visible browser interaction (Playwright) | Node.js & Playwright binaries |
| **Telegram Bridge** | **Optional** | Mobile remote control & shell command approval daemon | Python 3 & Telegram Bot Token |
| **Outlook Research** | **Optional** | Querying local Windows Outlook desktop mailboxes via MAPI | Windows OS & Desktop Outlook |

---

## 2. Installation Guide

AeroDeck supports both **Global Scope** (available across all projects) and **Workspace Scope** (project-specific). Choose your OS platform below.

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

* **Updating AeroDeck**:
  ```powershell
  cd "$env:USERPROFILE\.gemini\config\plugins\aerodeck"; git pull
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

## 3. Interactive Setup & Onboarding Wizard

After cloning AeroDeck, run the interactive setup wizard to register MCP servers, configure AI models, and set up Google Workspace integration:

```bash
# Run full setup wizard (Models + Google Workspace + MCP Registration)
npm run setup
```

### Modular Reconfiguration Commands

You can reconfigure specific parts of AeroDeck at any time without re-running full setup:

```bash
# Reconfigure AI Model Providers & Model Tiers (Hermes Catalog)
npm run setup:models

# Reconfigure Google Workspace & Drive OAuth Credentials
npm run setup:google
```

---

## 4. Model Selection & Hermes Model Catalog Setup

AeroDeck includes dynamic model routing via the **Hermes Model Catalog** (`https://nousresearch.github.io/hermes-agent/docs/api/model-catalog.json`).

When running `npm run setup:models` or `npm run setup`:
1. AeroDeck loads the latest online model catalog (or falls back automatically to a bundled offline snapshot if offline).
2. Select your active AI providers:
   - **OpenAI** (`gpt-4o`, `gpt-4o-mini`, `o3-mini`, `o1`)
   - **Anthropic** (`claude-3-5-sonnet`, `claude-3-5-haiku`)
   - **DeepSeek** (`deepseek-v4-flash`, `deepseek-chat`, `deepseek-reasoner`)
   - **Minimax** (`minimax-M3`, `abab6.5s-chat`)
   - **Moonshot / Kimi** (`moonshot-v1-8k`, `moonshot-v1-32k`)
   - **OpenRouter** (`google/gemini-2.5-pro`, `anthropic/claude-3.5-sonnet`)
   - **Groq**, **Together AI**, or **Ollama (Local)**
3. Provide the corresponding API keys.
4. Assign models to performance tiers:
   - **Fast Tier**: Lightweight, high-speed tasks
   - **Smart Tier**: Complex reasoning & coding tasks
   - **Reasoning Tier**: Deep multi-step analytical tasks
   - **Default Model**: General purpose default

Configurations are saved to `mcp-servers/model-router/.env` (keys) and `mcp-servers/model-router/config.json` (provider endpoints and tier mappings).

---

## 5. Google Workspace & Drive Integration

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

## 6. How AeroDeck Works

AeroDeck operates through structured, context-aware workflow skills:

```
[ User Request ]
       │
       ▼
 [ brainstorming ] ──────► Explores intent, validates design in sections
       │
       ▼
[ writing-plans ] ──────► Decomposes work into verified bite-sized tasks
       │
       ▼
[ subagent-driven-task-pipeline ] ──► Worker subagent + Multi-stage reviewer pipeline
       │
       ▼
[ criteria-driven-refinement ] ────► RED-GREEN-REFACTOR execution cycle
       │
       ▼
[ completing-a-task-pipeline ] ───► Deliverable check, clean workspace, commit/PR
```

---

## 7. Skills Library

AeroDeck includes 24 specialized skills across 5 categories:

### 1. Core Workflow Engine
* **brainstorming** - Requirement discovery & design validation before action (with Adaptive Fast-Track).
* **using-isolated-workspaces** - Workspace isolation and baseline verification.
* **writing-plans** - Task decomposition with explicit targets and verification steps.
* **subagent-driven-task-pipeline** - Autonomous execution with worker & reviewer subagents.
* **executing-plans** - Batch execution with human review checkpoints.
* **completing-a-task-pipeline** - Deliverable verification and cleanup.
* **background-task-scheduling** - Native Antigravity 2.0 schedule & cron monitoring (`schedule`).
* **resilient-model-fallback** - Fallback procedures for offline MCP servers and model router failures.

### 2. QA & Delivery Refinement
* **criteria-driven-refinement** - RED-GREEN-REFACTOR execution cycle.
* **requesting-task-review** - Pre-delivery review & issue severity reporting.
* **receiving-task-review** - Logical verification of review feedback.
* **verification-before-delivery** - Empirical runtime and visual check execution.

### 3. Problem Solving
* **systematic-problem-solving** - 4-phase root-cause investigation.
* **dispatching-parallel-tasks** - Concurrent execution of non-interfering subtasks.

### 4. Operations & Automation
* **systematic-research** - Multi-source fact verification & confidence scoring.
* **document-drafting** - Audience-profiled professional communications.
* **document-synthesis** - Multi-document cross-referencing.
* **data-processing** - Programmatic tabular data calculations & validation.
* **transcript-processing** - Audio/video transcription & log analysis.
* **email-management-workflow** - Mailbox searching & executive email drafting.
* **outlook-mail-research** - MAPI querying for local Windows Outlook desktop.
* **web-navigation-workflow** - Playwright browser automation.

### 5. Skill Meta
* **using-aerodeck** - Framework entry point, skill rules engine & complexity gate.
* **writing-skills** - Guide for creating and testing custom skills.

---

## 8. License & Community

- **License**: MIT License - see [LICENSE](LICENSE) for details.
- **Issues & Contributions**: https://github.com/eeftychiou/AeroDeck/issues
