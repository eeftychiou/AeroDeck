---
name: document-synthesis
description: Use when requested to draft briefing notes, notes, reports, papers, or syntheses utilizing information harvested from Google Drive, the web, or local files.
---
# Document Synthesis

Use this skill to guide the planning, research, harvesting, summarization, and drafting of comprehensive documents utilizing both cloud (Google Drive) and web sources.

## Workflow

### Step 1: Clarify & Align
Before searching or drafting, ask 1-2 clarifying questions to narrow down the target scope, audience, requirements, and required deliverables. Do not take search or drafting actions until the user responds.

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
