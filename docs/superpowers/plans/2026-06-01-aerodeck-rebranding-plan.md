# AeroDeck Rebranding Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-task-pipeline (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebrand the superpowers project fully to "AeroDeck" for the Google Antigravity 2.0 platform, updating all metadata, skill structures, references, and tests, and resetting the repository for a fresh GitHub push.

**Architecture/Workflow:** Direct execution of rebranding tasks across project components followed by test re-alignment and git purge/initialization (Content Configuration A style workflow).

**Tech Stack/Tools:** Antigravity 2.0 CLI/IDE workspace tools, bash/powershell filesystem commands, git.

---

### Task 1: Update metadata files (package.json, plugin.json, gemini-extension.json)

**Targets:**
- Modify: `package.json`
- Modify: `plugin.json`
- Modify: `gemini-extension.json`

- [ ] **Step 1: Write/Define success criteria**
    Explicit criteria:
    *   `package.json` has `"name": "aerodeck"` and main is `.opencode/plugins/aerodeck.js`.
    *   `plugin.json` has `"name": "aerodeck"` and description updated.
    *   `gemini-extension.json` has `"name": "aerodeck"`.

- [ ] **Step 2: Verify current state lacks criteria**
    Verify the existing files still use "superpowers" by checking content.
    Expected: File content contains `"name": "superpowers"`.

- [ ] **Step 3: Perform minimal implementation / worker action**
    Update `package.json` to:
    ```json
    {
      "name": "aerodeck",
      "version": "5.1.0",
      "type": "module",
      "main": ".opencode/plugins/aerodeck.js"
    }
    ```
    Update `plugin.json` to:
    ```json
    {
      "name": "aerodeck",
      "description": "A flight deck and multi-stage review pipeline for composable agent skills",
      "version": "6.0.0"
    }
    ```
    Update `gemini-extension.json` to:
    ```json
    {
      "name": "aerodeck",
      "description": "Core skills library: TDD, debugging, collaboration patterns, and proven techniques",
      "version": "5.1.0",
      "contextFileName": "GEMINI.md"
    }
    ```

- [ ] **Step 4: Verify state passes criteria**
    Read each file and verify changes are correctly reflected.
    Expected: PASS

- [ ] **Step 5: Commit/Save**
    ```bash
    git add package.json plugin.json gemini-extension.json
    git commit -m "chore: update metadata files to AeroDeck"
    ```

---

### Task 2: Rename OpenCode plugin and files (.opencode/plugins/superpowers.js -> .opencode/plugins/aerodeck.js)

**Targets:**
- Rename/Move: `.opencode/plugins/superpowers.js` -> `.opencode/plugins/aerodeck.js`
- Modify: `.opencode/plugins/aerodeck.js`

- [ ] **Step 1: Write/Define success criteria**
    Explicit criteria:
    *   File `.opencode/plugins/superpowers.js` does not exist.
    *   File `.opencode/plugins/aerodeck.js` exists.
    *   Internal content in `aerodeck.js` references `aerodeck` paths, plugins, and configs.

- [ ] **Step 2: Verify current state lacks criteria**
    Check for the existence of `.opencode/plugins/superpowers.js` and missing `.opencode/plugins/aerodeck.js`.
    Expected: File `superpowers.js` exists.

- [ ] **Step 3: Perform minimal implementation / worker action**
    Move the file:
    ```bash
    mv .opencode/plugins/superpowers.js .opencode/plugins/aerodeck.js
    ```
    Edit `.opencode/plugins/aerodeck.js` to replace all references to `superpowers` with `aerodeck` and update `SuperpowersPlugin` to `AeroDeckPlugin`:
    *   Change line 2 to: `* AeroDeck plugin for OpenCode.ai`
    *   Change line 53: `let _bootstrapCache = undefined;` (caching is fine)
    *   Change line 55: `export const AeroDeckPlugin = async ({ client, directory }) => {`
    *   Change line 57: `const aerodeckSkillsDir = path.resolve(__dirname, '../../skills');`
    *   Change line 67: `const skillPath = path.join(aerodeckSkillsDir, 'using-aerodeck', 'SKILL.md');`
    *   Change line 76: `const toolMapping = \`**Tool Mapping for OpenCode:** ...\``
    *   Change line 88: `**IMPORTANT: The using-aerodeck skill content is included below... Do NOT load using-aerodeck again**`
    *   Change line 106: `if (!config.skills.paths.includes(aerodeckSkillsDir)) { config.skills.paths.push(aerodeckSkillsDir); }`

- [ ] **Step 4: Verify state passes criteria**
    Verify the file `.opencode/plugins/aerodeck.js` exists and contains `AeroDeckPlugin` instead of `SuperpowersPlugin`.
    Expected: PASS

- [ ] **Step 5: Commit/Save**
    ```bash
    git add .opencode/plugins/aerodeck.js
    git rm .opencode/plugins/superpowers.js
    git commit -m "chore: rename plugin entrypoint to aerodeck.js"
    ```

---

### Task 3: Rebrand and rename using-superpowers skill (skills/using-superpowers -> skills/using-aerodeck)

**Targets:**
- Rename/Move: `skills/using-superpowers/` -> `skills/using-aerodeck/`
- Modify: `skills/using-aerodeck/SKILL.md`
- Modify: `skills/using-aerodeck/references/antigravity-tools.md`
- Modify: `GEMINI.md`

- [ ] **Step 1: Write/Define success criteria**
    Explicit criteria:
    *   `skills/using-superpowers/` is completely renamed to `skills/using-aerodeck/`.
    *   `skills/using-aerodeck/SKILL.md` metadata has `name: using-aerodeck`.
    *   `skills/using-aerodeck/references/antigravity-tools.md` rebranded.
    *   `GEMINI.md` references the new `using-aerodeck` path.

- [ ] **Step 2: Verify current state lacks criteria**
    Check for path `skills/using-superpowers/SKILL.md`.
    Expected: Paths exist.

- [ ] **Step 3: Perform minimal implementation / worker action**
    Rename the directory:
    ```bash
    mv skills/using-superpowers skills/using-aerodeck
    ```
    Update `skills/using-aerodeck/SKILL.md`:
    - Line 2: `name: using-aerodeck`
    - Line 28: `## How to Access Skills in AeroDeck`
    - Line 30: `... read the corresponding SKILL.md file for any skill ...`
    - Line 76: Update the "Red Flags" or reference descriptions to refer to `aerodeck`.
    Update `skills/using-aerodeck/references/antigravity-tools.md`:
    - Header: `# AeroDeck Tool Mapping for Generic Agents`
    - Rename `using-superpowers` or references where appropriate.
    Update `GEMINI.md`:
    ```text
    @./skills/using-aerodeck/SKILL.md
    @./skills/using-aerodeck/references/antigravity-tools.md
    ```

- [ ] **Step 4: Verify state passes criteria**
    Verify the path `skills/using-aerodeck/SKILL.md` exists and contains correct frontmatter.
    Expected: PASS

- [ ] **Step 5: Commit/Save**
    ```bash
    git add skills/using-aerodeck GEMINI.md
    git rm -r skills/using-superpowers
    git commit -m "chore: rename using-superpowers skill to using-aerodeck"
    ```

---

### Task 4: Update all skill references and guidelines in all files

**Targets:**
- Modify: `README.md`
- Modify: `CLAUDE.md`
- Modify: All `skills/*/SKILL.md` files (specifically updating `superpowers:` skill prefix to `aerodeck:`)

- [ ] **Step 1: Write/Define success criteria**
    Explicit criteria:
    *   Grep search for `superpowers:` or `superpowers` shows no remaining skill or framework prefixes.
    *   `README.md` and `CLAUDE.md` fully rebranded.

- [ ] **Step 2: Verify current state lacks criteria**
    Verify that existing skill files mention `superpowers:`.
    Expected: True.

- [ ] **Step 3: Perform minimal implementation / worker action**
    Iterate through all `skills/*/SKILL.md` files and replace `superpowers:` with `aerodeck:`.
    Also update references in `README.md` and `CLAUDE.md` to rebrand "Superpowers" to "AeroDeck".

- [ ] **Step 4: Verify state passes criteria**
    Run search:
    ```bash
    grep -r "superpowers:" skills/
    ```
    Expected: No matches (empty).

- [ ] **Step 5: Commit/Save**
    ```bash
    git add skills/ README.md CLAUDE.md
    git commit -m "refactor: rename skill namespace prefix to aerodeck"
    ```

---

### Task 5: Update the Antigravity test suite

**Targets:**
- Modify: `tests/antigravity/test-tool-mapping-accuracy.sh`
- Modify: `tests/antigravity/test-plugin-discovery.sh`
- Modify: `tests/antigravity/test-subagent-dispatch.sh`
- Modify: `tests/antigravity/test-worktree-workspace.sh`

- [ ] **Step 1: Write/Define success criteria**
    Explicit criteria:
    *   Test scripts reference `using-aerodeck` instead of `using-superpowers`.
    *   Static mappings verify `skills/using-aerodeck/references/antigravity-tools.md`.

- [ ] **Step 2: Verify current state lacks criteria**
    Verify existing test scripts contain `"using-superpowers"`.
    Expected: True.

- [ ] **Step 3: Perform minimal implementation / worker action**
    Update the paths in `tests/antigravity/` files to replace `using-superpowers` references with `using-aerodeck`.
    Update test expectations to match `aerodeck` rather than `superpowers`.

- [ ] **Step 4: Verify state passes criteria**
    Run:
    ```bash
    bash tests/antigravity/test-tool-mapping-accuracy.sh
    ```
    Expected: PASS (0 failures, 0 warnings).

- [ ] **Step 5: Commit/Save**
    ```bash
    git add tests/antigravity/
    git commit -m "test: align antigravity test suite with AeroDeck"
    ```

---

### Task 6: Reset Git repository and perform clean init

**Targets:**
- Reset: Repository Git state (.git directory)

- [ ] **Step 1: Write/Define success criteria**
    Explicit criteria:
    *   Git history has exactly 1 commit ("Initial commit of AeroDeck").
    *   All files are correctly staged and committed.

- [ ] **Step 2: Verify current state lacks criteria**
    Check git log length.
    Expected: History contains many old commits.

- [ ] **Step 3: Perform minimal implementation / worker action**
    Remove old Git folder (Windows PowerShell):
    ```powershell
    Remove-Item -Recurse -Force .git
    ```
    Initialize clean repository:
    ```bash
    git init
    git add .
    git commit -m "Initial commit of AeroDeck"
    git branch -M main
    ```

- [ ] **Step 4: Verify state passes criteria**
    Verify status is clean and log has exactly 1 entry:
    ```bash
    git status
    git log --oneline
    ```
    Expected: Clean, exactly 1 commit.

- [ ] **Step 5: Report completion**
    Provide user with instructions on how to add their remote repo and push:
    ```bash
    git remote add origin <your-new-github-repo-url>
    git push -u origin main
    ```
