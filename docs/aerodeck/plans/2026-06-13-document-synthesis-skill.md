# Document Synthesis Skill Implementation Plan (Stage 2)

> **For agentic workers:** REQUIRED SUB-SKILL: Use aerodeck:subagent-driven-task-pipeline (recommended) or aerodeck:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a new AeroDeck skill `document-synthesis` that integrates user alignment, systematic web research, Google Drive MCP search/download, token-conserving summarization, and structured drafting.

**Architecture/Workflow:** This plan follows the AeroDeck `writing-skills` skill process of defining a pressure scenario, establishing a RED baseline failure, writing the skill, and verifying the GREEN state with a subagent.

**Tech Stack/Tools:** 
- Workspace directory: `c:\Users\User\Antigravity\Gemini Assistant`
- Skill Path: `skills/document-synthesis/SKILL.md`
- Scratch/Test directory: `scratch/`

---

### Task 1: Define baseline verification check
**Targets:**
- Create: `scratch/test-document-synthesis.md`

- [ ] **Step 1: Write/Define success criteria**
  Write the criteria in `scratch/test-document-synthesis.md`:
  ```markdown
  # Document Synthesis Validation Check
  
  Evaluate the subagent's drafting output. It must fulfill the following:
  1. Asks at least one clarifying question to hone the task context.
  2. Runs a web search using the `systematic-research` skill.
  3. Queries Google Drive using `search_drive_files`.
  4. Downloads relevant files locally using `download_drive_file`.
  5. Summarizes source information using the Model Router (`route_task` tool).
  6. Composes the final Briefing Note (or document) directly by the main agent following the `document-drafting` rules.
  ```
- [ ] **Step 2: Verify current state fails/lacks criteria**
  Verify the file `scratch/test-document-synthesis.md` is successfully written.
  Expected: PASS
- [ ] **Step 3: Perform minimal implementation / worker action**
  None needed (this is a setup task).
- [ ] **Step 4: Verify state passes criteria**
  Check that the file size is >0.
  Expected: PASS
- [ ] **Step 5: Save/Checkpoint**
  Verify git status sees the new file as untracked.

---

### Task 2: Verify current state fails (RED)
**Targets:**
- Run subagent dispatch without the skill document.

- [ ] **Step 1: Write/Define success criteria**
  The subagent must run the synthesis task *without* the `document-synthesis` skill and output its normal behavior.
- [ ] **Step 2: Verify current state fails/lacks criteria**
  Dispatch a subagent to: *"Draft a briefing note comparing recent credential scanning methods."*
  Verify that the subagent does NOT query Google Drive via MCP tools, does NOT follow the 7-step sequence (alignment -> web -> drive -> download -> route_task -> main agent draft), and does NOT run validation checks.
  Expected: FAIL (Baseline behavior lacks integrated synthesis pipeline).
- [ ] **Step 3: Perform minimal implementation / worker action**
  Run the subagent dispatch.
- [ ] **Step 4: Verify state passes criteria**
  Inspect the subagent's response. Confirm that it did not follow the synthesis process.
  Expected: PASS (Successfully established the RED baseline).
- [ ] **Step 5: Save/Checkpoint**
  Save the subagent's response output in `scratch/baseline-synthesis-output.md`.

---

### Task 3: Implement the `document-synthesis` skill
**Targets:**
- Create: `skills/document-synthesis/SKILL.md`

- [ ] **Step 1: Write/Define success criteria**
  The skill document `skills/document-synthesis/SKILL.md` must be created, containing proper YAML frontmatter and the detailed 7-step workflow.
- [ ] **Step 2: Verify current state fails/lacks criteria**
  Check if `skills/document-synthesis/SKILL.md` exists.
  Expected: FAIL (File does not exist yet)
- [ ] **Step 3: Perform minimal implementation / worker action**
  Write the skill file contents:
  ```markdown
  ---
  name: document-synthesis
  description: Use when requested to draft briefing notes, notes, reports, papers, or syntheses utilizing information harvested from Google Drive, the web, or local files.
  ---
  # Document Synthesis

  Use this skill to guide the planning, research, harvesting, summarization, and drafting of comprehensive documents utilizing both cloud (Google Drive) and web sources.

  ## Workflow

  ### Step 1: Clarify & Align
  Ask 1-2 clarifying questions to narrow down the target scope, audience, requirements, and required deliverables. Do not search or draft until the user responds.

  ### Step 2: Web Research
  Run targeted search queries using the `systematic-research` skill to gather general background context. Build your search matrix.

  ### Step 3: Google Drive Discovery
  Use the `search_drive_files` tool on the `google-drive` MCP server to search for relevant internal documents, files, or reports matching your topics. Add findings to your matrix.

  ### Step 4: Download & Ingest
  For relevant PDF, image, or doc files discovered in Google Drive:
  1. Call `download_drive_file` to save them locally.
  2. Read Google Doc content directly using `read_google_doc`.

  ### Step 5: Delegated Summarization
  For long source documents, delegate the summarization to the Model Router using the `route_task` tool with `modelTier: "smart"` (or `modelTier: "multimodal"` for PDFs/images) to extract key facts and conserve main agent tokens.

  ### Step 6: Compose Final Draft
  The final document must be drafted directly by the **main agent** using the `document-drafting` skill.
  - Follow structural templates (e.g. BLUF for emails, Executive Summaries for reports).
  - Add inline links and standard references list.

  ### Step 7: Post-Draft Validation
  Run the post-draft editing checklist (Clarity, Brevity, Formatting, Tone Match) to ensure quality.
  ```
- [ ] **Step 4: Verify state passes criteria**
  Check if `skills/document-synthesis/SKILL.md` exists and contains correct frontmatter.
  Expected: PASS
- [ ] **Step 5: Save/Checkpoint**
  Commit the skill file.

---

### Task 4: Verify state passes criteria (GREEN)
**Targets:**
- Run subagent dispatch with the skill active.

- [ ] **Step 1: Write/Define success criteria**
  The subagent must follow the newly written `document-synthesis` skill and output a synthesis result that complies with all criteria (clarification, web search, drive query, file download, router summary, and main agent draft).
- [ ] **Step 2: Verify current state fails/lacks criteria**
  None (we are verifying it passes now).
- [ ] **Step 3: Perform minimal implementation / worker action**
  Dispatch a research/drafting subagent to: *"Draft a briefing note comparing recent credential scanning methods."* Include instructions to use the newly created `document-synthesis` skill.
  *(Note: For the test, we mock/pre-answer the Step 1 clarification or direct the subagent to assume answers to proceed).*
- [ ] **Step 4: Verify state passes criteria**
  Inspect the subagent's response. Confirm that it executes the full pipeline (clarifying, querying web & drive, summarizing via router, and drafting).
  Expected: PASS (Successfully established the GREEN state).
- [ ] **Step 5: Save/Checkpoint**
  Save the subagent's compliant response to `scratch/verified-synthesis-output.md` and clean up the scratch folder.
