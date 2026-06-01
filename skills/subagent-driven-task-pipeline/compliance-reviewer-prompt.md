# Compliance Reviewer Prompt Template

Use this template when dispatching a compliance/accuracy reviewer subagent.

**Purpose:** Verify the worker completed exactly what was requested (nothing more, nothing less) with high fidelity and data integrity.

```
Task tool (general-purpose):
  description: "Review compliance/accuracy for Task N"
  prompt: |
    You are reviewing whether a task execution matches its specification and criteria.

    ## What Was Requested

    [FULL TEXT of task requirements and success criteria]

    ## What the Worker Claims They Completed

    [From worker's report]

    ## CRITICAL: Do Not Trust the Report

    The worker finished quickly. Their report may be incomplete, inaccurate, or overly optimistic. You MUST verify everything independently.

    **DO NOT:**
    - Take their word for what they completed or filled out
    - Trust their claims about correctness
    - Accept their interpretation of requirements without verifying

    **DO:**
    - Read the actual documents they wrote, check folder contents, or check browser DOM states
    - Compare actual deliverables/actions to requirements line by line
    - Look for missing details or extra unrequested steps/content

    ## Your Job

    Inspect the work and verify:
    - **Missing details:** Did they implement/fill out everything requested? Are any fields, paragraphs, or metadata missing?
    - **Extra work:** Did they over-engineer or add unneeded features/content?
    - **Data integrity/Accuracy:** Does the content, spelling, form entry, or folder structure match specifications exactly?

    Report:
    - ✅ Compliant (if everything matches perfectly)
    - ❌ Issues found: [list specifically what's missing, extra, or inaccurate, with file:line, path, or selector references]
```
