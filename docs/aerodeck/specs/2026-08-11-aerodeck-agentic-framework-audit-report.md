# AeroDeck Architectural Audit & General Agentic Framework Blueprint

**Date:** August 11, 2026  
**Target Harness:** Antigravity 2.0 / Antigravity IDE / Antigravity CLI  
**Objective:** Comprehensive analysis of the AeroDeck codebase, skills engine, MCP Model Router, installation infrastructure, and QA test suite to establish a robust, general-purpose agentic framework.

---

## Executive Summary

AeroDeck is built as a general-purpose, discipline-enforcing agentic framework for Antigravity. It translates strict software engineering discipline (Test-Driven Development, isolated worktrees, code reviews) into domain-agnostic operational capabilities (Criteria-Driven Refinement, isolated workspaces, multi-stage deliverable reviews, multi-modal verification).

To evaluate AeroDeck's current readiness and design an upgraded architecture (AeroDeck 7.0), three dedicated subagents were dispatched to conduct parallel audits across:
1. **MCP Model Router & LLM Infrastructure** (`mcp-servers/model-router`)
2. **Codebase Architecture, Skill Taxonomy & Workflows** (`skills/`, `scripts/`, `plugin.json`)
3. **Systems Reliability, Multi-Platform Behaviors & QA Infrastructure** (`tests/`, `scripts/`)

---

## 1. MCP Model Router Audit (`mcp-servers/model-router`)

### 1.1 Architecture Overview
The MCP Model Router server ([`mcp-servers/model-router/src/index.ts`](file:///c:/Users/User/Antigravity/Gemini%20Assistant/mcp-servers/model-router/src/index.ts)) bridges Antigravity subagents to multi-provider LLM APIs using the Vercel AI SDK (`ai`, `@ai-sdk/openai`, `@ai-sdk/anthropic`, `@ai-sdk/google`). It exposes `route_task` and `clear_session` tools to dynamically route requests based on abstract performance tiers (`fast`, `smart`, `reasoning`) or direct provider overrides.

### 1.2 Identified Limitations & Gaps

| Area | Current Behavior / Issue | Impact on Antigravity & Subagents | Recommended Fix |
| :--- | :--- | :--- | :--- |
| **Resilience & Failover** | No fallback cascade when target provider returns HTTP 429, 500, or network timeout ([`index.ts:L142-L146`](file:///c:/Users/User/Antigravity/Gemini%20Assistant/mcp-servers/model-router/src/index.ts#L142-L146)). | Subagent pipelines halt or fail silently when a single LLM API endpoint experiences downtime. | Implement multi-provider fallback cascades per tier (Primary $\rightarrow$ Fallback 1 $\rightarrow$ Fallback 2) with exponential backoff. |
| **Context & Formatting** | History is flattened into a plain text block ([`index.ts:L130-L136`](file:///c:/Users/User/Antigravity/Gemini%20Assistant/mcp-servers/model-router/src/index.ts#L130-L136)). Trimming uses fixed message count (20) rather than token bounds ([`session.ts:L57-L62`](file:///c:/Users/User/Antigravity/Gemini%20Assistant/mcp-servers/model-router/src/session.ts#L57-L62)). | Wastes tokens and risks context length crashes on smaller local models (e.g. 4k/8k Ollama instances). | Pass native structured `messages` arrays to Vercel AI SDK; enforce dynamic token estimation trimming (`tiktoken`/heuristics). |
| **Streaming & Responsiveness** | `routeTask` uses `generateText` blocking until total completion. | Subagents block on long-reasoning completions (DeepSeek R1 / o1 / high reasoning effort) without progress updates. | Introduce streaming support via `streamText` or progress callbacks (`progressToken`). |
| **Hyperparameters & Parameters** | `reasoningEffort` only maps to OpenAI options. Missing Anthropic thinking budget tokens, DeepSeek thinking flags, temperature, max_tokens, top_p, JSON schema. | Inability to configure extended thinking on Claude 3.7 / DeepSeek R1, or produce structured JSON tool outputs. | Expand `route_task` tool schema to accept full generation hyperparameters and provider options. |
| **Concurrency & Storage** | [`session.ts`](file:///c:/Users/User/Antigravity/Gemini%20Assistant/mcp-servers/model-router/src/session.ts#L7) uses synchronous `fs.writeFileSync` on a single `sessions.json` file. | Parallel subagents executing `route_task` concurrently risk file write race conditions and JSON corruption. | Replace synchronous file writes with atomic file writing (`write-file-atomic`) or an embedded key-value/SQLite store. |
| **Runtime Catalog Sync** | `config.json` loaded statically at startup; setup wizard catalog sync is manual. | Provider model updates require manual re-runs of `npm run setup:models` and server restarts. | Add automatic background catalog updates or a `refresh_catalog` MCP tool. |

---

## 2. Codebase & Skill Architecture Audit (`skills/`)

### 2.1 Strengths
- **Anti-Rationalization Discipline**: Rigid "Iron Laws" in [`skills/using-aerodeck/SKILL.md`](file:///c:/Users/User/Antigravity/Gemini%20Assistant/skills/using-aerodeck/SKILL.md) and [`skills/brainstorming/SKILL.md`](file:///c:/Users/User/Antigravity/Gemini%20Assistant/skills/brainstorming/SKILL.md) effectively eliminate common LLM shortcuts (guessing DOM selectors, skipping verification, declaring victory prematurely).
- **Antigravity 2.0 Primitive Alignment**: Excellent integration with subagent dispatches (`invoke_subagent` with `Workspace: "branch"`) and multi-modal verification (Command, Visual, Folder State).

### 2.2 Identified Gaps & Architectural Bottlenecks

1. **High Ceremony Friction for Small Tasks**:
   - The linear chain `brainstorming` (9 steps) $\rightarrow$ `writing-plans` $\rightarrow$ `subagent-driven-task-pipeline` (4 subagents per step) $\rightarrow$ `completing-a-task-pipeline` causes severe token overhead and latency for simple, single-step tasks (e.g., formatting a table or summarizing a brief document).
   - **Fix**: Introduce an **Adaptive Fast-Track Complexity Gate** in `using-aerodeck` and `brainstorming` to route minor tasks directly to `criteria-driven-refinement` without multi-agent overhead.

2. **Overlap in Review & Verification Skills**:
   - `requesting-task-review`, `receiving-task-review`, `verification-before-delivery`, and `subagent-driven-task-pipeline` share overlapping review goals.
   - **Fix**: Reorganize skills into a clear 3-Tier Taxonomy: Core Engine Skills, Domain Capability Skills, and Tool/Adapter Workflows.

3. **Missing Antigravity 2.0 Primitives & Skills**:
   - **Background Task Scheduling**: Antigravity 2.0 provides native `schedule` tools (one-shot timers with `TimerCondition` and recurring cron jobs with `IsDaemon`). AeroDeck lacks a skill guiding agents on monitoring background jobs or reactive timer notifications.
   - **Resilient Model Fallback**: Operational skills (`document-drafting`, `transcript-processing`, `systematic-research`) assume `model-router` is always operational. Lacks fallback rules for when MCP servers are offline.
   - **Long-Term Memory Checkpointing**: No skill for state persistence across independent session turns.

4. **Installation & Script Infrastructure Bugs**:
   - **`uninstall.ps1` Bug**: [`uninstall.ps1`](file:///c:/Users/User/Antigravity/Gemini%20Assistant/uninstall.ps1#L19-L20) deregisters `browser-automation` and `model-router`, but **completely omits `google-drive`**, leaving dangling entries in `mcp_config.json`.
   - **Volatile Path Registration in `install.ps1`**: [`install.ps1`](file:///c:/Users/User/Antigravity/Gemini%20Assistant/install.ps1#L24-L28) copies `plugin.json` and `skills/` to `$env:USERPROFILE\.gemini\config\plugins\aerodeck`, but registers `$cwd/mcp-servers/...` in `mcp_config.json`. If the user deletes or moves the source repository clone, all MCP servers break.
   - **Under-specified `plugin.json`**: Lacks declarations for required MCP tools, default context files, or entry points.

5. **Legacy Superpowers Artifact Leaks**:
   - References to legacy software engineering roles (`code-reviewer`, `implementer`) remain in [`skills/using-aerodeck/references/gemini-tools.md`](file:///c:/Users/User/Antigravity/Gemini%20Assistant/skills/using-aerodeck/references/gemini-tools.md#L28-L30).
   - Description in [`gemini-extension.json`](file:///c:/Users/User/Antigravity/Gemini%20Assistant/gemini-extension.json#L3) references `"TDD, debugging"` instead of operational automation.

---

## 3. Systems Reliability & QA Audit (`tests/`, `scripts/`)

### 3.1 Existing Test Assets
- **WebSocket RFC 6455 framing & masking unit tests**: [`tests/brainstorm-server/ws-protocol.test.js`](file:///c:/Users/User/Antigravity/Gemini%20Assistant/tests/brainstorm-server/ws-protocol.test.js).
- **Google Drive Mock & Model Router Unit Tests**: Tested via `@modelcontextprotocol/sdk` in-memory transports.
- **Telegram Bridge Security Audit**: [`tests/test_telegram_bridge.py`](file:///c:/Users/User/Antigravity/Gemini%20Assistant/tests/test_telegram_bridge.py) validates path traversal protection and authorization guards.
- **Tool Mapping Contract Validator**: [`tests/antigravity/test-tool-mapping-accuracy.sh`](file:///c:/Users/User/Antigravity/Gemini%20Assistant/tests/antigravity/test-tool-mapping-accuracy.sh) verifies translation of tools to native Antigravity primitives.

### 3.2 Key Testing Gaps

1. **Omission of Core Tests from Master Runner**:
   - [`scripts/test-runner.js`](file:///c:/Users/User/Antigravity/Gemini%20Assistant/scripts/test-runner.js) excludes `tests/brainstorm-server/server.test.js`, `ws-protocol.test.js`, and `test-tool-mapping-accuracy.sh`. Standard `npm test` runs omit core server and protocol tests.
2. **Hardcoded `python` Executable**:
   - [`scripts/test-runner.js`](file:///c:/Users/User/Antigravity/Gemini%20Assistant/scripts/test-runner.js#L14) calls `python` directly, breaking on Linux/WSL environments where only `python3` is available.
3. **Windows PID Namespace Isolation**:
   - MSYS2 virtual PIDs on Windows Git Bash cause process polling failures if Node process supervision is run outside `start-server.sh`.
4. **Lack of PowerShell Native Parity**:
   - POSIX shell scripts (`.sh`) in `tests/antigravity/` cannot run natively under Windows PowerShell without WSL or Git Bash.
5. **No Automated Token Budget Enforcement**:
   - Token tracking via `analyze-token-usage.py` lacks automated pass/fail threshold caps.

---

## 4. Proposed 4-Phase Transformation Roadmap (AeroDeck 7.0)

```mermaid
flowchart TD
    subgraph Phase 1 [Phase 1: Infrastructure & Script Fixes]
        P1_1[Fix uninstall.ps1 google-drive omission]
        P1_2[Fix install.ps1 MCP path resolution]
        P1_3[Enrich plugin.json manifest]
        P1_4[Purge legacy superpowers references]
    end

    subgraph Phase 2 [Phase 2: Skill Taxonomy & Adaptive Execution]
        P2_1[Establish 3-Tier Skill Taxonomy]
        P2_2[Add Adaptive Fast-Track Complexity Gate]
        P2_3[Consolidate Review & QA skills]
    end

    subgraph Phase 3 [Phase 3: Antigravity 2.0 Advanced Workflows]
        P3_1[background-task-scheduling skill for schedule tool]
        P3_2[resilient-model-fallback skill]
        P3_3[context-checkpointing skill]
    end

    subgraph Phase 4 [Phase 4: Model Router & QA Pyramid Overhaul]
        P4_1[Model Router Provider Failover Cascade]
        P4_2[Atomic Session Store & Token-Aware Trimming]
        P4_3[Expand test-runner.js to 5-Tier QA Pyramid]
        P4_4[PowerShell / Cross-Platform Script Parity]
    end

    Phase 1 --> Phase 2 --> Phase 3 --> Phase 4
```

---

## 5. Decision Points for Framework Implementation

To proceed with implementing these enhancements, the following strategic options are presented:

1. **Option A: Comprehensive Framework Overhaul (Full AeroDeck 7.0)**
   - Complete execution of Phases 1 through 4.
   - Delivers adaptive task fast-tracking, resilient model router with failover/streaming, native `schedule` skills, fixed installation infrastructure, and full 5-tier QA test suite.

2. **Option B: Core Engine & Model Router Resiliency Focus**
   - Execute Phase 1 (Script Fixes), Phase 2 (Adaptive Fast-Track), and Phase 4 (Model Router Failover & Session Atomicity).
   - Solves core subagent latency, model routing failures, and installation bugs.

3. **Option C: Targeted Bug Fixes & Test Suite Parity**
   - Execute Phase 1 (Fix `install.ps1`, `uninstall.ps1`, legacy references) and Phase 4.3 (Expand `test-runner.js` and python binary resolution).
   - Minimal architectural change, focusing strictly on bug resolution and test runner completeness.
