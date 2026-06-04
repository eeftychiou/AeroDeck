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


if __name__ == "__main__":
    unittest.main()

