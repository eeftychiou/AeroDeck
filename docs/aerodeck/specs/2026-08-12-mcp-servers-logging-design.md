# Phase 3: MCP Servers (Browser & Drive) Logging Spec

## 1. Overview
The goal of this phase is to bring the two remaining TypeScript-based MCP servers (`browser-automation` and `google-drive`) into alignment with the Aerodeck unified logging strategy. They will both receive dedicated `logger.ts` implementations that support dual-output (console + file) and dynamic severity levels via environment variables.

## 2. Architecture & Configuration

### Log Levels
Each module will read its respective environment variable:
- `BROWSER_AUTOMATION_LOG_LEVEL`
- `GOOGLE_DRIVE_LOG_LEVEL`
- Default fallback for both is `INFO`.
- Supported levels: `DEBUG` (0) < `INFO` (1) < `WARN` (2) < `ERROR` (3).

### Output Handlers
Both modules will output to:
1. **stderr**: To preserve the JSON-RPC stdio protocol.
2. **File**: Appending to `browser-automation.log` and `google-drive.log` respectively in their local directories.

Format: `[%(timestamp)] [%(level)] %(message) %(meta)`

## 3. Deep-Dive Telemetry Implementation

### Browser Automation
`logger.debug` hooks will be added to `src/index.ts` to trace:
- **Navigation**: The exact URL navigated to.
- **Interactions**: The exact CSS selectors targeted in `handleClickElement` and `handleFillElement`.
- **Content Retrieval**: The length (in characters) of the HTML payload returned by `get_content`.

### Google Drive
`logger.debug` hooks will be added to `src/index.ts` to trace:
- **Search**: The raw query string, and the **full payload of search results returned**.
- **File Access**: The file ID and requested mime-type when reading documents.
- **Downloads**: The target output path and the file ID being fetched.

## 4. Error Handling
- The `logger.ts` will silently handle failures to write to the local `.log` file to ensure the module doesn't crash if permissions change.
- Unhandled rejections and uncaught exceptions will be intercepted and routed through `logger.error` to prevent `stdout` pollution.
