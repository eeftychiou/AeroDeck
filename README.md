# AeroDeck for Antigravity 2.0, Antigravity IDE and Antigravity CLI

AeroDeck is a complete, ground-up general-purpose framework for agentic workflows. It is built on top of a set of composable skills and initial instructions that ensure your agent acts systematically and reliably across tasks.

AeroDeck natively supports the **Google Antigravity 2.0** platform, featuring a `plugin.json` manifest, a comprehensive tool mapping reference (`antigravity-tools.md`), workspace isolation via `invoke_subagent` with `Workspace: "branch"`, and a robust test suite.

## Quickstart

Give your agent AeroDeck: [Antigravity 2.0 (IDE/CLI)](#antigravity-20-idecli).

## How it works

It starts from the moment you fire up your agent. As soon as it receives a goal or a task, it *doesn't* just jump into performing actions. Instead, it steps back and asks you what you're really trying to achieve.

Once it's teased a clear specification or goal out of the conversation, it shows it to you in digestible sections for validation.

After you've signed off on the design or target requirements, your agent puts together an implementation plan that's extremely clear and detailed. It decomposes the overall goal into bite-sized tasks with explicit success criteria and verifications. It emphasizes true Red/Green Criteria-Driven Refinement (CDR), YAGNI (You Aren't Gonna Need It), and simplicity.

Next up, once you say "go", it launches a *subagent-driven-task-pipeline* process, executing each task through specialized worker and reviewer subagents (with multi-stage reviews for content creation or operational execution) without stopping. It can work autonomously to achieve your goals while ensuring every intermediate step is fully verified.

There's a bunch more to it, but that's the core of the system. And because the skills trigger automatically, you don't need to do anything special. Your agent just has AeroDeck.




## Installation

Installation differs by harness. If you use more than one, install AeroDeck separately for each one.

### Antigravity 2.0 (IDE/CLI)

This is the primary target for this fork. Choose your platform below.

#### macOS / Linux

* **Global plugin** (available in all projects):

```bash
  git clone https://github.com/eeftychiou/AeroDeck ~/.gemini/config/plugins/aerodeck
  ```

* **Workspace plugin** (project-level only):

```bash
  git clone https://github.com/eeftychiou/AeroDeck .agents/plugins/aerodeck
  ```

* **Update later:**

```bash
  cd ~/.gemini/config/plugins/aerodeck && git pull
  ```

#### Windows (PowerShell)

* **Global plugin** (available in all projects):

```powershell
  git clone https://github.com/eeftychiou/AeroDeck "$env:USERPROFILE\\.gemini\\config\\plugins\\aerodeck"
  ```

* **Workspace plugin** (project-level only):

```powershell
  git clone https://github.com/eeftychiou/AeroDeck .agents\\plugins\\aerodeck
  ```

* **Update later:**

```powershell
  cd "$env:USERPROFILE\\.gemini\\config\\plugins\\aerodeck"; git pull
  ```

#### Windows (WSL)

If you run Antigravity inside WSL, use the Linux paths.

If you run the **Windows Antigravity IDE** but your workspace is in **WSL**, the plugin scope determines the location:

* **Global plugin** (available in all projects, installed on Windows side):

  Clone the repository directly to your Windows user profile path:

  ```bash
  git clone https://github.com/eeftychiou/AeroDeck /mnt/c/Users/$USER/.gemini/config/plugins/aerodeck
  ```

* **Workspace plugin** (project-level only, installed inside your WSL workspace):

  Clone (or symlink) the repository into the project-level plugins folder inside your WSL workspace:

  ```bash
  git clone https://github.com/eeftychiou/AeroDeck /path/to/your/wsl/project/.agents/plugins/aerodeck
  ```



#### Activation

Once installed, AeroDeck skills are available via the **`/using-aerodeck`** slash command in Antigravity 2.0 and Antigravity IDE. For the Antigravity CLI, the command is **`/aerodeck:using-aerodeck`**. Type the appropriate command at the start of a session to activate the skill system. *(Note: If you have Antigravity open during install, restart the application to ensure the plugin is scanned and loaded).* The agent will load the bootstrap and tool mapping, then brainstorming, TDD, subagent-driven-task-pipeline, and all other skills will trigger automatically for the rest of the session.



#### Verify Installation

1. Start a new Antigravity session
2. Type `/using-aerodeck` (or `/aerodeck:using-aerodeck` if using the Antigravity CLI)
3. Say "Let's make a react todo list"
4. The brainstorming skill should trigger automatically



## The Basic Workflow

1. **brainstorming** - Activates before creating content or performing actions. Refines rough ideas through questions, explores alternatives, presents designs/requirements in sections for validation. Saves specification documents.
2. **using-isolated-workspaces** - Activates after requirements approval. Ensures isolated workspaces are set up, verifies clean starting baselines.
3. **writing-plans** - Activates with approved spec. Breaks work into bite-sized tasks (2-5 minutes each). Every task has exact targets (file paths, browser selectors, folders), complete content/steps, and verification steps.
4. **subagent-driven-task-pipeline** or **executing-plans** - Activates with plan. Dispatches fresh subagent per task with multi-stage review (spec compliance, then quality of content/action), or executes in batches with human checkpoints.
5. **criteria-driven-refinement** - Activates during implementation. Enforces RED-GREEN-REFACTOR: define success criteria, watch it fail, perform minimal content or action, watch it pass, save. Deletes unverified drafts/changes.
6. **requesting-task-review** - Activates between tasks. Reviews against plan, reports issues by severity. Critical issues block progress.
7. **completing-a-task-pipeline** - Activates when tasks complete. Verifies deliverables, presents options (merge/PR/keep/discard), cleans up workspace.

**The agent checks for relevant skills before any task.** Mandatory workflows, not suggestions.

## What's Inside

### Skills Library

**Testing**

* **criteria-driven-refinement** - RED-GREEN-REFACTOR cycle (includes testing anti-patterns reference)

**Debugging**

* **systematic-problem-solving** - 4-phase root cause process (includes root-cause-tracing, defense-in-depth, condition-based-waiting techniques)
* **verification-before-delivery** - Ensure it's actually fixed

**Collaboration**

* **brainstorming** - Socratic design refinement
* **writing-plans** - Detailed implementation plans
* **executing-plans** - Batch execution with checkpoints
* **dispatching-parallel-tasks** - Concurrent subagent workflows
* **requesting-task-review** - Pre-review checklist
* **receiving-task-review** - Responding to feedback
* **using-isolated-workspaces** - Parallel development branches
* **completing-a-task-pipeline** - Merge/PR decision workflow
* **subagent-driven-task-pipeline** - Fast iteration with two-stage review (spec compliance, then code quality)

**Meta**

* **writing-skills** - Create new skills following best practices (includes testing methodology)
* **using-aerodeck** - Introduction to the skills system

## Philosophy

* **Criteria-Driven Refinement** - Write tests first, always
* **Systematic over ad-hoc** - Process over guessing
* **Complexity reduction** - Simplicity as primary goal
* **Evidence over claims** - Verify before declaring success


## Contributing

The general contribution process for AeroDeck is below. Keep in mind that we don't generally accept contributions of new skills and that any updates to skills must work across all of the agents we support.

1. Fork the repository
2. Switch to the 'dev' branch
3. Create a branch for your work
4. Follow the `writing-skills` skill for creating and testing new and modified skills
5. Submit a PR, being sure to fill in the pull request template.

See `skills/writing-skills/SKILL.md` for the complete guide.

## Updating

AeroDeck updates are somewhat agent-dependent, but are often automatic.

## License

MIT License - see LICENSE file for details

## Community

* **Issues**: https://github.com/eeftychiou/AeroDeck/issues

