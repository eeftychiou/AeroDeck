---
name: verification-before-delivery
description: Use when about to claim work is complete, delivered, or correct, before committing or notifying the user - requires running fresh validation checks (Command, Browser/Visual, or Folder State) and confirming outcomes before making any success claims; evidence before assertions always
---

# Verification Before Delivery

## Overview

Claiming work is complete or delivered without systematic verification is dishonesty, not efficiency.

**Core principle:** Evidence before claims, always.

**Violating the letter of this rule is violating the spirit of this rule.**

## The Iron Law

```
NO DELIVERY CLAIMS WITHOUT FRESH VERIFICATION EVIDENCE
```

If you haven't run the verification check in this message, you cannot claim it is complete.

## The Gate Function

```
BEFORE claiming any status or expressing satisfaction:

1. IDENTIFY: What specific verification check (Command, Browser/Visual, or Folder State) proves this claim?
2. RUN: Execute the check FULLY (fresh, complete)
3. READ: Full output / DOM state / screenshot / file sizes, count failures or gaps
4. VERIFY: Does the state confirm the requirements?
   - If NO: State actual status with evidence
   - If YES: State claim WITH evidence
5. ONLY THEN: Make the claim

Skip any step = lying, not verifying
```

## Common Failures

| Claim | Requires | Not Sufficient |
|-------|----------|----------------|
| Form submitted | Success URL reached, dialog visible, or success database entry | Clicked submit, "should have worked" |
| Document routed | Target file exists at exact destination, size >0, metadata logged | Copy/Move command returned exit 0 |
| Copy polished | Run linter/speller, verify rubric criteria checklist | Text generated, logs look good |
| Issue resolved | Reproduce original symptom, observe it passes now | Code changed, assumed fixed |
| Requirements met | Line-by-line checklist verification | General assumption |

## Red Flags - STOP

- Using "should", "probably", "seems to"
- Expressing satisfaction before verification ("Great!", "Perfect!", "Done!", etc.)
- About to commit/push/submit without verification
- Relying on partial verification
- Thinking "just this once"

## Key Patterns

**Browser / Web Forms:**
```
✅ [Locate selector `#success-banner`, take screenshot] [See: banner visible] "The form submitted successfully."
❌ "I clicked submit, it should be complete."
```

**File Routing / Classification:**
```
✅ [Run `ls /inbox/billing`] [See: invoice-1002.pdf size: 10452 bytes] "Document routed successfully."
❌ "Moved document. Done."
```

**Content / Writing Requirements:**
```
✅ [Re-read plan/spec] -> [Checklist: cover letter contains contact info (yes), specific role (yes), signature (yes)] "All requirements met."
❌ "Polished copy, looks good."
```

---

## When To Apply

**ALWAYS before:**
- ANY variation of success/completion/delivery claims
- ANY expression of satisfaction
- ANY positive statement about task state
- Committing, PR creation, task completion
- Moving to the next task

## The Bottom Line

**No shortcuts for verification.**

Run the verification check. Inspect the state. THEN claim the result.

This is non-negotiable.
