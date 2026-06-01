---
name: requesting-task-review
description: Use when completing tasks, implementing major workflows, or before final delivery to verify work meets all requirements
---

# Requesting Task Review

Dispatch a task reviewer subagent to catch issues before they cascade. The reviewer gets precisely crafted context for evaluation — never your session's history. This keeps the reviewer focused on the work product, not your thought process.

**Core principle:** Review early, review often.

## When to Request Review

**Mandatory:**
- After each task in subagent-driven task pipelines
- After completing major deliverables
- Before final delivery/merge

## How to Request

1. **Specify the base and head changes** (or files created).
2. **Dispatch task reviewer subagent:**
   Use the `invoke_subagent` tool with the `task-reviewer.md` template.
3. **Act on feedback:**
   - Fix Critical issues immediately.
   - Fix Important issues before proceeding.
   - Note Minor issues for later.
