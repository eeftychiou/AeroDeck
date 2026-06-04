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
    return app

if __name__ == "__main__":
    main().run_polling()
