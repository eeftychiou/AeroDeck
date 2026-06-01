---
name: systematic-problem-solving
description: Use when encountering any error, blocker, validation failure, or unexpected behavior in a task, before proposing fixes
---

# Systematic Problem Solving

## Overview

Random fixes waste time and create new issues. Quick patches mask underlying gaps.

**Core principle:** ALWAYS find the root cause before attempting fixes. Symptom fixes are failure.

**Violating the letter of this process is violating the spirit of problem solving.**

## The Iron Law

```
NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST
```

If you haven't completed Phase 1, you cannot propose fixes.

## When to Use

Use for ANY technical, operational, or logical issue:
- Validation or criteria failures (Command, Browser/Visual, or Folder State)
- Browser automation errors (element not interactable, form submit failure, timeout)
- Unexpected outputs or poor quality in content/writing
- File/folder routing errors
- Permission or environment issues

**Use this ESPECIALLY when:**
- Under time pressure
- "Just one quick change" seems obvious but you haven't proven why it failed
- You've already tried multiple adjustments and they didn't work
- You don't fully understand the underlying rule or interface behavior

## The Four Phases

You MUST complete each phase before proceeding to the next.

### Phase 1: Root Cause Investigation

**BEFORE attempting ANY fix:**

1. **Read Error Logs & State Details Carefully**
   - Don't skip past error messages, browser console logs, or file state dumps.
   - Note the exact selector, path, or line where the failure occurs.

2. **Reproduce Consistently**
   - Can you trigger the failure reliably?
   - What are the exact steps or environment settings?
   - If not reproducible → gather more state logs, don't guess.

3. **Check Recent Changes**
   - What changed that could cause this?
   - Git diff, file edits, folder moves, or remote web page layout changes.

4. **Gather Evidence in Multi-Step Systems (e.g. Ingestion → Classification → Routing)**
   - Before proposing fixes, add logging/diagnostic checks:
     - Log what data/metadata enters the step.
     - Log what data/metadata exits the step.
     - Verify environment and path propagation.
     - Check state at each layer.
   - Run once to gather evidence showing WHERE it breaks, then investigate that specific step.

### Phase 2: Pattern Analysis

**Find the pattern before fixing:**

1. **Find Working Examples**
   - Locate similar working content, working form submission scripts, or working folders in the codebase/environment.
   - What works that's similar to what's broken?

2. **Compare Against Reference Specs**
   - If implementing a form filling layout, read the HTML structure or fields COMPLETELY.
   - If drafting a document, read the reference style guide or rubrics completely.

3. **Identify Differences**
   - What's different between the working and broken states?
   - List every difference, however small (e.g., hidden inputs, CSRF tokens, capitalizations).

### Phase 3: Hypothesis and Testing

**Scientific method:**

1. **Form a Single Hypothesis**
   - State clearly: "I think X is the root cause because Y" (e.g., "The browser fails to click Submit because the selector `#submit-btn` is covered by a cookie banner").
   - Write it down.

2. **Test Minimally**
   - Make the SMALLEST possible change to test the hypothesis (e.g., run a script that closes the banner first, then verify the click works).
   - One variable at a time. Do not change multiple things at once.

3. **Verify Before Continuing**
   - Did it work? Yes → Phase 4.
   - Didn't work? Form a NEW hypothesis. DO NOT add more fixes on top.

4. **When You Don't Know**
   - Say "I don't understand X".
   - Don't pretend to know. Research or ask for help.

### Phase 4: Implementation

**Fix the root cause, not the symptom:**

1. **Create Failing Criteria Check**
   - Set up the specific verification state that reproduces the issue.
   - Must have a reproducible test before applying the fix.
   - Use the `aerodeck:criteria-driven-refinement` skill.

2. **Implement a Single Fix**
   - Address the root cause identified.
   - ONE change at a time. No "while I'm here" improvements.

3. **Verify Fix**
   - Verification passes now?
   - No other verifications are broken?
   - Issue is actually resolved?

4. **If the Fix Doesn't Work**
   - STOP.
   - Count: How many fixes have you tried?
   - If < 3: Return to Phase 1, re-analyze.
   - **If ≥ 3: STOP and question the design/architecture.**
   - Do NOT attempt Fix #4 without discussing it with your human partner.

5. **If 3+ Fixes Failed: Question the Workflow/Design**
   - Indicators: Each fix reveals a new coupled state, requires massive restructuring, or breaks something else.
   - Discuss with your human partner before attempting more fixes.

---

## Red Flags - STOP and Follow Process

If you catch yourself thinking:
- "Quick fix for now, investigate later"
- "Just try changing X and see if it works"
- "I don't fully understand but this might work"
- "One more fix attempt" (when you've already tried 2+ failures)

**ALL of these mean: STOP. Return to Phase 1.**

## Integration

**Related skills:**
- **aerodeck:criteria-driven-refinement** - For creating the failing check (Phase 4, Step 1)
- **aerodeck:verification-before-delivery** - Verify the fix worked before final delivery
