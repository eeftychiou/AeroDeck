import logging
import pytest
from unittest.mock import patch, MagicMock, AsyncMock
from bridge import parse_allowed_ids, restricted, propose_command, handle_document

@pytest.fixture
def caplog_setup(caplog):
    caplog.set_level(logging.DEBUG)
    return caplog

def test_parse_allowed_ids_telemetry(caplog_setup):
    with patch("os.getenv", return_value="123,456"):
        parse_allowed_ids()
    assert "Parsed 2 allowed user IDs" in caplog_setup.text

@pytest.mark.asyncio
async def test_restricted_telemetry(caplog_setup):
    # Mocking the update and context
    update_mock = MagicMock()
    update_mock.effective_user.id = 123
    context_mock = MagicMock()
    
    async def dummy_handler(update, context):
        return True
        
    decorated = restricted(dummy_handler)
    
    # We must mock ALLOWED_IDS to allow 123 for the handler to proceed
    with patch("bridge.ALLOWED_IDS", [123]):
        await decorated(update_mock, context_mock)
    
    assert "Access granted to user ID: 123" in caplog_setup.text

@pytest.mark.asyncio
async def test_propose_command_telemetry(caplog_setup):
    context_mock = MagicMock()
    context_mock.bot.send_message = AsyncMock()
    
    await propose_command(123, "cmd_1", "/echo hello", context_mock)
    
    assert "Proposing command 'cmd_1' with payload length: 11" in caplog_setup.text

@pytest.mark.asyncio
async def test_handle_document_telemetry(caplog_setup):
    update_mock = MagicMock()
    update_mock.effective_user.id = 123
    update_mock.message.reply_text = AsyncMock()
    doc_mock = MagicMock()
    doc_mock.file_name = "test.txt"
    doc_mock.file_size = 1024
    doc_mock.mime_type = "text/plain"
    update_mock.message.document = doc_mock
    
    context_mock = MagicMock()
    mock_file = MagicMock()
    mock_file.download_to_drive = AsyncMock()
    context_mock.bot.get_file = AsyncMock(return_value=mock_file)
    
    with patch("bridge.ALLOWED_IDS", [123]):
        await handle_document(update_mock, context_mock)
    
    assert "Intercepted document 'test.txt' (size: 1024 bytes, mime: text/plain)" in caplog_setup.text
