# AeroDeck Documentation Update & Codebase Synchronization Design Specification

**Date:** 2026-08-10  
**Status:** Approved by User  
**Target System:** AeroDeck / Antigravity 2.0 / Gemini Assistant Plugin  

---

## 1. Executive Summary

This design specification details a comprehensive update to the AeroDeck documentation suite, manifest synchronization, and codebase consistency audit. It addresses 3 unlisted skills in `README.md`, 2 missing MCP server guides, missing script documentation, incomplete tool mapping references, manifest version desynchronization, hardcoded absolute machine paths, and documents 6 anonymized, reusable real-world use cases derived from empirical transcript analysis.

---

## 2. Requirements & Constraints

1. **Strict Anonymization & Generalization (User Directive):** All documented use cases must be generic, abstracting away personal identities, applicant names, specific employer/agency titles, and exact vacancy numbers.
2. **Completeness:** Every skill in `skills/` (22 total), every MCP server in `mcp-servers/` (3 total), every administrative script in `scripts/` (3 total), and the Telegram bridge daemon must be documented.
3. **Manifest Synchronization:** Version numbers across `plugin.json`, `package.json`, `gemini-extension.json`, and `.version-bump.json` must be standardized to `6.0.0`.
4. **Link Hygiene:** Replace all machine-specific hardcoded Windows paths (`file:///c:/Users/User/...`) with relative repository paths.
5. **Backwards Compatibility & Zero Regression:** Preserve existing skill behavior and API signatures while cleaning up broken package settings (`package.json` `"main"` field).

---

## 3. Architecture & Target File Changes

### A. Core Documentation & Readmes

#### 1. `README.md` (Main User Guide)
- **Skills Library Expansion:** Reorganize all 22 skills into 5 logical categories:
  - *Core Workflow & Pipeline Engine:* `using-aerodeck`, `brainstorming`, `writing-plans`, `executing-plans`, `subagent-driven-task-pipeline`, `dispatching-parallel-tasks`, `using-isolated-workspaces`.
  - *Refinement, QA & Delivery:* `criteria-driven-refinement`, `verification-before-delivery`, `requesting-task-review`, `receiving-task-review`, `completing-a-task-pipeline`.
  - *Problem Solving & Debugging:* `systematic-problem-solving`.
  - *Operations, Research & Workflows (Newly Added/Expanded):* `email-management-workflow`, `outlook-mail-research`, `web-navigation-workflow`, `systematic-research`, `document-drafting`, `document-synthesis`, `data-processing`, `transcript-processing`.
  - *Meta / Skill Development:* `writing-skills`.
- **Generalized Real-World Use Cases Section (New):**
  - *Use Case 1: High-Stakes Public Sector Application Audit & Statutory Scoring Alignment* (Dual-path credential verification, statutory law scoring criteria mapping, script-verified character constraint checking, field guide generation).
  - *Use Case 2: Ministerial & Diplomatic Executive Briefing Generation* (BLUF summaries, policy position papers, multi-source document synthesis).
  - *Use Case 3: Local Mailbox Research & Executive Email Automation* (MAPI PowerShell searching, BLUF email drafting with audience/tone profiling).
  - *Use Case 4: Cloud Storage & AI Studio Conversation Indexing* (Google Drive OAuth2 search/read, conversation harvesting into markdown knowledge bases).
  - *Use Case 5: Subagent-Driven Multi-Stage Quality Review Pipelines* (Isolated worker/reviewer subagent delegation for content accuracy, statutory compliance, and final approval).
  - *Use Case 6: Remote Command Control via Telegram Bridge* (Telegram bot daemon, remote terminal command approval buttons, mobile document upload).
- **Link Normalization:** Change `file:///c:/Users/...` links to relative repository paths (`mcp-servers/google-drive/README.md`, `telegram-bridge/docs/setup.md`).
- **Activation Flow Clarification:** Explain both startup auto-loading via `GEMINI.md` and manual activation via slash commands.

#### 2. `mcp-servers/browser-automation/README.md` [NEW]
- Document Playwright Node.js/TypeScript setup.
- Document available MCP tools: `navigate`, `get_content`, `click_element`, `fill_element`.
- Include build and configuration instructions.

#### 3. `mcp-servers/model-router/README.md` [NEW]
- Document LLM API key routing (Kimi/Moonshot, Minimax).
- Document `route_task` tool schema, payload format, and `.env` setup.

#### 4. `scripts/README.md` [NEW]
- Document interactive setup wizard (`scripts/setup/` via `npm run setup`).
- Document Windows Outlook MAPI search script (`scripts/outlook-search.ps1`) parameters (`-Query`, `-StartDate`, `-EndDate`, `-SaveAttachments`, `-IncludeFullBody`).
- Document version bump utility (`scripts/bump-version.sh`) flags (`--check`, `--audit`).

#### 5. `telegram-bridge/docs/setup.md` [UPDATE]
- Document `ALLOWED_USER_IDS` whitelist security.
- Document interactive terminal command execution approval buttons (`InlineKeyboardButton`).
- Document `/start`, `/reset`, `/aerodeck` remote management commands.
- Document file ingestion and workspace upload path rules (`./telegram-workspace/`).

---

### B. Mappings & Configuration Sync

#### 1. `skills/using-aerodeck/references/antigravity-tools.md` [UPDATE]
- Add custom MCP tools mapping section (`browser-automation`, `model-router`, `google-drive`).
- Add administrative script tools mapping section (`outlook-search.ps1`, `setup`).

#### 2. Root Manifests Synchronization
- **`plugin.json`:** Confirm `"version": "6.0.0"`.
- **`package.json`:** Update `"version": "6.0.0"`, remove invalid `"main": ".opencode/plugins/aerodeck.js"`.
- **`gemini-extension.json`:** Update `"version": "6.0.0"`.
- **`.version-bump.json`:** Update `versionTargets` array to reference `./package.json`, `./plugin.json`, `./gemini-extension.json`, and `./scripts/setup/package.json`. Remove non-existent legacy targets (`.claude-plugin/...`).

---

### C. Inconsistency Fixes in Existing Docs & Indexing

#### 1. `docs/testing.md` [UPDATE]
- Replace references to `subagent-driven-development` with `subagent-driven-task-pipeline`.

#### 2. `docs/README.md` [NEW]
- Index of all 14 design specifications and 16 implementation plans in `docs/aerodeck/`.

---

## 4. Verification & Testing Plan

1. **Manifest Integrity Audit:** Run `bash scripts/bump-version.sh --check` to verify version alignment across all target files.
2. **Link Validation:** Search repository for any remaining `file:///c:/Users/` absolute paths using script or pattern search.
3. **Markdown Quality & Formatting:** Verify all newly created and updated `.md` files have valid formatting, complete headers, and clickable relative links.
