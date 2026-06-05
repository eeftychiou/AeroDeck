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
- Ensure any relevant logs, notes, or index documents are updated to reflect the completed task.

**If any checks fail:** Must fix before completing. Stop. Do not proceed to Step 2.
**If all checks pass:** Continue to Step 2.

### Step 2: Detect Environment & Target Location

Determine the workspace state. Verify if you are in an isolated workspace that needs to be integrated into the main location, or if it can be handed off directly.

### Step 3: Present Options

**Present exactly these 4 options to the user:**

```
Task pipeline complete and all criteria verified. What would you like to do?

1. Finalize and integrate deliverables into the main workspace
2. Export or hand off deliverables for external review
3. Keep the work in this workspace as-is (I'll review it manually later)
4. Discard this work

Which option?
```

Keep options concise without extra text.

### Step 4: Execute Choice

#### Option 1: Finalize and Integrate
1. Determine the target directory for the final deliverables.
2. Copy or move the files from the isolated workspace to the main location.
3. Verify that all validations still pass in the main location.
4. Clean up the isolated workspace (Step 5).

#### Option 2: Export or Hand Off
1. Package or prepare the deliverables as requested (e.g., zip file, specific export format).
2. Notify the user where the deliverables are located for their review.
3. **Do NOT clean up the workspace** — the user may need to iterate on feedback.

#### Option 3: Keep As-Is
Report: "Keeping workspace preserved at <path>." Do not clean up.

#### Option 4: Discard
**Confirm first:**
```
This will permanently delete:
- All work generated in this session
- All changes in this workspace at <path>

Type 'discard' to confirm.
```
Wait for exact confirmation before executing force-delete.

### Step 5: Cleanup Workspace
Only runs for Options 1 and 4. If an isolated workspace or directory was created for this task, delete the temporary directory and clean up any remaining artifacts.
