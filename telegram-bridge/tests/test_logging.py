import logging
import os
import pytest
from unittest.mock import patch
from bridge import setup_logging

def test_setup_logging_configures_handlers_and_level():
    # Setup test environment
    os.environ["TELEGRAM_BRIDGE_LOG_LEVEL"] = "DEBUG"
    
    # We want to check the root logger
    root_logger = logging.getLogger()
    
    # Clear existing handlers
    root_logger.handlers.clear()
    
    # Call the function
    setup_logging()
    
    # Assert level is DEBUG
    assert root_logger.level == logging.DEBUG
    
    # Assert handlers exist (one FileHandler, one StreamHandler)
    handlers = root_logger.handlers
    assert len(handlers) == 2
    
    file_handlers = [h for h in handlers if type(h) == logging.FileHandler]
    stream_handlers = [h for h in handlers if type(h) == logging.StreamHandler]
    
    assert len(file_handlers) == 1
    assert len(stream_handlers) == 1
    
    # Assert file handler writes to telegram-bridge.log
    assert "telegram-bridge.log" in file_handlers[0].baseFilename
