# Phase 2: Telegram Bridge Debug Logging Spec

## 1. Overview
The goal of this phase is to bring the Python-based `telegram-bridge` component into alignment with the Aerodeck unified logging strategy. This entails adding dual-output logging (console + file) and supporting dynamic severity levels via environment variables, ensuring consistent observability across all Aerodeck subsystems.

## 2. Architecture & Configuration

### Log Levels
The Python native `logging` module will be configured to read the active log level from the environment.
- The environment variable is `TELEGRAM_BRIDGE_LOG_LEVEL`.
- It maps string values (e.g., "DEBUG", "INFO") to standard Python `logging.DEBUG` and `logging.INFO`.
- If the variable is unset or invalid, the logger defaults to `INFO`.

### Output Handlers (Coherent Design Principle)
To match the `model-router` architecture:
1. **StreamHandler**: Outputs to `sys.stderr` or `sys.stdout` for container/service capture.
2. **FileHandler**: Appends to `telegram-bridge.log` in the local component directory.

Both handlers will use the unified format: `%(asctime)s - %(name)s - %(levelname)s - %(message)s`.

## 3. Deep-Dive Telemetry Implementation
The existing functionality in `bridge.py` will be enriched with `logger.debug` hooks:

1. **Initialization / Parsing**: Log the length of `ALLOWED_IDS` parsed.
2. **Access Control**: Log incoming chat/user IDs before evaluating them against the allow-list.
3. **Commands**: Log exactly when `/start`, `/reset`, or `/aerodeck` are triggered.
4. **Document Handling**: Log the metadata (e.g., file size, raw file name) of intercepted documents.
5. **Callback Queries**: Log the raw `query.data` string for inline button presses before processing approval or rejection logic.

## 4. Error Handling
- Invalid strings passed to `TELEGRAM_BRIDGE_LOG_LEVEL` will be caught and defaulted to `INFO`.
- FileHandler initialization failures (e.g., due to permissions) will be ignored gracefully or fallback to StreamHandler only.

## 5. Verification
- The bridge will be manually run or tested to ensure the `telegram-bridge.log` file is created.
- Setting `TELEGRAM_BRIDGE_LOG_LEVEL=DEBUG` must result in debug statements appearing in the log file for typical interactions like inline callbacks.
