# AeroDeck Documentation Update & Codebase Synchronization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use aerodeck:subagent-driven-task-pipeline (recommended) or aerodeck:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Synchronize version manifests, fix documentation inconsistencies, create missing MCP/script guides, and update `README.md` with all 22 skills and 6 anonymized, reusable real-world use cases.

**Architecture/Workflow:** Operational Configuration B (Codebase Maintenance & Documentation Integration). Standardizes versions to `6.0.0`, removes dead package paths, updates tool maps, and expands technical documentation.

**Tech Stack/Tools:** Markdown, JSON, Bash (`scripts/bump-version.sh`), PowerShell, Antigravity 2.0 / Gemini Assistant.

---

### Task 1: Create Missing MCP Server Guides & Setup Scripts Readme

**Targets:**
- Create: `mcp-servers/browser-automation/README.md`
- Create: `mcp-servers/model-router/README.md`
- Create: `scripts/README.md`

- [ ] **Step 1: Write/Define success criteria**
Create `docs/aerodeck/criteria/task-1-criteria.json`:
```json
{
  "criteria": "Files mcp-servers/browser-automation/README.md, mcp-servers/model-router/README.md, and scripts/README.md exist and document tool schemas, configuration steps, and execution parameters."
}
```

- [ ] **Step 2: Verify current state fails**
Run file checks for `mcp-servers/browser-automation/README.md`, `mcp-servers/model-router/README.md`, `scripts/README.md`.
Expected: FAIL (files do not exist).

- [ ] **Step 3: Perform minimal implementation**
1. Create `mcp-servers/browser-automation/README.md` detailing Playwright setup, TypeScript build, and tools (`navigate`, `get_content`, `click_element`, `fill_element`).
2. Create `mcp-servers/model-router/README.md` detailing `.env` API keys, model routing rules, and `route_task` schema.
3. Create `scripts/README.md` detailing setup wizard (`scripts/setup/`), MAPI Outlook search (`scripts/outlook-search.ps1`), and version bump utility (`scripts/bump-version.sh`).

- [ ] **Step 4: Verify state passes criteria**
Verify that all 3 files exist and contain non-empty documentation.
Expected: PASS.

- [ ] **Step 5: Save/Checkpoint**
Confirm all 3 files are committed/saved in `mcp-servers/` and `scripts/`.

---

### Task 2: Synchronize Version Manifests & Update Tool Mapping

**Targets:**
- Modify: `plugin.json`
- Modify: `package.json`
- Modify: `gemini-extension.json`
- Modify: `.version-bump.json`
- Modify: `skills/using-aerodeck/references/antigravity-tools.md`

- [ ] **Step 1: Write/Define success criteria**
Create `docs/aerodeck/criteria/task-2-criteria.json`:
```json
{
  "criteria": "Manifest versions in plugin.json, package.json, gemini-extension.json, and scripts/setup/package.json match 6.0.0; .version-bump.json targets are updated; invalid main field removed from package.json; antigravity-tools.md includes custom MCP tools."
}
```

- [ ] **Step 2: Verify current state fails**
Inspect manifest versions (`package.json` is `5.1.0`, `gemini-extension.json` is `5.1.0`, `plugin.json` is `6.0.0`).
Expected: FAIL (version mismatch and missing tool mappings).

- [ ] **Step 3: Perform minimal implementation**
1. Update `package.json` version to `6.0.0`, remove invalid `"main": ".opencode/plugins/aerodeck.js"`.
2. Update `gemini-extension.json` version to `6.0.0`.
3. Update `.version-bump.json` `versionTargets` to point to `./package.json`, `./plugin.json`, `./gemini-extension.json`, and `./scripts/setup/package.json`.
4. Update `skills/using-aerodeck/references/antigravity-tools.md` to map `browser-automation` (`navigate`, `get_content`, `click_element`, `fill_element`), `model-router` (`route_task`), `google-drive` (`search_files`, `read_doc`, `download_file`), and `outlook-search.ps1`.

- [ ] **Step 4: Verify state passes criteria**
Run `bash scripts/bump-version.sh --check` (or python check) to verify version alignment across manifest targets.
Expected: PASS (0 version discrepancies).

- [ ] **Step 5: Save/Checkpoint**
Confirm root manifests and tool mapping document are saved.

---

### Task 3: Update Telegram Bridge Setup Guide & Fix Testing Guide Typo

**Targets:**
- Modify: `telegram-bridge/docs/setup.md`
- Modify: `docs/testing.md`

- [ ] **Step 1: Write/Define success criteria**
Create `docs/aerodeck/criteria/task-3-criteria.json`:
```json
{
  "criteria": "telegram-bridge/docs/setup.md documents whitelist security, interactive button approvals, and remote commands (/reset, /aerodeck); docs/testing.md renames subagent-driven-development to subagent-driven-task-pipeline."
}
```

- [ ] **Step 2: Verify current state fails**
Check `telegram-bridge/docs/setup.md` for interactive button approval documentation and check `docs/testing.md` line for `subagent-driven-development`.
Expected: FAIL (setup.md incomplete, testing.md has outdated skill name).

- [ ] **Step 3: Perform minimal implementation**
1. Expand `telegram-bridge/docs/setup.md` to document `ALLOWED_USER_IDS` security, `InlineKeyboardButton` command execution approvals, remote bot commands (`/start`, `/reset`, `/aerodeck`), and workspace file upload paths (`./telegram-workspace/`).
2. Modify `docs/testing.md` to replace references to `subagent-driven-development` with `subagent-driven-task-pipeline`.

- [ ] **Step 4: Verify state passes criteria**
Inspect both updated files.
Expected: PASS.

- [ ] **Step 5: Save/Checkpoint**
Confirm files are saved.

---

### Task 4: Comprehensive Update of `README.md` with Generalized Use Cases

**Targets:**
- Modify: `README.md`

- [ ] **Step 1: Write/Define success criteria**
Create `docs/aerodeck/criteria/task-4-criteria.json`:
```json
{
  "criteria": "README.md lists all 22 skills under 5 categories, documents 6 anonymized real-world use cases, contains relative markdown links instead of file:///c:/Users/ absolute paths, and explains both GEMINI.md auto-load and slash command activation."
}
```

- [ ] **Step 2: Verify current state fails**
Check `README.md` for missing skills (`email-management-workflow`, `outlook-mail-research`, `web-navigation-workflow`), missing use-cases section, and hardcoded `file:///c:/Users/` links.
Expected: FAIL.

- [ ] **Step 3: Perform minimal implementation**
1. Reorganize `### Skills Library` in `README.md` into 5 categories, incorporating all 22 skills.
2. Add a comprehensive **Generalized Real-World Use Cases** section documenting 6 anonymized blueprints:
   - Use Case 1: High-Stakes Public Sector Application Audit & Statutory Scoring Alignment
   - Use Case 2: Ministerial & Diplomatic Executive Briefing Generation
   - Use Case 3: Local Mailbox Research & Executive Email Automation
   - Use Case 4: Cloud Storage & AI Studio Conversation Indexing
   - Use Case 5: Subagent-Driven Multi-Stage Quality Review Pipelines
   - Use Case 6: Remote Command Control via Telegram Bridge
3. Replace hardcoded Windows absolute paths (`file:///c:/Users/...`) with relative repository paths.
4. Clarify dual activation options (automatic context loading via `GEMINI.md` vs. `/using-aerodeck` slash command).

- [ ] **Step 4: Verify state passes criteria**
Search `README.md` for `file:///c:/` string (Expected: 0 matches). Verify presence of all 22 skills and 6 anonymized use cases.
Expected: PASS.

- [ ] **Step 5: Save/Checkpoint**
Confirm `README.md` is saved.

---

### Task 5: Create `docs/README.md` Specifications & Plans Index

**Targets:**
- Create: `docs/README.md`

- [ ] **Step 1: Write/Define success criteria**
Create `docs/aerodeck/criteria/task-5-criteria.json`:
```json
{
  "criteria": "docs/README.md exists and indexes all 15 design specs and 17 execution plans in docs/aerodeck/ with file descriptions and dates."
}
```

- [ ] **Step 2: Verify current state fails**
Check if `docs/README.md` exists.
Expected: FAIL (file missing).

- [ ] **Step 3: Perform minimal implementation**
Create `docs/README.md` listing and describing all design specs in `docs/aerodeck/specs/` and execution plans in `docs/aerodeck/plans/`.

- [ ] **Step 4: Verify state passes criteria**
Verify `docs/README.md` exists and contains links to all spec and plan files.
Expected: PASS.

- [ ] **Step 5: Save/Checkpoint**
Confirm `docs/README.md` is saved.
