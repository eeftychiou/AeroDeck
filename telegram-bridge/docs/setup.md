# Setup Telegram Bridge

1. Navigate to the `telegram-bridge` directory:
   ```bash
   cd telegram-bridge
   ```
2. Install dependencies inside this directory:
   ```bash
   pip install -r requirements.txt
   ```
3. Copy `.env.example` to `.env` inside this directory and configure your environment variables:
   ```bash
   cp .env.example .env
   ```

## Environment Variables & Whitelist Security

Configure the following environment variables in `.env`:
* `TELEGRAM_BOT_TOKEN`: The API authentication token provided by BotFather for your Telegram bot instance.
* `ALLOWED_USER_IDS`: A comma-separated list of numeric Telegram User IDs authorized to interact with the bot (whitelist security). Requests from unlisted User IDs are automatically rejected for security.

## Remote Bot Management Commands

The Telegram bridge supports remote management through the following bot commands:
* `/start`: Initializes the bot session and verifies user authorization against `ALLOWED_USER_IDS`.
* `/reset`: Resets active session state and clears conversation history context.
* `/aerodeck`: Interacts with and manages AeroDeck workflows remotely.

## Interactive Command Execution Approval

When terminal commands are generated or proposed during execution:
* The bot sends an interactive message containing standard `InlineKeyboardButton` controls (`Approve` / `Reject`).
* Authorized users can click the inline buttons in Telegram to permit or deny immediate execution of proposed terminal actions.

## File Ingestion & Workspace Upload Rules

* Files, documents, code snippets, or archives sent to the Telegram bot are ingested automatically.
* All incoming user-uploaded files and artifacts are written into the dedicated workspace upload directory path: `./telegram-workspace/`.

## Running the Bot

All run commands should be executed from within the `telegram-bridge` directory:
* On Unix/macOS:
  ```bash
  ./run.sh
  ```
* On Windows:
  ```powershell
  python bridge.py
  ```
