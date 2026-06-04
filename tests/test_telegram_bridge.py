"""
Unit tests for the Telegram Bridge security features and handlers.
"""

import os
import sys
import unittest
from unittest.mock import AsyncMock, MagicMock

# Ensure the telegram-bridge directory is in the path for importing
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../telegram-bridge')))
import bridge  # pylint: disable=import-error


class TestTelegramBridgeSecurity(unittest.IsolatedAsyncioTestCase):
    """Test suite for the restricted access decorator and security logic."""

    def setUp(self) -> None:
        """Set up test environment."""
        super().setUp()
        self.original_allowed_ids = list(bridge.ALLOWED_IDS)
        self.original_pending_approvals = dict(bridge.pending_approvals)

    def tearDown(self) -> None:
        """Tear down test environment."""
        bridge.ALLOWED_IDS = list(self.original_allowed_ids)
        bridge.pending_approvals = dict(self.original_pending_approvals)
        super().tearDown()

    async def test_restricted_decorator_allowed(self) -> None:
        """Verify that an authorized user ID is allowed access."""
        bridge.ALLOWED_IDS = [12345]
        mock_update: MagicMock = MagicMock()
        mock_update.effective_user.id = 12345
        mock_update.message.reply_text = AsyncMock()

        await bridge.start(mock_update, MagicMock())
        mock_update.message.reply_text.assert_called_with("Authorized. Telegram Bridge is active.")

    async def test_restricted_decorator_denied(self) -> None:
        """Verify that an unauthorized user ID is denied access."""
        bridge.ALLOWED_IDS = [12345]
        mock_update: MagicMock = MagicMock()
        mock_update.effective_user.id = 99999
        mock_update.message.reply_text = AsyncMock()

        await bridge.start(mock_update, MagicMock())
        mock_update.message.reply_text.assert_not_called()

    async def test_restricted_decorator_no_user(self) -> None:
        """Verify that an update with no effective user is denied access."""
        bridge.ALLOWED_IDS = [12345]
        mock_update: MagicMock = MagicMock()
        mock_update.effective_user = None
        mock_update.message.reply_text = AsyncMock()

        await bridge.start(mock_update, MagicMock())
        mock_update.message.reply_text.assert_not_called()

    def test_parse_allowed_ids_valid(self) -> None:
        """Verify parsing of valid integer ALLOWED_USER_IDS."""
        old_val = os.environ.get("ALLOWED_USER_IDS")
        try:
            os.environ["ALLOWED_USER_IDS"] = "123, 456, 789"
            parsed = bridge.parse_allowed_ids()
            self.assertEqual(parsed, [123, 456, 789])
        finally:
            if old_val is not None:
                os.environ["ALLOWED_USER_IDS"] = old_val
            else:
                os.environ.pop("ALLOWED_USER_IDS", None)

    def test_parse_allowed_ids_invalid(self) -> None:
        """Verify that invalid IDs are skipped during parsing."""
        old_val = os.environ.get("ALLOWED_USER_IDS")
        try:
            os.environ["ALLOWED_USER_IDS"] = "123, invalid, 789"
            parsed = bridge.parse_allowed_ids()
            self.assertEqual(parsed, [123, 789])
        finally:
            if old_val is not None:
                os.environ["ALLOWED_USER_IDS"] = old_val
            else:
                os.environ.pop("ALLOWED_USER_IDS", None)

    async def test_reset_session_handler_success(self) -> None:
        """Verify that /reset command works successfully for an authorized user."""
        bridge.ALLOWED_IDS = [12345]
        mock_update = MagicMock()
        mock_update.effective_user.id = 12345
        mock_update.effective_chat.id = 67890
        mock_update.message.reply_text = AsyncMock()

        original_sdk = bridge.sdk
        mock_sdk = AsyncMock()
        mock_sdk.reset_session.return_value = True
        bridge.sdk = mock_sdk

        try:
            await bridge.reset_session(mock_update, MagicMock())
            mock_sdk.reset_session.assert_called_once_with(67890)
            mock_update.message.reply_text.assert_called_with("Antigravity session reset successfully.")
        finally:
            bridge.sdk = original_sdk

    async def test_reset_session_handler_failure(self) -> None:
        """Verify that /reset handler handles SDK failure appropriately."""
        bridge.ALLOWED_IDS = [12345]
        mock_update = MagicMock()
        mock_update.effective_user.id = 12345
        mock_update.effective_chat.id = 67890
        mock_update.message.reply_text = AsyncMock()

        original_sdk = bridge.sdk
        mock_sdk = AsyncMock()
        mock_sdk.reset_session.return_value = False
        bridge.sdk = mock_sdk

        try:
            await bridge.reset_session(mock_update, MagicMock())
            mock_sdk.reset_session.assert_called_once_with(67890)
            mock_update.message.reply_text.assert_called_with("Failed to reset session.")
        finally:
            bridge.sdk = original_sdk

    async def test_reset_session_handler_denied(self) -> None:
        """Verify that an unauthorized user cannot invoke the /reset command."""
        bridge.ALLOWED_IDS = [12345]
        mock_update = MagicMock()
        mock_update.effective_user.id = 99999
        mock_update.effective_chat.id = 67890
        mock_update.message.reply_text = AsyncMock()

        original_sdk = bridge.sdk
        mock_sdk = AsyncMock()
        bridge.sdk = mock_sdk

        try:
            await bridge.reset_session(mock_update, MagicMock())
            mock_sdk.reset_session.assert_not_called()
            mock_update.message.reply_text.assert_not_called()
        finally:
            bridge.sdk = original_sdk

    async def test_aerodeck_bootstrap_handler_success(self) -> None:
        """Verify that /aerodeck command bootstraps AeroDeck skills for an authorized user."""
        bridge.ALLOWED_IDS = [12345]
        mock_update = MagicMock()
        mock_update.effective_user.id = 12345
        mock_update.effective_chat.id = 67890
        mock_update.message.reply_text = AsyncMock()

        original_sdk = bridge.sdk
        mock_sdk = AsyncMock()
        mock_sdk.send_command.return_value = "Executing /using-aerodeck"
        bridge.sdk = mock_sdk

        try:
            await bridge.aerodeck_bootstrap(mock_update, MagicMock())
            mock_sdk.send_command.assert_called_once_with(67890, "/using-aerodeck")
            mock_update.message.reply_text.assert_called_with("Bootstrap initialized: Executing /using-aerodeck")
        finally:
            bridge.sdk = original_sdk

    async def test_aerodeck_bootstrap_handler_denied(self) -> None:
        """Verify that an unauthorized user cannot invoke the /aerodeck command."""
        bridge.ALLOWED_IDS = [12345]
        mock_update = MagicMock()
        mock_update.effective_user.id = 99999
        mock_update.effective_chat.id = 67890
        mock_update.message.reply_text = AsyncMock()

        original_sdk = bridge.sdk
        mock_sdk = AsyncMock()
        bridge.sdk = mock_sdk

        try:
            await bridge.aerodeck_bootstrap(mock_update, MagicMock())
            mock_sdk.send_command.assert_not_called()
            mock_update.message.reply_text.assert_not_called()
        finally:
            bridge.sdk = original_sdk

    def test_main_registers_handlers(self) -> None:
        """Verify that main() registers start, reset, aerodeck, and callback query handlers."""
        from unittest.mock import patch
        with patch("telegram.ext.Application.builder") as mock_builder:
            mock_app = MagicMock()
            mock_builder.return_value.token.return_value.build.return_value = mock_app

            app = bridge.main()

            self.assertEqual(app, mock_app)
            calls = mock_app.add_handler.call_args_list
            registered_commands = []
            registered_handlers = []
            for call in calls:
                handler = call[0][0]
                registered_handlers.append(handler)
                if isinstance(handler, bridge.CommandHandler):
                    registered_commands.extend(handler.commands)

            self.assertIn("start", registered_commands)
            self.assertIn("reset", registered_commands)
            self.assertIn("aerodeck", registered_commands)
            
            # Verify CallbackQueryHandler is registered
            self.assertTrue(any(isinstance(h, bridge.CallbackQueryHandler) for h in registered_handlers))

    async def test_propose_command(self) -> None:
        """Verify propose_command registers the command and sends keyboard markup."""
        mock_context = MagicMock()
        mock_context.bot.send_message = AsyncMock()
        chat_id = 67890
        command_id = "cmd_123"
        command_string = "ls -la"

        await bridge.propose_command(chat_id, command_id, command_string, mock_context)

        # Check register command in pending_approvals
        self.assertIn(command_id, bridge.pending_approvals)
        self.assertEqual(bridge.pending_approvals[command_id], command_string)

        # Check message sent with reply_markup
        mock_context.bot.send_message.assert_called_once()
        kwargs = mock_context.bot.send_message.call_args[1]
        self.assertEqual(kwargs["chat_id"], chat_id)
        self.assertIn(command_string, kwargs["text"])
        self.assertIn("Markdown", kwargs["parse_mode"])
        
        # Verify reply markup
        reply_markup = kwargs["reply_markup"]
        self.assertIsNotNone(reply_markup)
        
        # Keyboard has Approve and Reject
        keyboard = reply_markup.inline_keyboard
        self.assertEqual(len(keyboard), 1)
        self.assertEqual(len(keyboard[0]), 2)
        self.assertEqual(keyboard[0][0].text, "Approve")
        self.assertEqual(keyboard[0][0].callback_data, f"approve_{command_id}")
        self.assertEqual(keyboard[0][1].text, "Reject")
        self.assertEqual(keyboard[0][1].callback_data, f"reject_{command_id}")

    async def test_handle_approval_callback_authorized(self) -> None:
        """Verify whitelisted user callback edits message appropriately."""
        bridge.ALLOWED_IDS = [12345]
        
        # Test Approve action
        mock_update = MagicMock()
        mock_query = AsyncMock()
        mock_query.from_user.id = 12345
        mock_query.data = "approve_cmd_123"
        mock_query.message = MagicMock()
        mock_update.callback_query = mock_query

        await bridge.handle_approval_callback(mock_update, MagicMock())

        mock_query.answer.assert_called_once()
        mock_query.edit_message_text.assert_called_once_with(text="Approved execution of command: cmd_123")

        # Test Reject action
        mock_update = MagicMock()
        mock_query = AsyncMock()
        mock_query.from_user.id = 12345
        mock_query.data = "reject_cmd_456"
        mock_query.message = MagicMock()
        mock_update.callback_query = mock_query

        await bridge.handle_approval_callback(mock_update, MagicMock())

        mock_query.answer.assert_called_once()
        mock_query.edit_message_text.assert_called_once_with(text="Rejected execution of command: cmd_456")

    async def test_handle_approval_callback_unauthorized(self) -> None:
        """Verify non-whitelisted user gets unauthorized alert and message is not edited."""
        bridge.ALLOWED_IDS = [12345]
        mock_update = MagicMock()
        mock_query = AsyncMock()
        mock_query.from_user.id = 99999
        mock_query.data = "approve_cmd_123"
        mock_query.message = MagicMock()
        mock_update.callback_query = mock_query

        await bridge.handle_approval_callback(mock_update, MagicMock())

        mock_query.answer.assert_called_once_with("Unauthorized", show_alert=True)
        mock_query.edit_message_text.assert_not_called()


if __name__ == "__main__":
    unittest.main()


