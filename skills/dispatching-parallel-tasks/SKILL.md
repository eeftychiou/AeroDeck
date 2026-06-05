---
name: dispatching-parallel-tasks
description: Use when facing 2+ independent tasks or steps that can be executed concurrently without shared state or sequential dependencies
---

# Dispatching Parallel Tasks

## Overview

Delegate independent task items to specialized subagents with isolated contexts. In **Antigravity 2.0**, you can dispatch multiple subagents concurrently by specifying multiple entries in the `Subagents` array of a single `invoke_subagent` call.

When you have multiple unrelated, parallelizable tasks (e.g. filling out 3 different job applications on different websites, or processing 4 independent folders of e-documents), executing them sequentially wastes time. Each task is self-contained and can run in parallel.

**Core principle:** Dispatch one subagent per independent task domain. Let them work concurrently.

## When to Use

**Use when:**
- You have 2 or more completely independent tasks or sub-tasks.
- Each task operates on separate directories, different browser websites, or separate files.
- No task depends on the output of another task to proceed.
- Tasks are decoupled and can be run concurrently without interfering with shared states.

**Don't use when:**
- Tasks are sequential (Task B needs the output or file created in Task A).
- Tasks edit or interact with the same exact file/element simultaneously (risk of git merge conflicts or form collision).

## The Pattern

### 1. Identify Independent Domains

Group the tasks by target:
- Task A: Draft job application letter for Company X (CWD or target `/workspace/company-x/`).
- Task B: Draft job application letter for Company Y (CWD or target `/workspace/company-y/`).
- Task C: Draft job application letter for Company Z (CWD or target `/workspace/company-z/`).

These are independent. Working on Company X does not impact Company Y.

### 2. Create Focused Subagent Tasks

Specify for each:
- **TypeName:** `"self"` or `"worker"` (if defined)
- **Role:** Specific to the task (e.g., `"Company X Writer"`)
- **Workspace:** `"branch"` (to create an isolated workspace automatically!)
- **Prompt:** Precise instructions, context, success criteria, and targets.

### 3. Parallel Dispatch via invoke_subagent

Call `invoke_subagent` once with multiple entries in the `Subagents` array. This triggers parallel execution natively:

```json
{
  "Subagents": [
    {
      "TypeName": "self",
      "Role": "Company X Application Worker",
      "Workspace": "branch",
      "Prompt": "Complete the cover letter for Company X at workspace/company-x/"
    },
    {
      "TypeName": "self",
      "Role": "Company Y Application Worker",
      "Workspace": "branch",
      "Prompt": "Complete the cover letter for Company Y at workspace/company-y/"
    }
  ]
}
```

### 4. Review and Integrate

When the concurrent subagents report back:
- Read each subagent's execution summary.
- Verify deliverables are created correctly.
- Review and integrate their deliverables locally.
- Complete the delivery pipeline.
