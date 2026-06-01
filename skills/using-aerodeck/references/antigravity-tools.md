# AeroDeck Tool Mapping for Generic Agents

Skills use Claude Code tool names. When you encounter these in a skill, use your platform equivalent:

| Skill references | Antigravity 2.0 equivalent |
|-----------------|---------------------------|
| `Read` (file reading) | `view_file` |
| `Write` (file creation) | `write_to_file` |
| `Edit` (file editing) | `replace_file_content` (single contiguous block) / `multi_replace_file_content` (multiple non-adjacent blocks) |
| `Bash` (run commands) | `run_command` (used for document validation, screenshot capturing, filesystem checks, and build steps) |
| `Grep` (search file content) | `grep_search` |
| `Glob` (search files by name) | `find_by_name` with `Pattern` glob, optional `Extensions`, `MaxDepth`, `Type` (file/directory) |
| `TodoWrite` (task tracking) | `write_to_file` to create/update `task.md` artifact |
| `Skill` tool (invoke a skill) | Skills auto-load from plugins; use `view_file` to read any `SKILL.md` on demand |
| `WebSearch` | `search_web` (critical for browsing page details or factual research) |
| `WebFetch` | `read_url_content` / Chrome browser integration |
| `Task` tool (dispatch subagent) | `invoke_subagent` (see [Subagent support](#subagent-support)) |

## Subagent support

Antigravity 2.0 supports parallel subagents natively via `invoke_subagent`. There are two patterns for dispatching subagent tasks:

### Pattern 1: Direct dispatch (baseline)

Use the built-in `self` subagent type to dispatch any task — it clones your full environment and follows the prompt you provide.

When a skill says to dispatch a named agent type, use `invoke_subagent` with `TypeName: "self"` and the prompt from the corresponding subagent template:

| Skill instruction | Antigravity 2.0 equivalent |
|-------------------|---------------------------|
| `Task tool (aerodeck:worker)` | `invoke_subagent` with `TypeName: "self"`, `Role: "Worker"`, and filled `worker-prompt.md` template |
| `Task tool (aerodeck:compliance-reviewer)` | `invoke_subagent` with `TypeName: "self"`, `Role: "Compliance Reviewer"`, and filled `compliance-reviewer-prompt.md` template |
| `Task tool (aerodeck:quality-reviewer)` | `invoke_subagent` with `TypeName: "self"`, `Role: "Quality Reviewer"`, and filled `quality-reviewer-prompt.md` template (for style/tone or business rules) |
| `Task tool (aerodeck:final-approver)` | `invoke_subagent` with `TypeName: "self"`, `Role: "Final Approver"`, and filled `final-approver-prompt.md` template |

### Pattern 2: Define then invoke (recommended for multi-task plans)

For repeated dispatches (e.g., running a multi-step plan where each task needs a worker + specialized reviews), use `define_subagent` to create named agent types upfront, then `invoke_subagent` by type name. This avoids re-sending full system prompts on every invocation.

```
# Define once at the start of a plan
define_subagent(name="worker", description="Operator/Writer", system_prompt="<filled worker-prompt.md>")
define_subagent(name="compliance-reviewer", description="Accuracy/Facts Reviewer", system_prompt="<filled compliance-reviewer-prompt.md>")
define_subagent(name="quality-reviewer", description="Quality/Style/Rules Reviewer", system_prompt="<filled quality-reviewer-prompt.md>")
define_subagent(name="final-approver", description="Final Approver", system_prompt="<filled final-approver-prompt.md>")

# Then invoke by name for each task
invoke_subagent(TypeName="worker", Role="Worker", Prompt="Task 1: ...")
invoke_subagent(TypeName="compliance-reviewer", Role="Compliance Reviewer", Prompt="Review Task 1...")
```

### Prompt filling

Skills provide prompt templates with placeholders like `{WHAT_WAS_COMPLETED}` or `[FULL TEXT of task]`. Fill all placeholders and pass the complete prompt as the `Prompt` parameter to `invoke_subagent`.

### Communicating with subagents

Use `send_message` to communicate with a running subagent (e.g., to answer questions). Each subagent has a unique conversation ID returned by `invoke_subagent`.

Use `manage_subagents` to list active subagents or kill completed ones.

### Workspace isolation

When invoking subagents, you can control workspace sharing via the `Workspace` parameter:
- `"inherit"` (default) — uses the same workspace as the parent
- `"branch"` — creates an isolated workspace on a new git branch/worktree (excellent for testing document structures or dry-running files in isolation)
- `"share"` — shares the parent's directory but allows independent branching
