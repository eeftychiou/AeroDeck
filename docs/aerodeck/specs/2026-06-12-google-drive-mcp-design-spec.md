# Design Specification: Google Drive MCP Server & Integrated Synthesis

**Date:** 2026-06-12  
**Status:** Approved  
**Topic:** Google Drive MCP Server (Stage 1) & Document Synthesis Skill (Stage 2)

## Phase 1: Google Drive MCP Server (Stage 1)

### Server Architecture
- Located at `mcp-servers/google-drive/`
- TypeScript/Node.js application matching the design of the `model-router` server.
- Uses `@modelcontextprotocol/sdk` for MCP protocol, `googleapis` for Google Drive API v3.

### OAuth 2.0 Authentication Flow
- User configures `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env`.
- First-time startup opens a local auth callback listener at `http://localhost:3000/oauth2callback`.
- Exchanges authorization code for access and refresh tokens, saving them to `token.json` for subsequent silent renewals.

### Tool Definitions
1. **`search_drive_files`**: Queries Google Drive files using filename and fullText contents:
   `q: "name contains '${query}' or fullText contains '${query}'"`
2. **`read_google_doc`**: Reads plain text/markdown content by exporting Google Docs as `text/plain`, or reading raw text files directly.
3. **`download_drive_file`**: Downloads binary files (PDFs, images) to a local directory path for processing.

---

## Phase 2: Document Synthesis Skill (Stage 2)

### Triggering Conditions
* **Name:** `document-synthesis`
* **Triggering Description:** Use when requested to draft briefing notes, notes, reports, papers, or syntheses utilizing information harvested from Google Drive, the web, or files.

### Workflow Orchestration
1. **Task Alignment:** Ask clarifying questions to narrow down the target scope, audience, and key metrics.
2. **Web Discovery:** Run web searches using the `systematic-research` skill to fetch general background context.
3. **Cloud Discovery:** Call the `google-drive` MCP server to search for relevant files using full-text content queries.
4. **Ingestion & Summary:** Download target documents (e.g. PDFs) locally. Use the Model Router's `route_task` tool to summarize long documents and extract key facts to conserve main model tokens.
5. **Synthesis & Draft:** The main agent drafts the final document matching the user's requirements and the `document-drafting` templates.
6. **Editing & Checklist:** Validate readability, citations, and guidelines.
