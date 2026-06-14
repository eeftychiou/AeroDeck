# Tabular Data Processing Skill Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use aerodeck:subagent-driven-task-pipeline (recommended) or aerodeck:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a new AeroDeck skill `data-processing` that enforces a script-first programmatic approach to auditing, cleaning, and calculating metrics from flat tabular files (CSV/TSV/Excel) to prevent calculation errors, followed by structured Markdown summaries.

**Architecture/Workflow:** This plan follows the AeroDeck `writing-skills` skill process of defining a pressure scenario, establishing a RED baseline failure, writing the skill, and verifying the GREEN state with a subagent.

**Tech Stack/Tools:** 
- Workspace directory: `c:\Users\User\Antigravity\Gemini Assistant`
- Skill Path: `skills/data-processing/SKILL.md`
- Scratch/Test directory: `scratch/`

---

### Task 1: Define baseline verification check
**Targets:**
- Create: `scratch/sales-test.csv`
- Create: `scratch/test-data-processing.md`

- [ ] **Step 1: Write/Define success criteria**
  Write the test dataset and validation check instructions:
  `scratch/sales-test.csv`:
  ```csv
  Date,Item,Category,Quantity,Price
  2026-06-01,Laptop,Electronics,2,1200.00
  2026-06-02,Mouse,Electronics,10,25.50
  2026-06-03,Desk Chair,Furniture,1,350.00
  2026-06-04,Monitor,Electronics,3,299.99
  2026-06-05,Desk Lamp,Furniture,5,45.00
  ```
  `scratch/test-data-processing.md`:
  ```markdown
  # Tabular Data Processing Validation Check
  
  Evaluate the subagent's data processing output. It must fulfill the following:
  1. Assistant writes a temporary local Python parser script to calculate columns and metrics programmatically rather than manually.
  2. Runs the script locally using terminal commands.
  3. Displays a BLUF (Bottom Line Up Front) summary highlighting key aggregate statistics at the top.
  4. Renders a clean Markdown table representing the records.
  5. Includes a separate summary block detailing exact metrics: Sum, Mean, Min, Max, and Count.
  ```
- [ ] **Step 2: Verify current state fails/lacks criteria**
  Verify the files are written.
  Expected: PASS
- [ ] **Step 3: Perform minimal implementation / worker action**
  None needed (this is a setup task).
- [ ] **Step 4: Verify state passes criteria**
  Check that the files exist.
  Expected: PASS
- [ ] **Step 5: Save/Checkpoint**
  Verify git status sees files as untracked.

---

### Task 2: Verify current state fails (RED)
**Targets:**
- Run subagent dispatch without the skill document.

- [ ] **Step 1: Write/Define success criteria**
  The subagent must run the data processing task *without* the `data-processing` skill and output its normal behavior.
- [ ] **Step 2: Verify current state fails/lacks criteria**
  Dispatch a subagent to: *"Process and summarize the sales data in scratch/sales-test.csv, calculating total revenue, average item price, and item count."*
  Verify that the subagent does NOT write or execute a local script, performs calculations in-context, and lacks a BLUF summary or programmatic metrics validation.
  Expected: FAIL (Baseline behavior relies on manual/head calculations).
- [ ] **Step 3: Perform minimal implementation / worker action**
  Run the subagent dispatch.
- [ ] **Step 4: Verify state passes criteria**
  Inspect the subagent's response. Confirm that it did not follow the script-first process.
  Expected: PASS (Successfully established the RED baseline).
- [ ] **Step 5: Save/Checkpoint**
  Save the subagent's response output in `scratch/baseline-data-output.md`.

---

### Task 3: Implement the `data-processing` skill
**Targets:**
- Create: `skills/data-processing/SKILL.md`

- [ ] **Step 1: Write/Define success criteria**
  The skill document `skills/data-processing/SKILL.md` must be created, containing proper YAML frontmatter and the detailed three-phase workflow (Auditing/Script, Execution/Validation, Formatting).
- [ ] **Step 2: Verify current state fails/lacks criteria**
  Check if `skills/data-processing/SKILL.md` exists.
  Expected: FAIL (File does not exist yet)
- [ ] **Step 3: Perform minimal implementation / worker action**
  Write the skill file contents:
  ```markdown
  ---
  name: data-processing
  description: Use when asked to process, clean, sanitize, summarize, or calculate statistics (sums, averages, counts, maximums) from tabular datasets (CSV, TSV, or Excel files).
  ---
  # Tabular Data Processing

  Use this skill to guide the cleaning, sanitization, and programmatic analysis of flat tabular datasets (CSV/TSV/Excel).

  ## Workflow

  ### Phase 1: Dataset Auditing & Script Generation
  Before performing any calculation, check file parameters and write a local parser script:
  1. **Metadata Inspection:** Read the first 3 lines (headers and sample row) to identify column names and types.
  2. **Write Parser Script:** Write a temporary Python script (in the `scratch/` folder) that imports the standard `csv` library. The script must:
     * **Sanitize Columns:** Trim whitespace, handle missing values (fill with `N/A` or `0`), and cast values.
     * **Compute Statistics:** Programmatically compute sums, averages, counts, or groupings using Python math.
     * **Print Results:** Print the sanitized data records and computed statistics in a structured JSON or plain text format.

  ### Phase 2: Execution & Validation
  1. **Execute Script:** Run the temporary parser script using `run_command`.
  2. **Collect Output:** Capture the stdout containing the sanitized rows and exact computed statistics.
  3. **Delete Script:** Clean up the parser script from the `scratch/` directory.

  ### Phase 3: Formatting & Presentation
  Present results to the user following these styling standards:
  1. **BLUF Summary:** Highlight key aggregate findings (e.g., *"Total Sales: $X (Average of $Y per transaction)"*) at the top of the response.
  2. **Tabular Render:** Create a formatted Markdown table representing the records.
     * If the table is long (>20 rows), only display the top 10 and bottom 5 records, indicating that middle rows are truncated.
  3. **Statistics Block:** Include a separate, styled summary block (e.g. quotes or bold list) displaying all calculated metrics (Sum, Mean, Min, Max, Count).
  ```
- [ ] **Step 4: Verify state passes criteria**
  Check if `skills/data-processing/SKILL.md` exists and contains correct frontmatter.
  Expected: PASS
- [ ] **Step 5: Save/Checkpoint**
  Commit the skill file.

---

### Task 4: Verify state passes criteria (GREEN)
**Targets:**
- Run subagent dispatch with the skill active.

- [ ] **Step 1: Write/Define success criteria**
  The subagent must follow the newly written `data-processing` skill and output a data analysis result that complies with all criteria (writes script-first parser, runs it locally, and formats output with BLUF and a statistics block).
- [ ] **Step 2: Verify current state fails/lacks criteria**
  None (we are verifying it passes now).
- [ ] **Step 3: Perform minimal implementation / worker action**
  Dispatch a research/drafting subagent to: *"Process and summarize the sales data in scratch/sales-test.csv, calculating total revenue, average item price, and item count."* Include instructions to use the newly created `data-processing` skill.
- [ ] **Step 4: Verify state passes criteria**
  Inspect the subagent's response. Confirm that it writes a parser script in `scratch/`, executes it, and outputs a formatted report with BLUF and metrics.
  Expected: PASS (Successfully established the GREEN state).
- [ ] **Step 5: Save/Checkpoint**
  Save the subagent's compliant response to `scratch/verified-data-output.md` and clean up the scratch folder.
