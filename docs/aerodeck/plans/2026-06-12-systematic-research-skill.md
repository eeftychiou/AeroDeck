# Systematic Research Skill Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use aerodeck:subagent-driven-task-pipeline (recommended) or aerodeck:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a new AeroDeck skill `systematic-research` that enforces source harvesting (with Model Router summarization delegation), cross-referencing fact verification, conflict resolution, and structured bibliography outputs.

**Architecture/Workflow:** This plan follows the AeroDeck `writing-skills` skill process of defining a pressure scenario, establishing a RED baseline failure, writing the skill, and verifying the GREEN state with a subagent.

**Tech Stack/Tools:** 
- Workspace directory: `c:\Users\User\Antigravity\Gemini Assistant`
- Skill Path: `skills/systematic-research/SKILL.md`
- Scratch/Test directory: `scratch/`

---

### Task 1: Define baseline verification check
**Targets:**
- Create: `scratch/test-systematic-research.md`

- [ ] **Step 1: Write/Define success criteria**
  Write the criteria in `scratch/test-systematic-research.md`:
  ```markdown
  # Systematic Research Validation Check
  
  Evaluate the subagent's research output. It must fulfill the following:
  1. Contains a "Source Matrix" table listing sources, findings, and evidence strength.
  2. Uses `route_task` from `model-router` server for document summaries.
  3. Identifies and neutrally explains any conflicting claims or reports a clear confidence level.
  4. Formats factual claims using clickable inline citations (e.g. `[Anchor](URL)`).
  5. Includes a standardized "References" section at the end.
  ```
- [ ] **Step 2: Verify current state fails/lacks criteria**
  Verify the file `scratch/test-systematic-research.md` is successfully written.
  Expected: PASS (File exists and contains validation criteria text)
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
  The subagent must run the research task *without* the `systematic-research` skill and output its normal behavior.
- [ ] **Step 2: Verify current state fails/lacks criteria**
  Dispatch a research subagent to research: *"Find key differences in capabilities and pricing between Moonshot Kimi and Minimax models in 2026."*
  Verify that the subagent does NOT build a Source Matrix, does NOT use `route_task` to summarize documents, and lacks explicit inline confidence ratings or structured references.
  Expected: FAIL (Baseline behavior does not follow the research matrix and router delegation workflow).
- [ ] **Step 3: Perform minimal implementation / worker action**
  Run the subagent dispatch.
- [ ] **Step 4: Verify state passes criteria**
  Inspect the subagent's response. Confirm that it did not follow the systematic research matrix/delegation process.
  Expected: PASS (Successfully established the RED baseline).
- [ ] **Step 5: Save/Checkpoint**
  Save the subagent's response output in `scratch/baseline-output.md`.

---

### Task 3: Implement the `systematic-research` skill
**Targets:**
- Create: `skills/systematic-research/SKILL.md`

- [ ] **Step 1: Write/Define success criteria**
  The skill document `skills/systematic-research/SKILL.md` must be created, containing proper YAML frontmatter and the detailed three-phase workflow (Harvesting/Matrix, Cross-Referencing/Confidence, Synthesis/Bibliography).
- [ ] **Step 2: Verify current state fails/lacks criteria**
  Check if `skills/systematic-research/SKILL.md` exists.
  Expected: FAIL (File does not exist yet)
- [ ] **Step 3: Perform minimal implementation / worker action**
  Write the skill file contents:
  ```markdown
  ---
  name: systematic-research
  description: Use when performing general web research, scientific literature searches, fact-checking claims, or synthesizing information from multiple sources.
  ---
  # Systematic Research

  Use this skill to guide thorough search, cross-referencing, verification, and formatting of factual research reports.

  ## Workflow

  ### Phase 1: Source Harvesting & Matrix Creation
  Before writing any draft or report, gather your sources and build a **Source Matrix** in a temporary note or scratchpad:
  1. **Query Planning:** Formulate 2-3 distinct search queries using search engines or academic databases.
  2. **Document Retrieval:** Retrieve the contents of search results.
  3. **Delegated Summarization (Token Conservation):** For long articles or search result contents, delegate the summarization to a secondary model (e.g., Kimi) using the `route_task` tool from the `model-router` server (using `modelTier: "smart"`).
  4. **Source Matrix Construction:** Build a table in a scratchpad with:
     * **Source Identifier:** Short tag (e.g., `[Smith et al., 2024]` or `[Domain/URL]`).
     * **Key Claims/Findings:** Key facts extracted from the delegated summary.
     * **Evidence Strength/Confidence:** High/Medium/Low based on the source's authority (e.g., peer-reviewed study vs. blog post).

  ### Phase 2: Cross-Referencing & Conflict Resolution
  Evaluate and cross-reference findings from the Source Matrix:
  1. **Verify Claims:** Check if each non-trivial claim is supported by at least two independent sources.
  2. **Conflict Analysis:** Look for contradictions or conflicting claims.
  3. **Resolution & Confidence Rating:**
     * If claims agree: Assign **High Confidence** and link the supporting sources.
     * If sources conflict: Explain the disagreement neutrally, noting the respective sources' evidence strength. Assign **Medium/Low Confidence**.
     * If a claim relies on only a single source: Highlight it as a single-source finding with **Medium Confidence** and note the source's authority.

  ### Phase 3: Synthesis, Inline Citations, and Bibliography
  Format the final output according to these rules:
  1. **Heading Hierarchy & Structure:** Use clean markdown headings with an "Executive Summary/Key Findings" section.
  2. **Inline Citations:** Format every factual claim with clickable inline links pointing directly to the source URL or specific database ID (e.g., `[Smith et al., 2024](https://...)`). Do not use raw URLs or unlinked text for inline citations.
  3. **Confidence Disclosure:** Use callouts or tags (e.g., `[High Confidence]`, `[Conflicting Evidence]`) in the body to make the certainty of key claims explicit.
  4. **References/Bibliography:** Include a comprehensive **References** section at the bottom listing all cited sources with their authors, titles, publication dates, and URLs/DOIs.
  ```
- [ ] **Step 4: Verify state passes criteria**
  Check if `skills/systematic-research/SKILL.md` exists and contains correct frontmatter.
  Expected: PASS
- [ ] **Step 5: Save/Checkpoint**
  Commit the skill file.

---

### Task 4: Verify state passes criteria (GREEN)
**Targets:**
- Run subagent dispatch with the skill active.

- [ ] **Step 1: Write/Define success criteria**
  The subagent must follow the newly written `systematic-research` skill and output a research result that complies with all criteria (uses matrix, delegates summaries, contains inline citations/confidence ratings, and a bibliography).
- [ ] **Step 2: Verify current state fails/lacks criteria**
  None (we are verifying it passes now).
- [ ] **Step 3: Perform minimal implementation / worker action**
  Dispatch a research subagent to research the same query: *"Find key differences in capabilities and pricing between Moonshot Kimi and Minimax models in 2026."* Include instructions to use the newly created `systematic-research` skill.
- [ ] **Step 4: Verify state passes criteria**
  Inspect the subagent's response. Confirm that it creates a Source Matrix, invokes the `model-router:route_task` tool, and uses inline citations and a bibliography.
  Expected: PASS (Successfully established the GREEN state).
- [ ] **Step 5: Save/Checkpoint**
  Save the subagent's compliant response to `scratch/verified-output.md` and clean up the scratch folder.
