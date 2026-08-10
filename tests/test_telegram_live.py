import os
import unittest

class TestTelegramBridgeLive(unittest.TestCase):
    def test_live_credentials_presence(self):
        token = os.environ.get("TELEGRAM_BOT_TOKEN")
        if not token:
            self.skipTest("TELEGRAM_BOT_TOKEN not provided in environment")
        self.assertIsNotNone(token)

if __name__ == '__main__':
    unittest.main()
