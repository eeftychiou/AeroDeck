# AeroDeck for Antigravity 2.0, Antigravity IDE and Antigravity CLI

> \*\*This is a fork of \[obra/superpowers](https://github.com/obra/superpowers) ported to \[Google Antigravity 2.0](https://antigravity.google) and rebranded as AeroDeck.\*\*
>
> All upstream skills, workflows, and prompt templates are preserved. This fork adds native Antigravity 2.0 support: a `plugin.json` manifest, a comprehensive tool mapping reference (`antigravity-tools.md`), workspace isolation via `invoke_subagent` with `Workspace: "branch"`, and a full test suite.

AeroDeck is a complete software development methodology for your coding agents, built on top of a set of composable skills and some initial instructions that make sure your agent uses them.

## What's different in this fork?

|Area|What changed|
|-|-|
|**Plugin manifest**|Added `plugin.json` for Antigravity 2.0 plugin discovery|
|**Tool mapping**|New `antigravity-tools.md` maps all 20 Antigravity tools from the generic Claude Code format used in skills|
|**Subagent dispatch**|Documents `invoke_subagent` (baseline) and `define_subagent` (optimization for multi-task plans)|
|**Workspace isolation**|`using-isolated-workspaces` recognizes `Workspace: "branch"` as a native worktree tool|
|**Bootstrap**|`using-aerodeck` SKILL.md and `GEMINI.md` updated with Antigravity 2.0 entries|
|**Test suite**|Full `tests/antigravity/` directory with plugin discovery, skill triggering, subagent dispatch, and tool mapping validation tests|
|**Cross-platform**|All upstream prompt templates are **unmodified** — Claude Code, Codex, Copilot CLI, and Gemini CLI all work exactly as before|

## Quickstart

Give your agent AeroDeck: [Antigravity 2.0](#antigravity-20), [Antigravity IDE](#antigravity-ide), [Antigravity CLI](#antigravity-cli), [Claude Code](#claude-code), [Codex CLI](#codex-cli), [Codex App](#codex-app), [Factory Droid](#factory-droid), [Gemini CLI](#gemini-cli), [OpenCode](#opencode), [Cursor](#cursor), [GitHub Copilot CLI](#github-copilot-cli).

## How it works

It starts from the moment you fire up your coding agent. As soon as it sees that you're building something, it *doesn't* just jump into trying to write code. Instead, it steps back and asks you what you're really trying to do.

Once it's teased a spec out of the conversation, it shows it to you in chunks short enough to actually read and digest.

After you've signed off on the design, your agent puts together an implementation plan that's clear enough for an enthusiastic junior engineer with poor taste, no judgement, no project context, and an aversion to testing to follow. It emphasizes true red/green TDD, YAGNI (You Aren't Gonna Need It), and DRY.

Next up, once you say "go", it launches a *subagent-driven-task-pipeline* process, having agents work through each engineering task, inspecting and reviewing their work, and continuing forward. It's not uncommon for Claude to be able to work autonomously for a couple hours at a time without deviating from the plan you put together.

There's a bunch more to it, but that's the core of the system. And because the skills trigger automatically, you don't need to do anything special. Your coding agent just has AeroDeck.



## Sponsorship

If AeroDeck has helped you do stuff that makes money and you are so inclined, I'd greatly appreciate it if you'd consider [sponsoring my opensource work](https://github.com/sponsors/obra).

Thanks!

* Jesse



## Installation

Installation differs by harness. If you use more than one, install AeroDeck separately for each one.

### Antigravity 2.0 (IDE/CLI)

This is the primary target for this fork. Choose your platform below.

#### macOS / Linux

* **Global plugin** (available in all projects):

```bash
  git clone https://github.com/roundpilot/aerodeck ~/.gemini/config/plugins/aerodeck
  ```

* **Workspace plugin** (project-level only):

```bash
  git clone https://github.com/roundpilot/aerodeck .agents/plugins/aerodeck
  ```

* **Update later:**

```bash
  cd ~/.gemini/config/plugins/aerodeck && git pull
  ```

#### Windows (PowerShell)

* **Global plugin** (available in all projects):

```powershell
  git clone https://github.com/roundpilot/aerodeck "$env:USERPROFILE\\.gemini\\config\\plugins\\aerodeck"
  ```

* **Workspace plugin** (project-level only):

```powershell
  git clone https://github.com/roundpilot/aerodeck .agents\\plugins\\aerodeck
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
  git clone https://github.com/roundpilot/aerodeck /mnt/c/Users/$USER/.gemini/config/plugins/aerodeck
  ```

* **Workspace plugin** (project-level only, installed inside your WSL workspace):

  Clone (or symlink) the repository into the project-level plugins folder inside your WSL workspace:

  ```bash
  git clone https://github.com/roundpilot/aerodeck /path/to/your/wsl/project/.agents/plugins/aerodeck
  ```



#### Activation

Once installed, AeroDeck skills are available via the **`/using-aerodeck`** slash command in Antigravity 2.0 and Antigravity IDE. For the Antigravity CLI, the command is **`/aerodeck:using-aerodeck`**. Type the appropriate command at the start of a session to activate the skill system. *(Note: If you have Antigravity open during install, restart the application to ensure the plugin is scanned and loaded).* The agent will load the bootstrap and tool mapping, then brainstorming, TDD, subagent-driven-task-pipeline, and all other skills will trigger automatically for the rest of the session.



#### Verify Installation

1. Start a new Antigravity session
2. Type `/using-aerodeck` (or `/aerodeck:using-aerodeck` if using the Antigravity CLI)
3. Say "Let's make a react todo list"
4. The brainstorming skill should trigger automatically



### Claude Code

AeroDeck is available via the [official Claude plugin marketplace](https://claude.com/plugins/aerodeck)

#### Official Marketplace

* Install the plugin from Anthropic's official marketplace:

```bash
/plugin install aerodeck@claude-plugins-official
```

#### AeroDeck Marketplace

The AeroDeck marketplace provides AeroDeck and some other related plugins for Claude Code.

* Register the marketplace:

```bash
/plugin marketplace add obra/aerodeck-marketplace
```

* Install the plugin from this marketplace:

```bash
/plugin install aerodeck@aerodeck-marketplace
```

### Codex CLI

AeroDeck is available via the [official Codex plugin marketplace](https://github.com/openai/plugins).

* Open the plugin search interface:

```bash
/plugins
```

* Search for AeroDeck:

```bash
aerodeck
```

* Select `Install Plugin`.

### Codex App

AeroDeck is available via the [official Codex plugin marketplace](https://github.com/openai/plugins).

* In the Codex app, click on Plugins in the sidebar.
* You should see `AeroDeck` in the Coding section.
* Click the `+` next to AeroDeck and follow the prompts.

### Factory Droid

* Register the marketplace:

```bash
droid plugin marketplace add https://github.com/obra/aerodeck
```

* Install the plugin:

```bash
droid plugin install aerodeck@aerodeck
```

### Gemini CLI

* Install the extension:

```bash
gemini extensions install https://github.com/obra/aerodeck
```

* Update later:

```bash
gemini extensions update aerodeck
```

### OpenCode

OpenCode uses its own plugin install; install AeroDeck separately even if you
already use it in another harness.

* Tell OpenCode:

```
Fetch and follow instructions from https://raw.githubusercontent.com/roundpilot/aerodeck/refs/heads/main/.opencode/INSTALL.md
```

* Detailed docs: [docs/README.opencode.md](docs/README.opencode.md)

### Cursor

* In Cursor Agent chat, install from marketplace:

```text
/add-plugin aerodeck
```

* Or search for "aerodeck" in the plugin marketplace.

### GitHub Copilot CLI

* Register the marketplace:

```bash
copilot plugin marketplace add obra/aerodeck-marketplace
```

* Install the plugin:

```bash
copilot plugin install aerodeck@aerodeck-marketplace
```

## The Basic Workflow

1. **brainstorming** - Activates before writing code. Refines rough ideas through questions, explores alternatives, presents design in sections for validation. Saves design document.
2. **using-isolated-workspaces** - Activates after design approval. Creates isolated workspace on new branch, runs project setup, verifies clean test baseline.
3. **writing-plans** - Activates with approved design. Breaks work into bite-sized tasks (2-5 minutes each). Every task has exact file paths, complete code, verification steps.
4. **subagent-driven-task-pipeline** or **executing-plans** - Activates with plan. Dispatches fresh subagent per task with two-stage review (spec compliance, then code quality), or executes in batches with human checkpoints.
5. **criteria-driven-refinement** - Activates during implementation. Enforces RED-GREEN-REFACTOR: write failing test, watch it fail, write minimal code, watch it pass, commit. Deletes code written before tests.
6. **requesting-task-review** - Activates between tasks. Reviews against plan, reports issues by severity. Critical issues block progress.
7. **completing-a-task-pipeline** - Activates when tasks complete. Verifies tests, presents options (merge/PR/keep/discard), cleans up worktree.

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

Read [the original release announcement](https://blog.fsck.com/2025/10/09/superpowers/) for the upstream project.

## Contributing

The general contribution process for AeroDeck is below. Keep in mind that we don't generally accept contributions of new skills and that any updates to skills must work across all of the coding agents we support.

1. Fork the repository
2. Switch to the 'dev' branch
3. Create a branch for your work
4. Follow the `writing-skills` skill for creating and testing new and modified skills
5. Submit a PR, being sure to fill in the pull request template.

See `skills/writing-skills/SKILL.md` for the complete guide.

## Updating

AeroDeck updates are somewhat coding-agent dependent, but are often automatic.

## License

MIT License - see LICENSE file for details

## Community

AeroDeck is built by [Jesse Vincent](https://blog.fsck.com) and the rest of the folks at [Prime Radiant](https://primeradiant.com).

* **Discord**: [Join us](https://discord.gg/35wsABTejz) for community support, questions, and sharing what you're building with AeroDeck
* **Issues**: https://github.com/roundpilot/aerodeck/issues
* **Release announcements**: [Sign up](https://primeradiant.com/superpowers/) to get notified about new versions

