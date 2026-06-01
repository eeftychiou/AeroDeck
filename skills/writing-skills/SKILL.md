---
name: writing-skills
description: Use when creating new process skills, editing existing skills, or verifying skill behavior in the agent framework
---

# Writing Skills

## Overview

**Writing skills is Criteria-Driven Refinement (CDR) applied to process documentation.**

Personal skills live in your agent configuration directory (`~/.gemini/config/plugins/` for Antigravity 2.0).

You define verification checks (pressure scenarios with subagents), check how they fail (baseline behavior), write the skill (documentation), verify they pass (subagents comply), and refactor (close loopholes).

**REQUIRED BACKGROUND:** You MUST understand aerodeck:criteria-driven-refinement before using this skill.

## What is a Skill?

A **skill** is a reference guide for proven techniques, workflows, templates, or tools. Skills help future agent instances find and apply effective approaches.

**Skills are:** Reusable techniques, patterns, templates, references.
**Skills are NOT:** Narrative logs of how you solved a problem once.

## CDR Mapping for Skills

| CDR Concept | Skill Creation |
|-------------|----------------|
| **Success criteria** | Pressure scenario with subagent |
| **Deliverable** | Skill document (SKILL.md) |
| **Check fails (RED)** | Agent violates rule without skill (baseline) |
| **Check passes (GREEN)** | Agent complies with skill present |
| **Refactor** | Close loopholes and polish documentation |

---

## Frontmatter (YAML Specification)

Every `SKILL.md` file must start with standard frontmatter:

```markdown
---
name: Skill-Name-With-Hyphens
description: Use when [specific triggering conditions and symptoms]
---
```

**Description is Triggering Conditions, NOT Workflow Summary:**
The description should ONLY describe *when* the skill is useful, not *how* to do it. If you summarize the workflow in the description, the agent may bypass reading the full file.

*   ❌ **BAD:** description: Use for task review - dispatches workers and runs 3-stage checks.
*   ✅ **GOOD:** description: Use when executing implementation plans with independent steps in the current session.

---

## Bottom Line

Follow the same Criteria-Driven Refinement principles for skills as you do for deliverables: no skill writing/editing without a defined baseline check first.
