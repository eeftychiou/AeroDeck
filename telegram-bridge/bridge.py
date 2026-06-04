"""
Telegram bridge to forward and handle Telegram messages.
"""

import logging
import os
from functools import wraps
from typing import Any, Callable, Coroutine
from telegram import Update
from telegram.ext import Application, CommandHandler, ContextTypes
from dotenv import load_dotenv

# Configure basic logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

load_dotenv()


def parse_allowed_ids() -> list[int]:
    """Parse the ALLOWED_USER_IDS environment variable into a list of integers.

    Returns:
        list[int]: A list of allowed user IDs.
    """
    allowed_ids_str = os.getenv("ALLOWED_USER_IDS", "")
    allowed_ids: list[int] = []
    if not allowed_ids_str:
        return allowed_ids

    for x in allowed_ids_str.split(","):
        stripped = x.strip()
        if not stripped:
            continue
        try:
            allowed_ids.append(int(stripped))
        except ValueError as e:
            logger.error("Failed to parse user ID '%s' from ALLOWED_USER_IDS: %s", stripped, e)
    return allowed_ids


ALLOWED_IDS = parse_allowed_ids()


def restricted(
    func: Callable[[Update, ContextTypes.DEFAULT_TYPE], Coroutine[Any, Any, Any]]
) -> Callable[[Update, ContextTypes.DEFAULT_TYPE], Coroutine[Any, Any, Any]]:
    """Restrict access to a handler to user IDs listed in ALLOWED_IDS.

    Args:
        func: The handler function to decorate.

    Returns:
        The wrapped function that verifies user access before execution.
    """
    @wraps(func)
    async def wrapped(
        update: Update,
        context: ContextTypes.DEFAULT_TYPE,
        *args: Any,
        **kwargs: Any
    ) -> Any:
        user = update.effective_user
        if not user:
            logger.warning("Unauthorized access attempt: effective_user is None")
            return None
        user_id = user.id
        if user_id not in ALLOWED_IDS:
            logger.warning("Unauthorized access attempt from user ID: %s", user_id)
            return None
        return await func(update, context, *args, **kwargs)
    return wrapped


@restricted
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Respond to the /start command if the user is authorized.

    Args:
        update: The Telegram Update object.
        context: The handler context.
    """
    if update.message:
        await update.message.reply_text("Authorized. Telegram Bridge is active.")


def main() -> Application:
    """Initialize and build the Telegram Application.

    Returns:
        Application: The configured Telegram Application object.
    """
    token = os.getenv("TELEGRAM_TOKEN", "mock_token")
    app = Application.builder().token(token).build()
    app.add_handler(CommandHandler("start", start))
    return app


if __name__ == "__main__":
    main().run_polling()

