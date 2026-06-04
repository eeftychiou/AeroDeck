"""
Telegram bridge to forward and handle Telegram messages.
"""

import logging
import os
from functools import wraps
from typing import Any, Callable, Coroutine
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import Application, CommandHandler, ContextTypes, CallbackQueryHandler, MessageHandler, filters
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


class AntigravitySDK:
    """Stub for the local Antigravity Core SDK client."""

    def __init__(self, url: str) -> None:
        """Initialize the SDK client.

        Args:
            url (str): The URL of the Antigravity Core SDK.
        """
        self.url = url

    async def reset_session(self, session_id: int) -> bool:
        """Reset/clear context for a specific Antigravity session.

        Args:
            session_id (int): The session ID to reset.

        Returns:
            bool: True if the reset was successful, False otherwise.
        """
        # Stub implementation
        logger.info("Antigravity SDK: Reset session %s", session_id)
        return True

    async def send_command(self, session_id: int, command: str) -> str:
        """Send a text command directly to the active Antigravity session.

        Args:
            session_id (int): The session ID.
            command (str): The command to send.

        Returns:
            str: The execution result of the command.
        """
        # Stub implementation
        logger.info("Antigravity SDK: Sending command '%s' to session %s", command, session_id)
        return f"Executing {command}"


sdk = AntigravitySDK(os.getenv("ANTIGRAVITY_SDK_URL", "http://localhost:8000"))


@restricted
async def reset_session(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle the /reset command to reset the active Antigravity session.

    Args:
        update (Update): The Telegram Update object.
        context (ContextTypes.DEFAULT_TYPE): The handler context.
    """
    if not update.effective_chat or not update.message:
        return
    chat_id = update.effective_chat.id
    success = await sdk.reset_session(chat_id)
    if success:
        await update.message.reply_text("Antigravity session reset successfully.")
    else:
        await update.message.reply_text("Failed to reset session.")


@restricted
async def aerodeck_bootstrap(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle the /aerodeck command to bootstrap AeroDeck skills.

    Args:
        update (Update): The Telegram Update object.
        context (ContextTypes.DEFAULT_TYPE): The handler context.
    """
    if not update.effective_chat or not update.message:
        return
    chat_id = update.effective_chat.id
    res = await sdk.send_command(chat_id, "/using-aerodeck")
    await update.message.reply_text(f"Bootstrap initialized: {res}")


# Global/Module level tracker for pending approvals
pending_approvals: dict[str, str] = {}


async def propose_command(chat_id: int, command_id: str, command_string: str, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Send a message proposing a command for execution with inline keyboard options.

    Args:
        chat_id: Telegram Chat ID.
        command_id: Unique identifier for the command.
        command_string: The command string proposed for execution.
        context: The context for the handler/request.
    """
    keyboard = [
        [
            InlineKeyboardButton("Approve", callback_data=f"approve_{command_id}"),
            InlineKeyboardButton("Reject", callback_data=f"reject_{command_id}")
        ]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    pending_approvals[command_id] = command_string
    await context.bot.send_message(
        chat_id=chat_id,
        text=f"**Command Proposed for Execution:**\n`{command_string}`",
        reply_markup=reply_markup,
        parse_mode="Markdown"
    )


async def handle_approval_callback(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Process inline keyboard button clicks for command approval.

    Args:
        update: The Telegram Update.
        context: The handler context.
    """
    query = update.callback_query
    if not query or not query.message:
        return
    
    user_id = query.from_user.id
    if user_id not in ALLOWED_IDS:
        await query.answer("Unauthorized", show_alert=True)
        logger.warning("Unauthorized callback attempt from user ID: %s", user_id)
        return
        
    await query.answer()
    data = query.data
    if not data:
        return
        
    action, command_id = data.split("_", 1)
    
    if action == "approve":
        await query.edit_message_text(text=f"Approved execution of command: {command_id}")
    else:
        await query.edit_message_text(text=f"Rejected execution of command: {command_id}")


@restricted
async def handle_document(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Receive a document from the user and save it to the local workspace.

    Args:
        update: The Telegram Update object.
        context: The handler context.
    """
    if not update.message or not update.message.document:
        return
        
    doc = update.message.document
    file_id = doc.file_id
    raw_file_name = doc.file_name or "received_document"
    file_name = os.path.basename(raw_file_name)
    
    try:
        new_file = await context.bot.get_file(file_id)
        workspace_path = "./telegram-workspace"
        os.makedirs(workspace_path, exist_ok=True)
        target_path = os.path.join(workspace_path, file_name)
        await new_file.download_to_drive(custom_path=target_path)
        await update.message.reply_text(f"Received and saved file: `{file_name}` to workspace.")
    except Exception as e:
        logger.error("Failed to download document %s: %s", file_name, e)
        await update.message.reply_text(f"Failed to download and save file: `{file_name}`.")


def main() -> Application:
    """Initialize and build the Telegram Application.

    Returns:
        Application: The configured Telegram Application object.
    """
    token = os.getenv("TELEGRAM_TOKEN", "mock_token")
    app = Application.builder().token(token).build()
    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("reset", reset_session))
    app.add_handler(CommandHandler("aerodeck", aerodeck_bootstrap))
    app.add_handler(CallbackQueryHandler(handle_approval_callback))
    app.add_handler(MessageHandler(filters.Document.ALL, handle_document))
    return app


if __name__ == "__main__":
    main().run_polling()


