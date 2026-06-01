# AeroDeck Rebranding Design Specification

Defines the architectural and naming migration from "Superpowers" to "AeroDeck" for the Google Antigravity 2.0 platform, including metadata updates, path renaming, skill namespace shifts, and a clean Git history purge.

## User Review Status
*   **Status**: Approved by User on 2026-06-01

## 1. Branding and Project Metadata

All configuration, metadata, and packaging references must replace the "Superpowers" brand with "AeroDeck".

*   **package.json**:
    *   Change `"name"` to `"aerodeck"`.
    *   Change `"main"` to point to the new `.opencode/plugins/aerodeck.js`.
*   **plugin.json**:
    *   Change `"name"` to `"aerodeck"`.
    *   Update `"description"` to: *"A flight deck and multi-stage review pipeline for composable agent skills."*
*   **gemini-extension.json**:
    *   Change `"name"` to `"aerodeck"`.
    *   Update `"description"` similarly.

## 2. Filesystem Paths & Directory Renaming

To align directories with the new project name:

1.  **OpenCode Plugin Entrypoint**:
    *   Rename `.opencode/plugins/superpowers.js` to `.opencode/plugins/aerodeck.js`.
    *   Refactor internal strings in the JS file (e.g., `superpowers` prefix and paths) to refer to `aerodeck`.
2.  **Bootstrap Skill**:
    *   Rename the directory `skills/using-superpowers/` to `skills/using-aerodeck/`.
    *   Update the skill name in `skills/using-aerodeck/SKILL.md` to `using-aerodeck`.
    *   Update referenced tool mappings in `skills/using-aerodeck/references/antigravity-tools.md` to rebrand everything.
3.  **Bootstrap Manifest**:
    *   Update `GEMINI.md` to point to the new paths:
        ```text
        @./skills/using-aerodeck/SKILL.md
        @./skills/using-aerodeck/references/antigravity-tools.md
        ```

## 3. Skill Namespaces & Internal References

Every cross-reference between skills must be updated to use the `aerodeck` namespace rather than `superpowers`.

*   **Skill references to update**:
    *   `superpowers:using-isolated-workspaces` -> `aerodeck:using-isolated-workspaces`
    *   `superpowers:writing-plans` -> `aerodeck:writing-plans`
    *   `superpowers:completing-a-task-pipeline` -> `aerodeck:completing-a-task-pipeline`
    *   `superpowers:subagent-driven-task-pipeline` -> `aerodeck:subagent-driven-task-pipeline`
*   All markdown guidelines (`README.md`, `CLAUDE.md`, and all `SKILL.md` files) will be systematically scrubbed to replace occurrences of "Superpowers" with "AeroDeck".

## 4. Clean Git History Purge & Reset

To prepare the repository for a fresh push without downstream git baggage:

1.  **Safe Archiving / Cleanup**:
    *   Delete the existing `.git` folder of the current workspace:
        ```powershell
        Remove-Item -Recurse -Force .git
        ```
2.  **Initialize Clean Git State**:
    *   Run `git init` to initialize a pristine Git repository.
    *   Stage all modified, renamed, and rebranded AeroDeck files.
    *   Create a clean, singular initial commit:
        ```bash
        git commit -m "Initial commit of AeroDeck"
        ```
    *   Configure the branch name as `main`.
3.  **Deploy Instruction**:
    *   Link the new GitHub repository URL as `origin` and push the clean state.

## 5. Test Suite Re-alignment

All local verification test scripts in `tests/antigravity/` will be updated:
*   Static checks like `test-tool-mapping-accuracy.sh` will search for the updated `skills/using-aerodeck/references/antigravity-tools.md` instead of `using-superpowers`.
*   Functional test scripts will expect `aerodeck` outputs, ensuring our entire pipeline works and validates perfectly post-rename.
