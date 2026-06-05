---
name: executing-plans
description: Use when you have a written implementation plan to execute in the current session with review checkpoints
---

# Executing Plans

## Overview

Load the plan, review it critically, execute all tasks sequentially, and report when complete.

**Announce at start:** "I'm using the executing-plans skill to implement this plan."

**Note:** Tell your human partner that AeroDeck works much better with access to subagents. The quality of its work will be significantly higher if run with subagent support. If subagents are available, use aerodeck:subagent-driven-task-pipeline instead of this skill.

## The Process

### Step 1: Load and Review Plan
1. Read plan file
2. Review critically - identify any questions or concerns about the plan (e.g., missing selectors, unclear folder structures)
3. If concerns: Raise them with your human partner before starting
4. If no concerns: Create `task.md` todo and proceed

### Step 2: Execute Tasks

For each task:
1. Mark as in-progress in `task.md`
2. Follow each step exactly (the plan has bite-sized steps: writing criteria, checking fail state, execution, checking pass state)
3. Run verifications as specified (Command, Browser/Visual, or Folder/File State checks)
4. Mark as completed in `task.md`

### Step 3: Complete the Work

After all tasks are completed and verified:
- Announce: "I'm using the completing-a-task-pipeline skill to finalize this work."
- **REQUIRED SUB-SKILL:** Use aerodeck:completing-a-task-pipeline
- Follow that skill to verify deliverables, present options, and finalize.

## When to Stop and Ask for Help

**STOP executing immediately when:**
- You hit a blocker (missing permissions, verification fails, selector not found, instruction unclear)
- The plan has critical gaps preventing you from starting
- You don't understand an instruction
- Verification fails repeatedly

**Ask for clarification rather than guessing.**

## When to Revisit Earlier Steps

**Return to Review (Step 1) when:**
- Partner updates the plan based on your feedback
- The fundamental approach needs rethinking

**Don't force through blockers** - stop and ask.

## Remember
- Review the plan critically first
- Follow plan steps exactly
- Don't skip verifications
- Reference skills when the plan says to
- Stop when blocked, don't guess
- Never start execution in the primary workspace or live environment without explicit user consent or isolation

## Integration

**Required workflow skills:**
- **aerodeck:using-isolated-workspaces** - Ensures an isolated workspace (creates one or verifies existing)
- **aerodeck:writing-plans** - Creates the plan this skill executes
- **aerodeck:completing-a-task-pipeline** - Completes the work after all tasks are finished
