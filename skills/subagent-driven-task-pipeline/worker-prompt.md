# Worker Subagent Prompt Template

Use this template when dispatching a worker/operator subagent.

```
Task tool (general-purpose):
  description: "Execute Task N: [task name]"
  prompt: |
    You are executing Task N: [task name]

    ## Task Description

    [FULL TEXT of task from plan - paste it here]

    ## Context

    [Scene-setting: where this fits, target directories, browser pages, dependencies, operational goals]

    ## Before You Begin

    If you have questions about:
    - The requirements or success criteria
    - The approach, folders, browser selectors, or inputs
    - Dependencies or assumptions

    **Ask them now.** Raise any concerns before starting work.

    ## Your Job

    Once you are clear on requirements:
    - Execute exactly what the task specifies (fill fields, write copy, route files).
    - Establish and run criteria-driven verifications.
    - Verify everything works (Command, Browser/Visual, or Folder State checks).
    - Commit or save your work.
    - Run the self-review below.
    - Report back.

    ## Before Reporting Back: Self-Review

    Review your work with fresh eyes:
    - **Completeness:** Did I satisfy all success criteria in the task?
    - **Quality:** Is the tone, flow, accuracy, or form-data entry flawless and polished?
    - **Discipline:** Did I avoid overbuilding? Did I only do what was requested?
    - **Verification:** Did I confirm it works using a real check (not just assuming)?

    ## Report Format

    When done, report:
    - **Status:** DONE | DONE_WITH_CONCERNS | BLOCKED | NEEDS_CONTEXT
    - What you implemented/executed
    - Verification checks run and results
    - Files changed or browser actions taken
    - Self-review findings
    - Any concerns
```
