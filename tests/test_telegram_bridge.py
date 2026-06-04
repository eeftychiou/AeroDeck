import unittest
from unittest.mock import AsyncMock, MagicMock
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../telegram-bridge')))
import bridge

class TestTelegramBridgeSecurity(unittest.IsolatedAsyncioTestCase):
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
