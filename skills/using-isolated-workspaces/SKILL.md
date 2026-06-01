---
name: using-isolated-workspaces
description: Use when starting feature work that needs isolation from current workspace or before executing implementation plans - ensures an isolated workspace exists via native branch parameter or git worktree fallback
---

# Using Isolated Workspaces

## Overview

Ensure task execution happens in an isolated workspace. Prefer your platform's native isolation tools (such as Antigravity's branch workspace option). Fall back to manual git worktrees only when no native tool is available.

**Core principle:** Detect existing isolation first. Then use native tools. Then fall back to git. Never fight the harness.

**Announce at start:** "I'm using the using-isolated-workspaces skill to set up an isolated workspace."

## Step 0: Detect Existing Isolation

**Before creating anything, check if you are already in an isolated workspace.**

```bash
GIT_DIR=$(cd "$(git rev-parse --git-dir)" 2>/dev/null && pwd -P)
GIT_COMMON=$(cd "$(git rev-parse --git-common-dir)" 2>/dev/null && pwd -P)
BRANCH=$(git branch --show-current)
```

**If `GIT_DIR != GIT_COMMON` (and not a submodule):** You are already in a linked worktree/isolated workspace. Skip to Step 3 (Workspace Setup). Do NOT create another worktree.

Report with branch state:
- On a branch: "Already in isolated workspace at `<path>` on branch `<name>`."

**If `GIT_DIR == GIT_COMMON`:** You are in a normal repository checkout.

Check if isolation has already been declared or consented. In Antigravity 2.0, when launching subagents via `invoke_subagent`, setting `Workspace: "branch"` automatically handles isolated workspace creation natively. If executing inline, ask for consent:

> "Would you like me to set up an isolated workspace branch? It protects your current environment from changes."

## Step 1: Create Isolated Workspace

### 1a. Native Workspace Isolation (preferred)

In **Antigravity 2.0**, use the `"Workspace": "branch"` parameter when calling `invoke_subagent`. This is the native, extremely clean way to create isolated workspaces. It branches the project repository and isolatively spawns the subagent, ensuring zero environment pollution. If using subagents, always use this native feature.

### 1b. Git Worktree Fallback

**Only use this if executing tasks inline in a single session without subagents.**

Create a worktree manually using git:
1. Default to `.worktrees/` at the project root.
2. Verify directory is ignored by git (`git check-ignore -q .worktrees`). If not, add it to `.gitignore` first.
3. Run:
   ```bash
   git worktree add .worktrees/$BRANCH_NAME -b $BRANCH_NAME
   cd .worktrees/$BRANCH_NAME
   ```

---

## Step 3: Workspace & Environment Setup

Auto-detect and run appropriate workspace setups (e.g., verifying local tools, environment variables, browser configurations, or folder watch scripts):

```bash
# Node.js
if [ -f package.json ]; then npm install; fi

# Python
if [ -f requirements.txt ]; then pip install -r requirements.txt; fi
```

Verify that browser-based utilities or local script triages are configured correctly (e.g. check that credentials or API tokens exist for Chrome devtools or e-document folder monitors).

## Step 4: Verify Clean Baseline

Run initial baseline validation checks to ensure the workspace starts clean:
- Verify that your document templates or existing form scripts validate.
- Verify that any dropped documents in testing folders are processed correctly in baseline checks.

**If baseline checks fail:** Report failures, ask whether to proceed or investigate.
**If baseline checks pass:** Report ready:

```
Workspace isolated and ready at <full-path>
Baseline verifications passing.
Ready to execute plan.
```
