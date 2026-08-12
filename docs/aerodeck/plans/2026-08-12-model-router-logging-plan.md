# Model Router Debug Logging Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use aerodeck:subagent-driven-task-pipeline (recommended) or aerodeck:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement environment-variable driven log levels in the model-router and inject deep debugging into the session memory feature.

**Architecture/Workflow:** We will configure the router to read `MODEL_ROUTER_LOG_LEVEL` and filter logs dynamically. Then, we will add extensive `DEBUG` tracing to `session.ts` to monitor state transitions and truncation.

**Tech Stack/Tools:** Typescript, Node.js filesystem, Jest

---

### Task 1: Log Level Enforcement in `logger.ts`

**Targets:**
- Modify: `C:/Users/User/.gemini/config/plugins/aerodeck/mcp-servers/model-router/src/logger.ts`

- [ ] **Step 1: Write/Define success criteria**
Write success criteria in `docs/aerodeck/criteria/task-1-criteria.json`:
```json
{
  "criteria": "logger.ts respects MODEL_ROUTER_LOG_LEVEL. If set to INFO, DEBUG messages are silently dropped. If set to DEBUG, all messages are logged."
}
```

- [ ] **Step 2: Verify current state fails/lacks criteria**
Run: Inspect `logger.ts`, note that `logMessage` currently writes all levels without checking any environment variable for severity filtering.

- [ ] **Step 3: Perform minimal implementation / worker action**
Update `logger.ts` to include severity mapping and filtering:
```typescript
const LOG_SEVERITY: Record<LogLevel, number> = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 };
const currentLevelStr = (process.env.MODEL_ROUTER_LOG_LEVEL || "INFO").toUpperCase();
const currentLevel: LogLevel = LOG_SEVERITY[currentLevelStr as LogLevel] !== undefined ? (currentLevelStr as LogLevel) : "INFO";

export function logMessage(level: LogLevel, message: string, meta?: any) {
  if (LOG_SEVERITY[level] < LOG_SEVERITY[currentLevel]) {
    return; // Silently drop logs below configured severity
  }
  // ... existing implementation
}
```

- [ ] **Step 4: Verify state passes criteria**
Run: `npm run build` or `npm test` to ensure syntax is valid and no compilation errors occur.

- [ ] **Step 5: Save/Checkpoint**
```bash
git add mcp-servers/model-router/src/logger.ts
git commit -m "feat(model-router): implement log level enforcement"
```

### Task 2: Session Memory Deep-Dive Logging

**Targets:**
- Modify: `C:/Users/User/.gemini/config/plugins/aerodeck/mcp-servers/model-router/src/session.ts`

- [ ] **Step 1: Write/Define success criteria**
Write success criteria in `docs/aerodeck/criteria/task-2-criteria.json`:
```json
{
  "criteria": "session.ts emits DEBUG logs when loading, retrieving, appending, truncating, and saving sessions."
}
```

- [ ] **Step 2: Verify current state fails/lacks criteria**
Run: Inspect `session.ts`, note the absence of `logMessage` imports and usage for debug state tracing.

- [ ] **Step 3: Perform minimal implementation / worker action**
Import `logMessage` from `./logger.js` into `session.ts`. 
Inject logs at key lifecycle points:
- In `loadSessions()`: `logMessage("DEBUG", "Loaded sessions from disk", { count: Object.keys(inMemorySessions!).length });`
- In `saveSessions()`: `logMessage("DEBUG", "Saved sessions to disk successfully");`
- In `getSessionHistory()`: `logMessage("DEBUG", "Retrieved session history", { sessionId, turns: sessions[sessionId]?.length || 0 });`
- In `appendSessionTurn()`: 
  - Log prompt/reply lengths: `logMessage("DEBUG", "Appending turn to session", { sessionId, userLen: userPrompt.length, asstLen: assistantReply.length });`
  - Log truncation if `history.length > maxMessages`: `logMessage("DEBUG", "Truncating session history to max messages", { sessionId, removed: history.length - maxMessages, maxMessages });`

- [ ] **Step 4: Verify state passes criteria**
Run: `npm test` to ensure tests compile. Check that `session.ts` imports `logger.js` correctly (using `.js` extension for ES modules).

- [ ] **Step 5: Save/Checkpoint**
```bash
git add mcp-servers/model-router/src/session.ts
git commit -m "feat(model-router): add detailed debug logging to session memory"
```

### Task 3: Automated Verification of Log Level Filtering

**Targets:**
- Modify: `C:/Users/User/.gemini/config/plugins/aerodeck/mcp-servers/model-router/tests/session.test.ts` or add `tests/logger.test.ts`

- [ ] **Step 1: Write/Define success criteria**
Write success criteria in `docs/aerodeck/criteria/task-3-criteria.json`:
```json
{
  "criteria": "A jest test exists that asserts DEBUG messages are not printed when process.env.MODEL_ROUTER_LOG_LEVEL='INFO'."
}
```

- [ ] **Step 2: Verify current state fails/lacks criteria**
Run: `npm test` and note there is no coverage for log level filtering.

- [ ] **Step 3: Perform minimal implementation / worker action**
Create `tests/logger.test.ts` that:
- Mocks `process.stdout.write` and `console.error`
- Calls `logMessage("DEBUG", "test")` with `MODEL_ROUTER_LOG_LEVEL = "INFO"`
- Expects `console.error` NOT to be called.
- Calls `logMessage("ERROR", "test")`
- Expects `console.error` TO be called.

- [ ] **Step 4: Verify state passes criteria**
Run: `npm test tests/logger.test.ts`
Expected: PASS

- [ ] **Step 5: Save/Checkpoint**
```bash
git add mcp-servers/model-router/tests/logger.test.ts
git commit -m "test(model-router): verify log level enforcement"
```
