# Setup Telegram Bridge
1. Navigate to the `telegram-bridge` directory:
   ```bash
   cd telegram-bridge
   ```
2. Install dependencies inside this directory:
   ```bash
   pip install -r requirements.txt
   ```
3. Copy `.env.example` to `.env` inside this directory and fill in the bot token and allowed user IDs:
   ```bash
   cp .env.example .env
   ```

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
