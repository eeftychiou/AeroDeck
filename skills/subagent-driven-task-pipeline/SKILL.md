---
name: subagent-driven-task-pipeline
description: Use when executing implementation plans with independent tasks in the current session using specialized subagents
---

# Subagent-Driven Task Pipeline

Execute plans by dispatching specialized subagents per task, running them through a multi-stage review pipeline tailored to the task type.

**Why subagents:** You delegate tasks to specialized agents with isolated contexts. By precisely crafting their instructions and context, you ensure they stay focused and succeed at their task. They should never inherit your session's context or history — you construct exactly what they need. This also preserves your own context for coordination work.

**Continuous execution:** Do not pause to check in with your human partner between tasks. Execute all tasks from the plan without stopping. The only reasons to stop are: BLOCKED status you cannot resolve, ambiguity that genuinely prevents progress, or all tasks complete.

---

## The Review Pipelines

Depending on the task domain, select and dispatch the appropriate pipeline configuration:

### Configuration A: Content Creation & Drafting (e.g. Reports, Cover Letters, Strategy Specs)
1. **Worker/Writer:** Drafts the text or generates content based on task specs.
2. **Writing Editor (Tone & Flow):** Reviews style, tone, readability, structural organization, and flow.
3. **Quality Review Editor (Accuracy & Compliance):** Verifies that all facts, data points, and criteria checklists are strictly met.
4. **Management Reviewer (Strategy & Approval):** Signs off on the final value and readiness for delivery.

### Configuration B: Operational Execution (e.g. Online Form Completion, Document Routing)
1. **Worker/Operator:** Fills out forms in Chrome, extracts e-document text, or triages files.
2. **Accuracy Reviewer (Data Integrity):** Verifies that filled form fields or extracted metadata match source documents *exactly*.
3. **Logic/Rules Reviewer (Routing & Policy):** Verifies that classification and assignment follow specified business rules.
4. **Final Approver (Execution & Submission):** Performs the final save or submit action (e.g. clicking "Submit Application" or writing a routing log).

---

## Process Flow

```dot
digraph process {
    rankdir=TB;

    subgraph cluster_per_task {
        label="Per Task";
        "Identify pipeline category\n(Content A vs Operational B)" [shape=box];
        "Dispatch Worker subagent (./worker-prompt.md)" [shape=box];
        "Worker completed work?" [shape=diamond];
        "Dispatch Stage 1 Reviewer\n(Writing/Accuracy)" [shape=box];
        "Stage 1 Reviewer approves?" [shape=diamond];
        "Worker fixes Stage 1 issues" [shape=box];
        "Dispatch Stage 2 Reviewer\n(Quality/Rules)" [shape=box];
        "Stage 2 Reviewer approves?" [shape=diamond];
        "Worker fixes Stage 2 issues" [shape=box];
        "Dispatch Final Approver\n(Management/Execution)" [shape=box];
        "Final Approver approves/executes?" [shape=diamond];
        "Worker/Operator completes final actions" [shape=box];
        "Mark task complete in task.md" [shape=box];
    }

    "Read plan, extract all tasks with verifications, create task.md" -> "Identify pipeline category\n(Content A vs Operational B)";
    "Identify pipeline category\n(Content A vs Operational B)" -> "Dispatch Worker subagent (./worker-prompt.md)";
    "Dispatch Worker subagent (./worker-prompt.md)" -> "Worker completed work?";
    "Worker completed work?" -> "Dispatch Stage 1 Reviewer\n(Writing/Accuracy)" [label="yes"];
    "Dispatch Stage 1 Reviewer\n(Writing/Accuracy)" -> "Stage 1 Reviewer approves?";
    "Stage 1 Reviewer approves?" -> "Worker fixes Stage 1 issues" [label="no"];
    "Worker fixes Stage 1 issues" -> "Dispatch Stage 1 Reviewer\n(Writing/Accuracy)" [label="re-review"];
    "Stage 1 Reviewer approves?" -> "Dispatch Stage 2 Reviewer\n(Quality/Rules)" [label="yes"];
    "Dispatch Stage 2 Reviewer\n(Quality/Rules)" -> "Stage 2 Reviewer approves?";
    "Stage 2 Reviewer approves?" -> "Worker fixes Stage 2 issues" [label="no"];
    "Worker fixes Stage 2 issues" -> "Dispatch Stage 2 Reviewer\n(Quality/Rules)" [label="re-review"];
    "Stage 2 Reviewer approves?" -> "Dispatch Final Approver\n(Management/Execution)" [label="yes"];
    "Dispatch Final Approver\n(Management/Execution)" -> "Final Approver approves/executes?";
    "Final Approver approves/executes?" -> "Worker/Operator completes final actions" [label="needs adjustments"];
    "Worker/Operator completes final actions" -> "Dispatch Final Approver\n(Management/Execution)" [label="re-approve"];
    "Final Approver approves/executes?" -> "Mark task complete in task.md" [label="yes / executed"];
}
```

## Prompt Templates
- `./worker-prompt.md` - Dispatch the Worker/Operator subagent.
- `./compliance-reviewer-prompt.md` - Dispatch Stage 1 (Writing/Accuracy) review.
- `./quality-reviewer-prompt.md` - Dispatch Stage 2 (Quality/Rules) review.
- `./final-approver-prompt.md` - Dispatch the Final Approver (Management/Execution).

## Integration
- **aerodeck:using-isolated-workspaces** - Prepares the isolated workspace (e.g. `Workspace: "branch"`).
- **aerodeck:writing-plans** - Generates the plan this pipeline executes.
- **aerodeck:completing-a-task-pipeline** - Finalizes the pipeline after all tasks are done.
