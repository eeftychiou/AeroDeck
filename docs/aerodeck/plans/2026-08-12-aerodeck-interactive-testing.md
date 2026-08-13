# AeroDeck Interactive Testing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use aerodeck:subagent-driven-task-pipeline (recommended) or aerodeck:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Interactively test every feature of AeroDeck systematically, validating the core workflow engine, QA processes, problem-solving diagnostics, and specialized MCP integrations.

**Architecture/Workflow:** Component-by-component testing configuration. We will validate each subsystem using isolated tests and dummy data to ensure the workflow, integrations (Google Drive, Outlook, Model Router, Browser Automation), and skill meta framework operate correctly as a general assistant.

**Tech Stack/Tools:** Antigravity 2.0 CLI, Subagents (`self` template), Model Context Protocol (`browser-automation`, `model-router`, `google-drive`), PowerShell scripts (`outlook-mail-research.ps1`).

---

### Task 1: Core Workflow - Enable Debug Logging & Planning Initialization

**Targets:**
- Create: `C:/Users/User/Antigravity/Gemini Assistant/tests/interactive/dummy_workspace`
- Modify: Environment/Config to enable Debug Logging.

- [ ] **Step 1: Write/Define success criteria**
Write success criteria in `docs/aerodeck/criteria/task-1-criteria.json`:
```json
{
  "criteria": "Debug logging is enabled in the environment. Dummy test workspace folder exists."
}
```

- [ ] **Step 2: Verify current state fails/lacks criteria**
Run: `node -e "require('fs').accessSync('C:/Users/User/Antigravity/Gemini Assistant/tests/interactive/dummy_workspace')"`
Expected: FAIL (Folder does not exist)

- [ ] **Step 3: Perform minimal implementation / worker action**
Run commands to create the folder and set the debug flag:
```bash
mkdir -p "C:/Users/User/Antigravity/Gemini Assistant/tests/interactive/dummy_workspace"
# Set environment variables for debug logging in the current session
$env:LOG_LEVEL="DEBUG"
```

- [ ] **Step 4: Verify state passes criteria**
Run: `node -e "require('fs').accessSync('C:/Users/User/Antigravity/Gemini Assistant/tests/interactive/dummy_workspace')"`
Expected: PASS (Command exits 0)

- [ ] **Step 5: Save/Checkpoint**
No files to save; environment and workspace initialized.

---

### Task 2: Subagent Pipelines, Model Router & Session Memory

**Targets:**
- Browser/URL: N/A
- MCP Server: `model-router`

- [ ] **Step 1: Write/Define success criteria**
Write success criteria in `docs/aerodeck/criteria/task-2-criteria.json`:
```json
{
  "criteria": "Model Router explicit headers present in response, and session memory retained across two successive calls."
}
```

- [ ] **Step 2: Verify current state fails/lacks criteria**
Call MCP `model-router` tool `get_router_status`. Verify no current session data for testing.
Expected: PASS/READY for new session.

- [ ] **Step 3: Perform minimal implementation / worker action**
1. Call MCP `route_task` with `modelTier`: "smart", `session_id`: "test-session-001", `prompt`: "My secret codeword is 'AerodeckTest'."
2. Call MCP `route_task` with `modelTier`: "smart", `session_id`: "test-session-001", `prompt`: "What is my secret codeword?"

- [ ] **Step 4: Verify state passes criteria**
Verify the response text contains the header `[Model Router Metadata: ...]` and the second response correctly repeats "AerodeckTest".

- [ ] **Step 5: Save/Checkpoint**
Call MCP `clear_session` with `session_id`: "test-session-001".

---

### Task 3: QA & Delivery Refinement (Criteria-Driven Refinement)

**Targets:**
- Create: `tests/interactive/dummy_workspace/logic_test.js`

- [ ] **Step 1: Write/Define success criteria**
Write success criteria in `docs/aerodeck/criteria/task-3-criteria.json`:
```json
{
  "criteria": "Logic test script runs and returns exactly 'Success'."
}
```

- [ ] **Step 2: Verify current state fails/lacks criteria**
Create the broken script:
```javascript
// logic_test.js
function checkValue(val) {
  if (val = 10) return "Success";
  return "Failure";
}
console.log(checkValue(5));
```
Run: `node tests/interactive/dummy_workspace/logic_test.js`
Expected: FAIL (Returns "Success" incorrectly due to assignment instead of equality)

- [ ] **Step 3: Perform minimal implementation / worker action**
Apply criteria-driven-refinement to fix the script:
```javascript
// logic_test.js
function checkValue(val) {
  if (val === 10) return "Success";
  return "Failure";
}
console.log(checkValue(10));
```

- [ ] **Step 4: Verify state passes criteria**
Run: `node tests/interactive/dummy_workspace/logic_test.js`
Expected: PASS (Outputs "Success" properly based on logic)

- [ ] **Step 5: Save/Checkpoint**
Script fixed in place.

---

### Task 4: Systematic Problem Solving

**Targets:**
- Create: `tests/interactive/dummy_workspace/data_parser.js`

- [ ] **Step 1: Write/Define success criteria**
Write success criteria in `docs/aerodeck/criteria/task-4-criteria.json`:
```json
{
  "criteria": "Data parser runs without throwing a 'missing file' exception."
}
```

- [ ] **Step 2: Verify current state fails/lacks criteria**
Create a script that requires a missing file:
```javascript
// data_parser.js
const fs = require('fs');
fs.readFileSync('./missing_data.csv', 'utf8');
```
Run: `node tests/interactive/dummy_workspace/data_parser.js`
Expected: FAIL (Throws ENOENT)

- [ ] **Step 3: Perform minimal implementation / worker action**
Run the 4-phase systematic problem solving to identify missing dependency and supply it.
Create `./missing_data.csv` with content `id,name\n1,test`.

- [ ] **Step 4: Verify state passes criteria**
Run: `node tests/interactive/dummy_workspace/data_parser.js`
Expected: PASS (No errors thrown).

- [ ] **Step 5: Save/Checkpoint**
Data parsed successfully.

---

### Task 5: Web Navigation & Authentication

**Targets:**
- MCP Server: `browser-automation`
- Browser URL: `https://httpbin.org/basic-auth/user/passwd`

- [ ] **Step 1: Write/Define success criteria**
Write success criteria in `docs/aerodeck/criteria/task-5-criteria.json`:
```json
{
  "criteria": "Browser-automation successfully navigates, authenticates, and extracts 'authenticated': true."
}
```

- [ ] **Step 2: Verify current state fails/lacks criteria**
Check if any browser content is extracted.
Expected: FAIL (No data extracted yet).

- [ ] **Step 3: Perform minimal implementation / worker action**
1. Trigger `browser-automation` `navigate` tool in headless mode to `https://httpbin.org/basic-auth/user/passwd`. Provide authentication headers or fill credentials if prompted.
2. If basic auth via navigate fails, switch to non-headless mode and simulate UI interaction/authentication.
3. Extract content using `get_content`.

- [ ] **Step 4: Verify state passes criteria**
Verify extracted JSON text contains `"authenticated": true` and `"user": "user"`.

- [ ] **Step 5: Save/Checkpoint**
Log success to a summary file.

---

### Task 6: Google Drive Integration

**Targets:**
- MCP Server: `google-drive`

- [ ] **Step 1: Write/Define success criteria**
Write success criteria in `docs/aerodeck/criteria/task-6-criteria.json`:
```json
{
  "criteria": "System is able to search Google Drive and read document contents for systematic research."
}
```

- [ ] **Step 2: Verify current state fails/lacks criteria**
Check if research data exists locally.
Expected: FAIL.

- [ ] **Step 3: Perform minimal implementation / worker action**
1. Call MCP `search_drive_files` to query the user's internal database for a specific term (e.g., "AeroDeck", "Internal Database").
2. Call MCP `read_google_doc` on the highest relevance File ID returned.

- [ ] **Step 4: Verify state passes criteria**
Verify the tool response contains readable document text.

- [ ] **Step 5: Save/Checkpoint**
Append findings to `tests/interactive/dummy_workspace/research_summary.md`.

---

### Task 7: Email/Outlook Integration

**Targets:**
- Scripts: `scripts/outlook-search.ps1` (or equivalent `run_command` MAPI script)

- [ ] **Step 1: Write/Define success criteria**
Write success criteria in `docs/aerodeck/criteria/task-7-criteria.json`:
```json
{
  "criteria": "Outlook archive queried for 'ICAO Assembly'. Returns valid results or gracefully informs environment missing."
}
```

- [ ] **Step 2: Verify current state fails/lacks criteria**
Check if search results exist.
Expected: FAIL.

- [ ] **Step 3: Perform minimal implementation / worker action**
Run a PowerShell command to query Outlook MAPI for "ICAO Assembly".
*(Note: If environment errors out stating Outlook is not installed/accessible, capture the error and notify the user.)*

- [ ] **Step 4: Verify state passes criteria**
Inspect the stdout/stderr. Either emails are listed OR an environment warning is logged appropriately.

- [ ] **Step 5: Save/Checkpoint**
Append output to `tests/interactive/dummy_workspace/research_summary.md`.

---

### Task 8: Skill Meta - Writing Skills

**Targets:**
- Create: `C:/Users/User/.gemini/config/plugins/aerodeck/skills/mock-test-skill/SKILL.md`

- [ ] **Step 1: Write/Define success criteria**
Write success criteria in `docs/aerodeck/criteria/task-8-criteria.json`:
```json
{
  "criteria": "Mock skill is created and successfully read using view_file."
}
```

- [ ] **Step 2: Verify current state fails/lacks criteria**
Run: `node -e "require('fs').accessSync('C:/Users/User/.gemini/config/plugins/aerodeck/skills/mock-test-skill/SKILL.md')"`
Expected: FAIL (File does not exist).

- [ ] **Step 3: Perform minimal implementation / worker action**
Create `mock-test-skill/SKILL.md` with standard frontmatter and a simple mock rule.

- [ ] **Step 4: Verify state passes criteria**
Run: `node -e "require('fs').accessSync('C:/Users/User/.gemini/config/plugins/aerodeck/skills/mock-test-skill/SKILL.md')"`
Expected: PASS.

- [ ] **Step 5: Save/Checkpoint**
Use `view_file` to ensure it parses successfully. Then delete the mock skill to keep the environment clean.
