# Telegram Bridge for Antigravity & AeroDeck Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use aerodeck:subagent-driven-task-pipeline (recommended) or aerodeck:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a Python-based Telegram bot daemon that securely interfaces with the Antigravity local SDK to run agent tasks, stream terminal logs, and intercept tool execution for remote approvals.

**Architecture/Workflow:** Node/Python Daemon Bridge (Operational Configuration B). The Python script runs locally, connects to the Telegram Bot API via long polling, uses `google-antigravity-sdk` to trigger and manage sessions, watches files using the SDK, and uses Telegram inline keyboards for command approvals.

**Tech Stack/Tools:**
- Python 3.10+
- `python-telegram-bot` (Telegram API framework)
- `python-dotenv` (Configuration)
- `google-antigravity-sdk` (Antigravity local interface)
- Filesystem monitoring

---

### Task 1: Environment Setup

**Targets:**
- Create: `telegram-bridge/requirements.txt`
- Create: `telegram-bridge/.env.example`
- Create: `telegram-bridge/docs/setup.md`

- [ ] **Step 1: Write/Define success criteria**
  Create `docs/aerodeck/criteria/task-1-criteria.json` containing:
  ```json
  {
    "criteria": "requirements.txt contains python-telegram-bot and python-dotenv. .env.example contains placeholders for TELEGRAM_TOKEN and ALLOWED_USER_IDS."
  }
  ```

- [ ] **Step 2: Verify current state fails/lacks criteria**
  Verify folders and files do not exist:
  Expected: FAIL (Directory `telegram-bridge` does not exist or is empty)

- [ ] **Step 3: Perform minimal implementation / worker action**
  Create the files:
  * `telegram-bridge/requirements.txt`:
    ```
    python-telegram-bot==20.8
    python-dotenv==1.0.1
    ```
  * `telegram-bridge/.env.example`:
    ```env
    TELEGRAM_TOKEN=your_bot_token_here
    ALLOWED_USER_IDS=123456789,987654321
    ANTIGRAVITY_SDK_URL=http://localhost:8000
    ```
  * `telegram-bridge/docs/setup.md`:
    ```markdown
    # Setup Telegram Bridge
    1. Clone/copy files.
    2. Install dependencies: `pip install -r requirements.txt`
    3. Copy `.env.example` to `.env` and fill in bot token and allowed user IDs.
    ```

- [ ] **Step 4: Verify state passes criteria**
  Check that the files exist and contents are correct.
  Expected: PASS

- [ ] **Step 5: Commit/Save**
  ```bash
  git add telegram-bridge/requirements.txt telegram-bridge/.env.example telegram-bridge/docs/setup.md docs/aerodeck/criteria/task-1-criteria.json
  git commit -m "feat: setup environment files for telegram bridge"
  ```

---

### Task 2: Security Whitelist & Telegram Client Stub

**Targets:**
- Create: `telegram-bridge/bridge.py`
- Create: `tests/test_telegram_bridge.py`

- [ ] **Step 1: Write/Define success criteria**
  Create `docs/aerodeck/criteria/task-2-criteria.json` containing:
  ```json
  {
    "criteria": "test_telegram_bridge.py validates that messages from non-whitelisted user IDs are rejected, and messages from whitelisted IDs are processed."
  }
  ```

- [ ] **Step 2: Verify current state fails/lacks criteria**
  Run: `python tests/test_telegram_bridge.py`
  Expected: FAIL (Files do not exist)

- [ ] **Step 3: Perform minimal implementation / worker action**
  Write `telegram-bridge/bridge.py` with basic long-polling client and whitelist decorator:
  ```python
  import os
  from functools import wraps
  from telegram import Update
  from telegram.ext import Application, CommandHandler, MessageHandler, filters, ContextTypes
  from dotenv import load_dotenv

  load_dotenv()

  ALLOWED_IDS = [int(x.strip()) for x in os.getenv("ALLOWED_USER_IDS", "").split(",") if x.strip()]

  def restricted(func):
      @wraps(func)
      async def wrapped(update: Update, context: ContextTypes.DEFAULT_TYPE, *args, **kwargs):
          user_id = update.effective_user.id
          if user_id not in ALLOWED_IDS:
              print(f"Unauthorized access attempt from user ID: {user_id}")
              return
          return await func(update, context, *args, **kwargs)
      return wrapped

  @restricted
  async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
      await update.message.reply_text("Authorized. Telegram Bridge is active.")

  def main():
      token = os.getenv("TELEGRAM_TOKEN", "mock_token")
      app = Application.builder().token(token).build()
      app.add_handler(CommandHandler("start", start))
      # In production, we run app.run_polling(), but for tests we don't start the loop
      return app

  if __name__ == "__main__":
      main().run_polling()
  ```

  Write `tests/test_telegram_bridge.py`:
  ```python
  import unittest
  from unittest.mock import AsyncMock, MagicMock
  import sys
  import os
  sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../telegram-bridge')))
  import bridge

  class TestTelegramBridgeSecurity(unittest.IsolatedAsyncTestCase):
      async def test_restricted_decorator_allowed(self):
          bridge.ALLOWED_IDS = [12345]
          mock_update = MagicMock()
          mock_update.effective_user.id = 12345
          mock_update.message.reply_text = AsyncMock()
          
          await bridge.start(mock_update, MagicMock())
          mock_update.message.reply_text.assert_called_with("Authorized. Telegram Bridge is active.")

      async def test_restricted_decorator_denied(self):
          bridge.ALLOWED_IDS = [12345]
          mock_update = MagicMock()
          mock_update.effective_user.id = 99999
          mock_update.message.reply_text = AsyncMock()
          
          await bridge.start(mock_update, MagicMock())
          mock_update.message.reply_text.assert_not_called()

  if __name__ == "__main__":
      unittest.main()
  ```

- [ ] **Step 4: Verify state passes criteria**
  Run: `python tests/test_telegram_bridge.py`
  Expected: PASS (All tests pass)

- [ ] **Step 5: Commit/Save**
  ```bash
  git add telegram-bridge/bridge.py tests/test_telegram_bridge.py docs/aerodeck/criteria/task-2-criteria.json
  git commit -m "feat: implement security whitelist and validation tests"
  ```

---

### Task 3: Antigravity Session Management

**Targets:**
- Modify: `telegram-bridge/bridge.py`
- Modify: `tests/test_telegram_bridge.py`

- [ ] **Step 1: Write/Define success criteria**
  Create `docs/aerodeck/criteria/task-3-criteria.json` containing:
  ```json
  {
    "criteria": "Telegram commands /reset and /aerodeck invoke the respective Antigravity SDK session management functions."
  }
  ```

- [ ] **Step 2: Verify current state fails/lacks criteria**
  Run tests: `python tests/test_telegram_bridge.py`
  Expected: FAIL or no assertions for session management commands.

- [ ] **Step 3: Perform minimal implementation / worker action**
  Add mock/stub SDK interactions in `telegram-bridge/bridge.py` to map command actions:
  ```python
  # Add to bridge.py (under start function)
  class AntigravitySDK:
      def __init__(self, url):
          self.url = url

      async def reset_session(self, session_id):
          # Calls local Antigravity API to clear context
          return True

      async def send_command(self, session_id, command):
          # Calls local Antigravity API to execute text command
          return f"Executing {command}"

  sdk = AntigravitySDK(os.getenv("ANTIGRAVITY_SDK_URL", "http://localhost:8000"))

  @restricted
  async def reset_session(update: Update, context: ContextTypes.DEFAULT_TYPE):
      chat_id = update.effective_chat.id
      success = await sdk.reset_session(chat_id)
      if success:
          await update.message.reply_text("Antigravity session reset successfully.")
      else:
          await update.message.reply_text("Failed to reset session.")

  @restricted
  async def aerodeck_bootstrap(update: Update, context: ContextTypes.DEFAULT_TYPE):
      chat_id = update.effective_chat.id
      res = await sdk.send_command(chat_id, "/using-aerodeck")
      await update.message.reply_text(f"Bootstrap initialized: {res}")
  ```
  Register commands in `main()` of `bridge.py`:
  ```python
  app.add_handler(CommandHandler("reset", reset_session))
  app.add_handler(CommandHandler("aerodeck", aerodeck_bootstrap))
  ```

  Update `tests/test_telegram_bridge.py` to test `/reset` and `/aerodeck`:
  ```python
  # Add to TestTelegramBridgeSecurity:
      async def test_reset_command(self):
          bridge.ALLOWED_IDS = [12345]
          mock_update = MagicMock()
          mock_update.effective_user.id = 12345
          mock_update.effective_chat.id = 54321
          mock_update.message.reply_text = AsyncMock()
          
          await bridge.reset_session(mock_update, MagicMock())
          mock_update.message.reply_text.assert_called_with("Antigravity session reset successfully.")
  ```

- [ ] **Step 4: Verify state passes criteria**
  Run: `python tests/test_telegram_bridge.py`
  Expected: PASS

- [ ] **Step 5: Commit/Save**
  ```bash
  git add telegram-bridge/bridge.py tests/test_telegram_bridge.py docs/aerodeck/criteria/task-3-criteria.json
  git commit -m "feat: implement session management and commands"
  ```

---

### Task 4: Interactive Approvals & Tool Interception

**Targets:**
- Modify: `telegram-bridge/bridge.py`
- Modify: `tests/test_telegram_bridge.py`

- [ ] **Step 1: Write/Define success criteria**
  Create `docs/aerodeck/criteria/task-4-criteria.json` containing:
  ```json
  {
    "criteria": "Interactive callback handler processes Approve/Reject actions for proposed terminal commands."
  }
  ```

- [ ] **Step 2: Verify current state fails/lacks criteria**
  Run: `python tests/test_telegram_bridge.py`
  Expected: FAIL (No callback handlers or inline keyboards registered)

- [ ] **Step 3: Perform minimal implementation / worker action**
  Add inline keyboard markup and callback handlers to `bridge.py`:
  ```python
  from telegram import InlineKeyboardButton, InlineKeyboardMarkup
  from telegram.ext import CallbackQueryHandler

  # Map pending approvals to wait for callback actions
  pending_approvals = {}

  @restricted
  async def propose_command(chat_id, command_id, command_string, context):
      keyboard = [
          [
              InlineKeyboardButton("Approve", callback_data=f"approve_{command_id}"),
              InlineKeyboardButton("Reject", callback_data=f"reject_{command_id}")
          ]
      ]
      reply_markup = InlineKeyboardMarkup(keyboard)
      await context.bot.send_message(
          chat_id=chat_id,
          text=f"**Command Proposed for Execution:**\n`{command_string}`",
          reply_markup=reply_markup,
          parse_mode="Markdown"
      )

  async def handle_approval_callback(update: Update, context: ContextTypes.DEFAULT_TYPE):
      query = update.callback_query
      user_id = query.from_user.id
      if user_id not in ALLOWED_IDS:
          await query.answer("Unauthorized", show_alert=True)
          return
          
      await query.answer()
      data = query.data
      action, command_id = data.split("_")
      
      if action == "approve":
          await query.edit_message_text(text=f"Approved execution of command: {command_id}")
          # Notify SDK to resume with approval
      else:
          await query.edit_message_text(text=f"Rejected execution of command: {command_id}")
          # Notify SDK to cancel
  ```
  Register CallbackQueryHandler in `main()`:
  ```python
  app.add_handler(CallbackQueryHandler(handle_approval_callback))
  ```

  Add test to `tests/test_telegram_bridge.py` to verify approval callback routing.

- [ ] **Step 4: Verify state passes criteria**
  Run: `python tests/test_telegram_bridge.py`
  Expected: PASS

- [ ] **Step 5: Commit/Save**
  ```bash
  git add telegram-bridge/bridge.py tests/test_telegram_bridge.py docs/aerodeck/criteria/task-4-criteria.json
  git commit -m "feat: implement command approval inline keyboards and callbacks"
  ```

---

### Task 5: Document Delivery & Ingestion

**Targets:**
- Modify: `telegram-bridge/bridge.py`

- [ ] **Step 1: Write/Define success criteria**
  Create `docs/aerodeck/criteria/task-5-criteria.json` containing:
  ```json
  {
    "criteria": "Incoming document handler successfully saves sent files to the mock local workspace directory."
  }
  ```

- [ ] **Step 2: Verify current state fails/lacks criteria**
  Run: `python tests/test_telegram_bridge.py`
  Expected: FAIL (No document handler implemented)

- [ ] **Step 3: Perform minimal implementation / worker action**
  Add document handler to `bridge.py` to allow file uploads into workspace:
  ```python
  @restricted
  async def handle_document(update: Update, context: ContextTypes.DEFAULT_TYPE):
      doc = update.message.document
      file_id = doc.file_id
      file_name = doc.file_name
      new_file = await context.bot.get_file(file_id)
      
      # Save to active workspace directory
      workspace_path = "./telegram-workspace"
      os.makedirs(workspace_path, exist_ok=True)
      target_path = os.path.join(workspace_path, file_name)
      await new_file.download_to_drive(custom_path=target_path)
      
      await update.message.reply_text(f"Received and saved file: `{file_name}` to workspace.")
  ```
  Register MessageHandler for files in `main()`:
  ```python
  app.add_handler(MessageHandler(filters.Document.ALL, handle_document))
  ```

  Update tests to mock bot file download and verify file exists in `./telegram-workspace`.

- [ ] **Step 4: Verify state passes criteria**
  Run: `python tests/test_telegram_bridge.py`
  Expected: PASS

- [ ] **Step 5: Commit/Save**
  ```bash
  git add telegram-bridge/bridge.py tests/test_telegram_bridge.py docs/aerodeck/criteria/task-5-criteria.json
  git commit -m "feat: implement document ingestion to local workspace"
  ```

---

### Task 6: Workspace Cleaner & Cleanup

**Targets:**
- Create: `telegram-bridge/run.sh`
- Modify: `telegram-bridge/docs/setup.md`

- [ ] **Step 1: Write/Define success criteria**
  Create `docs/aerodeck/criteria/task-6-criteria.json` containing:
  ```json
  {
    "criteria": "run.sh starts the bridge and setup.md outlines exact steps to initialize, configure, and launch the bot."
  }
  ```

- [ ] **Step 2: Verify current state fails/lacks criteria**
  Expected: FAIL (run.sh does not exist, setup.md is incomplete)

- [ ] **Step 3: Perform minimal implementation / worker action**
  Create `telegram-bridge/run.sh`:
  ```bash
  #!/bin/bash
  # Start the telegram bridge daemon
  python telegram-bridge/bridge.py
  ```
  Make it executable.
  Append run command instructions to `telegram-bridge/docs/setup.md`.

- [ ] **Step 4: Verify state passes criteria**
  Expected: PASS (Scripts run correctly, documentation is complete)

- [ ] **Step 5: Commit/Save**
  ```bash
  git add telegram-bridge/run.sh telegram-bridge/docs/setup.md docs/aerodeck/criteria/task-6-criteria.json
  git commit -m "feat: complete deployment scripts and documentation"
  ```
