# AeroDeck for Antigravity 2.0, Antigravity IDE and Antigravity CLI

AeroDeck is a complete, ground-up general-purpose framework for agentic workflows. It is built on top of a set of composable skills and initial instructions that ensure your agent acts systematically and reliably across tasks.

AeroDeck natively supports the **Google Antigravity 2.0** platform, featuring a `plugin.json` manifest, a comprehensive tool mapping reference (`antigravity-tools.md`), workspace isolation via `invoke_subagent` with `Workspace: "branch"`, and a robust test suite.

## Quickstart

1. Give your agent AeroDeck: [Antigravity 2.0 (IDE/CLI)](#antigravity-20-idecli).
2. Run the interactive setup wizard to automatically configure API keys and register MCP servers:
   ```bash
   npm run setup
   ```

## How It Works

It starts from the moment you fire up your agent. As soon as it receives a goal or a task, it *doesn't* just jump into performing actions. Instead, it steps back and asks you what you're really trying to achieve.

Once it's teased a clear specification or goal out of the conversation, it shows it to you in digestible sections for validation.

After you've signed off on the design or target requirements, your agent puts together an implementation plan that's extremely clear and detailed. It decomposes the overall goal into bite-sized tasks with explicit success criteria and verifications. It emphasizes true Red/Green Criteria-Driven Refinement (CDR), YAGNI (You Aren't Gonna Need It), and simplicity.

Next up, once you say "go", it launches a *subagent-driven-task-pipeline* process, executing each task through specialized worker and reviewer subagents (with multi-stage reviews for content creation or operational execution) without stopping. It can work autonomously to achieve your goals while ensuring every intermediate step is fully verified.

Because AeroDeck skills trigger automatically based on context, your agent operates systematically out of the box.

## Installation

Installation differs by harness. If you use more than one, install AeroDeck separately for each one.

### Antigravity 2.0 (IDE/CLI)

This is the primary target for this fork. Choose your platform below.

#### macOS / Linux

* **Global plugin** (available in all projects):

  ```bash
  git clone https://github.com/eeftychiou/AeroDeck ~/.gemini/config/plugins/aerodeck
  ```

* **Workspace plugin** (project-level only):

  ```bash
  git clone https://github.com/eeftychiou/AeroDeck .agents/plugins/aerodeck
  ```

* **Update later:**

  ```bash
  cd ~/.gemini/config/plugins/aerodeck && git pull
  ```

#### Windows (PowerShell)

* **Global plugin** (available in all projects):

  ```powershell
  git clone https://github.com/eeftychiou/AeroDeck "$env:USERPROFILE\.gemini\config\plugins\aerodeck"
  ```

* **Workspace plugin** (project-level only):

  ```powershell
  git clone https://github.com/eeftychiou/AeroDeck .agents\plugins\aerodeck
  ```

* **Update later:**

  ```powershell
  cd "$env:USERPROFILE\.gemini\config\plugins\aerodeck"; git pull
  ```

#### Windows (WSL)

If you run Antigravity inside WSL, use the Linux paths.

If you run the **Windows Antigravity IDE** but your workspace is in **WSL**, the plugin scope determines the location:

* **Global plugin** (available in all projects, installed on Windows side):

  Clone the repository directly to your Windows user profile path:

  ```bash
  git clone https://github.com/eeftychiou/AeroDeck /mnt/c/Users/$USER/.gemini/config/plugins/aerodeck
  ```

* **Workspace plugin** (project-level only, installed inside your WSL workspace):

  Clone (or symlink) the repository into the project-level plugins folder inside your WSL workspace:

  ```bash
  git clone https://github.com/eeftychiou/AeroDeck /path/to/your/wsl/project/.agents/plugins/aerodeck
  ```

#### Activation Flow

AeroDeck supports dual activation options:

1. **Automatic Context Loading (`GEMINI.md`):**
   When opened in an AeroDeck-enabled workspace, `GEMINI.md` automatically injects system rules, tool mappings, and skill references into the agent's startup context. No manual intervention is needed—the agent automatically recognizes and triggers AeroDeck workflows based on user prompts.

2. **Slash Command Activation (`/using-aerodeck`):**
   You can manually initialize or reset the skills system at any time by typing **`/using-aerodeck`** in Antigravity 2.0 / Antigravity IDE, or **`/aerodeck:using-aerodeck`** in the Antigravity CLI. This prompts the agent to load the bootstrap guide, scan available skills, and initialize tool mappings for the session. *(Note: Restart Antigravity after initial installation to ensure plugins are scanned).*

#### Verify Installation

1. Start a new Antigravity session
2. Type `/using-aerodeck` (or `/aerodeck:using-aerodeck` if using the Antigravity CLI)
3. Say "Let's make a react todo list"
4. The `brainstorming` skill should trigger automatically

## The Basic Workflow

1. **brainstorming** - Activates before creating content or performing actions. Refines rough ideas through questions, explores alternatives, presents designs/requirements in sections for validation. Saves specification documents.
2. **using-isolated-workspaces** - Activates after requirements approval. Ensures isolated workspaces are set up, verifies clean starting baselines.
3. **writing-plans** - Activates with approved spec. Breaks work into bite-sized tasks (2-5 minutes each). Every task has exact targets (file paths, browser selectors, folders), complete content/steps, and verification steps.
4. **subagent-driven-task-pipeline** or **executing-plans** - Activates with plan. Dispatches fresh subagent per task with multi-stage review (spec compliance, then quality of content/action), or executes in batches with human checkpoints.
5. **criteria-driven-refinement** - Activates during implementation. Enforces RED-GREEN-REFACTOR: define success criteria, watch it fail, perform minimal content or action, watch it pass, save. Deletes unverified drafts/changes.
6. **requesting-task-review** - Activates between tasks. Reviews against plan, reports issues by severity. Critical issues block progress.
7. **completing-a-task-pipeline** - Activates when tasks complete. Verifies deliverables, presents options (merge/PR/keep/discard), cleans up workspace.

**The agent checks for relevant skills before any task.** Mandatory workflows, not suggestions.

## What's Inside

### Skills Library

AeroDeck includes 22 specialized skills organized into 5 logical categories:

#### 1. Core Workflow & Pipeline Engine
* **brainstorming** - Socratic requirement discovery, visual architectural diagrams, and structured design validation.
* **using-isolated-workspaces** - Workspace isolation and baseline state verification.
* **writing-plans** - Task decomposition with explicit targets, content, and verification steps.
* **subagent-driven-task-pipeline** - Autonomous task execution with independent worker and reviewer subagents.
* **executing-plans** - Batch execution of implementation plans with human review checkpoints.
* **completing-a-task-pipeline** - Deliverable verification, branch integration/PR decisions, and workspace cleanup.

#### 2. Refinement QA & Delivery
* **criteria-driven-refinement** - RED-GREEN-REFACTOR execution cycle with mandatory failure verification before implementation.
* **requesting-task-review** - Structured pre-delivery verification and severity-based issue reporting.
* **receiving-task-review** - Technical rigor and logical verification of incoming review feedback.
* **verification-before-delivery** - Empirical runtime and visual check execution before completing tasks.

#### 3. Problem Solving & Debugging
* **systematic-problem-solving** - 4-phase root-cause investigation (root-cause tracing, defense-in-depth, condition waiting).
* **dispatching-parallel-tasks** - Concurrent execution of non-interfering subtasks across parallel subagents.

#### 4. Operations Research & Workflows
* **systematic-research** - Multi-source fact verification, confidence scoring, and source matrices.
* **document-drafting** - Audience-profiled professional communications and BLUF executive layouts.
* **document-synthesis** - Multi-document cross-referencing across cloud storage and web sources.
* **data-processing** - Programmatic tabular data calculations, validation, and sanitization.
* **transcript-processing** - Log/meeting transcription, action item extraction, and structured summaries.
* **email-management-workflow** - Automated mailbox searching and BLUF email draft generation using model routing and browser/MAPI tools.
* **outlook-mail-research** - PowerShell MAPI querying for local Outlook desktop instances.
* **web-navigation-workflow** - Playwright browser automation for web data extraction and interaction.

#### 5. Meta / Skill Development
* **using-aerodeck** - Entry point and skill discovery rule engine.
* **writing-skills** - Framework for creating, auditing, and testing custom AeroDeck skills.

### Generalized Real-World Use Cases

AeroDeck provides 6 production-proven, anonymized blueprints demonstrating end-to-end automation across high-stakes domains:

* **Use Case 1: High-Stakes Public Sector Application Audit & Statutory Scoring Alignment**
  *Capabilities:* Dual-path credential verification, statutory law scoring criteria mapping, script-verified character constraint checking, field guide generation.
  *Workflow:* Integrates `systematic-research`, `criteria-driven-refinement`, and `subagent-driven-task-pipeline` to verify applicant qualifications against legislative criteria without hallucination.

* **Use Case 2: Ministerial & Diplomatic Executive Briefing Generation**
  *Capabilities:* Bottom-Line-Up-Front (BLUF) summaries, policy position papers, multi-source document synthesis.
  *Workflow:* Combines `document-synthesis` and `document-drafting` to ingest complex policy reports, cross-reference strategic objectives, and draft executive summaries tailored for decision-makers.

* **Use Case 3: Local Mailbox Research & Executive Email Automation**
  *Capabilities:* MAPI PowerShell searching, BLUF email drafting with audience/tone profiling.
  *Workflow:* Utilizes `outlook-mail-research` to query local desktop Outlook stores via `scripts/outlook-search.ps1`, then leverages `email-management-workflow` and `model-router` to draft contextually aware, professionally styled responses.

* **Use Case 4: Cloud Storage & AI Studio Conversation Indexing**
  *Capabilities:* Google Drive OAuth2 search/read, conversation harvesting into markdown knowledge bases.
  *Workflow:* Uses `mcp-servers/google-drive` to search and fetch documents across corporate Drive accounts, parsing raw transcript data via `transcript-processing` to compile indexed knowledge repositories.

* **Use Case 5: Subagent-Driven Multi-Stage Quality Review Pipelines**
  *Capabilities:* Isolated worker/reviewer subagent delegation for content accuracy, statutory compliance, and final approval.
  *Workflow:* Employs `subagent-driven-task-pipeline` where worker subagents execute independent tasks while reviewer subagents conduct rigorous two-stage reviews (specification compliance followed by quality/accuracy verification).

* **Use Case 6: Remote Command Control via Telegram Bridge**
  *Capabilities:* Telegram bot daemon, remote terminal command approval buttons, mobile document upload.
  *Workflow:* Deploys `telegram-bridge` daemon to monitor agent operations remotely. Inline keyboard buttons allow human operators to approve or deny sensitive shell commands from a mobile device while ingesting uploaded files securely into workspace subdirectories.

### MCP Servers

AeroDeck natively includes robust MCP servers to extend your agent's capabilities out of the box:

* **Model Router** - Dynamically manages and routes requests to external AI models by safely injecting your API keys from a secure `.env` file without polluting the standard input/output channels. See `mcp-servers/model-router/README.md` for details.
* **Browser Automation** - Provides comprehensive Playwright-based browser automation, allowing your agent to navigate websites, click elements, fill forms, and interact with web pages either headlessly or visibly. See `mcp-servers/browser-automation/README.md` for details.
* **Google Drive** - Provides robust cloud integration to search filenames and contents, read Google Docs as plain text, and download binary files locally. See the [Google Drive Setup Guide](mcp-servers/google-drive/README.md) for configuration instructions.

### Telegram Bridge

AeroDeck includes a secure, Python-based Telegram bot bridge daemon that allows you to interface with the local Antigravity/AeroDeck SDK remotely.

* **Strict Whitelisting:** Restricts bot access to whitelisted Telegram user IDs to prevent unauthorized remote access.
* **Interactive Approvals:** Interactive inline keyboard buttons allow you to approve or reject terminal command execution requests from your phone.
* **Secure File Ingestion:** Safely uploads and ingests documents directly into your agent's workspace with directory traversal sanitization.
* **Session Management:** Standard `/start`, `/reset`, and `/aerodeck` commands to manage local execution environments.

See the [Telegram Bridge Setup Guide](telegram-bridge/docs/setup.md) to configure and run the bridge daemon.

## Philosophy

* **Criteria-Driven Refinement** - Write tests first, always
* **Systematic over ad-hoc** - Process over guessing
* **Complexity reduction** - Simplicity as primary goal
* **Evidence over claims** - Verify before declaring success

## Contributing

The general contribution process for AeroDeck is below. Keep in mind that we don't generally accept contributions of new skills and that any updates to skills must work across all of the agents we support.

1. Fork the repository
2. Switch to the 'dev' branch
3. Create a branch for your work
4. Follow the `writing-skills` skill for creating and testing new and modified skills
5. Submit a PR, being sure to fill in the pull request template.

See `skills/writing-skills/SKILL.md` for the complete guide.

## Updating

AeroDeck updates are somewhat agent-dependent, but are often automatic.

## License

MIT License - see LICENSE file for details

## Community

* **Issues**: https://github.com/eeftychiou/AeroDeck/issues
