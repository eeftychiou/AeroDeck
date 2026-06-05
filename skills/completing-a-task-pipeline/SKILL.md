---
name: completing-a-task-pipeline
description: Use when task execution is complete, all criteria/checks pass, and you need to decide how to integrate and deliver the work - guides completion of task work by presenting structured options for merge, push, or cleanup
---

# Completing a Task Pipeline

## Overview

Guide the completion and delivery of task work by verifying all success criteria, presenting clear integration options, and handling the chosen cleanup path.

**Core principle:** Verify criteria → Detect environment → Present options → Execute choice → Clean up.

**Announce at start:** "I'm using the completing-a-task-pipeline skill to finalize this work."

## The Process

### Step 1: Verify All Criteria & Deliverables

**Before presenting options, verify that all task checklist verifications are completely passing:**
- Run local validator scripts, check files in folders, or verify the Chrome browser states.
- Double-check that no temporary comments, incomplete sections, or draft placeholders are left in the deliverables.
- Ensure that the repository's top-level or global documentation (such as the main `README.md`) has been updated to reflect the new features, tools, commands, or changes introduced.

**If any checks fail:** Must fix before completing. Stop. Do not proceed to Step 2.
**If all checks pass:** Continue to Step 2.

### Step 2: Detect Environment & Base Branch

Determine the workspace branch and repository state. Verify if you are on a branch that can be merged locally or if a pull request/delivery sync is needed.

### Step 3: Present Options

**Present exactly these 4 options to the user:**

```
Task pipeline complete and all criteria verified. What would you like to do?

1. Merge back to <base-branch> locally (deliver files locally)
2. Push changes and create a Pull Request / Delivery sync
3. Keep the work in this workspace as-is (I'll review it manually later)
4. Discard this work

Which option?
```

Keep options concise without extra text.

### Step 4: Execute Choice

#### Option 1: Merge Locally
1. `cd` to the main repository root.
2. Checkout the base branch and pull.
3. Merge the task branch.
4. Verify all validations still pass on the merged result.
5. Clean up the isolated workspace (Step 5), then delete the branch.

#### Option 2: Push and Sync
1. Push the branch to the remote (`git push -u origin <branch>`).
2. If using GitHub, run `gh pr create` or notify the user that the branch has been pushed for review.
3. **Do NOT clean up the workspace** — the user may need to iterate on feedback.

#### Option 3: Keep As-Is
Report: "Keeping branch <name>. Workspace preserved at <path>." Do not clean up.

#### Option 4: Discard
**Confirm first:**
```
This will permanently delete:
- Branch <name>
- All changes in this workspace at <path>

Type 'discard' to confirm.
```
Wait for exact confirmation before executing force-delete.

### Step 5: Cleanup Workspace
Only runs for Options 1 and 4. If the workspace is under `.worktrees/` or was created natively by the harness with `Workspace: "branch"`, remove the workspace or let the harness prune it (`git worktree remove` and `git worktree prune`).
