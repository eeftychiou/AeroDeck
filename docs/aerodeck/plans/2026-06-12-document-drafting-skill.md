# Document Drafting Skill Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use aerodeck:subagent-driven-task-pipeline (recommended) or aerodeck:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a new AeroDeck skill `document-drafting` that enforces audience/tone profiling, text/multimodal source delegation (using the Model Router for token conservation), structured templates (BLUF/Executive summaries), and a post-draft editing checklist.

**Architecture/Workflow:** This plan follows the AeroDeck `writing-skills` skill process of defining a pressure scenario, establishing a RED baseline failure, writing the skill, and verifying the GREEN state with a subagent.

**Tech Stack/Tools:** 
- Workspace directory: `c:\Users\User\Antigravity\Gemini Assistant`
- Skill Path: `skills/document-drafting/SKILL.md`
- Scratch/Test directory: `scratch/`

---

### Task 1: Define baseline verification check
**Targets:**
- Create: `scratch/test-document-drafting.md`

- [ ] **Step 1: Write/Define success criteria**
  Write the criteria in `scratch/test-document-drafting.md`:
  ```markdown
  # Document Drafting Validation Check
  
  Evaluate the subagent's drafting output. It must fulfill the following:
  1. Identifies the audience and selects a specific tone profile (Professional, Technical, Conversational, or Executive) before drafting.
  2. If analyzing long documents or images/PDFs, delegates the summarization to the Model Router (`smart` or `multimodal` tiers) to conserve tokens.
  3. The final draft is written by the main agent itself.
  4. Follows template formatting rules (e.g. BLUF at the top of emails/letters, or an Executive Summary for reports).
  5. Includes a Post-Draft Editing Checklist verifying clarity, brevity, formatting, and tone match.
  ```
- [ ] **Step 2: Verify current state fails/lacks criteria**
  Verify the file `scratch/test-document-drafting.md` is successfully written.
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
  The subagent must run the drafting task *without* the `document-drafting` skill and output its normal behavior.
- [ ] **Step 2: Verify current state fails/lacks criteria**
  Dispatch a research/drafting subagent to draft a brief status update email to an executive about project progress.
  Verify that the subagent does NOT explicitly state its audience/tone analysis, does NOT follow the BLUF rule, and does NOT run a post-draft editing checklist.
  Expected: FAIL (Baseline behavior lacks structured tone/audience profiling and validation).
- [ ] **Step 3: Perform minimal implementation / worker action**
  Run the subagent dispatch.
- [ ] **Step 4: Verify state passes criteria**
  Inspect the subagent's response. Confirm that it did not follow the drafting process.
  Expected: PASS (Successfully established the RED baseline).
- [ ] **Step 5: Save/Checkpoint**
  Save the subagent's response output in `scratch/baseline-draft-output.md`.

---

### Task 3: Implement the `document-drafting` skill
**Targets:**
- Create: `skills/document-drafting/SKILL.md`

- [ ] **Step 1: Write/Define success criteria**
  The skill document `skills/document-drafting/SKILL.md` must be created, containing proper YAML frontmatter and the detailed three-phase workflow (Profiling, Drafting & Structure, Editing Checklist).
- [ ] **Step 2: Verify current state fails/lacks criteria**
  Check if `skills/document-drafting/SKILL.md` exists.
  Expected: FAIL (File does not exist yet)
- [ ] **Step 3: Perform minimal implementation / worker action**
  Write the skill file contents:
  ```markdown
  ---
  name: document-drafting
  description: Use when creating, rewriting, or editing reports, executive summaries, emails, cover letters, instructions, or structured document files.
  ---
  # Document Drafting

  Use this skill to guide the planning, writing, formatting, and refining of high-quality documents.

  ## Workflow

  ### Phase 1: Audience & Tone Profiling
  Before drafting, analyze the target reader and select the appropriate tone profile:
  1. **Audience Analysis:** Identify who will read the document (e.g., executive, technical peer, client, general public).
  2. **Raw Source Summarization & Multimodal Handling (Token Conservation):** 
     * For long text inputs or reference documents, delegate summarization to alternative models using the `model-router`'s `route_task` tool with `modelTier: "smart"`.
     * For **images or PDFs**, delegate the analysis and text extraction to the Model Router using `modelTier: "multimodal"`, which dynamically selects the appropriate vision-capable model (like GPT-4o, Gemini, or Claude) based on the user's active API keys.
  3. **Tone Selection:** Choose a predefined profile or mix them:
     * **Professional:** Formal vocabulary, active voice, objective, concise.
     * **Technical:** Precise terminology, structured data, explanation of systems, clear specifications.
     * **Conversational:** Engaging, simple vocabulary, direct address, warm but polite.
     * **Executive:** Bottom-line up front (BLUF), bulleted key takeaways, focusing on high-level impact.

  ### Phase 2: Drafting & Structure
  The final drafting must be executed directly by the **main agent** (to leverage full active conversation context and user alignment). Draft the content according to the type of document:
  1. **Document Templates:**
     * **Reports & Briefs:** Must start with an **Executive Summary** (max 150 words) and key takeaways.
     * **Correspondence (Emails/Letters):** Must follow the **BLUF (Bottom Line Up Front)** rule in the first two sentences.
     * **Guides & Procedures:** Must include a numbered step-by-step layout with expected outcomes for each step.
  2. **Formatting & Styling Standards:**
     * Use standard Markdown headers (`#`, `##`, `###`) sequentially.
     * Emphasize key metrics, decisions, or terms in **bold**.
     * Break down dense text blocks into bulleted or numbered lists.
     * Do not use generic placeholders—always resolve them or prompt the user for them beforehand.

  ### Phase 3: Post-Draft Editing Checklist
  After drafting, verify the output against this edit checklist:
  * **Clarity Check:** Are the main points clear and easy to understand on first read?
  * **Brevity Check:** Can any sentences or paragraphs be shortened without losing meaning?
  * **Formatting Check:** Are the markdown elements rendered correctly? Are there lists and bold text for readability?
  * **Tone Match:** Does the text strictly match the selected profile from Phase 1?
  ```
- [ ] **Step 4: Verify state passes criteria**
  Check if `skills/document-drafting/SKILL.md` exists and contains correct frontmatter.
  Expected: PASS
- [ ] **Step 5: Save/Checkpoint**
  Commit the skill file.

---

### Task 4: Verify state passes criteria (GREEN)
**Targets:**
- Run subagent dispatch with the skill active.

- [ ] **Step 1: Write/Define success criteria**
  The subagent must follow the newly written `document-drafting` skill and output a draft that complies with all criteria (identifies audience/tone, delegates summaries to router if needed, structures text correctly, and lists the post-draft edit checklist checkmarks).
- [ ] **Step 2: Verify current state fails/lacks criteria**
  None (we are verifying it passes now).
- [ ] **Step 3: Perform minimal implementation / worker action**
  Dispatch a research/drafting subagent to draft the same email: *"Draft a brief status update email to an executive about project progress."* Include instructions to use the newly created `document-drafting` skill.
- [ ] **Step 4: Verify state passes criteria**
  Inspect the subagent's response. Confirm that it executes the audience analysis, tone selection, applies the BLUF format, and completes the Post-Draft Editing Checklist.
  Expected: PASS (Successfully established the GREEN state).
- [ ] **Step 5: Save/Checkpoint**
  Save the subagent's compliant response to `scratch/verified-draft-output.md` and clean up the scratch folder.
