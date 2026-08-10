# AeroDeck Documentation Index

Welcome to the documentation index for the AeroDeck platform. This directory contains architectural specifications, implementation plans, testing guidelines, and platform integration guides.

---

## Core Guidelines & System Architecture

- **[Testing Guidelines](testing.md)** (`testing.md`): Guidelines for testing AeroDeck skills, integration test suites (`tests/claude-code/` and `tests/antigravity/`), subagent transcript verification, and token usage analysis.
- **[Windows Polyglot Hooks](windows/polyglot-hooks.md)** (`windows/polyglot-hooks.md`): Technical documentation on cross-platform polyglot `.cmd` wrappers for running bash hook scripts on Windows, macOS, and Linux without shell incompatibilities.

---

## Design Specifications (`docs/aerodeck/specs/`)

Below is the complete index of all 15 design specifications:

| Date | Specification Title | File Link | Description |
| :--- | :--- | :--- | :--- |
| **2026-01-22** | Document Review System Design | [2026-01-22-document-review-system-design.md](aerodeck/specs/2026-01-22-document-review-system-design.md) | Design specification for multi-stage spec and plan review workflows in task planning. |
| **2026-02-19** | Visual Brainstorming Refactor: Browser Displays, Terminal Commands | [2026-02-19-visual-brainstorming-refactor-design.md](aerodeck/specs/2026-02-19-visual-brainstorming-refactor-design.md) | Non-blocking visual brainstorming server architecture with web dashboard and terminal interface. |
| **2026-03-11** | Zero-Dependency Brainstorm Server | [2026-03-11-zero-dep-brainstorm-server-design.md](aerodeck/specs/2026-03-11-zero-dep-brainstorm-server-design.md) | Native Node.js HTTP/WebSocket server implementation replacing heavy external `node_modules`. |
| **2026-03-23** | Codex App Compatibility: Worktree and Finishing Skill Adaptation | [2026-03-23-codex-app-compatibility-design.md](aerodeck/specs/2026-03-23-codex-app-compatibility-design.md) | Design for executing worktree isolation and branch cleanup within sandboxed Codex environments. |
| **2026-04-06** | Worktree Rototill: Detect-and-Defer | [2026-04-06-worktree-rototill-design.md](aerodeck/specs/2026-04-06-worktree-rototill-design.md) | Detect-and-defer architecture for leveraging native platform workspace isolation vs. fallback git worktrees. |
| **2026-06-01** | AeroDeck Rebranding Design Specification | [2026-06-01-aerodeck-rebranding-design.md](aerodeck/specs/2026-06-01-aerodeck-rebranding-design.md) | Design specification for transitioning project namespaces, manifests, and skills to AeroDeck. |
| **2026-06-04** | Telegram Bridge for Antigravity & AeroDeck Design Specification | [2026-06-04-telegram-bridge-design.md](aerodeck/specs/2026-06-04-telegram-bridge-design.md) | Architecture for remote bot commands, whitelist security, and interactive execution approvals via Telegram. |
| **2026-06-12** | Design Specification: Document Drafting Skill | [2026-06-12-document-drafting-design-spec.md](aerodeck/specs/2026-06-12-document-drafting-design-spec.md) | Specification for audience profiling, structural outlining, and multi-source context drafting workflows. |
| **2026-06-12** | Design Specification: Google Drive MCP Server & Integrated Synthesis | [2026-06-12-google-drive-mcp-design-spec.md](aerodeck/specs/2026-06-12-google-drive-mcp-design-spec.md) | OAuth 2.0 Google Drive MCP server design for remote document search, file reading, and cloud asset synthesis. |
| **2026-06-12** | Design Specification: Systematic Research Skill | [2026-06-12-systematic-research-design-spec.md](aerodeck/specs/2026-06-12-systematic-research-design-spec.md) | Workflow design for multi-query search harvesting, source verification, and Model Router summarization. |
| **2026-06-13** | Design Specification: Tabular Data Processing Skill | [2026-06-13-data-processing-design-spec.md](aerodeck/specs/2026-06-13-data-processing-design-spec.md) | Script-first design for programmatic auditing, cleaning, transformation, and reporting on tabular datasets. |
| **2026-06-13** | Design Specification: Interactive Setup Wizard | [2026-06-13-setup-wizard-design-spec.md](aerodeck/specs/2026-06-13-setup-wizard-design-spec.md) | Specification for interactive CLI setup, environment validation, API key configuration, and MCP server registration. |
| **2026-06-14** | Design Specification: Transcript Processing Skill | [2026-06-14-transcript-processing-design-spec.md](aerodeck/specs/2026-06-14-transcript-processing-design-spec.md) | Specification for processing meeting audio/video transcripts, extracting action items, and summarizing key decisions. |
| **2026-08-07** | Outlook Mailbox Search & Research Integration Design | [2026-08-07-outlook-mail-research-design.md](aerodeck/specs/2026-08-07-outlook-mail-research-design.md) | PowerShell MAPI COM bridge design for searching local Outlook mailboxes, thread extraction, and mail research. |
| **2026-08-10** | AeroDeck Documentation Update & Codebase Synchronization Design Specification | [2026-08-10-documentation-update-design.md](aerodeck/specs/2026-08-10-documentation-update-design.md) | Design specification for version standardization (6.0.0), MCP documentation, and central index creation. |

---

## Execution Plans (`docs/aerodeck/plans/`)

Below is the complete index of all 17 execution plans:

| Date | Execution Plan Title | File Link | Description |
| :--- | :--- | :--- | :--- |
| **2026-01-22** | Document Review System Implementation Plan | [2026-01-22-document-review-system.md](aerodeck/plans/2026-01-22-document-review-system.md) | Step-by-step plan to integrate multi-stage review loops into brainstorming and planning skills. |
| **2026-02-19** | Visual Brainstorming Refactor Implementation Plan | [2026-02-19-visual-brainstorming-refactor.md](aerodeck/plans/2026-02-19-visual-brainstorming-refactor.md) | Refactoring visual brainstorming from blocking TUI models to non-blocking web browser dashboard. |
| **2026-03-11** | Zero-Dependency Brainstorm Server Implementation Plan | [2026-03-11-zero-dep-brainstorm-server.md](aerodeck/plans/2026-03-11-zero-dep-brainstorm-server.md) | Implementation of native Node.js HTTP/WS brainstorm server removing external node_modules dependencies. |
| **2026-03-23** | Codex App Compatibility Implementation Plan | [2026-03-23-codex-app-compatibility.md](aerodeck/plans/2026-03-23-codex-app-compatibility.md) | Plan for executing worktree isolation and branch finishing skills within sandboxed Codex App environments. |
| **2026-04-06** | Worktree Rototill Implementation Plan | [2026-04-06-worktree-rototill.md](aerodeck/plans/2026-04-06-worktree-rototill.md) | Implementation plan for native workspace isolation detection with manual git worktree fallback. |
| **2026-05-29** | Port to Antigravity 2.0 Implementation Plan | [2026-05-29-port-to-antigravity-2-0.md](aerodeck/plans/2026-05-29-port-to-antigravity-2-0.md) | Migration plan for porting AeroDeck skills and subagent workflows to Google Antigravity 2.0 platform. |
| **2026-06-01** | AeroDeck Rebranding Implementation Plan | [2026-06-01-aerodeck-rebranding-plan.md](aerodeck/plans/2026-06-01-aerodeck-rebranding-plan.md) | Plan for updating project manifests, skill definitions, and documentation to the AeroDeck identity. |
| **2026-06-04** | Telegram Bridge for Antigravity & AeroDeck Implementation Plan | [2026-06-04-telegram-bridge.md](aerodeck/plans/2026-06-04-telegram-bridge.md) | Implementation plan for Python Telegram daemon, secure user whitelisting, and remote approval buttons. |
| **2026-06-12** | Document Drafting Skill Implementation Plan | [2026-06-12-document-drafting-skill.md](aerodeck/plans/2026-06-12-document-drafting-skill.md) | Step-by-step implementation plan for audience profiling and source-driven document drafting skill. |
| **2026-06-12** | Google Drive MCP Server Implementation Plan (Stage 1) | [2026-06-12-google-drive-mcp.md](aerodeck/plans/2026-06-12-google-drive-mcp.md) | Implementation plan for TypeScript OAuth 2.0 Google Drive MCP server and API endpoints. |
| **2026-06-12** | Systematic Research Skill Implementation Plan | [2026-06-12-systematic-research-skill.md](aerodeck/plans/2026-06-12-systematic-research-skill.md) | Implementation plan for systematic research harvesting and Model Router delegation skill. |
| **2026-06-13** | Tabular Data Processing Skill Implementation Plan | [2026-06-13-data-processing-skill.md](aerodeck/plans/2026-06-13-data-processing-skill.md) | Implementation plan for script-driven tabular data analysis, cleaning, and reporting skill. |
| **2026-06-13** | Document Synthesis Skill Implementation Plan (Stage 2) | [2026-06-13-document-synthesis-skill.md](aerodeck/plans/2026-06-13-document-synthesis-skill.md) | Implementation plan combining web research, Google Drive files, and document drafting into synthesis skill. |
| **2026-06-13** | Interactive Setup Wizard Implementation Plan | [2026-06-13-setup-wizard.md](aerodeck/plans/2026-06-13-setup-wizard.md) | Step-by-step implementation plan for interactive cross-platform CLI onboarding wizard. |
| **2026-06-14** | Transcript Processing Skill Implementation Plan | [2026-06-14-transcript-processing-skill.md](aerodeck/plans/2026-06-14-transcript-processing-skill.md) | Implementation plan for meeting transcript cleaning, structured section extraction, and action items. |
| **2026-08-07** | Outlook Mailbox Search & Research Implementation Plan | [2026-08-07-outlook-mail-research.md](aerodeck/plans/2026-08-07-outlook-mail-research.md) | Implementation plan for local Outlook MAPI search script and email research workflow skill. |
| **2026-08-10** | AeroDeck Documentation Update & Codebase Synchronization Implementation Plan | [2026-08-10-documentation-update-plan.md](aerodeck/plans/2026-08-10-documentation-update-plan.md) | Execution plan for documentation updates, version sync (6.0.0), MCP guides, and repository index creation. |
