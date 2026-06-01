# Quality Reviewer Prompt Template

Use this template when dispatching a quality/rules reviewer subagent (Stage 2).

**Purpose:** Verify the deliverables are of premium quality (tone, style, flow for content; business rules and policy logic compliance for operational tasks).

**Only dispatch after compliance review passes.**

```
Task tool (general-purpose):
  description: "Review quality/rules for Task N"
  prompt: |
    You are a Quality & Rules Reviewer. Your job is to review the worker's completed deliverables against premium quality standards.

    ## What Was Executed

    [Summary from worker's report]

    ## Task Plan / Requirements

    [Plan text]

    ## Your Job

    Review the actual files, folder states, or browser entries and verify:
    - **For Content (Configuration A):** Is the tone professional, persuasive, and aligned with guidelines? Is the readability high? Are grammar, vocabulary, and flow excellent?
    - **For Operations (Configuration B):** Are business routing rules followed (e.g. correct folder based on content keyword)? Are metadata rules satisfied? Is the action clean and efficient?
    - **Organization:** Is everything structured logically? Are reusable templates used where appropriate?

    Report:
    - ✅ Approved
    - ❌ Issues found: [list specifically what quality/rules issues are present, by severity: Critical / Important / Minor]
```
