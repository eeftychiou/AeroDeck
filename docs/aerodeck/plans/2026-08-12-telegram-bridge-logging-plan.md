# Telegram Bridge Debug Logging Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use aerodeck:subagent-driven-task-pipeline to implement this plan task-by-task using TDD principles.

**Goal:** Implement environment-variable driven log levels and dual-output (file + console) logging in the Telegram bridge, along with deep-dive debug hooks.

**Architecture/Workflow:** We will configure the root logger to read `TELEGRAM_BRIDGE_LOG_LEVEL`, attach both a StreamHandler and a FileHandler, and enrich existing functions with `logger.debug`.

**Tech Stack/Tools:** Python, `logging`, `pytest`

---

### Task 1: Setup Logging Infrastructure (TDD)

**Targets:**
- Modify: `C:/Users/User/.gemini/config/plugins/aerodeck/telegram-bridge/requirements.txt`
- Modify: `C:/Users/User/.gemini/config/plugins/aerodeck/telegram-bridge/bridge.py`
- Create: `C:/Users/User/.gemini/config/plugins/aerodeck/telegram-bridge/tests/test_logging.py`

- [ ] **Step 1: Write/Define success criteria**
Write success criteria in `docs/aerodeck/criteria/tb-task-1-criteria.json`:
```json
{
  "criteria": "pytest runs successfully. A test exists verifying that setting TELEGRAM_BRIDGE_LOG_LEVEL configures the logger level correctly and attaches both a StreamHandler and FileHandler."
}
```

- [ ] **Step 2: Verify current state fails/lacks criteria**
Run: `pytest tests/` in `telegram-bridge`
Expected: FAIL (Directory not found or tests missing)

- [ ] **Step 3: Perform minimal implementation / worker action**
1. Add `pytest` and `pytest-asyncio` to `requirements.txt`.
2. Extract the logging configuration in `bridge.py` into a function `setup_logging()` that reads `os.getenv("TELEGRAM_BRIDGE_LOG_LEVEL", "INFO")` and attaches handlers.
3. Write `tests/test_logging.py` to assert `setup_logging()` sets the correct level and creates `telegram-bridge.log`.

- [ ] **Step 4: Verify state passes criteria**
Run: `pytest tests/test_logging.py`
Expected: PASS

- [ ] **Step 5: Save/Checkpoint**
Commit changes.

### Task 2: Inject Deep-Dive Telemetry

**Targets:**
- Modify: `C:/Users/User/.gemini/config/plugins/aerodeck/telegram-bridge/bridge.py`
- Modify: `C:/Users/User/.gemini/config/plugins/aerodeck/telegram-bridge/tests/test_bridge.py`

- [ ] **Step 1: Write/Define success criteria**
Write success criteria in `docs/aerodeck/criteria/tb-task-2-criteria.json`:
```json
{
  "criteria": "bridge.py contains logger.debug statements in parse_allowed_ids, restricted decorator, propose_command, and handle_document. Tests verify these logs are emitted when level is DEBUG."
}
```

- [ ] **Step 2: Verify current state fails/lacks criteria**
Run: Grep for `logger.debug` in `bridge.py`.
Expected: FAIL (No debug statements found)

- [ ] **Step 3: Perform minimal implementation / worker action**
1. Write a test simulating `parse_allowed_ids` and asserting a debug log is recorded using `caplog`.
2. Update `parse_allowed_ids` to log the count of parsed IDs.
3. Update `restricted` decorator to log incoming user IDs.
4. Update `propose_command` to log the raw command payload.
5. Update `handle_document` to log the file size and mime type.

- [ ] **Step 4: Verify state passes criteria**
Run: `pytest tests/`
Expected: PASS

- [ ] **Step 5: Save/Checkpoint**
Commit changes.
