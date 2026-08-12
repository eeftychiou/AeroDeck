# Phase 1: Model Router Debug Logging Spec

## 1. Overview
The goal of this phase is to implement a robust, level-based logging strategy for the Aerodeck `model-router` component, and to inject deep debugging information into the session memory subsystem. This ensures that production logs remain clean under normal operation, but can be fully expanded for deep-dive troubleshooting.

## 2. Architecture & Configuration

### Log Levels
The logging utility (`src/logger.ts`) will be updated to respect a global log level. The supported levels, in increasing order of severity, are:
- `DEBUG` (0)
- `INFO` (1)
- `WARN` (2)
- `ERROR` (3)

### Configuration
- The active log level will be read from the environment variable `MODEL_ROUTER_LOG_LEVEL`.
- If the variable is unset or invalid, the system will default to `INFO`.
- Any log message submitted to the logger with a severity strictly less than the active log level will be silently discarded (neither written to stderr nor to the log file).

## 3. Session Memory Deep-Dive Implementation
The session manager (`src/session.ts`) will be heavily instrumented with `DEBUG` level logs to track state transitions and potential data loss (e.g., truncation).

Specific logging points:
1. **Load Event**: When `loadSessions()` parses the JSON file, it will log the total number of active sessions loaded.
2. **Retrieve Event**: `getSessionHistory()` will log the `sessionId` requested and the number of message turns returned.
3. **Append Event**: `appendSessionTurn()` will log the lengths of the incoming user prompt and the assistant reply.
4. **Truncation Event**: If appending a turn exceeds the `maxMessages` limit, a specific debug log will be emitted detailing how many older messages were pruned.
5. **Save Event**: `saveSessions()` will log the file write success/failure, including the temporary file mechanism.

## 4. Error Handling
- Invalid `MODEL_ROUTER_LOG_LEVEL` strings will default gracefully to `INFO`.
- Logging statements themselves must not throw exceptions that crash the process (existing `try/catch` in `saveSessions` and `logger.ts` covers this, but they will be reviewed).

## 5. Verification
- The `logger.test.ts` (or similar unit test) will verify that `DEBUG` logs are skipped when the level is `INFO`, and printed when the level is `DEBUG`.
- A live request with session memory enabled will demonstrate the new lifecycle logs.
