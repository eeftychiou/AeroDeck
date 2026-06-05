---
name: writing-plans
description: Use when you have a spec or requirements for a multi-step task, before executing any changes
---

# Writing Plans

## Overview

Write comprehensive implementation plans assuming the worker has zero context for our project and questionable taste. Document everything they need to know: which files, folders, or web elements to touch for each task, text, scripts, and validation criteria. Give them the whole plan as bite-sized tasks. DRY. YAGNI. CDR (Criteria-Driven Refinement). Frequent saves/checkpoints.

Assume they are a skilled worker, but know almost nothing about our toolset or problem domain. Assume they don't know good verification design very well.

**Announce at start:** "I'm using the writing-plans skill to create the implementation plan."

**Context:** If working in an isolated workspace/worktree, it should have been created via the `aerodeck:using-isolated-workspaces` skill at execution time.

**Save plans to:** `docs/aerodeck/plans/YYYY-MM-DD-<feature-name>.md`
- (User preferences for plan location override this default)

## Scope Check

If the spec covers multiple independent subsystems or workflows, it should have been broken into sub-project specs during brainstorming. If it wasn't, suggest breaking this into separate plans — one per workflow. Each plan should produce working, verifiable outcomes on its own.

## Structure Mapping

Before defining tasks, map out which files, folders, templates, or browser targets will be created, modified, or accessed, and what each one is responsible for. This is where decomposition decisions get locked in.

- Design units with clear boundaries and well-defined interfaces. Each step or file should have one clear responsibility.
- You reason best about information you can hold in context at once, and your edits are more reliable when files/components are focused. Prefer smaller, focused files/documents over large ones that do too much.
- Elements that change together should live together. Split by responsibility, not by layer.
- In existing structures, follow established patterns.

This structure informs the task decomposition. Each task should produce self-contained changes that make sense independently.

## Verification Modes
Define how each task step is verified. Do not just say "check if it works". Specify one of the following verification modes:
1. **Command Verification:** Running a script, local validator, linter, or parser (e.g., `node test.js` or `pandoc doc.md -o doc.pdf`).
2. **Browser/Visual Verification:** Open a page in Chrome, locate specific elements (IDs, classes, selectors), check fields, or review visual screenshots (e.g., "Open URL X, verify that selector `#success-banner` exists, check screenshot for layout alignment").
3. **Folder/File State Verification:** Inspect folders or file metadata to verify classification and movement (e.g., "Check that file Y has been moved to folder `/inbox/billing` and its file size is >0").

## Bite-Sized Task Granularity

**Each step is one action (2-5 minutes):**
- "Write the success criteria / validation criteria" - step
- "Run the validator / check the state to make sure it fails" - step
- "Perform minimal worker action or write minimal content to make it pass" - step
- "Run the validator / verify state to make sure it passes" - step
- "Save/Checkpoint" - step

## Plan Document Header

**Every plan MUST start with this header:**

```markdown
# [Feature/Task Name] Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use aerodeck:subagent-driven-task-pipeline (recommended) or aerodeck:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** [One sentence describing what this builds or automates]

**Architecture/Workflow:** [2-3 sentences about approach and review pipeline choice: Content Configuration A or Operational Configuration B]

**Tech Stack/Tools:** [Key tools, browser tools, filesystem paths, or libraries]

---
```

## Task Structure

````markdown
### Task N: [Component/Step Name]

**Targets:**
- Create: `exact/path/to/document.md`
- Modify: `exact/path/to/existing.txt:123-145`
- Browser URL: `https://example.com/apply` (with selector `#name-field`)
- Folder: `C:/inbox/billing`

- [ ] **Step 1: Write/Define success criteria**

Write success criteria in `docs/aerodeck/criteria/task-N-criteria.json` or state it explicitly:
```json
{
  "criteria": "Document exists in billing, metadata contains invoice_id"
}
```

- [ ] **Step 2: Verify current state fails/lacks criteria**

Run: `node scripts/check-billing.js` or check folder `C:/inbox/billing`
Expected: FAIL (Folder empty or file missing)

- [ ] **Step 3: Perform minimal implementation / worker action**

Write minimal content or run form filler:
```markdown
# Invoice INV-1002
...
```

- [ ] **Step 4: Verify state passes criteria**

Run: `node scripts/check-billing.js` or inspect folder `C:/inbox/billing`
Expected: PASS (File exists and contains INV-1002)

- [ ] **Step 5: Save/Checkpoint**

```bash
# Save your work to the required location, e.g. copying out of sandbox or finalizing local files
cp .sandbox/task-N/document.md exact/path/to/document.md
```
````

## No Placeholders

Every step must contain the actual content a worker needs. These are **plan failures** — never write them:
- "TBD", "TODO", "implement later", "fill in details"
- "Add appropriate validation" / "handle edge cases"
- "Write criteria for the above" (without actual criteria text or structure)
- "Similar to Task N" (repeat the steps — the worker may be reading tasks out of order)
- Steps that describe what to do without showing how (specific file paths, selectors, or text required)

## Remember
- Exact paths and selectors always
- Complete content/code in every step — if a step changes text/code, show it
- Exact commands with expected outcomes
- DRY, YAGNI, Criteria-Driven Refinement, frequent saves/checkpoints

## Self-Review

After writing the complete plan, look at the spec with fresh eyes and check the plan against it. This is a checklist you run yourself — not a subagent dispatch.

**1. Spec coverage:** Skim each section/requirement in the spec. Can you point to a task that implements or automates it? List any gaps.

**2. Placeholder scan:** Search your plan for red flags — any of the patterns from the "No Placeholders" section above. Fix them.

**3. Selector/Folder consistency:** Do the browser selectors, paths, property names, and folder names you used in later tasks match what you defined in earlier tasks?

If you find issues, fix them inline. No need to re-review — just fix and move on. If you find a spec requirement with no task, add the task.

## Execution Handoff

After saving the plan, offer execution choice:

**"Plan complete and saved to `docs/aerodeck/plans/<filename>.md`. Two execution options:**

**1. Subagent-Driven (recommended)** - I dispatch specialized worker/reviewer subagents per task, review between tasks, fast iteration.

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints.

**Which approach?"**

**If Subagent-Driven chosen:**
- **REQUIRED SUB-SKILL:** Use aerodeck:subagent-driven-task-pipeline
- Fresh subagents per task + multi-stage review.

**If Inline Execution chosen:**
- **REQUIRED SUB-SKILL:** Use aerodeck:executing-plans
- Batch execution with checkpoints for review.
