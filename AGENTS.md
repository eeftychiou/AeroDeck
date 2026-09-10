# AGENTS.md — Operational Instructions for AI Agents in AeroDeck

This file establishes guidelines and context for AI coding agents operating on the AeroDeck repository.

---

## 1. Primary References & Contributor Rules

* **Contributor Guidelines**: Read and strictly adhere to [CLAUDE.md](CLAUDE.md). AeroDeck has strict standards against speculative fixes, hallucinations, domain-specific bloat, and unauthorized third-party dependencies.
* **Architecture & Component Map**: Consult [architecture.md](architecture.md) for data flows, MCP server responsibilities, and system design.
* **Documentation & Guides**: Review [README.md](README.md) and [docs/README.md](docs/README.md) for full capability summaries, setup commands, and specifications.

---

## 2. Core Agentic Rules & Behavioral Guardrails

1. **Bootstrap & Skill Activation**:
   * Follow the bootstrap in [skills/using-aerodeck/SKILL.md](skills/using-aerodeck/SKILL.md).
   * Map standard agent operations using [skills/using-aerodeck/references/antigravity-tools.md](skills/using-aerodeck/references/antigravity-tools.md).
   * If a skill applies to a task, invoke and read the skill before taking action.

2. **Adaptive Execution Gate**:
   * **Lightweight / Single-Step Tasks**: Use Fast-Track execution via [criteria-driven-refinement](skills/criteria-driven-refinement/SKILL.md) (micro-spec + RED-GREEN-REFACTOR cycle).
   * **Complex / Multi-Component Tasks**: Follow the full review pipeline: [brainstorming](skills/brainstorming/SKILL.md) $\rightarrow$ [writing-plans](skills/writing-plans/SKILL.md) $\rightarrow$ [subagent-driven-task-pipeline](skills/subagent-driven-task-pipeline/SKILL.md).

3. **Mandatory Documentation Synchronization**:
   Whenever changes are made to files in the project, update `architecture.md`, `README.md`, and `agents.md` as appropriate to reflect changes in component relationships, data flow, and architecture principles.

4. **Test-Driven Verification**:
   After finalizing code changes, always add appropriate test cases and run the full test suite to guarantee correctness:
   ```bash
   npm test          # Runs node scripts/test-runner.js --unit
   ```

5. **Stdio Stream Protection**:
   All MCP server tools in `mcp-servers/` must strictly route diagnostic and debug output to `stderr` and log files via `setupStdioProtection()`. Never print unstructured text to `stdout`.